// Builds the GitHub Pages site in docs/: a small index.html plus app.js.
// Keeping the page small lets link previews (LinkedIn, iMessage, Slack…) read its title and image.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
import { createHash } from "node:crypto";
const js = readFileSync("www/app.js");
const v = createHash("sha256").update(js).digest("hex").slice(0, 10); // new name each release, so browsers fetch updates
const html = readFileSync("www/index.html", "utf8").replace('<script src="app.js"></script>', () => `<script src="app.js?v=${v}"></script>`);
mkdirSync("docs", { recursive: true });
writeFileSync("docs/index.html", html);
writeFileSync("docs/app.js", js);
writeFileSync("docs/privacy.html", readFileSync("www/privacy.html", "utf8"));
cpSync("www/icons", "docs/icons", { recursive: true });
writeFileSync("docs/manifest.webmanifest", readFileSync("www/manifest.webmanifest", "utf8"));
console.log(`docs/index.html ${(html.length / 1024).toFixed(1)} KB, docs/app.js ${(js.length / 1e6).toFixed(1)} MB (v=${v})`);
