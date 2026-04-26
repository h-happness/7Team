package com.example.demo.review;

public class ReviewRequest {
    private Long userId;
    private Long placeId;
    private String text;
    private int rating;

    public Long getUserId() {
        return userId;
    }

    public Long getPlaceId() {
        return placeId;
    }

    public String getText() {
        return text;
    }

    public int getRating() {
        return rating;
    }
}
