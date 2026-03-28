import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { path: '/',              label: 'Dashboard',     dot: '#0D9488' },
  { path: '/events',        label: 'Events',        dot: '#34D399' },
  { path: '/venues',        label: 'Venues',        dot: '#FBBF24' },
  { path: '/attendees',     label: 'Attendees',     dot: '#F472B6' },
  { path: '/users',         label: 'Users',         dot: '#A78BFA' },
  { path: '/notifications', label: 'Notifications', dot: '#FB923C' },
];

const userNavItems = [
  { path: '/',              label: 'Dashboard',     dot: '#0D9488' },
  { path: '/events',        label: 'Browse Events', dot: '#34D399' },
  { path: '/venues',        label: 'Venues',        dot: '#FBBF24' },
  { path: '/my-bookings',   label: 'My Bookings',   dot: '#F472B6' },
  { path: '/notifications', label: 'Notifications', dot: '#FB923C' },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isAdmin  = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div style={{
      width: 220,
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0
    }}>

      {/* Logo */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }}>
        <div style={{
          width: 32, height: 32,
          background: '#0D9488',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: -1
        }}>NX</div>
        <div>
          <div style={{
            color: '#F8FAFC',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: -0.5
          }}>Nexvent</div>
          <div style={{ color: '#475569', fontSize: 9, marginTop: 1 }}>
            {isAdmin ? 'Admin portal' : 'Event management'}
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '10px 16px 0' }}>
        <span style={{
          background: isAdmin ? '#134E4A' : '#1E3A5F',
          color: isAdmin ? '#2DD4BF' : '#93C5FD',
          fontSize: 9, padding: '3px 8px',
          borderRadius: 10, fontWeight: 700,
          letterSpacing: '.05em', textTransform: 'uppercase'
        }}>
          {isAdmin ? 'Administrator' : 'User account'}
        </span>
      </div>

      {/* Nav Items */}
      <div style={{ padding: '12px 10px 4px' }}>
        <div style={{
          fontSize: 9, fontWeight: 700,
          color: '#334155',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          padding: '0 8px',
          marginBottom: 4
        }}>Navigation</div>

        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              borderRadius: 7,
              border: 'none',
              background: isActive(item.path) ? '#134E4A' : 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              color: isActive(item.path) ? '#2DD4BF' : '#94A3B8',
              fontWeight: isActive(item.path) ? 600 : 400,
              fontSize: 12.5,
              marginBottom: 2,
              transition: 'all .15s'
            }}
          >
            <div style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: item.dot,
              flexShrink: 0
            }} />
            {item.label}
          </button>
        ))}
      </div>

      {/* User Footer */}
      <div style={{
        marginTop: 'auto',
        padding: '12px 10px',
        borderTop: '1px solid #1E293B'
      }}>
        <div onClick={handleLogout} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 8px',
          borderRadius: 7,
          cursor: 'pointer'
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: '#134E4A',
            color: '#2DD4BF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0
          }}>{initials}</div>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#E2E8F0'
            }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>
              Sign out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}