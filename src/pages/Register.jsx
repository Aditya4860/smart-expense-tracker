import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import useAuth from '../hooks/useAuth';

/**
 * Register — creates a new user account.
 *
 * - Validates name (non-empty), email format, password length (≥8),
 *   and confirm-password match before submitting.
 * - Delegates to AuthContext.register(); shows the error string on failure.
 * - Redirects authenticated users immediately to /dashboard.
 */
function Register() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate(fields) {
    const errs = {};

    if (!fields.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (fields.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!fields.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!fields.password) {
      errs.password = 'Password is required.';
    } else if (fields.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (!fields.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (fields.password !== fields.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
      const result = await register(form.name.trim(), form.email.trim(), form.password);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setServerError(result.error ?? 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Password strength indicator
  function getPasswordStrength(pw) {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-danger-500', width: 'w-1/4' };
    if (score <= 2) return { label: 'Fair', color: 'bg-warning-500', width: 'w-2/4' };
    if (score <= 3) return { label: 'Good', color: 'bg-primary-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-success-500', width: 'w-full' };
  }

  const strength = getPasswordStrength(form.password);

  if (authLoading) return null;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your expenses in seconds — free forever"
    >
      <form id="register-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Server error */}
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

        {/* Full name */}
        <div className="space-y-1.5">
          <label htmlFor="register-name" className="block text-sm font-medium text-slate-300">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            name="name"
            autoComplete="name"
            autoFocus
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Smith"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            className={`input ${errors.name ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
          />
          {errors.name && (
            <p id="register-name-error" role="alert" className="text-xs text-danger-400 animate-fade-in">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="register-email" className="block text-sm font-medium text-slate-300">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            className={`input ${errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
          />
          {errors.email && (
            <p id="register-email-error" role="alert" className="text-xs text-danger-400 animate-fade-in">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="register-password" className="block text-sm font-medium text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              aria-invalid={!!errors.password}
              aria-describedby="register-password-hint register-password-strength"
              className={`input pr-11 ${errors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
            />
            <button
              type="button"
              id="register-toggle-password"
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

          {/* Password strength bar */}
          {strength && (
            <div id="register-password-strength" aria-live="polite" className="space-y-1">
              <div className="h-1 w-full rounded-full bg-surface-700">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                />
              </div>
              <p className="text-xs text-slate-500">
                Strength:{' '}
                <span className={
                  strength.label === 'Weak' ? 'text-danger-400' :
                  strength.label === 'Fair' ? 'text-warning-500' :
                  strength.label === 'Good' ? 'text-primary-400' :
                  'text-success-400'
                }>
                  {strength.label}
                </span>
              </p>
            </div>
          )}

          {errors.password ? (
            <p id="register-password-hint" role="alert" className="text-xs text-danger-400 animate-fade-in">
              {errors.password}
            </p>
          ) : (
            <p id="register-password-hint" className="text-xs text-slate-500">
              Must be at least 8 characters.
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="register-confirm-password" className="block text-sm font-medium text-slate-300">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="register-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
              className={`input pr-11 ${errors.confirmPassword ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : (form.confirmPassword && form.confirmPassword === form.password ? 'border-success-500/60 focus:border-success-500 focus:ring-success-500/20' : '')}`}
            />
            <button
              type="button"
              id="register-toggle-confirm"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-150"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
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
          {errors.confirmPassword && (
            <p id="register-confirm-error" role="alert" className="text-xs text-danger-400 animate-fade-in">
              {errors.confirmPassword}
            </p>
          )}
          {!errors.confirmPassword && form.confirmPassword && form.confirmPassword === form.password && (
            <p className="text-xs text-success-400 animate-fade-in">Passwords match ✓</p>
          )}
        </div>

        {/* Submit */}
        <button
          id="register-submit"
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
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>

        {/* Terms note */}
        <p className="text-center text-xs text-slate-500">
          By creating an account you agree to our{' '}
          <span className="text-slate-400 cursor-not-allowed">Terms of Service</span>
          {' '}and{' '}
          <span className="text-slate-400 cursor-not-allowed">Privacy Policy</span>.
        </p>

        {/* Divider */}
        <div className="divider" />

        {/* Login link */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            id="register-to-login"
            className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;
