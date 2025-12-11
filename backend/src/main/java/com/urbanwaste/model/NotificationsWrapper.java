package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "notifications")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "notifications")
public class NotificationsWrapper {
    @XmlElement(name = "notification")
    private List<Notification> notifications = new ArrayList<>();

    public List<Notification> getNotifications() { 
        return notifications; 
    }
    
    public void setNotifications(List<Notification> notifications) { 
        this.notifications = notifications != null ? notifications : new ArrayList<>(); 
    }
}

