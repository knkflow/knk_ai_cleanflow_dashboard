import { useState, FormEvent } from 'react';
import { Settings as SettingsIcon, User, Link2 } from 'lucide-react';
import { Input } from '../../components/forms/Input';

type SectionKey = 'general' | 'profile' | 'integrations';

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'Allgemein', icon: SettingsIcon },
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'integrations', label: 'Verbindungen & APIs', icon: Link2 },
];

export function Settings() {
  const [active, setActive] = useState<SectionKey>('general');

  // Dummy-Form-States je Bereich (nur Beispiel-Feld)
  const [forms, setForms] = useState<Record<SectionKey, string>>({
    general: '',
    profile: '',
    integrations: '',
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Hier später echte Save-Logik (API-Call) einbauen
    console.log(`[${active}] gespeichert:`, forms[active]);
    alert(`Gespeichert: ${forms[active] || '(leer)'}`);
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Einstellungen</h2>
      </div>

      {/* Zentrierte Kachel */}
      <div className="mx-auto max-w-5xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Responsive Grid: links Menü, rechts Inhalt */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
          {/* Linke Spalte: Menü */}
          <aside className="border-b md:border-b-0 md:border-r border-white/10">
            <nav className="p-2 md:p-4">
              <ul className="space-y-1">
                {SECTIONS.map(({ key, label, icon: Icon }) => {
                  const isActive = key === active;
                  return (
                    <li key={key}>
                      <button
                        onClick={() => setActive(key)}
                        className={[
                          'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                          isActive
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'text-white/70 hover:text-white hover:bg-white/10',
                        ].join(' ')}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Rechte Spalte: Inhalt */}
          <section className="p-4 md:p-6">
            {/* Headline des aktiven Bereichs */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white">
                {SECTIONS.find(s => s.key === active)?.label}
              </h3>
              <p className="text-white/60 text-sm">
                Beispielinhalt – hier später die echten Einstellungen einfügen.
              </p>
            </div>

            {/* Dummy-Formular */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <Input
                label="Beispiel-Textfeld"
                placeholder="Gib hier etwas ein…"
                value={forms[active]}
                onChange={(e) =>
                  setForms((prev) => ({ ...prev, [active]: e.target.value }))
                }
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium rounded-md"
                >
                  Speichern
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForms((prev) => ({ ...prev, [active]: '' }))
                  }
                  className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors rounded-md"
                >
                  Zurücksetzen
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
