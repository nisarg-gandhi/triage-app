import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

// ── Logo mark ────────────────────────────────────────────────────────────────
function TriageLogo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-8 select-none">
      <img src="/icon.svg" alt="Triage" className="w-8 h-8" />
      <span className="text-[1.15rem] font-semibold tracking-tight text-[#0F0F0F]">Triage</span>
    </div>
  );
}

// ── Google "G" logo (official brand colours, inlined SVG — no network request) ─
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      if (userData.role === 'admin' || userData.role === 'agent') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsGoogleLoading(true);
      try {
        const userData = await loginWithGoogle(tokenResponse.access_token);
        if (userData.role === 'admin' || userData.role === 'agent') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Please try again.');
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    },
  });

  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 font-sans antialiased"
      style={{ backgroundColor: '#F7F3EE' }}>

      <div className="w-full max-w-md">
        <div className="bg-white border border-[#E8E2DA] shadow-sm rounded-2xl px-8 py-10 sm:px-10">

          <TriageLogo />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F0F0F]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-[#6B6560]">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200
              bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-[#6B6560] mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#6B6560]" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm
                    bg-white border border-[#E8E2DA]
                    text-[#0F0F0F] placeholder-[#6B6560]
                    focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30
                    transition-colors duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-[#6B6560] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#6B6560]" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm
                    bg-white border border-[#E8E2DA]
                    text-[#0F0F0F] placeholder-[#6B6560]
                    focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30
                    transition-colors duration-150"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white
                  bg-[#7C3AED] hover:bg-[#6D28D9]
                  shadow-md shadow-[#7C3AED]/20 hover:shadow-[#7C3AED]/30
                  transition-all duration-200 hover:-translate-y-0.5
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                  cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* ── Divider ──────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E8E2DA]" />
            <span className="text-[#6B6560] text-sm">or</span>
            <div className="flex-1 h-px bg-[#E8E2DA]" />
          </div>

          {/* ── Google Sign-In (custom button — matches the card's design system) ── */}
          <button
            id="google-login-btn"
            type="button"
            onClick={() => googleLogin()}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl
              text-sm font-medium text-[#0F0F0F] bg-white
              border border-[#E8E2DA] shadow-sm
              hover:bg-[#F7F3EE] hover:border-[#CFC8BF]
              active:bg-[#EDE7DF]
              transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
              cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#6B6560]/30 border-t-[#6B6560] rounded-full animate-spin shrink-0" />
                <span>Signing in with Google…</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Footer link */}
          <p className="mt-7 text-center text-sm text-[#6B6560]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-[#7C3AED] hover:text-[#6D28D9] transition-colors duration-150 font-medium"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
