# Nexvent — Event Management System

A full-stack event management system built as a Capstone Project for the Deloitte Training Programme.

## Project Structure
```
nexvent/
├── backend/                 → Spring Boot 3 (Java 17) — REST APIs
├── frontend/                → React 18 — User Interface
├── notification-service/    → Node.js + Express — Notification Microservice
└── README.md
```

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React 18, React Router, Axios     |
| Backend        | Spring Boot 3, Java 17, JWT       |
| Microservice   | Node.js, Express.js               |
| Database       | MySQL 8                           |
| Auth           | JWT, BCrypt                       |
| API Docs       | Swagger / OpenAPI                 |

## How to Run

**Terminal 1 — Spring Boot:**
```bash
cd backend/backend
mvnw.cmd spring-boot:run
```

**Terminal 2 — Node.js:**
```bash
cd notification-service
node index.js
```

**Terminal 3 — React:**
```bash
cd frontend
npm start
```

Open browser: `http://localhost:3000`

## Login Credentials

| Admin | admin@nexvent.io       | nexvent123 |
| User  | policesruthi@gmail.com | Reddy123   |

## Modules

| Module                | Description                                      |
|-----------------------|--------------------------------------------------|
| User Authentication   | JWT login, BCrypt hashing, role-based access     |
| Event Management      | Create, update, delete events with auto status   |
| Venue Management      | Add, edit, delete venues with capacity tracking  |
| Attendee Management   | Register for events, track attendance status     |
| Notification Service  | User enquiries, admin replies, event reminders   |

## Ports

| Service          | Port |
|------------------|------|
| React Frontend   | 3000 |
| Spring Boot API  | 8080 |
| Node.js Service  | 5000 |
| MySQL Database   | 3306 |