import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

function getDashboardPath(role) {
  const paths = {
    CIUDADANO: '/ciudadano',
    ADMINISTRADOR: '/admin',
    TECNICO: '/tecnico'
  };

  return paths[role] || '/login';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('urbantic_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();

        if (active) {
          setUser(response.data.user);
        }
      } catch (_error) {
        localStorage.removeItem('urbantic_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [token]);

  async function signIn(credentials) {
    const response = await authApi.login(credentials);
    localStorage.setItem('urbantic_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function signUp(payload) {
    const response = await authApi.register(payload);
    localStorage.setItem('urbantic_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function saveProfile(payload) {
    const response = await authApi.updateProfile(payload);
    setUser(response.data.user);
    return response.data.user;
  }

  function signOut() {
    localStorage.removeItem('urbantic_token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    signIn,
    signUp,
    signOut,
    saveProfile,
    getDashboardPath
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
