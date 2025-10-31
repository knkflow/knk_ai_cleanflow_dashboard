import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  // status icons
  CheckCircle2,
  XCircle,
  // feature icons (choose per step)
  ClipboardList,
  Building2,
  Plug,
  Users,
  CalendarDays,
} from "lucide-react";

/**
 * Onboarding component with state from localStorage (read-only here)
 * - Dark, professional look (black background, white text)
 * - Green check for done, red icon for not done
 * - Progress bar shows % complete (derived from localStorage)
 * - Button only redirects to the corresponding sub-route (no toggling here)
 * - State stays in localStorage and is read on mount + via storage events
 *
 * Steps:
 *  1) Unternehmensprofil vervollständigen → /host/settings#profil
 *  2) Objekt/Apartment hinzufügen → /host/apartments
 *  3) PMS-Verbindung verknüpfen → /host/settings#verbindungen-und-apis
 *  4) Reinigungskräfte hinzufügen → /host/cleaners
 *  5) Reinigung planen → /host/tasks
 *
 * Hinweis:
 * Das Setzen/Ändern des Done-Status (z. B. { id, done: true }) erfolgt von den
 * jeweiligen Sub-Routes aus, indem sie den gleichen localStorage-Key schreiben.
 */
export function Onboard() {
  const LS_KEY = "host_onboard_steps_v1"; // bump version if steps structure changes
  const navigate = useNavigate();

  type Step = {
    id: string;
    title: string;
    description: string;
    done: boolean;
    icon: React.ComponentType<{ className?: string }>;
    redirect?: string;
  };

  const defaultSteps: Step[] = [
    {
      id: "company-profile",
      title: "Unternehmensprofil vervollständigen",
      description: "Grundlegende Unternehmensinformationen und Kontaktdaten",
      done: false,
      icon: ClipboardList,
      redirect: "/host/settings#profil",
    },
    {
      id: "add-apartment",
      title: "Objekt/Apartment hinzufügen",
      description: "Mindestens ein Objekt/Apartment anlegen",
      done: false,
      icon: Building2,
      redirect: "/host/apartments",
    },
    {
      id: "pms-connect",
      title: "PMS-Verbindung verknüpfen",
      description: "Property Management System anbinden (z. B. Guesty, Airbnb)",
      done: false,
      icon: Plug,
      redirect: "/host/settings#verbindungen-und-apis",
    },
    {
      id: "add-cleaners",
      title: "Reinigungskräfte hinzufügen",
      description: "Reinigungskräfte zum Team hinzufügen",
      done: false,
      icon: Users,
      redirect: "/host/cleaners",
    },
    {
      id: "plan-cleaning",
      title: "Reinigungen planen",
      description: "Aufgaben und Reinigungspläne erstellen",
      done: false,
      icon: CalendarDays,
      redirect: "/host/tasks",
    },
  ];

  const [steps, setSteps] = useState<Step[]>(defaultSteps);

  // Helper: read and merge steps from localStorage
  const readStepsFromStorage = (): Step[] => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultSteps;
      const parsed = JSON.parse(raw) as Partial<Step>[];
      // Merge with default to be resilient to structure changes
      const merged = defaultSteps.map((d) => {
        const match = parsed.find((p) => p?.id === d.id);
        return match ? { ...d, done: !!match.done } : d;
      });
      return merged;
    } catch {
      // ignore parse errors and keep defaults
      return defaultSteps;
    }
  };

  // Load once on mount
  useEffect(() => {
    setSteps(readStepsFromStorage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to cross-tab / cross-route updates to localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setSteps(readStepsFromStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Optional safety) Persist if our merged defaults changed something structurbedingt.
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify(
          steps.map(({ id, done }) => ({ id, done })) // only persist minimal shape
        )
      );
    } catch {
      // storage might be unavailable; fail silently
    }
  }, [steps]);

  const completed = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const total = steps.length || 1;
  const percent = useMemo(() => Math.round((completed / total) * 100), [completed, total]);

  const handleNavigate = (step: Step) => {
    if (step.redirect) {
      navigate(step.redirect);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white antialiased">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Onboarding-Fortschritt</h1>
            <p className="mt-1 text-sm text-neutral-400">
              {completed} von {total} Schritten abgeschlossen
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">{percent}%</div>
            <div className="text-xs text-neutral-400">Vollständig</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = step.done;
            return (
              <div
                key={step.id}
                className="relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  {/* status indicator */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900">
                    {isDone ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    ) : (
                      <XCircle className="h-7 w-7 text-red-500" />
                    )}
                  </div>

                  {/* step icon + texts */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className="h-6 w-6 text-neutral-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-medium leading-tight">
                          {idx + 1}. {step.title}
                        </h3>
                        {!isDone && (
                          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
                            Offen
                          </span>
                        )}
                        {isDone && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                            Erledigt
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-neutral-400">{step.description}</p>
                    </div>
                  </div>

                  {/* spacer */}
                  <div className="ml-auto" />

                  {/* action button (redirect only) */}
                  <button
                    onClick={() => handleNavigate(step)}
                    className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {isDone ? "Ansehen" : "Jetzt erledigen"}
                    <span className="-mr-1 inline-block rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] leading-none">
                      →
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Onboard;
