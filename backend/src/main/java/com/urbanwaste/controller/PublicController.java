package com.urbanwaste.controller;

import com.urbanwaste.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.xml.bind.JAXBException;
import java.util.List;
import java.util.Map;

/**
 * Public controller for citizen-facing endpoints (no authentication required)
 */
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PublicController {
    
    @Autowired
    private RouteService routeService;
    
    /**
     * GET: Get collection schedules for a zone
     */
    @GetMapping("/schedules")
    public ResponseEntity<?> getSchedules(@RequestParam(required = false) String zone) {
        try {
            if (zone == null || zone.trim().isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            List<Map<String, String>> schedules = routeService.getSchedulesByZone(zone);
            return ResponseEntity.ok(schedules);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}

