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


}
