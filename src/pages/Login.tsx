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

        navigate(profile?.role === 'Host' ? '/host' : '/cleaner');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 text-white"
      // Bild liegt in /public, deshalb absoluter Pfad:
      style={{
        backgroundImage: "url('/login_bg.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* dunkles Overlay für bessere Lesbarkeit */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Inhalt */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="text-center px-6 pt-8 pb-6">
          <img
            src="/brand/logo.jpg"
            alt="KNK-AI"
            className="h-12 w-auto mx-auto mb-4"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Willkommen zurück</h1>
          <p className="text-white/80">Melden Sie sich an, um fortzufahren</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-8">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/90">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 placeholder-white/50 text-white
                         focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              placeholder="name@beispiel.de"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-white/90">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 placeholder-white/50 text-white
                         focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 text-sm rounded-2xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-full bg-white text-black hover:bg-white/90
                       disabled:bg-white/50 disabled:cursor-not-allowed transition-colors font-medium
                       flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Bitte warten …' : 'Anmelden'}
          </button>
        </form>

        <div className="px-6 pb-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            ← Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
