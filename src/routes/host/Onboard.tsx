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
 * Onboarding component with string status persistence (localStorage)
 * - Für jeden Step wird im localStorage eine Map { [id]: "erledigt" | "" } gespeichert.
 * - Nur Steps mit Wert "erledigt" sind grün und zählen zum Fortschritt.
 * - Fortschritt wird beim Laden aus localStorage berechnet (persistenter Fortschritt).
 * - Klick auf "Erledigen" toggelt den Status; wenn neu erledigt, wird redirectet.
 *
 * Schritte:
 *  1) Unternehmensprofil vervollständigen → /host/settings#profil
 *  2) Objekt/Apartment hinzufügen → /host/apartments
 *  3) PMS-Verbindung verknüpfen → /host/settings#verbindungen-und-apis
 *  4) Reinigungskräfte hinzufügen → /host/cleaners
 *  5) Reinigung planen → /host/tasks
 */
export function Onboard() {
  const LS_KEY = "host_onboard_steps_v1"; // Key bleibt, Inhalt jetzt Map { [id]: "erledigt" | "" }
  const navigate = useNavigate();

  type Step = {
    id: string;
    title: string;
    description: string;
    done: boolean; // abgeleitet aus storageMap[id] === "erledigt"
    icon: React.ComponentType<{ className?: string }>;
    redirect?: string;
  };

  type StatusMap = Record<string, "erledigt" | "">;

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

  /** Liest Map aus localStorage. Migriert alte Array-Struktur falls nötig. */
  const readStatusMap = (): StatusMap => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        // initial: leere Map mit allen Keys als ""
        const empty: StatusMap = Object.fromEntries(defaultSteps.map(s => [s.id, ""]));
        return empty;
      }

      const parsed = JSON.parse(raw);

      // Fall A: bereits Map-Format { [id]: "erledigt" | "" }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        // sicherstellen, dass alle default-IDs existieren
        const map: StatusMap = { ...parsed };
        for (const s of defaultSteps) {
          if (map[s.id] !== "erledigt" && map[s.id] !== "") {
            map[s.id] = ""; // normalisieren
          }
          if (!(s.id in map)) {
            map[s.id] = "";
          }
        }
        return map;
      }

      // Fall B: Legacy-Array [{id, done:boolean}]
      if (Array.isArray(parsed)) {
        const map: StatusMap = Object.fromEntries(
          defaultSteps.map(s => [s.id, ""])
        );
        for (const item of parsed) {
          if (item && typeof item === "object" && "id" in item) {
            const id = (item as any).id;
            const doneBool = !!(item as any).done;
            if (typeof id === "string") {
              map[id] = doneBool ? "erledigt" : "";
            }
          }
        }
        // direkt im neuen Format zurückschreiben (Migration)
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(map));
        } catch {}
        return map;
      }

      // Unbekanntes Format → auf leer zurückfallen
      const empty: StatusMap = Object.fromEntries(defaultSteps.map(s => [s.id, ""]));
      return empty;
    } catch {
      const empty: StatusMap = Object.fromEntries(defaultSteps.map(s => [s.id, ""]));
      return empty;
    }
  };

  /** Speichert Map minimal zurück. */
  const writeStatusMap = (map: StatusMap) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(map));
    } catch {
      // Ignorieren, wenn Storage nicht verfügbar
    }
  };

  /** Leitet aus Map die Steps (done-Flags) ab. */
  const mapToSteps = (map: StatusMap): Step[] => {
    return defaultSteps.map(s => ({
      ...s,
      done: map[s.id] === "erledigt",
    }));
  };

  // Initial laden
  useEffect(() => {
    const map = readStatusMap();
    setSteps(mapToSteps(map));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-Tab/Route-Änderungen live übernehmen
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        const map = readStatusMap();
        setSteps(mapToSteps(map));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Prozent aus "erledigt"-Werten berechnen */
  const completed = useMemo(() => steps.filter(s => s.done).length, [steps]);
  const total = steps.length || 1;
  const percent = useMemo(() => Math.round((completed / total) * 100), [completed, total]);

  /** Toggle + Persist + optional Redirect */
  const handleClick = (step: Step) => {
    const currentMap = readStatusMap();
    const wasDone = currentMap[step.id] === "erledigt";
    const nextValue: "erledigt" | "" = wasDone ? "" : "erledigt";
    const nextMap: StatusMap = { ...currentMap, [step.id]: nextValue };

    // Persistieren
    writeStatusMap(nextMap);

    // UI sofort aktualisieren
    setSteps(mapToSteps(nextMap));

    // Wenn jetzt erledigt → redirect
    if (!wasDone && step.redirect) {
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

                  {/* action button */}
                  <button
                    onClick={() => handleClick(step)}
                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDone
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    {isDone ? "Rückgängig" : "Erledigen"}
                    {!isDone && (
                      <span className="-mr-1 inline-block rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] leading-none">
                        →
                      </span>
                    )}
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
