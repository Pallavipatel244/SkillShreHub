package com.pallavi.socialmedia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pallavi.socialmedia.model.User;

public interface UserRepository extends JpaRepository<User, Long>{

    User findByEmail(String email);
}