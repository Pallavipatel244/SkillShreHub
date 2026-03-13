package com.pallavi.socialmedia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.pallavi.socialmedia.model.Post;
import com.pallavi.socialmedia.model.User;
import com.pallavi.socialmedia.repository.PostRepository;
import com.pallavi.socialmedia.repository.UserRepository;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/posts")
@CrossOrigin("*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    // Folder to store uploaded images
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    /* ================= CREATE POST ================= */

    @PostMapping("/create/{userId}")
public Post createPost(
        @PathVariable Long userId,
        @RequestParam String title,
        @RequestParam String content,
        @RequestParam String topic,
        @RequestParam String postType,
        @RequestParam(required = false) MultipartFile image
) throws IOException {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Post post = new Post();
    post.setTitle(title);
    post.setContent(content);
    post.setTopic(topic);
    post.setPostType(postType);
    post.setUser(user);
    post.setCreatedAt(LocalDateTime.now());   // ✅ FIX

    if (image != null && !image.isEmpty()) {

        File folder = new File(UPLOAD_DIR);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();

        File file = new File(UPLOAD_DIR + fileName);
        image.transferTo(file);

        post.setImageUrl("/uploads/" + fileName);
    }

    return postRepository.save(post);
}

    /* ================= FEED ================= */

    @GetMapping("/feed")
    public List<Post> getFeed() {

        return postRepository.findByArchivedFalse();
    }             
@GetMapping("/archived")
public List<Post> getArchivedPosts(){
    return postRepository.findByArchivedTrue();
}
    

    /* ================= POSTS BY TOPIC ================= */

    @GetMapping("/topic/{topic}")
    public List<Post> getPostsByTopic(@PathVariable String topic) {

        return postRepository.findByTopicIgnoreCase(topic);

    }

    /* ================= LIKE POST ================= */

    @PostMapping("/like/{postId}")
    public Post likePost(@PathVariable Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setLikeCount(post.getLikeCount() + 1);

        return postRepository.save(post);

    }

    /* ================= DELETE POST ================= */

    @DeleteMapping("/delete/{id}")
    public String deletePost(@PathVariable Long id) {

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        postRepository.delete(post);

        return "Post deleted successfully";

    }
@PutMapping("/archive/{id}")
public Post archivePost(@PathVariable Long id){

Post post = postRepository.findById(id).orElseThrow();

post.setArchived(true);

return postRepository.save(post);

}
@PutMapping("/restore/{id}")
public Post restorePost(@PathVariable Long id){

Post post = postRepository.findById(id).orElseThrow();

post.setArchived(false);

return postRepository.save(post);

}
@PutMapping("/edit/{id}")
public Post editPost(@PathVariable Long id, @RequestBody Post updatedPost){

Post post = postRepository.findById(id).orElseThrow();

post.setTitle(updatedPost.getTitle());
post.setContent(updatedPost.getContent());
post.setTopic(updatedPost.getTopic());

return postRepository.save(post);
}
@PutMapping("/unlike/{postId}")
public Post unlikePost(@PathVariable Long postId){

Post post = postRepository.findById(postId)
.orElseThrow(() -> new RuntimeException("Post not found"));

if(post.getLikeCount() > 0){
post.setLikeCount(post.getLikeCount() - 1);
}

return postRepository.save(post);
}

}