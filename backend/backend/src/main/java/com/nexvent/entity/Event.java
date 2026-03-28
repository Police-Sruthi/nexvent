package com.nexvent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Data
public class Event {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  private String description;

  @Column(nullable = false)
  private LocalDate eventDate;

  @Column(nullable = false)
  private LocalTime eventTime;

  @Enumerated(EnumType.STRING)
  private Status status = Status.UPCOMING;

  // Many events can happen at ONE venue
  @ManyToOne
  @JoinColumn(name = "venue_id")
  private Venue venue;

  // Many events can be created by ONE user
  @ManyToOne
  @JoinColumn(name = "created_by")
  private User createdBy;

  private LocalDateTime createdAt = LocalDateTime.now();

  public enum Status {
    UPCOMING,
    ONGOING,
    COMPLETED,
    CANCELLED
  }
}
