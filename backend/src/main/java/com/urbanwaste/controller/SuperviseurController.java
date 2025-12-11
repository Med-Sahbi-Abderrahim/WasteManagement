package com.urbanwaste.controller;

import com.urbanwaste.model.Utilisateur;
import com.urbanwaste.service.SuperviseurService;
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
@RequestMapping("/api/superviseurs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SuperviseurController {
    
    @Autowired
    private SuperviseurService superviseurService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            List<Utilisateur> superviseurs = superviseurService.getAllSuperviseurs();
            return ResponseEntity.ok(superviseurs);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        try {
            Optional<Utilisateur> superviseur = superviseurService.getSuperviseurById(id);
            return superviseur.isPresent()
                ? ResponseEntity.ok(superviseur.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Superviseur not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Utilisateur superviseur) {
        try {
            Utilisateur newSuperviseur = superviseurService.createSuperviseur(superviseur);
            return ResponseEntity.status(HttpStatus.CREATED).body(newSuperviseur);
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Utilisateur superviseur) {
        try {
            Optional<Utilisateur> updatedSuperviseur = superviseurService.updateSuperviseur(id, superviseur);
            return updatedSuperviseur.isPresent()
                ? ResponseEntity.ok(updatedSuperviseur.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Superviseur not found"));
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
            boolean deleted = superviseurService.deleteSuperviseur(id);
            return deleted
                ? ResponseEntity.ok(Map.of("message", "Superviseur deleted successfully"))
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Superviseur not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}

