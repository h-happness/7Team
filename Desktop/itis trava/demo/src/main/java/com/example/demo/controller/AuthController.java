package com.example.demo.controller;

import com.example.demo.dto.AuthRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;

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
    public User register(@RequestBody(required = false) AuthRequest body,
                         @RequestParam(required = false) String email,
                         @RequestParam(required = false) String password) {
        String resolvedEmail = (body != null && body.email != null) ? body.email : email;
        String resolvedPassword = (body != null && body.password != null) ? body.password : password;

        if (resolvedEmail == null || resolvedEmail.isBlank() || resolvedPassword == null || resolvedPassword.isBlank()) {
            throw new RuntimeException("email/password required");
        }

        return userService.register(resolvedEmail.trim(), resolvedPassword.trim());
    }

    @PostMapping("/login")
    public String login(@RequestBody(required = false) AuthRequest body,
                        @RequestParam(required = false) String email,
                        @RequestParam(required = false) String password) {

        String resolvedEmail = (body != null && body.email != null) ? body.email : email;
        String resolvedPassword = (body != null && body.password != null) ? body.password : password;

        if (resolvedEmail == null || resolvedEmail.isBlank() || resolvedPassword == null || resolvedPassword.isBlank()) {
            throw new RuntimeException("email/password required");
        }

        User user = userRepository.findByEmail(resolvedEmail.trim())
                .orElseThrow(() -> new RuntimeException("Пользователь с таким email не найден"));

        if (passwordEncoder.matches(resolvedPassword.trim(), user.getPassword())) {
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
