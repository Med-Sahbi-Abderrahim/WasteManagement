package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@XmlRootElement(name = "tournee")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "tournee")
public class Tournee {
    @XmlElement(required = true)
    private int id;

    @XmlElement(required = true)
    private Date datePlanifiee;

    @XmlElement(required = true)
    private String statut; // PLANIFIEE, EN_COURS, TERMINEE

    @XmlElement(required = true)
    private Employee employe;

    @XmlElement(required = true)
    private Vehicule vehicle;

    @XmlElement(name = "pointsCollecte")
    private List<PointCollecte> pointsCollecte = new ArrayList<>();

    // Additional fields from frontend
    @XmlElement
    private String heureDebut;

    @XmlElement
    private String heureFin;

    @XmlElement
    private float distanceKm;

    public Tournee() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Date getDatePlanifiee() { return datePlanifiee; }
    public void setDatePlanifiee(Date date) { this.datePlanifiee = date; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Employee getEmploye() { return employe; }
    public void setEmploye(Employee emp) { this.employe = emp; }

    public Vehicule getVehicle() { return vehicle; }
    public void setVehicle(Vehicule v) { this.vehicle = v; }

    public List<PointCollecte> getPointsCollecte() { return pointsCollecte; }
    public void setPointsCollecte(List<PointCollecte> points) { this.pointsCollecte = points; }

    public String getHeureDebut() { return heureDebut; }
    public void setHeureDebut(String heure) { this.heureDebut = heure; }

    public String getHeureFin() { return heureFin; }
    public void setHeureFin(String heure) { this.heureFin = heure; }

    public float getDistanceKm() { return distanceKm; }
    public void setDistanceKm(float distance) { this.distanceKm = distance; }
}