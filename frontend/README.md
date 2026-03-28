# Frontend — React Application

The frontend for Nexvent built with React 18. Provides role-based dashboards for Admin and User with full event management functionality.

## Tech Stack

| Technology      | Purpose                          |
|-----------------|----------------------------------|
| React 18        | Frontend framework               |
| React Router v6 | Page routing and navigation      |
| Axios           | HTTP API calls to backend        |
| Context API     | Global state management (JWT)    |
| CSS Variables   | Global theming and styling       |

## Folder Structure
```
frontend/src/
├── pages/
│   ├── Login.jsx           → JWT login page
│   ├── Register.jsx        → New user registration
│   ├── Dashboard.jsx       → Role-based dashboard (Admin / User)
│   ├── Events.jsx          → Event management (Admin) / Browse (User)
│   ├── Venues.jsx          → Venue management (Admin) / View (User)
│   ├── Attendees.jsx       → All attendees (Admin) / My Bookings (User)
│   ├── Users.jsx           → User management (Admin only)
│   └── Notifications.jsx   → Enquiries and replies
├── components/
│   └── Sidebar.jsx         → Role-aware navigation sidebar
├── context/
│   └── AuthContext.jsx     → JWT token storage and user state
├── services/
│   └── api.js              → All Axios API calls to Spring Boot and Node.js
├── App.js                  → Routes, PrivateRoute, AdminRoute guards
└── index.css               → Global styles and CSS variables
```

## How to Run
```bash
cd frontend
npm install
npm start
```

App runs at: `http://localhost:3000`

## Pages and Routes

| Route          | Page               | Access     | Description                  |
|----------------|--------------------|------------|------------------------------|
| /login         | Login.jsx          | Public     | JWT login page               |
| /register      | Register.jsx       | Public     | New user registration        |
| /              | Dashboard.jsx      | All users  | Role-based dashboard         |
| /events        | Events.jsx         | All users  | Admin: CRUD / User: Browse   |
| /venues        | Venues.jsx         | All users  | Admin: CRUD / User: View     |
| /attendees     | Attendees.jsx      | Admin only | All event attendees          |
| /my-bookings   | Attendees.jsx      | User only  | Own registrations            |
| /users         | Users.jsx          | Admin only | User management              |
| /notifications | Notifications.jsx  | All users  | Enquiries and replies        |

## Role Based Access

### Admin Features
- Create, update and delete events
- Add, edit and delete venues
- View all attendees for any event
- Reply to user enquiries
- Access budget tracker with PDF report
- Send event reminders to registered users
- View and manage all users

### User Features
- Browse all available events
- Register for upcoming events
- View own bookings and status
- Send enquiries to admin
- View admin replies
- View own notifications and reminders