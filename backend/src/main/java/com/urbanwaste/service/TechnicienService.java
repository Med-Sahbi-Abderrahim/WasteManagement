package com.urbanwaste.service;

import com.urbanwaste.model.Technicien;
import com.urbanwaste.model.TechniciensWrapper;
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
public class TechnicienService {
    
    private static final String TECHNICIENS_FILE = "techiciens.xml";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(TECHNICIENS_FILE)) {
            try {
                List<Utilisateur> techniciens = getAllTechniciens();
                if (!techniciens.isEmpty()) {
                    int maxId = techniciens.stream().mapToInt(Utilisateur::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing techniciens: " + e.getMessage());
            }
        }
    }
    
    public List<Utilisateur> getAllTechniciens() throws JAXBException {
        TechniciensWrapper wrapper = xmlHandler.loadFromXML(TECHNICIENS_FILE, TechniciensWrapper.class);
        if (wrapper == null || wrapper.getTechniciens() == null) {
            return new ArrayList<>();
        }
        return new ArrayList<>(wrapper.getTechniciens());
    }
    
    public Optional<Utilisateur> getTechnicienById(int id) throws JAXBException {
        return getAllTechniciens().stream()
            .filter(t -> t.getId() == id)
            .findFirst();
    }
    
    public Utilisateur createTechnicien(Utilisateur user) throws JAXBException, XMLValidationException {
        TechniciensWrapper wrapper = xmlHandler.loadFromXML(TECHNICIENS_FILE, TechniciensWrapper.class);
        List<Technicien> techniciens = wrapper != null && wrapper.getTechniciens() != null 
            ? new ArrayList<>(wrapper.getTechniciens()) 
            : new ArrayList<>();
        
        Technicien technicien = new Technicien();
        technicien.setId(idCounter.getAndIncrement());
        technicien.setMail(user.getMail());
        technicien.setNom(user.getNom());
        technicien.setPrenom(user.getPrenom());
        technicien.setTelephone(user.getTelephone());
        technicien.setMotDePasse(user.getMotDePasse());
        technicien.setRole("TECHNICIEN");
        
        techniciens.add(technicien);
        
        TechniciensWrapper newWrapper = new TechniciensWrapper();
        newWrapper.setTechniciens(techniciens);
        xmlHandler.saveToXML(newWrapper, TECHNICIENS_FILE);
        
        return technicien;
    }
    
    public Optional<Utilisateur> updateTechnicien(int id, Utilisateur updatedUser) throws JAXBException, XMLValidationException {
        TechniciensWrapper wrapper = xmlHandler.loadFromXML(TECHNICIENS_FILE, TechniciensWrapper.class);
        List<Technicien> techniciens = wrapper != null && wrapper.getTechniciens() != null 
            ? new ArrayList<>(wrapper.getTechniciens()) 
            : new ArrayList<>();
        
        Optional<Technicien> existing = techniciens.stream()
            .filter(t -> t.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        
        Technicien existingTechnicien = existing.get();
        Technicien updatedTechnicien = new Technicien();
        updatedTechnicien.setId(id);
        // Smart merge: use incoming value if provided, otherwise keep existing
        updatedTechnicien.setMail(updatedUser.getMail() != null ? updatedUser.getMail() : existingTechnicien.getMail());
        updatedTechnicien.setNom(updatedUser.getNom() != null ? updatedUser.getNom() : existingTechnicien.getNom());
        updatedTechnicien.setPrenom(updatedUser.getPrenom() != null ? updatedUser.getPrenom() : existingTechnicien.getPrenom());
        updatedTechnicien.setTelephone(updatedUser.getTelephone() != 0 ? updatedUser.getTelephone() : existingTechnicien.getTelephone());
        updatedTechnicien.setMotDePasse(updatedUser.getMotDePasse() != null ? updatedUser.getMotDePasse() : existingTechnicien.getMotDePasse());
        updatedTechnicien.setRole("TECHNICIEN");
        
        techniciens.removeIf(t -> t.getId() == id);
        techniciens.add(updatedTechnicien);
        
        TechniciensWrapper newWrapper = new TechniciensWrapper();
        newWrapper.setTechniciens(techniciens);
        xmlHandler.saveToXML(newWrapper, TECHNICIENS_FILE);
        
        return Optional.of(updatedTechnicien);
    }
    
    public boolean deleteTechnicien(int id) throws JAXBException, XMLValidationException {
        TechniciensWrapper wrapper = xmlHandler.loadFromXML(TECHNICIENS_FILE, TechniciensWrapper.class);
        List<Technicien> techniciens = wrapper != null && wrapper.getTechniciens() != null 
            ? new ArrayList<>(wrapper.getTechniciens()) 
            : new ArrayList<>();
        
        boolean removed = techniciens.removeIf(t -> t.getId() == id);
        
        if (removed) {
            TechniciensWrapper newWrapper = new TechniciensWrapper();
            newWrapper.setTechniciens(techniciens);
            xmlHandler.saveToXML(newWrapper, TECHNICIENS_FILE);
        }
        
        return removed;
    }
}

