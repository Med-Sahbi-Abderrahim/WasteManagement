package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "technicien")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "technicien")
public class Technicien extends Utilisateur {
    public Technicien() {
        super();
        setRole("TECHNICIEN");
    }
}