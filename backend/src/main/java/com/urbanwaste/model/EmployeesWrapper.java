package com.urbanwaste.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "employes")
@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(localName = "employes")
public class EmployeesWrapper {
    @XmlElement(name = "employe")
    private List<Employee> employes = new ArrayList<>();

    public List<Employee> getEmployes() { return employes; }
    public void setEmployes(List<Employee> employes) { this.employes = employes; }
}

