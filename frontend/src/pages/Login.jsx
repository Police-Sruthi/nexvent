import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser: loginCtx } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      loginCtx(res.data.token, res.data.id, res.data.name, res.data.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
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
        width: 360, padding: 36, borderRadius: 14
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 46, height: 46,
            background: '#0D9488',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            color: 'white',
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: -1
          }}>NX</div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.7
          }}>Nexvent</h1>
          <p style={{
            color: '#64748B',
            fontSize: 12,
            marginTop: 4
          }}>Next-generation event management</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13
          }}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email address</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@nexvent.io"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-teal"
            style={{ width: '100%', padding: 11, fontSize: 13 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in to Nexvent'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 16,
          fontSize: 13,
          color: '#64748B'
        }}>
          No account?{' '}
          <Link to="/register" style={{
            color: '#0D9488',
            fontWeight: 600
          }}>Register here</Link>
        </p>

      </div>
    </div>
  );
}
