import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, MessageSquare, CalendarDays, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login failed');

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (profile?.role === 'Host') {
        navigate('/host', { replace: true });
      } else {
        navigate('/cleaner', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Es ist ein Fehler aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Topbar */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CleanFlow Logo" className="h-10 w-auto object-contain" />
            <span className="text-sm md:text-base tracking-[0.25em] uppercase font-semibold">CleanFlow</span>
          </div>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">← Zurück zur Startseite</Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left: Value/Brand */}
          <div className="hidden lg:block">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Klar. Freundlich. Effizient.
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl">
              Melden Sie sich an und steuern Sie Ihre Reinigungen mit Ruhe und Übersicht:
              WhatsApp-Benachrichtigungen, zentrale Auftragsverwaltung und Kalender mit Abwesenheiten.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-6 max-w-2xl">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp an Teams
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  Aufträge, Updates und Erinnerungen automatisch oder manuell senden – nachvollziehbar und zentral dokumentiert.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CalendarDays className="w-4 h-4" />
                  Kalender & Abwesenheiten
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  Urlaube und Kranktage im Blick behalten, Konflikte früh erkennen – Planung verlässlich halten.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  DSGVO & Sicherheit
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  EU-Server, Verschlüsselung, rollenbasierte Zugriffe. Vertrauen ist Standard.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <LogIn className="w-4 h-4" />
                  Schnellstart
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  In wenigen Schritten anmelden und loslegen – klar, ruhig, ohne Ablenkung.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="border border-gray-200 rounded-full px-3 py-1">EU-Server</span>
              <span className="border border-gray-200 rounded-full px-3 py-1">SLA 99.9%</span>
              <span className="border border-gray-200 rounded-full px-3 py-1">RBAC</span>
              <span className="border border-gray-200 rounded-full px-3 py-1">Audit-Logs</span>
            </div>
          </div>

          {/* Right: Auth card (Login only) */}
          <div className="w-full max-w-md lg:ml-auto mx-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="px-6 pt-7 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Willkommen zurück</h2>
              <p className="mt-1 text-sm text-gray-600">Melden Sie sich an, um fortzufahren.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 pt-5 pb-7">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700">
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="name@beispiel.de"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-gray-700">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900
                               focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600
                           disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors font-medium
                           inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {loading ? 'Bitte warten …' : 'Anmelden'}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Passwort vergessen? </span>
                <a
                  href="mailto:knk.flow@web.de?subject=Passwort%20Reset"
                  className="text-sm text-emerald-700 hover:text-emerald-800"
                >
                  Support kontaktieren
                </a>
              </div>
            </form>

            <div className="px-6 pb-6 text-center text-xs text-gray-500">
              Mit der Anmeldung akzeptieren Sie unsere{' '}
              <Link to="/agb" className="underline hover:text-gray-700">AGB</Link> und{' '}
              <Link to="/datenschutz" className="underline hover:text-gray-700">Datenschutz</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
