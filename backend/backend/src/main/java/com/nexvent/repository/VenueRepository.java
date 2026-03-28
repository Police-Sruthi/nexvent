package com.nexvent.repository;

import com.nexvent.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {

  // JpaRepository already gives us everything we need for venues!
  // findAll(), findById(), save(), deleteById() - all free!
}