package com.urbanwaste.service;

import com.urbanwaste.model.SuperviseurZone;
import com.urbanwaste.model.SuperviseursWrapper;
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
public class SuperviseurService {
    
    private static final String SUPERVISEURS_FILE = "superviseurs.xml";
    
    @Autowired
    private XMLHandler xmlHandler;
    
    private AtomicInteger idCounter = new AtomicInteger(1);
    
    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(SUPERVISEURS_FILE)) {
            try {
                List<Utilisateur> superviseurs = getAllSuperviseurs();
                if (!superviseurs.isEmpty()) {
                    int maxId = superviseurs.stream().mapToInt(Utilisateur::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing superviseurs: " + e.getMessage());
            }
        }
    }
    
    public List<Utilisateur> getAllSuperviseurs() throws JAXBException {
        SuperviseursWrapper wrapper = xmlHandler.loadFromXML(SUPERVISEURS_FILE, SuperviseursWrapper.class);
        if (wrapper == null || wrapper.getSuperviseurs() == null) {
            return new ArrayList<>();
        }
        return new ArrayList<>(wrapper.getSuperviseurs());
    }
    
    public Optional<Utilisateur> getSuperviseurById(int id) throws JAXBException {
        return getAllSuperviseurs().stream()
            .filter(s -> s.getId() == id)
            .findFirst();
    }
    
    public Utilisateur createSuperviseur(Utilisateur user) throws JAXBException, XMLValidationException {
        SuperviseursWrapper wrapper = xmlHandler.loadFromXML(SUPERVISEURS_FILE, SuperviseursWrapper.class);
        List<SuperviseurZone> superviseurs = wrapper != null && wrapper.getSuperviseurs() != null 
            ? new ArrayList<>(wrapper.getSuperviseurs()) 
            : new ArrayList<>();
        
        SuperviseurZone superviseur = new SuperviseurZone();
        superviseur.setId(idCounter.getAndIncrement());
        superviseur.setMail(user.getMail());
        superviseur.setNom(user.getNom());
        superviseur.setPrenom(user.getPrenom());
        superviseur.setTelephone(user.getTelephone());
        superviseur.setMotDePasse(user.getMotDePasse());
        superviseur.setRole("SUPERVISEUR");
        
        superviseurs.add(superviseur);
        
        SuperviseursWrapper newWrapper = new SuperviseursWrapper();
        newWrapper.setSuperviseurs(superviseurs);
        xmlHandler.saveToXML(newWrapper, SUPERVISEURS_FILE);
        
        return superviseur;
    }
    
    public Optional<Utilisateur> updateSuperviseur(int id, Utilisateur updatedUser) throws JAXBException, XMLValidationException {
        SuperviseursWrapper wrapper = xmlHandler.loadFromXML(SUPERVISEURS_FILE, SuperviseursWrapper.class);
        List<SuperviseurZone> superviseurs = wrapper != null && wrapper.getSuperviseurs() != null 
            ? new ArrayList<>(wrapper.getSuperviseurs()) 
            : new ArrayList<>();
        
        Optional<SuperviseurZone> existing = superviseurs.stream()
            .filter(s -> s.getId() == id)
            .findFirst();
        
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        
        SuperviseurZone existingSuperviseur = existing.get();
        SuperviseurZone updatedSuperviseur = new SuperviseurZone();
        updatedSuperviseur.setId(id);
        // Smart merge: use incoming value if provided, otherwise keep existing
        updatedSuperviseur.setMail(updatedUser.getMail() != null ? updatedUser.getMail() : existingSuperviseur.getMail());
        updatedSuperviseur.setNom(updatedUser.getNom() != null ? updatedUser.getNom() : existingSuperviseur.getNom());
        updatedSuperviseur.setPrenom(updatedUser.getPrenom() != null ? updatedUser.getPrenom() : existingSuperviseur.getPrenom());
        updatedSuperviseur.setTelephone(updatedUser.getTelephone() != 0 ? updatedUser.getTelephone() : existingSuperviseur.getTelephone());
        updatedSuperviseur.setMotDePasse(updatedUser.getMotDePasse() != null ? updatedUser.getMotDePasse() : existingSuperviseur.getMotDePasse());
        updatedSuperviseur.setRole("SUPERVISEUR");
        
        superviseurs.removeIf(s -> s.getId() == id);
        superviseurs.add(updatedSuperviseur);
        
        SuperviseursWrapper newWrapper = new SuperviseursWrapper();
        newWrapper.setSuperviseurs(superviseurs);
        xmlHandler.saveToXML(newWrapper, SUPERVISEURS_FILE);
        
        return Optional.of(updatedSuperviseur);
    }
    
    public boolean deleteSuperviseur(int id) throws JAXBException, XMLValidationException {
        SuperviseursWrapper wrapper = xmlHandler.loadFromXML(SUPERVISEURS_FILE, SuperviseursWrapper.class);
        List<SuperviseurZone> superviseurs = wrapper != null && wrapper.getSuperviseurs() != null 
            ? new ArrayList<>(wrapper.getSuperviseurs()) 
            : new ArrayList<>();
        
        boolean removed = superviseurs.removeIf(s -> s.getId() == id);
        
        if (removed) {
            SuperviseursWrapper newWrapper = new SuperviseursWrapper();
            newWrapper.setSuperviseurs(superviseurs);
            xmlHandler.saveToXML(newWrapper, SUPERVISEURS_FILE);
        }
        
        return removed;
    }
}

