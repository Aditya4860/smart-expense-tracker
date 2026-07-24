import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';

export default function Register() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect already-authenticated users
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function validate() {
    const next = {};
    if (!form.name.trim())
      next.name = 'Full name is required.';
    else if (form.name.trim().length < 2)
      next.name = 'Name must be at least 2 characters.';

    if (!form.email.trim())
      next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = 'Enter a valid email address.';

    if (!form.password)
      next.password = 'Password is required.';
    else if (form.password.length < 8)
      next.password = 'Password must be at least 8 characters.';

    if (!form.confirmPassword)
      next.confirmPassword = 'Please confirm your password.';
    else if (form.password && form.confirmPassword !== form.password)
      next.confirmPassword = 'Passwords do not match.';

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
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error ?? 'Registration failed. Please try again.');
      return;
    }
    navigate('/dashboard', { replace: true });
  }

  function FieldError({ id, message }) {
    if (!message) return null;
    return (
      <p id={id} role="alert" className="mt-1.5 text-xs text-danger-400">
        {message}
      </p>
    );
  }

  function inputClass(field) {
    return [
      'input',
      errors[field] ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
    ].join(' ');
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start tracking your expenses for free — no credit card required."
      footer={
        <>
          Already have an account?{' '}
          <Link
            id="register-to-login"
            to="/login"
            className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form id="register-form" onSubmit={handleSubmit} noValidate className="space-y-4">

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

        {/* Full name */}
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Full name
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Aarav Sharma"
            className={inputClass('name')}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          <FieldError id="register-name-error" message={errors.name} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email address
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="aarav@example.com"
            className={inputClass('email')}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          <FieldError id="register-email-error" message={errors.email} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            className={inputClass('password')}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            aria-invalid={!!errors.password}
          />
          <FieldError id="register-password-error" message={errors.password} />
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-300">
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            className={inputClass('confirmPassword')}
            aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
            aria-invalid={!!errors.confirmPassword}
          />
          <FieldError id="register-confirm-error" message={errors.confirmPassword} />
        </div>

        {/* Password strength hint */}
        {form.password.length > 0 && form.password.length < 8 && (
          <p className="text-xs text-warning-500">
            {8 - form.password.length} more character{8 - form.password.length !== 1 ? 's' : ''} needed.
          </p>
        )}

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-sm mt-2"
        >
          {submitting ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
              </svg>
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
