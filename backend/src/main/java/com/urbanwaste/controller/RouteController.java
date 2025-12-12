package com.urbanwaste.controller;

import com.urbanwaste.model.Tournee; 
import com.urbanwaste.model.TourneesWrapper;
import com.urbanwaste.service.RouteService;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.xml.bind.JAXBException; 
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class RouteController {
    
    @Autowired
    private RouteService routeService;
    
    @Autowired
    private XMLHandler xmlHandler;

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
            System.out.println("[RouteController] Creating route with employee ID: " + 
                             (route.getEmploye() != null ? route.getEmploye().getId() : "null") +
                             ", vehicle ID: " + (route.getVehicle() != null ? route.getVehicle().getId() : "null") +
                             ", points count: " + (route.getPointsCollecte() != null ? route.getPointsCollecte().size() : 0));
            
            Tournee newRoute = routeService.createRoute(route);
            return ResponseEntity.status(HttpStatus.CREATED).body(newRoute);
        } catch (IllegalArgumentException e) {
            System.err.println("[RouteController] Validation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (XMLValidationException e) {
            System.err.println("[RouteController] XML validation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "XML validation failed", "details", e.getMessage()));
        } catch (JAXBException e) {
            System.err.println("[RouteController] JAXB error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "XML processing error: " + e.getMessage(), 
                             "cause", e.getCause() != null ? e.getCause().getMessage() : "Unknown"));
        } catch (Exception e) {
            System.err.println("[RouteController] Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()),
                             "type", e.getClass().getSimpleName(),
                             "cause", e.getCause() != null ? e.getCause().getMessage() : "Unknown"));
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
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "XML validation failed", "details", e.getMessage()));
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
        } catch (XMLValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "XML validation failed", "details", e.getMessage()));
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET: Export all routes as XML (Interoperability)
     * Returns XML file for external system integration
     */
    @GetMapping("/export")
    public ResponseEntity<?> exportRoutes() {
        try {
            TourneesWrapper wrapper = routeService.getAllRoutesWrapper();
            String xmlContent = xmlHandler.marshalToString(wrapper);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_XML);
            headers.setContentDispositionFormData("attachment", "rapport_tournees.xml");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(xmlContent);
        } catch (JAXBException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to export routes: " + e.getMessage()));
        }
    }
    
    /**
     * POST: Import routes from XML file (Interoperability)
     * Accepts MultipartFile XML, validates against XSD, and merges with existing data
     */
    @PostMapping("/import")
    public ResponseEntity<?> importRoutes(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "File is empty"));
        }
        
        try {
            // Clear schema cache to ensure we're using the latest XSD
            xmlHandler.clearSchemaCache("tournees.xsd");
            
            // Log file info for debugging
            System.out.println("[RouteController] Importing file: " + file.getOriginalFilename() + 
                             ", size: " + file.getSize() + " bytes");
            
            // Unmarshal XML from InputStream with XSD validation
            TourneesWrapper importedWrapper = xmlHandler.unmarshalFromStream(
                file.getInputStream(), 
                TourneesWrapper.class, 
                "tournees.xsd"
            );
            
            if (importedWrapper == null || importedWrapper.getTournees() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid XML structure"));
            }
            
            // Merge with existing data (avoiding duplicates by ID)
            int importedCount = routeService.mergeRoutes(importedWrapper.getTournees());
            
            return ResponseEntity.ok(Map.of(
                "message", "Routes imported successfully",
                "imported", importedCount,
                "total", importedWrapper.getTournees().size()
            ));
        } catch (SAXException e) {
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName() + ": " + (e.getLocalizedMessage() != null ? e.getLocalizedMessage() : "XML validation failed");
            }
            // Add helpful message for common validation errors
            if (errorMsg.contains("capacite") && errorMsg.contains("statut")) {
                errorMsg += ". Note: In 'vehicle' elements within tours, the order is strict: id, capacite, disponibilite, immatriculation, typeVehicule, statut, etat, conducteur. Check that 'capacite' appears before 'typeVehicule' and not after.";
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "XML validation failed: " + errorMsg));
        } catch (JAXBException e) {
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName() + ": " + (e.getCause() != null ? e.getCause().getMessage() : "XML parsing failed");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "XML parsing failed: " + errorMsg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to import routes: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName())));
        }
    }
}