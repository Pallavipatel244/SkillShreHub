package com.pallavi.socialmedia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pallavi.socialmedia.model.Comment;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostId(Long postId);
}