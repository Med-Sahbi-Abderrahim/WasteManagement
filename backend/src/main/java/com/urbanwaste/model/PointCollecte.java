package com.urbanwaste.model;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "pointCollecte")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "pointCollecte")
public class PointCollecte {
    @XmlElement(required = true)
    private int id;

    @XmlElement(required = true)
    @JsonAlias({"address", "adresse"})
    private String localisation; // Address

    @XmlElement(required = true)
    private float niveauRemplissage;

    @XmlElement(required = true)
    private String etatConteneur; // ACTIF, MAINTENANCE, HORS_SERVICE

    @XmlElement(required = true)
    private Date DateDerniereCollecte;

    @XmlElement(required = true)
    private TypeDechet typeDechet;

    // Additional fields from frontend (not in XSD)
    @XmlElement
    private double latitude;

    @XmlElement
    private double longitude;

    @XmlElement
    private int capacite;

    @XmlElement
    private String modele;

    public PointCollecte() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getLocalisation() { return localisation; }
    public void setLocalisation(String localisation) { this.localisation = localisation; }

    // helper for compatibility
    public String getAddress() { return localisation; } 
    public void setAddress(String address) { this.localisation = address; }

    public float getNiveauRemplissage() { return niveauRemplissage; }
    public void setNiveauRemplissage(float niveau) { this.niveauRemplissage = niveau; }

    public String getEtatConteneur() { return etatConteneur; }
    public void setEtatConteneur(String etat) { this.etatConteneur = etat; }

    public Date getDateDerniereCollecte() { return DateDerniereCollecte; }
    public void setDateDerniereCollecte(Date date) { this.DateDerniereCollecte = date; }

    public TypeDechet getTypeDechet() { return typeDechet; }
    public void setTypeDechet(TypeDechet type) { this.typeDechet = type; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double lat) { this.latitude = lat; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double lng) { this.longitude = lng; }

    public int getCapacite() { return capacite; }
    public void setCapacite(int capacite) { this.capacite = capacite; }

    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }
}