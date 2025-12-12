package com.urbanwaste.service;

import com.urbanwaste.model.Vehicule;
import com.urbanwaste.model.VehiculesWrapper; // Assuming you have this wrapper model
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.xml.bind.JAXBException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class VehicleService {
    
    private static final String VEHICLES_FILE = "vehicules.xml";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    // Using a separate counter for vehicles
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(VEHICLES_FILE)) {
            try {
                List<Vehicule> vehicles = getAllVehicles();
                if (!vehicles.isEmpty()) {
                    // Assuming Vehicule has an getId() method
                    int maxId = vehicles.stream().mapToInt(Vehicule::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing vehicles: " + e.getMessage());
            }
        }
    }
    
    /**
     * Get all vehicles
     */
    public List<Vehicule> getAllVehicles() throws JAXBException {
        // FIX: Replaces XmlList/XMLHandler.read()
        VehiculesWrapper wrapper = xmlHandler.loadFromXML(VEHICLES_FILE, VehiculesWrapper.class);
        // Ensure we always return a non-null list
        if (wrapper == null || wrapper.getVehicules() == null) {
            return new ArrayList<>();
        }
        return wrapper.getVehicules();
    }
    
    /**
     * Get vehicle by ID
     */
    public Optional<Vehicule> getVehicleById(int id) throws JAXBException {
        return getAllVehicles().stream()
            .filter(v -> v.getId() == id)
            .findFirst();
    }
    
    /**
     * Create new vehicle - synchronized write operation
     */
    public synchronized Vehicule createVehicle(Vehicule vehicle) throws JAXBException, XMLValidationException {
        VehiculesWrapper wrapper = xmlHandler.loadFromXML(VEHICLES_FILE, VehiculesWrapper.class);
        
        // Ensure wrapper and list are initialized
        if (wrapper == null) {
            wrapper = new VehiculesWrapper();
        }
        List<Vehicule> vehicles = wrapper.getVehicules();
        if (vehicles == null) {
            vehicles = new ArrayList<>();
            wrapper.setVehicules(vehicles);
        }
        
        vehicle.setId(idCounter.getAndIncrement());
        
        // Add default status if not set
        if (vehicle.getEtat() == null) {
            vehicle.setEtat("DISPONIBLE");
        }
        if (vehicle.getStatut() == null) {
            vehicle.setStatut(vehicle.getEtat());
        }
        
        vehicles.add(vehicle);
        wrapper.setVehicules(vehicles);
        
        xmlHandler.saveToXML(wrapper, VEHICLES_FILE);
        
        return vehicle;
    }
    
    /**
     * Update existing vehicle - synchronized write operation
     */
    public synchronized Optional<Vehicule> updateVehicle(int id, Vehicule updatedVehicle) throws JAXBException, XMLValidationException {
        VehiculesWrapper wrapper = xmlHandler.loadFromXML(VEHICLES_FILE, VehiculesWrapper.class);
        
        // Ensure wrapper and list are initialized
        if (wrapper == null) {
            wrapper = new VehiculesWrapper();
        }
        List<Vehicule> vehicles = wrapper.getVehicules();
        if (vehicles == null) {
            vehicles = new ArrayList<>();
            wrapper.setVehicules(vehicles);
        }
        
        Optional<Vehicule> existing = vehicles.stream()
            .filter(v -> v.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        
        vehicles.removeIf(v -> v.getId() == id);
        updatedVehicle.setId(id);
        vehicles.add(updatedVehicle);
        
        wrapper.setVehicules(vehicles);
        xmlHandler.saveToXML(wrapper, VEHICLES_FILE);
        
        return Optional.of(updatedVehicle);
    }
    
    /**
     * Delete vehicle - synchronized write operation
     */
    public synchronized boolean deleteVehicle(int id) throws JAXBException, XMLValidationException {
        VehiculesWrapper wrapper = xmlHandler.loadFromXML(VEHICLES_FILE, VehiculesWrapper.class);
        
        // Ensure wrapper and list are initialized
        if (wrapper == null) {
            wrapper = new VehiculesWrapper();
        }
        List<Vehicule> vehicles = wrapper.getVehicules();
        if (vehicles == null) {
            vehicles = new ArrayList<>();
            wrapper.setVehicules(vehicles);
        }
        
        boolean removed = vehicles.removeIf(v -> v.getId() == id);
        
        if (removed) {
            wrapper.setVehicules(vehicles);
            xmlHandler.saveToXML(wrapper, VEHICLES_FILE);
        }
        
        return removed;
    }
    
    /**
     * Get vehicles by status
     */
    public List<Vehicule> getVehiclesByStatus(String status) throws JAXBException {
        return getAllVehicles().stream()
            .filter(v -> status.equalsIgnoreCase(v.getEtat()))
            .collect(Collectors.toList());
    }
    
    /**
     * Update vehicle status - synchronized to prevent race conditions
     * Valid statuses: DISPONIBLE, EN_PANNE, EN_REPARATION
     */
    public synchronized Optional<Vehicule> updateVehicleStatus(int id, String newStatus) throws JAXBException, XMLValidationException {
        // Validate status
        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus + ". Must be DISPONIBLE, EN_PANNE, or EN_REPARATION");
        }
        
        VehiculesWrapper wrapper = xmlHandler.loadFromXML(VEHICLES_FILE, VehiculesWrapper.class);
        
        // Ensure wrapper and list are initialized
        if (wrapper == null) {
            wrapper = new VehiculesWrapper();
        }
        List<Vehicule> vehicles = wrapper.getVehicules();
        if (vehicles == null) {
            vehicles = new ArrayList<>();
            wrapper.setVehicules(vehicles);
        }
        
        Optional<Vehicule> existing = vehicles.stream()
            .filter(v -> v.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        
        Vehicule vehicle = existing.get();
        String oldStatus = vehicle.getStatut() != null ? vehicle.getStatut() : vehicle.getEtat();
        
        // Update status
        vehicle.setStatut(newStatus);
        vehicle.setEtat(newStatus);
        
        // Update disponibilite based on status
        vehicle.setDisponibilite("DISPONIBLE".equals(newStatus));
        
        vehicles.removeIf(v -> v.getId() == id);
        vehicles.add(vehicle);
        
        wrapper.setVehicules(vehicles);
        xmlHandler.saveToXML(wrapper, VEHICLES_FILE);
        
        return Optional.of(vehicle);
    }
    
    /**
     * Validate status value
     */
    private boolean isValidStatus(String status) {
        if (status == null) return false;
        return "DISPONIBLE".equals(status) || 
               "EN_PANNE".equals(status) || 
               "EN_REPARATION".equals(status);
    }
    
    /**
     * Merge imported vehicles with existing vehicles (avoiding duplicates by ID)
     * Returns the number of vehicles actually imported (new vehicles only)
     */
    public synchronized int mergeVehicles(List<Vehicule> importedVehicles) throws JAXBException, XMLValidationException {
        VehiculesWrapper wrapper = xmlHandler.loadFromXML(VEHICLES_FILE, VehiculesWrapper.class);
        if (wrapper == null) {
            wrapper = new VehiculesWrapper();
        }
        List<Vehicule> existingVehicles = wrapper.getVehicules();
        if (existingVehicles == null) {
            existingVehicles = new ArrayList<>();
        }
        
        // Create a set of existing IDs for quick lookup
        Set<Integer> existingIds = existingVehicles.stream()
            .map(Vehicule::getId)
            .collect(Collectors.toSet());
        
        int importedCount = 0;
        
        // Merge vehicles: update existing ones or add new ones
        for (Vehicule importedVehicle : importedVehicles) {
            // Find existing vehicle with same ID
            Vehicule existingVehicle = existingVehicles.stream()
                .filter(v -> v.getId() == importedVehicle.getId())
                .findFirst()
                .orElse(null);
            
            if (existingVehicle != null) {
                // Update existing vehicle
                existingVehicle.setTypeVehicule(importedVehicle.getTypeVehicule() != null ? importedVehicle.getTypeVehicule() : existingVehicle.getTypeVehicule());
                existingVehicle.setCapacite(importedVehicle.getCapacite() != 0 ? importedVehicle.getCapacite() : existingVehicle.getCapacite());
                existingVehicle.setDisponibilite(importedVehicle.isDisponibilite());
                existingVehicle.setImmatriculation(importedVehicle.getImmatriculation() != null ? importedVehicle.getImmatriculation() : existingVehicle.getImmatriculation());
                existingVehicle.setStatut(importedVehicle.getStatut() != null ? importedVehicle.getStatut() : existingVehicle.getStatut());
                existingVehicle.setEtat(importedVehicle.getEtat() != null ? importedVehicle.getEtat() : existingVehicle.getEtat());
                existingVehicle.setConducteur(importedVehicle.getConducteur() != null ? importedVehicle.getConducteur() : existingVehicle.getConducteur());
                
                importedCount++; // Count updated vehicles too
            } else {
                // Add new vehicle
                // Assign new ID if ID is 0 or conflicts
                if (importedVehicle.getId() == 0 || existingIds.contains(importedVehicle.getId())) {
                    importedVehicle.setId(idCounter.getAndIncrement());
                }
                
                // Set default values if not provided
                if (importedVehicle.getEtat() == null) {
                    importedVehicle.setEtat("DISPONIBLE");
                }
                if (importedVehicle.getStatut() == null) {
                    importedVehicle.setStatut(importedVehicle.getEtat());
                }
                
                existingVehicles.add(importedVehicle);
                existingIds.add(importedVehicle.getId());
                importedCount++;
            }
        }
        
        wrapper.setVehicules(existingVehicles);
        xmlHandler.saveToXML(wrapper, VEHICLES_FILE);
        
        return importedCount;
    }
}