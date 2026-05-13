package com.example.demo.place;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByCountryIgnoreCase(String country);
    List<Place> findByCityIgnoreCase(String city);
    List<Place> findByType(PlaceType type);
    List<Place> findByCountryIgnoreCaseAndCityIgnoreCaseAndType(
        String country, String city, PlaceType type);
}