// src/routes/auth/SetPassword.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type ViewState = 'checking' | 'need_password' | 'updating' | 'done' | 'error';

// Wohin nach dem Setzen des Passworts?
const AFTER_SUCCESS_PATH = '/menu'; // <-- bei Bedarf anpassen

// Minimal-Check (kannst du schärfer machen)
function validatePassword(pw: string) {
  if (pw.length < 8) return 'Passwort muss mindestens 8 Zeichen haben.';
  return '';
}

// Extrahiert Tokens aus dem URL-Hash (#access_token=...&refresh_token=...)
function parseHashTokens(hash: string) {
  const res: Record<string, string> = {};
  if (!hash) return res;
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  for (const part of clean.split('&')) {
    const [k, v] = part.split('=');
    if (k && v) res[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return res;
}

export default function SetPassword() {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ViewState>('checking');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  // 1) Magic-Link verifizieren und Session herstellen
  useEffect(() => {
    (async () => {
      try {
        // Neuer Flow: ?code=... (&type=signup|magiclink|recovery|invite)
        const code = search.get('code');
        const type = search.get('type') ?? undefined;

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!data?.session) throw new Error('Keine Session nach Code-Exchange.');
          setStatus('need_password');
          return;
        }

        // Alter Flow: Tokens im Hash (z.B. #access_token=...&refresh_token=...&type=...)
        const hashTokens = parseHashTokens(window.location.hash || '');
        if (hashTokens.access_token && hashTokens.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: hashTokens.access_token,
            refresh_token: hashTokens.refresh_token,
          });
          if (error) throw error;
          setStatus('need_password');
          return;
        }

        // Fallback: evtl. ist schon eine Session aktiv
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
          setStatus('need_password');
        } else {
          throw new Error('Kein gültiger Login-Link oder Session abgelaufen.');
        }
      } catch (err: any) {
        setErrorMsg(err?.message ?? 'Verifizierung fehlgeschlagen.');
        setStatus('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (status !== 'need_password') return;

    const msg = validatePassword(pw) || (pw !== pw2 ? 'Passwörter stimmen nicht überein.' : '');
    if (msg) {
      setErrorMsg(msg);
      return;
    }

    try {
      setStatus('updating');
      setErrorMsg('');

      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;

      setStatus('done');
      // Leite ins Menü
      navigate(AFTER_SUCCESS_PATH, { replace: true });
    } catch (err: any) {
      setStatus('need_password');
      setErrorMsg(err?.message ?? 'Konnte Passwort nicht setzen.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-2">Willkommen!</h1>
        <p className="text-white/70 mb-6">Setze dein Passwort für den ersten Login.</p>

        {status === 'checking' && (
          <div className="text-white/80">Link wird verifiziert…</div>
        )}

        {status === 'error' && (
          <div className="text-red-400 border border-red-500/40 bg-red-500/10 p-3 rounded mb-4">
            {errorMsg || 'Verifizierung fehlgeschlagen.'}
          </div>
        )}

        {(status === 'need_password' || status === 'updating') && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            {errorMsg && (
              <div className="text-red-400 border border-red-500/40 bg-red-500/10 p-3 rounded">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm text-white/80 mb-1">Neues Passwort</label>
              <input
                type="password"
                className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-white/50 mt-1">
                Mindestens 8 Zeichen, gerne mit Zahl &amp; Sonderzeichen.
              </p>
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Passwort wiederholen</label>
              <input
                type="password"
                className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'updating'}
              className="w-full px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-white/90 disabled:opacity-60"
            >
              {status === 'updating' ? 'Speichere…' : 'Passwort setzen & starten'}
            </button>
          </form>
        )}

        {status === 'done' && (
          <div className="text-emerald-300">Fertig – Weiterleitung…</div>
        )}
      </div>
    </main>
  );
}
