package com.example.demo.controller;

import com.example.demo.entity.ProfileComment;
import com.example.demo.repository.ProfileCommentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;
import com.example.demo.review.ReviewRepository;
import com.example.demo.place.Place;
import com.example.demo.place.PlaceRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ProfileCommentRepository commentRepository;
    private final ReviewRepository reviewRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    public AdminController(ProfileCommentRepository commentRepository,
                           ReviewRepository reviewRepository,
                           PlaceRepository placeRepository,
                           UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.reviewRepository = reviewRepository;
        this.placeRepository = placeRepository;
        this.userRepository = userRepository;
    }

    private void checkAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Нет прав администратора");
        }
    }

    @DeleteMapping("/comment/{id}")
    public String deleteComment(@PathVariable Long id,
                                @RequestParam String adminEmail) {
        checkAdmin(adminEmail);
        commentRepository.deleteById(id);
        return "Комментарий удалён";
    }

    @DeleteMapping("/review/{id}")
    public String deleteReview(@PathVariable Long id,
                               @RequestParam String adminEmail) {
        checkAdmin(adminEmail);
        reviewRepository.deleteById(id);
        return "Отзыв удалён";
    }

    @DeleteMapping("/place/{id}")
    public String deletePlace(@PathVariable Long id,
                            @RequestParam String adminEmail) {
        checkAdmin(adminEmail);
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Место не найдено"));
        if (!place.isUserAdded()) {
            throw new RuntimeException("Нельзя удалять места из базы данных");
        }
        placeRepository.deleteById(id);
        return "Место удалено";
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleError(RuntimeException e) {
        return e.getMessage();
    }
    
    @PostMapping("/make-admin")
    public String makeAdmin(@RequestParam String email, @RequestParam String secretKey) {
        if (!"supersecret123".equals(secretKey)) {
            throw new RuntimeException("Неверный ключ");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        user.setRole("ADMIN");
        userRepository.save(user);
        return "Пользователь " + email + " теперь админ";
    }
}