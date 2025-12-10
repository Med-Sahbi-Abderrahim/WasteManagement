package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "signalements")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "signalements")
public class SignalementsWrapper {

    @XmlElement(name = "signalement")
    private List<Signalement> signalements = new ArrayList<>();

    public List<Signalement> getSignalements() {
        return signalements;
    }

    public void setSignalements(List<Signalement> signalements) {
        this.signalements = signalements;
    }
}

