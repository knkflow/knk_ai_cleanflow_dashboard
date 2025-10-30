import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

export function Landing() {
  const navigate = useNavigate();

  // Refs für Smooth Scroll
  const cleanflowRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  // Kontakt-Modal State
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleLearnMore = () =>
    cleanflowRef.current?.scrollIntoView({ behavior: 'smooth' });
  const handleGoToSolutions = () =>
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });

  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const to = 'knk.flow@web.de';
    const subject = `Kontaktanfrage von ${contactName || 'CleanFlow Website'}`;
    const bodyLines = [
      contactName ? `Name: ${contactName}` : '',
      contactEmail ? `E-Mail: ${contactEmail}` : '',
      '',
      'Nachricht:',
      contactMessage || '',
    ].filter(Boolean);
    const body = bodyLines.join('\n');
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setIsContactOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-40 bg-black/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="container mx-auto px-6 lg:px-8 py-5 flex items-center justify-between relative">
          {/* Linke Seite – CleanFlow Text */}
          <span className="text-sm md:text-base tracking-widest uppercase text-white font-semibold">
            CleanFlow
          </span>

{/* Mittig – Logo */}
<div className="absolute left-1/2 -translate-x-1/2">
  <img
    src="/brand/logo.png"
    alt="CleanFlow Logo"
    className="h-12 md:h-14 w-auto object-contain select-none
               rounded-full border-2 border-white/70 shadow-[0_0_10px_rgba(255,255,255,0.25)]
               transition-all duration-500 ease-out
               hover:shadow-[0_0_25px_rgba(255,255,255,0.55)] hover:border-white"
    onError={(e) => (e.currentTarget.style.display = 'none')}
  />
</div>

          {/* Navigation rechts */}
          <nav className="flex items-center gap-6 md:gap-8">
            <button
              onClick={handleGoToSolutions}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Lösungen
            </button>
            <button
              onClick={openContact}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Kontakt
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
            >
              Login
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          {/* Präsentierende Stage-Fläche */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[560px] w-[880px] rounded-[36px] bg-[rgba(255,255,255,0.07)] blur-[70px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-8 py-28 md:py-36 text-center">
            {/* Unterzeile mit ovaler Fassung + Glow */}
            <div
              className="relative inline-flex items-center justify-center px-6 py-2 rounded-full
                         border border-white/25 bg-white/[0.06] backdrop-blur-[2px]
                         shadow-[0_4px_20px_rgba(255,255,255,0.1),inset_0_0_12px_rgba(255,255,255,0.08)]
                         before:content-[''] before:absolute before:inset-0 before:rounded-full before:border before:border-white/40 before:opacity-30
                         hover:shadow-[0_6px_30px_rgba(255,255,255,0.18),inset_0_0_15px_rgba(255,255,255,0.1)]
                         transition-all duration-500 ease-out"
            >
             {/* feiner Glow-Hintergrund */}
  <span
    aria-hidden
    className="absolute -inset-x-6 -inset-y-3 rounded-full 
               bg-[radial-gradient(80%_80%_at_50%_50%,rgba(255,255,255,0.6),transparent_80%)]
               blur-[24px] opacity-70"
  />

  {/* Text */}
  <p className="relative text-[11px] md:text-xs tracking-[0.35em] uppercase text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">
    Short-Term Rental · Operations
  </p>
</div>

            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <span className="text-white">Effortless</span>{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 via-white to-neutral-200">
                Cleaning Coordination
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              Manage apartments, coordinate cleaners, and schedule tasks with precision. Built for hosts who demand efficiency.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-sm md:text-base font-semibold bg-white text-black hover:bg-white/90 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={handleLearnMore}
                className="px-8 py-3 text-sm md:text-base font-semibold border border-white/20 text-white hover:border-white/40 transition-colors"
              >
                Learn More
              </button>
            </div>

            <div className="mt-16 h-px w-32 mx-auto bg-white/10" />
          </div>
        </section>

        {/* SECTION – Was ist CleanFlow? */}
        <section ref={cleanflowRef} className="py-24 bg-white text-black">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-black">
                Was ist <span className="text-black">CleanFlow</span>
              </h2>
              <div className="w-24 h-[2px] bg-gradient-to-r from-black via-neutral-800 to-black mx-auto mt-6 mb-6 rounded-full" />
              <p className="text-black max-w-3xl mx-auto text-lg leading-relaxed">
                CleanFlow ist die moderne Softwarelösung für professionelles Reinigungsmanagement.
                Koordinieren Sie Ihr Team effizient, zentral und in Echtzeit – alles an einem Ort.
              </p>
            </div>

            {/* Drei Kerneigenschaften */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                {
                  emoji: '💬',
                  title: 'WhatsApp Integration',
                  text:
                    'Kommunizieren Sie direkt mit Ihren Reinigungskräften über WhatsApp. Senden Sie Aufträge, erhalten Sie Updates – in Echtzeit.',
                },
                {
                  emoji: '🗓️',
                  title: 'Intelligente Planung',
                  text:
                    'Automatische oder manuelle Planung. CleanFlow optimiert Routen, Zeiten und Ressourcen für maximale Effizienz.',
                },
                {
                  emoji: '👥',
                  title: 'Team-Management',
                  text:
                    'Zentrale Übersicht, klare Zuständigkeiten, Fortschritt im Blick. Qualitätssicherung inklusive.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative rounded-3xl bg-white border-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:bg-neutral-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  <div className="relative p-8">
                    <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-black mb-4">
                      <span className="text-base">{item.emoji}</span>
                      <span>Feature</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-black mb-2">{item.title}</h3>
                    <p className="text-black leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION – Funktionen, die überzeugen */}
        <section ref={featuresRef} className="py-24 border-t border-white/10">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                  Funktionen, die überzeugen
                </span>
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 mx-auto mt-6 mb-6 opacity-80" />
              <p className="text-white/70 max-w-3xl mx-auto">
                Alles, was Sie für professionelles Reinigungsmanagement brauchen.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  emoji: '✅',
                  title: 'Personalisierte Kommunikation',
                  text:
                    'WhatsApp, SMS, E-Mail oder In-App: für jede Reinigungskraft der passende Kanal – klar und nachvollziehbar.',
                },
                {
                  emoji: '🕒',
                  title: 'Echtzeit-Updates',
                  text:
                    'Benachrichtigungen bei Start, Abschluss oder Verzögerung – Sie behalten stets die Kontrolle.',
                },
                {
                  emoji: '🛡️',
                  title: 'Sichere Daten',
                  text:
                    'Verschlüsselt und DSGVO-konform. Privatsphäre und Integrität stehen an erster Stelle.',
                },
                {
                  emoji: '📊',
                  title: 'Automatische Berichte',
                  text:
                    'Detaillierte Reports zu Reinigungen, Zeiten und Kosten – fundierte Entscheidungen auf einen Blick.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 hover:border-amber-400/30 transition-colors"
                >
                  <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-amber-300/90 mb-4">
                    <span className="text-base">{item.emoji}</span>
                    <span>Highlight</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-white/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 border-t border-white/10">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 via-white to-neutral-100">
                Ready to optimize your operations?
              </span>
            </h3>
            <p className="mt-4 text-white/70">
              Join hosts who trust CleanFlow to keep their properties pristine.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-sm md:text-base font-semibold bg-white text-black hover:bg-white/90 transition-colors"
              >
                Start Now
              </button>
              <button
                onClick={openContact}
                className="px-8 py-3 text-sm md:text-base font-semibold border border-white/20 text-white hover:border-white/40 transition-colors"
              >
                Talk to Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} CleanFlow. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <button className="text-white/50 hover:text-white transition-colors">Datenschutz</button>
            <button className="text-white/50 hover:text-white transition-colors">Impressum</button>
            <button className="text-white/50 hover:text-white transition-colors">AGB</button>
          </div>
        </div>
      </footer>

      {/* Kontakt-Modal */}
      {isContactOpen && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeContact}
          />
          {/* Dialog */}
          <div className="relative w-full max-w-2xl bg-black text-white border border-white/10 shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-xl font-semibold">Kontakt</h4>
              <button
                onClick={closeContact}
                className="text-white/60 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Kontaktinfo */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-widest text-white/60">E-Mail</p>
                  <a
                    href="mailto:knk.flow@web.de"
                    className="text-white hover:underline break-all"
                  >
                    knk.flow@web.de
                  </a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-white/60">Telefon</p>
                  <a
                    href="tel:+4917660733953"
                    className="text-white hover:underline"
                  >
                    +49 176 60733953
                  </a>
                </div>

                <div className="h-px bg-white/10 my-2" />
                <p className="text-white/70 text-sm">
                  Schreiben Sie uns eine Nachricht – wir melden uns zeitnah.
                </p>
              </div>

              {/* Nachricht senden */}
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Ihr Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    placeholder="Max Mustermann"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Ihre E-Mail</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    placeholder="max@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Nachricht</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    placeholder="Worum geht es?"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeContact}
                    className="px-4 py-2 border border-white/15 text-white hover:border-white/40 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                  >
                    Nachricht senden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
