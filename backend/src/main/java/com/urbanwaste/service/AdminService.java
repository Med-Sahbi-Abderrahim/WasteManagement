package com.urbanwaste.service;

import com.urbanwaste.model.Admin;
import com.urbanwaste.model.AdminsWrapper;
import com.urbanwaste.model.Utilisateur;
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
public class AdminService {
    
    private static final String ADMINS_FILE = "admins.xml";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(ADMINS_FILE)) {
            try {
                List<Utilisateur> admins = getAllAdmins();
                if (!admins.isEmpty()) {
                    int maxId = admins.stream().mapToInt(Utilisateur::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing admins: " + e.getMessage());
            }
        }
    }
    
    public List<Utilisateur> getAllAdmins() throws JAXBException {
        System.out.println("[AdminService] Loading admins from XML file: " + ADMINS_FILE);
        AdminsWrapper wrapper = xmlHandler.loadFromXML(ADMINS_FILE, AdminsWrapper.class);
        if (wrapper == null || wrapper.getAdmins() == null) {
            System.out.println("[AdminService] No admins found in XML file");
            return new ArrayList<>();
        }
        List<Utilisateur> admins = new ArrayList<>(wrapper.getAdmins());
        System.out.println("[AdminService] Loaded " + admins.size() + " admins from " + ADMINS_FILE);
        return admins;
    }
    
    public Optional<Utilisateur> getAdminById(int id) throws JAXBException {
        return getAllAdmins().stream()
            .filter(a -> a.getId() == id)
            .findFirst();
    }
    
    public Utilisateur createAdmin(Utilisateur user) throws JAXBException, XMLValidationException {
        System.out.println("[AdminService] Creating admin - loading from XML: " + ADMINS_FILE);
        AdminsWrapper wrapper = xmlHandler.loadFromXML(ADMINS_FILE, AdminsWrapper.class);
        List<Admin> admins = wrapper != null && wrapper.getAdmins() != null 
            ? new ArrayList<>(wrapper.getAdmins()) 
            : new ArrayList<>();
        
        Admin admin = new Admin();
        admin.setId(idCounter.getAndIncrement());
        admin.setMail(user.getMail());
        admin.setNom(user.getNom());
        admin.setPrenom(user.getPrenom());
        admin.setTelephone(user.getTelephone());
        admin.setMotDePasse(user.getMotDePasse());
        admin.setRole("ADMIN");
        
        admins.add(admin);
        
        AdminsWrapper newWrapper = new AdminsWrapper();
        newWrapper.setAdmins(admins);
        System.out.println("[AdminService] Saving admin to XML: " + ADMINS_FILE);
        xmlHandler.saveToXML(newWrapper, ADMINS_FILE);
        
        return admin;
    }
    
    public Optional<Utilisateur> updateAdmin(int id, Utilisateur updatedUser) throws JAXBException, XMLValidationException {
        System.out.println("[AdminService] Updating admin ID " + id + " - loading from XML: " + ADMINS_FILE);
        AdminsWrapper wrapper = xmlHandler.loadFromXML(ADMINS_FILE, AdminsWrapper.class);
        List<Admin> admins = wrapper != null && wrapper.getAdmins() != null 
            ? new ArrayList<>(wrapper.getAdmins()) 
            : new ArrayList<>();
        
        Optional<Admin> existing = admins.stream()
            .filter(a -> a.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            System.out.println("[AdminService] Admin ID " + id + " not found in XML");
            return Optional.empty();
        }
        
        Admin existingAdmin = existing.get();
        Admin updatedAdmin = new Admin();
        updatedAdmin.setId(id);
        // Smart merge: use incoming value if provided, otherwise keep existing
        updatedAdmin.setMail(updatedUser.getMail() != null ? updatedUser.getMail() : existingAdmin.getMail());
        updatedAdmin.setNom(updatedUser.getNom() != null ? updatedUser.getNom() : existingAdmin.getNom());
        updatedAdmin.setPrenom(updatedUser.getPrenom() != null ? updatedUser.getPrenom() : existingAdmin.getPrenom());
        updatedAdmin.setTelephone(updatedUser.getTelephone() != 0 ? updatedUser.getTelephone() : existingAdmin.getTelephone());
        updatedAdmin.setMotDePasse(updatedUser.getMotDePasse() != null ? updatedUser.getMotDePasse() : existingAdmin.getMotDePasse());
        updatedAdmin.setRole("ADMIN");
        
        admins.removeIf(a -> a.getId() == id);
        admins.add(updatedAdmin);
        
        AdminsWrapper newWrapper = new AdminsWrapper();
        newWrapper.setAdmins(admins);
        System.out.println("[AdminService] Saving updated admin to XML: " + ADMINS_FILE);
        xmlHandler.saveToXML(newWrapper, ADMINS_FILE);
        
        return Optional.of(updatedAdmin);
    }
    
    public boolean deleteAdmin(int id) throws JAXBException, XMLValidationException {
        System.out.println("[AdminService] Deleting admin ID " + id + " - loading from XML: " + ADMINS_FILE);
        AdminsWrapper wrapper = xmlHandler.loadFromXML(ADMINS_FILE, AdminsWrapper.class);
        List<Admin> admins = wrapper != null && wrapper.getAdmins() != null 
            ? new ArrayList<>(wrapper.getAdmins()) 
            : new ArrayList<>();
        
        boolean removed = admins.removeIf(a -> a.getId() == id);
        
        if (removed) {
            AdminsWrapper newWrapper = new AdminsWrapper();
            newWrapper.setAdmins(admins);
            System.out.println("[AdminService] Saving updated admins list to XML: " + ADMINS_FILE);
            xmlHandler.saveToXML(newWrapper, ADMINS_FILE);
        } else {
            System.out.println("[AdminService] Admin ID " + id + " not found in XML");
        }
        
        return removed;
    }
}

