import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('thabat_token') || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Authenticate token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Session invalid");
        return res.json();
      })
      .then(data => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = async (fullName, email) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login request failed");
    }

    return data; // { requiresOtp, email, devOtp, message }
  };

  const register = async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data; // { requiresOtp, email, devOtp, message }
  };

  const verifyOtp = async (email, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Verification failed");
    }

    setToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem('thabat_token', data.token);
    return data.user;
  };

  const resendOtp = async (email) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to resend code");
    }

    return data;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('thabat_token');
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        return data.user;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
