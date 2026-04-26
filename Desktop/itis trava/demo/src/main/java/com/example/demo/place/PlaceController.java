package com.example.demo.place;


import com.example.demo.review.Review;
import com.example.demo.review.ReviewRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/places")
public class PlaceController {

    private final PlaceRepository placeRepo;
    private final ReviewRepository reviewRepo;

    public PlaceController(PlaceRepository placeRepo, ReviewRepository reviewRepo) {

        this.placeRepo = placeRepo;
        this.reviewRepo = reviewRepo;
    }

    @GetMapping
    public List<Place> gatAll() {
        return placeRepo.findAll();
    }

    @PostMapping
    public Place add(@RequestBody Place place) {
        return placeRepo.save(place);
    }

    @GetMapping("/{id}")
    public PlaceResponse getOne(@PathVariable Long id) {
        Place place = placeRepo.findById(id).orElseThrow();

        List<Review> reviews = reviewRepo.findByPlaceId(id);

        return new PlaceResponse(place, reviews);
    }
}
