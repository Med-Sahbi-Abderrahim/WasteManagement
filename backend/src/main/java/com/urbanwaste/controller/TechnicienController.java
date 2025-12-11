package com.urbanwaste.controller;

import com.urbanwaste.model.Notification;
import com.urbanwaste.model.Vehicule;
import com.urbanwaste.service.NotificationService;
import com.urbanwaste.service.VehicleService;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.xml.bind.JAXBException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/technicien")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TechnicienController {
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Update vehicle status
     * PUT /api/technicien/vehicules/{id}/status
     */
    @PutMapping("/vehicules/{id}/status")
    public ResponseEntity<?> updateVehicleStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status is required"));
            }
            
            // Get vehicle before update to check if status is changing to EN_PANNE
            Optional<Vehicule> vehicleBefore = vehicleService.getVehicleById(id);
            String oldStatus = vehicleBefore.map(v -> v.getStatut() != null ? v.getStatut() : v.getEtat()).orElse(null);
            
            // Update vehicle status (synchronized)
            Optional<Vehicule> updated = vehicleService.updateVehicleStatus(id, newStatus.trim().toUpperCase());
            
            if (updated.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Vehicle not found"));
            }
            
            // If status changed to EN_PANNE, create notification for technicians
            if ("EN_PANNE".equals(newStatus.trim().toUpperCase()) && 
                !"EN_PANNE".equals(oldStatus)) {
                try {
                    Vehicule vehicle = updated.get();
                    String immatriculation = vehicle.getImmatriculation() != null 
                        ? vehicle.getImmatriculation() 
                        : "N/A";
                    notificationService.createVehicleBreakdownNotification(id, immatriculation);
                    System.out.println("[TechnicienController] Created notification for vehicle breakdown: " + id);
                } catch (XMLValidationException | JAXBException e) {
                    System.err.println("[TechnicienController] Failed to create notification: " + e.getMessage());
                    // Don't fail the request if notification creation fails
                }
            }
            
            return ResponseEntity.ok(updated.get());
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update vehicle status: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + e.getMessage()));
        }
    }
    
    /**
     * Get notifications for technicians
     * GET /api/technicien/notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(
            @RequestParam(required = false) Boolean unreadOnly) {
        try {
            List<Notification> notifications;
            
            if (Boolean.TRUE.equals(unreadOnly)) {
                notifications = notificationService.getUnreadNotificationsByRole("TECHNICIEN");
            } else {
                notifications = notificationService.getNotificationsByRole("TECHNICIEN");
            }
            
            return ResponseEntity.ok(notifications);
            
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch notifications: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + e.getMessage()));
        }
    }
    
    /**
     * Mark notification as read
     * PUT /api/technicien/notifications/{id}/read
     */
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable int id) {
        try {
            boolean updated = notificationService.markAsRead(id);
            
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Notification not found"));
            }
            
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update notification: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + e.getMessage()));
        }
    }
}
