import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  ClipboardList,
  Building2,
  Plug,
  Users,
  CalendarDays,
} from "lucide-react";

/**
 * Onboarding (responsive)
 * - Mobile-first Layout (Stack), ab md dann zweispaltig/Row
 * - Buttons sind auf Mobile full-width, auf md inline
 * - Kleinere Icons/Spacing auf Mobile, großzügiger ab md
 */
export function Onboard() {
  const LS_KEY = "host_onboard_steps_v1";
  const navigate = useNavigate();

  type Step = {
    id: string;
    title: string;
    description: string;
    done: boolean;
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

  const readStatusMap = (): StatusMap => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        return Object.fromEntries(defaultSteps.map((s) => [s.id, ""])) as StatusMap;
      }
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const map: StatusMap = { ...parsed };
        for (const s of defaultSteps) {
          if (!(s.id in map)) map[s.id] = "";
          if (map[s.id] !== "erledigt" && map[s.id] !== "") map[s.id] = "";
        }
        return map;
      }

      if (Array.isArray(parsed)) {
        const map: StatusMap = Object.fromEntries(defaultSteps.map((s) => [s.id, ""])) as StatusMap;
        for (const item of parsed) {
          if (item && typeof item === "object" && "id" in item) {
            const id = (item as any).id;
            const doneBool = !!(item as any).done;
            if (typeof id === "string") map[id] = doneBool ? "erledigt" : "";
          }
        }
        try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch {}
        return map;
      }

      return Object.fromEntries(defaultSteps.map((s) => [s.id, ""])) as StatusMap;
    } catch {
      return Object.fromEntries(defaultSteps.map((s) => [s.id, ""])) as StatusMap;
    }
  };

  const writeStatusMap = (map: StatusMap) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch {}
  };

  const mapToSteps = (map: StatusMap): Step[] =>
    defaultSteps.map((s) => ({ ...s, done: map[s.id] === "erledigt" }));

  useEffect(() => {
    const map = readStatusMap();
    setSteps(mapToSteps(map));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const completed = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const total = steps.length || 1;
  const percent = useMemo(() => Math.round((completed / total) * 100), [completed, total]);

  const handleClick = (step: Step) => {
    const currentMap = readStatusMap();
    const wasDone = currentMap[step.id] === "erledigt";
    const nextValue: "erledigt" | "" = wasDone ? "" : "erledigt";
    const nextMap: StatusMap = { ...currentMap, [step.id]: nextValue };

    writeStatusMap(nextMap);
    setSteps(mapToSteps(nextMap));

    if (!wasDone && step.redirect) navigate(step.redirect);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white antialiased">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Onboarding-Fortschritt
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              {completed} von {total} Schritten abgeschlossen
            </p>
          </div>

          <div className="mt-1 md:mt-0 md:text-right">
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">{percent}%</div>
            <div className="text-[10px] sm:text-xs text-neutral-400">Vollständig</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
            aria-label="Fortschrittsbalken"
          />
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-3 sm:space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = step.done;
            return (
              <div
                key={step.id}
                className="relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4 backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* status indicator */}
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-neutral-900 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
                    ) : (
                      <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" />
                    )}
                  </div>

                  {/* step icon + texts */}
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="mt-0.5 sm:mt-1 shrink-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-sm sm:text-base font-medium leading-tight truncate">
                          {idx + 1}. {step.title}
                        </h3>
                        {!isDone && (
                          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] sm:text-xs text-red-300">
                            Offen
                          </span>
                        )}
                        {isDone && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-xs text-emerald-300">
                            Erledigt
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* spacer */}
                  <div className="sm:ml-auto" />

                  {/* action button */}
                  <button
                    onClick={() => handleClick(step)}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDone
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    {isDone ? "Rückgängig" : "Erledigen"}
                    {!isDone && (
                      <span className="-mr-1 hidden sm:inline-block rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] leading-none">
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
