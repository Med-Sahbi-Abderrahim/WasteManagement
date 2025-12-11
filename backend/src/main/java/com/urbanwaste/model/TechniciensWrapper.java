package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "techniciens")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "techniciens")
public class TechniciensWrapper {
    @XmlElement(name = "technicien")
    private List<Technicien> techniciens = new ArrayList<>();

    public List<Technicien> getTechniciens() { return techniciens; }
    public void setTechniciens(List<Technicien> techniciens) { this.techniciens = techniciens; }
}

