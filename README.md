# My Sous

An AI-powered cooking companion for students and complete beginners. Tell it what's in your kitchen and it shows meals you can make, then walks you through each one step by step.

**Try it:** open `docs/index.html` in a browser (or turn on GitHub Pages for the `docs` folder).

## Features

- **My Kitchen**: ingredients with quantities, plus the equipment you have. Oils count as interchangeable.
- **Cook**: 216 recipes matched to your kitchen, a search by meal name, and a search by a single ingredient.
- **Guided Cooking**: step-by-step instructions with two checks per step: amounts and time ("1 cup, ~15 min") and what it should look like. Servings scale from 1 to 12, and amounts stay grammatically correct.
- **Cookbook**: favourites, your own recipes, and edited copies of built-in ones.
- **History**: meals you've cooked, with ratings and notes.
- **Accounts**: sign in with an emailed link (Google can be switched on), or continue as a guest. Signed-in cooks have their profile, kitchen, cookbook, history and shopping list saved to the cloud (Supabase); guest data moves into the account the first time they sign in.
- **Community**: tips, recipe feedback with stars, improvement suggestions, short tutorials (link or uploaded video) and shared recipes, shared by everyone. Signed-in cooks post, mark posts helpful and report problems; moderators can remove posts.
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
src/main.jsx         entry point: sign-in screen, cloud or browser storage
src/cloud.jsx        Supabase sign-in, cloud saving and Community storage
supabase/            database notes
src/lucide-shim.js   built-in line icons
src/recipe-images.js recipe photos (embedded JPEGs)
src/world/           African, Brazilian, British and Chinese recipes, and extra translations
www/index.html       page used by `npm run dev` / `npm run build`
docs/index.html      single-file build for GitHub Pages
```

