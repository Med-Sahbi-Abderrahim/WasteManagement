package com.urbanwaste.service;

import com.urbanwaste.model.Utilisateur; // Assuming the base class or subclass is named Utilisateur/Employe
import com.urbanwaste.model.Employee; // Import Employee class
import com.urbanwaste.model.EmployeesWrapper; // For employees.xml (employees only)
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
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
     * Get all employees - loads ONLY from employees.xml
     */
    public List<Utilisateur> getAllEmployees() throws JAXBException {
        System.out.println("[EmployeeService] Loading employees from XML file: " + EMPLOYEES_FILE);
        EmployeesWrapper wrapper = xmlHandler.loadFromXML(EMPLOYEES_FILE, EmployeesWrapper.class);
        if (wrapper == null || wrapper.getEmployes() == null) {
            System.out.println("[EmployeeService] No employees found in XML file");
            return new ArrayList<>();
        }
        List<Utilisateur> employees = new ArrayList<>(wrapper.getEmployes());
        System.out.println("[EmployeeService] Loaded " + employees.size() + " employees from " + EMPLOYEES_FILE);
        return employees;
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
     * Create new employee - saves ONLY to employees.xml
     */
    public Utilisateur createEmployee(Utilisateur user) throws JAXBException, XMLValidationException {
        System.out.println("[EmployeeService] Creating employee - loading from XML: " + EMPLOYEES_FILE);
        // Load existing employees from employees.xml
        EmployeesWrapper wrapper = xmlHandler.loadFromXML(EMPLOYEES_FILE, EmployeesWrapper.class);
        List<Employee> employees = wrapper != null && wrapper.getEmployes() != null 
            ? new ArrayList<>(wrapper.getEmployes()) 
            : new ArrayList<>();
        
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
        
        // Create new EmployeesWrapper
        EmployeesWrapper newWrapper = new EmployeesWrapper();
        newWrapper.setEmployes(employees);
        
        System.out.println("[EmployeeService] Saving employee to XML: " + EMPLOYEES_FILE);
        System.out.println("[EmployeeService] Employee ID: " + employee.getId());
        System.out.println("[EmployeeService] Employee Name: " + employee.getPrenom() + " " + employee.getNom());
        System.out.println("[EmployeeService] Total employees: " + employees.size());
        
        xmlHandler.saveToXML(newWrapper, EMPLOYEES_FILE);
        System.out.println("[EmployeeService] ✓ Employee saved successfully to XML file: " + EMPLOYEES_FILE);
        
        return employee;
    }
    
    /**
     * Update existing employee - saves ONLY to employees.xml
     */
    public Optional<Utilisateur> updateEmployee(int id, Utilisateur updatedUser) throws JAXBException, XMLValidationException {
        System.out.println("[EmployeeService] Updating employee ID " + id + " - loading from XML: " + EMPLOYEES_FILE);
        // Load existing employees from employees.xml
        EmployeesWrapper wrapper = xmlHandler.loadFromXML(EMPLOYEES_FILE, EmployeesWrapper.class);
        List<Employee> employees = wrapper != null && wrapper.getEmployes() != null 
            ? new ArrayList<>(wrapper.getEmployes()) 
            : new ArrayList<>();
        
        Optional<Employee> existing = employees.stream()
            .filter(e -> e.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            System.out.println("[EmployeeService] Employee ID " + id + " not found in XML");
            return Optional.empty();
        }
        
        // Smart merge: use incoming value if provided, otherwise keep existing
        Employee existingEmployee = existing.get();
        Employee updatedEmployee = new Employee();
        updatedEmployee.setId(id);
        updatedEmployee.setMail(updatedUser.getMail() != null ? updatedUser.getMail() : existingEmployee.getMail());
        updatedEmployee.setNom(updatedUser.getNom() != null ? updatedUser.getNom() : existingEmployee.getNom());
        updatedEmployee.setPrenom(updatedUser.getPrenom() != null ? updatedUser.getPrenom() : existingEmployee.getPrenom());
        updatedEmployee.setTelephone(updatedUser.getTelephone() != 0 ? updatedUser.getTelephone() : existingEmployee.getTelephone());
        updatedEmployee.setPassword(updatedUser.getPassword() != null ? updatedUser.getPassword() : existingEmployee.getPassword());
        updatedEmployee.setRole(updatedUser.getRole() != null ? updatedUser.getRole() : existingEmployee.getRole() != null ? existingEmployee.getRole() : "EMPLOYE");
        if (updatedUser instanceof Employee) {
            updatedEmployee.setDisponible(((Employee) updatedUser).isDisponible());
        } else {
            updatedEmployee.setDisponible(existingEmployee.isDisponible());
        }
        
        employees.removeIf(e -> e.getId() == id);
        employees.add(updatedEmployee);
        
        EmployeesWrapper newWrapper = new EmployeesWrapper();
        newWrapper.setEmployes(employees);
        System.out.println("[EmployeeService] Saving updated employee to XML: " + EMPLOYEES_FILE);
        xmlHandler.saveToXML(newWrapper, EMPLOYEES_FILE);
        
        return Optional.of(updatedEmployee);
    }
    
    /**
     * Delete employee - saves ONLY to employees.xml
     */
    public boolean deleteEmployee(int id) throws JAXBException, XMLValidationException {
        System.out.println("[EmployeeService] Deleting employee ID " + id + " - loading from XML: " + EMPLOYEES_FILE);
        // Load existing employees from employees.xml
        EmployeesWrapper wrapper = xmlHandler.loadFromXML(EMPLOYEES_FILE, EmployeesWrapper.class);
        List<Employee> employees = wrapper != null && wrapper.getEmployes() != null 
            ? new ArrayList<>(wrapper.getEmployes()) 
            : new ArrayList<>();
        
        boolean removed = employees.removeIf(e -> e.getId() == id);
        
        if (removed) {
            EmployeesWrapper newWrapper = new EmployeesWrapper();
            newWrapper.setEmployes(employees);
            System.out.println("[EmployeeService] Saving updated employees list to XML: " + EMPLOYEES_FILE);
            xmlHandler.saveToXML(newWrapper, EMPLOYEES_FILE);
        } else {
            System.out.println("[EmployeeService] Employee ID " + id + " not found in XML");
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