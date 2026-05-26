import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

// ── Triage star logo mark (matches Nav on LandingPage) ───────────────────────
function TriageLogo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-8 select-none">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg
        bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 1L9 5.5H13L9.5 8.5L11 13L7 10.5L3 13L4.5 8.5L1 5.5H5L7 1Z"
            fill="white" fillOpacity="0.95" />
        </svg>
      </span>
      <span className="text-[1.15rem] font-semibold tracking-tight text-white">Triage</span>
    </div>
  );
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
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

  return (
    <div className="auth-page min-h-screen bg-[#0d0f14] flex items-center justify-center px-4 font-sans antialiased">

      {/* ── Ambient background glows (same as landing page) ─────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full
          bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full
          bg-violet-600/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full
          bg-indigo-900/20 blur-[120px]" />
      </div>

      {/* ── Auth card ────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl
          bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04]
          backdrop-blur-xl shadow-2xl shadow-black/40 px-8 py-10 sm:px-10">

          {/* Wordmark */}
          <TriageLogo />

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20
              bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm
                    bg-white/[0.05] border border-white/[0.08]
                    text-white placeholder-slate-500
                    focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40
                    transition-colors duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm
                    bg-white/[0.05] border border-white/[0.08]
                    text-white placeholder-slate-500
                    focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40
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
                  bg-indigo-600 hover:bg-indigo-500
                  shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
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

          {/* Footer link */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-slate-300 hover:text-white transition-colors duration-150 font-medium"
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
