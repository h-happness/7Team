package com.example.demo.place;

import com.example.demo.review.Review;

import java.util.List;

public class PlaceResponse {
    private Place place;
    private List<Review> reviews;

    public PlaceResponse(Place place, List<Review> reviews) {
        this.place = place;
        this.reviews = reviews;
    }

    public Place getPlace() {
        return place;
    }

    public List<Review> getReviews() {
        return reviews;
    }
}
