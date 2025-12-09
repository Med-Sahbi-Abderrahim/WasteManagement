package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "admin")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "admin")
public class Admin extends Utilisateur {
    public Admin() {
        super();
        setRole("ADMIN");
    }
}