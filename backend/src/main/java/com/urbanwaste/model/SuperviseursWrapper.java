package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "superviseurs")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "superviseurs")
public class SuperviseursWrapper {
    @XmlElement(name = "superviseur")
    private List<SuperviseurZone> superviseurs = new ArrayList<>();

    public List<SuperviseurZone> getSuperviseurs() { return superviseurs; }
    public void setSuperviseurs(List<SuperviseurZone> superviseurs) { this.superviseurs = superviseurs; }
}

