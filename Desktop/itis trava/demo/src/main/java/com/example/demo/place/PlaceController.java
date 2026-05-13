package com.example.demo.place;

import com.example.demo.place.PlaceRepository;
import com.example.demo.review.Review;
import com.example.demo.review.ReviewRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/places")
public class PlaceController {

    private final PlaceService placeService;
    private final ReviewRepository reviewRepo;
    private final PlaceRepository placeRepository;

    public PlaceController(PlaceService placeService, ReviewRepository reviewRepo, PlaceRepository placeRepository) {

        this.placeService = placeService;
        this.reviewRepo = reviewRepo;
        this.placeRepository = placeRepository;
    }

    @GetMapping
    public List<Place> getAll(@RequestParam(required = false) String country,
                              @RequestParam(required = false) String city,
                              @RequestParam(required = false) PlaceType type) {
        return placeService.getAll(country, city, type);
    }



    @GetMapping("/{id}")
    public PlaceResponse getOne(@PathVariable Long id) {
        Place place = placeService.getById(id);

        List<Review> reviews = reviewRepo.findByPlaceId(id);

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);

        return new PlaceResponse(place, reviews, avg);
    }

    @PostMapping
    public Place addPlace(@RequestBody Place place) {
        place.setId(null);
        place.setUserAdded(true);
        return placeRepository.save(place);
    }
}
