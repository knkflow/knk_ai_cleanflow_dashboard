import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Users,
  LogIn,
  ArrowRight,
  MessageSquare,
  ClipboardCheck,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Star,
} from "lucide-react";

export function Landing() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CleanFlow Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-sm md:text-base tracking-[0.25em] uppercase font-semibold">
              CleanFlow
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-gray-600">
            <button onClick={() => scrollTo(heroRef)} className="hover:text-gray-900">
              Start
            </button>
            <button onClick={() => scrollTo(featuresRef)} className="hover:text-gray-900">
              Lösungen
            </button>
            <button onClick={() => scrollTo(storyRef)} className="hover:text-gray-900">
              Über uns
            </button>
            <button onClick={() => scrollTo(pricingRef)} className="hover:text-gray-900">
              Preise
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={openContact}
              className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Kontakt
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 font-medium"
            >
              <LogIn className="w-4 h-4" />
              Anmelden
            </Link>
          </div>

          <button
            aria-label="Navigation öffnen"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-gray-700"
          >
            <Users className="w-4 h-4" />
            Menü
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-6 lg:px-10 py-4 grid gap-2">
              <button onClick={() => { setMobileOpen(false); scrollTo(heroRef); }} className="py-2 text-left text-gray-700 hover:text-gray-900">Start</button>
              <button onClick={() => { setMobileOpen(false); scrollTo(featuresRef); }} className="py-2 text-left text-gray-700 hover:text-gray-900">Lösungen</button>
              <button onClick={() => { setMobileOpen(false); scrollTo(storyRef); }} className="py-2 text-left text-gray-700 hover:text-gray-900">Über uns</button>
              <button onClick={() => { setMobileOpen(false); scrollTo(pricingRef); }} className="py-2 text-left text-gray-700 hover:text-gray-900">Preise</button>
              <button onClick={() => { setMobileOpen(false); openContact(); }} className="py-2 text-left text-gray-700 hover:text-gray-900">Kontakt</button>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 font-medium">
                <LogIn className="w-4 h-4" />
                Anmelden
              </Link>
            </div>
          </div>
        )}
      </header>
      {/* Rest deiner Seite (Hero, Features usw.) folgt hier */}
    </div>
  );
}
