package com.pallavi.socialmedia.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.pallavi.socialmedia.model.User;
import com.pallavi.socialmedia.repository.UserRepository;
import com.pallavi.socialmedia.service.UserService;

@RestController
@RequestMapping("/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // Get all users
    @GetMapping("/all")
    public List<User> getUsers(){
        return userService.getAllUsers();
    }

    // Get user by id
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id){
        return userService.getUserById(id);
    }

    // Upload profile image
    @PostMapping("/uploadProfile/{userId}")
    public User uploadProfileImage(
            @PathVariable Long userId,
            @RequestParam("image") MultipartFile image
    ) throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        File folder = new File(UPLOAD_DIR);
        if(!folder.exists()){
            folder.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();

        File file = new File(UPLOAD_DIR + File.separator + fileName);
        image.transferTo(file);

        user.setProfileImage("/uploads/" + fileName);

        return userRepository.save(user);
    }
}