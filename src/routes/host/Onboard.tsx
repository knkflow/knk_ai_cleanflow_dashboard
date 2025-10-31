import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  ClipboardList,
  Building2,
  Plug,
  Users,
} from "lucide-react";

export function Onboard() {
  const navigate = useNavigate();

  type Step = {
    id: string;
    title: string;
    description: string;
    done: boolean;
    icon: React.ComponentType<{ className?: string }>;
    redirect?: string; // 👈 wohin soll’s gehen
  };

  const [steps, setSteps] = useState<Step[]>([
    {
      id: "company-profile",
      title: "Unternehmensprofil vervollständigen",
      description: "Grundlegende Unternehmensinformationen und Kontaktdaten",
      done: false,
      icon: ClipboardList,
      redirect: "/host/settings#profil", // 👈 Settings → Profil
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
  ]);

  const completed = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const total = steps.length;
  const percent = useMemo(
    () => Math.round((completed / total) * 100),
    [completed, total]
  );

  const handleClick = (step: Step) => {
    // Toggle „erledigt“ Status
    setSteps((prev) =>
      prev.map((s) => (s.id === step.id ? { ...s, done: !s.done } : s))
    );

    // Wenn gerade „Erledigen“ geklickt wurde → weiterleiten
    if (!step.done && step.redirect) {
      navigate(step.redirect);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white antialiased">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Onboarding-Fortschritt
            </h1>
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
                  {/* Status indicator */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900">
                    {isDone ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    ) : (
                      <XCircle className="h-7 w-7 text-red-500" />
                    )}
                  </div>

                  {/* Icon + Text */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className="h-6 w-6 text-neutral-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-medium leading-tight">
                          {idx + 1}. {step.title}
                        </h3>
                        {!isDone ? (
                          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
                            Offen
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                            Erledigt
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-neutral-400">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto" />

                  {/* Action Button */}
                  <button
                    onClick={() => handleClick(step)}
                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDone
                        ? "border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
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
