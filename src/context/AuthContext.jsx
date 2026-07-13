import { createContext, useState, useEffect, useCallback } from 'react';

/**
 * AuthContext — React Context for global authentication state.
 *
 * Consumed via the `useAuth` hook. Never consume this context directly
 * outside of that hook.
 */
export const AuthContext = createContext(null);

const TOKEN_KEY = 'set_auth_token';
const USER_KEY = 'set_auth_user';

/**
 * Generates a deterministic mock JWT-shaped token.
 * Format: header.payload.signature (base64url segments).
 */
function generateMockToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  );
  const signature = btoa(`mock-signature-${user.id}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Decodes the payload from a mock token and checks expiry.
 * Returns the decoded payload or null if invalid / expired.
 */
function decodeMockToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Persists auth data to localStorage.
 */
function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Removes auth data from localStorage.
 */
function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Attempts to restore a valid session from localStorage.
 * Returns { token, user } or null if no valid session exists.
 */
function restoreSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);

  if (!token || !raw) return null;

  const decoded = decodeMockToken(token);
  if (!decoded) {
    clearSession();
    return null;
  }

  try {
    const user = JSON.parse(raw);
    return { token, user };
  } catch {
    clearSession();
    return null;
  }
}

/**
 * AuthProvider — wraps the application and exposes auth state + actions
 * through AuthContext.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * On first mount, attempt to restore an existing session from localStorage.
   * This ensures page refreshes do not log the user out.
   */
  useEffect(() => {
    const session = restoreSession();
    if (session) {
      setToken(session.token);
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  /**
   * login — authenticates a user with email + password.
   * Returns an object: { success: boolean, error?: string }.
   *
   * Mock behaviour: any non-empty email + password succeeds.
   * A real implementation would call an API endpoint here.
   */
  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const authenticatedUser = {
      id: `user_${btoa(normalizedEmail).replace(/=/g, '')}`,
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
    };

    const newToken = generateMockToken(authenticatedUser);

    persistSession(newToken, authenticatedUser);
    setToken(newToken);
    setUser(authenticatedUser);

    return { success: true };
  }, []);

  /**
   * register — creates a new user account.
   * Returns an object: { success: boolean, error?: string }.
   *
   * Mock behaviour: any valid, non-empty payload succeeds.
   */
  const register = useCallback(async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required.' };
    }
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const newUser = {
      id: `user_${btoa(normalizedEmail).replace(/=/g, '')}`,
      email: normalizedEmail,
      name: name.trim(),
    };

    const newToken = generateMockToken(newUser);

    persistSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);

    return { success: true };
  }, []);

  /**
   * logout — clears all auth state and localStorage session.
   */
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
