package com.urbanwaste.util;

import com.urbanwaste.model.*;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

// --- JAXB IS JAKARTA ---
import jakarta.xml.bind.*;

// --- CORE XML IS JAVAX (Standard Java) ---
import javax.xml.XMLConstants;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import javax.xml.transform.stream.StreamSource;
import java.io.ByteArrayInputStream;
import java.io.IOException;

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
    
    /**
     * Clear schema cache to force reload (useful when XSD files are updated)
     */
    public void clearSchemaCache() {
        schemaCache.clear();
    }
    
    /**
     * Clear schema cache for a specific XSD file
     */
    public void clearSchemaCache(String xsdFileName) {
        schemaCache.remove(xsdFileName);
    }
    
    public XMLHandler(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }
    
    /**
     * Determine XSD file name based on entity type and XML file name
     */
    private String determineXsdFileName(String fileName, Class<?> entityClass) {
        // Map XML files to their corresponding XSD files
        if (fileName.contains("employees") || fileName.contains("employes")) {
            return "employees.xsd";
        } else if (fileName.contains("vehicules") || fileName.contains("vehicles")) {
            return "vehicules.xsd";
        } else if (fileName.contains("tournees") || fileName.contains("routes")) {
            return "tournees.xsd";
        } else if (fileName.contains("signalements")) {
            return "signalements.xsd";
        } else if (fileName.contains("notifications")) {
            return "notifications.xsd";
        } else if (fileName.contains("points") || fileName.contains("collection")) {
            return "pointsCollecte.xsd";
        }
        
        // Fallback: try to infer from class name
        String className = entityClass.getSimpleName().toLowerCase();
        if (className.contains("employee") || className.contains("employe")) {
            return "employees.xsd";
        } else if (className.contains("vehicule") || className.contains("vehicle")) {
            return "vehicules.xsd";
        } else if (className.contains("tournee") || className.contains("route")) {
            return "tournees.xsd";
        } else if (className.contains("point") || className.contains("collecte")) {
            return "pointsCollecte.xsd";
        }
        
        return null;
    }
    
    /**
     * Validate XML against XSD schema
     */
    private void validateXML(Object object, String xsdFileName) throws XMLValidationException, JAXBException, SAXException, IOException {
        if (xsdFileName == null || xsdFileName.isEmpty()) {
            return; // No validation if no XSD specified
        }
        
        Schema schema = getOrLoadSchema(xsdFileName);
        Validator validator = schema.newValidator();
        
        // Marshal to temporary stream for validation
        JAXBContext context = getOrCreateContext(object.getClass());
        Marshaller marshaller = context.createMarshaller();
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            marshaller.marshal(object, baos);
            
            // Validate the XML
            try (ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray())) {
                validator.validate(new StreamSource(bais));
            } catch (SAXParseException e) {
                throw new XMLValidationException(
                    String.format("XML validation failed at line %d, column %d: %s", 
                        e.getLineNumber(), e.getColumnNumber(), e.getMessage()), e);
            } catch (SAXException e) {
                throw new XMLValidationException("XML validation failed: " + e.getMessage(), e);
            }
        }
    }
    
    /**
     * Save object to XML with automatic XSD validation
     */
    public <T> void saveToXML(T object, String fileName, String xsdFileName) throws JAXBException, SAXException, IOException, XMLValidationException {
        // Auto-determine XSD if not provided
        if (xsdFileName == null || xsdFileName.isEmpty()) {
            xsdFileName = determineXsdFileName(fileName, object.getClass());
        }
        
        // Validate before saving
        if (xsdFileName != null && !xsdFileName.isEmpty()) {
            validateXML(object, xsdFileName);
        }
        
        JAXBContext context = getOrCreateContext(object.getClass());
        Marshaller marshaller = context.createMarshaller();
        
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
        
        // Set schema for marshalling (will also validate during marshalling)
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
        } catch (MarshalException e) {
            if (e.getLinkedException() instanceof SAXParseException) {
                SAXParseException saxEx = (SAXParseException) e.getLinkedException();
                throw new XMLValidationException(
                    String.format("XML validation failed during marshalling at line %d, column %d: %s", 
                        saxEx.getLineNumber(), saxEx.getColumnNumber(), saxEx.getMessage()), saxEx);
            }
            throw e;
        }
    }
    
    /**
     * Save object to XML with automatic XSD validation (convenience method)
     */
    public <T> void saveToXML(T object, String fileName) throws JAXBException, XMLValidationException {
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
        } catch (org.xml.sax.SAXParseException e) {
            // Wrap SAXParseException with more details
            throw new SAXException(
                String.format("XML validation failed at line %d, column %d: %s", 
                    e.getLineNumber(), e.getColumnNumber(), 
                    e.getMessage() != null ? e.getMessage() : e.getLocalizedMessage()), e);
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
        classes.add(Signalement.class);
        classes.add(SignalementsWrapper.class);
        classes.add(AdminsWrapper.class);
        classes.add(SuperviseursWrapper.class);
        classes.add(TechniciensWrapper.class);
        classes.add(EmployeesWrapper.class);
        classes.add(Notification.class);
        classes.add(NotificationsWrapper.class);
        classes.add(TourneesWrapper.class);
        classes.add(PointsCollecteWrapper.class);
        classes.add(VehiculesWrapper.class);
        
        return classes.toArray(new Class<?>[0]);
    }
    
    private Schema getOrLoadSchema(String xsdFileName) throws SAXException {
        return schemaCache.computeIfAbsent(xsdFileName, k -> {
            try {
                // Use javax.xml.validation.SchemaFactory (Standard Java)
                SchemaFactory factory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
                
                // First try external file (for development/testing)
                File file = new File(STORAGE_DIR, xsdFileName);
                if (file.exists()) {
                    System.out.println("[XMLHandler] Loading XSD from file: " + file.getAbsolutePath());
                    return factory.newSchema(file);
                }
                
                // Then try classpath resource
                Resource resource = resourceLoader.getResource("classpath:" + CLASSPATH_DIR + xsdFileName);
                if (resource.exists()) {
                    System.out.println("[XMLHandler] Loading XSD from classpath: " + CLASSPATH_DIR + xsdFileName);
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
    
    /**
     * Marshal object to XML string
     * Used for export endpoints and interoperability
     */
    public <T> String marshalToString(T object) throws JAXBException {
        JAXBContext context = getOrCreateContext(object.getClass());
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
        
        StringWriter writer = new StringWriter();
        marshaller.marshal(object, writer);
        return writer.toString();
    }
    
    /**
     * Unmarshal object from InputStream with XSD validation
     * Used for import endpoints and interoperability
     */
    @SuppressWarnings("unchecked")
    public <T> T unmarshalFromStream(InputStream inputStream, Class<T> clazz, String xsdFileName) throws JAXBException, SAXException {
        // Clear schema cache to ensure we're using the latest XSD
        if (xsdFileName != null && !xsdFileName.isEmpty()) {
            clearSchemaCache(xsdFileName);
        }
        
        // Buffer the input stream to allow multiple reads if needed
        byte[] buffer;
        try {
            buffer = inputStream.readAllBytes();
            System.out.println("[XMLHandler] Read " + buffer.length + " bytes from input stream");
        } catch (IOException e) {
            throw new JAXBException("Error reading input stream", e);
        }
        
        // Log first 500 characters for debugging
        String preview = new String(buffer, 0, Math.min(500, buffer.length));
        System.out.println("[XMLHandler] XML preview (first 500 chars): " + preview.replace("\n", "\\n").replace("\r", "\\r"));
        
        JAXBContext context = getOrCreateContext(clazz);
        Unmarshaller unmarshaller = context.createUnmarshaller();
        
        // Set schema for validation if provided
        if (xsdFileName != null && !xsdFileName.isEmpty()) {
            Schema schema = getOrLoadSchema(xsdFileName);
            unmarshaller.setSchema(schema);
            System.out.println("[XMLHandler] Using XSD schema: " + xsdFileName);
            System.out.println("[XMLHandler] Schema cache cleared, using fresh schema");
        }
        
        ByteArrayInputStream bais = new ByteArrayInputStream(buffer);
        try {
            return (T) unmarshaller.unmarshal(bais);
        } catch (JAXBException e) {
            // Check if the cause is a SAXParseException (validation error)
            Throwable cause = e.getCause();
            if (cause instanceof org.xml.sax.SAXParseException) {
                org.xml.sax.SAXParseException saxEx = (org.xml.sax.SAXParseException) cause;
                String detailedMsg = String.format("XML validation failed at line %d, column %d: %s", 
                    saxEx.getLineNumber(), saxEx.getColumnNumber(), 
                    saxEx.getMessage() != null ? saxEx.getMessage() : saxEx.getLocalizedMessage());
                
                // Log the error location for debugging
                System.err.println("[XMLHandler] Validation error at line " + saxEx.getLineNumber() + 
                                 ", column " + saxEx.getColumnNumber() + ": " + saxEx.getMessage());
                
                // Extract context around the error
                if (saxEx.getLineNumber() > 0) {
                    String[] lines = new String(buffer).split("\n");
                    if (saxEx.getLineNumber() <= lines.length) {
                        String errorLine = lines[saxEx.getLineNumber() - 1];
                        System.err.println("[XMLHandler] Error line content: " + errorLine);
                    }
                }
                
                // Add context about what was expected
                if (saxEx.getMessage() != null && saxEx.getMessage().contains("capacite") && saxEx.getMessage().contains("statut")) {
                    detailedMsg += ". Expected order in <vehicle>: id, capacite, disponibilite, immatriculation, typeVehicule, statut, etat, conducteur";
                }
                
                try {
                    bais.close();
                } catch (IOException ignored) {
                    // Ignore close errors
                }
                throw new SAXException(detailedMsg, saxEx);
            }
            // If not a validation error, rethrow as JAXBException
            System.err.println("[XMLHandler] JAXBException (not validation): " + e.getMessage());
            e.printStackTrace();
            try {
                bais.close();
            } catch (IOException ignored) {
                // Ignore close errors
            }
            throw e;
        } finally {
            try {
                bais.close();
            } catch (IOException ignored) {
                // Ignore close errors
            }
        }
    }
    
    /**
     * Unmarshal object from InputStream with automatic XSD detection
     */
    public <T> T unmarshalFromStream(InputStream inputStream, Class<T> clazz) throws JAXBException {
        try {
            // Auto-determine XSD based on class name
            String xsdFileName = determineXsdFileName("", clazz);
            return unmarshalFromStream(inputStream, clazz, xsdFileName);
        } catch (SAXException e) {
            throw new JAXBException("Failed to unmarshal from stream: " + e.getMessage(), e);
        }
    }
}