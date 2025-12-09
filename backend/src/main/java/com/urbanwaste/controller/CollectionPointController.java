package com.urbanwaste.controller;

import com.urbanwaste.model.PointCollecte;
import com.urbanwaste.service.CollectionPointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.xml.bind.JAXBException;
import java.util.*;

@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CollectionPointController {
    
    @Autowired
    private CollectionPointService pointService;
    
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
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
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
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
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
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
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
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}