package com.urbanwaste.controller;

import com.urbanwaste.model.Vehicule; 
import com.urbanwaste.model.VehiculesWrapper;
import com.urbanwaste.service.VehicleService;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import jakarta.xml.bind.JAXBException; 
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class VehicleController {
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private XMLHandler xmlHandler;

    /**
     * GET: Retrieve all vehicles
     */
    @GetMapping
    public ResponseEntity<?> getAllVehicles() {
        try {
            List<Vehicule> vehicles = vehicleService.getAllVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET: Retrieve vehicle by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(@PathVariable int id) {
        try {
            Optional<Vehicule> vehicle = vehicleService.getVehicleById(id);
            return vehicle.isPresent()
                ? ResponseEntity.ok(vehicle.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Vehicle not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST: Add a new vehicle
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody Vehicule vehicle) { // <--- FIX 1: Corrected class name
        try {
            Vehicule newVehicle = vehicleService.createVehicle(vehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(newVehicle);
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT: Update an existing vehicle
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Vehicule vehicle) { // <--- FIX 1: Corrected class name
        try {
            Optional<Vehicule> updatedVehicle = vehicleService.updateVehicle(id, vehicle);
            return updatedVehicle.isPresent()
                ? ResponseEntity.ok(updatedVehicle.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Vehicle not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE: Delete a vehicle
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            boolean deleted = vehicleService.deleteVehicle(id);
            return deleted
                ? ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully"))
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Vehicle not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET: Retrieve vehicles by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getVehiclesByStatus(@PathVariable String status) {
        try {
            List<Vehicule> vehicles = vehicleService.getVehiclesByStatus(status);
            return ResponseEntity.ok(vehicles);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * POST: Import vehicles from XML file (Interoperability)
     * Accepts MultipartFile XML, validates against XSD, and merges with existing data
     */
    @PostMapping("/import")
    public ResponseEntity<?> importVehicles(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "File is empty"));
        }
        
        try {
            // Unmarshal XML from InputStream with XSD validation
            VehiculesWrapper importedWrapper = xmlHandler.unmarshalFromStream(
                file.getInputStream(), 
                VehiculesWrapper.class, 
                "vehicules.xsd"
            );
            
            if (importedWrapper == null || importedWrapper.getVehicules() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid XML structure"));
            }
            
            // Merge with existing data (avoiding duplicates by ID)
            int importedCount = vehicleService.mergeVehicles(importedWrapper.getVehicules());
            
            return ResponseEntity.ok(Map.of(
                "message", "Vehicles imported successfully",
                "imported", importedCount,
                "total", importedWrapper.getVehicules().size()
            ));
        } catch (SAXException e) {
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName() + ": " + (e.getLocalizedMessage() != null ? e.getLocalizedMessage() : "XML validation failed");
            }
            // Try to extract more details from the exception
            if (e.getLocalizedMessage() != null && !e.getLocalizedMessage().isEmpty()) {
                errorMsg += " (" + e.getLocalizedMessage() + ")";
            }
            // Add helpful message for common validation errors
            if (errorMsg.contains("telephone") && errorMsg.contains("conducteur")) {
                errorMsg += ". Note: The 'telephone' field is not allowed in 'conducteur' for vehicles. Only 'id', 'nom', and 'prenom' are allowed.";
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "XML validation failed: " + errorMsg));
        } catch (JAXBException e) {
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName() + ": " + (e.getCause() != null ? e.getCause().getMessage() : "XML parsing failed");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "XML parsing failed: " + errorMsg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to import vehicles: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName())));
        }
    }
}