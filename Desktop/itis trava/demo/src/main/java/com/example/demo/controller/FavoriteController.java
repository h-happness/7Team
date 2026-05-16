package com.example.demo.controller;

import com.example.demo.entity.Favorite;
import com.example.demo.place.Place;
import com.example.demo.place.PlaceRepository;
import com.example.demo.repository.FavoriteRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    public FavoriteController(FavoriteRepository favoriteRepository,
                              UserRepository userRepository,
                              PlaceRepository placeRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.placeRepository = placeRepository;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    @PostMapping("/add")
    public String addFavorite(@RequestParam String email,
                              @RequestParam Long placeId) {
        User user = getUser(email);
        if (favoriteRepository.findByUserIdAndPlaceId(user.getId(), placeId).isPresent()) {
            return "Уже в избранном";
        }
        Favorite fav = new Favorite();
        fav.setUserId(user.getId());
        fav.setPlaceId(placeId);
        favoriteRepository.save(fav);
        return "Добавлено в избранное";
    }

    @DeleteMapping("/remove")
    @Transactional
    public String removeFavorite(@RequestParam String email,
                                 @RequestParam Long placeId) {
        User user = getUser(email);
        favoriteRepository.deleteByUserIdAndPlaceId(user.getId(), placeId);
        return "Удалено из избранного";
    }

    @GetMapping
    public List<Place> getFavorites(@RequestParam String email) {
        User user = getUser(email);
        List<Favorite> favorites = favoriteRepository.findByUserId(user.getId());
        return favorites.stream()
                .map(f -> placeRepository.findById(f.getPlaceId()).orElse(null))
                .filter(p -> p != null)
                .collect(Collectors.toList());
    }

    @GetMapping("/ids")
    public List<Long> getFavoriteIds(@RequestParam String email) {
        User user = getUser(email);
        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(Favorite::getPlaceId)
                .collect(Collectors.toList());
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleError(RuntimeException e) {
        return e.getMessage();
    }
}