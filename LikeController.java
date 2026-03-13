package com.pallavi.socialmedia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.pallavi.socialmedia.model.Like;
import com.pallavi.socialmedia.model.Post;
import com.pallavi.socialmedia.model.User;
import com.pallavi.socialmedia.repository.LikeRepository;
import com.pallavi.socialmedia.repository.PostRepository;
import com.pallavi.socialmedia.repository.UserRepository;

@RestController
@RequestMapping("/likes")
@CrossOrigin("*")
public class LikeController {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    // Add Like
    @PostMapping("/{postId}/{userId}")
    public String likePost(@PathVariable Long postId, @PathVariable Long userId) {

        if (likeRepository.existsByUserIdAndPostId(userId, postId)) {
            return "Already liked";
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Like like = new Like();

        like.setPost(post);
        like.setUser(user);

        likeRepository.save(like);

        return "Post liked successfully";
    }

    // Remove Like
    @DeleteMapping("/{postId}/{userId}")
    public String removeLike(@PathVariable Long postId, @PathVariable Long userId) {

        Like like = likeRepository.findByUserIdAndPostId(userId, postId);

        if (like == null) {
            return "Like not found";
        }

        likeRepository.delete(like);

        return "Like removed";
    }

    // Like Count
    @GetMapping("/count/{postId}")
    public long getLikeCount(@PathVariable Long postId) {

        return likeRepository.countByPostId(postId);

    }

}