package com.urbanwaste.service;

import com.urbanwaste.model.Utilisateur; // Assuming the base class or subclass is named Utilisateur/Employe
import com.urbanwaste.model.Employee; // Import Employee class
import com.urbanwaste.model.UtilisateursWrapper; // For utilisateurs.xml (all users)
import com.urbanwaste.model.XmlList; // For employees.xml (employees only)
import com.urbanwaste.util.XMLHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.xml.bind.JAXBException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    
    private static final String EMPLOYEES_FILE = "employees.xml";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(EMPLOYEES_FILE)) {
            try {
                List<Utilisateur> users = getAllEmployees();
                if (!users.isEmpty()) {
                    // Assuming Utilisateur has an getId() method
                    int maxId = users.stream().mapToInt(Utilisateur::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing employees: " + e.getMessage());
            }
        }
    }
    
    /**
     * Get all employees
     */
    @SuppressWarnings("unchecked")
    public List<Utilisateur> getAllEmployees() throws JAXBException {
        // Try to load from employees.xml first
        try {
            XmlList<?> employeesList = xmlHandler.loadFromXML(EMPLOYEES_FILE, XmlList.class);
            if (employeesList != null && employeesList.getItems() != null && !employeesList.getItems().isEmpty()) {
                // Convert items to Employee list
                List<Employee> employees = new ArrayList<>();
                for (Object item : employeesList.getItems()) {
                    if (item instanceof Employee) {
                        employees.add((Employee) item);
                    }
                }
                return new ArrayList<>(employees);
            }
        } catch (Exception e) {
            System.out.println("Could not load from employees.xml, trying utilisateurs.xml: " + e.getMessage());
        }
        
        // Fallback to utilisateurs.xml (for backward compatibility)
        UtilisateursWrapper wrapper = xmlHandler.loadFromXML("utilisateurs.xml", UtilisateursWrapper.class);
        if (wrapper == null || wrapper.getUtilisateurs() == null) {
            return new ArrayList<>();
        }
        // Filter to only return employees
        return wrapper.getUtilisateurs().stream()
            .filter(u -> "EMPLOYE".equals(u.getRole()) || u instanceof com.urbanwaste.model.Employee)
            .collect(Collectors.toList());
    }
    
    /**
     * Get employee by ID
     */
    public Optional<Utilisateur> getEmployeeById(int id) throws JAXBException {
        return getAllEmployees().stream()
            .filter(u -> u.getId() == id)
            .findFirst();
    }
    
    /**
     * Create new employee
     */
    @SuppressWarnings("unchecked")
    public Utilisateur createEmployee(Utilisateur user) throws JAXBException {
        // Load existing employees from employees.xml
        XmlList<?> employeesList = null;
        List<Employee> employees = new ArrayList<>();
        
        try {
            employeesList = xmlHandler.loadFromXML(EMPLOYEES_FILE, XmlList.class);
            if (employeesList != null && employeesList.getItems() != null) {
                // Convert items to Employee list
                for (Object item : employeesList.getItems()) {
                    if (item instanceof Employee) {
                        employees.add((Employee) item);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Could not load employees.xml, creating new list: " + e.getMessage());
        }
        
        // IMPORTANT: Convert Utilisateur to Employee instance
        Employee employee = new Employee();
        employee.setId(idCounter.getAndIncrement());
        employee.setMail(user.getMail());
        employee.setNom(user.getNom());
        employee.setPrenom(user.getPrenom());
        employee.setTelephone(user.getTelephone());
        employee.setPassword(user.getPassword());
        employee.setRole(user.getRole() != null ? user.getRole() : "EMPLOYE");
        // Set disponible if provided (from frontend)
        if (user instanceof Employee) {
            employee.setDisponible(((Employee) user).isDisponible());
        } else {
            employee.setDisponible(true); // Default to available
        }
        
        // Add the new employee
        employees.add(employee);
        
        // Create new XmlList wrapper
        XmlList<Employee> newEmployeesList = new XmlList<>(employees);
        
        System.out.println("=== Saving Employee to employees.xml ===");
        System.out.println("Employee ID: " + employee.getId());
        System.out.println("Employee Name: " + employee.getPrenom() + " " + employee.getNom());
        System.out.println("Total employees: " + employees.size());
        
        try {
            // Save to employees.xml
            xmlHandler.saveToXML(newEmployeesList, EMPLOYEES_FILE);
            System.out.println("✓ Employee saved successfully to XML file: " + EMPLOYEES_FILE);
            
            // Verify the file was actually written
            java.io.File file = new java.io.File("src/main/resources/data/" + EMPLOYEES_FILE);
            if (file.exists()) {
                System.out.println("✓ File exists at: " + file.getAbsolutePath());
                System.out.println("✓ File size: " + file.length() + " bytes");
            } else {
                System.err.println("✗ WARNING: File not found at expected location: " + file.getAbsolutePath());
            }
        } catch (JAXBException e) {
            System.err.println("✗ ERROR: Failed to save employee to XML: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("✗ ERROR: Unexpected error while saving: " + e.getMessage());
            e.printStackTrace();
            throw new JAXBException("Failed to save employee", e);
        }
        
        return employee;
    }
    
    /**
     * Update existing employee
     */
    @SuppressWarnings("unchecked")
    public Optional<Utilisateur> updateEmployee(int id, Utilisateur updatedUser) throws JAXBException {
        // Load existing employees from employees.xml
        XmlList<?> employeesList = null;
        List<Employee> employees = new ArrayList<>();
        
        try {
            employeesList = xmlHandler.loadFromXML(EMPLOYEES_FILE, XmlList.class);
            if (employeesList != null && employeesList.getItems() != null) {
                for (Object item : employeesList.getItems()) {
                    if (item instanceof Employee) {
                        employees.add((Employee) item);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Could not load employees.xml: " + e.getMessage());
        }
        
        Optional<Employee> existing = employees.stream()
            .filter(e -> e.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        
        // Convert updatedUser to Employee
        Employee updatedEmployee = new Employee();
        updatedEmployee.setId(id);
        updatedEmployee.setMail(updatedUser.getMail());
        updatedEmployee.setNom(updatedUser.getNom());
        updatedEmployee.setPrenom(updatedUser.getPrenom());
        updatedEmployee.setTelephone(updatedUser.getTelephone());
        updatedEmployee.setPassword(updatedUser.getPassword());
        updatedEmployee.setRole(updatedUser.getRole() != null ? updatedUser.getRole() : "EMPLOYE");
        if (updatedUser instanceof Employee) {
            updatedEmployee.setDisponible(((Employee) updatedUser).isDisponible());
        } else {
            updatedEmployee.setDisponible(existing.get().isDisponible());
        }
        
        employees.removeIf(e -> e.getId() == id);
        employees.add(updatedEmployee);
        
        XmlList<Employee> newEmployeesList = new XmlList<>(employees);
        xmlHandler.saveToXML(newEmployeesList, EMPLOYEES_FILE);
        
        return Optional.of(updatedEmployee);
    }
    
    /**
     * Delete employee
     */
    @SuppressWarnings("unchecked")
    public boolean deleteEmployee(int id) throws JAXBException {
        // Load existing employees from employees.xml
        XmlList<?> employeesList = null;
        List<Employee> employees = new ArrayList<>();
        
        try {
            employeesList = xmlHandler.loadFromXML(EMPLOYEES_FILE, XmlList.class);
            if (employeesList != null && employeesList.getItems() != null) {
                for (Object item : employeesList.getItems()) {
                    if (item instanceof Employee) {
                        employees.add((Employee) item);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Could not load employees.xml: " + e.getMessage());
        }
        
        boolean removed = employees.removeIf(e -> e.getId() == id);
        
        if (removed) {
            XmlList<Employee> newEmployeesList = new XmlList<>(employees);
            xmlHandler.saveToXML(newEmployeesList, EMPLOYEES_FILE);
        }
        
        return removed;
    }
    
    /**
     * Search employee by name (chercherParnom)
     */
    public List<Utilisateur> searchByName(String name) throws JAXBException {
        String lowerCaseName = name.toLowerCase();
        return getAllEmployees().stream()
            // Assuming Utilisateur has getNom() and getPrenom() methods
            .filter(u -> (u.getNom() != null && u.getNom().toLowerCase().contains(lowerCaseName)) ||
                         (u.getPrenom() != null && u.getPrenom().toLowerCase().contains(lowerCaseName)))
            .collect(Collectors.toList());
    }
}