package com.urbanwaste.controller;

import com.urbanwaste.model.Tournee; 
import com.urbanwaste.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.xml.bind.JAXBException; 
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class RouteController {
    
    @Autowired
    private RouteService routeService;

    /**
     * GET: Retrieve all routes (Tournees)
     */
    @GetMapping
    public ResponseEntity<?> getAllRoutes() {
        try {
            List<Tournee> routes = routeService.getAllRoutes();
            return ResponseEntity.ok(routes);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET: Retrieve route by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRouteById(@PathVariable int id) {
        try {
            Optional<Tournee> route = routeService.getRouteById(id);
            return route.isPresent()
                ? ResponseEntity.ok(route.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Route not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST: Create a new route
     */
    @PostMapping
    public ResponseEntity<?> createRoute(@RequestBody Tournee route) { 
        try {
            Tournee newRoute = routeService.createRoute(route);
            return ResponseEntity.status(HttpStatus.CREATED).body(newRoute);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT: Update an existing route
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable int id, @RequestBody Tournee route) { 
        try {
            Optional<Tournee> updatedRoute = routeService.updateRoute(id, route);
            return updatedRoute.isPresent()
                ? ResponseEntity.ok(updatedRoute.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Route not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE: Delete a route
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable int id) {
        try {
            boolean deleted = routeService.deleteRoute(id);
            return deleted
                ? ResponseEntity.ok(Map.of("message", "Route deleted successfully"))
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Route not found"));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}