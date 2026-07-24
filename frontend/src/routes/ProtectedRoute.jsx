import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute — route guard that enforces authentication.
 *
 * Usage (inside a <Routes> tree):
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/expenses"  element={<Expenses />}  />
 *   </Route>
 *
 * Behaviour:
 *  - While auth state is being restored from localStorage, renders nothing
 *    (avoids a flash-redirect before the session is confirmed).
 *  - Authenticated users: renders the nested <Outlet>.
 *  - Unauthenticated users: redirects to /login, preserving the originally
 *    requested path in location state so the login page can redirect back.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
