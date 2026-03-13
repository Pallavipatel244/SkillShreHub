package com.pallavi.socialmedia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pallavi.socialmedia.model.Like;

public interface LikeRepository extends JpaRepository<Like, Long> {

    boolean existsByUserIdAndPostId(Long userId, Long postId);

    long countByPostId(Long postId);

    Like findByUserIdAndPostId(Long userId, Long postId);

}