package com.nexvent.repository;

import com.nexvent.entity.Attendee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendeeRepository extends JpaRepository<Attendee, Long> {

  // Get all attendees for one event
  List<Attendee> findByEventId(Long eventId);

  // Get all events a user is attending
  List<Attendee> findByUserId(Long userId);

  // Check if user already registered for this event
  boolean existsByEventIdAndUserId(Long eventId, Long userId);
}