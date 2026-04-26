package com.example.demo.place;


import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/places")
public class PlaceController {

    private final PlaceRepository repo;

    public PlaceController(PlaceRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Place> gatAll() {
        return repo.findAll();
    }

    @PostMapping
    public Place add(@RequestBody Place place) {
        return repo.save(place);
    }
}
