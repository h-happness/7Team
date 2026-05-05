package com.example.demo.place;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
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

        JsonNode root = mapper.readTree(is);
        JsonNode countries = root.get("countries");

        places = new java.util.ArrayList<>();

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
                        place.setId((long) places.size() + 1);
                        place.setName(p.has("name") ? p.get("name").asText() : placeEntry.getKey());
                        place.setCountry(countryName);
                        place.setCity(city);
                        place.setType(PlaceType.ATTRACTION);
                        place.setRating(p.has("rating") ? p.get("rating").asDouble() : 0);
                        place.setImage(p.has("path") ? p.get("path").asText() : "");
                        places.add(place);
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
                        place.setId((long) places.size() + 1);
                        place.setName(p.has("name") ? p.get("name").asText() : placeEntry.getKey());
                        place.setCountry(countryName);
                        place.setCity(city);
                        place.setType(PlaceType.HOTEL);
                        place.setRating(p.has("rating") ? p.get("rating").asDouble() : 0);
                        place.setImage(p.has("path") ? p.get("path").asText() : "");
                        places.add(place);
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
                        place.setId((long) places.size() + 1);
                        place.setName(p.has("name") ? p.get("name").asText() : placeEntry.getKey());
                        place.setCountry(countryName);
                        place.setCity(city);
                        place.setType(PlaceType.RESTAURANT);
                        place.setRating(p.has("rating") ? p.get("rating").asDouble() : 0);
                        place.setImage(p.has("path") ? p.get("path").asText() : "");
                        places.add(place);
                    });
                });
            }
        });

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
