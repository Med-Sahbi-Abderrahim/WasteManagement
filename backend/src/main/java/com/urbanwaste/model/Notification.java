package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.Date;

@XmlRootElement(name = "notification")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "notification")
public class Notification {
    @XmlElement(required = true)
    private int id;

    @XmlElement(required = true)
    private Date date;

    @XmlElement(required = true)
    private String type;

    @XmlElement(required = true)
    private String message;

    @XmlElement(required = true)
    private PointCollecte pointCollecte;

    public Notification() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public PointCollecte getPointCollecte() { return pointCollecte; }
    public void setPointCollecte(PointCollecte point) { this.pointCollecte = point; }
}