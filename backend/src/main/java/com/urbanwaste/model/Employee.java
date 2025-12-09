package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "employe")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "employe")
public class Employee extends Utilisateur {
    @XmlElement
    private boolean disponible;

    public Employee() {
        super();
        setRole("EMPLOYE");
    }

    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }
}