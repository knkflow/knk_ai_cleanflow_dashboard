// src/routes/Landing.tsx
import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  // Header
  User, Search, Mail,
  // Inhalte
  ArrowRight, MessageSquare, ClipboardCheck,
  CalendarDays, ShieldCheck, CheckCircle2, Star,
} from "lucide-react";

export function Landing() {
  const navigate = useNavigate();

  // Refs für Scroll
  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);

  // State
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-Slider (Hero Galerie)
  const slides = ["/Photo2.png", "/Photo3.jpg", "/Photo5.jpg"];
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % slides.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

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
    <div className="min-h-screen bg-[#000] text-white">
      {/* ===== HEADER (schwarz) ===== */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#000000]">
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
              className="px-5 py-2 text-sm font-semibold rounded-full
                         bg-[#1e4b13] hover:bg-[#2a6a1b] text-white transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aa420]"
            >
              Anmelden
            </button>
          </nav>

          {/* Mobile Toggle */}
          <div className="md:hidden justify-self-end">
            <button
              aria-label="Navigation öffnen"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center gap-2 px-3 h-10 rounded-full
                         border border-white/20 text-white/80 bg-white/5 hover:text-white hover:border-white/60 hover:bg-white/10"
            >
              <User className="w-4 h-4" />
              <Search className="w-4 h-4" />
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95">
            <div className="container mx-auto px-6 lg:px-8 py-3 flex flex-col gap-2">
              <button onClick={() => { setMobileOpen(false); scrollTo(heroRef); }} className="py-2 text-left text-white/80 hover:text-white">Start</button>
              <button onClick={() => { setMobileOpen(false); scrollTo(featuresRef); }} className="py-2 text-left text-white/80 hover:text-white">Lösungen</button>
              <button onClick={() => { setMobileOpen(false); scrollTo(storyRef); }} className="py-2 text-left text-white/80 hover:text-white">Über uns</button>
              <button onClick={() => { setMobileOpen(false); openContact(); }} className="py-2 text-left text-white/80 hover:text-white">Kontakt</button>
              <button
                onClick={() => { setMobileOpen(false); navigate("/login"); }}
                className="mt-1 px-5 py-2 rounded-full
                           bg-[#1e4b13] hover:bg-[#2a6a1b] text-white font-semibold transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aa420]"
              >
                Anmelden
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN ===== */}
      <main>
        {/* HERO – Dark mit Energy-Glow + Auto-Slider im Hintergrund */}
        <section ref={heroRef} className="relative overflow-hidden">
          {/* Energy-Glows */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-white/5 blur-3xl" />
          </div>

          {/* Slider-Hintergrund */}
          <div className="absolute inset-0 opacity-[0.22]">
            {slides.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000]/40 via-[#000]/40 to-[#000]" />
          </div>

          <div className="relative container mx-auto px-6 lg:px-10 py-20 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/5">
              <span className="text-[11px] md:text-xs tracking-[0.35em] uppercase text-white/80">
                Kurzzeitvermietung · Reinigungsteams · Hausverwaltungen
              </span>
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <span className="text-white">Ihre Reinigungen.</span>{' '}
              <span className="bg-clip-text text-transparent bg-[conic-gradient(at_top_left,_white,_#d4d4d4,_white)]">
                Einfach. Koordiniert. Kraftvoll.
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              Verwalten Sie Apartments, koordinieren Sie Teams und planen Sie Einsätze mit Präzision. CleanFlow setzt auf Klarheit, Tempo und Qualität.
            </p>

            <div className="mt-9 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-sm md:text-base font-semibold rounded-full
                           bg-[#1e4b13] hover:bg-[#2a6a1b] text-white transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aa420]"
              >
                Jetzt starten
              </button>
              <button
                onClick={() => scrollTo(featuresRef)}
                className="px-8 py-3 text-sm md:text-base font-semibold border border-white/20 text-white hover:border-white/40 rounded-full"
              >
                Mehr erfahren
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES – energiegeladene Kacheln */}
        <section ref={featuresRef} className="py-20 md:py-24 border-t border-white/10">
          <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Funktionen, die antreiben
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-white/40 via-white to-white/40 mx-auto mt-6 mb-6" />
              <p className="text-white/70 max-w-3xl mx-auto">
                Alles, was Sie für professionelles Reinigungsmanagement brauchen – schnell, robust, transparent.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { icon: <MessageSquare className="w-5 h-5" />, title: "WhatsApp-Benachrichtigungen", text: "Automatisch & manuell. Nachweisbar, nachvollziehbar – direkt in den Chat der Teams." },
                { icon: <ClipboardCheck className="w-5 h-5" />, title: "Reinigungseinträge & Checklisten", text: "Aufträge erstellen, zuweisen, dokumentieren. Fotodoku & Abnahme inklusive." },
                { icon: <CalendarDays className="w-5 h-5" />, title: "Kalender & Abwesenheiten", text: "Urlaub & Krankheit im Blick. Konflikte früh erkennen und planen." },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Sicherheit & DSGVO", text: "EU-Server, Verschlüsselung, Rollen & Rechte. Vertrauen ist Standard." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-white/25 transition-colors"
                >
                  <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-white/70 mb-4">
                    {f.icon}
                    <span>Highlight</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{f.title}</h3>
                  <p className="mt-3 text-white/70 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STORY / ÜBER UNS */}
        <section ref={storyRef} className="py-20 md:py-24 bg-[#0b0b0b] border-t border-white/10">
          <div className="container mx-auto px-6 lg:px-10 max-w-6xl grid md:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <img
                src="/Photo2.png"
                alt="Team bei der Einsatzplanung"
                className="w-full rounded-2xl border border-white/10"
              />
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-white/5 blur-2xl" aria-hidden />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Unsere Mission</p>
              <h3 className="mt-2 text-2xl md:text-4xl font-extrabold tracking-tight">
                Ruhe in der Planung. Qualität im Ergebnis.
              </h3>
              <p className="mt-4 text-white/80 leading-relaxed">
                CleanFlow bündelt Planung, Kommunikation und Qualitätssicherung in einer Oberfläche.
                Möglichst wenige Klicks, maximale Transparenz – für verlässliche Abläufe und saubere Ergebnisse.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Aufträge automatisch verteilen – fair & nachvollziehbar",
                  "Zentrale Verwaltung mit Fotodoku und Checklisten",
                  "Kalender & Abwesenheiten – Konflikte früh erkennen",
                  "Rollen & Rechte für Teams, Subunternehmer, Eigentümer",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 w-5 h-5 shrink-0 text-[#1e4b13]" />
                    <span className="text-white/85 leading-relaxed text-base">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                             bg-[#1e4b13] hover:bg-[#2a6a1b] text-white font-semibold transition-colors
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aa420]"
                >
                  Jetzt starten <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={openContact}
                  className="px-6 py-3 rounded-full border border-white/20 text-white hover:border-white/40"
                >
                  Kontakt aufnehmen
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST / TESTIMONIALS */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Vertrauen entsteht durch Ergebnis
                </h3>
                <p className="mt-4 text-white/70 max-w-xl">
                  Kunden berichten von deutlicher Zeitersparnis, zuverlässigen Übergaben und transparenter Qualität.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {["EU-Server", "SLA 99,9 %", "Rollenbasierte Zugriffe", "Audit-Logs"].map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-xl bg-white/10 text-white border border-white/15 px-4 py-2 text-sm font-medium"
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
                  <blockquote key={t.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <div className="flex items-center gap-1 mb-3" aria-hidden>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-white/90">“{t.quote}”</p>
                    <footer className="mt-3 text-sm text-white/70">
                      {t.name} · {t.role}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 border-t border-white/10">
          <div className="container mx-auto px-6 lg:px-10 max-w-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Bereit, Ihr Reinigungsmanagement auf Turbomodus zu stellen?
            </h3>
            <p className="mt-4 text-white/70">
              Schließen Sie sich Gastgebern an, die CleanFlow für klare Abläufe und saubere Ergebnisse nutzen.
            </p>
            <div className="mt-9 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-sm md:text-base font-semibold rounded-full
                           bg-[#1e4b13] hover:bg-[#2a6a1b] text-white transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aa420]"
              >
                Jetzt starten
              </button>
              <button
                onClick={openContact}
                className="px-8 py-3 text-sm md:text-base font-semibold border border-white/20 text-white hover:border-white/40 rounded-full"
              >
                Kontaktieren Sie uns
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white">
        <div className="container mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/80 text-sm md:text-base font-medium">
            © {new Date().getFullYear()} CleanFlow. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-6 text-sm md:text-base font-semibold">
            <a href="#datenschutz" className="text-white/80 hover:text-white">Datenschutz</a>
            <a href="#impressum" className="text-white/80 hover:text-white">Impressum</a>
            <a href="#agb" className="text-white/80 hover:text-white">AGB</a>
          </div>
        </div>
      </footer>

      {/* KONTAKT-MODAL */}
      {isContactOpen && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeContact} />
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
                    className="w-full px-3 py-2 rounded-md bg-white/5 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Max Mustermann"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Ihre E-Mail</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white/5 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="max@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Nachricht</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 rounded-md bg-white/5 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
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
