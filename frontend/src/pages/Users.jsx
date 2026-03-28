import React, { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const name  = localStorage.getItem('userName');
    const role  = localStorage.getItem('userRole');
    if (name) {
      setUsers([{
        id: 1, name, role,
        email: localStorage.getItem('userEmail') || 'admin@nexvent.io',
        joinedAt: new Date().toISOString().slice(0, 10)
      }]);
    }
  }, []);

  return (
    <div className="page-body">

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
          Users
        </h2>
        <p style={{ color: '#64748B', fontSize: 13, marginTop: 3 }}>
          User module with JWT authentication
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
        gap: 12, marginBottom: 16
      }}>
        {[
          { label: 'Total users',   value: users.length, color: '#0D9488' },
          { label: 'Admin users',   value: users.filter(u => u.role === 'ADMIN').length, color: '#8B5CF6' },
          { label: 'Regular users', value: users.filter(u => u.role === 'USER').length,  color: '#3B82F6' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{
              fontSize: 11, color: '#64748B',
              fontWeight: 500, marginBottom: 6
            }}>{s.label}</div>
            <div style={{
              fontSize: 28, fontWeight: 800,
              color: s.color, letterSpacing: -1
            }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700 }}>
            Registered users
          </h3>
          <span style={{
            background: '#ECFDF5', color: '#065F46',
            fontSize: 10, padding: '3px 10px',
            borderRadius: 20, fontWeight: 700
          }}>JWT secured</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{
                  paddingLeft: h === 'Name' ? 16 : 12
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: 24, textAlign: 'center',
                  color: '#94A3B8', fontSize: 13
                }}>No users found</td>
              </tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td style={{ paddingLeft: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <div style={{
                      width: 30, height: 30,
                      borderRadius: '50%',
                      background: '#CCFBF1',
                      color: '#134E4A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10, fontWeight: 700
                    }}>
                      {u.name?.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: '#64748B', fontSize: 12 }}>
                  {u.email}
                </td>
                <td>
                  <span className={`badge badge-${u.role?.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ color: '#64748B', fontSize: 12 }}>
                  {u.joinedAt}
                </td>
                <td>
                  <button className="btn btn-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
