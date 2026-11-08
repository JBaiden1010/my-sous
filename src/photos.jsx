// Picks random recipes that have photos (used by "Get inspired").
import { RECIPE_IMAGES } from "./recipe-images.js";

const IDS = Object.keys(RECIPE_IMAGES);

export function pickRecipeIds(n) {
  const ids = IDS.slice();
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return ids.slice(0, n);
}
