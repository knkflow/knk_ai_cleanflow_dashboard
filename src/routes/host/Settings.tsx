// src/pages/Settings/Settings.tsx  (Light)
import { useState, ChangeEvent } from 'react';
import { Settings as SettingsIcon, User, Link2, FileText, MoreHorizontal } from 'lucide-react';
import { Input } from '../../components/forms/Input';

type SectionKey = 'general' | 'profile' | 'apis' | 'invoices' | 'other';

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'Allgemein', icon: SettingsIcon },
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'apis', label: 'Verbindungen & APIs', icon: Link2 },
  { key: 'invoices', label: 'Rechnungen', icon: FileText },
  { key: 'other', label: 'Sonstiges', icon: MoreHorizontal },
];

export function Settings() {
  const [active, setActive] = useState<SectionKey>('general');
  const [values, setValues] = useState<Record<SectionKey, string>>({ general: '', profile: '', apis: '', invoices: '', other: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, [active]: val }));
  };

  const currentSection = SECTIONS.find((s) => s.key === active);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
      </div>

      <div className="mx-auto max-w-5xl bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
          <aside className="border-b md:border-b-0 md:border-r border-gray-200">
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
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
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

          <section className="p-4 md:p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{currentSection?.label}</h3>
              <p className="text-gray-600 text-sm">
                {['general', 'profile', 'apis'].includes(active)
                  ? 'Dummy-Beispiel – hier kommt später der echte Inhalt.'
                  : 'Diese Funktionalität ist noch in Arbeit.'}
              </p>
            </div>

            {['general', 'profile', 'apis'].includes(active) && (
              <div className="max-w-lg">
                <Input label="Beispiel-Textfeld" placeholder="Gib hier etwas ein…" value={values[active]} onChange={handleChange} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
