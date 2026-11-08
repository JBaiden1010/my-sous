// Appearance and accessibility settings: light/dark mode, text size, a more
// readable font, higher contrast, and reduced motion.
// Settings live in this browser (localStorage "mysous:appearance") and are
// applied as attributes on <html>, which the stylesheet below reads.

export const APPEARANCE_DEFAULTS = { theme: "system", textSize: "default", readableFont: false, highContrast: false, reduceMotion: false, cookingText: "normal" };
const KEY = "mysous:appearance";

// Cups and °F in the US (and a few others), metric everywhere else, until the person picks.
const defaultUnits = () => {
  const loc = (typeof navigator !== "undefined" && navigator.language) || "en-US";
  return /-(US|LR|MM)$/i.test(loc) ? "us" : "metric";
};

export function loadAppearance() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { saved = {}; }
  return { ...APPEARANCE_DEFAULTS, units: defaultUnits(), ...saved };
}

const systemDark = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
export const resolvedTheme = (a) => (a.theme === "dark" || (a.theme === "system" && systemDark()) ? "dark" : "light");

export function applyAppearance(a) {
  if (typeof document === "undefined") return;
  const h = document.documentElement;
  h.dataset.msTheme = resolvedTheme(a);
  h.dataset.msText = a.textSize;
  h.dataset.msFont = a.readableFont ? "readable" : "default";
  h.dataset.msContrast = a.highContrast ? "high" : "normal";
  h.dataset.msMotion = a.reduceMotion ? "reduce" : "normal";
  h.dataset.msCookText = a.cookingText === "large" ? "large" : "normal";
  h.style.colorScheme = h.dataset.msTheme;
}

export function saveAppearance(a) {
  try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* storage blocked */ }
  applyAppearance(a);
}

// Follow the device when "Match device" is chosen.
export function watchSystemTheme(getAppearance) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const fn = () => { const a = getAppearance(); if (a.theme === "system") applyAppearance(a); };
  mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
  return () => (mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn));
}

export const APPEARANCE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');
:root {
  --ms-paper: #F8F5EF; --ms-card: #FFFFFF; --ms-ink: #33352F; --ms-ink-muted: #6A6C63; --ms-line: #E4E0D6;
  --ms-primary: #71866A; --ms-primary-text: #4F6449; --ms-sage: #DCE5D5; --ms-sage-softer: #EBF0E6;
  --ms-accent: #C87955; --ms-accent-text: #9A5232; --ms-accent-soft: #F0DACE; --ms-accent-softer: #F8ECE5;
  --ms-on-ink: #FFFFFF; --ms-shadow: rgba(51,53,47,0.10);
}
:root[data-ms-theme="dark"] {
  --ms-paper: #171915; --ms-card: #22251F; --ms-ink: #ECEAE3; --ms-ink-muted: #A9AB9F; --ms-line: #3A3E35;
  --ms-primary: #6B8163; --ms-primary-text: #B7CBAE; --ms-sage: #34402F; --ms-sage-softer: #2A3226;
  --ms-accent: #D88A66; --ms-accent-text: #EDB08F; --ms-accent-soft: #4D3427; --ms-accent-softer: #3A2A22;
  --ms-on-ink: #171915; --ms-shadow: rgba(0,0,0,0.45);
}
:root[data-ms-contrast="high"] { --ms-ink: #1E1F1B; --ms-ink-muted: #3F413A; --ms-line: #8F8A7E; --ms-primary: #55684F; --ms-primary-text: #33432F; --ms-accent-text: #7A3D20; }
:root[data-ms-theme="dark"][data-ms-contrast="high"] { --ms-ink: #FFFFFF; --ms-ink-muted: #D6D8CE; --ms-line: #7A8070; --ms-primary-text: #D3E6C9; --ms-accent-text: #FFC9AA; }
html, body { background: var(--ms-paper); color: var(--ms-ink); }

/* Text size: scales the content area and the tab bar */
:root[data-ms-text="small"] .ms-screen, :root[data-ms-text="small"] .ms-tabbar, :root[data-ms-text="small"] .ms-auth-body { zoom: 0.9; }
:root[data-ms-text="large"] .ms-screen, :root[data-ms-text="large"] .ms-tabbar, :root[data-ms-text="large"] .ms-auth-body { zoom: 1.15; }
:root[data-ms-text="xl"] .ms-screen, :root[data-ms-text="xl"] .ms-tabbar, :root[data-ms-text="xl"] .ms-auth-body { zoom: 1.3; }

/* Readable font (Atkinson Hyperlegible) with a little extra spacing */
:root[data-ms-font="readable"] .ms-root, :root[data-ms-font="readable"] .ms-root * { font-family: 'Atkinson Hyperlegible', system-ui, sans-serif !important; letter-spacing: 0.01em; }
:root[data-ms-font="readable"] .ms-root p, :root[data-ms-font="readable"] .ms-root li { line-height: 1.65; }

/* Reduced motion: the setting, or the device preference */
:root[data-ms-motion="reduce"] *, :root[data-ms-motion="reduce"] *::before, :root[data-ms-motion="reduce"] *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
@media (prefers-reduced-motion: reduce) { .ms-root *, .ms-root *::before, .ms-root *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }

/* Large text on the cooking screen only */
:root[data-ms-cook-text="large"] .ms-step-text { font-size: 27px !important; line-height: 1.35 !important; }
:root[data-ms-cook-text="large"] .ms-step-detail { font-size: 18px !important; line-height: 1.45 !important; }
:root[data-ms-cook-text="large"] .ms-step-ingredients label { font-size: 17px !important; }

/* Clear focus ring for keyboard users */
.ms-root :focus-visible { outline: 3px solid var(--ms-primary) !important; outline-offset: 2px; border-radius: 8px; }
.ms-skip { position: absolute; left: 12px; top: -60px; z-index: 50; background: var(--ms-ink); color: var(--ms-on-ink); padding: 8px 14px; border-radius: 10px; font-size: 14px; text-decoration: none; }
.ms-skip:focus { top: 12px; }

`;

export function injectAppearanceCss() {
  if (typeof document === "undefined" || document.getElementById("ms-appearance-css")) return;
  const el = document.createElement("style");
  el.id = "ms-appearance-css";
  el.textContent = APPEARANCE_CSS;
  document.head.appendChild(el);
}
