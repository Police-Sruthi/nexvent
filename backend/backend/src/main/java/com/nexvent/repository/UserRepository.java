package com.nexvent.repository;

import com.nexvent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

  // Spring reads this method name and writes the SQL automatically
  // SELECT * FROM users WHERE email = ?
  Optional<User> findByEmail(String email);

  // SELECT COUNT(*) FROM users WHERE email = ? > 0
  boolean existsByEmail(String email);
}
