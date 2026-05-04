package com.example.demo.place;

import com.example.demo.review.Review;

import java.util.List;

public class PlaceResponse {
    private Place place;
    private List<Review> reviews;
    private double averageRating;

    public PlaceResponse(Place place, List<Review> reviews, double averageRating) {
        this.place = place;
        this.reviews = reviews;
        this.averageRating = averageRating;
    }

    public Place getPlace() {
        return place;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public double getAverageRating() {
        return averageRating;
    }
}
