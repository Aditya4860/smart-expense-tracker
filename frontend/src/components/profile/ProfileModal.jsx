import { useState, useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';

const CURRENCIES = [
  { code: 'INR', label: '₹ Indian Rupee' },
  { code: 'USD', label: '$ US Dollar' },
  { code: 'EUR', label: '€ Euro' },
  { code: 'GBP', label: '£ British Pound' },
  { code: 'JPY', label: '¥ Japanese Yen' },
  { code: 'CAD', label: '$ Canadian Dollar' },
  { code: 'AUD', label: 'A$ Australian Dollar' },
  { code: 'SGD', label: 'S$ Singapore Dollar' },
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * ProfileModal — full-screen-centered modal card for viewing and editing user profile.
 *
 * Props:
 *   isOpen  — boolean, controls visibility
 *   onClose — function to close the modal
 */
export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ full_name: '', currency_preference: '' });
  const modalRef = useRef(null);

  // Sync form with current user data
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || user.name || '',
        currency_preference: user.currency_preference || 'USD',
      });
    }
  }, [user]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);


  function handleClose() {
    setEditing(false);
    setError('');
    setSaved(false);
    onClose();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }

  async function handleSave() {
    if (!form.full_name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    setError('');
    const result = await updateProfile({
      full_name: form.full_name.trim(),
      currency_preference: form.currency_preference,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Failed to save. Please try again.');
      return;
    }
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!isOpen) return null;

  const initials = getInitials(user?.full_name || user?.name);
  const displayName = user?.full_name || user?.name || '—';
  const currency = CURRENCIES.find(c => c.code === user?.currency_preference) || CURRENCIES[0];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="User Profile"
    >
      {/* Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[#0d0f14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
      >
        {/* Header bar with avatar */}
        <div className="relative h-28 bg-gradient-to-br from-white/5 to-white/0 border-b border-white/8 flex items-end px-8 pb-0">
          {/* Subtle geometric bg */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border border-white/20" />
            <div className="absolute top-4 right-16 w-24 h-24 rounded-full border border-white/10" />
          </div>

          {/* Avatar */}
          <div className="relative -mb-8 flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center text-xl font-bold shadow-xl ring-4 ring-[#0d0f14]">
              {initials}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pt-12 pb-8 space-y-6">

          {/* Name + role */}
          <div>
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/8 border border-white/10 text-xs text-slate-300 font-medium capitalize">
                {user?.role || 'user'}
              </span>
              {user?.is_active && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Success flash */}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Profile updated successfully!
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              {editing ? (
                <input
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              ) : (
                <p className="text-sm text-white font-medium px-4 py-2.5 bg-white/3 rounded-xl border border-white/5">{displayName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <p className="text-sm text-slate-300 px-4 py-2.5 bg-white/3 rounded-xl border border-white/5 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500 flex-shrink-0">
                  <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                  <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                </svg>
                {user?.email || '—'}
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Currency</label>
              {editing ? (
                <select
                  name="currency_preference"
                  value={form.currency_preference}
                  onChange={handleChange}
                  className="w-full bg-[#0d0f14] border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-slate-300 px-4 py-2.5 bg-white/3 rounded-xl border border-white/5">{currency.label}</p>
              )}
            </div>

            {/* Member since */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Member Since</label>
              <p className="text-sm text-slate-400 px-4 py-2.5 bg-white/3 rounded-xl border border-white/5">{formatDate(user?.created_at)}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <button
                  onClick={() => { setEditing(false); setError(''); setForm({ full_name: user?.full_name || user?.name || '', currency_preference: user?.currency_preference || 'USD' }); }}
                  className="flex-1 py-3 rounded-xl border border-white/12 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                      </svg>
                      Saving…
                    </>
                  ) : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-100 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
