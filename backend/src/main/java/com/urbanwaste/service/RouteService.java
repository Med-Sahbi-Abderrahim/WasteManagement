package com.urbanwaste.service;

import com.urbanwaste.model.Tournee; // Assuming the route model is Tournee
import com.urbanwaste.model.TourneesWrapper; // Assuming you have this wrapper model
import com.urbanwaste.util.XMLHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.xml.bind.JAXBException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class RouteService {
    
    private static final String ROUTES_FILE = "tournees.xml";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(ROUTES_FILE)) {
            try {
                List<Tournee> routes = getAllRoutes();
                if (!routes.isEmpty()) {
                    // Assuming Tournee has an getId() method
                    int maxId = routes.stream().mapToInt(Tournee::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing routes: " + e.getMessage());
            }
        }
    }
    
    /**
     * Get all collection routes (Tournees)
     */
    public List<Tournee> getAllRoutes() throws JAXBException {
        // FIX: Replaces XmlList/XMLHandler.read()
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        // Ensure we always return a non-null list
        if (wrapper == null || wrapper.getTournees() == null) {
            return new ArrayList<>();
        }
        return wrapper.getTournees();
    }
    
    /**
     * Get route by ID
     */
    public Optional<Tournee> getRouteById(int id) throws JAXBException {
        return getAllRoutes().stream()
            .filter(t -> t.getId() == id)
            .findFirst();
    }
    
    /**
     * Create new route
     */
    public Tournee createRoute(Tournee route) throws JAXBException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        List<Tournee> routes = wrapper.getTournees();
        
        route.setId(idCounter.getAndIncrement());
        
        // Set default status if not provided
        if (route.getStatut() == null) {
            route.setStatut("PLANIFIEE");
        }
        
        routes.add(route);
        wrapper.setTournees(routes);
        
        xmlHandler.saveToXML(wrapper, ROUTES_FILE);
        
        return route;
    }
    
    /**
     * Update existing route
     */
    public Optional<Tournee> updateRoute(int id, Tournee updatedRoute) throws JAXBException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        List<Tournee> routes = wrapper.getTournees();
        
        Optional<Tournee> existing = routes.stream()
            .filter(t -> t.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        
        routes.removeIf(t -> t.getId() == id);
        updatedRoute.setId(id);
        routes.add(updatedRoute);
        
        wrapper.setTournees(routes);
        xmlHandler.saveToXML(wrapper, ROUTES_FILE);
        
        return Optional.of(updatedRoute);
    }
    
    /**
     * Delete route
     */
    public boolean deleteRoute(int id) throws JAXBException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        List<Tournee> routes = wrapper.getTournees();
        
        boolean removed = routes.removeIf(t -> t.getId() == id);
        
        if (removed) {
            wrapper.setTournees(routes);
            xmlHandler.saveToXML(wrapper, ROUTES_FILE);
        }
        
        return removed;
    }
}