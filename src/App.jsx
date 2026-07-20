import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { IncomeProvider } from './context/IncomeContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { BudgetProvider } from './context/BudgetContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';

/**
 * App.jsx — Root component.
 *
 * Provider hierarchy (outermost → innermost):
 *   AuthProvider → ExpenseProvider → IncomeProvider → AnalyticsProvider → BudgetProvider → BrowserRouter → Routes
 *
 * Route structure:
 *   /            → Landing     (public)
 *   /login       → Login       (public; redirects to /dashboard if authed)
 *   /register    → Register    (public; redirects to /dashboard if authed)
 *   /dashboard   → Dashboard   (protected)
 *   /expenses    → Expenses    (protected)
 *   /income      → Income      (protected)
 *   /analytics   → Analytics   (protected)
 *   /budget      → Budget      (protected)
 */
function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <IncomeProvider>
          <AnalyticsProvider>
            <BudgetProvider>
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
                    <Route path="/income"    element={<Income />}    />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/budget"    element={<Budget />}    />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </BudgetProvider>
          </AnalyticsProvider>
        </IncomeProvider>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
