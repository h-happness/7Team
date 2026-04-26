package com.example.demo.review;


import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewRepository repo;

    public ReviewController(ReviewRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public Review add(@RequestBody Review review) {
        return repo.save(review);
    }

    @GetMapping("/place/{id}")
    public List<Review> getByPlace(@PathVariable Long id) {
        return repo.findByPlaceId(id);
    }
}
