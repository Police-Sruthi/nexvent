import React, { useState, useEffect } from 'react';
import {
  getEventsWithAutoStatus, getVenues, createEvent,
  deleteEvent, getEventAttendees, createNotification
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Events() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  const [events,     setEvents]     = useState([]);
  const [venues,     setVenues]     = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [sending,    setSending]    = useState(null);
  const [showVendor, setShowVendor] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '',
    eventDate: '',
    startHour: '09', startMinute: '00', startAmpm: 'AM',
    endHour:   '06', endMinute:   '00', endAmpm:   'PM',
    venueId: '',
    vendorName: '', vendorContact: '', vendorNotes: ''
  });

  useEffect(() => {
    loadEvents();
    getVenues().then(function(r) { setVenues(r.data || []); });
  }, []);

  function loadEvents() {
    getEventsWithAutoStatus().then(function(r) { setEvents(r.data || []); });
  }

  function handleChange(e) {
    var updated = Object.assign({}, form);
    updated[e.target.name] = e.target.value;
    setForm(updated);
  }

  function convertTo24(hour, minute, ampm) {
    var h = Number(hour);
    var hour24 = ampm === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    return String(hour24).padStart(2, '0') + ':' + minute;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    var startTime = convertTo24(form.startHour, form.startMinute, form.startAmpm);
    var duration  = form.startHour + ':' + form.startMinute + ' ' + form.startAmpm + ' to ' + form.endHour + ':' + form.endMinute + ' ' + form.endAmpm;
    var vendorInfo = form.vendorName
      ? '\n\nVendor: ' + form.vendorName + ' | Contact: ' + form.vendorContact + ' | Notes: ' + form.vendorNotes
      : '';
    await createEvent({
      title:       form.title,
      description: (form.description || '') + '\n\nDuration: ' + duration + vendorInfo,
      eventDate:   form.eventDate,
      eventTime:   startTime + ':00',
      venue: form.venueId ? { id: Number(form.venueId) } : null
    });
    setForm({
      title: '', description: '', eventDate: '',
      startHour: '09', startMinute: '00', startAmpm: 'AM',
      endHour:   '06', endMinute:   '00', endAmpm:   'PM',
      venueId: '', vendorName: '', vendorContact: '', vendorNotes: ''
    });
    setShowForm(false);
    loadEvents();
  }

  async function handleDelete(id) {
    if (window.confirm('Delete this event?')) {
      await deleteEvent(id);
      loadEvents();
    }
  }

  // ── SEND REMINDER — sends to USERS only based on event timing ──
  async function handleSendReminder(ev) {
    setSending(ev.id);
    try {
      var attendeesRes = await getEventAttendees(ev.id);
      var list = attendeesRes.data || [];

      if (list.length === 0) {
        alert('No attendees registered for this event yet!');
        setSending(null);
        return;
      }

      // Calculate timing for reminder message
      var now = new Date();
      var eventDateStr = ev.eventDate || '';
      var eventTimeStr = ev.eventTime || '00:00';
      var parts = eventDateStr.split('-');
      var timeParts = eventTimeStr.split(':');
      var eventDateTime = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]),
        Number(timeParts[0]),
        Number(timeParts[1]),
        0
      );

      var diffMs      = eventDateTime - now;
      var diffHours   = diffMs / (1000 * 60 * 60);
      var diffDays    = diffHours / 24;

      // Pick the right reminder message based on timing
      var reminderType = '';
      var reminderMsg  = '';

      if (diffDays > 1) {
        reminderType = '1day';
        var daysLeft = Math.ceil(diffDays);
        reminderMsg = '\uD83D\uDD14 Reminder: "' + ev.title + '" is happening in ' + daysLeft + ' day(s) on ' + ev.eventDate + '!'
          + (ev.venue ? ' Venue: ' + ev.venue.name + '.' : '')
          + ' Please make sure you have confirmed your attendance.';
      } else if (diffHours > 1 && diffDays <= 1) {
        reminderType = 'today';
        reminderMsg = '\uD83C\uDF05 Today\'s the day! "' + ev.title + '" is happening today at '
          + formatTime(ev.eventTime) + '!'
          + (ev.venue ? ' Venue: ' + ev.venue.name + '.' : '')
          + ' We look forward to seeing you there!';
      } else if (diffHours > 0 && diffHours <= 1) {
        reminderType = '1hour';
        reminderMsg = '\u23F0 "' + ev.title + '" starts in about 1 hour at '
          + formatTime(ev.eventTime) + '!'
          + (ev.venue ? ' Venue: ' + ev.venue.name + '.' : '')
          + ' See you there!';
      } else {
        reminderType = 'now';
        reminderMsg = '\uD83D\uDFE0 "' + ev.title + '" is happening right now!'
          + (ev.venue ? ' Venue: ' + ev.venue.name + '.' : '');
      }

      // Send notification to EACH USER attendee only
      var count = 0;
      for (var i = 0; i < list.length; i++) {
        var attendee = list[i];
        var attendeeUserId   = attendee.user ? attendee.user.id   : (attendee.userId   || 0);
        var attendeeUserName = attendee.user ? attendee.user.name : (attendee.userName || 'User');

        // Skip if this is the admin themselves
        if (attendeeUserName === user.name) continue;

        await createNotification({
          userId:     attendeeUserId,
          userName:   attendeeUserName,
          eventId:    ev.id,
          eventTitle: ev.title,
          type:       'reminder',
          subject:    'Event Reminder',
          message:    reminderMsg
        });
        count++;
      }

      if (count === 0) {
        alert('No user attendees found to send reminders to!');
      } else {
        alert('Reminder sent to ' + count + ' attendee(s) for "' + ev.title + '"!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSending(null);
    }
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    var parts = timeStr.split(':');
    var h     = Number(parts[0]);
    var m     = parts[1] || '00';
    var ampm  = h >= 12 ? 'PM' : 'AM';
    var h12   = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return String(h12).padStart(2, '0') + ':' + m + ' ' + ampm;
  }

  function TimeSelector(props) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <select className="input" value={form[props.hourKey]}
          onChange={function(e) {
            var u = Object.assign({}, form); u[props.hourKey] = e.target.value; setForm(u);
          }} style={{ width: 72 }}>
          {['01','02','03','04','05','06','07','08','09','10','11','12'].map(function(h) {
            return <option key={h} value={h}>{h}</option>;
          })}
        </select>
        <select className="input" value={form[props.minuteKey]}
          onChange={function(e) {
            var u = Object.assign({}, form); u[props.minuteKey] = e.target.value; setForm(u);
          }} style={{ width: 72 }}>
          {['00','05','10','15','20','25','30','35','40','45','50','55'].map(function(m) {
            return <option key={m} value={m}>{m}</option>;
          })}
        </select>
        <select className="input" value={form[props.ampmKey]}
          onChange={function(e) {
            var u = Object.assign({}, form); u[props.ampmKey] = e.target.value; setForm(u);
          }} style={{ width: 72 }}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    );
  }

  return (
    <div className="page-body">

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5 }}>
            {isAdmin ? 'Event management' : 'Browse events'}
          </h2>
          <p style={{ color:'#64748B', fontSize:13, marginTop:3 }}>
            {isAdmin ? 'Create, manage events and send reminders to attendees' : 'View all available events'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-teal" onClick={function() { setShowForm(!showForm); }}>
            {showForm ? '✕ Cancel' : '+ New event'}
          </button>
        )}
      </div>

      {/* Create Form — Admin only */}
      {isAdmin && showForm && (
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Create new event</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Title *</label>
                <input className="input" name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Tech Summit 2026" required />
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Venue</label>
                <select className="input" name="venueId" value={form.venueId} onChange={handleChange}>
                  <option value="">-- Select venue --</option>
                  {venues.map(function(v) {
                    return <option key={v.id} value={v.id}>{v.name} (cap: {v.capacity})</option>;
                  })}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Date *</label>
              <input className="input" type="date" name="eventDate" value={form.eventDate}
                onChange={handleChange} required style={{ maxWidth:220 }} />
            </div>

            {/* Duration */}
            <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, padding:'14px 16px', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:12 }}>
                Event duration
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'center' }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#0D9488', display:'block', marginBottom:6 }}>Start time</label>
                  <TimeSelector hourKey="startHour" minuteKey="startMinute" ampmKey="startAmpm" />
                </div>
                <div style={{ textAlign:'center', marginTop:20 }}>
                  <div style={{ background:'#0D9488', color:'white', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>to</div>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#EF4444', display:'block', marginBottom:6 }}>End time</label>
                  <TimeSelector hourKey="endHour" minuteKey="endMinute" ampmKey="endAmpm" />
                </div>
              </div>
              <div style={{ marginTop:10, background:'#F0FDFA', border:'1px solid #99F6E4', borderRadius:7, padding:'8px 12px', fontSize:12, color:'#0F766E', fontWeight:600 }}>
                🕐 {form.startHour}:{form.startMinute} {form.startAmpm} → {form.endHour}:{form.endMinute} {form.endAmpm}
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Description</label>
              <textarea className="input" name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your event..." rows={3} style={{ resize:'none', lineHeight:1.6 }} />
            </div>

            {/* Vendor */}
            <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'12px 16px', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showVendor ? 12 : 0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#92400E' }}>🤝 Vendor coordination (optional)</div>
                <button type="button" onClick={function() { setShowVendor(!showVendor); }}
                  style={{ background:'none', border:'none', color:'#92400E', cursor:'pointer', fontSize:12 }}>
                  {showVendor ? 'Hide ▲' : 'Add vendor ▼'}
                </button>
              </div>
              {showVendor && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div>
                      <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Vendor name</label>
                      <input className="input" name="vendorName" value={form.vendorName} onChange={handleChange} placeholder="e.g. AV Solutions" />
                    </div>
                    <div>
                      <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Vendor contact</label>
                      <input className="input" name="vendorContact" value={form.vendorContact} onChange={handleChange} placeholder="e.g. +91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Vendor notes</label>
                    <input className="input" name="vendorNotes" value={form.vendorNotes} onChange={handleChange} placeholder="e.g. Sound system, projector, stage setup" />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" className="btn btn-teal">Save event</button>
              <button type="button" className="btn" onClick={function() { setShowForm(false); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              {(isAdmin
                ? ['Title','Date','Duration','Venue','Status','Actions']
                : ['Title','Date','Duration','Venue','Status']
              ).map(function(h) {
                return <th key={h} style={{ paddingLeft: h==='Title' ? 16 : 12 }}>{h}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ padding:28, textAlign:'center', color:'#94A3B8', fontSize:13 }}>
                  {isAdmin ? 'No events yet — create your first one!' : 'No events available yet'}
                </td>
              </tr>
            ) : events.map(function(ev) {
              var displayTime = formatTime(ev.eventTime);
              var duration    = displayTime;
              if (ev.description && ev.description.includes('Duration:')) {
                var match = ev.description.match(/Duration: (.+)/);
                if (match) duration = match[1];
              }
              return (
                <tr key={ev.id}>
                  <td style={{ paddingLeft:16, fontWeight:600 }}>{ev.title}</td>
                  <td style={{ color:'#64748B' }}>{ev.eventDate}</td>
                  <td>
                    <span style={{ background:'#F0FDFA', border:'1px solid #99F6E4', borderRadius:6, padding:'2px 8px', fontSize:11, color:'#0F766E', fontWeight:600 }}>
                      🕐 {duration}
                    </span>
                  </td>
                  <td style={{ color:'#64748B' }}>{ev.venue ? ev.venue.name : '—'}</td>
                  <td>
                    <span className={'badge badge-' + (ev.status ? ev.status.toLowerCase() : '')}>{ev.status}</span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <button
                          onClick={function() { handleSendReminder(ev); }}
                          disabled={sending === ev.id}
                          style={{ background:'#FFFBEB', border:'1px solid #FDE68A', color:'#92400E', padding:'3px 10px', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}
                          title="Send reminder to all registered users">
                          {sending === ev.id ? '...' : '🔔 Remind'}
                        </button>
                        <button
                          onClick={function() { handleDelete(ev.id); }}
                          style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', fontSize:12, padding:'3px 6px' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reminder info box for admin */}
      {isAdmin && (
        <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, padding:'10px 14px', marginTop:12, fontSize:12, color:'#92400E' }}>
          🔔 <strong>Remind button:</strong> Sends reminder to all registered users for that event. Message changes based on timing — more than 1 day away, same day, or within 1 hour.
        </div>
      )}

      {!isAdmin && (
        <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'10px 14px', marginTop:12, fontSize:12, color:'#1E40AF' }}>
          💡 Go to <strong>Dashboard</strong> and click <strong>View &amp; Register</strong> on any event to register!
        </div>
      )}
    </div>
  );
}