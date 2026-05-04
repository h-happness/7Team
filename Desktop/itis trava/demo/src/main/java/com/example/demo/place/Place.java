package com.example.demo.place;


import jakarta.persistence.*;

@Entity
public class Place {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private String description;

    private double lat;

    private double lng;

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }
}
