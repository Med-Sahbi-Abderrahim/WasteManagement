package com.urbanwaste.service;

import com.urbanwaste.model.Vehicule;
import com.urbanwaste.model.VehiculesWrapper; // Assuming you have this wrapper model
import com.urbanwaste.util.XMLHandler;
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
     * Create new vehicle
     */
    public Vehicule createVehicle(Vehicule vehicle) throws JAXBException {
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
     * Update existing vehicle
     */
    public Optional<Vehicule> updateVehicle(int id, Vehicule updatedVehicle) throws JAXBException {
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
     * Delete vehicle
     */
    public boolean deleteVehicle(int id) throws JAXBException {
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
}