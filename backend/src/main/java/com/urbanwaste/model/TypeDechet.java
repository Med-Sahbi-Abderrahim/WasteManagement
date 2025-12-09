package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "typeDechet")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "typeDechet")
public class TypeDechet {
    @XmlElement(required = true)
    private int id;

    @XmlElement(required = true)
    private String nom; // PLASTIQUE, VERRE, PAPIER, ORGANIQUE, MIXTE

    public TypeDechet() {}

    public TypeDechet(int id, String nom) {
        this.id = id;
        this.nom = nom;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
}