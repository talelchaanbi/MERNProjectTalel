import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest } from '../services/auth';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      try {
        const { user: current } = await fetchCurrentUser();
        if (isMounted) {
          setUser(current);
        }
      } catch (_) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setStatus('ready');
        }
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setStatus('loading');
    try {
      const data = await loginRequest(credentials);
      setUser(data.user);
      return data;
    } finally {
      setStatus('ready');
    }
  }, []);

  const logout = useCallback(async () => {
    setStatus('loading');
    try {
      await logoutRequest();
      setUser(null);
    } finally {
      setStatus('ready');
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, isAuthenticated: Boolean(user) }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
