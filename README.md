# My Sous

An AI-powered cooking companion for students and complete beginners. Tell it what's in your kitchen and it shows meals you can make, then walks you through each one step by step.

**Try it:** open `docs/index.html` in a browser (or turn on GitHub Pages for the `docs` folder).

## Features

- **My Kitchen**: ingredients with quantities, plus the equipment you have. Oils count as interchangeable.
- **Cook**: 216 recipes matched to your kitchen, a search by meal name, and a search by a single ingredient.
- **Guided Cooking**: step-by-step instructions with two checks per step: amounts and time ("1 cup, ~15 min") and what it should look like. Servings scale from 1 to 12, and amounts stay grammatically correct.
- **Cookbook**: favourites, your own recipes, and edited copies of built-in ones.
- **History**: meals you've cooked, with ratings and notes.
- **Community**: tips, recipe feedback with stars, improvement suggestions, short tutorials and shared recipes. When the page runs as a published claude.ai artifact, posts are shared between people. Anywhere else, they stay on the device.
- **Smart Shopping**: a shopping list and store search links.
- **7 languages**: English, Español, Français, Português, हिन्दी, 中文 and العربية. Arabic uses a right-to-left layout, and you pick your language on the first screen.
- Phone and desktop views.

## Run it locally

Requires Node.js 18 or newer.

```
npm install
npm run dev          # http://localhost:8000
npm run build        # minified www/app.js
npm run standalone   # rebuilds docs/index.html as one self-contained file
```

## Project layout

```
src/App.jsx          the app (screens, recipes, translations)
src/main.jsx         entry point; saves data to the browser's localStorage
src/lucide-shim.js   built-in line icons
src/recipe-images.js recipe photos (embedded JPEGs)
src/world/           African, Brazilian, British and Chinese recipes, and extra translations
www/index.html       page used by `npm run dev` / `npm run build`
docs/index.html      single-file build for GitHub Pages
```

This is the single-file prototype. The full version with accounts and Supabase storage is developed separately.
