// Common allergens, found by looking at a recipe's ingredients and (English)
// step text. Optional "flavor boost" extras are not counted. This is a helper, not a guarantee: the app always tells people
// to check packaging.

const strip = (text, words) => words.reduce((t, w) => t.replace(new RegExp(w, "gi"), " "), text);

export const ALLERGENS = [
  { id: "peanuts", emoji: "🥜", find: (t) => /\bpeanut/.test(t) },
  { id: "treenuts", emoji: "🌰", find: (t) => /\b(almond|cashew|walnut|pecan|pistachio|hazelnut|macadamia|brazil nut|pine nut|nutella|praline|marzipan|mixed nuts)/.test(t) },
  {
    id: "dairy", emoji: "🥛",
    find: (t) => /\b(milk|cheese|butter|yogh?urt|cream|ghee|paneer|feta|mozzarella|parmesan|cheddar|ricotta|halloumi|mascarpone|kefir|whey|custard|queso|labneh|lassi|raita|tzatziki|béchamel|alfredo)\b/.test(
      strip(t, ["coconut milk", "almond milk", "oat milk", "soy milk", "rice milk", "coconut cream", "coconut yogh?urt", "peanut butter", "almond butter", "nut butter", "cashew butter", "apple butter", "cocoa butter", "shea butter", "dairy-free \\w+", "vegan \\w+", "ice"])),
  },
  { id: "eggs", emoji: "🥚", find: (t) => /\b(eggs?|egg yolks?|egg whites?|mayonnaise|mayo|meringue|aioli)\b/.test(strip(t, ["eggplants?", "egg-free \\w+", "vegan mayo\\w*"])) },
  {
    id: "gluten", emoji: "🌾",
    find: (t) => /\b(flour|bread|breadcrumbs?|panko|pasta|spaghetti|penne|macaroni|fettuccine|linguine|lasagna|noodles?|tortillas?|pitas?|naan|couscous|bulgur|barley|rye|semolina|wheat|seitan|soy sauce|beer|crackers?|croutons?|bagels?|baguette|buns?|wraps?|pizza|puff pastry|pastry|pie crust|biscuits?|cake|cookies?|ramen|udon|dumplings?|wonton|toast|french toast|pancakes?|waffles?|crepes?|brioche|croissant|graham|granola|oats?|teriyaki|hoisin)\b/.test(
      strip(t, ["rice noodles?", "glass noodles?", "rice paper", "rice flour", "corn tortillas?", "almond flour", "chickpea flour", "cassava flour", "coconut flour", "corn flour", "cornflour", "gluten-free \\w+", "gf \\w+", "tamari", "rice cakes?"])),
  },
  { id: "soy", emoji: "🫘", find: (t) => /\b(soy|soya|tofu|edamame|miso|tempeh|teriyaki|hoisin)\b/.test(t) },
  { id: "fish", emoji: "🐟", find: (t) => /\b(fish|salmon|tuna|cod|tilapia|sardines?|anchov\w*|mackerel|trout|haddock|halibut|snapper|herring|catfish|bonito|worcestershire)\b/.test(t) },
  { id: "shellfish", emoji: "🦐", find: (t) => /\b(shrimps?|prawns?|crabs?|lobsters?|mussels?|clams?|oysters?|scallops?|crawfish|crayfish|oyster sauce)\b/.test(t) },
  { id: "sesame", emoji: "⚪", find: (t) => /\b(sesame|tahini|hummus|halva)\b/.test(t) },
];

export function recipeAllergens(recipe) {
  if (!recipe) return [];
  const text = [
    ...(recipe.ingredients || []),
    ...(recipe.steps || []).map((s) => `${s?.instruction || ""} ${s?.measure || ""}`),
  ].join(" | ").toLowerCase();
  return ALLERGENS.filter((a) => a.find(text)).map((a) => a.id);
}

const cache = new WeakMap();
export function recipeAllergensCached(recipe) {
  if (!recipe || typeof recipe !== "object") return [];
  if (!cache.has(recipe)) cache.set(recipe, recipeAllergens(recipe));
  return cache.get(recipe);
}

// The allergens in this recipe that this person told us about.
export const allergensFor = (recipe, mine) => (mine && mine.length ? recipeAllergensCached(recipe).filter((a) => mine.includes(a)) : []);
