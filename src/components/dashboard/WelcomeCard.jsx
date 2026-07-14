import { memo } from 'react';
import useAuth from '../../hooks/useAuth';

const MESSAGES = [
  'Every rupee tracked is a step toward financial freedom.',
  'Small habits compound into big results. Keep going.',
  'Clarity in spending leads to clarity in life.',
  'Awareness is the first step to financial wellness.',
  'Track today, thrive tomorrow.',
  'Mindful spending is the foundation of wealth.',
  "You're building something great — stay consistent.",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/**
 * WelcomeCard — gradient hero card with greeting, user name, date, and a motivational quote.
 */
const WelcomeCard = memo(function WelcomeCard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const message   = MESSAGES[new Date().getDay() % MESSAGES.length];

  return (
    <div
      id="welcome-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-glow-primary/50"
    >
      {/* Decorative circles — layered for depth */}
      <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.06]" />
      <div aria-hidden="true" className="absolute -right-4 -bottom-10 h-40 w-40 rounded-full bg-white/[0.04]" />
      <div aria-hidden="true" className="absolute left-1/2 -top-8 h-32 w-32 rounded-full bg-white/[0.04]" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Text content */}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">
            {formatToday()}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {getGreeting()}, {firstName} 👋
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/70 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Decorative coin icon badge */}
        <div
          className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white/90">
            <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default WelcomeCard;
