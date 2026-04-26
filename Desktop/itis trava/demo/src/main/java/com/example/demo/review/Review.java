package com.example.demo.review;


import com.example.demo.entity.User;
import com.example.demo.place.Place;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Review {

    @Id
    @GeneratedValue
    private Long id;

    private String text;

    private int rating;

    @ManyToOne
    private User user;

    @ManyToOne
    private Place place;

    public Review() {}

    public void setText(String text) {
        this.text = text;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setPlace(Place place) {
        this.place = place;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public int getRating() {
        return rating;
    }

    public Place getPlace() {
        return place;
    }

    public User getUser() {
        return user;
    }
}
