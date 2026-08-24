import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import heroBg from '../assets/hero-bg-2.jpg';

/* ── Scroll-triggered reveal hook ─────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function RevealCard({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── ZENITH Finance Logo SVG ─────────────────────────────────── */
export function ZenithLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Zenith Logo">
      {/* Coin ring */}
      <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1.5" strokeOpacity="0.3"/>
      {/* Rising trend line */}
      <polyline
        points="8,28 14,20 20,22 28,12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
      {/* Arrow head on trend */}
      <polyline
        points="24,10 28,12 26,16"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
      {/* Center dot */}
      <circle cx="20" cy="20" r="2.5" fill="white" fillOpacity="0.8"/>
    </svg>
  );
}

/* ── Data ─────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'App Preview', href: '#preview' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

const features = [
  { num: '/01', emoji: '💸', title: 'Expense Tracking', desc: 'Log every transaction by category. AI suggests tags automatically so you spend less time sorting.' },
  { num: '/02', emoji: '🎯', title: 'Smart Budgeting', desc: 'Set monthly limits per category. Get proactive alerts before you overshoot — not after.' },
  { num: '/03', emoji: '📊', title: 'Visual Analytics', desc: 'Interactive bar charts, pie charts, and trend lines. Spot spending patterns at a glance.' },
  { num: '/04', emoji: '🔒', title: 'Secure & Private', desc: 'End-to-end encrypted storage. Your data is yours — we never sell or share it.' },
];

const journey = [
  { num: '/01', title: 'Connect', desc: 'Create a free account in under a minute. Sign in with email or Google.' },
  { num: '/02', title: 'Categorize', desc: 'Log transactions as they happen. Our system learns your habits.' },
  { num: '/03', title: 'Analyze', desc: 'Review weekly and monthly trends with rich visual reports.' },
  { num: '/04', title: 'Grow', desc: 'Make smarter decisions, build savings, and hit every goal.' },
];

const useCases = [
  { name: 'Freelancers', role: 'Variable Income', text: '"Track client payments, manage business expenses separately, and never worry about tax-time chaos again."', avatar: '👩‍🎨' },
  { name: 'Professionals', role: 'Salary Tracking', text: '"Automate your monthly budget, track fixed subscriptions, and watch your savings grow systematically."', avatar: '👨‍💻' },
  { name: 'Students', role: 'Tight Budgets', text: '"Set strict limits on dining out, track educational expenses, and learn financial discipline early."', avatar: '👩‍🎓' },
  { name: 'Founders', role: 'Business & Personal', text: '"Keep personal spending cleanly separated from bootstrap costs with custom categories and tags."', avatar: '👨‍💼' },
];

const stats = [
  { value: '100%', label: 'Data Privacy' },
  { value: 'Smart', label: 'AI Insights' },
  { value: 'Real-time', label: 'Analytics' },
  { value: 'Secure', label: 'Architecture' },
];

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const [activeNav, setActiveNav] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', query: '' });
  const [enquiryStatus, setEnquiryStatus] = useState('idle');

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryStatus('loading');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/enquiries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryForm),
      });
      if (res.ok) {
        setEnquiryStatus('success');
      } else {
        setEnquiryStatus('error');
      }
    } catch (err) {
      setEnquiryStatus('error');
    }
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="relative bg-surface-950 text-white overflow-x-hidden selection:bg-white/20">

      {/* ── FIXED NAV ───────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/85 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <ZenithLogo size={28} />
            <span className="font-serif text-lg font-semibold tracking-wide uppercase">Zenith</span>
          </Link>

          <nav className="hidden lg:flex bg-white/5 backdrop-blur border border-white/10 rounded-full px-1.5 py-1 gap-0.5">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setActiveNav(label)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-200 whitespace-nowrap ${activeNav === label ? 'bg-white text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/8'}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/login" className="hidden sm:block text-sm text-slate-300 hover:text-white transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-white text-black font-bold text-sm rounded-full hover:bg-slate-100 transition-all hover:scale-105 shadow-lg">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO  (full-screen, background fills it)     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="hero" className="sticky top-0 w-full min-h-screen flex items-center bg-black overflow-hidden">
        {/* Background fills entire section — no zoom, just cover */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center opacity-40 grayscale"
            style={{ imageRendering: 'auto' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-28 pb-20">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-slate-300 mb-10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Personal finance, simplified
          </div>

          {/* Big headline — left-aligned to match image */}
          <h1 className="font-serif text-[3.2rem] sm:text-[5rem] lg:text-[6.5rem] leading-[0.9] tracking-tight mb-8 max-w-2xl">
            Secure,<br />
            <em className="italic text-slate-300">Intelligent</em>
          </h1>

          <p className="text-lg text-slate-300 max-w-lg leading-relaxed mb-12">
            Zenith helps you log, budget, and understand every rupee — with beautiful analytics and AI-powered insights built for clarity.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-20">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-base rounded-full hover:bg-slate-100 transition-all hover:scale-105 shadow-xl">
              Create free account
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 border border-white/25 text-white font-medium text-base rounded-full hover:bg-white/6 hover:border-white/40 transition-all">
              Sign in
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold font-serif">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — APP PREVIEW (dashboard mock in own section)   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="preview" className="sticky top-0 min-h-screen bg-[#09090d] border-t border-white/5 shadow-2xl flex flex-col justify-center py-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <RevealCard>
            <div className="flex items-center gap-3 mb-10">
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-widest text-slate-400">✦ App Preview</span>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
              <h2 className="font-serif text-5xl lg:text-7xl">
                <em className="italic text-slate-400">Beautiful</em> by Default
              </h2>
              <p className="text-slate-400 max-w-sm text-base leading-relaxed">
                Every screen is designed to surface what matters. No clutter, no noise — just your finances, crystal clear.
              </p>
            </div>
          </RevealCard>

          {/* Dashboard Mock — large, centered */}
          <RevealCard delay={150}>
            <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-black/60 backdrop-blur-md p-8 shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="ml-4 h-6 flex-1 rounded-full bg-white/5 max-w-xs flex items-center px-3">
                  <span className="text-xs text-slate-600">zenith.finance/dashboard</span>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Spent', value: '₹24,580', color: 'text-red-400', bar: 'bg-red-500/30' },
                  { label: 'This Month', value: '₹8,230', color: 'text-amber-400', bar: 'bg-amber-500/30' },
                  { label: 'Saved', value: '₹6,420', color: 'text-emerald-400', bar: 'bg-emerald-500/30' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-white/5 p-5">
                    <p className="text-xs text-slate-500 mb-2">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color} mb-3`}>{s.value}</p>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div className={`h-full rounded-full ${s.bar} w-3/4`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Transaction rows */}
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Recent Transactions</p>
                {[
                  { icon: '🍽️', label: 'Dinner at Trattoria', cat: 'Food & Dining', amount: '-₹1,240', date: 'Today' },
                  { icon: '🚗', label: 'Ola cab to office', cat: 'Transport', amount: '-₹180', date: 'Yesterday' },
                  { icon: '📱', label: 'Netflix subscription', cat: 'Subscriptions', amount: '-₹649', date: '2 days ago' },
                  { icon: '💼', label: 'Freelance payment', cat: 'Income', amount: '+₹25,000', date: '3 days ago' },
                ].map(e => (
                  <div key={e.label} className="flex items-center gap-4 rounded-2xl bg-white/4 px-5 py-3.5 hover:bg-white/6 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-lg flex-shrink-0">{e.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{e.label}</p>
                      <p className="text-xs text-slate-500">{e.cat} · {e.date}</p>
                    </div>
                    <p className={`text-sm font-bold flex-shrink-0 ${e.amount.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{e.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — FEATURES                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="features" className="sticky top-0 min-h-screen bg-[#0c0c10] border-t border-white/5 shadow-2xl flex flex-col justify-center py-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center gap-3 mb-10">
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-widest text-slate-400">✦ Features</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <h2 className="font-serif text-5xl lg:text-7xl">
              <em className="italic text-slate-400">What</em> We Do
            </h2>
            <p className="text-slate-400 max-w-sm text-base leading-relaxed">
              Every tool you need to understand and control your money — designed to be beautiful, fast, and intelligent.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((item, idx) => (
              <RevealCard key={idx} delay={idx * 90}>
                <div className="group rounded-3xl border border-white/8 bg-white/3 hover:bg-white/6 transition-all duration-500 p-8 flex flex-col gap-6 h-full hover:-translate-y-1.5">
                  <div className="text-4xl">{item.emoji}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 mb-3">{item.num}</p>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — HOW IT WORKS                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="sticky top-0 min-h-screen bg-[#0e0f14] border-t border-white/5 shadow-2xl flex flex-col justify-center py-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center gap-3 mb-10">
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-widest text-slate-400">✦ How It Works</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <h2 className="font-serif text-5xl lg:text-7xl">
              <em className="italic text-slate-400">The Journey</em> to<br />Financial Freedom
            </h2>
            <p className="text-slate-400 max-w-sm text-base leading-relaxed">
              Start in minutes. Our four-step process takes you from setup to smart savings — without the chaos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {journey.map((item, idx) => (
              <RevealCard key={idx} delay={idx * 90}>
                <div className="group relative rounded-3xl border border-white/5 bg-[#13151c] p-8 flex flex-col gap-6 overflow-hidden h-full hover:-translate-y-1.5 transition-transform duration-500">
                  <div className="absolute bottom-0 inset-x-0 h-2/5 bg-gradient-to-t from-white/4 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-600 mb-4">{item.num}</p>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.12)]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </div>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — USE CASES                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="use-cases" className="sticky top-0 min-h-screen bg-[#09090d] border-t border-white/5 shadow-2xl flex flex-col justify-center py-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center gap-3 mb-10">
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-widest text-slate-400">✦ Use Cases</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <h2 className="font-serif text-5xl lg:text-7xl">
              Designed for <em className="italic text-slate-400">Everyone</em>
            </h2>
            <p className="text-slate-400 max-w-sm text-base leading-relaxed">
              Whether you're managing unpredictable freelance income or a fixed salary, Zenith adapts to your lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {useCases.map((t, idx) => (
              <RevealCard key={idx} delay={idx * 100}>
                <div className="rounded-3xl border border-white/8 bg-white/3 p-8 hover:bg-white/5 transition-colors hover:-translate-y-1 duration-500 flex flex-col gap-6">
                  <p className="text-base text-slate-200 leading-relaxed italic">{t.text}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — CONTACT + FOOTER (merged, non-sticky)        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="contact" className="relative bg-black border-t border-white/5 pt-24 pb-0 flex flex-col">
        <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col">

          {/* CTA headline */}
          <RevealCard className="text-center mb-20">
            <h2 className="font-serif text-5xl sm:text-7xl mb-8">
              Ready to take <em className="italic text-slate-400">control?</em>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
                Create your free account
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-10 py-5 border border-white/20 text-white font-medium text-lg rounded-full hover:bg-white/5 transition-all">
                Sign in
              </Link>
            </div>
          </RevealCard>

          {/* Contact + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24">
            <RevealCard>
              <div className="bg-[#0d0f14] border border-white/5 rounded-3xl p-10 flex flex-col justify-between min-h-[380px]">
                <div>
                  <h3 className="font-serif text-4xl font-bold mb-3">Let's Talk</h3>
                  <p className="text-slate-400 italic text-lg">Your Next Financial Goal</p>
                </div>
                <div className="space-y-5 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600 mb-1.5">Email</p>
                    <p className="text-slate-300">hello@zenithwealth.com</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600 mb-1.5">Support Hours</p>
                    <p className="text-slate-300">Monday – Friday, 9am – 6pm IST</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600 mb-2">Follow Us</p>
                    <div className="flex gap-2">
                      {[
                        { name: 'GitHub', url: 'https://github.com/Aditya4860/smart-expense-tracker' },
                        { name: 'LinkedIn', url: 'https://www.linkedin.com/in/aditya-jain0315' },
                        { name: 'Email', url: 'mailto:mad.developer15@gmail.com' }
                      ].map(s => (
                        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-white/10 rounded-full text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors">{s.name}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </RevealCard>

            <RevealCard delay={150}>
              <div className="bg-[#0d0f14] border border-white/5 rounded-3xl p-10 flex flex-col min-h-[450px]">
                {enquiryStatus === 'success' ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Enquiry Sent</h3>
                    <p className="text-slate-400 mb-8 max-w-[250px]">We have received your details and will connect with you shortly.</p>
                    <button 
                      onClick={() => {
                        setEnquiryStatus('idle');
                        setEnquiryForm({ name: '', email: '', query: '' });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-100 transition-colors"
                    >
                      Return Back
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold mb-8">Send an Enquiry</h3>
                    <form className="space-y-7 flex-1" onSubmit={handleEnquirySubmit}>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={enquiryForm.name}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                          placeholder="Aarav Sharma" 
                          className="w-full bg-transparent border-b border-white/10 pb-3 text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-slate-700" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Email</label>
                        <input 
                          type="email" 
                          required
                          value={enquiryForm.email}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                          placeholder="aarav@example.com" 
                          className="w-full bg-transparent border-b border-white/10 pb-3 text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-slate-700" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Your Query</label>
                        <textarea 
                          required
                          value={enquiryForm.query}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, query: e.target.value })}
                          placeholder="How can we help you?" 
                          rows={3} 
                          className="w-full bg-transparent border-b border-white/10 pb-3 text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-slate-700 resize-none" 
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={enquiryStatus === 'loading'}
                        className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-slate-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {enquiryStatus === 'loading' ? 'Sending...' : 'Send Message →'}
                      </button>
                      {enquiryStatus === 'error' && (
                        <p className="text-red-400 text-xs text-center mt-3">Failed to send enquiry. Please try again.</p>
                      )}
                    </form>
                  </>
                )}
              </div>
            </RevealCard>
          </div>

          {/* Footer grid */}
          <div className="border-t border-white/8 pt-14 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm text-slate-500 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <ZenithLogo size={22} />
                <span className="font-serif text-base font-semibold text-white uppercase tracking-wide">Zenith</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 max-w-[180px]">Smart personal finance, built for precision and clarity.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-5 text-xs uppercase tracking-wider">Product</p>
              <div className="flex flex-col gap-3">
                {['Features', 'App Preview', 'How It Works', 'Testimonials'].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-white mb-5 text-xs uppercase tracking-wider">Legal</p>
              <div className="flex flex-col gap-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(l => (
                  <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-white mb-5 text-xs uppercase tracking-wider">Connect</p>
              <div className="flex flex-col gap-3">
                {[
                  { name: 'GitHub', url: 'https://github.com/Aditya4860/smart-expense-tracker' },
                  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/aditya-jain0315' },
                  { name: 'Email', url: 'mailto:mad.developer15@gmail.com' }
                ].map(l => (
                  <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{l.name}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} Zenith Wealth Technologies. All rights reserved.</p>
            <p>Made with ♥ in India</p>
          </div>

        </div>

        {/* Giant watermark */}
        <div className="overflow-hidden pointer-events-none select-none">
          <h1 className="text-[18vw] font-serif font-bold text-white/[0.025] tracking-tighter leading-none text-center">ZENITH</h1>
        </div>
      </section>

    </div>
  );
}
