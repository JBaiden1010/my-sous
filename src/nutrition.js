// Optional daily nutrition goal estimate. Rough, general numbers for adults, not medical advice.
//
// References (also listed in the app):
// - Mifflin-St Jeor equation (Am J Clin Nutr, 1990), the default formula on calculator.net's calorie calculator.
// - Katch-McArdle equation, used instead when body fat % is known (calculator.net).
// - Activity multipliers as used by calculator.net (1.2 to 1.9).
// - 1 lb of body weight ≈ 3,500 kcal, so 0.5 / 1 / 2 lb a week ≈ 250 / 500 / 1,000 kcal a day.
// - Floor of 1,200 kcal (women) / 1,500 kcal (men) a day without medical supervision (Harvard Health).
// - Acceptable Macronutrient Distribution Ranges: protein 10–35%, carbs 45–65%, fat 20–35% of calories
//   (National Academies Dietary Reference Intakes; used by Health Canada).
// - Protein RDA 0.8 g/kg; 1.4–2.0 g/kg for people who exercise (International Society of Sports Nutrition).
// - Fibre 14 g per 1,000 kcal (Dietary Guidelines for Americans).
// - Total water about 2.7 L (women) / 3.7 L (men) a day from all drinks and food (National Academies).

export const ACTIVITY = [
  { id: "sedentary", factor: 1.2, protein: 0.8 },
  { id: "light", factor: 1.375, protein: 1.0 },
  { id: "moderate", factor: 1.465, protein: 1.2 },
  { id: "active", factor: 1.55, protein: 1.4 },
  { id: "very-active", factor: 1.725, protein: 1.6 },
  { id: "extra-active", factor: 1.9, protein: 1.8 },
];

// kcal a day added to or taken from maintenance.
export const GOALS = [
  { id: "maintain", delta: 0 },
  { id: "mild-loss", delta: -250 },
  { id: "loss", delta: -500 },
  { id: "mild-gain", delta: 250 },
  { id: "gain", delta: 500 },
];

export const SEXES = ["female", "male", "unspecified"];

const SEX_CONST = { male: 5, female: -161, unspecified: -78 }; // "prefer not to say" uses the average of the two
const FLOOR = { male: 1500, female: 1200, unspecified: 1350 };
const WATER_L = { male: 3.7, female: 2.7, unspecified: 3.2 };

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

// Height in cm and weight in kg from the profile fields (cm or ft/in, kg or lb).
export function bodyFromProfile(p = {}) {
  const heightCm = p.heightUnit === "ft"
    ? (num(p.heightFt) || 0) * 30.48 + (num(p.heightIn) || 0) * 2.54
    : num(p.height);
  const w = num(p.weight);
  const weightKg = p.weightUnit === "lb" ? w * 0.45359237 : w;
  return { age: num(p.age), heightCm: heightCm || NaN, weightKg };
}

// Returns { error } when something is missing or out of range, otherwise the estimate.
export function estimateGoals({ age, sex = "unspecified", heightCm, weightKg, activity = "light", goal = "maintain", bodyFat }) {
  if (!Number.isFinite(age) || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return { error: "missing" };
  if (age < 18) return { error: "adultsOnly" };
  if (age > 100 || heightCm < 120 || heightCm > 230 || weightKg < 35 || weightKg > 250) return { error: "range" };
  const s = SEX_CONST[sex] !== undefined ? sex : "unspecified";
  const act = ACTIVITY.find((a) => a.id === activity) || ACTIVITY[1];
  const g = GOALS.find((x) => x.id === goal) || GOALS[0];

  const bf = num(bodyFat);
  const useKatch = Number.isFinite(bf) && bf >= 4 && bf <= 60;
  const bmr = useKatch
    ? 370 + 21.6 * (1 - bf / 100) * weightKg
    : 10 * weightKg + 6.25 * heightCm - 5 * age + SEX_CONST[s];

  const maintenance = Math.round(bmr * act.factor);
  let calories = maintenance + g.delta;
  const floored = calories < FLOOR[s];
  if (floored) calories = FLOOR[s];
  calories = Math.round(calories / 10) * 10;

  // Protein by body weight, a bit higher while losing or gaining, kept inside 10–35% of calories.
  let gPerKg = act.protein;
  if (g.delta !== 0) gPerKg = Math.max(gPerKg, 1.4);
  let protein = weightKg * gPerKg;
  protein = Math.min(Math.max(protein, (calories * 0.10) / 4), (calories * 0.35) / 4);
  // Fat 30%, carbs fill the rest. If carbs would fall under 45%, trim fat to 25% and then protein.
  const carbsMin = (calories * 0.45) / 4;
  let fat = (calories * 0.30) / 9;
  if ((calories - protein * 4 - fat * 9) / 4 < carbsMin) fat = (calories * 0.25) / 9;
  if ((calories - protein * 4 - fat * 9) / 4 < carbsMin) protein = Math.max((calories * 0.10) / 4, (calories - carbsMin * 4 - fat * 9) / 4);
  protein = Math.round(protein);
  fat = Math.round(fat);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const fibre = Math.round((calories / 1000) * 14);
  const range = (lo, hi, kcalPerG) => [Math.round((calories * lo) / kcalPerG), Math.round((calories * hi) / kcalPerG)];

  return {
    calories, maintenance, bmr: Math.round(bmr), floored, formula: useKatch ? "katch" : "mifflin",
    protein, carbs, fat, fibre, water: WATER_L[s],
    ranges: { protein: range(0.10, 0.35, 4), carbs: range(0.45, 0.65, 4), fat: range(0.20, 0.35, 9) },
  };
}

export const SOURCES = [
  ["Calorie Calculator (Mifflin-St Jeor, Katch-McArdle, activity levels)", "https://www.calculator.net/calorie-calculator.html"],
  ["Mifflin et al., A new predictive equation for resting energy expenditure (1990)", "https://pubmed.ncbi.nlm.nih.gov/2305711/"],
  ["National Academies: Dietary Reference Intakes for Energy and Macronutrients", "https://nap.nationalacademies.org/catalog/10490"],
  ["Health Canada: Dietary Reference Intakes tables", "https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables.html"],
  ["International Society of Sports Nutrition: protein and exercise", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5477153/"],
  ["Dietary Guidelines for Americans 2020–2025 (fibre)", "https://www.dietaryguidelines.gov/"],
  ["Harvard Health: calorie counting made easy", "https://www.health.harvard.edu/staying-healthy/calorie-counting-made-easy"],
];
