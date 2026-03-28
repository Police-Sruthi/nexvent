import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  // Check if user was already logged in (survives page refresh)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const id    = localStorage.getItem('userId');
    const name  = localStorage.getItem('userName');
    const role  = localStorage.getItem('userRole');
    return token ? { token, id: id ? Number(id) : null, name, role } : null;
  });

  // Called when login succeeds
  const loginUser = (token, id, name, role) => {
    localStorage.setItem('token',    token);
    localStorage.setItem('userId',   String(id));
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
    setUser({ token, id: Number(id), name, role });
  };

  // Called when user clicks logout
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Shortcut — write: const { user } = useAuth()
export const useAuth = () => useContext(AuthContext);