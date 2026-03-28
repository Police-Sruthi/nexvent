const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const fs         = require('fs');
const path       = require('path');

const app  = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'notifications.json');

app.use(cors());
app.use(bodyParser.json());

// Load notifications from file on startup
const loadNotifications = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.log('Starting fresh notifications');
  }
  return [];
};

// Save notifications to file
const saveNotifications = (notifications) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(notifications, null, 2));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
};

let notifications = loadNotifications();
console.log(`Loaded ${notifications.length} notifications from storage`);

// GET all notifications
app.get('/notifications', (req, res) => {
  res.json({ success: true, count: notifications.length, data: notifications });
});

// POST create notification
app.post('/notifications', (req, res) => {
  const { userId, userName, eventId, eventTitle, message, subject, type } = req.body;
  if (!userId && userId !== 0) {
    return res.status(400).json({ success: false, error: 'userId required' });
  }
  if (!message) {
    return res.status(400).json({ success: false, error: 'message required' });
  }
  const notification = {
    id:        notifications.length + 1,
    userId,
    userName,
    eventId,
    eventTitle,
    subject:   subject || 'General enquiry',
    message,
    type:      type || 'registration',
    isRead:    false,
    reply:     null,
    repliedAt: null,
    repliedBy: null,
    createdAt: new Date().toISOString()
  };
  notifications.push(notification);
  saveNotifications(notifications);
  console.log(`New notification from ${userName}: ${message}`);
  res.status(201).json({ success: true, data: notification });
});

// PUT mark as read
app.put('/notifications/:id/read', (req, res) => {
  const id    = parseInt(req.params.id);
  const notif = notifications.find(n => n.id === id);
  if (!notif) return res.status(404).json({ success: false, error: 'Not found' });
  notif.isRead = true;
  saveNotifications(notifications);
  res.json({ success: true, data: notif });
});

// PUT admin reply
app.put('/notifications/:id/reply', (req, res) => {
  const id               = parseInt(req.params.id);
  const { reply, repliedBy } = req.body;
  if (!reply) return res.status(400).json({ success: false, error: 'Reply required' });
  const notif = notifications.find(n => n.id === id);
  if (!notif) return res.status(404).json({ success: false, error: 'Not found' });
  notif.reply     = reply;
  notif.repliedBy = repliedBy || 'Admin';
  notif.repliedAt = new Date().toISOString();
  notif.isRead    = true;
  saveNotifications(notifications);
  console.log(`Admin replied to ${id}: ${reply}`);
  res.json({ success: true, data: notif });
});

// DELETE notification
app.delete('/notifications/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const index = notifications.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
  notifications.splice(index, 1);
  saveNotifications(notifications);
  res.json({ success: true, message: 'Deleted' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, service: 'Nexvent Notification Service', status: 'running', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
  console.log(`Notifications saved to: ${DB_FILE}`);
});