package com.urbanwaste.service;

import com.urbanwaste.model.*;
import com.urbanwaste.util.XMLHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct; 
import jakarta.xml.bind.JAXBException; 
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AuthService {
    
    private static final String USERS_FILE = "utilisateurs.xml";
    private static final String USERS_XSD = "utilisateurs.xsd";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    /**
     * Initialize default users on startup
     */
    @PostConstruct
    public void init() {
        if (!xmlHandler.fileExists(USERS_FILE)) {
            initializeDefaultUsers();
        } else {
            // Load existing users and set counter
            try {
                List<Utilisateur> users = getAllUsers();
                if (!users.isEmpty()) {
                    // Find the highest existing ID to ensure new users don't get duplicate IDs
                    int maxId = users.stream().mapToInt(Utilisateur::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing users: " + e.getMessage());
            }
        }
    }
    
    /**
     * Login with username (mail) and password
     */
    public Optional<Utilisateur> login(String mail, String password) {
        try {
            List<Utilisateur> users = getAllUsers();
            return users.stream()
                .filter(u -> u.getMail().equals(mail) && 
                            u.getPassword() != null && 
                            u.getPassword().equals(password))
                .findFirst();
        } catch (JAXBException e) {
            throw new RuntimeException("Failed to authenticate user", e);
        }
    }
    
    /**
     * Register new user
     */
    public Utilisateur signup(String mail, String password, String nom, String prenom, 
                            int telephone, String role) {
        try {
            // 1. Load current user data
            UtilisateursWrapper wrapper = xmlHandler.loadFromXML(USERS_FILE, UtilisateursWrapper.class);
            List<Utilisateur> users = wrapper.getUtilisateurs();
            
            // Check if mail already exists
            boolean exists = users.stream().anyMatch(u -> u.getMail().equals(mail));
            if (exists) {
                throw new IllegalArgumentException("Email already registered");
            }
            
            // 2. Create new user instance based on role
            Utilisateur newUser = createUserByRole(role);
            newUser.setId(idCounter.getAndIncrement());
            newUser.setMail(mail);
            newUser.setPassword(password);
            newUser.setNom(nom);
            newUser.setPrenom(prenom);
            newUser.setTelephone(telephone);
            
            // 3. Add to list and save
            users.add(newUser);
            wrapper.setUtilisateurs(users);
            
            xmlHandler.saveToXML(wrapper, USERS_FILE);
            
            return newUser;
        } catch (JAXBException e) {
            throw new RuntimeException("Failed to register user", e);
        }
    }
    
    /**
     * Get user by ID
     */
    public Optional<Utilisateur> getUserById(int id) {
        try {
            List<Utilisateur> users = getAllUsers();
            return users.stream().filter(u -> u.getId() == id).findFirst();
        } catch (JAXBException e) {
            throw new RuntimeException("Failed to get user", e);
        }
    }
    
    /**
     * Get all users
     */
    public List<Utilisateur> getAllUsers() throws JAXBException {
        // Loads the list wrapper from the XML file
        UtilisateursWrapper wrapper = xmlHandler.loadFromXML(USERS_FILE, UtilisateursWrapper.class);
        return wrapper.getUtilisateurs();
    }
    
    /**
     * Get users by role
     */
    public List<Utilisateur> getUsersByRole(String role) throws JAXBException {
        return getAllUsers().stream()
            .filter(u -> role.equals(u.getRole()))
            .toList();
    }
    
    /**
     * Update user
     */
    public Optional<Utilisateur> updateUser(int id, Utilisateur updatedUser) {
        try {
            UtilisateursWrapper wrapper = xmlHandler.loadFromXML(USERS_FILE, UtilisateursWrapper.class);
            List<Utilisateur> users = wrapper.getUtilisateurs();
            
            Optional<Utilisateur> existing = users.stream()
                .filter(u -> u.getId() == id)
                .findFirst();
            
            if (existing.isEmpty()) {
                return Optional.empty();
            }
            
            // Remove the old version and add the updated version
            users.removeIf(u -> u.getId() == id);
            updatedUser.setId(id);
            users.add(updatedUser);
            
            wrapper.setUtilisateurs(users);
            xmlHandler.saveToXML(wrapper, USERS_FILE);
            
            return Optional.of(updatedUser);
        } catch (JAXBException e) {
            throw new RuntimeException("Failed to update user", e);
        }
    }
    
    /**
     * Delete user
     */
    public boolean deleteUser(int id) {
        try {
            UtilisateursWrapper wrapper = xmlHandler.loadFromXML(USERS_FILE, UtilisateursWrapper.class);
            List<Utilisateur> users = wrapper.getUtilisateurs();
            
            boolean removed = users.removeIf(u -> u.getId() == id);
            
            if (removed) {
                wrapper.setUtilisateurs(users);
                xmlHandler.saveToXML(wrapper, USERS_FILE);
            }
            
            return removed;
        } catch (JAXBException e) {
            throw new RuntimeException("Failed to delete user", e);
        }
    }
    
    /**
     * Create user instance based on role
     */
    private Utilisateur createUserByRole(String role) {
        return switch (role.toUpperCase()) {
            case "ADMIN" -> new Admin();
            case "EMPLOYE", "EMPLOYEE" -> new Employee();
            case "TECHNICIEN" -> new Technicien();
            case "SUPERVISEUR" -> new SuperviseurZone();
            default -> throw new IllegalArgumentException("Invalid role: " + role);
        };
    }
    
    /**
     * Initialize default users
     */
    private void initializeDefaultUsers() {
        UtilisateursWrapper wrapper = new UtilisateursWrapper();
        List<Utilisateur> defaultUsers = List.of(
            createDefaultUser("ADMIN", "admin@ecoville.tn", "1234", "Admin", "Municipal", 20123456),
            createDefaultUser("SUPERVISEUR", "superviseur@ecoville.tn", "1234", "Superviseur", "Général", 20987654),
            createDefaultUser("TECHNICIEN", "technicien@ecoville.tn", "1234", "Jean", "Technicien", 21234567),
            createDefaultUser("EMPLOYE", "employe@ecoville.tn", "1234", "Ahmed", "Employé", 22345678)
        );
        
        wrapper.setUtilisateurs(new java.util.ArrayList<>(defaultUsers));
        
        try {
            xmlHandler.saveToXML(wrapper, USERS_FILE);
            System.out.println("✓ Default users initialized successfully");
        } catch (JAXBException e) {
            throw new RuntimeException("Failed to initialize default users", e);
        }
    }
    
    /**
     * Helper to create default user
     */
    private Utilisateur createDefaultUser(String role, String mail, String password, 
                                        String nom, String prenom, int telephone) {
        Utilisateur user = createUserByRole(role);
        user.setId(idCounter.getAndIncrement());
        user.setMail(mail);
        user.setPassword(password);
        user.setNom(nom);
        user.setPrenom(prenom);
        user.setTelephone(telephone);
        return user;
    }
}