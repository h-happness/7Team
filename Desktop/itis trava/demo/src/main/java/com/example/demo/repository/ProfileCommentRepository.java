package com.example.demo.repository;

import com.example.demo.entity.ProfileComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileCommentRepository extends JpaRepository<ProfileComment, Long> {
    List<ProfileComment> findByTargetEmailOrderByCreatedAtDesc(String targetEmail);
}

