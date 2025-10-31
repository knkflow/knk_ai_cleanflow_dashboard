import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Host' | 'Cleaner'>('Host');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not created');

        const { error: profileError } = await supabase
          .from('users')
          .update({ role })
          .eq('auth_id', user.id);
        if (profileError) throw profileError;

        navigate(role === 'Host' ? '/host' : '/cleaner');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Login failed');

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (profile?.role === 'Host') navigate('/host');
        else navigate('/cleaner');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-black to-[#0a0a0a] opacity-90" />
      <div className="w-full max-w-md relative z-10 px-6 py-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl">
        
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img
            src="/brand/logo.jpg"
            alt="KNK-AI"
            className="h-14 w-auto mx-auto mb-5 drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            {isSignUp ? 'Sign up to get started' : 'Login to continue'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-white/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/60 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-white/80">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/60 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="role" className="block text-sm mb-2 text-white/80">
                I am a
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Host' | 'Cleaner')}
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/60 outline-none"
              >
                <option value="Host">Host</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
          )}

          {error && (
            <div className="text-red-400 border border-red-500/30 bg-red-500/10 px-4 py-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-md bg-white text-black font-semibold tracking-wide 
                       hover:bg-[#d4af37] hover:text-black transition-all duration-300 
                       flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>

        {/* Toggle SignUp / Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#d4af37] hover:text-[#f5d97b] text-sm transition-all"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
