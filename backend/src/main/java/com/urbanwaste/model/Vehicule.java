package com.urbanwaste.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "vehicule")
@XmlAccessorType(XmlAccessType.FIELD)
@jakarta.xml.bind.annotation.XmlType(propOrder = {"id", "capacite", "disponibilite", "immatriculation", "typeVehicule", "statut", "etat", "conducteur"})
@JacksonXmlRootElement(localName = "vehicule")
@JsonIgnoreProperties(ignoreUnknown = true) // Ignore unknown properties from frontend
public class Vehicule {
    @XmlElement(required = true)
    private int id;

    @XmlElement
    private float capacite;

    @XmlElement
    private boolean disponibilite;

    @XmlElement
    private String immatriculation;

    @XmlElement
    private String typeVehicule;

    @XmlElement
    private String statut; // DISPONIBLE, EN_MISSION, MAINTENANCE

    @XmlElement
    private String etat; // DISPONIBLE, EN_MISSION, MAINTENANCE (alias for statut)

    @XmlElement(required = false) // Make conducteur optional for JSON requests
    private Employee conducteur;

    public Vehicule() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTypeVehicule() { return typeVehicule; }
    public void setTypeVehicule(String type) { this.typeVehicule = type; }

    public float getCapacite() { return capacite; }
    public void setCapacite(float capacite) { this.capacite = capacite; }

    public boolean isDisponibilite() { return disponibilite; }
    public void setDisponibilite(boolean dispo) { this.disponibilite = dispo; }

    public Employee getConducteur() { return conducteur; }
    public void setConducteur(Employee conducteur) { this.conducteur = conducteur; }

    public String getImmatriculation() { return immatriculation; }
    public void setImmatriculation(String immat) { this.immatriculation = immat; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getEtat() { 
        // Return etat if set, otherwise fall back to statut for backward compatibility
        return etat != null ? etat : statut; 
    }
    public void setEtat(String etat) { 
        this.etat = etat;
        // Also update statut for backward compatibility
        if (statut == null) {
            this.statut = etat;
        }
    }
}