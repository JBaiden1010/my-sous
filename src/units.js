// Converts recipe amounts between US units (cups, tbsp, oz, lb, °F, inches)
// and metric (ml, g, kg, °C, cm), in every language the app supports.
// "us" leaves amounts as written, except temperatures, which are shown in °F.

const NUM = "(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?|[¼½¾])";
const RANGE = `${NUM}(?:\\s*[–-]\\s*${NUM})?`;

const parse = (n) => {
  n = String(n).trim().replace(",", ".");
  if (n === "¼") return 0.25; if (n === "½") return 0.5; if (n === "¾") return 0.75;
  const mixed = n.match(/^(\d+)\s+(\d+)\/(\d+)$/); if (mixed) return +mixed[1] + mixed[2] / mixed[3];
  const frac = n.match(/^(\d+)\/(\d+)$/); if (frac) return frac[1] / frac[2];
  return parseFloat(n);
};

// Unit words per language. Order matters: longer phrases first.
const VOLUME = [
  { ml: 15, words: ["tbsp", "tablespoons?", "cdas?\\.?", "cucharadas?", "c\\. à s\\.", "cuillères? à soupe", "colher(?:es)? de sopa", "बड़(?:ा|े) चम्मच", "汤匙", "大勺", "ملعق(?:ة|ات) كبير(?:ة)?", "ملاعق كبيرة"] },
  { ml: 5, words: ["tsp", "teaspoons?", "cdtas?\\.?", "cucharaditas?", "c\\. à c\\.", "cuillères? à café", "colher(?:es)? de chá", "छोट(?:ा|े) चम्मच", "茶匙", "小勺", "ملعق(?:ة|ات) صغير(?:ة)?", "ملاعق صغيرة"] },
  { ml: 30, words: ["fl\\.? ?oz"] },
  { ml: 240, words: ["cups?", "tazas?", "tasses?", "xícaras?", "कप", "杯", "أكواب", "كوب"] },
];
const WEIGHT = [
  { g: 454, words: ["lbs?", "pounds?", "libras?", "livres?", "رطل", "磅", "पाउंड"] },
  { g: 28, words: ["oz", "ounces?", "onzas?", "onces?", "أونصة", "盎司", "औंस"] },
];
const LENGTH = [{ cm: 2.5, words: ["-?inch(?:es)?", "pulgadas?", "pouces?", "polegadas?", "इंच", "英寸", "إنش", "بوصة"] }];

const METRIC = {
  en: { ml: "ml", l: "L", g: "g", kg: "kg", cm: "cm" },
  es: { ml: "ml", l: "L", g: "g", kg: "kg", cm: "cm" },
  fr: { ml: "ml", l: "L", g: "g", kg: "kg", cm: "cm" },
  pt: { ml: "ml", l: "L", g: "g", kg: "kg", cm: "cm" },
  hi: { ml: "मि.ली.", l: "लीटर", g: "ग्राम", kg: "किलो", cm: "सेमी" },
  zh: { ml: "毫升", l: "升", g: "克", kg: "公斤", cm: "厘米" },
  ar: { ml: "مل", l: "لتر", g: "غ", kg: "كغ", cm: "سم" },
};

const roundNice = (v) => (v < 10 ? Math.round(v * 2) / 2 : v < 100 ? Math.round(v / 5) * 5 : v < 1000 ? Math.round(v / 10) * 10 : Math.round(v / 50) * 50);
const fmt = (v, language) => {
  const s = String(+v.toFixed(1));
  return ["fr", "es", "pt"].includes(language) ? s.replace(".", ",") : s;
};
// Usual oven settings, so 400°F shows as 200°C (not 205°C) and back.
const F_TO_C = { 200: 95, 225: 110, 250: 120, 275: 135, 300: 150, 325: 160, 350: 180, 375: 190, 400: 200, 425: 220, 450: 230, 475: 240, 500: 260 };
const C_TO_F = { 95: 200, 100: 210, 110: 225, 120: 250, 130: 265, 135: 275, 140: 285, 150: 300, 160: 325, 165: 325, 170: 340, 175: 350, 180: 350, 190: 375, 200: 400, 210: 410, 220: 425, 230: 450, 240: 475, 250: 480, 260: 500 };
const fToC = (f) => F_TO_C[f] ?? Math.round(((f - 32) * 5) / 9 / 5) * 5;
const cToF = (c) => C_TO_F[c] ?? Math.round(((c * 9) / 5 + 32) / 5) * 5;

function convertGroup(text, groups, factorKey, toUnit, language) {
  const u = METRIC[language] || METRIC.en;
  for (const grp of groups) {
    // a Latin unit word must end there ("lb" but not "lbx"); Chinese has no spaces, so no check
    const re = new RegExp(`${RANGE}\\s*(?:${grp.words.join("|")})(?![a-zA-Z\\u00C0-\\u024F])`, "giu");
    text = text.replace(re, (m, a, b) => {
      const conv = (n) => parse(n) * grp[factorKey];
      const lo = conv(a), hi = b ? conv(b) : null;
      let unit = u[toUnit], div = 1;
      if (toUnit === "ml" && (hi || lo) >= 1000) { unit = u.l; div = 1000; }
      if (toUnit === "g" && (hi || lo) >= 1000) { unit = u.kg; div = 1000; }
      const show = (v) => (div === 1000 ? fmt(Math.round((v / 1000) * 10) / 10, language) : fmt(toUnit === "cm" ? Math.round(v * 2) / 2 : roundNice(v), language));
      const sep = language === "zh" ? "" : " ";
      return hi ? `${show(lo)}–${show(hi)}${sep}${unit}` : `${show(lo)}${sep}${unit}`;
    });
  }
  return text;
}

function convertTemps(text, mode) {
  if (mode === "metric") text = text.replace(/(\d+)\s*°\s*F\b/g, (m, f) => `${fToC(+f)}°C`);
  else text = text.replace(/(\d+)\s*°\s*C\b/g, (m, c) => `${cToF(+c)}°F`);
  // "200°C (200°C)" / "200°C / 200°C" after converting a text that gave both
  return text.replace(/(\d+°[CF])\s*(?:\(\s*\1\s*\)|\/\s*\1)/g, "$1");
}

export function convertUnits(text, mode, language = "en") {
  if (!text || typeof text !== "string") return text;
  if (mode !== "metric") return convertTemps(text, "us");
  let out = convertTemps(text, "metric");
  out = convertGroup(out, VOLUME, "ml", "ml", language);
  out = convertGroup(out, WEIGHT, "g", "g", language);
  out = convertGroup(out, LENGTH, "cm", "cm", language);
  return out;
}
