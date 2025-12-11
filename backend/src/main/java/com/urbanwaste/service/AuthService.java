package com.urbanwaste.service;

import com.urbanwaste.model.*;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct; 
import jakarta.xml.bind.JAXBException; 
import java.util.ArrayList;
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
     * Chain of Responsibility: Check admins -> superviseurs -> techniciens -> employees
     */
    public Utilisateur login(String mail, String password) {
        System.out.println("[AuthService] Login attempt for email: " + mail);
        
        try {
            // Step 1: Check admins.xml
            System.out.println("[AuthService] Step 1: Checking Admins...");
            if (xmlHandler.fileExists("admins.xml")) {
                try {
                    AdminsWrapper adminsWrapper = xmlHandler.loadFromXML("admins.xml", AdminsWrapper.class);
                    if (adminsWrapper != null && adminsWrapper.getAdmins() != null && !adminsWrapper.getAdmins().isEmpty()) {
                        System.out.println("[AuthService] Found " + adminsWrapper.getAdmins().size() + " admins");
                        Utilisateur admin = adminsWrapper.getAdmins().stream()
                            .filter(u -> {
                                if (u == null) return false;
                                boolean mailMatch = u.getMail() != null && u.getMail().equals(mail);
                                if (!mailMatch) return false;
                                
                                String storedPassword = u.getMotDePasse();
                                if (storedPassword == null || storedPassword.isEmpty()) {
                                    storedPassword = u.getPassword();
                                }
                                
                                System.out.println("[AuthService] Admin mail match found. Stored password (motDePasse): '" + u.getMotDePasse() + "', Stored password (password): '" + u.getPassword() + "', Final: '" + storedPassword + "', Input: '" + password + "'");
                                
                                boolean passwordMatch = storedPassword != null && storedPassword.equals(password);
                                System.out.println("[AuthService] Password match: " + passwordMatch);
                                return passwordMatch;
                            })
                            .findFirst()
                            .orElse(null);
                        if (admin != null) {
                            System.out.println("[AuthService] ✓ Found in Admins - ID: " + admin.getId());
                            admin.setRole("ADMIN");
                            return admin;
                        }
                    } else {
                        System.out.println("[AuthService] AdminsWrapper is null or empty");
                    }
                } catch (Exception e) {
                    System.err.println("[AuthService] Error loading admins.xml: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("[AuthService] admins.xml file does not exist");
            }
            
            // Step 2: Check superviseurs.xml
            System.out.println("[AuthService] Step 2: Checking Superviseurs...");
            if (xmlHandler.fileExists("superviseurs.xml")) {
                try {
                    SuperviseursWrapper superviseursWrapper = xmlHandler.loadFromXML("superviseurs.xml", SuperviseursWrapper.class);
                    if (superviseursWrapper != null && superviseursWrapper.getSuperviseurs() != null && !superviseursWrapper.getSuperviseurs().isEmpty()) {
                        System.out.println("[AuthService] Found " + superviseursWrapper.getSuperviseurs().size() + " superviseurs");
                        Utilisateur superviseur = superviseursWrapper.getSuperviseurs().stream()
                            .filter(u -> {
                                if (u == null) return false;
                                boolean mailMatch = u.getMail() != null && u.getMail().equals(mail);
                                if (!mailMatch) return false;
                                
                                String storedPassword = u.getMotDePasse();
                                if (storedPassword == null || storedPassword.isEmpty()) {
                                    storedPassword = u.getPassword();
                                }
                                
                                System.out.println("[AuthService] Superviseur mail match found. Stored password (motDePasse): '" + u.getMotDePasse() + "', Stored password (password): '" + u.getPassword() + "', Final: '" + storedPassword + "', Input: '" + password + "'");
                                
                                boolean passwordMatch = storedPassword != null && storedPassword.equals(password);
                                System.out.println("[AuthService] Password match: " + passwordMatch);
                                return passwordMatch;
                            })
                            .findFirst()
                            .orElse(null);
                        if (superviseur != null) {
                            System.out.println("[AuthService] ✓ Found in Superviseurs - ID: " + superviseur.getId());
                            superviseur.setRole("SUPERVISEUR");
                            return superviseur;
                        }
                    } else {
                        System.out.println("[AuthService] SuperviseursWrapper is null or empty");
                    }
                } catch (Exception e) {
                    System.err.println("[AuthService] Error loading superviseurs.xml: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("[AuthService] superviseurs.xml file does not exist");
            }
            
            // Step 3: Check techiciens.xml (note: filename has one 'n')
            System.out.println("[AuthService] Step 3: Checking Techniciens...");
            if (xmlHandler.fileExists("techiciens.xml")) {
                try {
                    TechniciensWrapper techniciensWrapper = xmlHandler.loadFromXML("techiciens.xml", TechniciensWrapper.class);
                    if (techniciensWrapper != null && techniciensWrapper.getTechniciens() != null && !techniciensWrapper.getTechniciens().isEmpty()) {
                        System.out.println("[AuthService] Found " + techniciensWrapper.getTechniciens().size() + " techniciens");
                        Utilisateur technicien = techniciensWrapper.getTechniciens().stream()
                            .filter(u -> {
                                if (u == null) return false;
                                boolean mailMatch = u.getMail() != null && u.getMail().equals(mail);
                                if (!mailMatch) return false;
                                
                                String storedPassword = u.getMotDePasse();
                                if (storedPassword == null || storedPassword.isEmpty()) {
                                    storedPassword = u.getPassword();
                                }
                                
                                System.out.println("[AuthService] Technicien mail match found. Stored password (motDePasse): '" + u.getMotDePasse() + "', Stored password (password): '" + u.getPassword() + "', Final: '" + storedPassword + "', Input: '" + password + "'");
                                
                                boolean passwordMatch = storedPassword != null && storedPassword.equals(password);
                                System.out.println("[AuthService] Password match: " + passwordMatch);
                                return passwordMatch;
                            })
                            .findFirst()
                            .orElse(null);
                        if (technicien != null) {
                            System.out.println("[AuthService] ✓ Found in Techniciens - ID: " + technicien.getId());
                            technicien.setRole("TECHNICIEN");
                            return technicien;
                        }
                    } else {
                        System.out.println("[AuthService] TechniciensWrapper is null or empty");
                    }
                } catch (Exception e) {
                    System.err.println("[AuthService] Error loading techiciens.xml: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("[AuthService] techiciens.xml file does not exist");
            }
            
            // Step 4: Check employees.xml
            System.out.println("[AuthService] Step 4: Checking Employees...");
            if (xmlHandler.fileExists("employees.xml")) {
                try {
                    EmployeesWrapper employeesWrapper = xmlHandler.loadFromXML("employees.xml", EmployeesWrapper.class);
                    if (employeesWrapper != null && employeesWrapper.getEmployes() != null && !employeesWrapper.getEmployes().isEmpty()) {
                        System.out.println("[AuthService] Found " + employeesWrapper.getEmployes().size() + " employees");
                        Utilisateur employe = employeesWrapper.getEmployes().stream()
                            .filter(u -> {
                                if (u == null) return false;
                                boolean mailMatch = u.getMail() != null && u.getMail().equals(mail);
                                if (!mailMatch) return false;
                                
                                String storedPassword = u.getMotDePasse();
                                if (storedPassword == null || storedPassword.isEmpty()) {
                                    storedPassword = u.getPassword();
                                }
                                
                                System.out.println("[AuthService] Employee mail match found. Stored password (motDePasse): '" + u.getMotDePasse() + "', Stored password (password): '" + u.getPassword() + "', Final: '" + storedPassword + "', Input: '" + password + "'");
                                
                                boolean passwordMatch = storedPassword != null && storedPassword.equals(password);
                                System.out.println("[AuthService] Password match: " + passwordMatch);
                                return passwordMatch;
                            })
                            .findFirst()
                            .orElse(null);
                        if (employe != null) {
                            // Set role based on employee type (EMPLOYE or CHAUFFEUR)
                            String role = employe.getRole();
                            if (role == null || role.isEmpty()) {
                                employe.setRole("EMPLOYE");
                            }
                            System.out.println("[AuthService] ✓ Found in Employees - ID: " + employe.getId() + ", Role: " + employe.getRole());
                            return employe;
                        }
                    } else {
                        System.out.println("[AuthService] EmployeesWrapper is null or empty");
                    }
                } catch (Exception e) {
                    System.err.println("[AuthService] Error loading employees.xml: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("[AuthService] employees.xml file does not exist");
            }
            
            // Step 5: No match found
            System.out.println("[AuthService] ✗ No match found in any file");
            throw new RuntimeException("Identifiants incorrects");
            
        } catch (RuntimeException e) {
            // Re-throw authentication failures
            if (e.getMessage() != null && e.getMessage().contains("Identifiants incorrects")) {
                throw e;
            }
            System.err.println("[AuthService] RuntimeException during login: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to authenticate user: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("[AuthService] Unexpected exception during login: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to authenticate user: " + e.getMessage(), e);
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
        } catch (JAXBException | XMLValidationException e) {
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
        } catch (JAXBException | XMLValidationException e) {
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
        } catch (JAXBException | XMLValidationException e) {
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
        } catch (JAXBException | XMLValidationException e) {
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