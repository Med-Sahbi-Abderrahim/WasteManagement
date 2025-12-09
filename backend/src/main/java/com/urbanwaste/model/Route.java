package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.List;
@XmlRootElement(name = "Route")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "Route")
public class Route {
    private int id;
    private String date;
    private String heureDebut;
    private String heureFin;
    private String vehiculeId;
    private String employeId;
    private List<String> pointsCollecteIds;
    private double distanceTotale;
    private double quantiteCollectee;
    private double emissionsCO2;
    private String etat;
    private String incidents;
    public Route(){}
    public Route(List<String> pointsCollecteIds, int id, String heureFin, String heureDebut, String date, String vehiculeId, String employeId, double distanceTotale, double quantiteCollectee, double emissionsCO2, String etat, String incidents) {
        this.pointsCollecteIds = pointsCollecteIds;
        this.id = id;
        this.heureFin = heureFin;
        this.heureDebut = heureDebut;
        this.date = date;
        this.vehiculeId = vehiculeId;
        this.employeId = employeId;
        this.distanceTotale = distanceTotale;
        this.quantiteCollectee = quantiteCollectee;
        this.emissionsCO2 = emissionsCO2;
        this.etat = etat;
        this.incidents = incidents;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getHeureDebut() {
        return heureDebut;
    }

    public void setHeureDebut(String heureDebut) {
        this.heureDebut = heureDebut;
    }

    public String getHeureFin() {
        return heureFin;
    }

    public void setHeureFin(String heureFin) {
        this.heureFin = heureFin;
    }

    public String getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(String vehiculeId) {
        this.vehiculeId = vehiculeId;
    }

    public String getEmployeId() {
        return employeId;
    }

    public void setEmployeId(String employeId) {
        this.employeId = employeId;
    }

    public List<String> getPointsCollecteIds() {
        return pointsCollecteIds;
    }

    public void setPointsCollecteIds(List<String> pointsCollecteIds) {
        this.pointsCollecteIds = pointsCollecteIds;
    }

    public double getDistanceTotale() {
        return distanceTotale;
    }

    public void setDistanceTotale(double distanceTotale) {
        this.distanceTotale = distanceTotale;
    }

    public double getQuantiteCollectee() {
        return quantiteCollectee;
    }

    public void setQuantiteCollectee(double quantiteCollectee) {
        this.quantiteCollectee = quantiteCollectee;
    }

    public double getEmissionsCO2() {
        return emissionsCO2;
    }

    public void setEmissionsCO2(double emissionsCO2) {
        this.emissionsCO2 = emissionsCO2;
    }

    public String getEtat() {
        return etat;
    }

    public void setEtat(String etat) {
        this.etat = etat;
    }

    public String getIncidents() {
        return incidents;
    }

    public void setIncidents(String incidents) {
        this.incidents = incidents;
    }

    @Override
    public String toString() {
        return "Route{" +
                "id='" + id + '\'' +
                ", date='" + date + '\'' +
                ", heureDebut='" + heureDebut + '\'' +
                ", heureFin='" + heureFin + '\'' +
                ", vehiculeId='" + vehiculeId + '\'' +
                ", employeId='" + employeId + '\'' +
                ", pointsCollecteIds=" + pointsCollecteIds +
                ", distanceTotale=" + distanceTotale +
                ", quantiteCollectee=" + quantiteCollectee +
                ", emissionsCO2=" + emissionsCO2 +
                ", etat='" + etat + '\'' +
                ", incidents='" + incidents + '\'' +
                '}';
    }
}




