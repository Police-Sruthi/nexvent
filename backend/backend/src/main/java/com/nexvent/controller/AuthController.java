package com.nexvent.controller;

import com.nexvent.config.JwtUtil;
import com.nexvent.entity.User;
import com.nexvent.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private JwtUtil jwtUtil;

  // POST /api/auth/register
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Map<String, String> body) {

    // Check if email already exists
    if (userRepository.existsByEmail(body.get("email"))) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", "Email already registered"));
    }

    // Create new user
    User user = new User();
    user.setName(body.get("name"));
    user.setEmail(body.get("email"));
    // Hash password before saving — NEVER save plain text!
    user.setPassword(passwordEncoder.encode(body.get("password")));

    userRepository.save(user);

    return ResponseEntity.ok(
        Map.of("message", "Account created successfully!"));
  }

  // POST /api/auth/login
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

    // Find user by email
    var userOpt = userRepository.findByEmail(body.get("email"));

    // Check if user exists and password matches
    if (userOpt.isEmpty() ||
        !passwordEncoder.matches(
            body.get("password"),
            userOpt.get().getPassword())) {
      return ResponseEntity.status(401)
          .body(Map.of("error", "Invalid email or password"));
    }

    // Generate JWT token
    String token = jwtUtil.generateToken(userOpt.get().getEmail());

    // Return token + user info to frontend
    return ResponseEntity.ok(Map.of(
        "token", token,
        "id", userOpt.get().getId(),
        "name", userOpt.get().getName(),
        "role", userOpt.get().getRole().name()));
  }
}