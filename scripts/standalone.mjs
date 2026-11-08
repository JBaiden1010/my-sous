// Inlines www/app.js into one self-contained HTML file at docs/index.html
// (the version served by GitHub Pages).
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
const js = readFileSync("www/app.js", "utf8").replace(/<\/script/g, "<\\/script");
const html = readFileSync("www/index.html", "utf8").replace('<script src="app.js"></script>', () => `<script>${js}</script>`);
mkdirSync("docs", { recursive: true });
writeFileSync("docs/index.html", html);
writeFileSync("docs/privacy.html", readFileSync("www/privacy.html", "utf8"));
cpSync("www/icons", "docs/icons", { recursive: true });
writeFileSync("docs/manifest.webmanifest", readFileSync("www/manifest.webmanifest", "utf8"));
console.log(`docs/index.html written (${(html.length / 1e6).toFixed(1)} MB)`);
