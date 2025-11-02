// glow.tsx – professionelle Glow-Utilities (TypeScript/React + Tailwind)
import React from "react";

/* =============== Types =============== */
export type Blob = {
  pos: string;       // Tailwind Position (e.g. "top-[-8rem] left-[-6rem]")
  size: string;      // Tailwind Sizes (e.g. "h-[22rem] w-[22rem]")
  gradient: string;  // CSS radial-gradient()
  blur?: string;     // Tailwind blur-x
  opacity?: string;  // Tailwind opacity-x
};

/* =============== Gradient-Helfer ===============
   Einheitliches, seriöses Farbsystem rund um Emerald/Babyblau, plus harmonische Akzente.
   Werte an Sky/Emerald/Teal/Cyan/Indigo/Slate angelehnt, aber neutral/professionell gehalten.
*/
const radial = (rgba: string) =>
  `radial-gradient(closest-side, ${rgba}, transparent 70%)`;

// Basisfamilien (Babyblau/Emerald)
export const sky = {
  light: (a=0.18) => radial(`rgba(125,211,252,${a})`), // sky-300
  soft:  (a=0.20) => radial(`rgba(56,189,248,${a})`),  // sky-400
  deep:  (a=0.12) => radial(`rgba(2,132,199,${a})`),   // sky-600
};

export const emerald = {
  light: (a=0.16) => radial(`rgba(110,231,183,${a})`), // emerald-300
  soft:  (a=0.18) => radial(`rgba(16,185,129,${a})`),  // emerald-500
  deep:  (a=0.12) => radial(`rgba(5,150,105,${a})`),   // emerald-600
};

// Harmonische Zusatz-Familien (dezent, nicht „spielzeughaft“)
export const teal = {
  light: (a=0.14) => radial(`rgba(94,234,212,${a})`),  // teal-300
  deep:  (a=0.10) => radial(`rgba(13,148,136,${a})`),  // teal-600
};
export const cyan = {
  light: (a=0.14) => radial(`rgba(103,232,249,${a})`), // cyan-300
  deep:  (a=0.10) => radial(`rgba(8,145,178,${a})`),   // cyan-600
};
export const indigo = {
  light: (a=0.10) => radial(`rgba(165,180,252,${a})`), // indigo-300
  deep:  (a=0.08) => radial(`rgba(79,70,229,${a})`),   // indigo-600
};
export const slate = {
  haze:  (a=0.10) => radial(`rgba(148,163,184,${a})`), // slate-400
};

/* =============== Utility-Builder ===============
   Kleine Fabrikfunktionen, damit du konsistent Blobs erzeugst.
*/
export function blob(
  pos: string,
  size: string,
  gradient: string,
  opts?: { blur?: string; opacity?: string }
): Blob {
  return {
    pos,
    size,
    gradient,
    blur: opts?.blur,
    opacity: opts?.opacity,
  };
}

// Komfort: gleiche Größe/Blur/Opacity mehrfach verwenden
export function sizedBlobs(
  items: Array<{ pos: string; gradient: string }>,
  size = "h-[22rem] w-[22rem]",
  blur = "blur-3xl",
  opacity = "opacity-80"
): Blob[] {
  return items.map((it) => blob(it.pos, size, it.gradient, { blur, opacity }));
}

/* =============== SectionGlows (dein bestehender Core) =============== */
export const SectionGlows: React.FC<{ blobs: Blob[]; className?: string }> = ({
  blobs,
  className = "",
}) => (
  <div
    aria-hidden
    className={[
      "pointer-events-none absolute inset-0 -z-10 hidden md:block", // -z-10: unter Content, über Section-Hintergrund
      className,
    ].join(" ")}
  >
    {blobs.map((b, i) => (
      <div
        key={i}
        className={[
          "absolute rounded-full",
          b.pos,
          b.size,
          b.blur || "blur-3xl",
          b.opacity || "opacity-80",
        ].join(" ")}
        style={{ background: b.gradient }}
      />
    ))}
  </div>
);

/* =============== Presets je Sektion ===============
   Seriöse Verteilung: 2 große Soft-Glows (sky/emerald) + 1–2 tiefere Akzente.
*/
export const glowPresets = {
  hero: [
    blob("top-[-12rem] left-[-10rem]",  "h-[30rem] w-[30rem]", sky.soft(0.22)),
    blob("bottom-[-14rem] right-[-12rem]","h-[32rem] w-[32rem]", emerald.soft(0.20)),
    blob("top-[20%] right-[-8rem]",     "h-[18rem] w-[18rem]", sky.deep(0.12),   { blur: "blur-2xl" }),
    blob("bottom-[25%] left-[-6rem]",   "h-[16rem] w-[16rem]", emerald.deep(0.10),{ blur: "blur-2xl" }),
  ],
  features: [
    blob("top-[-8rem] right-[-6rem]",   "h-[24rem] w-[24rem]", sky.light(0.16)),
    blob("bottom-[-8rem] left-[-6rem]", "h-[26rem] w-[26rem]", emerald.light(0.14)),
    blob("top-[40%] left-[-5rem]",      "h-[14rem] w-[14rem]", teal.deep(0.10),   { blur: "blur-2xl" }),
    blob("bottom-[35%] right-[-5rem]",  "h-[14rem] w-[14rem]", cyan.deep(0.10),   { blur: "blur-2xl" }),
  ],
  story: [
    blob("top-[-6rem] left-[-6rem]",    "h-[22rem] w-[22rem]", sky.light(0.14),   { opacity: "opacity-70" }),
    blob("bottom-[-8rem] right-[-6rem]","h-[24rem] w-[24rem]", emerald.light(0.12),{ opacity: "opacity-70" }),
    blob("top-[55%] right-[-5rem]",     "h-[14rem] w-[14rem]", indigo.light(0.10),{ blur: "blur-2xl" }),
    blob("bottom-[45%] left-[-5rem]",   "h-[14rem] w-[14rem]", teal.deep(0.10),   { blur: "blur-2xl" }),
  ],
  pricing: [
    blob("top-[-9rem] right-[-7rem]",   "h-[26rem] w-[26rem]", sky.soft(0.16)),
    blob("bottom-[-9rem] left-[-7rem]", "h-[28rem] w-[28rem]", emerald.soft(0.16)),
    blob("top-[35%] left-[-5rem]",      "h-[16rem] w-[16rem]", slate.haze(0.10),  { blur: "blur-2xl" }),
    blob("bottom-[35%] right-[-5rem]",  "h-[16rem] w-[16rem]", indigo.light(0.10),{ blur: "blur-2xl" }),
  ],
  footer: [
    blob("top-[-3rem] left-[-3rem]",    "h-[18rem] w-[18rem]", sky.light(0.12),   { opacity: "opacity-60" }),
    blob("bottom-[-5rem] right-[-4rem]","h-[20rem] w-[20rem]", emerald.light(0.10),{ opacity: "opacity-60" }),
    blob("top-[40%] right-[-4rem]",     "h-[12rem] w-[12rem]", cyan.deep(0.10),   { blur: "blur-xl" }),
    blob("bottom-[40%] left-[-4rem]",   "h-[12rem] w-[12rem]", teal.deep(0.10),   { blur: "blur-xl" }),
  ],
} as const;

/* =============== Card-/Corner-Akzente =============== */
export const CornerAccent: React.FC<{
  tone?: "sky" | "emerald" | "teal" | "cyan" | "indigo";
  className?: string;
  a?: number; // Alpha (optional override)
}> = ({ tone = "sky", className = "", a }) => {
  const toneBg =
    tone === "emerald" ? emerald.soft(a ?? 0.30) :
    tone === "teal"    ? teal.light(a ?? 0.28)   :
    tone === "cyan"    ? cyan.light(a ?? 0.28)   :
    tone === "indigo"  ? indigo.light(a ?? 0.22) :
                         sky.soft(a ?? 0.30);
  return (
    <span
      aria-hidden
      className={[
        "absolute -z-10 h-8 w-8 rounded-full blur-lg opacity-70",
        className,
      ].join(" ")}
      style={{ background: toneBg }}
    />
  );
};

/* =============== Abschnitts-Divider (sehr dezent) =============== */
export const SectionDividers: React.FC<{ top?: boolean; bottom?: boolean; className?: string }> = ({
  top = true,
  bottom = true,
  className = "",
}) => (
  <>
    {top && (
      <div
        className={[
          "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-100 to-transparent",
          className,
        ].join(" ")}
      />
    )}
    {bottom && (
      <div
        className={[
          "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-100 to-transparent",
          className,
        ].join(" ")}
      />
    )}
  </>
);

/* =============== Globale Page-Corner-Glows (optional) =============== */
export const PageCornerGlows: React.FC<{
  showOnMobile?: boolean;
  intensity?: "subtle" | "normal" | "strong";
  diagonal?: "tl-br" | "tr-bl" | "both";
}> = ({ showOnMobile = false, intensity = "normal", diagonal = "both" }) => {
  const base = intensity === "strong" ? 0.24 : intensity === "subtle" ? 0.10 : 0.16;
  const deep = Math.max(base - 0.06, 0.06);

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none fixed inset-0 -z-10",
        showOnMobile ? "" : "hidden md:block",
      ].join(" ")}
    >
      {(diagonal === "tl-br" || diagonal === "both") && (
        <>
          <span className="absolute -top-16 -left-16 h-64 w-64 rounded-full blur-3xl opacity-90" style={{ background: sky.light(base) }} />
          <span className="absolute -top-24 left-24  h-56 w-56 rounded-full blur-3xl opacity-80" style={{ background: emerald.light(base - 0.03) }} />
          <span className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full blur-3xl opacity-80" style={{ background: sky.deep(deep) }} />
          <span className="absolute -bottom-28 right-24   h-60 w-60 rounded-full blur-3xl opacity-80" style={{ background: emerald.deep(deep) }} />
        </>
      )}
      {(diagonal === "tr-bl" || diagonal === "both") && (
        <>
          <span className="absolute -top-16 -right-16 h-60 w-60 rounded-full blur-3xl opacity-80" style={{ background: sky.soft(base - 0.02) }} />
          <span className="absolute -top-24 right-24   h-52 w-52 rounded-full blur-3xl opacity-80" style={{ background: emerald.soft(base - 0.02) }} />
          <span className="absolute -bottom-20 -left-16  h-64 w-64 rounded-full blur-3xl opacity-80" style={{ background: teal.deep(deep) }} />
          <span className="absolute -bottom-28 left-24    h-56 w-56 rounded-full blur-3xl opacity-80" style={{ background: indigo.light(deep) }} />
        </>
      )}
    </div>
  );
};
