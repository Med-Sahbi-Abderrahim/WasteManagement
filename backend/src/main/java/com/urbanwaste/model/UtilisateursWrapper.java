package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElements;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "utilisateurs")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "utilisateurs")
public class UtilisateursWrapper {
    @XmlElements({
        @XmlElement(name = "admin", type = Admin.class),
        @XmlElement(name = "employe", type = Employee.class),
        @XmlElement(name = "technicien", type = Technicien.class),
        @XmlElement(name = "superviseurZone", type = SuperviseurZone.class)
    })
    private List<Utilisateur> utilisateurs = new ArrayList<>();

    public List<Utilisateur> getUtilisateurs() { return utilisateurs; }
    public void setUtilisateurs(List<Utilisateur> users) { this.utilisateurs = users; }
}