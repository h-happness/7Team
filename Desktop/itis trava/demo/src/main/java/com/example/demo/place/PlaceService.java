package com.example.demo.place;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaceService {
    private List<Place> places;

    @PostConstruct
    public void loadPlaces() {
        try {
            ObjectMapper mapper = new ObjectMapper();

            InputStream is = getClass().getResourceAsStream("/places.json");

            places = mapper.readValue(is, new TypeReference<List<Place>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to load places.json", e);
        }
    }

    public List<Place> getAll(String country, String city, PlaceType type) {
        return places.stream()
                .filter(p -> country == null || p.getCountry().equalsIgnoreCase(country))
                .filter(p -> city == null || p.getCity().equalsIgnoreCase(city))
                .filter(p -> type == null || p.getType() == type)
                .collect(Collectors.toList());
    }

    public Place getById(Long id) {
        return places.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Place not found"));
    }
}
