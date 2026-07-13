import { useState } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect already-authenticated users away from login
  if (!authLoading && isAuthenticated) {
    const from = location.state?.from?.pathname ?? '/dashboard';
    return <Navigate to={from} replace />;
  }

  function validate() {
    const next = {};
    if (!form.email.trim())    next.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
                               next.email    = 'Enter a valid email address.';
    if (!form.password)        next.password = 'Password is required.';
    return next;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError)     setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    setApiError('');
    const result = await login(form.email.trim(), form.password);
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error ?? 'Sign in failed. Please try again.');
      return;
    }
    const from = location.state?.from?.pathname ?? '/dashboard';
    navigate(from, { replace: true });
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Smart Expense Tracker account."
      footer={
        <>
          Don't have an account?{' '}
          <Link
            id="login-to-register"
            to="/register"
            className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            Create one
          </Link>
        </>
      }
    >
      <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* API error banner */}
        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            {apiError}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={[
              'input',
              errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
            ].join(' ')}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="mt-1.5 text-xs text-danger-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={[
              'input',
              errors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
            ].join(' ')}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-danger-400">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-sm"
        >
          {submitting ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
