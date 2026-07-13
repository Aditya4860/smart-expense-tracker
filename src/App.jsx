import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

/**
 * App.jsx — Root component.
 *
 * Provider hierarchy (outermost → innermost):
 *   AuthProvider → BrowserRouter → Routes
 *
 * Route structure:
 *   /            → Landing     (public)
 *   /login       → Login       (public; redirects to /dashboard if authed)
 *   /register    → Register    (public; redirects to /dashboard if authed)
 *   /dashboard   → Dashboard   (protected via ProtectedRoute)
 *   *            → redirect to /
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Landing />}  />
          <Route path="/login"    element={<Login />}    />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
