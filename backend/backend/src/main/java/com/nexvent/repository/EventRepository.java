package com.nexvent.repository;

import com.nexvent.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

  // Get all events with a specific status
  // SQL: SELECT * FROM events WHERE status = ?
  List<Event> findByStatus(Event.Status status);

  // Get all events at a specific venue
  // SQL: SELECT * FROM events WHERE venue_id = ?
  List<Event> findByVenueId(Long venueId);
}