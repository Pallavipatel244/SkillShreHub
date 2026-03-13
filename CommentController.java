package com.pallavi.socialmedia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.pallavi.socialmedia.model.Comment;
import com.pallavi.socialmedia.model.Post;
import com.pallavi.socialmedia.model.User;
import com.pallavi.socialmedia.repository.CommentRepository;
import com.pallavi.socialmedia.repository.PostRepository;
import com.pallavi.socialmedia.repository.UserRepository;

@RestController
@RequestMapping("/comments")
@CrossOrigin("*")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    // Add Comment / Answer
    @PostMapping("/create/{postId}/{userId}")
    public Comment createComment(
            @PathVariable Long postId,
            @PathVariable Long userId,
            @RequestBody Comment comment) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        comment.setPost(post);
        comment.setUser(user);

        return commentRepository.save(comment);
    }

    // Get comments for a post
    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPost(@PathVariable Long postId) {

        return commentRepository.findByPostId(postId);

    }

}