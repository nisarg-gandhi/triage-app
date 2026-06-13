import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// ── Palette: #F7F3EE bg | #0F0F0F text | #6B6560 muted | #7C3AED accent ──────

// ── Icons ─────────────────────────────────────────────────────────────────────

const LogoMark = () => (
  <img src="/icon.svg" alt="Triage" className="w-7 h-7 flex-shrink-0" />
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SubmitIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BrainIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const CheckSquareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 L13.5 8.5 L19 10 L13.5 11.5 L12 17 L10.5 11.5 L5 10 L10.5 8.5 Z" />
    <path d="M19 3 l.9 2.6 2.6.9-2.6.9L19 10l-.9-2.6-2.6-.9 2.6-.9Z" />
  </svg>
);

const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Styled Div Mockups ────────────────────────────────────────────────────────

function AIMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E2DA] shadow-lg bg-white">
      <div className="px-4 py-3 border-b border-[#F0EBE4]" style={{ background: '#FDFAF7' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#0F0F0F]">AI Analysis</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {[{ label: 'Category', value: 'Billing', bg: '#EEF2FF', color: '#4338CA' },
            { label: 'Urgency', value: 'High', bg: '#FEF3C7', color: '#92400E' },
            { label: 'Sentiment', value: 'Negative', bg: '#FEE2E2', color: '#991B1B' }].map(b => (
            <div key={b.label} className="flex flex-col gap-1 px-3 py-2 rounded-lg border border-[#F0EBE4]" style={{ background: '#FAFAF9' }}>
              <span className="text-[10px] font-medium text-[#6B6560]">{b.label}</span>
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: b.bg, color: b.color }}>{b.value}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-[#F0EBE4]">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="font-medium text-[#6B6560]">Confidence Score</span>
            <span className="font-bold text-[#0F0F0F]">87%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E8E2DA' }}>
            <div className="h-full rounded-full w-[87%]" style={{ background: 'linear-gradient(90deg, #7C3AED, #5B21B6)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E2DA] shadow-lg bg-white">
      <div className="px-4 py-3 border-b border-[#F0EBE4]" style={{ background: '#FDFAF7' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#0F0F0F]">Assigned Agent</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50">
          <div className="text-[10px] font-bold text-indigo-700 mb-2 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            AI Suggestion
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[13px] font-semibold text-[#0F0F0F]">Sarah Chen</div>
              <div className="text-[11px] text-[#6B6560]">sarah@support.co</div>
            </div>
            <div className="text-[11px] font-semibold text-white px-3 py-1.5 rounded-lg bg-[#7C3AED]">Accept</div>
          </div>
        </div>
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[#0F0F0F]">Marcus Rodriguez</div>
            <div className="text-[11px] font-medium text-emerald-700">Assigned · AI Suggested</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueMockup() {
  const tickets = [
    { subject: 'Refund not processed', status: 'Open', urgency: 'High', bg: '#FEF3C7', color: '#92400E' },
    { subject: 'Billing cycle question', status: 'In Progress', urgency: 'Medium', bg: '#DBEAFE', color: '#1E40AF' },
    { subject: 'Account access issue', status: 'Open', urgency: 'Critical', bg: '#FEE2E2', color: '#991B1B' },
  ];
  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E2DA] shadow-lg bg-white">
      <div className="px-4 py-3 border-b border-[#F0EBE4] flex items-center justify-between" style={{ background: '#FDFAF7' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#0F0F0F]">My Queue</span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">3 tickets</span>
      </div>
      <div>
        {tickets.map((t, i) => (
          <div key={i} className={`px-4 py-3 flex justify-between items-center ${i < tickets.length - 1 ? 'border-b border-[#F7F3EE]' : ''}`}>
            <div className="flex-1 min-w-0 mr-3">
              <div className="text-[12px] font-semibold text-[#0F0F0F] truncate mb-1">{t.subject}</div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>{t.status}</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: t.bg, color: t.color }}>{t.urgency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Browser Mockup Frame ──────────────────────────────────────────────────────

function BrowserMockup() {
  return (
    <div className="w-full rounded-xl md:rounded-2xl overflow-hidden border border-[#E8E2DA]"
      style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}>
      {/* Chrome bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E8E2DA]" style={{ background: '#F0EBE4' }}>
        <div className="flex gap-1.5">
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 rounded-md px-3 py-1 text-[11px] text-[#6B6560] border border-[#E8E2DA]" style={{ background: '#FDFAF7' }}>
          app.triage.ai/admin/tickets/42
        </div>
      </div>
      {/* UI content — stacks on mobile, side-by-side on md+ */}
      <div className="p-3 sm:p-4 flex flex-col md:grid md:grid-cols-[1fr_280px] gap-3" style={{ background: '#F8F4EF' }}>
        {/* Left col */}
        <div className="flex flex-col gap-3">
          {/* Ticket header */}
          <div className="bg-white border border-[#E8E2DA] rounded-xl p-3 sm:p-4">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="text-[13px] sm:text-[15px] font-bold text-[#0F0F0F] leading-snug">Charged twice for same subscription</div>
              <span className="flex-shrink-0 text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Open</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#6B6560]">
              <span>👤 Alex Johnson</span>
              <span className="hidden sm:inline">✉ alex@company.co</span>
              <span>🕐 May 26, 2026</span>
            </div>
          </div>
          {/* Message */}
          <div className="bg-white border border-[#E8E2DA] rounded-xl p-3 sm:p-4">
            <div className="text-[9px] sm:text-[10px] font-bold text-[#6B6560] tracking-widest uppercase mb-2">Original Message</div>
            <div className="text-[11px] sm:text-[12px] text-[#4A4540] leading-relaxed rounded-lg p-3 border border-[#F0EBE4]" style={{ background: '#FDFAF7' }}>
              Hi, I noticed that I was charged twice this month for my Pro subscription. Please look into this and issue a refund for the duplicate charge?
            </div>
          </div>
          {/* Draft */}
          <div className="rounded-xl p-3 sm:p-4 border border-indigo-200" style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#7C3AED] tracking-widest uppercase">AI Draft Response</span>
            </div>
            <div className="text-[11px] sm:text-[12px] text-indigo-700 leading-relaxed">
              Hi Alex, I can see the duplicate charge and I'm sorry for the inconvenience. I'll initiate a refund within 3–5 business days...
            </div>
          </div>
        </div>
        {/* Right col — hidden on smallest screens, shown sm+ */}
        <div className="hidden sm:flex flex-col gap-3">
          <AIMockup />
          <AgentMockup />
        </div>
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ onLogin, onRegister }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const NAV_LINKS = [
    { label: 'How it works', target: 'how-it-works' },
    { label: 'Features', target: 'features' },
    { label: 'Pricing', target: 'pricing' },
  ];

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-shadow duration-300"
      style={{
        background: '#F7F3EE',
        borderBottom: '1px solid #E8E2DA',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <LogoMark />
          <span className="text-[1.05rem] font-bold tracking-tight text-[#0F0F0F]">Triage</span>
        </div>

        {/* Center nav — desktop only */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map(item => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.target)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#6B6560] hover:text-[#0F0F0F] hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            id="nav-submit-ticket"
            onClick={() => navigate('/submit-ticket')}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#6B6560] hover:text-[#0F0F0F] hover:bg-white hover:border-[#E8E2DA] border border-transparent transition-all cursor-pointer bg-transparent"
          >
            Submit a ticket
          </button>
          <button
            id="nav-sign-in"
            onClick={onLogin}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#6B6560] hover:text-[#0F0F0F] hover:bg-white hover:border-[#E8E2DA] border border-transparent transition-all cursor-pointer bg-transparent"
          >
            Sign in
          </button>
          <button
            id="nav-get-started"
            onClick={onRegister}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer border-none"
            style={{ background: '#7C3AED', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#6D28D9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#7C3AED'; }}
          >
            Get started free
          </button>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden p-2 rounded-lg text-[#6B6560] hover:text-[#0F0F0F] hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E8E2DA] px-4 py-4 flex flex-col gap-1" style={{ background: '#F7F3EE' }}>
          {NAV_LINKS.map(item => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.target)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B6560] hover:text-[#0F0F0F] hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent"
            >
              {item.label}
            </button>
          ))}
          <div className="mt-3 pt-3 border-t border-[#E8E2DA] flex flex-col gap-2">
            <button
              onClick={() => { setMenuOpen(false); navigate('/submit-ticket'); }}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-[#0F0F0F] border border-[#E8E2DA] bg-white transition-colors cursor-pointer"
            >
              Submit a ticket
            </button>
            <button
              onClick={() => { setMenuOpen(false); onLogin(); }}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-[#0F0F0F] border border-[#E8E2DA] bg-white transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={() => { setMenuOpen(false); onRegister(); }}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: '#7C3AED' }}
            >
              Get started free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex justify-center mb-4">
      <span className="text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full border"
        style={{ color: '#7C3AED', background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.2)' }}>
        {children}
      </span>
    </div>
  );
}

// ── Steps data ────────────────────────────────────────────────────────────────

const STEPS = [
  { number: '01', icon: <SubmitIcon />, title: 'Customer submits a ticket', desc: 'A support request comes in via your portal. No manual sorting needed.', color: '#7C3AED', bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.2)' },
  { number: '02', icon: <BrainIcon />,  title: 'AI classifies and routes',   desc: 'Triage analyzes the message, assigns a category, urgency, and confidence score, then suggests the best available agent.', color: '#0EA5E9', bg: 'rgba(14,165,233,0.06)', border: 'rgba(14,165,233,0.2)' },
  { number: '03', icon: <CheckSquareIcon />, title: 'Agent resolves it', desc: 'The assigned agent sees it in their queue, uses the AI draft response, and resolves it faster.', color: '#10B981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
];

// ── Features data ─────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <SparklesIcon />, iconColor: '#7C3AED', iconBg: 'rgba(124,58,237,0.08)', title: 'AI Classification',   desc: "Every incoming ticket is automatically analyzed using Groq's LLaMA model. It extracts category, urgency level, and customer sentiment — in under a second.", mockup: <AIMockup />,    reverse: false },
  { icon: <RouteIcon />,    iconColor: '#0EA5E9', iconBg: 'rgba(14,165,233,0.08)',  title: 'Smart Agent Routing', desc: "Triage matches each ticket to the best available agent based on their specialization and current workload. The AI suggestion appears right in the admin view — one click to confirm.", mockup: <AgentMockup />, reverse: true  },
  { icon: <ZapIcon />,      iconColor: '#10B981', iconBg: 'rgba(16,185,129,0.08)', title: 'Real-time Updates',   desc: "Agents see new assignments land in their queue the moment they happen — no refresh needed. Server-sent events keep every view live, so nothing slips through.", mockup: <QueueMockup />, reverse: false },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const goLogin    = () => navigate('/login');
  const goRegister = () => navigate('/register');

  return (
    <div className="overflow-x-hidden font-sans antialiased" style={{ background: '#F7F3EE', color: '#0F0F0F' }}>

      <Nav onLogin={goLogin} onRegister={goRegister} />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section
          id="hero"
          className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 px-4 sm:px-6"
          style={{ background: 'linear-gradient(180deg, #F7F3EE 0%, #EDE8E2 100%)' }}
        >
          {/* Warm dot grid */}
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.04) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
                style={{ color: '#7C3AED', background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#7C3AED]" />
                Now live — AI-powered ticket routing
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-center font-extrabold tracking-tight leading-[1.1] mb-5 text-[#0F0F0F]"
              style={{ fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}>
              AI-powered support,<br />
              <span style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                routed instantly.
              </span>
            </h1>

            {/* Sub */}
            <p className="text-center max-w-xl mx-auto mb-8 leading-relaxed text-[#6B6560] text-base sm:text-lg">
              Triage classifies every ticket, scores confidence, and assigns the right agent automatically — so nothing falls through the cracks.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <button
                id="hero-get-started"
                onClick={goRegister}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-bold text-white border-none cursor-pointer transition-all"
                style={{ background: '#7C3AED', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6D28D9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.transform = ''; }}
              >
                Get started free <ArrowRightIcon />
              </button>
              <button
                id="hero-how-it-works"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-[15px] font-semibold text-[#0F0F0F] bg-white border border-[#E8E2DA] cursor-pointer transition-all hover:border-[#7C3AED] hover:text-[#7C3AED]"
              >
                See how it works
              </button>
            </div>

            {/* Public ticket link — below CTAs */}
            <p className="text-center text-sm mt-1 mb-10" style={{ color: '#6B6560' }}>
              Need help?{' '}
              <Link
                to="/submit-ticket"
                style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
              >
                Submit a ticket without signing up →
              </Link>
            </p>

            {/* Hero mockup */}
            <BrowserMockup />
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-6" style={{ background: '#F7F3EE' }}>
          <div className="max-w-6xl mx-auto">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-center font-bold tracking-tight text-[#0F0F0F] mb-3"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}>
              From ticket to resolution in three steps
            </h2>
            <p className="text-center text-[#6B6560] max-w-md mx-auto mb-12 text-[15px] leading-relaxed">
              No configuration. No routing rules. Just connect and watch tickets flow to the right people.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#E8E2DA] p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: step.bg, border: `1px solid ${step.border}`, color: step.color }}>
                      {step.icon}
                    </div>
                    <span className="text-sm font-bold" style={{ color: step.color }}>{step.number}</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-[#0F0F0F] mb-2 leading-snug">{step.title}</h3>
                  <p className="text-sm text-[#6B6560] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section id="features" className="py-20 sm:py-24 px-4 sm:px-6" style={{ background: '#EDE8E2' }}>
          <div className="max-w-6xl mx-auto">
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-center font-bold tracking-tight text-[#0F0F0F] mb-3"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}>
              Everything your support team needs
            </h2>
            <p className="text-center text-[#6B6560] max-w-md mx-auto mb-16 text-[15px] leading-relaxed">
              Triage handles the routing so your agents can focus on what they do best — helping customers.
            </p>

            <div className="flex flex-col gap-16 sm:gap-20">
              {FEATURES.map((feat, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center`}
                >
                  {/* Text block — always first on mobile, alternates on desktop */}
                  <div className={feat.reverse ? 'md:order-2' : 'md:order-1'}>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: feat.iconBg, border: `1px solid ${feat.iconBg.replace('0.08', '0.25')}`, color: feat.iconColor }}
                    >
                      {feat.icon}
                    </div>
                    <h3 className="text-[1.3rem] sm:text-[1.5rem] font-bold text-[#0F0F0F] mb-3 leading-snug tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-[15px] text-[#6B6560] leading-relaxed mb-5">
                      {feat.desc}
                    </p>
                    <a
                      href="#"
                      onClick={e => e.preventDefault()}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-3"
                      style={{ color: feat.iconColor, textDecoration: 'none' }}
                    >
                      Learn more <ChevronRightIcon />
                    </a>
                  </div>
                  {/* Mockup */}
                  <div className={feat.reverse ? 'md:order-1' : 'md:order-2'}>
                    {feat.mockup}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing anchor */}
        <div id="pricing" />

        {/* ── Bottom CTA ────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24 px-4 sm:px-6" style={{ background: '#F7F3EE' }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-extrabold tracking-tight text-[#0F0F0F] mb-4 leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>
              Start routing smarter today
            </h2>
            <p className="text-[#6B6560] mb-10 text-[17px] leading-relaxed">
              Set up in minutes. No credit card required.
            </p>
            <button
              id="cta-get-started"
              onClick={goRegister}
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-xl text-[16px] font-bold text-white border-none cursor-pointer transition-all"
              style={{ background: '#7C3AED', boxShadow: '0 4px 24px rgba(124,58,237,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#6D28D9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(124,58,237,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.35)'; }}
            >
              Get started free <ArrowRightIcon />
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="px-4 sm:px-6 py-12 border-t border-[#E8E2DA]" style={{ background: '#F7F3EE' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 items-start">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <LogoMark />
              <span className="text-[1rem] font-bold text-[#0F0F0F]">Triage</span>
            </div>
            <p className="text-[13px] text-[#6B6560] leading-relaxed">AI-powered support routing</p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] font-bold text-[#0F0F0F] tracking-widest uppercase mb-3">Product</p>
            <div className="flex flex-col gap-2.5">
              {['How it works', 'Features'].map(label => (
                <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-[#6B6560] hover:text-[#0F0F0F] no-underline transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-[11px] font-bold text-[#0F0F0F] tracking-widest uppercase mb-3">Company</p>
            <div className="flex flex-col gap-2.5">
              <a href="https://github.com/nisarg-gandhi/triage-app" target="_blank" rel="noopener noreferrer"
                className="text-sm text-[#6B6560] hover:text-[#0F0F0F] no-underline transition-colors flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex sm:justify-end items-start">
            <p className="text-[13px] text-[#9E9590]">© 2026 Triage</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
