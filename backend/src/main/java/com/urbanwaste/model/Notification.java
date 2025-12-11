package com.urbanwaste.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.Date;

@XmlRootElement(name = "notification")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "notification")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Notification {
    @XmlElement(required = true)
    private int id;

    @XmlElement(required = true)
    private String titre;

    @XmlElement(required = true)
    private String message;

    @XmlElement(required = true)
    private String roleCible; // TECHNICIEN, ADMIN, etc.

    @XmlElement(required = true)
    private Date dateCreation;

    @XmlElement
    private boolean lue;

    @XmlElement
    private Integer vehiculeId; // ID du véhicule concerné (si applicable)

    @XmlElement
    private String type; // VEHICULE_PANNE, etc.

    public Notification() {
        this.dateCreation = new Date();
        this.lue = false;
    }

    public Notification(String titre, String message, String roleCible) {
        this();
        this.titre = titre;
        this.message = message;
        this.roleCible = roleCible;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRoleCible() { return roleCible; }
    public void setRoleCible(String roleCible) { this.roleCible = roleCible; }

    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }

    public boolean isLue() { return lue; }
    public void setLue(boolean lue) { this.lue = lue; }

    public Integer getVehiculeId() { return vehiculeId; }
    public void setVehiculeId(Integer vehiculeId) { this.vehiculeId = vehiculeId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
