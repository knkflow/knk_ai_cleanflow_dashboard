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

        import React from "react";


// CleanFlow – Feature Sections (Dark mode: black background, white text, gold accents)
// Emojis remain colored; all text is white; backgrounds are near-black; the previous blue accents are now gold.


export default function CleanFlowFeatures() {
const overview = [
{
emoji: "💬",
title: "WhatsApp Integration",
text:
"Kommunizieren Sie direkt mit Ihren Reinigungskräften über WhatsApp. Senden Sie Aufträge, erhalten Sie Updates und bleiben Sie in Echtzeit verbunden.",
badge: "bg-white/5 text-white ring-1 ring-white/10",
},
{
emoji: "🗓️",
title: "Intelligente Planung",
text:
"Planen Sie Reinigungen automatisch oder manuell. CleanFlow optimiert Routen, Zeiten und Ressourcen für maximale Effizienz.",
badge: "bg-white/5 text-white ring-1 ring-white/10",
},
{
emoji: "👥",
title: "Team-Management",
text:
"Verwalten Sie Ihr gesamtes Reinigungsteam zentral. Weisen Sie Aufgaben zu, tracken Sie Fortschritte und behalten Sie alles im Blick.",
badge: "bg-white/5 text-white ring-1 ring-white/10",
},
{
emoji: "📝",
title: "Aufgabenverwaltung",
text:
"Erstellen und verwalten Sie Reinigungsaufgaben mit allen Details. Status-Updates in Echtzeit und automatische Benachrichtigungen.",
badge: "bg-white/5 text-white ring-1 ring-white/10",
},
{
emoji: "💵",
title: "Rechnungsverwaltung",
text:
"Erstellen, verwalten und versenden Sie Rechnungen direkt aus der Plattform. Vollständige Übersicht über alle Zahlungen und Abrechnungen.",
badge: "bg-white/5 text-white ring-1 ring-white/10",
},
{
emoji: "📅",
title: "Verfügbarkeitsverwaltung",
text:
"Verwalten Sie Arbeitszeiten und Verfügbarkeiten Ihrer Reinigungskräfte. Gruppierte Zeiträume für wiederkehrende Schichten.",
badge: "bg-white/5 text-white ring-1 ring-white/10",
},
];


const highlights = [
{
emoji: "✅",
title: "Personalisierte Kommunikation",
text:
"Wählen Sie für jede Reinigungskraft den bevorzugten Kommunikationskanal – WhatsApp, SMS, E‑Mail oder In‑App‑Benachrichtigungen.",
badge: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30",
},
{
emoji: "🕒",
title: "Echtzeit‑Updates",
text:
"Erhalten Sie sofortige Benachrichtigungen, wenn Reinigungen gestartet, abgeschlossen oder verzögert werden.",
badge: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30",
},
{
emoji: "🛡️",
title: "Sichere Datenverwaltung",
text:
"Alle Daten werden verschlüsselt und DSGVO‑konform gespeichert. Ihre Privatsphäre hat oberste Priorität.",
badge: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30",
},
{
emoji: "📊",
title: "Automatische Berichte",
text:
"Generieren Sie automatisch detaillierte Berichte über Reinigungen, Arbeitszeiten und Kosten.",
badge: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30",
},
];


return (
<section className="w-full bg-black text-white">
{/* Section 1 – Was ist CleanFlow? */}
<div className="relative py-20">
}

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
