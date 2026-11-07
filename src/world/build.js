// Compact recipe format for the world-cuisine expansion. Each recipe carries
// its own text in all 8 languages, and build() spreads it into the same
// shapes the app already uses: RECIPES entries (English), RECIPE_NAME_TR,
// RECIPE_STEPS_TR and RECIPE_FLAVOR_TR.
//
// R(id, cuisine, emoji, [color1, color2], "N min", categories, mealTime,
//   equipment, ingredients, [kcal, protein, carbs, fat],
//   { en: [name, [[instruction, measure, visual] x3], [boost x3]], es: [...], ... })

export const LANGS = ["es", "fr", "pt", "tw", "hi", "zh", "ar"];

export function R(id, cuisine, emoji, color, time, categories, mealTime, equipment, ingredients, m, tr) {
  return { id, cuisine, emoji, color, time, categories, mealTime, equipment, ingredients, m, tr };
}

const toSteps = (rows) => rows.map(([instruction, measure, visual]) => ({ instruction, measure, visual }));

export function build(list) {
  const recipes = [];
  const names = {};
  const steps = {};
  const flavors = {};
  for (const r of list) {
    const [name, enSteps, enBoosts] = r.tr.en;
    recipes.push({
      id: r.id,
      name,
      emoji: r.emoji,
      color: r.color,
      time: r.time,
      categories: r.categories,
      cuisine: r.cuisine,
      mealTime: r.mealTime,
      equipment: r.equipment,
      ingredients: r.ingredients,
      macros: { calories: r.m[0], protein: r.m[1], carbs: r.m[2], fat: r.m[3] },
      flavorBoosts: enBoosts,
      steps: toSteps(enSteps),
    });
    names[r.id] = {};
    steps[r.id] = {};
    flavors[r.id] = {};
    for (const lang of LANGS) {
      const t = r.tr[lang];
      if (!t) continue;
      names[r.id][lang] = t[0];
      steps[r.id][lang] = toSteps(t[1]);
      flavors[r.id][lang] = t[2];
    }
  }
  return { recipes, names, steps, flavors };
}
