import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar – minimal, präzise */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/brand/logo.png"
              alt="CleanFlow"
              className="h-10 w-auto object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <span className="text-sm tracking-widest uppercase text-white/70">CleanFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button className="text-sm text-white/70 hover:text-white transition-colors">Produkte</button>
            <button className="text-sm text-white/70 hover:text-white transition-colors">Lösungen</button>
            <button className="text-sm text-white/70 hover:text-white transition-colors">Preise</button>
            <button className="text-sm text-white/70 hover:text-white transition-colors">Kontakt</button>
          </nav>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
          >
            Login
          </button>
        </div>
      </header>

      <main>
        {/* HERO – große Bühne, klare Typo, minimaler Schimmer */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {/* sehr dezenter radialer Glanz */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-6 lg:px-8 py-28 md:py-36 text-center">
            <p className="text-xs tracking-[0.35em] uppercase text-white/60">Short-Term Rental · Operations</p>
            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <span className="text-white">Effortless</span>{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 via-white to-neutral-200">
                Cleaning Coordination
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              Manage apartments, coordinate cleaners, and schedule tasks with precision. Built for hosts who demand
              efficiency.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-sm md:text-base font-semibold bg-white text-black hover:bg-white/90 transition-colors"
              >
                Get Started
              </button>
              <button
                className="px-8 py-3 text-sm md:text-base font-semibold border border-white/20 text-white hover:border-white/40 transition-colors"
              >
                Learn More
              </button>
            </div>

            {/* dünner Divider */}
            <div className="mt-16 h-px w-32 mx-auto bg-white/10" />
          </div>
        </section>

       {/* SECTION – „Was ist CleanFlow?“ (invertiert: weißer Hintergrund, schwarzer Text) */}
<section className="py-24 bg-white text-black">
  <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
    <div className="text-center">
      {/* Titel – dunkler Verlauf für edlen Effekt */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-900 to-black">
          Was ist CleanFlow
        </span>
      </h2>

      {/* feine graue Linie darunter */}
      <div className="w-24 h-px bg-neutral-300 mx-auto mt-6 mb-6" />

      {/* Beschreibung – dezenter Grauton für weiches Lesen */}
      <p className="text-neutral-700 max-w-3xl mx-auto">
        CleanFlow ist die moderne Softwarelösung für professionelles Reinigungsmanagement.
        Koordinieren Sie Ihr Team effizient, zentral und in Echtzeit – alles an einem Ort.
      </p>
    </div>

    {/* Drei Kerneigenschaften – weiße Karten leicht abgesetzt */}
    <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          className="rounded-2xl border border-neutral-200 bg-neutral-50 p-7 hover:bg-neutral-100 transition-colors"
        >
          <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500 mb-4">
            <span className="text-base">{item.emoji}</span>
            <span>Feature</span>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{item.title}</h3>
          <p className="mt-3 text-neutral-600 leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  </div>
</section>

        {/* SECTION – „Funktionen, die überzeugen“ (stärkerer Kontrast, dezente Goldkante) */}
        <section className="py-24 border-t border-white/10">
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

        {/* CTA – präzise, ruhig, hochwertig */}
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
              <button className="px-8 py-3 text-sm md:text-base font-semibold border border-white/20 text-white hover:border-white/40 transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer – sehr reduziert */}
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
    </div>
  );
}
