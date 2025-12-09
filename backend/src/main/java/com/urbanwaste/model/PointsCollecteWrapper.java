package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "pointsCollecte")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "pointsCollecte")
public class PointsCollecteWrapper {
    @XmlElement(name = "pointCollecte")
    private List<PointCollecte> points = new ArrayList<>();

    public List<PointCollecte> getPoints() { return points; }
    public void setPoints(List<PointCollecte> points) { this.points = points; }
}