import React, { useState, useEffect } from 'react';
import { getEventsWithAutoStatus, getVenues, createNotification, registerAttendee } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const isAdmin    = user?.role === 'ADMIN';
  const [events,   setEvents]  = useState([]);
  const [venues,   setVenues]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [showBudget, setShowBudget] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [contactName,    setContactName]    = useState(user?.name || '');
  const [contactSubject, setContactSubject] = useState('Event enquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [budgets,   setBudgets]   = useState([]);
  const [newBudget, setNewBudget] = useState({ event:'', total:'', spent:'', category:'', notes:'' });
  const [editingId, setEditingId] = useState(null);
  const [editSpent, setEditSpent] = useState('');

  useEffect(() => {
    Promise.all([getEventsWithAutoStatus(), getVenues()])
      .then(([evRes, vnRes]) => {
        setEvents(evRes.data);
        setVenues(vnRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    const h    = Number(hStr);
    const m    = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
  };

  const upcoming  = events.filter(e => e.status === 'UPCOMING').length;
  const ongoing   = events.filter(e => e.status === 'ONGOING').length;
  const completed = events.filter(e => e.status === 'COMPLETED').length;
  const cancelled = events.filter(e => e.status === 'CANCELLED').length;

  const totalBudget = budgets.reduce((s, b) => s + b.total, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining   = totalBudget - totalSpent;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const generatePDFReport = () => {
    const date = new Date().toLocaleDateString('en-IN');
    const time = new Date().toLocaleTimeString('en-IN');
    const rows = budgets.map(function(b) {
      const pct         = b.total > 0 ? Math.round((b.spent / b.total) * 100) : 0;
      const status      = pct > 80 ? 'Over Budget' : pct > 60 ? 'Warning' : 'On Track';
      const statusColor = pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#059669';
      return '<tr><td>' + b.event + '</td><td>' + (b.category || 'General') + '</td><td>₹' + b.total.toLocaleString() + '</td><td>₹' + b.spent.toLocaleString() + '</td><td>₹' + (b.total - b.spent).toLocaleString() + '</td><td>' + pct + '%</td><td style="color:' + statusColor + ';font-weight:bold;">' + status + '</td><td>' + (b.notes || '—') + '</td></tr>';
    }).join('');

    const html = '<!DOCTYPE html><html><head><title>Nexvent Financial Report</title>'
      + '<style>'
      + 'body{font-family:Arial,sans-serif;padding:40px;color:#1F2937}'
      + '.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;border-bottom:3px solid #0D9488;padding-bottom:20px}'
      + '.logo{font-size:28px;font-weight:900;color:#0D9488;letter-spacing:-1px}'
      + '.report-title{font-size:22px;font-weight:800;margin-bottom:4px}'
      + '.report-sub{font-size:12px;color:#64748B}'
      + '.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:30px}'
      + '.sum-box{padding:16px;border-radius:8px}'
      + '.sum-box .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}'
      + '.sum-box .value{font-size:24px;font-weight:800}'
      + '.tbl{width:100%;border-collapse:collapse;margin-bottom:30px}'
      + '.tbl th{background:#0D9488;color:white;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase}'
      + '.tbl td{padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:12px}'
      + '.tbl tr:nth-child(even) td{background:#F8FAFC}'
      + '.footer{margin-top:30px;padding-top:16px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;font-size:11px;color:#94A3B8}'
      + '.note{background:#F0FDFA;border:1px solid #99F6E4;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#0F766E}'
      + '@media print{body{padding:20px}}'
      + '</style></head><body>'
      + '<div class="header">'
      + '<div><div class="logo">NX Nexvent</div><div style="font-size:11px;color:#64748B;margin-top:2px;">Event Management System</div></div>'
      + '<div style="text-align:right;">'
      + '<div class="report-title">Financial Budget Report</div>'
      + '<div class="report-sub">Generated by: ' + (user ? user.name : '') + '</div>'
      + '<div class="report-sub">Date: ' + date + ' at ' + time + '</div>'
      + '</div></div>'
      + '<div class="note">This report contains a detailed summary of all event budgets tracked in the Nexvent Admin Dashboard. Total of ' + budgets.length + ' event budget(s) recorded.</div>'
      + '<div class="summary">'
      + '<div class="sum-box" style="background:#F0FDFA;"><div class="label" style="color:#0D9488;">Total Budget</div><div class="value" style="color:#0D9488;">₹' + totalBudget.toLocaleString() + '</div></div>'
      + '<div class="sum-box" style="background:#FEF2F2;"><div class="label" style="color:#EF4444;">Total Spent</div><div class="value" style="color:#EF4444;">₹' + totalSpent.toLocaleString() + '</div></div>'
      + '<div class="sum-box" style="background:#ECFDF5;"><div class="label" style="color:#059669;">Remaining</div><div class="value" style="color:#059669;">₹' + remaining.toLocaleString() + '</div></div>'
      + '</div>'
      + '<table class="tbl"><thead><tr><th>Event</th><th>Category</th><th>Total Budget</th><th>Amount Spent</th><th>Remaining</th><th>Used %</th><th>Status</th><th>Notes</th></tr></thead>'
      + '<tbody>' + (budgets.length === 0 ? '<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:20px;">No budget data available</td></tr>' : rows) + '</tbody>'
      + '</table>'
      + '<div class="footer"><div>Nexvent Event Management System — Confidential Financial Report</div><div>Generated on ' + date + '</div></div>'
      + '</body></html>';

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(function() { win.print(); }, 500);
  };

  const handleAddBudget = () => {
    if (!newBudget.event || !newBudget.total) {
      alert('Please select an event and enter total budget!');
      return;
    }
    const total         = Number(newBudget.total);
    const spent         = Number(newBudget.spent) || 0;
    const categoryToUse = newBudget.category || 'General';

    if (spent > total) {
      alert('Spent amount cannot be more than total budget!');
      return;
    }

    var duplicate = false;
    for (var i = 0; i < budgets.length; i++) {
      if (budgets[i].event === newBudget.event && budgets[i].category === categoryToUse) {
        duplicate = true;
        break;
      }
    }
    if (duplicate) {
      alert(categoryToUse + ' budget already added for this event! Choose a different category.');
      return;
    }

    setBudgets([...budgets, {
      id:       Date.now(),
      event:    newBudget.event,
      total,
      spent,
      category: categoryToUse,
      notes:    newBudget.notes || ''
    }]);
    setNewBudget({ event:'', total:'', spent:'', category:'', notes:'' });
  };

  const handleRegister = async (ev) => {
    if (ev.status !== 'UPCOMING') {
      alert('Registration is only available for upcoming events.');
      return;
    }
    try {
      await registerAttendee({ eventId: ev.id, userId: user?.id ?? 2 });
      await createNotification({
        userId:     user?.id,
        userName:   user?.name,
        eventId:    ev.id,
        eventTitle: ev.title,
        type:       'registration',
        message:    'You have successfully registered for "' + ev.title + '" on ' + ev.eventDate + ' at ' + formatTime(ev.eventTime) + '!',
      });
      setSelectedEvent(null);
      alert('Successfully registered for ' + ev.title + '!');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error === 'Already registered for this event') {
        alert('You are already registered for this event!');
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) { alert('Please enter a message!'); return; }
    try {
      await createNotification({
        userId:     user?.id || 0,
        userName:   user?.name || 'User',
        eventId:    0,
        eventTitle: contactSubject,
        type:       'enquiry',
        subject:    contactSubject,
        message:    contactMessage
      });
      setContactMessage('');
      alert('Message sent! Admin will get back to you soon.');
    } catch {
      alert('Message sent!');
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748B' }}>Loading...</div>;

  const EventModal = () => {
    if (!selectedEvent) return null;
    const ev          = selectedEvent;
    const displayTime = formatTime(ev.eventTime);
    const canRegister = ev.status === 'UPCOMING';
    const isOngoing   = ev.status === 'ONGOING';
    return (
      <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
        <div style={{ background:'white', borderRadius:14, padding:28, width:'90%', maxWidth:560, maxHeight:'85vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <span className={'badge badge-' + (ev.status ? ev.status.toLowerCase() : '')} style={{ marginBottom:8, display:'inline-block' }}>{ev.status}</span>
              <h2 style={{ fontSize:18, fontWeight:800, letterSpacing:-0.5, color:'#0F172A' }}>{ev.title}</h2>
            </div>
            <button onClick={() => setSelectedEvent(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#64748B', padding:'0 4px' }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              { label:'Date',     value:ev.eventDate,                icon:'📅' },
              { label:'Time',     value:displayTime,                  icon:'🕐' },
              { label:'Venue',    value:ev.venue ? ev.venue.name : 'TBD',     icon:'📍' },
              { label:'Location', value:ev.venue ? ev.venue.location : 'TBD', icon:'🗺' },
            ].map(function(info) {
              return (
                <div key={info.label} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>{info.icon}</span>
                  <div>
                    <div style={{ fontSize:10, color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>{info.label}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#0F172A', marginTop:1 }}>{info.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {ev.description && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>About this event</div>
              <div style={{ fontSize:13, color:'#374151', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'12px 14px', lineHeight:1.7, whiteSpace:'pre-line' }}>{ev.description}</div>
            </div>
          )}
          {ev.venue && ev.venue.capacity && (
            <div style={{ background:'#F0FDFA', border:'1px solid #99F6E4', borderRadius:8, padding:'10px 14px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#0F766E', fontWeight:600 }}>Venue capacity</span>
              <span style={{ fontSize:14, fontWeight:800, color:'#0D9488' }}>{ev.venue.capacity} seats</span>
            </div>
          )}
          {isOngoing && (
            <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:8, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>🟠</span>
              <span style={{ fontSize:13, color:'#92400E', fontWeight:600 }}>This event is currently ongoing. Registration is now closed.</span>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            {canRegister && (
              <button onClick={() => handleRegister(ev)} className="btn btn-teal" style={{ flex:1, padding:11, fontSize:13 }}>
                Register for this event
              </button>
            )}
            <button onClick={() => setSelectedEvent(null)} className="btn" style={{ padding:'11px 20px', fontSize:13 }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const contactSection = (
    <div className="card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <h3 style={{ fontSize:13, fontWeight:700 }}>Contact &amp; support</h3>
        <span style={{ background:'#ECFDF5', color:'#065F46', fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:700 }}>We are here to help</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10, marginBottom:14 }}>
        {[
          { title:'Phone support', value:'+91 98765 43210', sub:'Mon–Sat, 9am–6pm IST',         color:'#0D9488', bg:'#F0FDFA', icon:'📞' },
          { title:'Email us',      value:'support@nexvent.io', sub:'Reply within 24 hours',     color:'#3B82F6', bg:'#EFF6FF', icon:'✉'  },
          { title:'WhatsApp',      value:'+91 87654 32109', sub:'Quick queries, instant reply', color:'#059669', bg:'#ECFDF5', icon:'💬' },
        ].map(function(c) {
          return (
            <div key={c.title} style={{ background:c.bg, borderRadius:10, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:16 }}>{c.icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:c.color }}>{c.title}</span>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:c.color, marginBottom:3 }}>{c.value}</div>
              <div style={{ fontSize:10, color:'#64748B' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, padding:'14px 16px' }}>
        <div style={{ fontSize:12, fontWeight:700, marginBottom:10 }}>Send us a message</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Your name</label>
            <input className="input" placeholder="Your name" value={contactName} onChange={function(e) { setContactName(e.target.value); }} />
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Subject</label>
            <select className="input" value={contactSubject} onChange={function(e) { setContactSubject(e.target.value); }}>
              <option>Event enquiry</option>
              <option>Venue booking</option>
              <option>Budget query</option>
              <option>Technical support</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Message</label>
          <textarea className="input" rows={3} placeholder="Type your message here..."
            style={{ resize:'none', lineHeight:1.6 }}
            value={contactMessage} onChange={function(e) { setContactMessage(e.target.value); }} />
        </div>
        <button className="btn btn-teal" style={{ padding:'9px 20px' }} onClick={handleSendMessage}>Send message</button>
      </div>
    </div>
  );

  if (isAdmin) {
    return (
      <div className="page-body">
        <EventModal />
        <div style={{ background:'linear-gradient(135deg, #0F172A 0%, #134E4A 100%)', borderRadius:12, padding:'20px 24px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, color:'#2DD4BF', fontWeight:600, marginBottom:4, letterSpacing:'.05em', textTransform:'uppercase' }}>{greeting} — Admin</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#F8FAFC', letterSpacing:-0.7, marginBottom:4 }}>Welcome back, {user ? user.name : ''}!</h2>
            <p style={{ color:'#94A3B8', fontSize:12 }}>
              You have{' '}<span style={{ color:'#2DD4BF', fontWeight:700 }}>{upcoming} upcoming</span>{' '}and{' '}
              <span style={{ color:'#FB923C', fontWeight:700 }}>{ongoing} ongoing</span>{' '}events
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowBudget(!showBudget)} style={{ background:'#1E293B', color:'#2DD4BF', border:'1px solid #2DD4BF', padding:'9px 16px', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer' }}>
              {showBudget ? 'Hide budget' : 'Budget tracker'}
            </button>
            <button onClick={() => navigate('/events')} style={{ background:'#0D9488', color:'white', border:'none', padding:'9px 16px', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer' }}>
              + Create event
            </button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Total events', value:events.length, color:'#0D9488' },
            { label:'Upcoming',     value:upcoming,      color:'#3B82F6' },
            { label:'Ongoing',      value:ongoing,       color:'#F59E0B' },
            { label:'Venues',       value:venues.length, color:'#8B5CF6' },
          ].map(function(s) {
            return (
              <div key={s.label} className="card" style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:11, color:'#64748B', fontWeight:500, marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:30, fontWeight:800, color:s.color, letterSpacing:-1.5 }}>{s.value}</div>
              </div>
            );
          })}
        </div>

        {showBudget && (
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ fontSize:13, fontWeight:700 }}>Budget tracker</h3>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={generatePDFReport} style={{ background:'#0F172A', color:'#2DD4BF', border:'1px solid #2DD4BF', padding:'4px 14px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700 }}>
                  📄 Generate PDF Report
                </button>
                <div style={{ background:'#FEF2F2', color:'#991B1B', fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:700 }}>Admin only</div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
              {[
                { label:'Total budget', value:'₹' + totalBudget.toLocaleString(), color:'#0D9488', bg:'#F0FDFA' },
                { label:'Total spent',  value:'₹' + totalSpent.toLocaleString(),  color:'#EF4444', bg:'#FEF2F2' },
                { label:'Remaining',    value:'₹' + remaining.toLocaleString(),   color:'#059669', bg:'#ECFDF5' },
              ].map(function(s) {
                return (
                  <div key={s.label} style={{ background:s.bg, borderRadius:8, padding:'10px 14px' }}>
                    <div style={{ fontSize:10, color:s.color, fontWeight:700, marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:s.color, letterSpacing:-0.5 }}>{s.value}</div>
                  </div>
                );
              })}
            </div>

            {totalBudget > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748B', marginBottom:5 }}>
                  <span>Overall budget usage</span>
                  <span style={{ fontWeight:700 }}>{Math.round((totalSpent/totalBudget)*100)}% used</span>
                </div>
                <div style={{ height:10, background:'#F1F5F9', borderRadius:5, overflow:'hidden' }}>
                  <div style={{
                    width: Math.min(Math.round((totalSpent/totalBudget)*100),100) + '%',
                    height:'100%',
                    background: Math.round((totalSpent/totalBudget)*100) > 80 ? '#EF4444' : Math.round((totalSpent/totalBudget)*100) > 60 ? '#F59E0B' : '#0D9488',
                    borderRadius:5, transition:'width .3s'
                  }} />
                </div>
              </div>
            )}

            {budgets.length === 0 ? (
              <div style={{ padding:'20px', textAlign:'center', color:'#94A3B8', fontSize:13, background:'#F8FAFC', borderRadius:8, marginBottom:14 }}>
                No budgets added yet — add your first event budget below!
              </div>
            ) : (
              <table className="tbl" style={{ marginBottom:14 }}>
                <thead>
                  <tr>
                    {['Event','Category','Total','Spent','Remaining','Used %','Notes','Action'].map(function(h) {
                      return <th key={h} style={{ paddingLeft: h==='Event' ? 14 : 10 }}>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {budgets.map(function(bItem) {
                    const pct   = bItem.total > 0 ? Math.round((bItem.spent/bItem.total)*100) : 0;
                    const color = pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#059669';
                    return (
                      <tr key={bItem.id}>
                        <td style={{ paddingLeft:14, fontWeight:600 }}>{bItem.event}</td>
                        <td>
                          <span style={{ background:'#EFF6FF', color:'#1E40AF', fontSize:10, padding:'2px 7px', borderRadius:10, fontWeight:700 }}>{bItem.category}</span>
                        </td>
                        <td style={{ color:'#64748B' }}>₹{bItem.total.toLocaleString()}</td>
                        <td>
                          {editingId === bItem.id ? (
                            <div style={{ display:'flex', gap:4 }}>
                              <input type="number" value={editSpent} onChange={function(e) { setEditSpent(e.target.value); }}
                                style={{ width:80, padding:'3px 6px', border:'1px solid #0D9488', borderRadius:5, fontSize:12 }} />
                              <button onClick={function() {
                                const spent = Number(editSpent);
                                if (spent > bItem.total) { alert('Spent cannot exceed total!'); return; }
                                setBudgets(budgets.map(function(x) { return x.id === bItem.id ? Object.assign({}, x, { spent: spent }) : x; }));
                                setEditingId(null);
                              }} style={{ background:'#0D9488', color:'white', border:'none', borderRadius:5, padding:'3px 8px', cursor:'pointer', fontSize:11 }}>✓</button>
                              <button onClick={function() { setEditingId(null); }} style={{ background:'none', border:'1px solid #E2E8F0', borderRadius:5, padding:'3px 8px', cursor:'pointer', fontSize:11 }}>✕</button>
                            </div>
                          ) : (
                            <span onClick={function() { setEditingId(bItem.id); setEditSpent(String(bItem.spent)); }}
                              style={{ color:'#EF4444', fontWeight:600, cursor:'pointer', textDecoration:'underline', textUnderlineOffset:2, fontSize:13 }} title="Click to edit">
                              ₹{bItem.spent.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td style={{ color:'#059669', fontWeight:600 }}>₹{(bItem.total-bItem.spent).toLocaleString()}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ flex:1, height:5, background:'#F1F5F9', borderRadius:3, overflow:'hidden' }}>
                              <div style={{ width: pct + '%', height:'100%', background:color, borderRadius:3 }} />
                            </div>
                            <span style={{ fontSize:11, fontWeight:700, color:color }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ color:'#64748B', fontSize:11 }}>{bItem.notes || '—'}</td>
                        <td>
                          <button onClick={function() { setBudgets(budgets.filter(function(x) { return x.id !== bItem.id; })); }}
                            style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', fontSize:12 }}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10 }}>Add new budget</div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8, marginBottom:8 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Select event *</label>
                  <select className="input" value={newBudget.event} onChange={function(e) { setNewBudget(Object.assign({}, newBudget, { event: e.target.value })); }}>
                    <option value="">-- Select event --</option>
                    {events.map(function(ev) { return <option key={ev.id} value={ev.title}>{ev.title}</option>; })}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Category</label>
                  <select className="input" value={newBudget.category} onChange={function(e) { setNewBudget(Object.assign({}, newBudget, { category: e.target.value })); }}>
                    <option value="">General</option>
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Technology">Technology</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Speakers">Speakers</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Total (₹) *</label>
                  <input className="input" type="number" placeholder="50000" value={newBudget.total} onChange={function(e) { setNewBudget(Object.assign({}, newBudget, { total: e.target.value })); }} />
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Spent (₹)</label>
                  <input className="input" type="number" placeholder="0" value={newBudget.spent} onChange={function(e) { setNewBudget(Object.assign({}, newBudget, { spent: e.target.value })); }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:'#64748B', display:'block', marginBottom:4 }}>Notes (optional)</label>
                  <input className="input" placeholder="e.g. Includes stage setup" value={newBudget.notes} onChange={function(e) { setNewBudget(Object.assign({}, newBudget, { notes: e.target.value })); }} />
                </div>
                <button onClick={handleAddBudget} className="btn btn-teal" style={{ padding:'9px 24px', marginTop:18 }}>Add</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:12, marginBottom:16 }}>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:13, fontWeight:700 }}>Recent events</h3>
              <button onClick={() => navigate('/events')} style={{ background:'none', border:'none', color:'#0D9488', cursor:'pointer', fontSize:12, fontWeight:600 }}>View all →</button>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  {['Title','Date','Venue','Status'].map(function(h) {
                    return <th key={h} style={{ paddingLeft: h==='Title' ? 16 : 12 }}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding:24, textAlign:'center', color:'#94A3B8', fontSize:13 }}>No events yet</td></tr>
                ) : events.slice(0,5).map(function(ev) {
                  return (
                    <tr key={ev.id}>
                      <td style={{ paddingLeft:16, fontWeight:600 }}>{ev.title}</td>
                      <td style={{ color:'#64748B' }}>{ev.eventDate}</td>
                      <td style={{ color:'#64748B' }}>{ev.venue ? ev.venue.name : '—'}</td>
                      <td><span className={'badge badge-' + (ev.status ? ev.status.toLowerCase() : '')}>{ev.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="card">
              <h3 style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Event status breakdown</h3>
              {[
                { label:'Upcoming',  value:upcoming,  color:'#3B82F6', bg:'#EFF6FF' },
                { label:'Ongoing',   value:ongoing,   color:'#F59E0B', bg:'#FFFBEB' },
                { label:'Completed', value:completed, color:'#059669', bg:'#ECFDF5' },
                { label:'Cancelled', value:cancelled, color:'#EF4444', bg:'#FEF2F2' },
              ].map(function(s) {
                return (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'0.5px solid #F1F5F9' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }} />
                      <span style={{ fontSize:12, color:'#64748B' }}>{s.label}</span>
                    </div>
                    <span style={{ background:s.bg, color:s.color, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{s.value}</span>
                  </div>
                );
              })}
            </div>
            <div className="card">
              <h3 style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Admin quick actions</h3>
              {[
                { label:'Create new event', path:'/events',    color:'#0D9488', bg:'#F0FDFA' },
                { label:'Add venue',        path:'/venues',    color:'#F59E0B', bg:'#FFFBEB' },
                { label:'Manage attendees', path:'/attendees', color:'#EC4899', bg:'#FDF2F8' },
                { label:'Manage users',     path:'/users',     color:'#8B5CF6', bg:'#F5F3FF' },
              ].map(function(a) {
                return (
                  <button key={a.label} onClick={() => navigate(a.path)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:a.bg, border:'none', borderRadius:8, cursor:'pointer', width:'100%', marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:a.color }}>{a.label}</span>
                    <span style={{ color:a.color, fontSize:14 }}>→</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {venues.length > 0 && (
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h3 style={{ fontSize:13, fontWeight:700 }}>Active venues</h3>
              <button onClick={() => navigate('/venues')} style={{ background:'none', border:'none', color:'#0D9488', cursor:'pointer', fontSize:12, fontWeight:600 }}>Manage →</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10 }}>
              {venues.slice(0,3).map(function(v) {
                return (
                  <div key={v.id} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'10px 12px' }}>
                    <div style={{ fontWeight:700, fontSize:12, marginBottom:3 }}>{v.name}</div>
                    <div style={{ fontSize:11, color:'#64748B', marginBottom:6 }}>{v.location}</div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:10, color:'#64748B' }}>Capacity</span>
                      <span style={{ fontSize:11, fontWeight:700, color:'#0D9488' }}>{v.capacity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontSize:13, fontWeight:700 }}>Recent enquiries from users</h3>
            <button onClick={() => navigate('/notifications')} style={{ background:'none', border:'none', color:'#0D9488', cursor:'pointer', fontSize:12, fontWeight:600 }}>View all →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10, marginBottom:14 }}>
            {[
              { label:'How to reply',   icon:'↩', desc:'Go to Notifications → click Reply → type response → Send reply', color:'#5B21B6', bg:'#F5F3FF' },
              { label:'User enquiries', icon:'✉', desc:'Users send messages from their Dashboard Contact & Support section', color:'#1E40AF', bg:'#EFF6FF' },
              { label:'Notifications',  icon:'🔔', desc:'All messages, registrations and replies are managed in Notifications page', color:'#0F766E', bg:'#F0FDFA' },
            ].map(function(c) {
              return (
                <div key={c.label} style={{ background:c.bg, borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:16 }}>{c.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:c.color }}>{c.label}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#64748B', lineHeight:1.5 }}>{c.desc}</div>
                </div>
              );
            })}
          </div>
          <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:12, color:'#64748B' }}>Click below to view all user messages and reply to their enquiries</div>
            <button onClick={() => navigate('/notifications')} className="btn btn-teal" style={{ padding:'8px 20px', fontSize:12 }}>Go to Notifications →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <EventModal />
      <div style={{ background:'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', borderRadius:12, padding:'20px 24px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:11, color:'#93C5FD', fontWeight:600, marginBottom:4, letterSpacing:'.05em', textTransform:'uppercase' }}>{greeting}</div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#F8FAFC', letterSpacing:-0.7, marginBottom:4 }}>Welcome back, {user ? user.name : ''}!</h2>
          <p style={{ color:'#94A3B8', fontSize:12 }}>Browse events and register for the ones you love!</p>
        </div>
        <button onClick={() => navigate('/events')} style={{ background:'#3B82F6', color:'white', border:'none', padding:'9px 16px', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer' }}>
          Browse events
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Available events', value:events.length, color:'#3B82F6' },
          { label:'Upcoming events',  value:upcoming,      color:'#0D9488' },
          { label:'Active venues',    value:venues.length, color:'#8B5CF6' },
        ].map(function(s) {
          return (
            <div key={s.label} className="card" style={{ padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'#64748B', fontWeight:500, marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:30, fontWeight:800, color:s.color, letterSpacing:-1.5 }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:16 }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:13, fontWeight:700 }}>Available events — click to view details &amp; register!</h3>
          <button onClick={() => navigate('/events')} style={{ background:'none', border:'none', color:'#3B82F6', cursor:'pointer', fontSize:12, fontWeight:600 }}>View all →</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              {['Event title','Date','Time','Venue','Status','Action'].map(function(h) {
                return <th key={h} style={{ paddingLeft: h==='Event title' ? 16 : 12 }}>{h}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:24, textAlign:'center', color:'#94A3B8', fontSize:13 }}>No events available yet</td></tr>
            ) : events.map(function(ev) {
              const displayTime = formatTime(ev.eventTime);
              const canRegister = ev.status === 'UPCOMING';
              const isOngoing   = ev.status === 'ONGOING';
              return (
                <tr key={ev.id}>
                  <td style={{ paddingLeft:16 }}>
                    <button onClick={() => setSelectedEvent(ev)}
                      style={{ background:'none', border:'none', color:'#1E40AF', cursor:'pointer', fontWeight:700, fontSize:13, textDecoration:'underline', textUnderlineOffset:3, padding:0 }}>
                      {ev.title}
                    </button>
                  </td>
                  <td style={{ color:'#64748B' }}>{ev.eventDate}</td>
                  <td style={{ color:'#64748B' }}>{displayTime}</td>
                  <td style={{ color:'#64748B' }}>{ev.venue ? ev.venue.name : '—'}</td>
                  <td><span className={'badge badge-' + (ev.status ? ev.status.toLowerCase() : '')}>{ev.status}</span></td>
                  <td>
                    {canRegister && (
                      <button onClick={() => setSelectedEvent(ev)}
                        style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', color:'#1E40AF', padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>
                        View &amp; Register
                      </button>
                    )}
                    {isOngoing && (
                      <span style={{ background:'#FFF7ED', border:'1px solid #FED7AA', color:'#92400E', padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600 }}>
                        🟠 In Progress
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div className="card">
          <h3 style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Quick actions</h3>
          {[
            { label:'Browse all events', path:'/events',        color:'#3B82F6', bg:'#EFF6FF' },
            { label:'My registrations',  path:'/my-bookings',   color:'#EC4899', bg:'#FDF2F8' },
            { label:'My notifications',  path:'/notifications', color:'#FB923C', bg:'#FFF7ED' },
            { label:'View venues',       path:'/venues',        color:'#8B5CF6', bg:'#F5F3FF' },
          ].map(function(a) {
            return (
              <button key={a.label} onClick={() => navigate(a.path)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:a.bg, border:'none', borderRadius:8, cursor:'pointer', width:'100%', marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:a.color }}>{a.label}</span>
                <span style={{ color:a.color, fontSize:14 }}>→</span>
              </button>
            );
          })}
        </div>

        <div className="card">
          <h3 style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Upcoming events at a glance</h3>
          {events.filter(function(e) { return e.status === 'UPCOMING'; }).slice(0,4).map(function(ev) {
            return (
              <div key={ev.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'0.5px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{ev.title}</div>
                  <div style={{ fontSize:10, color:'#64748B' }}>{ev.eventDate} · {ev.venue ? ev.venue.name : 'TBD'}</div>
                </div>
                <span className={'badge badge-' + (ev.status ? ev.status.toLowerCase() : '')}>{ev.status}</span>
              </div>
            );
          })}
          {events.filter(function(e) { return e.status === 'UPCOMING'; }).length === 0 && (
            <div style={{ fontSize:12, color:'#94A3B8', textAlign:'center', padding:'12px 0' }}>No upcoming events</div>
          )}
        </div>
      </div>

      {contactSection}
    </div>
  );
}