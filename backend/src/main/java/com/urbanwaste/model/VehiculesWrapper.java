package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "vehicules")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "vehicules")
public class VehiculesWrapper {
    @XmlElement(name = "vehicule")
    private List<Vehicule> vehicules = new ArrayList<>();

    public List<Vehicule> getVehicules() { return vehicules; }
    public void setVehicules(List<Vehicule> vehicules) { this.vehicules = vehicules; }
}