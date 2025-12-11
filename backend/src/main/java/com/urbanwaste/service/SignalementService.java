package com.urbanwaste.service;

import com.urbanwaste.model.Signalement;
import com.urbanwaste.model.SignalementsWrapper;
import com.urbanwaste.util.XMLHandler;
import com.urbanwaste.exception.XMLValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.xml.bind.JAXBException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class SignalementService {

    private static final String SIGNALEMENTS_FILE = "signalements.xml";

    @Autowired
    private XMLHandler xmlHandler;

    private AtomicInteger idCounter = new AtomicInteger(1);

    @PostConstruct
    public void init() {
        if (xmlHandler.fileExists(SIGNALEMENTS_FILE)) {
            try {
                List<Signalement> existing = getAll();
                if (!existing.isEmpty()) {
                    int maxId = existing.stream().mapToInt(Signalement::getId).max().orElse(0);
                    idCounter.set(maxId + 1);
                }
            } catch (JAXBException e) {
                System.err.println("Failed to load existing signalements: " + e.getMessage());
            }
        }
    }

    public Signalement create(Signalement s) throws JAXBException, XMLValidationException {
        SignalementsWrapper wrapper = xmlHandler.loadFromXML(SIGNALEMENTS_FILE, SignalementsWrapper.class);
        if (wrapper == null || wrapper.getSignalements() == null) {
            wrapper = new SignalementsWrapper();
        }
        List<Signalement> list = wrapper.getSignalements();

        s.setId(idCounter.getAndIncrement());
        s.setDateSignalement(new Date());
        if (s.getStatut() == null || s.getStatut().isEmpty()) {
            s.setStatut("NOUVEAU");
        }

        list.add(s);
        wrapper.setSignalements(list);
        xmlHandler.saveToXML(wrapper, SIGNALEMENTS_FILE);

        return s;
    }

    public List<Signalement> getAll() throws JAXBException {
        SignalementsWrapper wrapper = xmlHandler.loadFromXML(SIGNALEMENTS_FILE, SignalementsWrapper.class);
        if (wrapper == null || wrapper.getSignalements() == null) {
            return new ArrayList<>();
        }
        return wrapper.getSignalements();
    }

    public List<Signalement> getByEmployeId(int employeId) throws JAXBException {
        return getAll().stream()
            .filter(s -> s.getEmployeId() != null && s.getEmployeId() == employeId)
            .collect(Collectors.toList());
    }

    public Optional<Signalement> updateStatut(int id, String newStatut) throws JAXBException, XMLValidationException {
        SignalementsWrapper wrapper = xmlHandler.loadFromXML(SIGNALEMENTS_FILE, SignalementsWrapper.class);
        if (wrapper == null || wrapper.getSignalements() == null) {
            return Optional.empty();
        }

        List<Signalement> list = wrapper.getSignalements();
        Optional<Signalement> existing = list.stream().filter(s -> s.getId() == id).findFirst();
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        Signalement target = existing.get();
        target.setStatut(newStatut);

        wrapper.setSignalements(list);
        xmlHandler.saveToXML(wrapper, SIGNALEMENTS_FILE);

        return Optional.of(target);
    }
}

