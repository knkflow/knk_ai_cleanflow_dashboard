import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Users } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/brand/logo.png"
              alt="KNK-AI"
              className="h-28 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xl font-semibold">Cleanflow</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium"
          >
            Login
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero */}
        <section className="py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Streamline Your Short-Term Rental Cleaning
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
            Manage apartments, coordinate cleaners, and schedule tasks with precision.
            Built for hosts who demand efficiency.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-black hover:bg-white/90 transition-colors text-lg font-semibold"
          >
            Get Started
          </button>
        </section>

        {/* ---- CleanFlow Features Section ---- */}
        <section className="w-full bg-black text-white border-t border-white/10">
          {/* Section 1 – Was ist CleanFlow? */}
          <div className="relative py-20">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  Was ist <span className="text-white">CleanFlow?</span>
                </h2>
                <p className="mt-4 text-base sm:text-lg text-white/70 max-w-3xl mx-auto">
                  Eine intelligente Plattform, die Ihnen hilft, Reinigungen zu planen, zu koordinieren
                  und zu verwalten – alles an einem Ort.
                </p>
              </div>

              {/* Drei Hauptfunktionen */}
              <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    emoji: '💬',
                    title: 'WhatsApp Integration',
                    text:
                      'Kommunizieren Sie direkt mit Ihren Reinigungskräften über WhatsApp. Senden Sie Aufträge, erhalten Sie Updates und bleiben Sie in Echtzeit verbunden.',
                  },
                  {
                    emoji: '🗓️',
                    title: 'Intelligente Planung',
                    text:
                      'Planen Sie Reinigungen automatisch oder manuell. CleanFlow optimiert Routen, Zeiten und Ressourcen für maximale Effizienz.',
                  },
                  {
                    emoji: '👥',
                    title: 'Team-Management',
                    text:
                      'Verwalten Sie Ihr gesamtes Reinigungsteam zentral. Weisen Sie Aufgaben zu, tracken Sie Fortschritte und behalten Sie alles im Blick.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 transition-all duration-300 hover:bg-white/[0.07]"
                  >
                    <div className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 bg-white/10 mb-4">
                      <span className="text-lg mr-2">{item.emoji}</span>
                      <span className="text-sm text-white/80">Feature</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-white/70 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2 – Funktionen, die überzeugen (goldene Akzente) */}
          <div className="relative py-24">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                    Funktionen, die überzeugen
                  </span>
                </h2>
                <p className="mt-4 text-base sm:text-lg text-white/70 max-w-3xl mx-auto">
                  Alles, was Sie für professionelles Reinigungsmanagement brauchen
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {[
                  {
                    emoji: '✅',
                    title: 'Personalisierte Kommunikation',
                    text:
                      'Wählen Sie für jede Reinigungskraft den bevorzugten Kommunikationskanal – WhatsApp, SMS, E-Mail oder In-App-Benachrichtigungen.',
                  },
                  {
                    emoji: '🕒',
                    title: 'Echtzeit-Updates',
                    text:
                      'Erhalten Sie sofortige Benachrichtigungen, wenn Reinigungen gestartet, abgeschlossen oder verzögert werden.',
                  },
                  {
                    emoji: '🛡️',
                    title: 'Sichere Datenverwaltung',
                    text:
                      'Alle Daten werden verschlüsselt und DSGVO-konform gespeichert. Ihre Privatsphäre hat oberste Priorität.',
                  },
                  {
                    emoji: '📊',
                    title: 'Automatische Berichte',
                    text:
                      'Generieren Sie automatisch detaillierte Berichte über Reinigungen, Arbeitszeiten und Kosten.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-7 hover:ring-amber-400/20 transition"
                  >
                    <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30 mb-4">
                      <span className="text-base">{item.emoji}</span>
                      <span>Highlight</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-white/70 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ---- Ende CleanFlow Features Section ---- */}

        {/* CTA */}
        <section className="py-24 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to optimize your operations?</h2>
            <p className="text-xl text-white/70 mb-8">
              Join hosts who trust KNK-AI to keep their properties pristine.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-black hover:bg-white/90 transition-colors text-lg font-semibold"
            >
              Start Now
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-white/50">
          <p>&copy; 2025 KNK-AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
