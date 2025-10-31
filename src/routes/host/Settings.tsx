// src/pages/Settings/Settings.tsx
import { useState, ChangeEvent } from 'react';
import { Settings as SettingsIcon, User, Link2 } from 'lucide-react';
import { Input } from '../../components/forms/Input'; // nutzt eure bestehende Input-Komponente

type SectionKey = 'general' | 'profile' | 'apis';

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'Allgemein', icon: SettingsIcon },
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'apis', label: 'Verbindungen & APIs', icon: Link2 },
];

export default function Settings() {
  const [active, setActive] = useState<SectionKey>('general');
  // Für den Dummy: pro Bereich genau EIN Textfeld
  const [values, setValues] = useState<Record<SectionKey, string>>({
    general: '',
    profile: '',
    apis: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, [active]: val }));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Einstellungen</h2>
      </div>

      {/* Zentrierte Kachel */}
      <div className="mx-auto max-w-5xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
          {/* Linkes Menü */}
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

          {/* Rechter Inhalt */}
          <section className="p-4 md:p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white">
                {SECTIONS.find((s) => s.key === active)?.label}
              </h3>
              <p className="text-white/60 text-sm">
                Dummy-Beispiel – hier kommt später der echte Inhalt.
              </p>
            </div>

            {/* Ein einziges Textfeld als Dummy */}
            <div className="max-w-lg">
              <Input
                label="Beispiel-Textfeld"
                placeholder="Gib hier etwas ein…"
                value={values[active]}
                onChange={handleChange}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
