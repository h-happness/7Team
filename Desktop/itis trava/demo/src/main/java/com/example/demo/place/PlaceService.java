package com.example.demo.place;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaceService {

    private final PlaceRepository placeRepository;

    public PlaceService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    @PostConstruct
    public void loadPlaces() {
        if (placeRepository.count() > 0) return; // уже загружено

        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getResourceAsStream("/places.json");
            JsonNode root = mapper.readTree(is);
            JsonNode countries = root.get("countries");

            countries.properties().forEach(countryEntry -> {
                JsonNode country = countryEntry.getValue();
                String countryName = country.has("name") ? country.get("name").asText() : countryEntry.getKey();

                JsonNode attractions = country.get("attractions");
                if (attractions != null) {
                    attractions.properties().forEach(cityEntry -> {
                        String city = cityEntry.getKey();
                        cityEntry.getValue().properties().forEach(placeEntry -> {
                            JsonNode p = placeEntry.getValue();
                            Place place = new Place();
                            place.setName(p.has("name") ? p.get("name").asText() : placeEntry.getKey());
                            place.setCountry(countryName);
                            place.setCity(city);
                            place.setType(PlaceType.ATTRACTION);
                            place.setRating(p.has("rating") ? p.get("rating").asDouble() : 0);
                            place.setImage(p.has("path") ? p.get("path").asText() : "");
                            placeRepository.save(place);
                        });
                    });
                }

                JsonNode hotels = country.get("hotels");
                if (hotels != null) {
                    hotels.properties().forEach(cityEntry -> {
                        String city = cityEntry.getKey();
                        cityEntry.getValue().properties().forEach(placeEntry -> {
                            JsonNode p = placeEntry.getValue();
                            Place place = new Place();
                            place.setName(p.has("name") ? p.get("name").asText() : placeEntry.getKey());
                            place.setCountry(countryName);
                            place.setCity(city);
                            place.setType(PlaceType.HOTEL);
                            place.setRating(p.has("rating") ? p.get("rating").asDouble() : 0);
                            place.setImage(p.has("path") ? p.get("path").asText() : "");
                            placeRepository.save(place);
                        });
                    });
                }

                JsonNode cafes = country.get("cafes");
                if (cafes != null) {
                    cafes.properties().forEach(cityEntry -> {
                        String city = cityEntry.getKey();
                        cityEntry.getValue().properties().forEach(placeEntry -> {
                            JsonNode p = placeEntry.getValue();
                            Place place = new Place();
                            place.setName(p.has("name") ? p.get("name").asText() : placeEntry.getKey());
                            place.setCountry(countryName);
                            place.setCity(city);
                            place.setType(PlaceType.RESTAURANT);
                            place.setRating(p.has("rating") ? p.get("rating").asDouble() : 0);
                            place.setImage(p.has("path") ? p.get("path").asText() : "");
                            placeRepository.save(place);
                        });
                    });
                }
            });

        } catch (Exception e) {
            throw new RuntimeException("Failed to load places.json", e);
        }
    }

    public List<Place> getAll(String country, String city, PlaceType type) {
        return placeRepository.findAll().stream()
                .filter(p -> country == null || country.isEmpty() || 
                    p.getCountry().equalsIgnoreCase(country))
                .filter(p -> city == null || city.isEmpty() || 
                    p.getCity().equalsIgnoreCase(city))
                .filter(p -> type == null || p.getType() == type)
                .collect(Collectors.toList());
    }

    public Place getById(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found"));
    }
}