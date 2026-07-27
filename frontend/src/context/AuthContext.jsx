import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext
} from 'react';
import { authApi } from '../services/api/authApi';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'set_auth_token';
const REFRESH_TOKEN_KEY = 'set_refresh_token';
const USER_KEY = 'set_auth_user';

function persistSession(token, refreshToken, user) {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function restoreSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);

  if (!token || !raw) return null;

  try {
    const user = JSON.parse(raw);
    return { token, user };
  } catch {
    clearSession();
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for the unauthorized event from apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const session = restoreSession();
    if (session) {
      setToken(session.token);
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }
    
    try {
      const response = await authApi.login(email, password);
      // Assuming the backend returns standard JWT schema: { access_token: '...', user: {...} }
      // Or we just decode the JWT payload for user info if not provided
      const newToken = response.access_token || response.token;
      const newRefreshToken = response.refresh_token;
      
      const authenticatedUser = response.user || {
        email: email,
        name: email.split('@')[0],
      };

      persistSession(newToken, newRefreshToken, authenticatedUser);
      setToken(newToken);
      setUser(authenticatedUser);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials' };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required.' };
    }
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    try {
      const response = await authApi.register(name, email, password);
      
      // Auto login or use returned token
      const newToken = response.access_token || response.token;
      const newRefreshToken = response.refresh_token;
      const newUser = response.user || { email, name };

      if (newToken) {
        persistSession(newToken, newRefreshToken, newUser);
        setToken(newToken);
        setUser(newUser);
      }
      return { success: true, needsLogin: !newToken };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    register,
  }), [
    user,
    token,
    loading,
    login,
    logout,
    register
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be called inside <AuthProvider>');
  return ctx;
}

