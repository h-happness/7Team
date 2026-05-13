package com.example.demo.controller;

import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public User register(@RequestParam String email,
                         @RequestParam String password) {
        return userService.register(email, password);
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("пользователь с таким email не найден"));

        if (passwordEncoder.matches(password, user.getPassword())) {
            return "Авторизация прошла успешно";
        } else {
            throw new RuntimeException("Неверный пароль");
        }
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleError(RuntimeException e) {
        return e.getMessage();
    }
}