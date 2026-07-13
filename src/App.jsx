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
 * Responsibilities:
 *  - Wraps the entire application in BrowserRouter
 *  - Mounts AuthProvider so every route can access auth state via useAuth()
 *  - Defines the top-level route structure
 *  - Acts as the single composition root for global providers (added phase by phase)
 *
 * Route structure:
 *  Phase 1  → Scaffold placeholder
 *  Phase 2  → Auth routes + ProtectedRoute guard  ← current
 *  Phase 3+ → Feature routes (Expenses, Income, Dashboard, etc.)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — unauthenticated users are redirected to /login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
