package com.urbanwaste.service;

import com.urbanwaste.model.Tournee; // Assuming the route model is Tournee
import com.urbanwaste.model.TourneesWrapper; // Assuming you have this wrapper model
import com.urbanwaste.model.Employee;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import com.urbanwaste.service.EmployeeService;
import com.urbanwaste.service.VehicleService;
import com.urbanwaste.service.CollectionPointService;
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
    
    @Autowired
    private EmployeeService employeeService;
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private CollectionPointService collectionPointService;
    
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
     * Get all routes as wrapper (for export)
     */
    public TourneesWrapper getAllRoutesWrapper() throws JAXBException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        if (wrapper == null) {
            wrapper = new TourneesWrapper();
            wrapper.setTournees(new ArrayList<>());
        }
        if (wrapper.getTournees() == null) {
            wrapper.setTournees(new ArrayList<>());
        }
        return wrapper;
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
        
        // Load complete vehicle from database to ensure all fields are present for XML marshalling
        // This is necessary because the frontend may only send id and immatriculation
        Optional<com.urbanwaste.model.Vehicule> vehicleOpt = vehicleService.getVehicleById(route.getVehicle().getId());
        if (vehicleOpt.isEmpty()) {
            throw new IllegalArgumentException("Vehicle with ID " + route.getVehicle().getId() + " not found");
        }
        
        // Replace partial vehicle with complete vehicle from database
        com.urbanwaste.model.Vehicule completeVehicle = vehicleOpt.get();
        route.setVehicle(completeVehicle);
        
        // Ensure immatriculation is set (required by XSD)
        if (completeVehicle.getImmatriculation() == null || completeVehicle.getImmatriculation().trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle must have an immatriculation");
        }
        
        // Ensure pointsCollecte is not null and not empty (required by XSD - minOccurs defaults to 1)
        if (route.getPointsCollecte() == null || route.getPointsCollecte().isEmpty()) {
            throw new IllegalArgumentException("At least one collection point (pointsCollecte) is required for tour creation");
        }
        
        // Load complete collection points from database to ensure all fields are present for XML marshalling
        // This is necessary because the frontend may only send id and localisation
        List<com.urbanwaste.model.PointCollecte> completePoints = new ArrayList<>();
        for (com.urbanwaste.model.PointCollecte partialPoint : route.getPointsCollecte()) {
            if (partialPoint.getId() == 0) {
                throw new IllegalArgumentException("All collection points must have a valid id");
            }
            
            Optional<com.urbanwaste.model.PointCollecte> pointOpt = collectionPointService.getPointById(partialPoint.getId());
            if (pointOpt.isEmpty()) {
                throw new IllegalArgumentException("Collection point with ID " + partialPoint.getId() + " not found");
            }
            
            completePoints.add(pointOpt.get());
        }
        
        // Replace partial points with complete points from database
        route.setPointsCollecte(completePoints);
        
        // Business Rule 1: Availability Check
        validateEmployeeAvailability(route.getEmploye());
        
        // Business Rule 2: Conflict Detection
        validateNoEmployeeConflict(route, routes);
        
        // Business Rule 3: Capacity Validation
        validateVehicleCapacity(route);
        
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
        
        // Business Rule 1: Availability Check (if employee changed)
        if (updatedRoute.getEmploye() != null && updatedRoute.getEmploye().getId() != 0) {
            validateEmployeeAvailability(updatedRoute.getEmploye());
        }
        
        // Business Rule 2: Conflict Detection (if employee or date changed)
        if (updatedRoute.getEmploye() != null && updatedRoute.getEmploye().getId() != 0) {
            // Create temporary list without current route for conflict check
            List<Tournee> routesWithoutCurrent = routes.stream()
                .filter(t -> t.getId() != id)
                .collect(Collectors.toList());
            validateNoEmployeeConflict(updatedRoute, routesWithoutCurrent);
        }
        
        // Business Rule 3: Capacity Validation
        validateVehicleCapacity(updatedRoute);
        
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
    
    /**
     * Business Rule: Validate employee availability
     * Throws IllegalArgumentException if employee is not available
     */
    private void validateEmployeeAvailability(Employee employee) throws JAXBException {
        if (employee == null || employee.getId() == 0) {
            return; // Already validated elsewhere
        }
        
        // Load employee from database to check availability
        Optional<com.urbanwaste.model.Utilisateur> employeeOpt = employeeService.getEmployeeById(employee.getId());
        if (employeeOpt.isEmpty()) {
            throw new IllegalArgumentException("Employee with ID " + employee.getId() + " not found");
        }
        
        // Check if employee is an Employee instance with disponible field
        if (employeeOpt.get() instanceof Employee) {
            Employee emp = (Employee) employeeOpt.get();
            if (!emp.isDisponible()) {
                throw new IllegalArgumentException(
                    "Employee " + emp.getPrenom() + " " + emp.getNom() + " (ID: " + emp.getId() + ") is not available");
            }
        }
    }
    
    /**
     * Business Rule: Validate no employee conflict on same date and hour
     * Throws IllegalArgumentException if employee is already assigned to another tour on the same date and hour
     */
    private void validateNoEmployeeConflict(Tournee newRoute, List<Tournee> existingRoutes) {
        if (newRoute.getEmploye() == null || newRoute.getEmploye().getId() == 0) {
            return; // No employee assigned, no conflict
        }
        
        if (newRoute.getDatePlanifiee() == null) {
            return; // No date assigned, no conflict
        }
        
        int employeeId = newRoute.getEmploye().getId();
        Date newRouteDate = newRoute.getDatePlanifiee();
        String newRouteHeure = newRoute.getHeureDebut();
        
        // Check for conflicts: same employee, same date, same hour, status not TERMINEE
        boolean hasConflict = existingRoutes.stream()
            .filter(t -> t.getEmploye() != null && t.getEmploye().getId() == employeeId)
            .filter(t -> t.getDatePlanifiee() != null)
            .filter(t -> datesMatch(t.getDatePlanifiee(), newRouteDate))
            .filter(t -> !"TERMINEE".equals(t.getStatut()))
            .filter(t -> hoursOverlap(t.getHeureDebut(), t.getHeureFin(), newRouteHeure, newRoute.getHeureFin()))
            .findAny()
            .isPresent();
        
        if (hasConflict) {
            throw new IllegalArgumentException(
                "Employee (ID: " + employeeId + ") is already assigned to another tour on " + newRouteDate + 
                (newRouteHeure != null ? " at " + newRouteHeure : ""));
        }
    }
    
    /**
     * Helper method to compare dates (ignoring time)
     */
    private boolean datesMatch(Date date1, Date date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        
        // Compare dates ignoring time
        java.util.Calendar cal1 = java.util.Calendar.getInstance();
        cal1.setTime(date1);
        java.util.Calendar cal2 = java.util.Calendar.getInstance();
        cal2.setTime(date2);
        
        return cal1.get(java.util.Calendar.YEAR) == cal2.get(java.util.Calendar.YEAR) &&
               cal1.get(java.util.Calendar.DAY_OF_YEAR) == cal2.get(java.util.Calendar.DAY_OF_YEAR);
    }
    
    /**
     * Helper method to check if two time ranges overlap
     * Returns true if the hours overlap (same hour slot)
     * Format: "HH:mm" (e.g., "08:30", "14:00")
     */
    private boolean hoursOverlap(String heureDebut1, String heureFin1, String heureDebut2, String heureFin2) {
        // If no hours specified, consider it as a conflict (conservative approach)
        if (heureDebut1 == null || heureDebut1.trim().isEmpty()) {
            return true; // Conflict if existing tour has no hour specified
        }
        if (heureDebut2 == null || heureDebut2.trim().isEmpty()) {
            return true; // Conflict if new tour has no hour specified
        }
        
        try {
            // Extract hour from "HH:mm" format
            int hour1 = extractHour(heureDebut1);
            int hour2 = extractHour(heureDebut2);
            
            // Check if they are in the same hour slot
            // Same hour = conflict (e.g., 08:30 and 08:45 are in the same hour)
            return hour1 == hour2;
        } catch (Exception e) {
            // If parsing fails, consider it as a conflict (conservative approach)
            return true;
        }
    }
    
    /**
     * Extract hour from "HH:mm" format
     * Returns the hour (0-23)
     */
    private int extractHour(String heure) {
        if (heure == null || heure.trim().isEmpty()) {
            return -1;
        }
        
        // Handle formats like "08:30", "8:30", "14:00"
        String[] parts = heure.trim().split(":");
        if (parts.length >= 1) {
            return Integer.parseInt(parts[0]);
        }
        
        return -1;
    }
    
    /**
     * Business Rule: Validate vehicle capacity against collection points
     * Throws IllegalArgumentException if vehicle capacity is exceeded
     */
    private void validateVehicleCapacity(Tournee route) throws JAXBException {
        if (route.getVehicle() == null || route.getVehicle().getId() == 0) {
            return; // Already validated elsewhere
        }
        
        if (route.getPointsCollecte() == null || route.getPointsCollecte().isEmpty()) {
            return; // No points to validate
        }
        
        // Load vehicle from database to get actual capacity
        Optional<com.urbanwaste.model.Vehicule> vehicleOpt = vehicleService.getVehicleById(route.getVehicle().getId());
        if (vehicleOpt.isEmpty()) {
            throw new IllegalArgumentException("Vehicle with ID " + route.getVehicle().getId() + " not found");
        }
        
        com.urbanwaste.model.Vehicule vehicle = vehicleOpt.get();
        float vehicleCapacity = vehicle.getCapacite();
        
        // Calculate total volume needed from all collection points
        float totalVolumeNeeded = 0.0f;
        
        for (com.urbanwaste.model.PointCollecte point : route.getPointsCollecte()) {
            // If point has capacite field, use it
            // Otherwise, estimate based on niveauRemplissage if available
            float pointVolume = 0.0f;
            
            if (point.getCapacite() > 0) {
                // Use actual capacity
                pointVolume = point.getCapacite();
            } else {
                // Estimate: assume standard capacity of 1000L and calculate based on fill level
                // This is a conservative estimate
                float estimatedCapacity = 1000.0f; // Default 1000L per bin
                float fillLevel = point.getNiveauRemplissage();
                pointVolume = estimatedCapacity * (fillLevel / 100.0f);
            }
            
            totalVolumeNeeded += pointVolume;
        }
        
        // Check if vehicle capacity is sufficient
        if (totalVolumeNeeded > vehicleCapacity) {
            throw new IllegalArgumentException(
                String.format("Vehicle capacity exceeded: Vehicle capacity (%.1f) is insufficient for tour (%.1f needed)", 
                    vehicleCapacity, totalVolumeNeeded));
        }
    }
    
    /**
     * Merge imported routes with existing routes (avoiding duplicates by ID)
     * Returns the number of routes actually imported/updated
     * Also returns validation errors in a list
     */
    public synchronized int mergeRoutes(List<Tournee> importedRoutes) throws JAXBException, XMLValidationException {
        TourneesWrapper wrapper = xmlHandler.loadFromXML(ROUTES_FILE, TourneesWrapper.class);
        if (wrapper == null) {
            wrapper = new TourneesWrapper();
        }
        List<Tournee> existingRoutes = wrapper.getTournees();
        if (existingRoutes == null) {
            existingRoutes = new ArrayList<>();
        }
        
        // Create a set of existing IDs for quick lookup
        Set<Integer> existingIds = existingRoutes.stream()
            .map(Tournee::getId)
            .collect(Collectors.toSet());
        
        int importedCount = 0;
        
        // Merge routes: update existing ones or add new ones
        for (Tournee importedRoute : importedRoutes) {
            // Find existing route with same ID
            Tournee existingRoute = existingRoutes.stream()
                .filter(r -> r.getId() == importedRoute.getId())
                .findFirst()
                .orElse(null);
            
            if (existingRoute != null) {
                // Update existing route - skip strict validation for imports
                try {
                    // Update fields without strict validation (imports are trusted data)
                    existingRoute.setDatePlanifiee(importedRoute.getDatePlanifiee() != null ? importedRoute.getDatePlanifiee() : existingRoute.getDatePlanifiee());
                    existingRoute.setStatut(importedRoute.getStatut() != null ? importedRoute.getStatut() : existingRoute.getStatut());
                    existingRoute.setEmploye(importedRoute.getEmploye() != null ? importedRoute.getEmploye() : existingRoute.getEmploye());
                    existingRoute.setVehicle(importedRoute.getVehicle() != null ? importedRoute.getVehicle() : existingRoute.getVehicle());
                    existingRoute.setPointsCollecte(importedRoute.getPointsCollecte() != null && !importedRoute.getPointsCollecte().isEmpty() ? importedRoute.getPointsCollecte() : existingRoute.getPointsCollecte());
                    existingRoute.setHeureDebut(importedRoute.getHeureDebut() != null ? importedRoute.getHeureDebut() : existingRoute.getHeureDebut());
                    existingRoute.setHeureFin(importedRoute.getHeureFin() != null ? importedRoute.getHeureFin() : existingRoute.getHeureFin());
                    existingRoute.setDistanceKm(importedRoute.getDistanceKm() != 0 ? importedRoute.getDistanceKm() : existingRoute.getDistanceKm());
                    
                    importedCount++; // Count updated routes
                } catch (Exception e) {
                    // Skip routes that fail for any reason
                    System.err.println("Skipping route update due to error: " + e.getMessage());
                }
            } else {
                // Add new route
                // Assign new ID if ID is 0 or conflicts
                if (importedRoute.getId() == 0 || existingIds.contains(importedRoute.getId())) {
                    importedRoute.setId(idCounter.getAndIncrement());
                }
                
                // For imports, skip strict validation - just add the route
                // Validation will happen when the route is actually used
                try {
                    existingRoutes.add(importedRoute);
                    existingIds.add(importedRoute.getId());
                    importedCount++;
                } catch (Exception e) {
                    // Skip routes that fail for any reason
                    System.err.println("Skipping route due to error: " + e.getMessage());
                }
            }
        }
        
        wrapper.setTournees(existingRoutes);
        xmlHandler.saveToXML(wrapper, ROUTES_FILE);
        
        return importedCount;
    }
}