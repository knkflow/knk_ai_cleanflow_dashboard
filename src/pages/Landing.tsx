// src/routes/Landing.tsx
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  // für Header (2. Code)
  User, Search, Mail,
  // für Inhalte (1. Code)
  Users, LogIn, ArrowRight, MessageSquare, ClipboardCheck,
  CalendarDays, ShieldCheck, CheckCircle2, Star,
} from "lucide-react";

export function Landing() {
  const navigate = useNavigate();

  // Refs (aus 1. Code)
  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);

  // States (gemeinsam)
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Helpers
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const to = "knk.flow@web.de";
    const subject = `Kontaktanfrage von ${contactName || "CleanFlow Website"}`;
    const bodyLines = [
      contactName ? `Name: ${contactName}` : "",
      contactEmail ? `E-Mail: ${contactEmail}` : "",
      "",
      "Nachricht:",
      contactMessage || "",
    ].filter(Boolean);
    const body = bodyLines.join("\n");
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setIsContactOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ===== HEADER aus 2. Code beibehalten ===== */}
         <header className="sticky top-0 z-40 border-b border-white/10 bg-[#000000] backdrop-blur-none supports-[backdrop-filter]:backdrop-blur-0 text-  white">

        <div className="container mx-auto px-6 lg:px-8 py-4 grid grid-cols-3 items-center">
          {/* Links – Name */}
          <span className="text-sm md:text-base tracking-widest uppercase font-semibold text-white">
  CleanFlow
</span>


          {/* Mitte – Logo */}
          <div className="justify-self-center">
            <img
              src="/logo.png"
              alt="CleanFlow"
              className="h-10 md:h-14 w-auto select-none rounded-full border-2 border-white/70
                         shadow-[0_0_10px_rgba(255,255,255,0.25)] transition-all duration-500 ease-out
                         hover:shadow-[0_0_25px_rgba(255,255,255,0.55)] hover:border-white"
            />
          </div>

          {/* Rechts – Navigation (Desktop) */}
          <nav className="hidden md:flex justify-end items-center gap-6 lg:gap-8">
            <button
              onClick={() => scrollTo(featuresRef)}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Lösungen
            </button>
            <button
              onClick={openContact}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Kontakt
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors rounded-full"
            >
              Anmelden
            </button>
          </nav>

          {/* Rechts – Mobile Toggle */}
          <div className="md:hidden justify-self-end">
            <button
              aria-label="Navigation öffnen"
              onClick={() => setMobileOpen((v) => !v)}
              className="relative inline-flex items-center justify-center gap-2 px-3 w-auto h-10 rounded-full
                         border border-white/20 text-white/80 bg-black/30
                         transition-all duration-300 ease-out
                         hover:text-white hover:border-white/60 hover:bg-black/40
                         focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black
                         shadow-none hover:shadow-[0_0_18px_rgba(255,255,255,0.35)]"
            >
              <User className="w-4 h-4" />
              <Search className="w-4 h-4" />
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur">
            <div className="container mx-auto px-6 lg:px-8 py-3 flex flex-col gap-2">
              <button
                onClick={() => { setMobileOpen(false); scrollTo(heroRef); }}
                className="text-sm py-2 text-left text-white/80 hover:text-white transition-colors"
              >
                Start
              </button>
              <button
                onClick={() => { setMobileOpen(false); scrollTo(featuresRef); }}
                className="text-sm py-2 text-left text-white/80 hover:text-white transition-colors"
              >
                Lösungen
              </button>
              <button
                onClick={() => { setMobileOpen(false); scrollTo(storyRef); }}
                className="text-sm py-2 text-left text-white/80 hover:text-white transition-colors"
              >
                Über uns
              </button>
              <button
                onClick={() => { setMobileOpen(false); scrollTo(pricingRef); }}
                className="text-sm py-2 text-left text-white/80 hover:text-white transition-colors"
              >
                Preise
              </button>
              <button
                onClick={() => { setMobileOpen(false); openContact(); }}
                className="text-sm py-2 text-left text-white/80 hover:text-white transition-colors"
              >
                Kontakt
              </button>
              <button
                onClick={() => { setMobileOpen(false); navigate("/login"); }}
                className="mt-1 px-5 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors rounded-full w-full"
              >
                Anmelden
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN – kompletter Inhalt aus 1. Code ===== */}
      <main>
        {/* HERO */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
            <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-200 blur-3xl" />
            <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-100 blur-3xl" />
          </div>

          <div className="container mx-auto px-6 lg:px-10 py-16 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white">
              <span className="text-[11px] md:text-xs tracking-[0.35em] uppercase text-gray-600">
                Kurzzeitvermietung · Reinigungsteams · Hausverwaltungen
              </span>
            </div>

            <h1 className="mt-6 text-3xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Ihre Reinigungen. Einfach organisiert – klar, effizient, zuverlässig.
            </h1>

            <p className="mt-6 text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Digitale Verwaltung aller Reinigungen, automatische und manuelle WhatsApp-Benachrichtigungen an Teams,
              zentrale Auftragsverwaltung mit Dokumentation und ein Kalender, der Abwesenheiten und Planung im Blick behält.
            </p>

            <div className="mt-8 md:mt-10 flex items-center justify-center gap-3 md:gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-6 md:px-7 py-3 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
              >
                Jetzt starten
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={() => scrollTo(featuresRef)}
                className="px-6 md:px-7 py-3 rounded-full border border-gray-200 text-gray-900 hover:bg-gray-50"
              >
                Mehr erfahren
              </button>
            </div>

            {/* Photo1 direkt unter Headline */}
            <div className="mt-10 md:mt-14 mx-auto max-w-5xl rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200 bg-white">
              <img
                src="/Photo1.png"
                alt="Dashboard Vorschau"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section ref={featuresRef} className="py-20 md:py-24 border-t border-gray-200">
          <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Funktionen, die überzeugen
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-300 mx-auto mt-6 mb-6 opacity-80" />
              <p className="text-gray-600 max-w-3xl mx-auto">
                Klar strukturiert, zentral dokumentiert – damit Qualität und Ruhe im Alltag spürbar werden.
              </p>
            </div>

            <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { icon: <MessageSquare className="w-5 h-5" />, title: "WhatsApp-Benachrichtigungen", text: "Automatisch und manuell: Aufträge, Updates und Bestätigungen direkt an Reinigungskräfte – nachweisbar und nachvollziehbar." },
                { icon: <ClipboardCheck className="w-5 h-5" />, title: "Reinigungseinträge & Checklisten", text: "Aufträge anlegen, zuweisen und dokumentieren. Fotodoku, Checklisten und Abnahme – transparent und revisionssicher." },
                { icon: <CalendarDays className="w-5 h-5" />, title: "Kalender & Abwesenheiten", text: "Urlaub und Krankheit im Blick. Konflikte früh erkennen und Planung verlässlich halten." },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Sicherheit & DSGVO", text: "EU-Server, verschlüsselte Daten und rollenbasierte Zugriffe. Vertrauen ist Standard." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-sm">
                  <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-emerald-600 mb-4">
                    {f.icon}
                    <span>Highlight</span>
                  </div>
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STORY */}
        <section ref={storyRef} className="py-20 md:py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-10 max-w-6xl grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <img
                src="/Photo2.png"
                alt="Team bei der Einsatzplanung"
                className="w-full rounded-2xl md:rounded-3xl border border-gray-200"
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500">Unsere Mission</p>
              <h3 className="mt-2 text-2xl md:text-4xl font-extrabold tracking-tight">
                Wir bringen Ruhe & Qualität in die Reinigung
              </h3>
              <p className="mt-4 text-gray-700 leading-relaxed">
                CleanFlow bündelt Planung, Kommunikation und Qualitätssicherung in einer Oberfläche.
                So wenig Klicks wie möglich, so viel Transparenz wie nötig – für verlässliche Abläufe und saubere Ergebnisse.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Aufträge automatisch verteilen – fair und nachvollziehbar",
                  "Zentrale Reinigungsverwaltung mit Fotodoku und Checklisten",
                  "Kalender & Abwesenheiten im Blick – Konflikte früh erkennen",
                  "Rollen & Rechte für Teams, Subunternehmer und Eigentümer",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 w-5 h-5 shrink-0 text-emerald-600" />
                    <span className="text-gray-800 leading-relaxed text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Vertrauen entsteht durch Ergebnis
                </h3>
                <p className="mt-4 text-gray-600 max-w-xl">
                  Weniger Koordination, mehr Verlässlichkeit: Unsere Kunden berichten von deutlicher Zeitersparnis,
                  zuverlässigen Übergaben und transparenter Qualität.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {["EU-Server", "SLA 99,9 %", "Rollenbasierte Zugriffe", "Audit-Logs"].map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 text-sm font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                {[
                  { quote: "Seit CleanFlow sparen wir jede Woche Stunden – Planung und Rückmeldungen laufen zuverlässig.", name: "Lena M.", role: "Host, 24 Apartments" },
                  { quote: "Transparente Aufträge und klare Zuständigkeiten. Unser Team arbeitet ruhiger und fehlerfrei.", name: "Tobias K.", role: "Hausverwaltung" },
                  { quote: "Fotodoku und Checklisten erhöhen die Qualität – Beschwerden sind praktisch verschwunden.", name: "Aylin S.", role: "Reinigungsleiterin" },
                ].map((t) => (
                  <blockquote key={t.name} className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-1 mb-3" aria-hidden>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 text-emerald-500" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-900">“{t.quote}”</p>
                    <footer className="mt-3 text-sm text-gray-600">
                      {t.name} · {t.role}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section ref={pricingRef} className="py-20 md:py-24 border-t border-gray-200">
          <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Einfaches, faires Preismodell
              </h3>
              <p className="mt-3 text-gray-600">
                Skalierbar vom Solo-Host bis zur großen Verwaltung – mit Klarheit bei den Funktionen.
              </p>
            </div>

            <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Starter", price: "€19", period: "/Monat", highlight: false, features: ["Bis 10 Objekte", "WhatsApp-Benachrichtigungen", "Grundlegende Reports", "E-Mail Support"] },
                { name: "Pro", price: "€49", period: "/Monat", highlight: true, features: ["Bis 50 Objekte", "Kalender & Abwesenheiten", "Checklisten & Fotodoku", "Priorisierter Support"] },
                { name: "Enterprise", price: "Individuell", period: "", highlight: false, features: [">50 Objekte", "RBAC & SSO", "API-Zugriff", "Onboarding & SLA"] },
              ].map((p) => (
                <div key={p.name} className={["rounded-3xl border p-6 flex flex-col", p.highlight ? "border-emerald-400/50 bg-emerald-50" : "border-gray-200 bg-white"].join(" ")}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-semibold">{p.name}</h4>
                    {p.highlight && <span className="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white">Empfohlen</span>}
                  </div>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-extrabold">{p.price}</span>
                    <span className="text-gray-500 mb-1">{p.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-gray-700">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {p.name === "Enterprise" ? (
                      <button onClick={openContact} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50">
                        Angebot anfragen <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <Link to="/login" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 font-semibold">
                        Jetzt starten <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">14 Tage kostenlos testen. Keine Kreditkarte erforderlich.</p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER (aus 1. Code) */}
      <footer className="bg-black text-white">
        <div className="container mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/90 text-sm md:text-base font-medium">
            © {new Date().getFullYear()} CleanFlow. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-6 text-sm md:text-base font-semibold">
            <a href="#datenschutz" className="text-white/85 hover:text-white">Datenschutz</a>
            <a href="#impressum" className="text-white/85 hover:text-white">Impressum</a>
            <a href="#agb" className="text-white/85 hover:text-white">AGB</a>
          </div>
        </div>
      </footer>

      {/* KONTAKT-MODAL (aus 1. Code) */}
      {isContactOpen && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeContact} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-black text-white shadow-2xl border border-white/10">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-xl font-semibold">Kontakt</h4>
              <button
                onClick={closeContact}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/60">E-Mail</p>
                  <a href="mailto:knk.flow@web.de" className="text-white hover:underline break-all">
                    knk.flow@web.de
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/60">Telefon</p>
                  <a href="tel:+4917660733953" className="text-white hover:underline">
                    +49 176 60733953
                  </a>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <p className="text-white/70 text-sm">
                  Schreiben Sie uns eine Nachricht – wir melden uns zeitnah.
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/80 mb-1">Ihr Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white/5 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="Max Mustermann"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Ihre E-Mail</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white/5 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="max@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Nachricht</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 rounded-md bg-white/5 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="Worum geht es?"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeContact}
                    className="px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10 transition"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-md bg-white text-black font-semibold hover:bg-white/90 transition"
                  >
                    Nachricht senden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
