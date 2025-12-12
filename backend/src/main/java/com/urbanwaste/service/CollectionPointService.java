package com.urbanwaste.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional; // <-- CHANGED from javax.annotation
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger; // <-- CHANGED from javax.xml.bind
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.urbanwaste.model.PointCollecte;
import com.urbanwaste.model.PointsCollecteWrapper;
import com.urbanwaste.model.TypeDechet;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;

import jakarta.annotation.PostConstruct;
import jakarta.xml.bind.JAXBException;

@Service
public class CollectionPointService {
    
    private static final String POINTS_FILE = "collectionPoints.xml";
    private static final String POINTS_XSD = "collectionPoints.xsd";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        // Initialize ID counter from existing data
        if (xmlHandler.fileExists(POINTS_FILE)) {
            try {
                List<PointCollecte> points = getAllPoints();
                if (!points.isEmpty()) {
                    int maxId = points.stream().mapToInt(PointCollecte::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing points: " + e.getMessage());
            }
        }
    }
    
    /**
     * Get all collection points
     */
    public List<PointCollecte> getAllPoints() throws JAXBException {
        // Uses the XMLHandler to load the data wrapper and returns the inner list
        PointsCollecteWrapper wrapper = xmlHandler.loadFromXML(POINTS_FILE, PointsCollecteWrapper.class);
        // Ensure we always return a non-null list
        if (wrapper == null || wrapper.getPoints() == null) {
            return new ArrayList<>();
        }
        return wrapper.getPoints();
    }
    
    /**
     * Get point by ID
     */
    public Optional<PointCollecte> getPointById(int id) throws JAXBException {
        return getAllPoints().stream()
            .filter(p -> p.getId() == id)
            .findFirst();
    }
    
    /**
     * Create new collection point
     */
    public PointCollecte createPoint(PointCollecte point) throws JAXBException, XMLValidationException {
        // --- DEBUGGING START ---
        System.out.println("DEBUG: Creating Point");
        System.out.println("Address: " + point.getLocalisation()); 
        System.out.println("DEBUG: Incoming Lat/Lon: " + point.getLatitude() + " / " + point.getLongitude());
        // --- DEBUGGING END ---

        PointsCollecteWrapper wrapper = xmlHandler.loadFromXML(POINTS_FILE, PointsCollecteWrapper.class);
        
        // Ensure wrapper and list are initialized
        if (wrapper == null) {
            wrapper = new PointsCollecteWrapper();
        }
        List<PointCollecte> points = wrapper.getPoints();
        if (points == null) {
            points = new ArrayList<>();
            wrapper.setPoints(points);
        }
        
        // Assign unique ID
        point.setId(idCounter.getAndIncrement());
        
        // Set default values if not provided (Business Rules)
        if (point.getEtatConteneur() == null) {
            point.setEtatConteneur("ACTIF");
        }
        if (point.getDateDerniereCollecte() == null) {
            point.setDateDerniereCollecte(new Date());
        }
        // Ensure typeDechet is set if not provided
        if (point.getTypeDechet() == null) {
            point.setTypeDechet(new TypeDechet(1, "MIXTE"));
        }
        
        points.add(point);
        wrapper.setPoints(points);
        
        // Save the updated list back to XML
        xmlHandler.saveToXML(wrapper, POINTS_FILE);
        
        return point;
    }
    
    /**
     * Update existing point
     */
    public Optional<PointCollecte> updatePoint(int id, PointCollecte updatedPoint) throws JAXBException, XMLValidationException {
        PointsCollecteWrapper wrapper = xmlHandler.loadFromXML(POINTS_FILE, PointsCollecteWrapper.class);
        
        // Ensure wrapper and list are initialized
        if (wrapper == null) {
            wrapper = new PointsCollecteWrapper();
        }
        List<PointCollecte> points = wrapper.getPoints();
        if (points == null) {
            points = new ArrayList<>();
            wrapper.setPoints(points);
        }
        
        Optional<PointCollecte> existing = points.stream()
            .filter(p -> p.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        
        // Remove old and add updated
        points.removeIf(p -> p.getId() == id);
        updatedPoint.setId(id);
        // Ensure typeDechet is set if not provided
        if (updatedPoint.getTypeDechet() == null) {
            updatedPoint.setTypeDechet(new TypeDechet(1, "MIXTE"));
        }
        points.add(updatedPoint);
        
        wrapper.setPoints(points);
        xmlHandler.saveToXML(wrapper, POINTS_FILE);
        
        return Optional.of(updatedPoint);
    }
    
    /**
     * Delete point
     */
    public boolean deletePoint(int id) throws JAXBException, XMLValidationException {
        PointsCollecteWrapper wrapper = xmlHandler.loadFromXML(POINTS_FILE, PointsCollecteWrapper.class);
        List<PointCollecte> points = wrapper.getPoints();
        
        boolean removed = points.removeIf(p -> p.getId() == id);
        
        if (removed) {
            wrapper.setPoints(points);
            xmlHandler.saveToXML(wrapper, POINTS_FILE);
        }
        
        return removed;
    }
    
    /**
     * Get points by waste type
     */
    public List<PointCollecte> getPointsByType(String typeName) throws JAXBException {
        return getAllPoints().stream()
            .filter(p -> p.getTypeDechet() != null && 
                        typeName.equalsIgnoreCase(p.getTypeDechet().getNom()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get critical points (above threshold)
     */
    public List<PointCollecte> getCriticalPoints(float threshold) throws JAXBException {
        return getAllPoints().stream()
            .filter(p -> p.getNiveauRemplissage() > threshold)
            .sorted(Comparator.comparingDouble(PointCollecte::getNiveauRemplissage).reversed())
            .collect(Collectors.toList());
    }
    
    /**
     * Get points by state
     */
    public List<PointCollecte> getPointsByEtat(String etat) throws JAXBException {
        return getAllPoints().stream()
            .filter(p -> etat.equalsIgnoreCase(p.getEtatConteneur()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get points in maintenance
     */
    public List<PointCollecte> getPointsInMaintenance() throws JAXBException {
        return getPointsByEtat("MAINTENANCE");
    }
    
    /**
     * Update fill level
     */
    public Optional<PointCollecte> updateFillLevel(int id, float newLevel) throws JAXBException, XMLValidationException {
        PointsCollecteWrapper wrapper = xmlHandler.loadFromXML(POINTS_FILE, PointsCollecteWrapper.class);
        List<PointCollecte> points = wrapper.getPoints();
        
        Optional<PointCollecte> pointOpt = points.stream()
            .filter(p -> p.getId() == id)
            .findFirst();
        
        if (pointOpt.isEmpty()) {
            return Optional.empty();
        }
        
        PointCollecte point = pointOpt.get();
        point.setNiveauRemplissage(newLevel);
        
        // Auto update state if critical (Business Rule: if over 90% and not already maintenance, set to maintenance)
        if (newLevel > 90 && !"MAINTENANCE".equals(point.getEtatConteneur())) {
            point.setEtatConteneur("MAINTENANCE");
        }
        
        wrapper.setPoints(points);
        xmlHandler.saveToXML(wrapper, POINTS_FILE);
        
        return Optional.of(point);
    }
    
    /**
     * Get statistics
     */
    public Map<String, Object> getStatistics() throws JAXBException {
        List<PointCollecte> points = getAllPoints();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", points.size());
        stats.put("actifs", points.stream().filter(p -> "ACTIF".equals(p.getEtatConteneur())).count());
        stats.put("maintenance", points.stream().filter(p -> "MAINTENANCE".equals(p.getEtatConteneur())).count());
        stats.put("horsService", points.stream().filter(p -> "HORS_SERVICE".equals(p.getEtatConteneur())).count());
        stats.put("critiques", points.stream().filter(p -> p.getNiveauRemplissage() > 80).count());
        
        double avgFill = points.stream()
            .mapToDouble(PointCollecte::getNiveauRemplissage)
            .average()
            .orElse(0.0);
        stats.put("remplissageMoyen", Math.round(avgFill * 100) / 100.0);
        
        return stats;
    }
    
    /**
     * Merge imported points with existing points (avoiding duplicates by ID)
     * Returns the number of points actually imported (new points only)
     */
    public synchronized int mergePoints(List<PointCollecte> importedPoints) throws JAXBException, XMLValidationException {
        PointsCollecteWrapper wrapper = xmlHandler.loadFromXML(POINTS_FILE, PointsCollecteWrapper.class);
        if (wrapper == null) {
            wrapper = new PointsCollecteWrapper();
        }
        List<PointCollecte> existingPoints = wrapper.getPoints();
        if (existingPoints == null) {
            existingPoints = new ArrayList<>();
        }
        
        // Create a set of existing IDs for quick lookup
        Set<Integer> existingIds = existingPoints.stream()
            .map(PointCollecte::getId)
            .collect(Collectors.toSet());
        
        int importedCount = 0;
        
        // Add only points that don't already exist (by ID)
        for (PointCollecte importedPoint : importedPoints) {
            if (!existingIds.contains(importedPoint.getId())) {
                // Assign new ID if ID is 0 or conflicts
                if (importedPoint.getId() == 0 || existingIds.contains(importedPoint.getId())) {
                    importedPoint.setId(idCounter.getAndIncrement());
                }
                
                // Set default values if not provided
                if (importedPoint.getEtatConteneur() == null) {
                    importedPoint.setEtatConteneur("ACTIF");
                }
                if (importedPoint.getDateDerniereCollecte() == null) {
                    importedPoint.setDateDerniereCollecte(new Date());
                }
                if (importedPoint.getTypeDechet() == null) {
                    importedPoint.setTypeDechet(new TypeDechet(1, "MIXTE"));
                }
                
                existingPoints.add(importedPoint);
                existingIds.add(importedPoint.getId());
                importedCount++;
            }
        }
        
        wrapper.setPoints(existingPoints);
        xmlHandler.saveToXML(wrapper, POINTS_FILE);
        
        return importedCount;
    }
}