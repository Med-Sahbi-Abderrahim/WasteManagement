package com.urbanwaste.controller;

import com.urbanwaste.model.PointCollecte;
import com.urbanwaste.model.PointsCollecteWrapper;
import com.urbanwaste.service.CollectionPointService;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import jakarta.xml.bind.JAXBException;
import java.util.*;

@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CollectionPointController {
    
    @Autowired
    private CollectionPointService pointService;
    
    @Autowired
    private XMLHandler xmlHandler;
    
    @GetMapping
    public ResponseEntity<?> getAllPoints() {
        try {
            return ResponseEntity.ok(pointService.getAllPoints());
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getPointById(@PathVariable int id) {
        try {
            Optional<PointCollecte> point = pointService.getPointById(id);
            return point.isPresent()
                ? ResponseEntity.ok(point.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Point not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createPoint(@RequestBody PointCollecte point) {
        try {
            PointCollecte created = pointService.createPoint(point);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Validation Error: " + e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error processing XML"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePoint(@PathVariable int id, @RequestBody PointCollecte point) {
        try {
            Optional<PointCollecte> updated = pointService.updatePoint(id, point);
            return updated.isPresent()
                ? ResponseEntity.ok(updated.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Point not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Validation Error: " + e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error processing XML"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePoint(@PathVariable int id) {
        try {
            boolean deleted = pointService.deletePoint(id);
            return deleted
                ? ResponseEntity.ok(Map.of("message", "Point deleted successfully"))
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Point not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Validation Error: " + e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error processing XML"));
        }
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getPointsByType(@PathVariable String type) {
        try {
            return ResponseEntity.ok(pointService.getPointsByType(type));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/critical")
    public ResponseEntity<?> getCriticalPoints(@RequestParam(defaultValue = "80") float threshold) {
        try {
            return ResponseEntity.ok(pointService.getCriticalPoints(threshold));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics() {
        try {
            return ResponseEntity.ok(pointService.getStatistics());
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/fill-level")
    public ResponseEntity<?> updateFillLevel(@PathVariable int id, @RequestParam float level) {
        try {
            Optional<PointCollecte> updated = pointService.updateFillLevel(id, level);
            return updated.isPresent()
                ? ResponseEntity.ok(updated.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Point not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Validation Error: " + e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error processing XML"));
        }
    }
    
    /**
     * POST: Import collection points from XML file (Interoperability)
     * Accepts MultipartFile XML, validates against XSD, and merges with existing data
     */
    @PostMapping("/import")
    public ResponseEntity<?> importPoints(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "File is empty"));
        }
        
        try {
            // Unmarshal XML from InputStream with XSD validation
            PointsCollecteWrapper importedWrapper = xmlHandler.unmarshalFromStream(
                file.getInputStream(), 
                PointsCollecteWrapper.class, 
                "pointsCollecte.xsd"
            );
            
            if (importedWrapper == null || importedWrapper.getPoints() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid XML structure"));
            }
            
            // Merge with existing data (avoiding duplicates by ID)
            int importedCount = pointService.mergePoints(importedWrapper.getPoints());
            
            return ResponseEntity.ok(Map.of(
                "message", "Collection points imported successfully",
                "imported", importedCount,
                "total", importedWrapper.getPoints().size()
            ));
        } catch (SAXException e) {
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName() + ": " + (e.getLocalizedMessage() != null ? e.getLocalizedMessage() : "XML validation failed");
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
                .body(Map.of("error", "Failed to import points: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName())));
        }
    }
}