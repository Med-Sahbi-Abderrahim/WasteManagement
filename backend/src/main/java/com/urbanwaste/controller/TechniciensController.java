package com.urbanwaste.controller;

import com.urbanwaste.model.Utilisateur;
import com.urbanwaste.service.TechnicienService;
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
@RequestMapping("/api/techniciens")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TechniciensController {
    
    @Autowired
    private TechnicienService technicienService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            List<Utilisateur> techniciens = technicienService.getAllTechniciens();
            return ResponseEntity.ok(techniciens);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        try {
            Optional<Utilisateur> technicien = technicienService.getTechnicienById(id);
            return technicien.isPresent()
                ? ResponseEntity.ok(technicien.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Technicien not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Utilisateur technicien) {
        try {
            Utilisateur newTechnicien = technicienService.createTechnicien(technicien);
            return ResponseEntity.status(HttpStatus.CREATED).body(newTechnicien);
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Utilisateur technicien) {
        try {
            Optional<Utilisateur> updatedTechnicien = technicienService.updateTechnicien(id, technicien);
            return updatedTechnicien.isPresent()
                ? ResponseEntity.ok(updatedTechnicien.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Technicien not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            boolean deleted = technicienService.deleteTechnicien(id);
            return deleted
                ? ResponseEntity.ok(Map.of("message", "Technicien deleted successfully"))
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Technicien not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}

