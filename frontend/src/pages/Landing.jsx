import { Navigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import heroBg from '../assets/hero-bg-2.jpg';

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const navLinks = ['Services', 'About', 'Projects', 'Blog', 'Contact'];

  const whatWeDo = [
    { num: '/01', title: 'Expense Tracking', desc: 'Log and categorize your daily expenses with AI-driven precision and speed.' },
    { num: '/02', title: 'Smart Budgeting', desc: 'Set dynamic limits and receive alerts before you overspend, keeping you on track.' },
    { num: '/03', title: 'Actionable Analytics', desc: 'Visualize your cash flow with beautiful, interactive charts and custom date ranges.' },
    { num: '/04', title: 'Secure Vault', desc: 'Your financial data is encrypted and securely stored, ensuring absolute privacy.' }
  ];

  const journey = [
    { num: '/01', title: 'Connect', desc: 'Create your free account in seconds and securely enter your initial balance.' },
    { num: '/02', title: 'Categorize', desc: 'Log your transactions as they happen. Our intelligent system learns your habits.' },
    { num: '/03', title: 'Analyze', desc: 'Review your weekly and monthly spending patterns through detailed visual reports.' },
    { num: '/04', title: 'Grow', desc: 'Make informed financial decisions, build your savings, and reach your goals.' }
  ];

  return (
    <div className="relative bg-surface-950 text-white overflow-x-hidden selection:bg-white/20 selection:text-white">
      
      {/* Sticky Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* New minimalist icon */}
          <div className="w-6 h-6 border-2 border-white transform rotate-45 rounded-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-wide uppercase">
            Onyx
          </span>
        </div>

        {/* Floating Capsule Nav */}
        <nav className="hidden md:flex pointer-events-auto bg-surface-900/80 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-float">
          {navLinks.map((link, idx) => (
            <a key={link} href={`#${link.toLowerCase()}`} className={`px-5 py-2 text-sm transition-colors rounded-full hover:bg-white/5 ${idx === 0 ? 'border border-indigo-500 bg-indigo-500/10 text-white' : 'text-slate-300 hover:text-white'}`}>
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 pointer-events-auto">
          <Link to="/login" className="hidden sm:block text-sm font-medium hover:text-slate-300 transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-slate-200 transition-colors shadow-glow-primary">
            Create free account
          </Link>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section id="about" className="sticky top-0 w-full min-h-screen flex flex-col justify-center bg-surface-950 overflow-hidden shadow-card-dark">
        {/* Background Image with Dark Overlays - BRIGHTER NOW */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-black">
          <img 
            src={heroBg} 
            alt="Bank Building Background" 
            className="w-full h-full object-cover opacity-50 grayscale brightness-100"
          />
          {/* Gradient to fade into the solid background below */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-surface-950/40 to-surface-950/90" />
        </div>

        <main className="relative z-10 flex-1 flex flex-col justify-center px-8 lg:px-20 pt-32 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full max-w-[1400px] mx-auto">
            
            {/* Left Column: Big Serif Title */}
            <div className="animate-fade-up">
              <h1 className="font-serif text-[4rem] sm:text-[6rem] lg:text-[7rem] leading-[0.9] tracking-tight">
                Secure,
                <br />
                <span className="italic text-slate-300">Intelligent</span>
              </h1>
            </div>

            {/* Right Column: Paragraph */}
            <div className="animate-fade-up delay-100 flex flex-col items-start lg:items-end text-left lg:text-right space-y-8">
              <p className="text-xl sm:text-2xl text-slate-300 max-w-md font-light leading-relaxed">
                © We build wealth, stability and financial intelligence <span className="text-slate-500 italic">with precision, clarity and care.</span>
              </p>
            </div>
          </div>

          {/* Bottom Row inside Hero */}
          <div className="w-full max-w-[1400px] mx-auto mt-24 lg:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 items-end animate-fade-in delay-200">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">We do</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Expense Tracking <span className="text-white/20 px-2">/</span> Analytics</li>
                <li>Budget Management <span className="text-white/20 px-2">/</span> Security</li>
              </ul>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center pb-4">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25h-15m15 4.5h-15m15 4.5h-15m15 4.5h-15" />
                </svg>
              </div>
            </div>

            <div className="space-y-4 md:text-right">
              <p className="text-sm font-semibold text-slate-500">(02)</p>
              <div className="inline-block relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer w-64 h-36 bg-surface-900">
                <img src={heroBg} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                   <span className="font-semibold text-sm tracking-widest uppercase bg-black/60 px-3 py-1.5 rounded">Discover</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* SECTION 2: WHAT WE DO (Deck Effect) */}
      <section id="services" className="sticky top-0 w-full min-h-screen bg-[#0a0a0c] px-8 lg:px-20 py-24 flex flex-col justify-center border-t border-white/5 shadow-2xl">
        <div className="max-w-[1400px] mx-auto w-full">
          
          <div className="flex items-center gap-4 mb-12">
            <span className="px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white/5">
              Our Services
            </span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
            <h2 className="font-serif text-5xl lg:text-7xl">
              <span className="italic text-slate-400">What</span> We Do
            </h2>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              We craft financial tools from idea to execution — blending analytics, design, and engineering to build wealth that lasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatWeDo.map((item, idx) => (
              <div key={idx} className="group relative rounded-3xl border border-white/10 bg-surface-900/40 p-8 hover:bg-surface-800 transition-colors duration-500 flex flex-col justify-between aspect-[4/5]">
                {/* Minimal abstract icon placeholder */}
                <div className="h-32 w-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 border border-white/20 rounded-2xl transform rotate-12 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-4">{item.num}</p>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 3: THE JOURNEY (Deck Effect) */}
      <section id="projects" className="sticky top-0 w-full min-h-screen bg-[#0d0e12] px-8 lg:px-20 py-24 flex flex-col justify-center border-t border-white/5 shadow-2xl">
        <div className="max-w-[1400px] mx-auto w-full">
          
          <div className="flex items-center gap-4 mb-12">
            <span className="px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white/5">
              Our Process
            </span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
            <h2 className="font-serif text-5xl lg:text-7xl">
              <span className="italic text-slate-400">The Journey</span> to<br/>Financial Freedom
            </h2>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              We keep things simple and automated — so you go from budgeting to saving without the chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {journey.map((item, idx) => (
              <div key={idx} className="group relative rounded-3xl border border-white/5 bg-[#12141a] p-8 hover:-translate-y-2 transition-transform duration-500 flex flex-col overflow-hidden aspect-[4/5]">
                {/* Arch Background shape */}
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent rounded-t-[100%]" />
                
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-500 mb-6">{item.num}</p>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                
                {/* Floating icon */}
                <div className="mt-auto relative z-10 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: CONTACT US (Deck Effect) */}
      <section id="contact" className="sticky top-0 w-full min-h-screen bg-[#07080a] px-8 lg:px-20 py-24 flex flex-col justify-center border-t border-white/5 shadow-2xl">
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="bg-gradient-to-br from-surface-900 to-black p-12 rounded-3xl border border-white/5 flex flex-col justify-end min-h-[400px]">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-2">Let's Talk</h2>
            <p className="text-xl italic text-slate-400">Your Next Big Goal</p>
          </div>

          <div className="bg-[#12141a] p-12 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-8">Fill This Form Below</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Your Name</label>
                <input type="text" placeholder="Enter your full name" className="w-full bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Your Email</label>
                <input type="email" placeholder="Enter your email" className="w-full bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">More About Your Query</label>
                <textarea placeholder="How can we help you?" rows="3" className="w-full bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-slate-600 resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors mt-8">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Footer / CTA Section (Deck Effect) */}
      <section className="sticky top-0 w-full min-h-screen bg-black px-8 lg:px-20 py-24 flex flex-col justify-center border-t border-white/5">
        <div className="max-w-[1400px] mx-auto w-full text-center">
          <h2 className="font-serif text-5xl sm:text-7xl mb-8 mt-12">Ready to take control?</h2>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-semibold text-lg rounded-full hover:bg-slate-200 transition-transform hover:scale-105"
          >
            Create your free account
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          <div className="mt-32 pt-12 border-t border-white/10 flex flex-col lg:flex-row justify-between items-start gap-12 text-sm text-slate-400 text-left">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
              <div>
                <p className="font-bold text-white mb-4">Location</p>
                <p>1234 Market Street, Suite 500<br/>San Francisco, CA 94103, US</p>
              </div>
              <div>
                <p className="font-bold text-white mb-4">Contact</p>
                <p>info@onyxwealth.com<br/>+1 (415) 555-0132</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold text-white mb-4">Links</p>
                <a href="#about" className="hover:text-white transition-colors">About</a>
                <a href="#services" className="hover:text-white transition-colors">Services</a>
                <a href="#projects" className="hover:text-white transition-colors">Projects</a>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold text-white mb-4">Socials</p>
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                <a href="#" className="hover:text-white transition-colors">X(Twitter)</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">Dribbble</a>
              </div>
            </div>
          </div>
          <h1 className="text-[12vw] font-serif font-bold text-white/5 tracking-tighter mt-12 mb-[-6rem] leading-none select-none text-center">ONYX</h1>
        </div>
      </section>
      
    </div>
  );
}
