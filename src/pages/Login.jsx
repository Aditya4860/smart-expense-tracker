import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import useAuth from '../hooks/useAuth';

/**
 * Login — authenticates an existing user.
 *
 * - Validates email format and non-empty password before submitting.
 * - Delegates to AuthContext.login(); shows the error string on failure.
 * - Redirects authenticated users immediately to /dashboard (or the
 *   page they were trying to access, preserved in location.state.from).
 */
function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname ?? '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validate(fields) {
    const errs = {};
    if (!fields.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!fields.password) {
      errs.password = 'Password is required.';
    }
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const result = await login(form.email.trim(), form.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setServerError(result.error ?? 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // While auth state is restoring, show nothing to avoid flash
  if (authLoading) return null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard"
    >
      <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Server error banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400 animate-fade-in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            {serverError}
          </div>
        )}

        {/* Email field */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className={`input ${errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-xs text-danger-400 animate-fade-in">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            {/* Placeholder for future forgot-password flow */}
            <span className="text-xs text-slate-500 cursor-not-allowed select-none">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className={`input pr-11 ${errors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
            />
            <button
              type="button"
              id="login-toggle-password"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-150"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                  <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" role="alert" className="text-xs text-danger-400 animate-fade-in">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-base mt-2"
        >
          {submitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Divider */}
        <div className="divider" />

        {/* Register link */}
        <p className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            id="login-to-register"
            className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-150"
          >
            Create one free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
