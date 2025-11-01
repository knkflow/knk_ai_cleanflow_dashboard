import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, MessageSquare, CalendarDays, ShieldCheck, Eye, EyeOff, Shield, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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
      if (!user) throw new Error('Login fehlgeschlagen');

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
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* --- VIBRANT BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 bg-[#070815]" />
      <div className="pointer-events-none absolute -top-48 -left-48 h-[60rem] w-[60rem] rounded-full blur-3xl opacity-50" style={{
        background: 'radial-gradient(40% 40% at 50% 50%, #10B981 0%, rgba(16,185,129,0.0) 60%)'
      }} />
      <div className="pointer-events-none absolute -bottom-64 -right-80 h-[60rem] w-[60rem] rounded-full blur-3xl opacity-40" style={{
        background: 'radial-gradient(40% 40% at 50% 50%, #8B5CF6 0%, rgba(139,92,246,0.0) 60%)'
      }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{
        backgroundImage: 'conic-gradient(from 90deg at 50% 50%, #00E5FF, #10B981, #F97316, #FF3D71, #8B5CF6, #00E5FF)'
      }} />

      {/* --- GRID OVERLAY --- */}
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Topbar */}
      <header className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CleanFlow Logo" className="h-9 w-auto object-contain drop-shadow" />
            <span className="text-sm md:text-base tracking-[0.25em] uppercase font-semibold text-white/90">CleanFlow</span>
          </div>
          <Link to="/" className="text-sm text-white/70 hover:text-white transition-colors">← Zurück zur Startseite</Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative container mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left: Value/Brand */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-fuchsia-400 to-indigo-400">Klar. Mutig. Markant.</span>
            </h1>
            <p className="mt-4 text-white/70 max-w-xl">
              Melden Sie sich an und steuern Sie Ihre Reinigungen mit Ruhe und Übersicht:
              WhatsApp-Benachrichtigungen, zentrale Auftragsverwaltung und Kalender mit Abwesenheiten.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-2xl">
              {[{
                icon: MessageSquare,
                title: 'WhatsApp an Teams',
                text: 'Aufträge, Updates und Erinnerungen automatisch oder manuell senden – nachvollziehbar und zentral dokumentiert.'
              }, {
                icon: CalendarDays,
                title: 'Kalender & Abwesenheiten',
                text: 'Urlaube und Kranktage im Blick behalten, Konflikte früh erkennen – Planung verlässlich halten.'
              }, {
                icon: ShieldCheck,
                title: 'DSGVO & Sicherheit',
                text: 'EU-Server, Verschlüsselung, rollenbasierte Zugriffe. Vertrauen ist Standard.'
              }, {
                icon: LogIn,
                title: 'Schnellstart',
                text: 'In wenigen Schritten anmelden und loslegen – klar, ruhig, ohne Ablenkung.'
              }].map(({ icon: Icon, title, text }) => (
                <div key={title} className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
                  <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-medium">
                    <Icon className="w-4 h-4" />
                    {title}
                  </div>
                  <p className="mt-2 text-white/70 text-sm">{text}</p>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent hover:ring-emerald-400/40 transition" />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/70">
              <span className="border border-white/10 bg-white/5 rounded-full px-3 py-1">EU-Server</span>
              <span className="border border-white/10 bg-white/5 rounded-full px-3 py-1">SLA 99.9%</span>
              <span className="border border-white/10 bg-white/5 rounded-full px-3 py-1">RBAC</span>
              <span className="border border-white/10 bg-white/5 rounded-full px-3 py-1">Audit-Logs</span>
            </div>
          </motion.section>

          {/* Right: Auth card (Login) */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="w-full max-w-md lg:ml-auto mx-auto"
          >
            <div className="relative rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
              {/* Glow ring */}
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/40 via-fuchsia-500/40 to-indigo-500/40 blur-[2px]" aria-hidden />

              <div className="relative px-6 pt-7 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-300" />
                  <h2 className="text-xl font-bold">Willkommen zurück</h2>
                </div>
                <p className="mt-1 text-sm text-white/70">Melden Sie sich an, um fortzufahren.</p>
              </div>

              <form onSubmit={handleSubmit} className="relative space-y-4 px-6 pt-5 pb-7">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-white/80">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 placeholder-white/40 text-white
                               focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-400/60 transition"
                    placeholder="name@beispiel.de"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-white/80">
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
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/15 placeholder-white/40 text-white
                                 focus:outline-none focus:ring-4 focus:ring-fuchsia-400/30 focus:border-fuchsia-400/60 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="relative rounded-xl p-[1px] bg-gradient-to-r from-rose-500 to-amber-500">
                    <div className="rounded-xl bg-[#0b0f1a] p-3 text-sm text-rose-200">
                      {error}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full px-4 py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2
                             disabled:opacity-60 disabled:cursor-not-allowed transition-transform active:scale-[0.99]"
                >
                  <span className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-500 via-fuchsia-500 to-indigo-500 blur-[6px] opacity-70 group-hover:opacity-90 transition" aria-hidden />
                  <span className="relative z-10 inline-flex items-center gap-2 bg-[#0b0f1a]/70 border border-white/10 px-4 py-2.5 rounded-xl">
                    {loading ? <Zap className="w-5 h-5 animate-pulse" /> : <LogIn className="w-5 h-5" />}
                    {loading ? 'Bitte warten …' : 'Anmelden'}
                  </span>
                </button>

                <div className="text-center">
                  <span className="text-sm text-white/70">Passwort vergessen? </span>
                  <a
                    href="mailto:knk.flow@web.de?subject=Passwort%20Reset"
                    className="text-sm text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline"
                  >
                    Support kontaktieren
                  </a>
                </div>
              </form>

              <div className="px-6 pb-6 text-center text-xs text-white/60">
                Mit der Anmeldung akzeptieren Sie unsere{' '}
                <Link to="/agb" className="underline hover:text-white">AGB</Link> und{' '}
                <Link to="/datenschutz" className="underline hover:text-white">Datenschutz</Link>.
              </div>
            </div>

            {/* Subtle bottom CTA / badges */}
            <div className="mt-6 flex items-center justify-center gap-3 text-xs text-white/60">
              <Sparkles className="w-4 h-4" />
              <span>Verschlüsselte Anmeldung • RBAC • Audit-Logs</span>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
