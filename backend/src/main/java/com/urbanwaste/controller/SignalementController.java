package com.urbanwaste.controller;

import com.urbanwaste.model.Signalement;
import com.urbanwaste.service.SignalementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.xml.bind.JAXBException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/signalements")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SignalementController {

    @Autowired
    private SignalementService signalementService;

    /**
     * POST: Employees submit new reports
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Signalement signalement) {
        try {
            Signalement created = signalementService.create(signalement);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET: Admins / Supervisors view all reports
     */
    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            List<Signalement> list = signalementService.getAll();
            return ResponseEntity.ok(list);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET: Employees view their own report history
     */
    @GetMapping("/employe/{id}")
    public ResponseEntity<?> getByEmploye(@PathVariable int id) {
        try {
            List<Signalement> list = signalementService.getByEmployeId(id);
            return ResponseEntity.ok(list);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT: Supervisors update statut
     */
    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable int id, @RequestBody Map<String, String> body) {
        try {
            String newStatut = body.get("statut");
            if (newStatut == null || newStatut.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "statut is required"));
            }

            Optional<Signalement> updated = signalementService.updateStatut(id, newStatut);
            return updated.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Signalement not found")));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}

