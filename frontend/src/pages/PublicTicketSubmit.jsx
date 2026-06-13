import { useState } from 'react';
import { Link } from 'react-router-dom';
import ticketService from '../services/ticketService';

// ── Icons ─────────────────────────────────────────────────────────────────────

const CheckCircleIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'spin 0.75s linear infinite' }}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ── Logo ──────────────────────────────────────────────────────────────────────

function TriageLogo() {
  return (
    <Link
      to="/"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="flex items-center justify-center gap-2.5 mb-8 select-none">
        <img src="/icon.svg" alt="Triage" className="w-8 h-8" />
        <span style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#0F0F0F' }}>
          Triage
        </span>
      </div>
    </Link>
  );
}

// ── Styled inputs ─────────────────────────────────────────────────────────────

function StyledInput({ id, type = 'text', value, onChange, placeholder, required, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#0F0F0F',
        background: '#FDFAF7',
        border: `1px solid ${focused ? '#7C3AED' : '#E8E2DA'}`,
        borderRadius: '10px',
        outline: 'none',
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit',
      }}
    />
  );
}

function StyledTextarea({ id, value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={5}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#0F0F0F',
        background: '#FDFAF7',
        border: `1px solid ${focused ? '#7C3AED' : '#E8E2DA'}`,
        borderRadius: '10px',
        outline: 'none',
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        resize: 'vertical',
        minHeight: '120px',
        fontFamily: 'inherit',
      }}
    />
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={htmlFor}
        style={{ fontSize: '14px', fontWeight: 500, color: '#0F0F0F' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Success card ──────────────────────────────────────────────────────────────

function SuccessCard({ ticketId, email, onReset }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '16px 0' }}>
      {/* Icon */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(16,185,129,0.1)', color: '#10B981',
      }}>
        <CheckCircleIcon />
      </div>

      {/* Text */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0F0F0F', marginBottom: '8px' }}>
          Ticket submitted successfully
        </h2>
        <p style={{ fontSize: '14px', color: '#6B6560', lineHeight: 1.6, maxWidth: '300px', margin: '0 auto' }}>
          Your ticket ID is{' '}
          <strong style={{ color: '#0F0F0F' }}>#{ticketId}</strong>.{' '}
          We'll get back to you at{' '}
          <strong style={{ color: '#0F0F0F' }}>{email}</strong> soon.
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', borderTop: '1px solid #E8E2DA' }} />

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          fontSize: '14px', fontWeight: 500, color: '#7C3AED',
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#5B21B6'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#7C3AED'; }}
      >
        Submit another ticket →
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicTicketSubmit() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { ticketId, email }

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await ticketService.submitPublicTicket(form);
      setSuccess({ ticketId: result.ticket_id, email: form.email });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setError('');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#F7F3EE',
        color: '#0F0F0F',
        position: 'relative',
      }}>
        {/* Dot grid background */}
        <div aria-hidden style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.04) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
          {/* Card */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px 40px',
            border: '1px solid #E8E2DA',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}>
            <TriageLogo />

            {success ? (
              <SuccessCard ticketId={success.ticketId} email={success.email} onReset={handleReset} />
            ) : (
              <>
                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: '#0F0F0F', margin: 0 }}>
                    Submit a support ticket
                  </h1>
                  <p style={{ fontSize: '14px', color: '#6B6560', marginTop: '6px', marginBottom: 0 }}>
                    No account needed. We'll follow up by email.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Field label="Name" htmlFor="pub-name">
                    <StyledInput
                      id="pub-name"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Your name"
                      required
                      autoComplete="name"
                    />
                  </Field>

                  <Field label="Email" htmlFor="pub-email">
                    <StyledInput
                      id="pub-email"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Subject" htmlFor="pub-subject">
                    <StyledInput
                      id="pub-subject"
                      value={form.subject}
                      onChange={set('subject')}
                      placeholder="Brief summary of your issue"
                      required
                    />
                  </Field>

                  <Field label="Message" htmlFor="pub-message">
                    <StyledTextarea
                      id="pub-message"
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Describe your issue in detail…"
                      required
                    />
                  </Field>

                  {/* Error banner */}
                  {error && (
                    <div
                      role="alert"
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px 14px', borderRadius: '10px',
                        background: '#FEF2F2', color: '#991B1B',
                        border: '1px solid #FECACA', fontSize: '14px',
                      }}
                    >
                      <span style={{ marginTop: '1px', flexShrink: 0 }}><AlertCircleIcon /></span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    id="pub-submit"
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      fontSize: '14px', fontWeight: 600, color: '#fff',
                      background: '#7C3AED',
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.72 : 1,
                      boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                      transition: 'background 0.15s, transform 0.1s',
                    }}
                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#6D28D9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#7C3AED'; }}
                  >
                    {submitting ? <><SpinnerIcon /> Submitting…</> : 'Submit Ticket'}
                  </button>
                </form>

                {/* Sign-in link */}
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B6560', marginTop: '24px', marginBottom: 0 }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{ color: '#7C3AED', fontWeight: 500, textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
