package com.urbanwaste.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;

@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "utilisateur")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Utilisateur {

    @XmlElement(required = true)
    private int id;

    @XmlElement(required = true)
    private String mail;

    @XmlElement(required = true)
    private String nom;

    @XmlElement(required = true)
    private String prenom;

    @XmlElement(required = true)
    private int telephone;

    // We use "password" internally to fix the XML/JSON conflict
    @XmlElement(name = "password", required = true)
    private String password; 

    @XmlElement
    private String role;
    
    public Utilisateur() {}
    
    public Utilisateur(int id, String mail, String nom, String prenom, int telephone, String password) {
        this.id = id;
        this.mail = mail;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.password = password;
    }
    
    // Standard Getters/Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }
    
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    
    public int getTelephone() { return telephone; }
    public void setTelephone(int telephone) { this.telephone = telephone; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getMotDePasse() { return password; }
    public void setMotDePasse(String motDePasse) { this.password = motDePasse; }
}