package com.pallavi.socialmedia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.pallavi.socialmedia.model.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByTopicIgnoreCase(String topic);
   

List<Post> findByArchivedFalse();
List<Post> findByArchivedTrue();
}



