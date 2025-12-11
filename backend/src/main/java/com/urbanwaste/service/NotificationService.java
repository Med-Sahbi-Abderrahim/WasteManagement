package com.urbanwaste.service;

import com.urbanwaste.model.Notification;
import com.urbanwaste.model.NotificationsWrapper;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.xml.bind.JAXBException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    private static final String NOTIFICATIONS_FILE = "notifications.xml";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(NOTIFICATIONS_FILE)) {
            try {
                List<Notification> notifications = getAllNotifications();
                if (!notifications.isEmpty()) {
                    int maxId = notifications.stream().mapToInt(Notification::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing notifications: " + e.getMessage());
            }
        }
    }
    
    /**
     * Get all notifications
     */
    public List<Notification> getAllNotifications() throws JAXBException {
        NotificationsWrapper wrapper = xmlHandler.loadFromXML(NOTIFICATIONS_FILE, NotificationsWrapper.class);
        if (wrapper == null || wrapper.getNotifications() == null) {
            return new ArrayList<>();
        }
        return new ArrayList<>(wrapper.getNotifications());
    }
    
    /**
     * Get notifications by target role
     */
    public List<Notification> getNotificationsByRole(String role) throws JAXBException {
        return getAllNotifications().stream()
            .filter(n -> role.equals(n.getRoleCible()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get unread notifications by role
     */
    public List<Notification> getUnreadNotificationsByRole(String role) throws JAXBException {
        return getAllNotifications().stream()
            .filter(n -> role.equals(n.getRoleCible()) && !n.isLue())
            .collect(Collectors.toList());
    }
    
    /**
     * Create a new notification
     */
    public synchronized Notification createNotification(Notification notification) throws JAXBException, XMLValidationException {
        NotificationsWrapper wrapper = xmlHandler.loadFromXML(NOTIFICATIONS_FILE, NotificationsWrapper.class);
        List<Notification> notifications = wrapper != null && wrapper.getNotifications() != null 
            ? new ArrayList<>(wrapper.getNotifications()) 
            : new ArrayList<>();
        
        notification.setId(idCounter.getAndIncrement());
        if (notification.getDateCreation() == null) {
            notification.setDateCreation(new Date());
        }
        
        notifications.add(notification);
        
        NotificationsWrapper newWrapper = new NotificationsWrapper();
        newWrapper.setNotifications(notifications);
        xmlHandler.saveToXML(newWrapper, NOTIFICATIONS_FILE);
        
        return notification;
    }
    
    /**
     * Create a vehicle breakdown notification for technicians
     */
    public synchronized Notification createVehicleBreakdownNotification(int vehiculeId, String immatriculation) throws JAXBException, XMLValidationException {
        Notification notification = new Notification();
        notification.setTitre("Véhicule en panne");
        notification.setMessage("Le véhicule " + immatriculation + " (ID: " + vehiculeId + ") est en panne et nécessite une intervention.");
        notification.setRoleCible("TECHNICIEN");
        notification.setVehiculeId(vehiculeId);
        notification.setType("VEHICULE_PANNE");
        
        return createNotification(notification);
    }
    
    /**
     * Mark notification as read
     */
    public synchronized boolean markAsRead(int notificationId) throws JAXBException, XMLValidationException {
        NotificationsWrapper wrapper = xmlHandler.loadFromXML(NOTIFICATIONS_FILE, NotificationsWrapper.class);
        List<Notification> notifications = wrapper != null && wrapper.getNotifications() != null 
            ? new ArrayList<>(wrapper.getNotifications()) 
            : new ArrayList<>();
        
        for (Notification notification : notifications) {
            if (notification.getId() == notificationId) {
                notification.setLue(true);
                NotificationsWrapper newWrapper = new NotificationsWrapper();
                newWrapper.setNotifications(notifications);
                xmlHandler.saveToXML(newWrapper, NOTIFICATIONS_FILE);
                return true;
            }
        }
        
        return false;
    }
}

