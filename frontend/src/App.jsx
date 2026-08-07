import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { CategoryProvider } from './context/CategoryContext';
import { TransactionProvider } from './context/TransactionContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { IncomeProvider } from './context/IncomeContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { BudgetProvider } from './context/BudgetContext';
import { GoalProvider } from './context/GoalContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PageLoader from './components/PageLoader';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Each page is split into its own JS chunk; loaded only when first visited.
const Landing    = lazy(() => import('./pages/Landing'));
const Login      = lazy(() => import('./pages/Login'));
const Register   = lazy(() => import('./pages/Register'));
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const Expenses   = lazy(() => import('./pages/Expenses'));
const Income     = lazy(() => import('./pages/Income'));
const Analytics  = lazy(() => import('./pages/Analytics'));
const Budget     = lazy(() => import('./pages/Budget'));
const Goals      = lazy(() => import('./pages/Goals'));
const Reports    = lazy(() => import('./pages/Reports'));
const Categories = lazy(() => import('./pages/Categories'));
const Reminders  = lazy(() => import('./pages/Reminders'));

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <CategoryProvider>
            <TransactionProvider>
              <ExpenseProvider>
                <IncomeProvider>
                  <AnalyticsProvider>
                    <BudgetProvider>
                      <GoalProvider>
                        <BrowserRouter>
                          {/* Suspense wraps all routes — shows PageLoader during lazy chunk fetch */}
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                              {/* Public routes */}
                              <Route path="/"         element={<Landing />}  />
                              <Route path="/login"    element={<Login />}    />
                              <Route path="/register" element={<Register />} />

                              {/* Protected routes */}
                              <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard"  element={<Dashboard />}  />
                                <Route path="/expenses"   element={<Expenses />}   />
                                <Route path="/income"     element={<Income />}     />
                                <Route path="/analytics"  element={<Analytics />}  />
                                <Route path="/budget"     element={<Budget />}     />
                                <Route path="/goals"      element={<Goals />}      />
                                <Route path="/reminders"  element={<Reminders />}  />
                                <Route path="/reports"    element={<Reports />}    />
                                <Route path="/categories" element={<Categories />} />
                              </Route>


                              {/* Catch-all */}
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </Suspense>
                        </BrowserRouter>
                      </GoalProvider>
                    </BudgetProvider>
                  </AnalyticsProvider>
                </IncomeProvider>
              </ExpenseProvider>
            </TransactionProvider>
          </CategoryProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}


export default App;
