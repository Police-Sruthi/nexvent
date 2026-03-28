# Notification Service — Node.js Microservice

A lightweight Node.js microservice built with Express.js that handles all notifications for the Nexvent platform. Runs independently from the Spring Boot backend on port 5000.

## Tech Stack

| Technology  | Purpose                        |
|-------------|--------------------------------|
| Node.js     | JavaScript runtime             |
| Express.js  | Web framework                  |
| CORS        | Cross origin request handling  |
| File System | JSON file based data storage   |

## Folder Structure
```
notification-service/
├── index.js                → Express server with all endpoints
├── notifications.json      → File based persistent storage
├── package.json            → Node.js dependencies
└── README.md               → Documentation
```

## How to Run
```bash
cd notification-service
npm install
node index.js
```

Service runs at: `http://localhost:5000`

## API Endpoints

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | /notifications                | Get all notifications              |
| POST   | /notifications                | Create new notification            |
| PUT    | /notifications/:id/read       | Mark notification as read          |
| PUT    | /notifications/:id/reply      | Admin reply to notification        |
| DELETE | /notifications/:id            | Delete notification                |
| GET    | /health                       | Health check endpoint              |

## Notification Types

| Type         | Description                              | Who Sees It  |
|--------------|------------------------------------------|--------------|
| registration | User registered for an event             | User only    |
| reminder     | Admin sent reminder before event         | User only    |
| enquiry      | User sent message via Contact & Support  | Admin only   |

## How Notifications Work
```
USER side:
1. User registers for event → registration notification created
2. Admin clicks Remind button → reminder notification sent to user
3. User sends enquiry → enquiry notification goes to admin
4. Admin replies → user sees reply in purple box

ADMIN side:
1. Admin sees only enquiries in Notifications page
2. Admin clicks Reply → types response → clicks Send Reply
3. User sees the reply under their original message
```

## Data Storage

Notifications are stored in `notifications.json` file:
```json
[
  {
    "id": 1,
    "userId": 2,
    "userName": "Sruthi",
    "eventId": 1,
    "eventTitle": "Tech Summit 2026",
    "type": "registration",
    "message": "You have registered for Tech Summit 2026!",
    "isRead": false,
    "reply": null,
    "repliedBy": null,
    "repliedAt": null,
    "createdAt": "2026-03-23T10:00:00.000Z"
  }
]
```

## Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{ "status": "ok", "service": "Nexvent Notification Service" }
```