import React, { useState, useEffect } from 'react';
import { getVenues, createVenue, deleteVenue } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Venues() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  const [venues,   setVenues]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', location: '', capacity: '', description: ''
  });

  useEffect(() => { loadVenues(); }, []);

  const loadVenues = () => getVenues().then(r => setVenues(r.data));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createVenue({ ...form, capacity: Number(form.capacity) });
    setForm({ name: '', location: '', capacity: '', description: '' });
    setShowForm(false);
    loadVenues();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this venue?')) {
      await deleteVenue(id);
      loadVenues();
    }
  };

  return (
    <div className="page-body">

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
            Venues
          </h2>
          <p style={{ color: '#64748B', fontSize: 13, marginTop: 3 }}>
            {isAdmin
              ? 'Manage event spaces and capacity'
              : 'Browse available event venues'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-teal"
            onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add venue'}
          </button>
        )}
      </div>

      {/* Create Form — Admin only */}
      {isAdmin && showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: '#0D9488' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            Add new venue
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Venue name *</label>
                <input className="input" name="name" value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Grand Ballroom" required />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Location *</label>
                <input className="input" name="location" value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad, India" required />
              </div>
            </div>
            <div className="form-row" style={{ marginTop: 10 }}>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Capacity *</label>
                <input className="input" type="number" name="capacity"
                  value={form.capacity} onChange={handleChange}
                  placeholder="500" required />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <input className="input" name="description"
                  value={form.description} onChange={handleChange}
                  placeholder="Optional" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn btn-teal btn-sm">
                Save venue
              </button>
              <button type="button" className="btn btn-sm"
                onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Venues Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
        gap: 12
      }}>
        {venues.map(v => (
          <div key={v.id} className="card" style={{ padding: 16 }}>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: 8
            }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{v.name}</div>
              <span style={{
                background: '#ECFDF5', color: '#065F46',
                fontSize: 9, padding: '2px 7px',
                borderRadius: 6, fontWeight: 700
              }}>Available</span>
            </div>

            <div style={{
              fontSize: 11, color: '#64748B', marginBottom: 4
            }}>📍 {v.location}</div>

            <div style={{ fontSize: 12, marginBottom: 6 }}>
              👥 Capacity: <strong>{v.capacity}</strong>
            </div>

            {v.description && (
              <div style={{
                fontSize: 11, color: '#64748B',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 6, padding: '6px 10px',
                marginBottom: 8, lineHeight: 1.5
              }}>{v.description}</div>
            )}

            <div style={{
              height: 4, background: '#F1F5F9',
              borderRadius: 2, overflow: 'hidden', marginBottom: 3
            }}>
              <div style={{
                width: '20%', height: '100%',
                background: '#0D9488', borderRadius: 2
              }} />
            </div>
            <div style={{
              fontSize: 10, color: '#64748B', marginBottom: 10
            }}>Approx 20% booked</div>

            {/* Admin buttons */}
            {isAdmin ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" style={{ flex: 1 }}>Edit</button>
                <button onClick={() => handleDelete(v.id)}
                  style={{
                    background: 'none', border: 'none',
                    color: '#EF4444', cursor: 'pointer',
                    fontSize: 12, padding: '3px 8px', borderRadius: 4
                  }}>Delete</button>
              </div>
            ) : (
              /* User sees read-only info */
              <div style={{
                background: '#F0FDFA',
                border: '1px solid #99F6E4',
                borderRadius: 7, padding: '8px 12px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: 10, color: '#0F766E',
                    fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '.05em', marginBottom: 2
                  }}>Venue info</div>
                  <div style={{ fontSize: 11, color: '#134E4A' }}>
                    Max {v.capacity} attendees
                  </div>
                </div>
                <span style={{ fontSize: 20 }}>🏛</span>
              </div>
            )}
          </div>
        ))}

        {/* Add venue card — Admin only */}
        {isAdmin && (
          <div onClick={() => setShowForm(true)} style={{
            border: '2px dashed #E2E8F0',
            background: '#FAFAFA',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 130,
            cursor: 'pointer',
            transition: 'all .15s'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px dashed #CBD5E1',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20,
              color: '#94A3B8', marginBottom: 6
            }}>+</div>
            <div style={{
              fontSize: 12, color: '#64748B', fontWeight: 600
            }}>Add new venue</div>
          </div>
        )}
      </div>
    </div>
  );
}