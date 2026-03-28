import axios from 'axios';

const SPRING_URL = 'http://localhost:8080/api';
const NODE_URL   = 'http://localhost:5000';

const api = axios.create({ baseURL: SPRING_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── AUTH ────────────────────────────────────────────
export const registerUser = (data) => axios.post(`${SPRING_URL}/auth/register`, data);
export const loginUser    = (data) => axios.post(`${SPRING_URL}/auth/login`, data);

// ── EVENTS ──────────────────────────────────────────
export const getEvents   = ()         => api.get('/events');
export const getEvent    = (id)       => api.get(`/events/${id}`);
export const createEvent = (data)     => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id)       => api.delete(`/events/${id}`);

export const getEventsWithAutoStatus = async () => {
  const response = await api.get('/events');
  const today    = new Date().toISOString().slice(0, 10);
  const updated  = response.data.map(event => {
    if (event.eventDate === today && event.status === 'UPCOMING') {
      return { ...event, status: 'ONGOING' };
    }
    if (event.eventDate < today && event.status === 'UPCOMING') {
      return { ...event, status: 'COMPLETED' };
    }
    return event;
  });
  return { ...response, data: updated };
};

// ── VENUES ──────────────────────────────────────────
export const getVenues   = ()         => api.get('/venues');
export const getVenue    = (id)       => api.get(`/venues/${id}`);
export const createVenue = (data)     => api.post('/venues', data);
export const updateVenue = (id, data) => api.put(`/venues/${id}`, data);
export const deleteVenue = (id)       => api.delete(`/venues/${id}`);

// ── ATTENDEES ────────────────────────────────────────
export const getEventAttendees    = (eventId)    => api.get(`/attendees/event/${eventId}`);
export const getUserAttendees = (userId) =>
  api.get(`/attendees/user/${userId}`);
export const registerAttendee     = (data)       => api.post('/attendees/register', data);
export const updateAttendeeStatus = (id, status) => api.put(`/attendees/${id}/status`, { status });
export const deleteAttendee       = (id)         => api.delete(`/attendees/${id}`);

// ── NOTIFICATIONS (Node.js) ──────────────────────────
export const getAllNotifications  = ()    => axios.get(`${NODE_URL}/notifications`);
export const createNotification   = (data) => axios.post(`${NODE_URL}/notifications`, data);
export const markNotificationRead = (id)  => axios.put(`${NODE_URL}/notifications/${id}/read`);
export const replyToNotification  = (id, reply, repliedBy) =>
  axios.put(`${NODE_URL}/notifications/${id}/reply`, { reply, repliedBy });
export const deleteNotification   = (id)  => axios.delete(`${NODE_URL}/notifications/${id}`);