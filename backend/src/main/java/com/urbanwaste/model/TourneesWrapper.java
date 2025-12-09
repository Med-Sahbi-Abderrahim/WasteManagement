package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "tournees")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "tournees")
public class TourneesWrapper {
    @XmlElement(name = "tournee")
    private List<Tournee> tournees = new ArrayList<>();

    public List<Tournee> getTournees() { return tournees; }
    public void setTournees(List<Tournee> tournees) { this.tournees = tournees; }
}