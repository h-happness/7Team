package com.example.demo.review;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPlaceId(Long placeId);

    Optional<Review> findByUserIdAndPlaceId(Long userId, Long placeId);

}
