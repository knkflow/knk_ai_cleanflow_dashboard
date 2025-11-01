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
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Login failed');

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (profile?.role === 'Host') {
          navigate('/host');
        } else {
          navigate('/cleaner');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

return (
  <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="text-center px-6 pt-8 pb-6">
        <img
          src="/brand/logo.jpg"
          alt="KNK-AI"
          className="h-12 w-auto mx-auto mb-4"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {isSignUp ? 'Konto erstellen' : 'Willkommen zurück'}
        </h1>
        <p className="text-white/70">
          {isSignUp ? 'Registrieren und loslegen' : 'Melden Sie sich an, um fortzufahren'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-8">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/90">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/15 placeholder-white/40 text-white/90
                       focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
            placeholder="name@beispiel.de"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-white/90">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/15 placeholder-white/40 text-white/90
                       focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2 text-white/90">
              Ich bin
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'Host' | 'Cleaner')}
              className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/15 text-white/90
                         focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
            >
              <option value="Host" className="bg-black">Gastgeber</option>
              <option value="Cleaner" className="bg-black">Reinigungskraft</option>
            </select>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 text-sm rounded-2xl">
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
          {loading ? 'Bitte warten …' : isSignUp ? 'Registrieren' : 'Anmelden'}
        </button>
      </form>

      <div className="px-6 pb-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-white/70 hover:text-white transition-colors text-sm"
        >
          {isSignUp ? 'Schon ein Konto? Anmelden' : 'Noch kein Konto? Registrieren'}
        </button>
      </div>

      <div className="px-6 pb-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-white/50 hover:text-white/70 transition-colors text-sm"
        >
          ← Zurück zur Startseite
        </button>
      </div>
    </div>
  </div>
);

}
