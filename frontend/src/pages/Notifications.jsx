import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllNotifications,
  markNotificationRead,
  replyToNotification,
  deleteNotification
} from '../services/api';

export default function Notifications() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [replyingTo,    setReplyingTo]    = useState(null);
  const [replyText,     setReplyText]     = useState('');
  const [sending,       setSending]       = useState(false);

  useEffect(function() { loadNotifications(); }, []);

  function loadNotifications() {
    setLoading(true);
    getAllNotifications()
      .then(function(r) {
        var all = r.data.data || [];

        if (isAdmin) {
          // Admin sees ONLY enquiries from users — NOT reminders or registrations
          var adminNotifs = all.filter(function(n) {
            return n.type === 'enquiry';
          });
          setNotifications(adminNotifs);
        } else {
          // User sees their OWN notifications:
          // registrations, reminders, replies — matched by name OR userId
          var userNotifs = all.filter(function(n) {
            var nameMatch  = n.userName && user && (
              n.userName === user.name ||
              n.userName.toLowerCase() === user.name.toLowerCase()
            );
            var idMatch = user && (
              Number(n.userId) === Number(user.id)
            );
            return nameMatch || idMatch;
          });
          // Sort newest first
          userNotifs.sort(function(a, b) {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          setNotifications(userNotifs);
        }
      })
      .catch(function() { setNotifications([]); })
      .finally(function() { setLoading(false); });
  }

  function handleMarkRead(id) {
    markNotificationRead(id).then(function() { loadNotifications(); });
  }

  function handleDelete(id) {
    deleteNotification(id).then(function() { loadNotifications(); });
  }

  async function handleReply(id) {
    if (!replyText.trim()) { alert('Please enter a reply!'); return; }
    setSending(true);
    try {
      await replyToNotification(id, replyText, user ? user.name : 'Admin');
      setReplyingTo(null);
      setReplyText('');
      loadNotifications();
      alert('Reply sent! User will see it in their Notifications.');
    } catch (err) {
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleMarkAllRead() {
    var unread = notifications.filter(function(n) { return !n.isRead; });
    Promise.all(unread.map(function(n) { return markNotificationRead(n.id); }))
      .then(function() { loadNotifications(); });
  }

  var unread  = notifications.filter(function(n) { return !n.isRead; }).length;
  var read    = notifications.filter(function(n) { return n.isRead; }).length;
  var replied = notifications.filter(function(n) { return n.reply; }).length;

  function getTypeIcon(type) {
    if (type === 'enquiry')      return '✉';
    if (type === 'reminder')     return '🔔';
    if (type === 'registration') return '🎫';
    return '📢';
  }

  function getTypeLabel(n) {
    if (n.type === 'enquiry')      return 'Enquiry: ' + (n.subject || 'General');
    if (n.type === 'reminder')     return 'Reminder: ' + (n.eventTitle || 'Event');
    if (n.type === 'registration') return 'Registered for: ' + (n.eventTitle || 'Event');
    return n.eventTitle || 'Notification';
  }

  function getTypeBg(type) {
    if (type === 'enquiry')      return '#EFF6FF';
    if (type === 'reminder')     return '#FFFBEB';
    if (type === 'registration') return '#F0FDFA';
    return '#F8FAFC';
  }

  function getBorderColor(n) {
    if (n.reply)              return '#C4B5FD';
    if (n.type === 'reminder') return '#FDE68A';
    if (n.isRead)             return '#E2E8F0';
    return '#99F6E4';
  }

  if (loading) return (
    <div style={{ padding:40, color:'#64748B' }}>Loading notifications...</div>
  );

  return (
    <div className="page-body">

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5 }}>
          {isAdmin ? 'User enquiries & replies' : 'My notifications'}
        </h2>
        <p style={{ color:'#64748B', fontSize:13, marginTop:3 }}>
          {isAdmin
            ? 'View and reply to messages sent by users from their Contact & Support section'
            : 'Your event registrations, reminders from admin and reply messages'}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display:'grid',
        gridTemplateColumns: isAdmin ? 'repeat(4,minmax(0,1fr))' : 'repeat(3,minmax(0,1fr))',
        gap:10, marginBottom:16
      }}>
        {[
          { label:'Total',  value:notifications.length, color:'#FB923C' },
          { label:'Unread', value:unread,               color:'#0D9488' },
          { label:'Read',   value:read,                 color:'#64748B' },
          ...(isAdmin ? [{ label:'Replied', value:replied, color:'#8B5CF6' }] : []),
        ].map(function(s) {
          return (
            <div key={s.label} className="card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:11, color:'#64748B', fontWeight:500, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color, letterSpacing:-1 }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Admin info bar */}
      {isAdmin && (
        <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#1E40AF' }}>
          ℹ️ Showing only <strong>user enquiries</strong> here. Reminders and registrations go directly to users and are not shown to admin.
        </div>
      )}

      {/* List */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ fontSize:13, fontWeight:700 }}>
            {isAdmin ? 'User enquiries' : 'Your messages, reminders & replies'}
          </h3>
          <div style={{ display:'flex', gap:8 }}>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} style={{ background:'none', border:'none', color:'#0D9488', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                Mark all read
              </button>
            )}
            <button onClick={loadNotifications} style={{ background:'none', border:'1px solid #E2E8F0', color:'#64748B', cursor:'pointer', fontSize:12, padding:'4px 10px', borderRadius:6 }}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div style={{ padding:'40px 0', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔔</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:6 }}>No notifications yet</div>
            <div style={{ fontSize:12, color:'#64748B' }}>
              {isAdmin
                ? 'User enquiries from Contact & Support will appear here'
                : 'Your event registrations, reminders and admin replies will appear here'}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {notifications.map(function(n) {
              return (
                <div key={n.id} style={{
                  background: n.isRead ? '#FAFAFA' : '#F0FDFA',
                  border: '1px solid ' + getBorderColor(n),
                  borderRadius:10, padding:'14px 16px', transition:'all .2s'
                }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:10 }}>
                    <div style={{ display:'flex', gap:10, flex:1 }}>

                      {/* Icon */}
                      <div style={{ width:36, height:36, borderRadius:9, background: getTypeBg(n.type), display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                        {getTypeIcon(n.type)}
                      </div>

                      <div style={{ flex:1 }}>
                        {/* Title + badges */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                          <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>
                            {getTypeLabel(n)}
                          </span>
                          {n.type === 'reminder' && (
                            <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:700 }}>
                              REMINDER
                            </span>
                          )}
                          {n.type === 'registration' && (
                            <span style={{ background:'#CCFBF1', color:'#0F766E', fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:700 }}>
                              REGISTERED
                            </span>
                          )}
                          {!n.isRead && (
                            <span style={{ background:'#CCFBF1', color:'#0F766E', fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:700 }}>
                              NEW
                            </span>
                          )}
                          {n.reply && (
                            <span style={{ background:'#EDE9FE', color:'#5B21B6', fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:700 }}>
                              REPLIED
                            </span>
                          )}
                        </div>

                        {/* From + date */}
                        <div style={{ fontSize:11, color:'#64748B', marginBottom:6 }}>
                          {isAdmin
                            ? <span>From: <strong>{n.userName}</strong></span>
                            : <span>Type: <strong style={{ textTransform:'capitalize' }}>{n.type || 'notification'}</strong></span>
                          }
                          {' '}· {n.createdAt ? n.createdAt.slice(0, 10) : ''}
                        </div>

                        {/* Message */}
                        <div style={{ fontSize:12, color:'#374151', background:'white', border:'1px solid #E2E8F0', borderRadius:7, padding:'8px 12px', lineHeight:1.6 }}>
                          {n.message}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'flex', gap:6, flexShrink:0, flexDirection:'column', alignItems:'flex-end' }}>
                      {isAdmin && !n.reply && (
                        <button
                          onClick={function() {
                            setReplyingTo(replyingTo === n.id ? null : n.id);
                            setReplyText('');
                          }}
                          style={{ background:'#EDE9FE', border:'1px solid #C4B5FD', color:'#5B21B6', padding:'5px 12px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700 }}>
                          Reply
                        </button>
                      )}
                      {!n.isRead && (
                        <button onClick={function() { handleMarkRead(n.id); }}
                          className="btn btn-sm" style={{ fontSize:11 }}>
                          Mark read
                        </button>
                      )}
                      <button onClick={function() { handleDelete(n.id); }}
                        style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', fontSize:11, padding:'3px 6px' }}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Reply Input — Admin only */}
                  {isAdmin && replyingTo === n.id && (
                    <div style={{ background:'#F5F3FF', border:'1px solid #C4B5FD', borderRadius:8, padding:'12px 14px', marginTop:8 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#5B21B6', marginBottom:8 }}>
                        ↩ Reply to {n.userName}
                      </div>
                      <textarea
                        className="input" rows={3}
                        placeholder={'Type your reply to ' + n.userName + '...'}
                        value={replyText}
                        onChange={function(e) { setReplyText(e.target.value); }}
                        style={{ resize:'none', lineHeight:1.6, marginBottom:10 }}
                      />
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          onClick={function() { handleReply(n.id); }}
                          disabled={sending}
                          style={{ background:'#7C3AED', color:'white', border:'none', padding:'8px 18px', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                          {sending ? 'Sending...' : 'Send reply'}
                        </button>
                        <button
                          onClick={function() { setReplyingTo(null); setReplyText(''); }}
                          className="btn btn-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reply Display — visible to both admin and user */}
                  {n.reply && (
                    <div style={{ background:'#F5F3FF', border:'1px solid #C4B5FD', borderRadius:8, padding:'12px 14px', marginTop:10 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#5B21B6', marginBottom:6, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span>↩ Reply from {n.repliedBy || 'Admin'}</span>
                        <span style={{ fontSize:10, color:'#7C3AED', fontWeight:400 }}>
                          {n.repliedAt ? n.repliedAt.slice(0, 10) : ''}
                        </span>
                      </div>
                      <div style={{ fontSize:12, color:'#4C1D95', lineHeight:1.7, background:'white', border:'1px solid #DDD6FE', borderRadius:7, padding:'8px 12px', whiteSpace:'pre-line' }}>
                        {n.reply}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={function() { setReplyingTo(n.id); setReplyText(n.reply); }}
                          style={{ background:'none', border:'none', color:'#7C3AED', cursor:'pointer', fontSize:11, marginTop:6, padding:0, fontWeight:600 }}>
                          Edit reply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}