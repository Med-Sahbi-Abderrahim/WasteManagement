package com.urbanwaste.util;

import com.urbanwaste.model.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.xml.sax.SAXException;

// --- JAXB IS JAKARTA ---
import jakarta.xml.bind.*;

// --- CORE XML IS JAVAX (Standard Java) ---
import javax.xml.XMLConstants;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.transform.stream.StreamSource;

import java.io.*;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class XMLHandler {
    
    private final ResourceLoader resourceLoader;
    private static final String STORAGE_DIR = "src/main/resources/data"; 
    private static final String CLASSPATH_DIR = "data/"; 

    private final ConcurrentHashMap<Class<?>, JAXBContext> contextCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Schema> schemaCache = new ConcurrentHashMap<>();
    
    public XMLHandler(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }
    
    /**
     * Save object to XML
     */
    public <T> void saveToXML(T object, String fileName, String xsdFileName) throws JAXBException, SAXException, IOException {
        JAXBContext context = getOrCreateContext(object.getClass());
        Marshaller marshaller = context.createMarshaller();
        
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
        
        if (xsdFileName != null && !xsdFileName.isEmpty()) {
            Schema schema = getOrLoadSchema(xsdFileName);
            marshaller.setSchema(schema);
        }
        
        File storageDir = new File(STORAGE_DIR);
        if (!storageDir.exists()) {
            storageDir.mkdirs();
        }

        File file = new File(storageDir, fileName);
        System.out.println("Saving XML to: " + file.getAbsolutePath());
        
        try (FileOutputStream fos = new FileOutputStream(file)) {
            marshaller.marshal(object, fos);
        }
    }
    
    public <T> void saveToXML(T object, String fileName) throws JAXBException {
        try {
            saveToXML(object, fileName, null);
        } catch (SAXException | IOException e) {
            throw new JAXBException("Failed to save XML: " + e.getMessage(), e);
        }
    }
    
    /**
     * Load object from XML 
     */
    @SuppressWarnings("unchecked")
    public <T> T loadFromXML(String fileName, Class<T> clazz, String xsdFileName) throws JAXBException, SAXException {
        File externalFile = new File(STORAGE_DIR, fileName);
        InputStream inputStream = null;

        // 1. Try 'data' folder
        if (externalFile.exists()) {
            try {
                inputStream = new FileInputStream(externalFile);
            } catch (FileNotFoundException e) { }
        }

        // 2. Try classpath
        if (inputStream == null) {
            try {
                Resource resource = resourceLoader.getResource("classpath:" + CLASSPATH_DIR + fileName);
                if (resource.exists()) {
                    inputStream = resource.getInputStream();
                }
            } catch (IOException e) { }
        }

        // 3. Create New
        if (inputStream == null) {
            try {
                return clazz.getDeclaredConstructor().newInstance();
            } catch (Exception e) {
                throw new JAXBException("Failed to create new instance of " + clazz.getName(), e);
            }
        }
        
        // 4. Unmarshal
        try (InputStream is = inputStream) {
            JAXBContext context = getOrCreateContext(clazz);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            
            if (xsdFileName != null && !xsdFileName.isEmpty()) {
                Schema schema = getOrLoadSchema(xsdFileName);
                unmarshaller.setSchema(schema);
            }
            
            return (T) unmarshaller.unmarshal(is);
        } catch (IOException e) {
            throw new JAXBException("Error reading input stream", e);
        }
    }
    
    public <T> T loadFromXML(String fileName, Class<T> clazz) throws JAXBException {
        try {
            return loadFromXML(fileName, clazz, null);
        } catch (SAXException e) {
            throw new JAXBException("Failed to load XML", e);
        }
    }
    
    public boolean fileExists(String fileName) {
        File file = new File(STORAGE_DIR, fileName);
        if (file.exists()) return true;

        Resource resource = resourceLoader.getResource("classpath:" + CLASSPATH_DIR + fileName);
        return resource.exists();
    }
    
    public boolean deleteFile(String fileName) {
        File file = new File(STORAGE_DIR, fileName);
        return file.exists() && file.delete();
    }
    
    private JAXBContext getOrCreateContext(Class<?> clazz) throws JAXBException {
        return contextCache.computeIfAbsent(clazz, k -> {
            try {
                Class<?>[] classesToBind = getClassesForContext(clazz);
                return JAXBContext.newInstance(classesToBind);
            } catch (JAXBException e) {
                throw new RuntimeException("Failed to create JAXB context for " + clazz.getName(), e);
            }
        });
    }
    
    private Class<?>[] getClassesForContext(Class<?> clazz) {
        Set<Class<?>> classes = new HashSet<>();
        classes.add(clazz);
        
        // Add all your wrapper/model classes here
        classes.add(PointCollecte.class);
        classes.add(TypeDechet.class);
        classes.add(Vehicule.class);
        classes.add(Employee.class);
        classes.add(Utilisateur.class);
        classes.add(Admin.class);
        classes.add(Technicien.class);
        classes.add(SuperviseurZone.class);
        classes.add(Tournee.class);
        
        return classes.toArray(new Class<?>[0]);
    }
    
    private Schema getOrLoadSchema(String xsdFileName) throws SAXException {
        return schemaCache.computeIfAbsent(xsdFileName, k -> {
            try {
                // Use javax.xml.validation.SchemaFactory (Standard Java)
                SchemaFactory factory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
                
                File file = new File(STORAGE_DIR, xsdFileName);
                if (file.exists()) {
                    return factory.newSchema(file);
                }
                
                Resource resource = resourceLoader.getResource("classpath:" + CLASSPATH_DIR + xsdFileName);
                if (resource.exists()) {
                    try (InputStream is = resource.getInputStream()) {
                        return factory.newSchema(new StreamSource(is));
                    }
                }
                throw new SAXException("XSD schema not found: " + xsdFileName);
            } catch (Exception e) {
                throw new RuntimeException("Failed to load schema: " + xsdFileName, e);
            }
        });
        
    }
}