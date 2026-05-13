package com.example.demo.place;


import jakarta.persistence.*;

@Entity
@Table(name = "places")
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String country;
    private String city;
    private double lat;
    private double lng;
    @Enumerated(EnumType.STRING)
    private PlaceType type;
    private double rating;
    @Lob
    private String image;

    private boolean userAdded = false;

    public boolean isUserAdded() {
        return userAdded;
    }

    public void setUserAdded(boolean userAdded) {
        this.userAdded = userAdded;
    }


    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    public PlaceType getType() {
        return type;
    }

    public void setType(PlaceType type) {
        this.type = type;
    }
}
