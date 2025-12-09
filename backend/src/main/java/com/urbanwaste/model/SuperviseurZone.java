package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "superviseurZone")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "superviseurZone")
public class SuperviseurZone extends Utilisateur {
    public SuperviseurZone() {
        super();
        setRole("SUPERVISEUR");
    }
}