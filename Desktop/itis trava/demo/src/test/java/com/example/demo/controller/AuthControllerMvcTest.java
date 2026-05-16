package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @Test
    void register_acceptsJsonBody() throws Exception {
        User saved = new User();
        saved.setId(1L);
        saved.setEmail("test@test.com");
        saved.setPassword("x");
        saved.setRole("USER");

        Mockito.when(userService.register(Mockito.eq("test@test.com"), Mockito.eq("123")))
                .thenReturn(saved);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void login_acceptsJsonBody() throws Exception {
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("hashed");

        Mockito.when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        Mockito.when(passwordEncoder.matches("123", "hashed")).thenReturn(true);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@test.com\",\"password\":\"123\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Авторизация прошла успешно"));
    }

    @Test
    void register_returns400WhenMissingFields() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("email/password required"));
        Mockito.verify(userService, Mockito.never()).register(anyString(), anyString());
    }
}
