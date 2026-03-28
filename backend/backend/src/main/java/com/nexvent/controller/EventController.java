package com.nexvent.controller;

import com.nexvent.entity.Event;
import com.nexvent.repository.EventRepository;
import com.nexvent.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

  @Autowired
  private EventRepository eventRepository;

  @Autowired
  private VenueRepository venueRepository;

  // GET /api/events
  @GetMapping
  public List<Event> getAllEvents() {
    return eventRepository.findAll();
  }

  // GET /api/events/1
  @GetMapping("/{id}")
  public ResponseEntity<Event> getEventById(@PathVariable Long id) {
    return eventRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // POST /api/events
  @PostMapping
  public ResponseEntity<Event> createEvent(@RequestBody Event event) {
    if (event.getVenue() != null && event.getVenue().getId() != null) {
      venueRepository.findById(event.getVenue().getId())
          .ifPresent(event::setVenue);
    }
    return ResponseEntity.ok(eventRepository.save(event));
  }

  // PUT /api/events/1
  @PutMapping("/{id}")
  public ResponseEntity<Event> updateEvent(
      @PathVariable Long id,
      @RequestBody Event updatedEvent) {
    return eventRepository.findById(id).map(event -> {
      event.setTitle(updatedEvent.getTitle());
      event.setDescription(updatedEvent.getDescription());
      event.setEventDate(updatedEvent.getEventDate());
      event.setEventTime(updatedEvent.getEventTime());
      event.setStatus(updatedEvent.getStatus());
      if (updatedEvent.getVenue() != null &&
          updatedEvent.getVenue().getId() != null) {
        venueRepository.findById(updatedEvent.getVenue().getId())
            .ifPresent(event::setVenue);
      }
      return ResponseEntity.ok(eventRepository.save(event));
    }).orElse(ResponseEntity.notFound().build());
  }

  // DELETE /api/events/1
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
    if (!eventRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    eventRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}