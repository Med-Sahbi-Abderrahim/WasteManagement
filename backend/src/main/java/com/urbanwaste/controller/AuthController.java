package com.urbanwaste.controller;

// Core Spring Framework Imports
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Jakarta Import for XML Exception Handling
import jakarta.xml.bind.JAXBException; 

// Your Local Package Imports
import com.urbanwaste.model.Utilisateur;
import com.urbanwaste.service.AuthService;

import java.util.*;

// ==================== AUTH CONTROLLER ====================
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Optional<Utilisateur> userOpt = authService.login(request.getMail(), request.getPassword());
            
            if (userOpt.isPresent()) {
                Utilisateur user = userOpt.get();
                return ResponseEntity.ok(new LoginResponse(
                    user.getId(),
                    user.getPrenom() + " " + user.getNom(),
                    user.getRole()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            Utilisateur user = authService.signup(
                request.getMail(),
                request.getPassword(),
                request.getNom(),
                request.getPrenom(),
                request.getTelephone(),
                request.getRole()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponse(user.getId(), user.getPrenom() + " " + user.getNom(), user.getRole()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(authService.getAllUsers());
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        Optional<Utilisateur> user = authService.getUserById(id);
        return user.isPresent()
            ? ResponseEntity.ok(user.get())
            : ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found"));
    }
    
    // DTOs (Data Transfer Objects)
    static class LoginRequest {
        private String mail;
        private String password;
        // Getters and Setters omitted for brevity but required
        public String getMail() { return mail; }
        public void setMail(String mail) { this.mail = mail; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    static class SignupRequest {
        private String mail;
        private String password;
        private String nom;
        private String prenom;
        private int telephone;
        private String role;
        // Getters and setters omitted for brevity but required
        public String getMail() { return mail; }
        public String getPassword() { return password; }
        public String getNom() { return nom; }
        public String getPrenom() { return prenom; }
        public int getTelephone() { return telephone; }
        public String getRole() { return role; }
        // Setters omitted for brevity
    }
    
    static class LoginResponse {
        private int id;
        private String name;
        private String role;
        
        public LoginResponse(int id, String name, String role) {
            this.id = id;
            this.name = name;
            this.role = role;
        }
        // Getters omitted for brevity but required
        public int getId() { return id; }
        public String getName() { return name; }
        public String getRole() { return role; }
    }
}