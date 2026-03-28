package com.nexvent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendees")
@Data
public class Attendee {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Many attendees can be in ONE event
  @ManyToOne
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  // Many attendees can be ONE user
  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  private Status status = Status.REGISTERED;

  private LocalDateTime registeredAt = LocalDateTime.now();

  public enum Status {
    REGISTERED,
    ATTENDED,
    CANCELLED
  }
}