import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — convenience hook for consuming AuthContext.
 *
 * Throws an error if used outside of <AuthProvider> so that
 * mis-use is caught immediately during development.
 *
 * @returns {{
 *   user:            object | null,
 *   token:           string | null,
 *   loading:         boolean,
 *   isAuthenticated: boolean,
 *   login:           (email: string, password: string) => Promise<{ success: boolean, error?: string }>,
 *   logout:          () => void,
 *   register:        (name: string, email: string, password: string) => Promise<{ success: boolean, error?: string }>,
 * }}
 */
function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      'useAuth must be used within an <AuthProvider>. ' +
      'Wrap a parent component with <AuthProvider> to fix this.'
    );
  }

  return context;
}

export default useAuth;
