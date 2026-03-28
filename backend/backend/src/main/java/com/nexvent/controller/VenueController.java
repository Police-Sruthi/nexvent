package com.nexvent.controller;

import com.nexvent.entity.Venue;
import com.nexvent.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

  @Autowired
  private VenueRepository venueRepository;

  // GET /api/venues
  @GetMapping
  public List<Venue> getAllVenues() {
    return venueRepository.findAll();
  }

  // GET /api/venues/1
  @GetMapping("/{id}")
  public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
    return venueRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // POST /api/venues
  @PostMapping
  public Venue createVenue(@RequestBody Venue venue) {
    return venueRepository.save(venue);
  }

  // PUT /api/venues/1
  @PutMapping("/{id}")
  public ResponseEntity<Venue> updateVenue(
      @PathVariable Long id,
      @RequestBody Venue updatedVenue) {
    return venueRepository.findById(id).map(venue -> {
      venue.setName(updatedVenue.getName());
      venue.setLocation(updatedVenue.getLocation());
      venue.setCapacity(updatedVenue.getCapacity());
      venue.setDescription(updatedVenue.getDescription());
      return ResponseEntity.ok(venueRepository.save(venue));
    }).orElse(ResponseEntity.notFound().build());
  }

  // DELETE /api/venues/1
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
    if (!venueRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    venueRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
