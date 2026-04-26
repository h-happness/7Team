package com.example.demo.review;


import com.example.demo.entity.User;
import com.example.demo.place.Place;
import com.example.demo.place.PlaceRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewRepository repo;
    private final UserRepository userRepo;
    private final PlaceRepository placeRepo;

    public ReviewController(ReviewRepository repo, UserRepository userRepo, PlaceRepository placeRepo) {
        this.repo = repo;
        this.placeRepo = placeRepo;
        this.userRepo = userRepo;
    }

    @PostMapping
    public Review add(@RequestBody ReviewRequest request) {

        User user = userRepo.findById(request.getPlaceId()).orElseThrow();

        Place place = placeRepo.findById(request.getPlaceId()).orElseThrow();

        Review review = new Review();

        review.setUser(user);
        review.setPlace(place);
        review.setText(request.getText());
        review.setRating(request.getRating());

        return repo.save(review);
    }

    @GetMapping("/place/{id}")
    public List<Review> getByPlace(@PathVariable Long id) {
        return repo.findByPlaceId(id);
    }
}
