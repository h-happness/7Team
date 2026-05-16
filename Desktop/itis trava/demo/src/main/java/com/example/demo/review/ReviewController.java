package com.example.demo.review;


import com.example.demo.entity.User;
import com.example.demo.place.Place;
import com.example.demo.place.PlaceRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewRepository repo;
    private final UserRepository userRepo;
    private final PlaceRepository placeRepository;

    public ReviewController(ReviewRepository repo, UserRepository userRepo, PlaceRepository placeRepository) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.placeRepository = placeRepository;
    }

    @PostMapping
    public Review add(@RequestBody ReviewRequest request) {
        User user = userRepo.findById(request.getUserId()).orElseThrow();

         Optional<Review> existing = repo.findByUserIdAndPlaceId(
        request.getUserId(), request.getPlaceId()
        );
        if (existing.isPresent()) {
            throw new RuntimeException("Вы уже оставляли отзыв на это место");
        }

        Review review = new Review();
        review.setUser(user);
        review.setPlaceId(request.getPlaceId());
        review.setText(request.getText());
        review.setRating(request.getRating());
        repo.save(review);

        // Пересчитываем рейтинг места
        List<Review> reviews = repo.findByPlaceId(request.getPlaceId());
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);
        double rounded = Math.round(avg * 10.0) / 10.0;

        placeRepository.findById(request.getPlaceId()).ifPresent(place -> {
            place.setRating(rounded);
            placeRepository.save(place);
        });

        return review;
    }

    @GetMapping("/place/{id}")
    public List<Review> getByPlace(@PathVariable Long id) {
        return repo.findByPlaceId(id);
    }
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleError(RuntimeException e) {
        return e.getMessage();
    }
}
