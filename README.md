# Nexvent — Event Management System

A full-stack event management system built as a Capstone Project for the Deloitte Training Programme.

## Project Structure

```
nexvent/
├── backend/                 → Spring Boot 3 (Java 17) — REST APIs
├── frontend/                → React 18 — User Interface
├── notification-service/    → Node.js + Express — Notification Microservice
├── docker-compose.yml       → Docker configuration
└── README.md
```


## Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| Frontend     | React 18, React Router, Axios |
| Backend      | Spring Boot 3, Java 17, JWT   |
| Microservice | Node.js, Express.js           |
| Database     | MySQL 8                       |
| Auth         | JWT, BCrypt                   |
| API Docs     | Swagger / OpenAPI             |
| Container    | Docker, Docker Compose        |

## How to Run

### Option 1 — Docker (Recommended)

Make sure Docker Desktop is installed and running.

```bash
git clone https://github.com/Police-Sruthi/nexvent.git
cd nexvent
docker-compose up --build


Open browser: http://localhost:3000
Option 2 — Manual
Terminal 1 — Spring Boot:

cd backend/backend
mvnw.cmd spring-boot:run


Terminal 2 — Node.js:

cd notification-service
node index.js


Terminal 3 — React:

cd frontend
npm start


Open browser: http://localhost:3000
Login Credentials



|Role |Email                                                  |Password  |
|-----|-------------------------------------------------------|----------|
|Admin|[admin@nexvent.io](mailto:admin@nexvent.io)            |nexvent123|
|User |[policesruthi@gmail.com](mailto:policesruthi@gmail.com)|Reddy123  |

Modules



|Module              |Description                                   |
|--------------------|----------------------------------------------|
|User Authentication |JWT login, BCrypt hashing, role-based access  |
|Event Management    |Create, update, delete events with auto status|
|Venue Management    |Add, edit, delete venues with capacity        |
|Attendee Management |Register for events, track attendance         |
|Notification Service|User enquiries, admin replies, reminders      |

Ports



|Service        |Port|
|---------------|----|
|React Frontend |3000|
|Spring Boot API|8080|
|Node.js Service|5000|
|MySQL Database |3306|

Docker Containers



|Container           |Image                 |Port|
|--------------------|----------------------|----|
|nexvent-frontend    |nginx:alpine          |3000|
|nexvent-backend     |eclipse-temurin:17-jdk|8080|
|nexvent-notification|node:18-alpine        |5000|
|nexvent-mysql       |mysql:8.0             |3306|

API Endpoints
Spring Boot — Port 8080



|Method|Endpoint                 |Description        |
|------|-------------------------|-------------------|
|POST  |/api/auth/register       |Register user      |
|POST  |/api/auth/login          |Login get JWT      |
|GET   |/api/events              |Get all events     |
|POST  |/api/events              |Create event       |
|PUT   |/api/events/{id}         |Update event       |
|DELETE|/api/events/{id}         |Delete event       |
|GET   |/api/venues              |Get all venues     |
|POST  |/api/venues              |Create venue       |
|PUT   |/api/venues/{id}         |Update venue       |
|DELETE|/api/venues/{id}         |Delete venue       |
|GET   |/api/attendees/event/{id}|Get event attendees|
|GET   |/api/attendees/user/{id} |Get user bookings  |
|POST  |/api/attendees/register  |Register for event |
|DELETE|/api/attendees/{id}      |Remove attendee    |

Node.js — Port 5000



|Method|Endpoint                |Description        |
|------|------------------------|-------------------|
|GET   |/notifications          |Get all            |
|POST  |/notifications          |Create notification|
|PUT   |/notifications/:id/read |Mark as read       |
|PUT   |/notifications/:id/reply|Admin reply        |
|DELETE|/notifications/:id      |Delete notification|