import React, { useState, useEffect } from 'react';
import {
  getUserAttendees, getEventAttendees,
  getEvents, deleteAttendee, updateAttendeeStatus
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Attendees() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  const [attendees,     setAttendees]     = useState([]);
  const [events,        setEvents]        = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  useEffect(function() {
    if (isAdmin) {
      getEvents()
        .then(function(r) { setEvents(r.data || []); })
        .catch(console.error)
        .finally(function() { setLoading(false); });
    } else {
      loadUserBookings();
    }
  }, [isAdmin]);

  function loadUserBookings() {
    setLoading(true);
    setError('');
    var userId = user ? user.id : null;
    if (!userId) {
      setLoading(false);
      setError('User ID not found. Please log out and log in again.');
      return;
    }
    getUserAttendees(userId)
      .then(function(r) {
        var data = Array.isArray(r.data) ? r.data : [];
        setAttendees(data);
        if (data.length === 0) {
          setError('');
        }
      })
      .catch(function(err) {
        console.error('Bookings fetch error:', err);
        setError('Failed to load bookings. Make sure Spring Boot is running on port 8080.');
        setAttendees([]);
      })
      .finally(function() { setLoading(false); });
  }

  function loadEventAttendees(eventId) {
    setSelectedEvent(eventId);
    if (!eventId) { setAttendees([]); return; }
    getEventAttendees(eventId)
      .then(function(r) { setAttendees(Array.isArray(r.data) ? r.data : []); })
      .catch(function() { setAttendees([]); });
  }

  function handleRemove(id) {
    if (!window.confirm('Remove this registration?')) return;
    deleteAttendee(id)
      .then(function() {
        if (isAdmin && selectedEvent) loadEventAttendees(selectedEvent);
        else loadUserBookings();
      })
      .catch(function() { alert('Failed to remove. Please try again.'); });
  }

  function handleStatusChange(id, status) {
    updateAttendeeStatus(id, status)
      .then(function() {
        if (isAdmin && selectedEvent) loadEventAttendees(selectedEvent);
        else loadUserBookings();
      })
      .catch(function() { alert('Failed to update status.'); });
  }

  var registered = attendees.filter(function(a) { return a.status === 'REGISTERED'; }).length;
  var attended   = attendees.filter(function(a) { return a.status === 'ATTENDED'; }).length;
  var cancelled  = attendees.filter(function(a) { return a.status === 'CANCELLED'; }).length;

  if (loading) return (
    <div style={{ padding:40, color:'#64748B' }}>Loading...</div>
  );

  return (
    <div className="page-body">

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5 }}>
          {isAdmin ? 'Attendee management' : 'My bookings'}
        </h2>
        <p style={{ color:'#64748B', fontSize:13, marginTop:3 }}>
          {isAdmin
            ? 'View and manage all event attendees'
            : 'All your registered events — ' + (user ? user.name : '')}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#991B1B' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Admin Event Selector */}
      {isAdmin && (
        <div className="card" style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.05em', display:'block', marginBottom:8 }}>
            Select event to view attendees
          </label>
          <select className="input" style={{ maxWidth:380 }} value={selectedEvent}
            onChange={function(e) { loadEventAttendees(e.target.value); }}>
            <option value="">-- Select an event --</option>
            {events.map(function(ev) {
              return <option key={ev.id} value={ev.id}>{ev.title}</option>;
            })}
          </select>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[
          { label:'Total',      value:attendees.length, color:'#0D9488' },
          { label:'Registered', value:registered,       color:'#3B82F6' },
          { label:'Attended',   value:attended,         color:'#059669' },
          { label:'Cancelled',  value:cancelled,        color:'#EF4444' },
        ].map(function(s) {
          return (
            <div key={s.label} className="card" style={{ padding:'12px 16px' }}>
              <div style={{ fontSize:11, color:'#64748B', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:-1 }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              {(isAdmin
                ? ['Name','Email','Status','Registered On','Action']
                : ['Event Title','Event Date','Venue','Status','Registered On','Action']
              ).map(function(h) {
                return <th key={h} style={{ paddingLeft: (h==='Name'||h==='Event Title') ? 16 : 12 }}>{h}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {attendees.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 6} style={{ padding:32, textAlign:'center', color:'#94A3B8', fontSize:13 }}>
                  {isAdmin
                    ? (selectedEvent ? 'No attendees registered for this event yet' : 'Select an event above to view attendees')
                    : (
                      <div>
                        <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                        <div style={{ fontWeight:700, color:'#374151', marginBottom:4 }}>No registrations yet</div>
                        <div style={{ fontSize:12 }}>Go to Dashboard → click View &amp; Register on any upcoming event!</div>
                      </div>
                    )
                  }
                </td>
              </tr>
            ) : attendees.map(function(a) {
              return (
                <tr key={a.id}>
                  {isAdmin ? (
                    <>
                      <td style={{ paddingLeft:16, fontWeight:600 }}>
                        {a.user ? a.user.name : '—'}
                      </td>
                      <td style={{ color:'#64748B' }}>
                        {a.user ? a.user.email : '—'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ paddingLeft:16, fontWeight:600 }}>
                        {a.event ? a.event.title : '—'}
                      </td>
                      <td style={{ color:'#64748B' }}>
                        {a.event ? a.event.eventDate : '—'}
                      </td>
                      <td style={{ color:'#64748B' }}>
                        {a.event && a.event.venue ? a.event.venue.name : '—'}
                      </td>
                    </>
                  )}
                  <td>
                    <span className={'badge badge-' + (a.status ? a.status.toLowerCase() : '')}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ color:'#64748B', fontSize:12 }}>
                    {a.registeredAt ? new Date(a.registeredAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {isAdmin && (
                        <select value={a.status}
                          onChange={function(e) { handleStatusChange(a.id, e.target.value); }}
                          style={{ padding:'3px 6px', border:'1px solid #E2E8F0', borderRadius:5, fontSize:11, cursor:'pointer' }}>
                          <option value="REGISTERED">REGISTERED</option>
                          <option value="ATTENDED">ATTENDED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      )}
                      <button onClick={function() { handleRemove(a.id); }}
                        style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', fontSize:12, padding:'3px 6px' }}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* User refresh + tip */}
      {!isAdmin && (
        <div>
          <button onClick={loadUserBookings}
            style={{ margin:'12px 0 8px', background:'none', border:'1px solid #E2E8F0', borderRadius:7, padding:'6px 16px', cursor:'pointer', fontSize:12, color:'#64748B' }}>
            🔄 Refresh bookings
          </button>
          <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#1E40AF' }}>
            💡 Go to <strong>Dashboard</strong> → click <strong>View &amp; Register</strong> on any upcoming event to register!
          </div>
        </div>
      )}
    </div>
  );
}
