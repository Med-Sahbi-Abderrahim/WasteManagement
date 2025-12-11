package com.urbanwaste.service;

import com.urbanwaste.model.Tournee; // Assuming the route model is Tournee
import com.urbanwaste.model.TourneesWrapper; // Assuming you have this wrapper model
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.xml.bind.JAXBException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
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
     * Create new route with default values for mandatory fields
     */
    public Tournee createRoute(Tournee route) throws JAXBException, XMLValidationException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        if (wrapper == null) {
            wrapper = new TourneesWrapper();
        }
        List<Tournee> routes = wrapper.getTournees();
        if (routes == null) {
            routes = new ArrayList<>();
        }
        
        route.setId(idCounter.getAndIncrement());
        
        // Set default values for mandatory fields if missing
        if (route.getDatePlanifiee() == null) {
            // Convert LocalDate to Date
            LocalDate today = LocalDate.now();
            route.setDatePlanifiee(Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant()));
        }
        
        if (route.getStatut() == null || route.getStatut().trim().isEmpty()) {
            route.setStatut("PLANIFIEE");
        }
        
        // Ensure employe is not null and has required fields (required by XSD)
        if (route.getEmploye() == null) {
            throw new IllegalArgumentException("Employee (employe) is required for tour creation");
        }
        if (route.getEmploye().getId() == 0) {
            throw new IllegalArgumentException("Employee must have a valid id");
        }
        if (route.getEmploye().getNom() == null || route.getEmploye().getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Employee must have a nom (name)");
        }
        if (route.getEmploye().getPrenom() == null || route.getEmploye().getPrenom().trim().isEmpty()) {
            throw new IllegalArgumentException("Employee must have a prenom (first name)");
        }
        
        // Ensure vehicle is not null and has required fields (required by XSD)
        if (route.getVehicle() == null) {
            throw new IllegalArgumentException("Vehicle is required for tour creation");
        }
        if (route.getVehicle().getId() == 0) {
            throw new IllegalArgumentException("Vehicle must have a valid id");
        }
        if (route.getVehicle().getImmatriculation() == null || route.getVehicle().getImmatriculation().trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle must have an immatriculation");
        }
        
        // Ensure pointsCollecte is not null and not empty (required by XSD - minOccurs defaults to 1)
        if (route.getPointsCollecte() == null || route.getPointsCollecte().isEmpty()) {
            throw new IllegalArgumentException("At least one collection point (pointsCollecte) is required for tour creation");
        }
        
        // Validate that all points have required fields (id and localisation per XSD)
        for (com.urbanwaste.model.PointCollecte point : route.getPointsCollecte()) {
            if (point.getId() == 0) {
                throw new IllegalArgumentException("All collection points must have a valid id");
            }
            if (point.getLocalisation() == null || point.getLocalisation().trim().isEmpty()) {
                throw new IllegalArgumentException("All collection points must have a localisation");
            }
        }
        
        routes.add(route);
        wrapper.setTournees(routes);
        
        xmlHandler.saveToXML(wrapper, ROUTES_FILE);
        
        return route;
    }
    
    /**
     * Update existing route with smart merge (preserves existing data for null fields)
     */
    public Optional<Tournee> updateRoute(int id, Tournee updatedRoute) throws JAXBException, XMLValidationException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        if (wrapper == null) {
            wrapper = new TourneesWrapper();
        }
        List<Tournee> routes = wrapper.getTournees();
        if (routes == null) {
            routes = new ArrayList<>();
        }
        
        Optional<Tournee> existingOpt = routes.stream()
            .filter(t -> t.getId() == id)
            .findFirst();
        
        if (existingOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Tournee existing = existingOpt.get();
        
        // Smart merge: copy existing values for null fields in updatedRoute
        // Handle datePlanifiee - if null or invalid, use existing
        if (updatedRoute.getDatePlanifiee() == null) {
            updatedRoute.setDatePlanifiee(existing.getDatePlanifiee());
        }
        
        // Handle statut
        if (updatedRoute.getStatut() == null || updatedRoute.getStatut().trim().isEmpty()) {
            updatedRoute.setStatut(existing.getStatut());
        }
        
        // Handle employe - check for null or empty object (id == 0)
        if (updatedRoute.getEmploye() == null || 
            (updatedRoute.getEmploye().getId() == 0 && 
             (updatedRoute.getEmploye().getNom() == null || updatedRoute.getEmploye().getNom().isEmpty()))) {
            updatedRoute.setEmploye(existing.getEmploye());
        }
        
        // Handle vehicle - check for null or empty object (id == 0)
        if (updatedRoute.getVehicle() == null || 
            (updatedRoute.getVehicle().getId() == 0 && 
             (updatedRoute.getVehicle().getImmatriculation() == null || updatedRoute.getVehicle().getImmatriculation().isEmpty()))) {
            updatedRoute.setVehicle(existing.getVehicle());
        }
        
        // Handle pointsCollecte - XSD requires at least one point (minOccurs defaults to 1)
        // If null or empty, use existing points
        if (updatedRoute.getPointsCollecte() == null || updatedRoute.getPointsCollecte().isEmpty()) {
            updatedRoute.setPointsCollecte(existing.getPointsCollecte());
        }
        
        // Preserve optional fields if not provided
        if (updatedRoute.getHeureDebut() == null) {
            updatedRoute.setHeureDebut(existing.getHeureDebut());
        }
        
        if (updatedRoute.getHeureFin() == null) {
            updatedRoute.setHeureFin(existing.getHeureFin());
        }
        
        if (updatedRoute.getDistanceKm() == 0 && existing.getDistanceKm() != 0) {
            updatedRoute.setDistanceKm(existing.getDistanceKm());
        }
        
        // Set the ID and replace
        updatedRoute.setId(id);
        routes.removeIf(t -> t.getId() == id);
        routes.add(updatedRoute);
        
        wrapper.setTournees(routes);
        xmlHandler.saveToXML(wrapper, ROUTES_FILE);
        
        return Optional.of(updatedRoute);
    }
    
    /**
     * Delete route
     */
    public boolean deleteRoute(int id) throws JAXBException, XMLValidationException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        if (wrapper == null) {
            wrapper = new TourneesWrapper();
        }
        List<Tournee> routes = wrapper.getTournees();
        if (routes == null) {
            routes = new ArrayList<>();
        }
        
        boolean removed = routes.removeIf(t -> t.getId() == id);
        
        if (removed) {
            wrapper.setTournees(routes);
            xmlHandler.saveToXML(wrapper, ROUTES_FILE);
        }
        
        return removed;
    }
    
    /**
     * Get collection schedules for a zone
     * Returns recurring weekly schedule based on planned routes
     */
    public List<Map<String, String>> getSchedulesByZone(String zone) throws JAXBException {
        List<Tournee> allRoutes = getAllRoutes();
        List<Map<String, String>> schedules = new ArrayList<>();
        
        // Group routes by day of week and type
        Map<String, Set<String>> dayTypeMap = new HashMap<>();
        
        for (Tournee route : allRoutes) {
            if (route.getDatePlanifiee() == null || route.getPointsCollecte() == null) {
                continue;
            }
            
            // Check if any point in this route matches the zone
            boolean matchesZone = route.getPointsCollecte().stream()
                .anyMatch(p -> p.getLocalisation() != null && 
                    p.getLocalisation().toLowerCase().contains(zone.toLowerCase()));
            
            if (!matchesZone) {
                continue;
            }
            
            // Extract day of week from datePlanifiee
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(route.getDatePlanifiee());
            int dayOfWeek = cal.get(java.util.Calendar.DAY_OF_WEEK);
            String dayName = getDayName(dayOfWeek);
            
            // Extract waste types from points
            Set<String> types = route.getPointsCollecte().stream()
                .filter(p -> p.getTypeDechet() != null && p.getTypeDechet().getNom() != null)
                .map(p -> p.getTypeDechet().getNom())
                .collect(Collectors.toSet());
            
            // Add to schedule
            for (String type : types) {
                String key = dayName + ":" + type;
                dayTypeMap.putIfAbsent(key, new HashSet<>());
                if (route.getHeureDebut() != null) {
                    dayTypeMap.get(key).add(route.getHeureDebut());
                }
            }
        }
        
        // Convert to list of maps
        for (Map.Entry<String, Set<String>> entry : dayTypeMap.entrySet()) {
            String[] parts = entry.getKey().split(":", 2);
            if (parts.length == 2) {
                Map<String, String> schedule = new HashMap<>();
                schedule.put("day", parts[0]);
                schedule.put("type", parts[1]);
                schedule.put("time", String.join(", ", entry.getValue()));
                schedules.add(schedule);
            }
        }
        
        // Sort by day of week
        String[] dayOrder = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"};
        schedules.sort((a, b) -> {
            int indexA = java.util.Arrays.asList(dayOrder).indexOf(a.get("day"));
            int indexB = java.util.Arrays.asList(dayOrder).indexOf(b.get("day"));
            return Integer.compare(indexA, indexB);
        });
        
        return schedules;
    }
    
    private String getDayName(int dayOfWeek) {
        switch (dayOfWeek) {
            case java.util.Calendar.MONDAY: return "Lundi";
            case java.util.Calendar.TUESDAY: return "Mardi";
            case java.util.Calendar.WEDNESDAY: return "Mercredi";
            case java.util.Calendar.THURSDAY: return "Jeudi";
            case java.util.Calendar.FRIDAY: return "Vendredi";
            case java.util.Calendar.SATURDAY: return "Samedi";
            case java.util.Calendar.SUNDAY: return "Dimanche";
            default: return "Inconnu";
        }
    }
}