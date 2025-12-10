package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.Date;

@XmlRootElement(name = "signalement")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "signalement")
public class Signalement {

    @XmlElement
    private int id;

    @XmlElement
    private String type; // DEBORDEMENT, DEGRADATION, ACCIDENT, PANNE_CAMION

    @XmlElement
    private String description;

    @XmlElement
    private Integer pointCollecteId; // optional

    @XmlElement
    private Integer employeId; // required if reported by staff

    @XmlElement
    private Integer citoyenId; // optional

    @XmlElement
    private Date dateSignalement;

    @XmlElement
    private String statut; // NOUVEAU, EN_COURS, TRAITE

    @XmlElement
    private String photoUrl;

    public Signalement() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPointCollecteId() {
        return pointCollecteId;
    }

    public void setPointCollecteId(Integer pointCollecteId) {
        this.pointCollecteId = pointCollecteId;
    }

    public Integer getEmployeId() {
        return employeId;
    }

    public void setEmployeId(Integer employeId) {
        this.employeId = employeId;
    }

    public Integer getCitoyenId() {
        return citoyenId;
    }

    public void setCitoyenId(Integer citoyenId) {
        this.citoyenId = citoyenId;
    }

    public Date getDateSignalement() {
        return dateSignalement;
    }

    public void setDateSignalement(Date dateSignalement) {
        this.dateSignalement = dateSignalement;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}

