import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'USER'
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      setSuccess('Account created! Taking you to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #134E4A 100%)'
    }}>
      <div className="card" style={{
        width: 400, padding: 36, borderRadius: 14
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 42, height: 42,
            background: '#0D9488',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 8px',
            color: 'white',
            fontWeight: 800,
            fontSize: 15
          }}>NX</div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>
            Create your account
          </h1>
          <p style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>
            User module — registration
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: '#FEF2F2', color: '#DC2626',
            padding: '10px 14px', borderRadius: 8,
            marginBottom: 14, fontSize: 13
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            background: '#F0FDFA', color: '#0F766E',
            padding: '10px 14px', borderRadius: 8,
            marginBottom: 14, fontSize: 13
          }}>{success}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input
              className="input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Email address</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <select
                className="input"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-teal"
            style={{ width: '100%', padding: 11, marginTop: 16 }}
          >
            Create account
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 14,
          fontSize: 13,
          color: '#64748B'
        }}>
          Already registered?{' '}
          <Link to="/login" style={{
            color: '#0D9488', fontWeight: 600
          }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}