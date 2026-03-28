# Backend — Spring Boot REST API

The primary backend for Nexvent, built with Spring Boot 3 and Java 17. Handles authentication, event management, venue management, and attendee registration.

## Tech Stack

| Technology        | Purpose                        |
|-------------------|--------------------------------|
| Spring Boot 3     | Backend framework              |
| Java 17           | Programming language           |
| Spring Security   | Authentication and JWT filter  |
| JWT (jjwt 0.11.5) | Token generation and validation|
| Spring Data JPA   | Database ORM                   |
| Hibernate         | ORM implementation             |
| MySQL 8           | Relational database            |
| Swagger/OpenAPI   | API documentation              |
| BCrypt            | Password hashing               |

## Folder Structure
```
backend/backend/
├── src/
│   └── main/
│       ├── java/com/nexvent/
│       │   ├── controller/
│       │   │   ├── AuthController.java       → Login and Register APIs
│       │   │   ├── EventController.java      → Event CRUD APIs
│       │   │   ├── VenueController.java      → Venue CRUD APIs
│       │   │   └── AttendeeController.java   → Attendee Registration APIs
│       │   ├── entity/
│       │   │   ├── User.java                 → User entity
│       │   │   ├── Event.java                → Event entity
│       │   │   ├── Venue.java                → Venue entity
│       │   │   └── Attendee.java             → Attendee entity
│       │   ├── repository/
│       │   │   ├── UserRepository.java       → User DB queries
│       │   │   ├── EventRepository.java      → Event DB queries
│       │   │   ├── VenueRepository.java      → Venue DB queries
│       │   │   └── AttendeeRepository.java   → Attendee DB queries
│       │   └── config/
│       │       ├── JwtUtil.java              → JWT token generation
│       │       ├── JwtFilter.java            → JWT request filter
│       │       └── SecurityConfig.java       → Spring Security config
│       └── resources/
│           └── application.properties        → Database and JWT config
└── pom.xml                                   → Maven dependencies
```

## How to Run
```bash
cd backend/backend
mvnw.cmd spring-boot:run
```

Server starts at: `http://localhost:8080`

## API Endpoints

### Authentication
| Method | Endpoint              | Description              | Auth Required |
|--------|-----------------------|--------------------------|---------------|
| POST   | /api/auth/register    | Register new user        | No            |
| POST   | /api/auth/login       | Login and get JWT token  | No            |

### Events
| Method | Endpoint              | Description              | Auth Required |
|--------|-----------------------|--------------------------|---------------|
| GET    | /api/events           | Get all events           | Yes           |
| GET    | /api/events/{id}      | Get event by ID          | Yes           |
| POST   | /api/events           | Create event             | Admin only    |
| PUT    | /api/events/{id}      | Update event             | Admin only    |
| DELETE | /api/events/{id}      | Delete event             | Admin only    |

### Venues
| Method | Endpoint              | Description              | Auth Required |
|--------|-----------------------|--------------------------|---------------|
| GET    | /api/venues           | Get all venues           | Yes           |
| GET    | /api/venues/{id}      | Get venue by ID          | Yes           |
| POST   | /api/venues           | Create venue             | Admin only    |
| PUT    | /api/venues/{id}      | Update venue             | Admin only    |
| DELETE | /api/venues/{id}      | Delete venue             | Admin only    |

### Attendees
| Method | Endpoint                       | Description               | Auth Required |
|--------|--------------------------------|---------------------------|---------------|
| GET    | /api/attendees/event/{id}      | Get attendees for event   | Yes           |
| GET    | /api/attendees/user/{id}       | Get user registrations    | Yes           |
| POST   | /api/attendees/register        | Register for event        | Yes           |
| PUT    | /api/attendees/{id}/status     | Update attendee status    | Admin only    |
| DELETE | /api/attendees/{id}            | Remove attendee           | Admin only    |

## Database Tables

| Table     | Description                          |
|-----------|--------------------------------------|
| users     | User accounts with roles             |
| events    | Event details with status and venue  |
| venues    | Venue details with capacity          |
| attendees | Event registrations per user         |

## Swagger UI

Access API documentation at:
```
http://localhost:8080/swagger-ui.html
```

## Environment Configuration
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/nexvent_db
spring.datasource.username=root
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```