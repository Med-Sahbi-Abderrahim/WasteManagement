package com.urbanwaste.controller;

import com.urbanwaste.model.Utilisateur; // <--- FIX 1: Using the correct model class name
import com.urbanwaste.service.EmployeeService;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.xml.bind.JAXBException; // <--- FIX 2: Using jakarta import
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EmployeeController {
    
    @Autowired
    private EmployeeService employeeService;

    /**
     * GET: Retrieve all employees
     */
    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            // FIX 3: Calling the correct service method
            List<Utilisateur> employees = employeeService.getAllEmployees(); 
            return ResponseEntity.ok(employees);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET: Retrieve employee by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        try {
            Optional<Utilisateur> employee = employeeService.getEmployeeById(id);
            return employee.isPresent()
                ? ResponseEntity.ok(employee.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Employee not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST: Add a new employee
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody Utilisateur employee) { 
        try {
            Utilisateur newEmployee = employeeService.createEmployee(employee);
            return ResponseEntity.status(HttpStatus.CREATED).body(newEmployee);
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT: Update an existing employee
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Utilisateur employee) { 
        try {
            Optional<Utilisateur> updatedEmployee = employeeService.updateEmployee(id, employee);
            return updatedEmployee.isPresent()
                ? ResponseEntity.ok(updatedEmployee.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Employee not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE: Delete an employee
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            boolean deleted = employeeService.deleteEmployee(id);
            return deleted
                ? ResponseEntity.ok(Map.of("message", "Employee deleted successfully"))
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Employee not found"));
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET: Search employees by name (was chercherParnom)
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchByName(@RequestParam String name) {
        try {
            // FIX 3: Calling the correct service method
            List<Utilisateur> employees = employeeService.searchByName(name);
            return ResponseEntity.ok(employees);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}