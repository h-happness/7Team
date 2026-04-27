package com.example.demo.place;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class Country {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private String currency;

    private String capital;

    private String timeZone;

    private String language;

    @Lob
    private String discription;

    private String popularSeason;



}
