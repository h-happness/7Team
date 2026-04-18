package com.example.demo.controller;

import com.example.demo.entity.ProfileComment;
import com.example.demo.entity.User;
import com.example.demo.repository.ProfileCommentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ProfileController {

    private final UserRepository userRepository;
    private final ProfileCommentRepository commentRepository;

    public ProfileController(UserRepository userRepository,
                             ProfileCommentRepository commentRepository) {
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    private static String normEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private static List<String> parseInterests(String raw) {
        if (raw == null || raw.trim().isEmpty()) return List.of();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    private static String interestsToStorage(String rawCsv) {
        // Normalize and store as comma+space.
        List<String> list = parseInterests(rawCsv);
        return String.join(", ", list);
    }

    public static class ProfileDto {
        public String email;
        public String displayName;
        public String bio;
        public List<String> interests;
        public String avatarDataUrl;
        public List<ProfileComment> comments;
    }

    public static class ProfileSummaryDto {
        public String email;
        public String displayName;
    }

    @GetMapping("/profile")
    public ProfileDto getProfile(@RequestParam String email) {
        String e = normEmail(email);
        User user = userRepository.findByEmail(e)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProfileDto dto = new ProfileDto();
        dto.email = user.getEmail();
        dto.displayName = user.getDisplayName();
        dto.bio = user.getBio();
        dto.avatarDataUrl = user.getAvatarDataUrl();
        dto.interests = parseInterests(user.getInterests());
        dto.comments = commentRepository.findByTargetEmailOrderByCreatedAtDesc(e);
        return dto;
    }

    @GetMapping("/profile/list")
    public List<ProfileSummaryDto> listProfiles() {
        return userRepository.findAll().stream().map(u -> {
            ProfileSummaryDto dto = new ProfileSummaryDto();
            dto.email = u.getEmail();
            dto.displayName = u.getDisplayName() == null || u.getDisplayName().trim().isEmpty()
                    ? u.getEmail()
                    : u.getDisplayName();
            return dto;
        }).collect(Collectors.toList());
    }

    @PostMapping("/profile/update")
    public ProfileDto updateProfile(@RequestParam String email,
                                    @RequestParam(required = false) String displayName,
                                    @RequestParam(required = false) String bio,
                                    @RequestParam(required = false) String interests,
                                    @RequestParam(required = false) String avatarDataUrl) {

        String e = normEmail(email);
        User user = userRepository.findByEmail(e)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (displayName != null) user.setDisplayName(displayName.trim());
        if (bio != null) user.setBio(bio.trim());
        if (interests != null) user.setInterests(interestsToStorage(interests));
        if (avatarDataUrl != null) user.setAvatarDataUrl(avatarDataUrl.trim());

        userRepository.save(user);
        return getProfile(e);
    }

    @PostMapping("/profile/comment")
    public ProfileComment addComment(@RequestParam String targetEmail,
                                     @RequestParam String authorEmail,
                                     @RequestParam String text) {
        String target = normEmail(targetEmail);
        String author = normEmail(authorEmail);

        if (text == null || text.trim().isEmpty()) {
            throw new RuntimeException("Comment is empty");
        }

        // Ensure target exists.
        userRepository.findByEmail(target)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String authorName = userRepository.findByEmail(author)
                .map(u -> {
                    String dn = u.getDisplayName();
                    return dn == null || dn.trim().isEmpty() ? u.getEmail() : dn;
                })
                .orElse(author);

        ProfileComment c = new ProfileComment();
        c.setTargetEmail(target);
        c.setAuthorEmail(author);
        c.setAuthorName(authorName);
        c.setText(text.trim());

        return commentRepository.save(c);
    }
}

