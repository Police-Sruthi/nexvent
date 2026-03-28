import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar       from './components/Sidebar';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Events        from './pages/Events';
import Venues        from './pages/Venues';
import Attendees     from './pages/Attendees';
import Notifications from './pages/Notifications';
import Users         from './pages/Users';

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user
    ? <AppLayout>{children}</AppLayout>
    : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"
        element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register"
        element={user ? <Navigate to="/" /> : <Register />} />

      {/* Routes for ALL logged in users */}
      <Route path="/" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      }/>
      <Route path="/events" element={
        <PrivateRoute><Events /></PrivateRoute>
      }/>
      <Route path="/venues" element={
        <PrivateRoute><Venues /></PrivateRoute>
      }/>
      <Route path="/notifications" element={
        <PrivateRoute><Notifications /></PrivateRoute>
      }/>

      {/* Admin only routes */}
      <Route path="/attendees" element={
        <AdminRoute><Attendees /></AdminRoute>
      }/>
      <Route path="/users" element={
        <AdminRoute><Users /></AdminRoute>
      }/>

      {/* User only routes */}
      <Route path="/my-bookings" element={
        <PrivateRoute><Attendees /></PrivateRoute>
      }/>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}


