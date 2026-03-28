package com.nexvent.controller;

import com.nexvent.entity.Attendee;
import com.nexvent.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/attendees")
public class AttendeeController {

  @Autowired
  private AttendeeRepository attendeeRepository;

  @Autowired
  private EventRepository eventRepository;

  @Autowired
  private UserRepository userRepository;

  // GET /api/attendees/event/1
  @GetMapping("/event/{eventId}")
  public List<Attendee> getByEvent(@PathVariable Long eventId) {
    return attendeeRepository.findByEventId(eventId);
  }

  // GET /api/attendees/user/1
  @GetMapping("/user/{userId}")
  public List<Attendee> getByUser(@PathVariable Long userId) {
    return attendeeRepository.findByUserId(userId);
  }

  // POST /api/attendees/register
  // Body: { "eventId": 1, "userId": 1 }
  @PostMapping("/register")
  public ResponseEntity<?> register(
      @RequestBody Map<String, Long> body) {

    Long eventId = body.get("eventId");
    Long userId = body.get("userId");

    // Prevent duplicate registration
    if (attendeeRepository.existsByEventIdAndUserId(eventId, userId)) {
      return ResponseEntity.badRequest()
          .body(Map.of("error",
              "Already registered for this event"));
    }

    Attendee attendee = new Attendee();
    attendee.setEvent(eventRepository.findById(eventId)
        .orElseThrow());
    attendee.setUser(userRepository.findById(userId)
        .orElseThrow());

    return ResponseEntity.ok(attendeeRepository.save(attendee));
  }

  // PUT /api/attendees/1/status
  // Body: { "status": "ATTENDED" }
  @PutMapping("/{id}/status")
  public ResponseEntity<Attendee> updateStatus(
      @PathVariable Long id,
      @RequestBody Map<String, String> body) {
    return attendeeRepository.findById(id).map(attendee -> {
      attendee.setStatus(
          Attendee.Status.valueOf(body.get("status")));
      return ResponseEntity.ok(
          attendeeRepository.save(attendee));
    }).orElse(ResponseEntity.notFound().build());
  }

  // DELETE /api/attendees/1
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!attendeeRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    attendeeRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}