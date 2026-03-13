package com.pallavi.socialmedia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String content;

    // Example: Java, Spring Boot, Flutter
    private String topic;

    // Example: Question, Discussion
    private String postType;

    // NEW: Image for post
    private String imageUrl;

    // Timestamp
    private LocalDateTime createdAt;
    private boolean archived = false;

    // Post owner
    @ManyToOne
@JoinColumn(name = "user_id")
@JsonIgnoreProperties({"posts","password"})
private User user;

    // Post comments
    
@OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
@JsonIgnore
private List<Comment> comments;

    // Like count (simple approach)
    private int likeCount;

    public Post() {
        this.createdAt = LocalDateTime.now();
        this.likeCount = 0;
    }

    /* ================= GETTERS ================= */

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getTopic() {
        return topic;
    }

    public String getPostType() {
        return postType;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public User getUser() {
        return user;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public int getLikeCount() {
        return likeCount;
    }

    /* ================= SETTERS ================= */

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public void setPostType(String postType) {
        this.postType = postType;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}
    public boolean isArchived() {
    return archived;
}

public void setArchived(boolean archived) {
    this.archived = archived;
}
}