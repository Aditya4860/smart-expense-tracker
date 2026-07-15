import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';

/**
 * App.jsx — Root component.
 *
 * Provider hierarchy (outermost → innermost):
 *   AuthProvider → ExpenseProvider → BrowserRouter → Routes
 *
 * Route structure:
 *   /            → Landing     (public)
 *   /login       → Login       (public; redirects to /dashboard if authed)
 *   /register    → Register    (public; redirects to /dashboard if authed)
 *   /dashboard   → Dashboard   (protected)
 *   /expenses    → Expenses    (protected)
 *   *            → redirect to /
 */
function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/"         element={<Landing />}  />
            <Route path="/login"    element={<Login />}    />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses"  element={<Expenses />}  />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
