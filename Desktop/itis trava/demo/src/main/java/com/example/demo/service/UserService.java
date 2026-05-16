package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String email, String password) {
    // Проверка что пользователь с таким email уже существует
    if (userRepository.findByEmail(email).isPresent()) {
        throw new RuntimeException("Пользователь с таким email уже существует");
    }

    User user = new User();
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode(password));
    user.setRole("USER");
    if (email != null && email.contains("@")) {
        user.setDisplayName(email.substring(0, email.indexOf('@')));
    } else {
        user.setDisplayName(email);
    }

    return userRepository.save(user);
}
}
