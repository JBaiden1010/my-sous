import React, { useState, useRef, useEffect, useContext, createContext } from "react";
import {
  Refrigerator,
  ChefHat,
  Clock,
  Plus,
  X,
  Check,
  Flame,
  Utensils,
  ArrowLeft,
  Star,
  Search,
  Settings as SettingsIcon,
  RotateCcw,
  Home as HomeIcon,
  Heart,
  BookOpen,
  Users,
  ShoppingCart,
  ChevronRight,
  Award,
  ThumbsUp,
  Globe,
  Pencil,
  Eye,
  Smartphone,
  Monitor,
  Sun,
  Moon,
} from "./lucide-shim.js";
import { RECIPE_IMAGES } from "./recipe-images.js";
import { loadAppearance, saveAppearance, resolvedTheme, watchSystemTheme, injectAppearanceCss, applyAppearance } from "./appearance.js";
import { pickRecipeIds } from "./photos.jsx";
import { build } from "./world/build.js";
import { AFRICAN } from "./world/african.js";
import { BRAZILIAN } from "./world/brazilian.js";
import { BRITISH } from "./world/british.js";
import { CHINESE } from "./world/chinese.js";
import { WORLD_INGREDIENT_TR } from "./world/ingredients.js";
import { INGREDIENT_ZH_AR } from "./world/ingredients-zh-ar.js";
import { FRUIT_TR_1 } from "./world/fruit-tr-1.js";
import { FRUIT_TR_2 } from "./world/fruit-tr-2.js";
import { FRUIT_TR_3 } from "./world/fruit-tr-3.js";

// Fruit recipe translations, reshaped into the same form as RECIPE_STEPS_TR / RECIPE_FLAVOR_TR.
const FRUIT_STEPS_TR = {};
const FRUIT_FLAVOR_TR = {};
for (const [id, langs] of Object.entries({ ...FRUIT_TR_1, ...FRUIT_TR_2, ...FRUIT_TR_3 })) {
  FRUIT_STEPS_TR[id] = {};
  FRUIT_FLAVOR_TR[id] = {};
  for (const [lang, [rows, boosts]] of Object.entries(langs)) {
    FRUIT_STEPS_TR[id][lang] = rows.map(([instruction, measure, visual]) => ({ instruction, measure, visual }));
    FRUIT_FLAVOR_TR[id][lang] = boosts;
  }
}

// World-cuisine expansion: recipes plus their 8-language names, steps and flavor boosts.
const WORLD = build([...AFRICAN, ...BRAZILIAN, ...BRITISH, ...CHINESE]);

const FONT_IMPORT = `[dir="rtl"] .ms-flip { transform: scaleX(-1); }
.ms-desktop .ms-screen > div { max-width: 1120px; margin: 0 auto; padding-left: 32px; padding-right: 32px; }
.ms-desktop div:has(> .ms-recipe-card) { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 12px; }
.ms-desktop div:has(> .ms-recipe-card) > .ms-recipe-card { margin-bottom: 0 !important; }
.ms-desktop .ms-more-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; max-width: 980px; }
.ms-desktop .ms-more-grid > button { border: 1px solid var(--ms-line) !important; border-radius: 14px; padding: 16px !important; background: var(--ms-card) !important; transition: border-color .15s, box-shadow .15s; }
.ms-inspire-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px; }
.ms-desktop .ms-inspire-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; max-width: 980px; }
.ms-inspire-tile { position: relative; aspect-ratio: 4 / 3; border: none; border-radius: 14px; background-size: cover; background-position: center; cursor: pointer; overflow: hidden; display: flex; align-items: flex-end; padding: 10px 12px; text-align: start; transition: transform .15s; }
.ms-inspire-tile:hover { transform: translateY(-2px); }
.ms-inspire-tile span { color: #fff; font-weight: 600; font-size: 14px; line-height: 1.25; text-shadow: 0 1px 3px rgba(0,0,0,0.5); font-family: 'Inter', sans-serif; }
.ms-desktop .ms-more-grid > button:hover { border-color: var(--ms-primary) !important; box-shadow: 0 2px 10px rgba(51,53,47,0.06); }
@media (max-width: 700px) { .ms-desktop .ms-screen > div { padding-left: 16px; padding-right: 16px; } }
.ms-desktop .ms-header { flex-wrap: wrap; row-gap: 8px; }
@media (max-width: 820px) { .ms-desktop .ms-nav { order: 3; width: 100%; overflow-x: auto; margin-inline-end: 0 !important; } }
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
@keyframes sousTypingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }`;

// Palette: warm cream + sage green + terracotta.
// Fills use the palette exactly; *Text variants are deeper shades of the same
// hue so small text stays readable (4.5:1) on cream and light tints.
const COLORS = {
  paper: "var(--ms-paper)",               // cream: app background
  card: "var(--ms-card)",
  ink: "var(--ms-ink)",                   // charcoal: text
  inkMuted: "var(--ms-ink-muted)",
  line: "var(--ms-line)",
  primary: "var(--ms-primary)",           // forest sage: buttons and navigation
  primaryText: "var(--ms-primary-text)",
  sage: "var(--ms-sage)",                 // sage: secondary sections
  sageSofter: "var(--ms-sage-softer)",
  accent: "var(--ms-accent)",             // terracotta: accents and highlights
  accentText: "var(--ms-accent-text)",
  accentSoft: "var(--ms-accent-soft)",
  accentSofter: "var(--ms-accent-softer)",
  onInk: "var(--ms-on-ink)",              // text on an ink-coloured background
};

const EQUIPMENT = [
  { id: "stove", label: "Stove" },
  { id: "oven", label: "Oven" },
  { id: "microwave", label: "Microwave" },
  { id: "pot", label: "Pot" },
  { id: "pan", label: "Pan" },
  { id: "fridge", label: "Mini fridge" },
  { id: "air-fryer", label: "Air fryer" },
];

const BASICS = [
  { id: "salt", label: "Salt" },
  { id: "pepper", label: "Pepper" },
  { id: "oil", label: "Cooking oil" },
  { id: "butter", label: "Butter" },
];
const BASIC_IDS = BASICS.map((b) => b.id);

const CATEGORIES = [
  { id: "high-protein", label: "High Protein", emoji: "💪" },
  { id: "low-calorie", label: "Low Calorie", emoji: "🥗" },
  { id: "budget-friendly", label: "Budget Friendly", emoji: "💰" },
  { id: "quick-easy", label: "Quick & Easy", emoji: "⚡" },
  { id: "beginner-friendly", label: "Beginner Friendly", emoji: "👨‍🍳" },
  { id: "high-carb", label: "High Carb", emoji: "🍚" },
  { id: "healthy-balanced", label: "Healthy & Balanced", emoji: "🥑" },
  { id: "vegetarian", label: "Vegetarian", emoji: "🌱" },
  { id: "vegan", label: "Vegan", emoji: "🌿" },
  { id: "high-fiber", label: "High Fiber", emoji: "🍗" },
  { id: "low-carb", label: "Low Carb", emoji: "🥩" },
  { id: "meal-prep", label: "Meal Prep", emoji: "🍱" },
  { id: "fruit", label: "Fruit", emoji: "🍓" },
];

const DIETARY_QUICK = ["vegetarian", "vegan", "low-carb", "high-protein", "high-fiber", "budget-friendly"];

const MEAL_TIMES = [
  { id: "breakfast", emoji: "🍳" },
  { id: "lunch", emoji: "🥪" },
  { id: "dinner", emoji: "🍽️" },
  { id: "snack", emoji: "🍿" },
];

const MEAL_TIMES_TR = {
  breakfast: { en: "Breakfast", es: "Desayuno", fr: "Petit-déjeuner", pt: "Café da manhã", hi: "नाश्ता", zh: "早餐", ar: "إفطار" },
  lunch: { en: "Lunch", es: "Almuerzo", fr: "Déjeuner", pt: "Almoço", hi: "दोपहर का भोजन", zh: "午餐", ar: "غداء" },
  dinner: { en: "Dinner", es: "Cena", fr: "Dîner", pt: "Jantar", hi: "रात का खाना", zh: "晚餐", ar: "عشاء" },
  snack: { en: "Snack", es: "Merienda", fr: "Collation", pt: "Lanche", hi: "नाश्ता (स्नैक)", zh: "零食", ar: "وجبة خفيفة" },
};

const CUISINES = [
  { id: "ghanaian", label: "Ghanaian" },
  { id: "italian", label: "Italian" },
  { id: "mexican", label: "Mexican" },
  { id: "asian", label: "Asian" },
  { id: "american", label: "American" },
  { id: "indian", label: "Indian" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "caribbean", label: "Caribbean" },
  { id: "thai", label: "Thai" },
  { id: "chinese", label: "Chinese" },
  { id: "korean", label: "Korean" },
  { id: "french", label: "French" },
  { id: "japanese", label: "Japanese" },
  { id: "vietnamese", label: "Vietnamese" },
  { id: "middle-eastern", label: "Middle Eastern" },
  { id: "ethiopian", label: "Ethiopian" },
  { id: "spanish", label: "Spanish" },
  { id: "brazilian", label: "Brazilian" },
  { id: "british", label: "British" },
  { id: "african", label: "African" },
];

const WEIGHT_GOALS = [
  { id: "no-track", label: "I'd rather not track calories or weight", delta: 0 },
  { id: "maintain", label: "Maintain weight", delta: 0 },
  { id: "mild-loss", label: "Mild weight loss of 0.5 lb (0.25 kg) per week", delta: -250 },
  { id: "loss", label: "Weight loss of 1 lb (0.5 kg) per week", delta: -500 },
  { id: "extreme-loss", label: "Extreme weight loss of 2 lb (1 kg) per week", delta: -1000, caution: true },
  { id: "mild-gain", label: "Mild weight gain of 0.5 lb (0.25 kg) per week", delta: 250 },
  { id: "gain", label: "Weight gain of 1 lb (0.5 kg) per week", delta: 500 },
  { id: "extreme-gain", label: "Extreme weight gain of 2 lb (1 kg) per week", delta: 1000, caution: true },
];

const BIOLOGICAL_SEX = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "unspecified", label: "Prefer not to say" },
];

const COOKING_GOALS = [
  { id: "cant-cook", label: "Can't cook", emoji: "😅" },
  { id: "just-ideas", label: "Just need ideas", emoji: "💡" },
];

const ACTIVITY_LEVELS = [
  { id: "bmr", label: "Basal Metabolic Rate (BMR)", factor: 1.0 },
  { id: "sedentary", label: "Sedentary: little or no exercise", factor: 1.2 },
  { id: "light", label: "Light: exercise 1–3 times/week", factor: 1.375 },
  { id: "moderate", label: "Moderate: exercise 4–5 times/week", factor: 1.55 },
  { id: "active", label: "Active: daily exercise or intense exercise 3–4 times/week", factor: 1.725 },
  { id: "very-active", label: "Very Active: intense exercise 6–7 times/week", factor: 1.9 },
  { id: "extra-active", label: "Extra Active: very intense exercise daily, or physical job", factor: 2.1 },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "zh", label: "中文 (Mandarin)" },
  { id: "hi", label: "हिन्दी (Hindi)" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
  { id: "ar", label: "العربية (Arabic)" },
  { id: "pt", label: "Português" },
];

const COOKING_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const BEGINNER_TIPS = [
  "Read the whole recipe once before you start — no surprises halfway through.",
  "Taste as you go. It's the fastest way to learn what \"enough\" salt actually looks like.",
  "A dull knife is more dangerous than a sharp one — it slips instead of cutting.",
  "Let meat rest a few minutes after cooking — the juices redistribute instead of running out.",
  "Prep all your ingredients before turning on the heat. It makes everything less stressful.",
];

// Core app chrome only — recipe content, categories, and community posts stay in
// English since translating those well needs a real localization pass, not guesses.
const TRANSLATIONS = {
  home: { en: "Home", es: "Inicio", fr: "Accueil", pt: "Início", hi: "होम", zh: "首页", ar: "الرئيسية", ru: "Главная", ta: "முகப்பு" },
  kitchen: { en: "Kitchen", es: "Cocina", fr: "Cuisine", pt: "Cozinha", hi: "रसोई", zh: "厨房", ar: "المطبخ", ru: "Кухня", ta: "சமையலறை" },
  cook: { en: "Cook", es: "Cocinar", fr: "Cuisiner", pt: "Cozinhar", hi: "पकाएं", zh: "烹饪", ar: "طبخ", ru: "Готовить", ta: "சமை" },
  sousChef: { en: "Sous-Chef", es: "Sous-Chef", fr: "Sous-Chef", pt: "Sous-Chef", hi: "सू-शेफ", zh: "副厨师", ar: "مساعد الطاهي", ru: "Су-шеф", ta: "உதவி சமையல்காரர்" },
  more: { en: "More", es: "Más", fr: "Plus", pt: "Mais", hi: "अधिक", zh: "更多", ar: "المزيد", ru: "Ещё", ta: "மேலும்" },

  homeGreetingFallback: { en: "Welcome back", es: "Bienvenido de nuevo", fr: "Content de vous revoir", pt: "Bem-vindo de volta", hi: "वापसी पर स्वागत है", zh: "欢迎回来", ar: "مرحبًا بعودتك" },
  homeSubtitle: { en: "What can I do today?", es: "¿Qué puedo hacer hoy?", fr: "Que puis-je faire aujourd'hui ?", pt: "O que posso fazer hoje?", hi: "आज मैं क्या कर सकता हूँ?", zh: "今天我能做什么？", ar: "ماذا يمكنني أن أفعل اليوم؟" },
  ingredientsLabel: { en: "ingredients", es: "ingredientes", fr: "ingrédients", pt: "ingredientes", hi: "सामग्री", zh: "食材", ar: "مكونات" },
  toolsReady: { en: "tools ready", es: "herramientas listas", fr: "outils prêts", pt: "ferramentas prontas", hi: "उपकरण तैयार", zh: "已备好的工具", ar: "أدوات جاهزة" },
  readyToCookLabel: { en: "ready to cook", es: "listo para cocinar", fr: "prêt à cuisiner", pt: "pronto para cozinhar", hi: "पकाने के लिए तैयार", zh: "可以烹饪", ar: "جاهز للطبخ" },
  askSousChef: { en: "Ask the Sous-Chef", es: "Pregúntale al Sous-Chef", fr: "Demander au Sous-Chef", pt: "Pergunte ao Sous-Chef", hi: "सू-शेफ से पूछें", zh: "询问副厨师", ar: "اسأل مساعد الطاهي" },
  beginnerTipLabel: { en: "Beginner tip", es: "Consejo para principiantes", fr: "Astuce débutant", pt: "Dica para iniciantes", hi: "शुरुआती सलाह", zh: "新手小贴士", ar: "نصيحة للمبتدئين" },
  recommendedForYou: { en: "Recommended for you", es: "Recomendado para ti", fr: "Recommandé pour vous", pt: "Recomendado para você", hi: "आपके लिए अनुशंसित", zh: "为你推荐", ar: "موصى به لك" },
  recentlyCooked: { en: "Recently cooked", es: "Cocinado recientemente", fr: "Cuisiné récemment", pt: "Cozinhado recentemente", hi: "हाल ही में बनाया गया", zh: "最近做过的菜", ar: "طُبخ مؤخرًا" },

  kitchenTitleFallback: { en: "My Kitchen", es: "Mi Cocina", fr: "Ma Cuisine", pt: "Minha Cozinha", hi: "मेरी रसोई", zh: "我的厨房", ar: "مطبخي", ru: "Моя кухня", ta: "எனது சமையலறை" },
  kitchenSubtitle: { en: "What do you have right now?", es: "¿Qué tienes ahora mismo?", fr: "Qu'avez-vous sous la main ?", pt: "O que você tem agora?", hi: "अभी आपके पास क्या है?", zh: "你现在有什么食材？", ar: "ماذا لديك الآن؟", ru: "Что у вас есть прямо сейчас?", ta: "இப்போது உங்களிடம் என்ன இருக்கிறது?" },
  todaysTarget: { en: "Today's rough target", es: "Tu objetivo aproximado de hoy", fr: "Votre objectif approximatif du jour", pt: "Sua meta aproximada de hoje", hi: "आज का अनुमानित लक्ष्य", zh: "今日大致目标", ar: "هدفك التقريبي لليوم" },
  readyBadgeLabel: { en: "Ready", es: "Listo", fr: "Prêt", pt: "Pronto", hi: "तैयार", zh: "可以做", ar: "جاهز", ru: "Готово", ta: "தயார்" },
  missingBadgeLabel: { en: "Missing", es: "Falta", fr: "Manque", pt: "Faltando", hi: "गायब", zh: "缺少", ar: "ناقص", ru: "Не хватает", ta: "இல்லை" },
  missingPrefixLabel: { en: "Missing", es: "Falta", fr: "Manque", pt: "Faltando", hi: "गायब है", zh: "缺少", ar: "ناقص" },
  missingEquipmentPrefix: { en: "Missing equipment", es: "Equipo faltante", fr: "Matériel manquant", pt: "Equipamento faltando", hi: "गायब उपकरण", zh: "缺少的厨具", ar: "معدات ناقصة" },
  needsEquipmentLabel: { en: "Needs equipment you haven't added.", es: "Necesita equipo que no has añadido.", fr: "Nécessite du matériel que vous n'avez pas ajouté.", pt: "Precisa de equipamento que você não adicionou.", hi: "उपकरण चाहिए जो आपने नहीं जोड़ा है।", zh: "需要你尚未添加的厨具。", ar: "يحتاج إلى معدات لم تضفها بعد." },
  equipmentLabel: { en: "Equipment", es: "Equipo", fr: "Équipement", pt: "Equipamento", hi: "उपकरण", zh: "厨具", ar: "المعدات" },
  basicsLabel: { en: "Basics", es: "Básicos", fr: "Essentiels", pt: "Básicos", hi: "आवश्यक चीज़ें", zh: "常备调料", ar: "الأساسيات" },
  ingredientsSectionLabel: { en: "Ingredients", es: "Ingredientes", fr: "Ingrédients", pt: "Ingredientes", hi: "सामग्री", zh: "食材", ar: "المكونات" },
  addIngredientPlaceholder: { en: "Add an ingredient…", es: "Añadir un ingrediente…", fr: "Ajouter un ingrédient…", pt: "Adicionar um ingrediente…", hi: "सामग्री जोड़ें…", zh: "添加一种食材…", ar: "أضف مكونًا…" },

  cookTitle: { en: "Cook", es: "Cocinar", fr: "Cuisiner", pt: "Cozinhar", hi: "पकाएं", zh: "烹饪", ar: "طبخ", ru: "Готовить", ta: "சமை" },
  byIngredient: { en: "By ingredient", es: "Por ingrediente", fr: "Par ingrédient", pt: "Por ingrediente", hi: "सामग्री से", zh: "按食材", ar: "حسب المكوّن" },
  ingredientSearchSubtitle: { en: "Type one ingredient to see every recipe that uses it.", es: "Escribe un ingrediente para ver todas las recetas que lo usan.", fr: "Tapez un ingrédient pour voir toutes les recettes qui l'utilisent.", pt: "Digite um ingrediente para ver todas as receitas que o usam.", hi: "एक सामग्री लिखें और वे सभी रेसिपी देखें जिनमें यह इस्तेमाल होती है।", zh: "输入一种食材，查看所有用到它的菜谱。", ar: "اكتب مكوّنًا واحدًا لترى كل الوصفات التي تستخدمه." },
  ingredientSearchPlaceholder: { en: "e.g. banana, chicken, rice", es: "p. ej. plátano, pollo, arroz", fr: "ex. banane, poulet, riz", pt: "ex. banana, frango, arroz", hi: "जैसे केला, चिकन, चावल", zh: "例如：香蕉、鸡肉、米饭", ar: "مثل: موز، دجاج، أرز" },
  recipesWithLabel: { en: "Recipes with", es: "Recetas con", fr: "Recettes avec", pt: "Receitas com", hi: "इसके साथ रेसिपी", zh: "包含该食材的菜谱", ar: "وصفات تحتوي على" },
  noIngredientMatch: { en: "No recipes use that ingredient yet. Try a simpler word, like \"berry\" instead of \"blueberries\".", es: "Ninguna receta usa ese ingrediente todavía. Prueba una palabra más simple.", fr: "Aucune recette n'utilise encore cet ingrédient. Essayez un mot plus simple.", pt: "Nenhuma receita usa esse ingrediente ainda. Tente uma palavra mais simples.", hi: "अभी कोई रेसिपी इस सामग्री का उपयोग नहीं करती। कोई सरल शब्द आज़माएं।", zh: "还没有菜谱使用这种食材。试试更简单的词。", ar: "لا توجد وصفات تستخدم هذا المكوّن بعد. جرّب كلمة أبسط." },
  fromYourKitchenTap: { en: "Or tap something you already have", es: "O toca algo que ya tienes", fr: "Ou touchez quelque chose que vous avez déjà", pt: "Ou toque em algo que você já tem", hi: "या जो आपके पास पहले से है उस पर टैप करें", zh: "或点选你已有的食材", ar: "أو اضغط على شيء لديك بالفعل" },
  viewPhone: { en: "Phone", es: "Móvil", fr: "Mobile", pt: "Celular", hi: "फ़ोन", zh: "手机", ar: "هاتف" },
  viewDesktop: { en: "Desktop", es: "Escritorio", fr: "Ordinateur", pt: "Computador", hi: "डेस्कटॉप", zh: "电脑", ar: "سطح المكتب" },
  toastAddedKitchen: { en: "Added to My Kitchen", es: "Añadido a Mi cocina", fr: "Ajouté à Ma cuisine", pt: "Adicionado à Minha cozinha", hi: "मेरी रसोई में जोड़ा गया", zh: "已加入我的厨房", ar: "أُضيف إلى مطبخي" },
  toastSavedCookbook: { en: "Recipe saved to your Cookbook", es: "Receta guardada en tu recetario", fr: "Recette enregistrée dans votre carnet", pt: "Receita salva no seu livro de receitas", hi: "रेसिपी आपकी कुकबुक में सहेजी गई", zh: "菜谱已保存到你的食谱本", ar: "حُفظت الوصفة في كتاب وصفاتك" },
  toastSharedCommunity: { en: "Shared to Community", es: "Compartido en la comunidad", fr: "Partagé avec la communauté", pt: "Compartilhado na comunidade", hi: "कम्युनिटी में साझा किया गया", zh: "已分享到社区", ar: "تمت المشاركة في المجتمع" },
  toastAddedHistory: { en: "added to History", es: "añadido al historial", fr: "ajouté à l'historique", pt: "adicionado ao histórico", hi: "इतिहास में जोड़ा गया", zh: "已加入历史记录", ar: "أُضيف إلى السجل" },
  toastProfileUpdated: { en: "Profile updated", es: "Perfil actualizado", fr: "Profil mis à jour", pt: "Perfil atualizado", hi: "प्रोफ़ाइल अपडेट हुई", zh: "资料已更新", ar: "تم تحديث الملف الشخصي" },
  toastKitchenCleared: { en: "Kitchen cleared", es: "Cocina vaciada", fr: "Cuisine vidée", pt: "Cozinha esvaziada", hi: "रसोई खाली की गई", zh: "厨房已清空", ar: "تم إفراغ المطبخ" },
  communityEmpty: { en: "Nothing here yet. Be the first to share.", es: "Aún no hay nada. Sé el primero en compartir.", fr: "Rien pour l'instant. Soyez le premier à partager.", pt: "Nada por aqui ainda. Seja o primeiro a compartilhar.", hi: "अभी यहां कुछ नहीं है। सबसे पहले साझा करें।", zh: "这里还没有内容，来做第一个分享的人吧。", ar: "لا يوجد شيء بعد. كن أول من يشارك." },
  youLabel: { en: "You", es: "Tú", fr: "Vous", pt: "Você", hi: "आप", zh: "你", ar: "أنت" },
  noStepsYet: { en: "This recipe doesn't have any steps yet. Edit it in your Cookbook to add some.", es: "Esta receta aún no tiene pasos. Edítala en tu recetario para añadirlos.", fr: "Cette recette n'a pas encore d'étapes. Modifiez-la dans votre carnet pour en ajouter.", pt: "Esta receita ainda não tem passos. Edite-a no seu livro de receitas para adicioná-los.", hi: "इस रेसिपी में अभी कोई स्टेप नहीं है। जोड़ने के लिए इसे अपनी कुकबुक में एडिट करें।", zh: "这个菜谱还没有步骤。去你的食谱本编辑并添加步骤。", ar: "لا تحتوي هذه الوصفة على خطوات بعد. عدّلها في كتاب وصفاتك لإضافة خطوات." },
  saveNeedsHint: { en: "Add a name, at least one ingredient and at least one step to save.", es: "Añade un nombre, al menos un ingrediente y al menos un paso para guardar.", fr: "Ajoutez un nom, au moins un ingrédient et au moins une étape pour enregistrer.", pt: "Adicione um nome, pelo menos um ingrediente e pelo menos um passo para salvar.", hi: "सहेजने के लिए नाम, कम से कम एक सामग्री और एक स्टेप जोड़ें।", zh: "需要名称、至少一种食材和至少一个步骤才能保存。", ar: "أضف اسمًا ومكوّنًا واحدًا على الأقل وخطوة واحدة على الأقل للحفظ." },
  errorTitle: { en: "Something went wrong on this screen.", es: "Algo salió mal en esta pantalla.", fr: "Un problème est survenu sur cet écran.", pt: "Algo deu errado nesta tela.", hi: "इस स्क्रीन पर कुछ गड़बड़ हो गई।", zh: "此页面出现了问题。", ar: "حدث خطأ في هذه الشاشة." },
  errorBody: { en: "Your saved kitchen, recipes and history are safe.", es: "Tu cocina, recetas e historial guardados están a salvo.", fr: "Votre cuisine, vos recettes et votre historique sont en sécurité.", pt: "Sua cozinha, receitas e histórico salvos estão seguros.", hi: "आपकी सहेजी गई रसोई, रेसिपी और इतिहास सुरक्षित हैं।", zh: "你保存的厨房、菜谱和历史记录都安全。", ar: "مطبخك ووصفاتك وسجلك المحفوظ بأمان." },
  errorGoHome: { en: "Go to Home", es: "Ir al inicio", fr: "Aller à l'accueil", pt: "Ir para o início", hi: "होम पर जाएँ", zh: "返回首页", ar: "الذهاب إلى الرئيسية" },
  accountLabel: { en: "Account", es: "Cuenta", fr: "Compte", pt: "Conta", hi: "खाता", zh: "账户", ar: "الحساب" },
  guestLabel: { en: "Guest", es: "Invitado", fr: "Invité", pt: "Convidado", hi: "मेहमान", zh: "访客", ar: "ضيف" },
  accountSavedNote: { en: "Your kitchen, cookbook and history are saved to your account.", es: "Tu cocina, recetario e historial se guardan en tu cuenta.", fr: "Votre cuisine, vos recettes et votre historique sont enregistrés dans votre compte.", pt: "Sua cozinha, receitas e histórico ficam salvos na sua conta.", hi: "आपकी रसोई, कुकबुक और इतिहास आपके खाते में सेव हैं।", zh: "你的厨房、食谱本和历史记录已保存到账户。", ar: "مطبخك ووصفاتك وسجلك محفوظة في حسابك." },
  guestSavedNote: { en: "Saved on this device only. Sign in to keep it everywhere.", es: "Guardado solo en este dispositivo. Inicia sesión para tenerlo en todas partes.", fr: "Enregistré sur cet appareil uniquement. Connectez-vous pour le retrouver partout.", pt: "Salvo só neste dispositivo. Entre para ter em todo lugar.", hi: "सिर्फ़ इस डिवाइस पर सेव है। हर जगह रखने के लिए साइन इन करें।", zh: "仅保存在本设备上。登录后可在任何设备使用。", ar: "محفوظ على هذا الجهاز فقط. سجّل الدخول للاحتفاظ به في كل مكان." },
  signInLabel: { en: "Sign in", es: "Iniciar sesión", fr: "Se connecter", pt: "Entrar", hi: "साइन इन", zh: "登录", ar: "تسجيل الدخول" },
  signOutLabel: { en: "Sign out", es: "Cerrar sesión", fr: "Se déconnecter", pt: "Sair", hi: "साइन आउट", zh: "退出登录", ar: "تسجيل الخروج" },
  communitySignIn: { en: "Sign in to post, rate recipes and share tutorials.", es: "Inicia sesión para publicar, calificar recetas y compartir tutoriales.", fr: "Connectez-vous pour publier, noter des recettes et partager des tutoriels.", pt: "Entre para publicar, avaliar receitas e compartilhar tutoriais.", hi: "पोस्ट करने, रेसिपी रेट करने और ट्यूटोरियल साझा करने के लिए साइन इन करें।", zh: "登录后即可发帖、评分和分享教程。", ar: "سجّل الدخول للنشر وتقييم الوصفات ومشاركة الدروس." },
  reportLabel: { en: "Report", es: "Reportar", fr: "Signaler", pt: "Denunciar", hi: "रिपोर्ट करें", zh: "举报", ar: "إبلاغ" },
  reportedThanks: { en: "Reported. Thanks", es: "Reportado. Gracias", fr: "Signalé. Merci", pt: "Denunciado. Obrigado", hi: "रिपोर्ट हो गया। धन्यवाद", zh: "已举报，谢谢", ar: "تم الإبلاغ. شكرًا" },
  reportedLabel: { en: "Reported", es: "Reportado", fr: "Signalé", pt: "Denunciado", hi: "रिपोर्ट किया गया", zh: "被举报", ar: "مُبلَّغ عنه" },
  privacyBodyNote: { en: "Private to you. Age, height and weight are only used to estimate your nutrition targets and are never shown to other cooks. Leave them blank if you prefer.", es: "Solo para ti. La edad, la altura y el peso solo se usan para estimar tus metas de nutrición y nunca se muestran a otros cocineros. Puedes dejarlos en blanco.", fr: "Visible par vous seul. L'âge, la taille et le poids servent uniquement à estimer vos objectifs nutritionnels et ne sont jamais montrés aux autres cuisiniers. Vous pouvez les laisser vides.", pt: "Só você vê. Idade, altura e peso servem apenas para estimar suas metas de nutrição e nunca são mostrados a outros cozinheiros. Pode deixar em branco.", hi: "सिर्फ़ आपके लिए। उम्र, लंबाई और वज़न का इस्तेमाल सिर्फ़ आपके पोषण लक्ष्य का अनुमान लगाने के लिए होता है और ये दूसरे रसोइयों को कभी नहीं दिखते। चाहें तो इन्हें खाली छोड़ दें।", zh: "仅你可见。年龄、身高和体重只用于估算你的营养目标，绝不会展示给其他厨师。也可以不填。", ar: "خاص بك. يُستخدم العمر والطول والوزن فقط لتقدير أهدافك الغذائية ولا تظهر أبدًا للطهاة الآخرين. يمكنك تركها فارغة." },
  privacyLabel: { en: "Privacy", es: "Privacidad", fr: "Confidentialité", pt: "Privacidade", hi: "गोपनीयता", zh: "隐私", ar: "الخصوصية" },
  privacyPoint1: { en: "Your kitchen, cookbook, history, shopping list and body details are private. Only you can see them.", es: "Tu cocina, recetario, historial, lista de compras y datos corporales son privados. Solo tú puedes verlos.", fr: "Votre cuisine, vos recettes, votre historique, votre liste de courses et vos mensurations sont privés. Vous seul pouvez les voir.", pt: "Sua cozinha, receitas, histórico, lista de compras e dados do corpo são privados. Só você pode vê-los.", hi: "आपकी रसोई, कुकबुक, इतिहास, शॉपिंग लिस्ट और शरीर की जानकारी निजी है। इन्हें सिर्फ़ आप देख सकते हैं।", zh: "你的厨房、食谱本、历史记录、购物清单和身体数据都是私密的，只有你能看到。", ar: "مطبخك ووصفاتك وسجلك وقائمة مشترياتك وبيانات جسمك خاصة. أنت فقط من يمكنه رؤيتها." },
  privacyPoint2: { en: "What you post in the Community (tips, ratings, videos, shared recipes) is public, with your display name. Your email is never shown.", es: "Lo que publicas en la Comunidad (consejos, calificaciones, videos, recetas) es público, con tu nombre. Tu correo nunca se muestra.", fr: "Ce que vous publiez dans la Communauté (astuces, notes, vidéos, recettes) est public, avec votre nom. Votre e-mail n'est jamais affiché.", pt: "O que você publica na Comunidade (dicas, avaliações, vídeos, receitas) é público, com seu nome. Seu e-mail nunca aparece.", hi: "कम्युनिटी में आप जो पोस्ट करते हैं (टिप्स, रेटिंग, वीडियो, रेसिपी) वह आपके नाम के साथ सार्वजनिक होता है। आपका ईमेल कभी नहीं दिखता।", zh: "你在社区发布的内容（技巧、评分、视频、食谱）会以你的显示名公开，邮箱永远不会显示。", ar: "ما تنشره في المجتمع (نصائح وتقييمات وفيديوهات ووصفات) يكون علنيًا باسمك الظاهر. لا يظهر بريدك أبدًا." },
  privacyPoint3: { en: "My Sous doesn't sell your data or show ads. It's only used to run the app.", es: "My Sous no vende tus datos ni muestra anuncios. Solo se usan para que la app funcione.", fr: "My Sous ne vend pas vos données et n'affiche pas de publicités. Elles servent uniquement au fonctionnement de l'app.", pt: "O My Sous não vende seus dados nem mostra anúncios. Eles só servem para o app funcionar.", hi: "My Sous आपका डेटा नहीं बेचता और विज्ञापन नहीं दिखाता। इसका इस्तेमाल सिर्फ़ ऐप चलाने के लिए होता है।", zh: "My Sous 不出售你的数据，也不展示广告，数据只用于运行应用。", ar: "لا يبيع My Sous بياناتك ولا يعرض إعلانات. تُستخدم فقط لتشغيل التطبيق." },
  privacyPoint4Account: { en: "Your data is stored securely with Supabase in Canada. You can delete your account and everything in it at any time.", es: "Tus datos se guardan de forma segura con Supabase en Canadá. Puedes eliminar tu cuenta y todo su contenido cuando quieras.", fr: "Vos données sont stockées en sécurité chez Supabase, au Canada. Vous pouvez supprimer votre compte et tout son contenu à tout moment.", pt: "Seus dados ficam guardados com segurança no Supabase, no Canadá. Você pode excluir sua conta e tudo nela quando quiser.", hi: "आपका डेटा कनाडा में Supabase के साथ सुरक्षित रखा जाता है। आप कभी भी अपना खाता और उसका सारा डेटा हटा सकते हैं।", zh: "你的数据安全存储在加拿大的 Supabase 上，你可以随时删除账户及其中的所有内容。", ar: "تُخزَّن بياناتك بأمان لدى Supabase في كندا. يمكنك حذف حسابك وكل ما فيه في أي وقت." },
  privacyPoint4Guest: { en: "As a guest, your data stays in this browser. Clearing your browser data removes it.", es: "Como invitado, tus datos se quedan en este navegador. Si borras los datos del navegador, se eliminan.", fr: "En invité, vos données restent dans ce navigateur. Effacer les données du navigateur les supprime.", pt: "Como convidado, seus dados ficam neste navegador. Limpar os dados do navegador os apaga.", hi: "मेहमान के रूप में आपका डेटा इसी ब्राउज़र में रहता है। ब्राउज़र डेटा साफ़ करने पर यह हट जाता है।", zh: "访客模式下，数据保存在本浏览器中，清除浏览器数据即会删除。", ar: "كضيف، تبقى بياناتك في هذا المتصفح. مسح بيانات المتصفح يحذفها." },
  deleteAccountLabel: { en: "Delete my account", es: "Eliminar mi cuenta", fr: "Supprimer mon compte", pt: "Excluir minha conta", hi: "मेरा खाता हटाएं", zh: "删除我的账户", ar: "حذف حسابي" },
  deleteAccountConfirm: { en: "This permanently deletes your account, your saved kitchen, cookbook and history, and everything you posted in the Community. It can't be undone.", es: "Esto elimina para siempre tu cuenta, tu cocina, recetario e historial, y todo lo que publicaste en la Comunidad. No se puede deshacer.", fr: "Cela supprime définitivement votre compte, votre cuisine, vos recettes, votre historique et tout ce que vous avez publié dans la Communauté. C'est irréversible.", pt: "Isso exclui para sempre sua conta, sua cozinha, receitas e histórico, e tudo o que você publicou na Comunidade. Não dá para desfazer.", hi: "इससे आपका खाता, सेव की गई रसोई, कुकबुक, इतिहास और कम्युनिटी में की गई सारी पोस्ट हमेशा के लिए हट जाएंगी। इसे वापस नहीं किया जा सकता।", zh: "这会永久删除你的账户、保存的厨房、食谱本、历史记录，以及你在社区发布的所有内容，且无法恢复。", ar: "سيؤدي هذا إلى حذف حسابك ومطبخك ووصفاتك وسجلك وكل ما نشرته في المجتمع نهائيًا. لا يمكن التراجع." },
  deleteAccountYes: { en: "Yes, delete everything", es: "Sí, eliminar todo", fr: "Oui, tout supprimer", pt: "Sim, excluir tudo", hi: "हां, सब हटाएं", zh: "是的，全部删除", ar: "نعم، احذف كل شيء" },
  cancelLabel: { en: "Cancel", es: "Cancelar", fr: "Annuler", pt: "Cancelar", hi: "रद्द करें", zh: "取消", ar: "إلغاء" },
  deletingLabel: { en: "Deleting…", es: "Eliminando…", fr: "Suppression…", pt: "Excluindo…", hi: "हटाया जा रहा है…", zh: "正在删除…", ar: "جارٍ الحذف…" },
  deleteAccountFailed: { en: "Couldn't delete your account. Check your connection and try again.", es: "No se pudo eliminar tu cuenta. Revisa tu conexión e inténtalo de nuevo.", fr: "Impossible de supprimer votre compte. Vérifiez votre connexion et réessayez.", pt: "Não foi possível excluir sua conta. Verifique a conexão e tente de novo.", hi: "खाता नहीं हटाया जा सका। अपना कनेक्शन जांचें और फिर कोशिश करें।", zh: "无法删除账户，请检查网络后重试。", ar: "تعذّر حذف حسابك. تحقق من الاتصال وحاول مرة أخرى." },
  matchLabel: { en: "How to combine", es: "Cómo combinar", fr: "Comment combiner", pt: "Como combinar", hi: "कैसे मिलाएं", zh: "组合方式", ar: "طريقة الجمع" },
  matchAny: { en: "Any of these", es: "Cualquiera", fr: "N'importe lequel", pt: "Qualquer um", hi: "इनमें से कोई", zh: "任一", ar: "أيٌّ منها" },
  matchAll: { en: "All of these", es: "Todos", fr: "Tous", pt: "Todos", hi: "ये सभी", zh: "全部", ar: "جميعها" },
  cuisineAllHint: { en: "Each recipe has one cuisine, so \"All of these\" with two or more cuisines won't find anything. Switch to \"Any of these\" to see them all.", es: "Cada receta tiene una sola cocina, así que \"Todos\" con dos o más cocinas no encontrará nada. Cambia a \"Cualquiera\" para verlas todas.", fr: "Chaque recette a une seule cuisine : « Tous » avec deux cuisines ou plus ne trouvera rien. Choisissez « N'importe lequel » pour tout voir.", pt: "Cada receita tem uma só culinária, então \"Todos\" com duas ou mais não vai encontrar nada. Mude para \"Qualquer um\" para ver todas.", hi: "हर रेसिपी की एक ही क्यूज़ीन होती है, इसलिए दो या ज़्यादा क्यूज़ीन के साथ \"ये सभी\" कुछ नहीं ढूंढेगा। सब देखने के लिए \"इनमें से कोई\" चुनें।", zh: "每道菜只属于一个菜系，所以选了两个以上菜系时“全部”不会有结果。改选“任一”即可全部显示。", ar: "لكل وصفة مطبخ واحد، لذا لن يجد خيار \"جميعها\" شيئًا مع مطبخين أو أكثر. اختر \"أيٌّ منها\" لرؤيتها كلها." },
  clearFilters: { en: "Clear filters", es: "Quitar filtros", fr: "Effacer les filtres", pt: "Limpar filtros", hi: "फ़िल्टर हटाएं", zh: "清除筛选", ar: "مسح عوامل التصفية" },
  recipesWord: { en: "recipes", es: "recetas", fr: "recettes", pt: "receitas", hi: "रेसिपी", zh: "道菜", ar: "وصفات" },
  filtersLabel: { en: "Filters", es: "Filtros", fr: "Filtres", pt: "Filtros", hi: "फ़िल्टर", zh: "筛选", ar: "عوامل التصفية" },
  appearanceLabel: { en: "Appearance & accessibility", es: "Apariencia y accesibilidad", fr: "Apparence et accessibilité", pt: "Aparência e acessibilidade", hi: "रूप और सुलभता", zh: "外观与无障碍", ar: "المظهر وإمكانية الوصول" },
  themeLabel: { en: "Mode", es: "Modo", fr: "Mode", pt: "Modo", hi: "मोड", zh: "模式", ar: "الوضع" },
  themeLight: { en: "Light", es: "Claro", fr: "Clair", pt: "Claro", hi: "लाइट", zh: "浅色", ar: "فاتح" },
  themeDark: { en: "Dark", es: "Oscuro", fr: "Sombre", pt: "Escuro", hi: "डार्क", zh: "深色", ar: "داكن" },
  themeSystem: { en: "Match device", es: "Como el dispositivo", fr: "Comme l'appareil", pt: "Igual ao dispositivo", hi: "डिवाइस जैसा", zh: "跟随设备", ar: "مثل الجهاز" },
  textSizeLabel: { en: "Text size", es: "Tamaño del texto", fr: "Taille du texte", pt: "Tamanho do texto", hi: "टेक्स्ट का आकार", zh: "文字大小", ar: "حجم النص" },
  textSmall: { en: "Small", es: "Pequeño", fr: "Petit", pt: "Pequeno", hi: "छोटा", zh: "小", ar: "صغير" },
  textDefault: { en: "Default", es: "Normal", fr: "Normal", pt: "Padrão", hi: "सामान्य", zh: "默认", ar: "افتراضي" },
  textLarge: { en: "Large", es: "Grande", fr: "Grand", pt: "Grande", hi: "बड़ा", zh: "大", ar: "كبير" },
  textXL: { en: "Extra large", es: "Muy grande", fr: "Très grand", pt: "Muito grande", hi: "बहुत बड़ा", zh: "特大", ar: "كبير جدًا" },
  readableFontLabel: { en: "Easy-to-read font", es: "Letra fácil de leer", fr: "Police facile à lire", pt: "Fonte fácil de ler", hi: "पढ़ने में आसान फ़ॉन्ट", zh: "易读字体", ar: "خط سهل القراءة" },
  readableFontSub: { en: "Clearer letter shapes and a bit more spacing. Helpful for low vision or dyslexia.", es: "Letras más claras y algo más de espacio. Útil con baja visión o dislexia.", fr: "Lettres plus nettes et un peu plus d'espace. Utile en cas de basse vision ou de dyslexie.", pt: "Letras mais nítidas e um pouco mais de espaço. Útil para baixa visão ou dislexia.", hi: "साफ़ अक्षर और थोड़ा ज़्यादा अंतर। कम दृष्टि या डिस्लेक्सिया में मददगार।", zh: "字形更清晰、间距稍大，适合低视力或阅读障碍人士。", ar: "أشكال حروف أوضح ومسافات أكبر قليلًا. مفيد لضعف البصر أو عسر القراءة." },
  contrastLabel: { en: "Higher contrast", es: "Más contraste", fr: "Contraste renforcé", pt: "Mais contraste", hi: "ज़्यादा कंट्रास्ट", zh: "高对比度", ar: "تباين أعلى" },
  contrastSub: { en: "Darker text and stronger outlines.", es: "Texto más oscuro y bordes más marcados.", fr: "Texte plus foncé et contours plus nets.", pt: "Texto mais escuro e contornos mais fortes.", hi: "गहरा टेक्स्ट और साफ़ किनारे।", zh: "文字更深、边框更明显。", ar: "نص أغمق وحدود أوضح." },
  reduceMotionLabel: { en: "Reduce motion", es: "Reducir movimiento", fr: "Réduire les animations", pt: "Reduzir movimento", hi: "कम एनिमेशन", zh: "减少动态效果", ar: "تقليل الحركة" },
  reduceMotionSub: { en: "Turns off animations and sliding effects.", es: "Desactiva animaciones y efectos de deslizamiento.", fr: "Désactive les animations et les effets de glissement.", pt: "Desativa animações e efeitos de deslizar.", hi: "एनिमेशन और स्लाइड इफ़ेक्ट बंद करता है।", zh: "关闭动画和滑动效果。", ar: "يوقف الرسوم المتحركة وتأثيرات الانزلاق." },
  getInspired: { en: "Get inspired", es: "Inspírate", fr: "Laissez-vous inspirer", pt: "Inspire-se", hi: "प्रेरणा लें", zh: "找找灵感", ar: "استلهم" },
  getInspiredSub: { en: "A few recipes to try next.", es: "Algunas recetas para probar.", fr: "Quelques recettes à essayer.", pt: "Algumas receitas para experimentar.", hi: "आगे आज़माने के लिए कुछ रेसिपी।", zh: "接下来可以试试这些菜。", ar: "بعض الوصفات لتجربتها." },
  shuffleLabel: { en: "Shuffle", es: "Mezclar", fr: "Mélanger", pt: "Embaralhar", hi: "बदलें", zh: "换一批", ar: "تبديل" },
  skipToContent: { en: "Skip to content", es: "Ir al contenido", fr: "Aller au contenu", pt: "Pular para o conteúdo", hi: "सामग्री पर जाएं", zh: "跳到内容", ar: "انتقل إلى المحتوى" },
  timerStart: { en: "Start {t} timer", es: "Iniciar temporizador de {t}", fr: "Lancer une minuterie de {t}", pt: "Iniciar timer de {t}", hi: "{t} का टाइमर शुरू करें", zh: "开始 {t} 计时", ar: "ابدأ مؤقت {t}" },
  timerPause: { en: "Pause", es: "Pausa", fr: "Pause", pt: "Pausar", hi: "रोकें", zh: "暂停", ar: "إيقاف مؤقت" },
  timerResume: { en: "Resume", es: "Seguir", fr: "Reprendre", pt: "Continuar", hi: "जारी रखें", zh: "继续", ar: "استئناف" },
  timerStop: { en: "Stop", es: "Detener", fr: "Arrêter", pt: "Parar", hi: "बंद करें", zh: "停止", ar: "إيقاف" },
  timerDone: { en: "Time's up! Check it", es: "¡Tiempo! Revísalo", fr: "C'est l'heure ! Vérifiez", pt: "Tempo esgotado! Confira", hi: "समय पूरा! देख लें", zh: "时间到！看看状态", ar: "انتهى الوقت! تحقّق" },
  screenOnNote: { en: "Your screen stays on while you cook.", es: "Tu pantalla se mantiene encendida mientras cocinas.", fr: "Votre écran reste allumé pendant que vous cuisinez.", pt: "Sua tela fica ligada enquanto você cozinha.", hi: "खाना बनाते समय आपकी स्क्रीन चालू रहेगी।", zh: "做饭时屏幕会保持常亮。", ar: "تبقى شاشتك مضاءة أثناء الطبخ." },
  kind_tip: { en: "Tip", es: "Consejo", fr: "Astuce", pt: "Dica", hi: "टिप", zh: "小贴士", ar: "نصيحة" },
  kind_feedback: { en: "Feedback", es: "Opinión", fr: "Avis", pt: "Opinião", hi: "प्रतिक्रिया", zh: "反馈", ar: "رأي" },
  kind_suggestion: { en: "Improvement", es: "Mejora", fr: "Amélioration", pt: "Melhoria", hi: "सुधार", zh: "改进建议", ar: "تحسين" },
  kind_tutorial: { en: "Tutorial", es: "Tutorial", fr: "Tutoriel", pt: "Tutorial", hi: "ट्यूटोरियल", zh: "教程", ar: "درس" },
  kind_recipe: { en: "Recipe", es: "Receta", fr: "Recette", pt: "Receita", hi: "रेसिपी", zh: "食谱", ar: "وصفة" },
  filterAll: { en: "All", es: "Todo", fr: "Tout", pt: "Tudo", hi: "सभी", zh: "全部", ar: "الكل" },
  sortNewest: { en: "Newest", es: "Más recientes", fr: "Plus récents", pt: "Mais recentes", hi: "नवीनतम", zh: "最新", ar: "الأحدث" },
  sortHelpful: { en: "Most helpful", es: "Más útiles", fr: "Plus utiles", pt: "Mais úteis", hi: "सबसे उपयोगी", zh: "最有帮助", ar: "الأكثر فائدة" },
  composeTitle: { en: "Share with other cooks", es: "Comparte con otros cocineros", fr: "Partagez avec d'autres cuisiniers", pt: "Compartilhe com outros cozinheiros", hi: "दूसरे रसोइयों के साथ साझा करें", zh: "分享给其他厨师", ar: "شارك مع طهاة آخرين" },
  placeholderTip: { en: "Share a cooking tip…", es: "Comparte un consejo de cocina…", fr: "Partagez une astuce de cuisine…", pt: "Compartilhe uma dica de cozinha…", hi: "कोई कुकिंग टिप साझा करें…", zh: "分享一个烹饪小贴士…", ar: "شارك نصيحة طبخ…" },
  placeholderFeedback: { en: "How did it turn out? What worked?", es: "¿Cómo te quedó? ¿Qué funcionó?", fr: "Comment c'était ? Qu'est-ce qui a marché ?", pt: "Como ficou? O que funcionou?", hi: "कैसा बना? क्या अच्छा रहा?", zh: "做得怎么样？哪些地方效果好？", ar: "كيف كانت النتيجة؟ ما الذي نجح؟" },
  placeholderSuggestion: { en: "How would you make this recipe better?", es: "¿Cómo mejorarías esta receta?", fr: "Comment amélioreriez-vous cette recette ?", pt: "Como você melhoraria esta receita?", hi: "आप इस रेसिपी को कैसे बेहतर बनाएंगे?", zh: "你会怎样改进这道菜？", ar: "كيف تجعل هذه الوصفة أفضل؟" },
  placeholderTutorial: { en: "What does your tutorial show?", es: "¿Qué muestra tu tutorial?", fr: "Que montre votre tutoriel ?", pt: "O que seu tutorial mostra?", hi: "आपका ट्यूटोरियल क्या दिखाता है?", zh: "你的教程演示了什么？", ar: "ماذا يعرض درسك؟" },
  pickRecipe: { en: "Choose a recipe", es: "Elige una receta", fr: "Choisissez une recette", pt: "Escolha uma receita", hi: "कोई रेसिपी चुनें", zh: "选择一道食谱", ar: "اختر وصفة" },
  recipeOptional: { en: "Recipe (optional)", es: "Receta (opcional)", fr: "Recette (facultatif)", pt: "Receita (opcional)", hi: "रेसिपी (वैकल्पिक)", zh: "食谱（可选）", ar: "الوصفة (اختياري)" },
  yourRating: { en: "Your rating", es: "Tu calificación", fr: "Votre note", pt: "Sua nota", hi: "आपकी रेटिंग", zh: "你的评分", ar: "تقييمك" },
  tutorialLink: { en: "Video link (https://…)", es: "Enlace del video (https://…)", fr: "Lien de la vidéo (https://…)", pt: "Link do vídeo (https://…)", hi: "वीडियो लिंक (https://…)", zh: "视频链接（https://…）", ar: "رابط الفيديو (https://…)" },
  uploadVideo: { en: "Upload a short video", es: "Sube un video corto", fr: "Ajouter une courte vidéo", pt: "Envie um vídeo curto", hi: "छोटा वीडियो अपलोड करें", zh: "上传短视频", ar: "ارفع فيديو قصيرًا" },
  uploadingLabel: { en: "Uploading…", es: "Subiendo…", fr: "Envoi…", pt: "Enviando…", hi: "अपलोड हो रहा है…", zh: "正在上传…", ar: "جارٍ الرفع…" },
  videoTooBig: { en: "That video is over 20 MB. Try a shorter clip.", es: "Ese video pesa más de 20 MB. Prueba con un clip más corto.", fr: "Cette vidéo dépasse 20 Mo. Essayez un extrait plus court.", pt: "Esse vídeo tem mais de 20 MB. Tente um clipe mais curto.", hi: "यह वीडियो 20 MB से बड़ा है। छोटी क्लिप आज़माएं।", zh: "视频超过 20 MB，请换一段更短的。", ar: "حجم الفيديو أكبر من 20 ميغابايت. جرّب مقطعًا أقصر." },
  uploadFailed: { en: "Upload failed. Try again.", es: "No se pudo subir. Inténtalo de nuevo.", fr: "Échec de l'envoi. Réessayez.", pt: "Falha no envio. Tente de novo.", hi: "अपलोड नहीं हुआ। फिर से कोशिश करें।", zh: "上传失败，请重试。", ar: "فشل الرفع. حاول مرة أخرى." },
  videoAttached: { en: "Video attached", es: "Video adjunto", fr: "Vidéo jointe", pt: "Vídeo anexado", hi: "वीडियो जुड़ गया", zh: "已添加视频", ar: "تم إرفاق الفيديو" },
  removeLabel: { en: "Remove", es: "Quitar", fr: "Retirer", pt: "Remover", hi: "हटाएं", zh: "移除", ar: "إزالة" },
  postButton: { en: "Post", es: "Publicar", fr: "Publier", pt: "Publicar", hi: "पोस्ट करें", zh: "发布", ar: "نشر" },
  needRecipe: { en: "Pick a recipe first.", es: "Primero elige una receta.", fr: "Choisissez d'abord une recette.", pt: "Escolha uma receita primeiro.", hi: "पहले कोई रेसिपी चुनें।", zh: "请先选择一道食谱。", ar: "اختر وصفة أولًا." },
  needLinkOrVideo: { en: "Add a video link or upload a video.", es: "Agrega un enlace o sube un video.", fr: "Ajoutez un lien ou une vidéo.", pt: "Adicione um link ou envie um vídeo.", hi: "वीडियो लिंक जोड़ें या वीडियो अपलोड करें।", zh: "请添加视频链接或上传视频。", ar: "أضف رابط فيديو أو ارفع فيديو." },
  badLink: { en: "That link doesn't look right. It should start with https://", es: "Ese enlace no parece válido. Debe empezar con https://", fr: "Ce lien semble incorrect. Il doit commencer par https://", pt: "Esse link não parece certo. Ele deve começar com https://", hi: "यह लिंक सही नहीं लगता। यह https:// से शुरू होना चाहिए", zh: "链接格式不对，应以 https:// 开头", ar: "يبدو الرابط غير صحيح. يجب أن يبدأ بـ https://" },
  needText: { en: "Write something first.", es: "Escribe algo primero.", fr: "Écrivez quelque chose d'abord.", pt: "Escreva algo primeiro.", hi: "पहले कुछ लिखें।", zh: "请先写点内容。", ar: "اكتب شيئًا أولًا." },
  communityReadOnly: { en: "You can read everything here. Posting and rating are open to people the owner adds to this page as Contributors or Editors.", es: "Puedes leer todo aquí. Publicar y calificar está abierto a quienes el propietario añada a esta página como colaboradores o editores.", fr: "Vous pouvez tout lire ici. Publier et noter est réservé aux personnes que le propriétaire ajoute comme contributeurs ou éditeurs.", pt: "Você pode ler tudo aqui. Publicar e avaliar é para quem o dono adicionar a esta página como colaborador ou editor.", hi: "आप यहां सब कुछ पढ़ सकते हैं। पोस्ट और रेटिंग वे लोग कर सकते हैं जिन्हें मालिक इस पेज पर Contributor या Editor के रूप में जोड़ता है।", zh: "你可以阅读这里的所有内容。只有被所有者添加为贡献者或编辑的人才能发帖和评分。", ar: "يمكنك قراءة كل شيء هنا. النشر والتقييم متاحان لمن يضيفهم المالك إلى هذه الصفحة كمساهمين أو محررين." },
  communityReadOnlyShort: { en: "Sharing is open to Contributors on this page.", es: "Compartir está abierto a los colaboradores de esta página.", fr: "Le partage est réservé aux contributeurs de cette page.", pt: "Compartilhar é para colaboradores desta página.", hi: "साझा करना इस पेज के Contributors के लिए है।", zh: "只有本页面的贡献者可以分享。", ar: "المشاركة متاحة للمساهمين في هذه الصفحة." },
  communityLocalNote: { en: "Preview mode: posts are saved on this device only. On the published page they're shared with every cook.", es: "Modo de vista previa: las publicaciones se guardan solo en este dispositivo. En la página publicada se comparten con todos.", fr: "Mode aperçu : les publications restent sur cet appareil. Sur la page publiée, elles sont partagées avec tous.", pt: "Modo de prévia: as publicações ficam só neste dispositivo. Na página publicada, são compartilhadas com todos.", hi: "प्रीव्यू मोड: पोस्ट सिर्फ़ इस डिवाइस पर सेव होती हैं। प्रकाशित पेज पर ये सभी के साथ साझा होती हैं।", zh: "预览模式：帖子只保存在本设备上。在发布的页面上会与所有人共享。", ar: "وضع المعاينة: تُحفظ المنشورات على هذا الجهاز فقط. في الصفحة المنشورة تتم مشاركتها مع الجميع." },
  communityStaleNote: { en: "Can't reach the community right now. What you see may be out of date.", es: "No se puede conectar con la comunidad ahora. Lo que ves puede estar desactualizado.", fr: "Impossible de joindre la communauté pour l'instant. Le contenu peut être daté.", pt: "Não foi possível acessar a comunidade agora. O conteúdo pode estar desatualizado.", hi: "अभी कम्युनिटी से कनेक्ट नहीं हो पा रहा। जो दिख रहा है वह पुराना हो सकता है।", zh: "暂时无法连接社区，看到的内容可能不是最新的。", ar: "تعذّر الوصول إلى المجتمع الآن. قد يكون ما تراه قديمًا." },
  saveFailed: { en: "Couldn't post that. You may not have permission to post here.", es: "No se pudo publicar. Puede que no tengas permiso para publicar aquí.", fr: "Publication impossible. Vous n'avez peut-être pas l'autorisation de publier ici.", pt: "Não foi possível publicar. Talvez você não tenha permissão aqui.", hi: "पोस्ट नहीं हो सका। शायद आपको यहां पोस्ट करने की अनुमति नहीं है।", zh: "发布失败，你可能没有在这里发帖的权限。", ar: "تعذّر النشر. ربما لا تملك إذنًا بالنشر هنا." },
  communityFull: { en: "The community is full right now. Ask the owner to clear out old posts.", es: "La comunidad está llena. Pide al propietario que borre publicaciones antiguas.", fr: "La communauté est pleine. Demandez au propriétaire de supprimer d'anciennes publications.", pt: "A comunidade está cheia. Peça ao dono para apagar publicações antigas.", hi: "कम्युनिटी अभी भरी हुई है। मालिक से पुरानी पोस्ट हटाने को कहें।", zh: "社区已满，请让所有者清理旧帖子。", ar: "المجتمع ممتلئ حاليًا. اطلب من المالك حذف المنشورات القديمة." },
  dismissLabel: { en: "OK", es: "OK", fr: "OK", pt: "OK", hi: "ठीक है", zh: "好", ar: "حسنًا" },
  deleteLabel: { en: "Delete", es: "Eliminar", fr: "Supprimer", pt: "Excluir", hi: "हटाएं", zh: "删除", ar: "حذف" },
  helpfulLabel: { en: "Helpful", es: "Útil", fr: "Utile", pt: "Útil", hi: "उपयोगी", zh: "有帮助", ar: "مفيد" },
  saveToCookbook: { en: "Save to my Cookbook", es: "Guardar en mi recetario", fr: "Enregistrer dans mon livre", pt: "Salvar no meu livro de receitas", hi: "मेरी कुकबुक में सेव करें", zh: "保存到我的食谱本", ar: "احفظ في كتاب وصفاتي" },
  savedLabel: { en: "Saved", es: "Guardada", fr: "Enregistrée", pt: "Salva", hi: "सेव हो गई", zh: "已保存", ar: "تم الحفظ" },
  videoUnavailable: { en: "This video can't be shown here.", es: "Este video no se puede mostrar aquí.", fr: "Cette vidéo ne peut pas être affichée ici.", pt: "Este vídeo não pode ser exibido aqui.", hi: "यह वीडियो यहां नहीं दिखाया जा सकता।", zh: "此视频无法在这里显示。", ar: "لا يمكن عرض هذا الفيديو هنا." },
  ratingsWord: { en: "ratings", es: "calificaciones", fr: "notes", pt: "avaliações", hi: "रेटिंग", zh: "个评分", ar: "تقييمات" },
  communityRatingLabel: { en: "Community rating", es: "Calificación de la comunidad", fr: "Note de la communauté", pt: "Nota da comunidade", hi: "कम्युनिटी रेटिंग", zh: "社区评分", ar: "تقييم المجتمع" },
  rateForCommunity: { en: "Rate this recipe", es: "Califica esta receta", fr: "Notez cette recette", pt: "Avalie esta receita", hi: "इस रेसिपी को रेट करें", zh: "给这道菜评分", ar: "قيّم هذه الوصفة" },
  someoneLabel: { en: "A cook", es: "Un cocinero", fr: "Un cuisinier", pt: "Um cozinheiro", hi: "एक रसोइया", zh: "一位厨师", ar: "طاهٍ" },
  welcomeSub: { en: "A couple quick things, nothing serious. You only do this once, and you can edit it anytime from Settings.", es: "Un par de cosas rápidas. Solo lo haces una vez y puedes cambiarlo cuando quieras en Ajustes.", fr: "Deux ou trois choses rapides. Vous ne le faites qu'une fois et pouvez les modifier à tout moment dans les Paramètres.", pt: "Algumas coisas rápidas. Você só faz isso uma vez e pode editar quando quiser em Configurações.", hi: "बस कुछ छोटी बातें। यह एक ही बार करना है और आप इसे कभी भी सेटिंग्स में बदल सकते हैं।", zh: "几件小事，只需填一次，之后随时可以在设置里修改。", ar: "بعض الأشياء السريعة. تفعل هذا مرة واحدة فقط ويمكنك تعديله في أي وقت من الإعدادات." },
  chooseLanguage: { en: "Language", es: "Idioma", fr: "Langue", pt: "Idioma", hi: "भाषा", zh: "语言", ar: "اللغة" },
  letsCook: { en: "Let's cook", es: "A cocinar", fr: "C'est parti", pt: "Vamos cozinhar", hi: "चलिए पकाते हैं", zh: "开始做饭", ar: "هيا نطبخ" },
  loadingKitchen: { en: "Loading your kitchen…", es: "Cargando tu cocina…", fr: "Chargement de votre cuisine…", pt: "Carregando sua cozinha…", hi: "आपकी रसोई लोड हो रही है…", zh: "正在加载你的厨房…", ar: "جارٍ تحميل مطبخك…" },
  fromMyKitchen: { en: "From my kitchen", es: "De mi cocina", fr: "De ma cuisine", pt: "Da minha cozinha", hi: "मेरी रसोई से", zh: "来自我的厨房", ar: "من مطبخي" },
  searchAMeal: { en: "Search a meal", es: "Buscar una comida", fr: "Rechercher un repas", pt: "Buscar uma refeição", hi: "भोजन खोजें", zh: "搜索菜谱", ar: "ابحث عن وجبة" },
  mealType: { en: "Meal type", es: "Tipo de comida", fr: "Type de repas", pt: "Tipo de refeição", hi: "भोजन का प्रकार", zh: "餐点类型", ar: "نوع الوجبة" },
  cuisineLabel: { en: "Cuisine", es: "Cocina (tipo)", fr: "Cuisine", pt: "Culinária", hi: "व्यंजन", zh: "菜系", ar: "المطبخ" },
  readyToCookSection: { en: "Ready to cook", es: "Listo para cocinar", fr: "Prêt à cuisiner", pt: "Pronto para cozinhar", hi: "पकाने के लिए तैयार", zh: "可以烹饪", ar: "جاهز للطبخ" },
  almostThere: { en: "Almost there", es: "Casi listo", fr: "Presque prêt", pt: "Quase lá", hi: "लगभग तैयार", zh: "差一点就够了", ar: "على وشك الاكتمال" },

  settingsTitle: { en: "Settings", es: "Configuración", fr: "Paramètres", pt: "Configurações", hi: "सेटिंग्स", zh: "设置", ar: "الإعدادات", ru: "Настройки", ta: "அமைப்புகள்" },
  dailyTargets: { en: "Daily targets", es: "Objetivos diarios", fr: "Objectifs quotidiens", pt: "Metas diárias", hi: "दैनिक लक्ष्य", zh: "每日目标", ar: "الأهداف اليومية" },
  profileLabel: { en: "Profile", es: "Perfil", fr: "Profil", pt: "Perfil", hi: "प्रोफ़ाइल", zh: "个人资料", ar: "الملف الشخصي" },
  accessibilityLabel: { en: "Accessibility & personalization", es: "Accesibilidad y personalización", fr: "Accessibilité et personnalisation", pt: "Acessibilidade e personalização", hi: "सुलभता और वैयक्तिकरण", zh: "无障碍与个性化", ar: "إمكانية الوصول والتخصيص" },
  languageLabel: { en: "Language", es: "Idioma", fr: "Langue", pt: "Idioma", hi: "भाषा", zh: "语言", ar: "اللغة" },
  cookingLevelLabel: { en: "Cooking level", es: "Nivel de cocina", fr: "Niveau de cuisine", pt: "Nível de culinária", hi: "खाना पकाने का स्तर", zh: "烹饪水平", ar: "مستوى الطبخ" },
  dietaryPreference: { en: "Dietary preference", es: "Preferencia alimentaria", fr: "Préférence alimentaire", pt: "Preferência alimentar", hi: "आहार वरीयता", zh: "饮食偏好", ar: "التفضيلات الغذائية" },
  kitchenDataLabel: { en: "Kitchen data", es: "Datos de cocina", fr: "Données de cuisine", pt: "Dados da cozinha", hi: "रसोई डेटा", zh: "厨房数据", ar: "بيانات المطبخ" },
  saveProfile: { en: "Save profile", es: "Guardar perfil", fr: "Enregistrer le profil", pt: "Salvar perfil", hi: "प्रोफ़ाइल सहेजें", zh: "保存个人资料", ar: "حفظ الملف الشخصي" },

  moreTitle: { en: "More", es: "Más", fr: "Plus", pt: "Mais", hi: "अधिक", zh: "更多", ar: "المزيد", ru: "Ещё", ta: "மேலும்" },
  historyLabel: { en: "History & Progress", es: "Historial y progreso", fr: "Historique et progrès", pt: "Histórico e progresso", hi: "इतिहास और प्रगति", zh: "历史与进度", ar: "السجل والتقدم" },
  cookbookLabel: { en: "Cookbook", es: "Recetario", fr: "Livre de recettes", pt: "Livro de receitas", hi: "कुकबुक", zh: "菜谱本", ar: "كتاب الوصفات" },
  communityLabel: { en: "Community", es: "Comunidad", fr: "Communauté", pt: "Comunidade", hi: "समुदाय", zh: "社区", ar: "المجتمع" },
  shoppingLabel: { en: "Smart Shopping", es: "Compras inteligentes", fr: "Achats intelligents", pt: "Compras inteligentes", hi: "स्मार्ट शॉपिंग", zh: "智能购物", ar: "التسوق الذكي" },

  servingsLabel: { en: "Servings", es: "Porciones", fr: "Portions", pt: "Porções", hi: "सर्विंग्स", zh: "份数", ar: "عدد الحصص" },
  nextStepLabel: { en: "Next step", es: "Siguiente paso", fr: "Étape suivante", pt: "Próximo passo", hi: "अगला चरण", zh: "下一步", ar: "الخطوة التالية", ru: "Следующий шаг", ta: "அடுத்த படி" },
  previousStepLabel: { en: "Previous", es: "Anterior", fr: "Précédent", pt: "Anterior", hi: "पिछला", zh: "上一步", ar: "السابق" },
  finishCookingLabel: { en: "Finish cooking", es: "Terminar de cocinar", fr: "Terminer la cuisson", pt: "Terminar de cozinhar", hi: "खाना पकाना पूरा करें", zh: "完成烹饪", ar: "إنهاء الطبخ", ru: "Завершить готовку", ta: "சமையல் முடி" },

  aiTitle: { en: "AI Sous-Chef", es: "IA Sous-Chef", fr: "IA Sous-Chef", pt: "IA Sous-Chef", hi: "एआई सू-शेफ", zh: "AI 副厨师", ar: "مساعد الطاهي الذكي", ru: "ИИ Су-шеф", ta: "AI உதவி சமையல்காரர்" },
  aiSubtitle: { en: "Ask about substitutions, timing, or technique", es: "Pregunta sobre sustituciones, tiempos o técnicas", fr: "Posez des questions sur les substitutions, le minutage ou la technique", pt: "Pergunte sobre substituições, tempo ou técnica", hi: "विकल्प, समय या तकनीक के बारे में पूछें", zh: "询问替代食材、时间或技巧", ar: "اسأل عن البدائل أو الوقت أو التقنية", ru: "Спросите о заменах, времени или технике", ta: "மாற்று பொருட்கள், நேரம் அல்லது முறை பற்றி கேளுங்கள்" },

  historyTitle: { en: "History", es: "Historial", fr: "Historique", pt: "Histórico", hi: "इतिहास", zh: "历史记录", ar: "السجل", ru: "История", ta: "வரலாறு" },
  mealsCookedSoFar: { en: "Meals you've cooked", es: "Comidas que has cocinado", fr: "Repas que vous avez cuisinés", pt: "Refeições que você cozinhou", hi: "आपके द्वारा बनाए गए भोजन", zh: "你已经做过的菜", ar: "الوجبات التي طهيتها" },
  soFarSuffix: { en: "so far", es: "hasta ahora", fr: "jusqu'à présent", pt: "até agora", hi: "अब तक", zh: "目前为止", ar: "حتى الآن" },
  backLabel: { en: "Back", es: "Atrás", fr: "Retour", pt: "Voltar", hi: "वापस", zh: "返回", ar: "رجوع", ru: "Назад", ta: "பின்செல்" },

  welcomeTitle: { en: "Welcome", es: "Bienvenido", fr: "Bienvenue", pt: "Bem-vindo", hi: "स्वागत है", zh: "欢迎", ar: "أهلاً بك" },
  welcomeSubtitle: { en: "A couple quick things, nothing serious — you only do this once, and you can edit it anytime from Settings.", es: "Un par de cosas rápidas, nada serio — solo lo haces una vez, y puedes editarlo en Configuración cuando quieras.", fr: "Quelques infos rapides, rien de sérieux — vous ne le faites qu'une fois, et vous pouvez tout modifier depuis les Paramètres.", pt: "Algumas coisas rápidas, nada sério — você só faz isso uma vez, e pode editar depois em Configurações.", hi: "कुछ छोटी बातें, कुछ गंभीर नहीं — यह आपको केवल एक बार करना है, और आप इसे कभी भी सेटिंग्स से बदल सकते हैं।", zh: "几个简单的问题，不用太认真——只需填一次，之后随时可以在设置中修改。", ar: "بضعة أسئلة سريعة، لا شيء جدي — تفعل هذا مرة واحدة فقط، ويمكنك تعديله في أي وقت من الإعدادات." },
  nameLabel: { en: "Name", es: "Nombre", fr: "Nom", pt: "Nome", hi: "नाम", zh: "姓名", ar: "الاسم" },
  namePlaceholder: { en: "What should we call you?", es: "¿Cómo te llamamos?", fr: "Comment devons-nous vous appeler ?", pt: "Como devemos te chamar?", hi: "हम आपको क्या कहें?", zh: "我们该怎么称呼你？", ar: "ماذا يجب أن ندعوك؟" },
  ageLabel: { en: "Age", es: "Edad", fr: "Âge", pt: "Idade", hi: "आयु", zh: "年龄", ar: "العمر" },
  heightLabel: { en: "Height", es: "Estatura", fr: "Taille", pt: "Altura", hi: "ऊंचाई", zh: "身高", ar: "الطول" },
  weightLabel: { en: "Weight", es: "Peso", fr: "Poids", pt: "Peso", hi: "वज़न", zh: "体重", ar: "الوزن" },
  weightGoalLabel: { en: "Weight goal", es: "Objetivo de peso", fr: "Objectif de poids", pt: "Meta de peso", hi: "वज़न लक्ष्य", zh: "体重目标", ar: "هدف الوزن" },
  cookingGoalLabel: { en: "Cooking goal", es: "Objetivo de cocina", fr: "Objectif culinaire", pt: "Objetivo culinário", hi: "खाना पकाने का लक्ष्य", zh: "烹饪目标", ar: "هدف الطبخ" },
  biologicalSexLabel: { en: "Biological sex", es: "Sexo biológico", fr: "Sexe biologique", pt: "Sexo biológico", hi: "जैविक लिंग", zh: "生理性别", ar: "الجنس البيولوجي" },
  biologicalSexHint: { en: "Only used to make the calorie estimate more accurate — skip it if you'd rather not say.", es: "Solo se usa para que la estimación de calorías sea más precisa — omítelo si prefieres no decirlo.", fr: "Utilisé uniquement pour affiner l'estimation calorique — ignorez si vous préférez ne pas le dire.", pt: "Usado apenas para tornar a estimativa de calorias mais precisa — pule se preferir não dizer.", hi: "केवल कैलोरी अनुमान को अधिक सटीक बनाने के लिए उपयोग किया जाता है — यदि आप नहीं बताना चाहें तो छोड़ दें।", zh: "仅用于让卡路里估算更准确——如果不想透露可以跳过。", ar: "يُستخدم فقط لجعل تقدير السعرات أكثر دقة — تخطَّه إذا كنت تفضل عدم الإفصاح." },
  noTrackMessage: { en: "No problem — we won't show calorie or macro numbers anywhere in the app. You can still use everything else, and can turn tracking back on anytime in Settings.", es: "Sin problema — no mostraremos números de calorías ni macros en ningún lugar de la app. Puedes seguir usando todo lo demás, y activar el seguimiento cuando quieras desde Configuración.", fr: "Pas de souci — nous n'afficherons aucun chiffre de calories ou de macros dans l'application. Vous pouvez toujours utiliser tout le reste, et réactiver le suivi à tout moment dans les Paramètres.", pt: "Sem problema — não mostraremos números de calorias ou macros em nenhum lugar do app. Você ainda pode usar tudo o mais, e pode reativar o rastreamento a qualquer momento em Configurações.", hi: "कोई बात नहीं — हम ऐप में कहीं भी कैलोरी या मैक्रो नंबर नहीं दिखाएंगे। आप बाकी सब कुछ इस्तेमाल कर सकते हैं, और सेटिंग्स से कभी भी ट्रैकिंग वापस चालू कर सकते हैं।", zh: "没问题——我们不会在应用中的任何地方显示卡路里或宏量营养素数字。你仍然可以使用其他所有功能，并可以随时在设置中重新开启追踪。", ar: "لا مشكلة — لن نعرض أرقام السعرات أو المغذيات الكبرى في أي مكان بالتطبيق. لا يزال بإمكانك استخدام كل شيء آخر، ويمكنك إعادة تفعيل التتبع في أي وقت من الإعدادات." },
  extremeCautionText: { en: "This is a fast pace. Rapid changes aren't right for everyone, and sustainable, gradual goals tend to work better long-term — consider talking to a doctor or registered dietitian before pursuing this.", es: "Este es un ritmo rápido. Los cambios rápidos no son adecuados para todos, y las metas graduales y sostenibles suelen funcionar mejor a largo plazo — considera hablar con un médico o dietista antes de seguir esto.", fr: "C'est un rythme rapide. Les changements rapides ne conviennent pas à tout le monde, et des objectifs progressifs et durables fonctionnent souvent mieux à long terme — envisagez d'en parler à un médecin ou un diététicien avant de vous lancer.", pt: "Esse é um ritmo rápido. Mudanças rápidas não são adequadas para todos, e metas graduais e sustentáveis costumam funcionar melhor a longo prazo — considere conversar com um médico ou nutricionista antes de seguir por esse caminho.", hi: "यह एक तेज़ गति है। तेज़ बदलाव सभी के लिए सही नहीं होते, और टिकाऊ, धीरे-धीरे बढ़ने वाले लक्ष्य लंबे समय में बेहतर काम करते हैं — इसे अपनाने से पहले किसी डॉक्टर या पंजीकृत आहार विशेषज्ञ से बात करने पर विचार करें।", zh: "这个速度较快。快速的变化并不适合所有人，可持续的渐进目标长期来看往往效果更好——在采取这种方式之前，建议咨询医生或注册营养师。", ar: "هذه وتيرة سريعة. التغييرات السريعة ليست مناسبة للجميع، والأهداف التدريجية المستدامة تنجح غالبًا بشكل أفضل على المدى الطويل — فكر في استشارة طبيب أو أخصائي تغذية مسجل قبل اتباع هذا." },
  calorieDisclaimer: { en: "These numbers are rough general estimates, not medical advice. If you have — or are recovering from — an eating disorder, or have specific health needs, please talk to a doctor or registered dietitian instead of relying on app-generated targets.", es: "Estos números son estimaciones generales, no consejo médico. Si tienes — o te estás recuperando de — un trastorno alimentario, o tienes necesidades de salud específicas, habla con un médico o dietista en lugar de confiar en los objetivos generados por la app.", fr: "Ces chiffres sont des estimations générales approximatives, pas un avis médical. Si vous avez — ou êtes en convalescence d'un — trouble alimentaire, ou avez des besoins de santé spécifiques, parlez-en à un médecin ou un diététicien plutôt que de vous fier aux objectifs générés par l'application.", pt: "Esses números são estimativas gerais aproximadas, não aconselhamento médico. Se você tem — ou está se recuperando de — um transtorno alimentar, ou tem necessidades de saúde específicas, converse com um médico ou nutricionista em vez de confiar nas metas geradas pelo app.", hi: "ये संख्याएं सामान्य अनुमान हैं, चिकित्सा सलाह नहीं। यदि आपको खान-पान संबंधी विकार है — या उससे उबर रहे हैं — या विशेष स्वास्थ्य आवश्यकताएं हैं, तो कृपया ऐप-जनित लक्ष्यों पर भरोसा करने के बजाय डॉक्टर या पंजीकृत आहार विशेषज्ञ से बात करें।", zh: "这些数字只是粗略的一般估算，并非医疗建议。如果你有饮食失调（或正在康复中），或有特殊健康需求，请咨询医生或注册营养师，而不要依赖应用生成的目标。", ar: "هذه الأرقام تقديرات عامة تقريبية، وليست نصيحة طبية. إذا كنت تعاني — أو تتعافى — من اضطراب في الأكل، أو لديك احتياجات صحية خاصة، فيرجى التحدث إلى طبيب أو أخصائي تغذية مسجل بدلاً من الاعتماد على الأهداف التي يولدها التطبيق." },
  activityLevelLabel: { en: "Activity level", es: "Nivel de actividad", fr: "Niveau d'activité", pt: "Nível de atividade", hi: "गतिविधि स्तर", zh: "活动水平", ar: "مستوى النشاط" },
  optionalTag: { en: "optional", es: "opcional", fr: "facultatif", pt: "opcional", hi: "वैकल्पिक", zh: "可选", ar: "اختياري" },
  continueLabel: { en: "Continue", es: "Continuar", fr: "Continuer", pt: "Continuar", hi: "जारी रखें", zh: "继续", ar: "متابعة" },
  recommendedTargetsTitle: { en: "Your recommended targets", es: "Tus objetivos recomendados", fr: "Vos objectifs recommandés", pt: "Suas metas recomendadas", hi: "आपके अनुशंसित लक्ष्य", zh: "你的推荐目标", ar: "أهدافك الموصى بها" },
  recommendedTargetsSubtitle: { en: "Based on what you told us — drag the sliders or type a number to adjust. You can change these anytime from Settings too.", es: "Según lo que nos dijiste — arrastra los controles o escribe un número para ajustar. También puedes cambiar esto desde Configuración.", fr: "D'après ce que vous nous avez dit — faites glisser les curseurs ou entrez un chiffre. Vous pouvez aussi tout modifier depuis les Paramètres.", pt: "Com base no que você nos disse — arraste os controles ou digite um número. Você também pode mudar isso em Configurações.", hi: "आपने जो बताया उसके आधार पर — स्लाइडर खींचें या संख्या टाइप करें। आप इसे सेटिंग्स से भी बदल सकते हैं।", zh: "根据你提供的信息——拖动滑块或输入数字进行调整。你也可以随时在设置中更改。", ar: "بناءً على ما أخبرتنا به — اسحب أشرطة التمرير أو اكتب رقمًا للتعديل. يمكنك أيضًا تغيير هذا في أي وقت من الإعدادات." },
  letsCookLabel: { en: "Let's cook", es: "A cocinar", fr: "Allons cuisiner", pt: "Vamos cozinhar", hi: "चलिए पकाते हैं", zh: "开始做饭", ar: "لنبدأ الطبخ" },

  basicsHintText: { en: "We'll assume you have these on hand — let us know if you're out of any.", es: "Asumiremos que tienes esto a mano — avísanos si te falta alguno.", fr: "On suppose que vous les avez sous la main — dites-nous si l'un vous manque.", pt: "Vamos assumir que você tem isso em casa — avise se estiver faltando algum.", hi: "हम मान लेंगे कि ये आपके पास हैं — बताएं अगर कोई खत्म हो गया है।", zh: "我们会假设你已备有这些——如果缺了哪样，请告诉我们。", ar: "سنفترض أن هذه موجودة لديك — أخبرنا إذا نفد أي منها." },
  nothingAddedYet: { en: "Nothing added yet.", es: "Aún no has añadido nada.", fr: "Rien n'a encore été ajouté.", pt: "Nada adicionado ainda.", hi: "अभी तक कुछ भी नहीं जोड़ा गया।", zh: "还没有添加任何内容。", ar: "لم تتم إضافة شيء بعد." },
  quantityLabel: { en: "Quantity", es: "Cantidad", fr: "Quantité", pt: "Quantidade", hi: "मात्रा", zh: "数量", ar: "الكمية" },
  expiresOnLabel: { en: "Expires on", es: "Caduca el", fr: "Expire le", pt: "Expira em", hi: "समाप्ति तिथि", zh: "到期日期", ar: "تاريخ الانتهاء" },
  expAbbrevLabel: { en: "exp", es: "cad", fr: "exp", pt: "val", hi: "समाप्ति", zh: "到期", ar: "ينتهي" },
  quantityHint: { en: "Leave these blank if you don't want to track it — they're just here to help you use things before they go bad.", es: "Deja esto en blanco si no quieres registrarlo — solo está aquí para ayudarte a usar las cosas antes de que se echen a perder.", fr: "Laissez vide si vous ne voulez pas suivre ça — c'est juste là pour vous aider à utiliser les choses avant qu'elles ne s'abîment.", pt: "Deixe em branco se não quiser rastrear — é só para te ajudar a usar as coisas antes que estraguem.", hi: "अगर आप इसे ट्रैक नहीं करना चाहते तो इसे खाली छोड़ दें — यह सिर्फ चीज़ों को खराब होने से पहले उपयोग करने में मदद के लिए है।", zh: "如果不想追踪，可以留空——这只是帮助你在食材变质前用掉它们。", ar: "اترك هذه فارغة إذا كنت لا تريد تتبعها — إنها هنا فقط لمساعدتك على استخدام الأشياء قبل أن تفسد." },
  qtyExamplePlaceholder: { en: "e.g. 2 dozen", es: "ej. 2 docenas", fr: "ex. 2 douzaines", pt: "ex. 2 dúzias", hi: "जैसे 2 दर्जन", zh: "例如 2打", ar: "مثال: 2 دزينة" },
  seeReadyRecipes: { en: "recipe ready to cook", en_plural: "recipes ready to cook", es: "receta lista para cocinar", fr: "recette prête à cuisiner", pt: "receita pronta para cozinhar", hi: "पकाने के लिए तैयार रेसिपी", zh: "道菜可以烹饪", ar: "وصفة جاهزة للطبخ" },
  seeWhatYouCanMake: { en: "See what you can make", es: "Mira qué puedes cocinar", fr: "Voyez ce que vous pouvez cuisiner", pt: "Veja o que você pode cozinhar", hi: "देखें आप क्या बना सकते हैं", zh: "看看你能做什么", ar: "شاهد ما يمكنك صنعه" },

  cookSubtitleKitchen: { en: "Pulled straight from My Kitchen — equipment and ingredients", es: "Tomado directamente de Mi Cocina — equipo e ingredientes", fr: "Directement tiré de Ma Cuisine — équipement et ingrédients", pt: "Direto da Minha Cozinha — equipamento e ingredientes", hi: "सीधे मेरी रसोई से — उपकरण और सामग्री", zh: "直接来自我的厨房——厨具与食材", ar: "مباشرة من مطبخي — المعدات والمكونات" },
  cookSubtitleSearch: { en: "Know what you want? Search it — closest matches with the fewest ingredients show first.", es: "¿Sabes lo que quieres? Búscalo — las coincidencias más cercanas con menos ingredientes aparecen primero.", fr: "Vous savez ce que vous voulez ? Cherchez-le — les meilleures correspondances avec le moins d'ingrédients apparaissent en premier.", pt: "Sabe o que quer? Busque — as correspondências mais próximas com menos ingredientes aparecem primeiro.", hi: "जानते हैं क्या चाहिए? खोजें — सबसे कम सामग्री वाले परिणाम पहले दिखेंगे।", zh: "知道自己想吃什么？搜索一下——所需食材最少的最相近结果会先显示。", ar: "تعرف ماذا تريد؟ ابحث عنه — أقرب النتائج بأقل عدد من المكونات تظهر أولاً." },
  addCuisinePlaceholder: { en: "Don't see yours? Add a cuisine…", es: "¿No ves la tuya? Añade una cocina…", fr: "Vous ne voyez pas la vôtre ? Ajoutez une cuisine…", pt: "Não vê a sua? Adicione uma culinária…", hi: "अपनी नहीं दिख रही? एक व्यंजन जोड़ें…", zh: "没看到你的菜系？添加一个…", ar: "لا ترى مطبخك؟ أضف مطبخًا…" },
  addEquipmentPlaceholder: { en: "Don't see it? Add equipment (e.g. Air fryer)…", es: "¿No lo ves? Añade equipo (ej. Freidora de aire)…", fr: "Vous ne le voyez pas ? Ajoutez du matériel (ex. Friteuse à air)…", pt: "Não vê? Adicione equipamento (ex. Fritadeira de ar)…", hi: "नहीं दिख रहा? उपकरण जोड़ें (जैसे एयर फ्रायर)…", zh: "没看到？添加厨具（例如 空气炸锅）…", ar: "لا تراه؟ أضف معدات (مثل: مقلاة هوائية)…" },
  noKitchenMatch: { en: "Nothing fully matches yet — add ingredients or equipment in My Kitchen.", es: "Nada coincide completamente todavía — añade ingredientes o equipo en Mi Cocina.", fr: "Rien ne correspond encore totalement — ajoutez des ingrédients ou du matériel dans Ma Cuisine.", pt: "Nada corresponde totalmente ainda — adicione ingredientes ou equipamento na Minha Cozinha.", hi: "अभी तक कुछ भी पूरी तरह मेल नहीं खाता — मेरी रसोई में सामग्री या उपकरण जोड़ें।", zh: "目前还没有完全匹配的——在我的厨房中添加食材或厨具。", ar: "لا يوجد تطابق كامل بعد — أضف مكونات أو معدات في مطبخي." },
  noFilterMatch: { en: "Nothing matches those filters yet with what's in your kitchen.", es: "Nada coincide con esos filtros todavía con lo que tienes en tu cocina.", fr: "Rien ne correspond à ces filtres avec ce qu'il y a dans votre cuisine.", pt: "Nada corresponde a esses filtros com o que há na sua cozinha.", hi: "आपकी रसोई की चीज़ों से ये फ़िल्टर अभी मेल नहीं खाते।", zh: "根据你厨房现有的东西，暂时没有符合这些筛选条件的。", ar: "لا يوجد ما يطابق هذه الفلاتر بعد بناءً على ما في مطبخك." },
  noSearchMatch: { en: "No meals match that search.", es: "Ninguna comida coincide con esa búsqueda.", fr: "Aucun repas ne correspond à cette recherche.", pt: "Nenhuma refeição corresponde a essa busca.", hi: "उस खोज से कोई भोजन मेल नहीं खाता।", zh: "没有符合该搜索的菜谱。", ar: "لا توجد وجبات تطابق هذا البحث." },
  allMealsFewestFirst: { en: "All meals, fewest ingredients first", es: "Todas las comidas, menos ingredientes primero", fr: "Tous les repas, le moins d'ingrédients d'abord", pt: "Todas as refeições, menos ingredientes primeiro", hi: "सभी भोजन, सबसे कम सामग्री पहले", zh: "所有菜谱，食材最少的排在前面", ar: "كل الوجبات، الأقل مكونات أولاً" },
  resultsLabel: { en: "Results", es: "Resultados", fr: "Résultats", pt: "Resultados", hi: "परिणाम", zh: "结果", ar: "النتائج" },

  exitLabel: { en: "Exit", es: "Salir", fr: "Quitter", pt: "Sair", hi: "बाहर निकलें", zh: "退出", ar: "خروج" },
  stepOfLabel: { en: "Step", es: "Paso", fr: "Étape", pt: "Passo", hi: "चरण", zh: "步骤", ar: "الخطوة" },
  timeMeasureLabel: { en: "Time / measurement", es: "Tiempo / medida", fr: "Temps / mesure", pt: "Tempo / medida", hi: "समय / माप", zh: "时间／用量", ar: "الوقت / المقدار" },
  visualCueLabel: { en: "What it should look like", es: "Cómo debería verse", fr: "À quoi cela devrait ressembler", pt: "Como deve parecer", hi: "इसे कैसा दिखना चाहिए", zh: "应该是什么样子", ar: "كيف يجب أن يبدو" },
  alsoCheckLabel: { en: "Also check for", es: "También verifica", fr: "Vérifiez aussi", pt: "Também verifique", hi: "यह भी देखें", zh: "同时留意", ar: "تحقق أيضًا من" },

  niceWorkTitle: { en: "Nice work 🎉", es: "¡Buen trabajo! 🎉", fr: "Bien joué 🎉", pt: "Muito bem 🎉", hi: "बढ़िया काम 🎉", zh: "做得好 🎉", ar: "أحسنت 🎉" },
  youJustMade: { en: "You just made", es: "Acabas de hacer", fr: "Vous venez de préparer", pt: "Você acabou de fazer", hi: "आपने अभी बनाया", zh: "你刚刚做了", ar: "لقد صنعت للتو" },
  nutritionPerServing: { en: "Nutrition (per serving)", es: "Nutrición (por porción)", fr: "Nutrition (par portion)", pt: "Nutrição (por porção)", hi: "पोषण (प्रति सर्विंग)", zh: "营养成分（每份）", ar: "التغذية (لكل حصة)" },
  wantMoreFlavor: { en: "Want more flavor next time?", es: "¿Quieres más sabor la próxima vez?", fr: "Envie de plus de saveur la prochaine fois ?", pt: "Quer mais sabor da próxima vez?", hi: "अगली बार और स्वाद चाहिए?", zh: "下次想要更多风味吗？", ar: "تريد نكهة أكثر في المرة القادمة؟" },
  saveToHistory: { en: "Save to History", es: "Guardar en Historial", fr: "Enregistrer dans l'Historique", pt: "Salvar no Histórico", hi: "इतिहास में सहेजें", zh: "保存到历史记录", ar: "حفظ في السجل", ru: "Сохранить в историю", ta: "வரலாற்றில் சேமி" },
  caloriesWord: { en: "Calories", es: "Calorías", fr: "Calories", pt: "Calorias", hi: "कैलोरी", zh: "卡路里", ar: "سعرات حرارية", ru: "Калории", ta: "கலோரிகள்" },
  proteinWord: { en: "Protein", es: "Proteína", fr: "Protéines", pt: "Proteína", hi: "प्रोटीन", zh: "蛋白质", ar: "بروتين", ru: "Белки", ta: "புரதம்" },
  carbsWord: { en: "Carbs", es: "Carbohidratos", fr: "Glucides", pt: "Carboidratos", hi: "कार्ब्स", zh: "碳水化合物", ar: "كربوهيدرات", ru: "Углеводы", ta: "கார்போஹைட்ரேட்" },
  fatWord: { en: "Fat", es: "Grasa", fr: "Lipides", pt: "Gordura", hi: "वसा", zh: "脂肪", ar: "دهون", ru: "Жиры", ta: "கொழுப்பு" },
  macroHint: { en: "Moving one adjusts the other two so they always add up to 100%.", es: "Mover uno ajusta los otros dos para que siempre sumen 100%.", fr: "Déplacer l'un ajuste les deux autres pour toujours totaliser 100%.", pt: "Mover um ajusta os outros dois para sempre somar 100%.", hi: "एक को हिलाने से बाकी दो समायोजित होते हैं ताकि कुल हमेशा 100% रहे।", zh: "移动其中一个会自动调整另外两个，使总和始终为100%。", ar: "تحريك واحد يعدّل الاثنين الآخرين تلقائيًا ليبقى المجموع دائمًا 100%." },
  createRecipeTitle: { en: "Create a Recipe", es: "Crear una Receta", fr: "Créer une Recette", pt: "Criar uma Receita", hi: "एक रेसिपी बनाएं", zh: "创建菜谱", ar: "إنشاء وصفة" },
  editRecipeTitle: { en: "Edit Recipe", es: "Editar Receta", fr: "Modifier la Recette", pt: "Editar Receita", hi: "रेसिपी संपादित करें", zh: "编辑菜谱", ar: "تعديل الوصفة" },
  remixNoticeText: { en: "This is a My Sous recipe — saving will keep the original untouched and create your own personal twist instead.", es: "Esta es una receta de My Sous — al guardar, el original se mantiene intacto y se crea tu propia versión personal.", fr: "Ceci est une recette My Sous — l'enregistrement laissera l'original intact et créera votre propre version personnelle.", pt: "Esta é uma receita do My Sous — salvar manterá o original intacto e criará sua própria versão pessoal.", hi: "यह एक My Sous रेसिपी है — सहेजने से मूल अपरिवर्तित रहेगा और आपकी अपनी व्यक्तिगत रेसिपी बनेगी।", zh: "这是一道 My Sous 菜谱——保存后原版将保持不变，会为你创建专属的个人版本。", ar: "هذه وصفة من My Sous — الحفظ سيُبقي النسخة الأصلية كما هي وينشئ نسختك الشخصية الخاصة بدلاً من ذلك." },
  brandLabel: { en: "Brand", es: "Marca", fr: "Marque", pt: "Marca", hi: "ब्रांड", zh: "品牌", ar: "العلامة التجارية" },
  brandPlaceholder: { en: "e.g. Heinz", es: "ej. Heinz", fr: "ex. Heinz", pt: "ex. Heinz", hi: "जैसे Heinz", zh: "例如 亨氏", ar: "مثال: هاينز" },
  recipeNameLabel: { en: "Recipe name", es: "Nombre de la receta", fr: "Nom de la recette", pt: "Nome da receita", hi: "रेसिपी का नाम", zh: "菜谱名称", ar: "اسم الوصفة" },
  emojiLabel: { en: "Emoji", es: "Emoji", fr: "Emoji", pt: "Emoji", hi: "इमोजी", zh: "表情符号", ar: "الرمز التعبيري" },
  timeLabel: { en: "Time", es: "Tiempo", fr: "Temps", pt: "Tempo", hi: "समय", zh: "时间", ar: "الوقت" },
  macrosLabel: { en: "Nutrition (per serving)", es: "Nutrición (por porción)", fr: "Nutrition (par portion)", pt: "Nutrição (por porção)", hi: "पोषण (प्रति सर्विंग)", zh: "营养成分（每份）", ar: "التغذية (لكل حصة)" },
  stepsLabel: { en: "Steps", es: "Pasos", fr: "Étapes", pt: "Passos", hi: "चरण", zh: "步骤", ar: "الخطوات" },
  addStepLabel: { en: "+ Add step", es: "+ Añadir paso", fr: "+ Ajouter une étape", pt: "+ Adicionar passo", hi: "+ चरण जोड़ें", zh: "+ 添加步骤", ar: "+ أضف خطوة" },
  instructionPlaceholder: { en: "What do you do in this step?", es: "¿Qué haces en este paso?", fr: "Que faites-vous à cette étape ?", pt: "O que você faz nesta etapa?", hi: "इस चरण में आप क्या करते हैं?", zh: "这一步要做什么？", ar: "ماذا تفعل في هذه الخطوة؟" },
  measurePlaceholder: { en: "Time / measurement (e.g. 2 cups, 5 min)", es: "Tiempo / medida (ej. 2 tazas, 5 min)", fr: "Temps / mesure (ex. 2 tasses, 5 min)", pt: "Tempo / medida (ex. 2 xícaras, 5 min)", hi: "समय / माप (जैसे 2 कप, 5 मिनट)", zh: "时间／用量（例如 2杯，5分钟）", ar: "الوقت / المقدار (مثال: كوبان، 5 دقائق)" },
  visualPlaceholder: { en: "What should it look like?", es: "¿Cómo debería verse?", fr: "À quoi cela devrait ressembler ?", pt: "Como deve parecer?", hi: "इसे कैसा दिखना चाहिए?", zh: "应该是什么样子？", ar: "كيف يجب أن يبدو؟" },
  flavorBoostsLabel: { en: "Flavor boosts (optional)", es: "Mejoras de sabor (opcional)", fr: "Astuces de saveur (facultatif)", pt: "Toques de sabor (opcional)", hi: "स्वाद बढ़ाने के तरीके (वैकल्पिक)", zh: "风味提升（可选）", ar: "إضافات النكهة (اختياري)" },
  addFlavorPlaceholder: { en: "Add a flavor tip…", es: "Añade un consejo de sabor…", fr: "Ajoutez une astuce de saveur…", pt: "Adicione uma dica de sabor…", hi: "एक स्वाद सुझाव जोड़ें…", zh: "添加风味小贴士…", ar: "أضف نصيحة نكهة…" },
  personalNoteLabel: { en: "Personal note (optional)", es: "Nota personal (opcional)", fr: "Note personnelle (facultatif)", pt: "Nota pessoal (opcional)", hi: "व्यक्तिगत नोट (वैकल्पिक)", zh: "个人备注（可选）", ar: "ملاحظة شخصية (اختياري)" },
  saveRecipeLabel: { en: "Save Recipe", es: "Guardar Receta", fr: "Enregistrer la Recette", pt: "Salvar Receita", hi: "रेसिपी सहेजें", zh: "保存菜谱", ar: "حفظ الوصفة" },
  myRecipesLabel: { en: "My Recipes", es: "Mis Recetas", fr: "Mes Recettes", pt: "Minhas Receitas", hi: "मेरी रेसिपी", zh: "我的菜谱", ar: "وصفاتي" },
  savedRecipesLabel: { en: "Saved", es: "Guardado", fr: "Enregistré", pt: "Salvo", hi: "सहेजा गया", zh: "已保存", ar: "المحفوظة" },
  createNewRecipeLabel: { en: "+ Create your own recipe", es: "+ Crea tu propia receta", fr: "+ Créez votre propre recette", pt: "+ Crie sua própria receita", hi: "+ अपनी रेसिपी बनाएं", zh: "+ 创建你自己的菜谱", ar: "+ أنشئ وصفتك الخاصة" },
  editButtonLabel: { en: "Edit", es: "Editar", fr: "Modifier", pt: "Editar", hi: "संपादित करें", zh: "编辑", ar: "تعديل" },
  remixButtonLabel: { en: "Personalize", es: "Personalizar", fr: "Personnaliser", pt: "Personalizar", hi: "अनुकूलित करें", zh: "个性化", ar: "تخصيص" },
  shareButtonLabel: { en: "Share", es: "Compartir", fr: "Partager", pt: "Compartilhar", hi: "साझा करें", zh: "分享", ar: "مشاركة" },
  deleteButtonLabel: { en: "Delete", es: "Eliminar", fr: "Supprimer", pt: "Excluir", hi: "हटाएं", zh: "删除", ar: "حذف" },
  yourTwistOnLabel: { en: "Your twist on", es: "Tu versión de", fr: "Votre version de", pt: "Sua versão de", hi: "आपका संस्करण", zh: "你改编自", ar: "نسختك الخاصة من" },
  noPersonalRecipesYet: { en: "You haven't created any recipes yet.", es: "Aún no has creado ninguna receta.", fr: "Vous n'avez pas encore créé de recette.", pt: "Você ainda não criou nenhuma receita.", hi: "आपने अभी तक कोई रेसिपी नहीं बनाई है।", zh: "你还没有创建任何菜谱。", ar: "لم تنشئ أي وصفات بعد." },

  addNotePlaceholder: { en: "Add a note (optional)…", es: "Añade una nota (opcional)…", fr: "Ajoutez une note (facultatif)…", pt: "Adicione uma nota (opcional)…", hi: "एक नोट जोड़ें (वैकल्पिक)…", zh: "添加备注（可选）…", ar: "أضف ملاحظة (اختياري)…" },
  nothingCookedYet: { en: "Nothing cooked yet — finish a recipe to see it here.", es: "Nada cocinado todavía — termina una receta para verla aquí.", fr: "Rien de cuisiné encore — terminez une recette pour la voir ici.", pt: "Nada cozinhado ainda — termine uma receita para vê-la aqui.", hi: "अभी तक कुछ नहीं पकाया — यहां देखने के लिए एक रेसिपी पूरी करें।", zh: "还没有做过菜——完成一道菜谱后会显示在这里。", ar: "لم يتم طهي شيء بعد — أنهِ وصفة لرؤيتها هنا." },

  moreSubtitle: { en: "Everything else, in one place", es: "Todo lo demás, en un solo lugar", fr: "Tout le reste, au même endroit", pt: "Tudo mais, em um só lugar", hi: "बाकी सब कुछ, एक ही जगह", zh: "其他一切，都在这里", ar: "كل شيء آخر، في مكان واحد" },
  historySub: { en: "Meals cooked, ratings, achievements", es: "Comidas cocinadas, calificaciones, logros", fr: "Repas cuisinés, notes, succès", pt: "Refeições cozinhadas, avaliações, conquistas", hi: "पके भोजन, रेटिंग, उपलब्धियां", zh: "已做的菜、评分、成就", ar: "الوجبات المطبوخة، التقييمات، الإنجازات" },
  cookbookSub: { en: "Your saved recipes", es: "Tus recetas guardadas", fr: "Vos recettes enregistrées", pt: "Suas receitas salvas", hi: "आपकी सहेजी गई रेसिपी", zh: "你保存的菜谱", ar: "وصفاتك المحفوظة" },
  communitySub: { en: "Tips, ratings and tutorials from other cooks", es: "Consejos, calificaciones y tutoriales de otros cocineros", fr: "Astuces, notes et tutoriels d'autres cuisiniers", pt: "Dicas, avaliações e tutoriais de outros cozinheiros", hi: "दूसरे रसोइयों के टिप्स, रेटिंग और ट्यूटोरियल", zh: "来自其他厨师的技巧、评分和教程", ar: "نصائح وتقييمات ودروس من طهاة آخرين" },
  shoppingSub: { en: "What to buy next", es: "Qué comprar después", fr: "Quoi acheter ensuite", pt: "O que comprar a seguir", hi: "आगे क्या खरीदें", zh: "接下来该买什么", ar: "ماذا تشتري بعد ذلك" },
  glossaryLabel: { en: "Nutrition Glossary", es: "Glosario Nutricional", fr: "Glossaire Nutritionnel", pt: "Glossário Nutricional", hi: "पोषण शब्दावली", zh: "营养词典", ar: "مسرد التغذية" },
  glossarySub: { en: "Macros for common ingredients", es: "Macros de ingredientes comunes", fr: "Macros des ingrédients courants", pt: "Macros de ingredientes comuns", hi: "सामान्य सामग्री के मैक्रोज़", zh: "常见食材的宏量营养素", ar: "المغذيات الكبرى للمكونات الشائعة" },
  glossarySearchPlaceholder: { en: "Search an ingredient…", es: "Buscar un ingrediente…", fr: "Rechercher un ingrédient…", pt: "Buscar um ingrediente…", hi: "एक सामग्री खोजें…", zh: "搜索食材…", ar: "ابحث عن مكوّن…" },
  whereToBuyLabel: { en: "Where to Buy", es: "Dónde Comprar", fr: "Où Acheter", pt: "Onde Comprar", hi: "कहाँ से खरीदें", zh: "在哪里购买", ar: "أين تشتري" },
  whereToBuySub: { en: "What you have and where to find what you don't", es: "Lo que tienes y dónde encontrar lo que no", fr: "Ce que vous avez et où trouver ce qu'il vous manque", pt: "O que você tem e onde encontrar o que falta", hi: "आपके पास क्या है और जो नहीं है वह कहाँ मिलेगा", zh: "你已拥有的和还需寻找的", ar: "ما تملكه وأين تجد ما ينقصك" },
  storeListDisclaimer: { en: "Tap a store to open its website — this is a general list, not based on your exact location or live stock.", es: "Toca una tienda para abrir su sitio web — esta es una lista general, no basada en tu ubicación exacta ni en existencias en vivo.", fr: "Appuyez sur un magasin pour ouvrir son site — il s'agit d'une liste générale, pas basée sur votre position exacte ni sur le stock en temps réel.", pt: "Toque numa loja para abrir o site — esta é uma lista geral, não baseada na sua localização exata ou estoque em tempo real.", hi: "किसी स्टोर की वेबसाइट खोलने के लिए टैप करें — यह एक सामान्य सूची है, आपकी सटीक लोकेशन या लाइव स्टॉक पर आधारित नहीं है।", zh: "点击商店可打开其官网——这是一份通用列表，并非根据你的确切位置或实时库存生成。", ar: "اضغط على متجر لفتح موقعه الإلكتروني — هذه قائمة عامة، وليست مبنية على موقعك الدقيق أو المخزون الفعلي." },
  ingredientCountryLabel: { en: "Search ingredients in", es: "Buscar ingredientes en", fr: "Rechercher les ingrédients en", pt: "Buscar ingredientes em", hi: "सामग्री यहाँ खोजें", zh: "在此国家搜索食材", ar: "ابحث عن المكونات في" },
  liveCheckLabel: { en: "Ask Claude where to buy", es: "Preguntar a Claude dónde comprar", fr: "Demander à Claude où acheter", pt: "Perguntar ao Claude onde comprar", hi: "Claude से पूछें कहाँ खरीदें", zh: "问 Claude 去哪里买", ar: "اسأل Claude أين تشتري" },
  liveCheckLoading: { en: "Asking Claude…", es: "Preguntando a Claude…", fr: "Claude réfléchit…", pt: "Perguntando ao Claude…", hi: "Claude से पूछ रहे हैं…", zh: "正在询问 Claude…", ar: "جارٍ سؤال Claude…" },
  liveCheckError: { en: "Claude couldn't answer right now.", es: "Claude no pudo responder ahora.", fr: "Claude n'a pas pu répondre pour l'instant.", pt: "O Claude não conseguiu responder agora.", hi: "Claude अभी जवाब नहीं दे सका।", zh: "Claude 暂时无法回答。", ar: "تعذر على Claude الإجابة الآن." },
  liveCheckBusy: { en: "Too many questions at once. Try again in a little while.", es: "Demasiadas preguntas a la vez. Inténtalo de nuevo en un rato.", fr: "Trop de questions d'un coup. Réessayez dans un moment.", pt: "Perguntas demais de uma vez. Tente de novo daqui a pouco.", hi: "एक साथ बहुत सारे सवाल। थोड़ी देर बाद फिर कोशिश करें।", zh: "提问太频繁，请稍后再试。", ar: "أسئلة كثيرة دفعة واحدة. حاول مجددًا بعد قليل." },
  liveCheckEmpty: { en: "Claude didn't have a suggestion for this one.", es: "Claude no tuvo sugerencias para este producto.", fr: "Claude n'a pas de suggestion pour celui-ci.", pt: "O Claude não teve sugestão para este item.", hi: "Claude के पास इसके लिए कोई सुझाव नहीं था।", zh: "Claude 对这一项没有建议。", ar: "لم يكن لدى Claude اقتراح لهذا العنصر." },
  liveCheckNote: { en: "From Claude's general knowledge, not live stock. Use the store links to check.", es: "Según el conocimiento general de Claude, no es stock en vivo. Usa los enlaces de tiendas para comprobar.", fr: "D'après les connaissances générales de Claude, pas le stock en direct. Vérifiez avec les liens des magasins.", pt: "Com base no conhecimento geral do Claude, não no estoque ao vivo. Use os links das lojas para conferir.", hi: "Claude की सामान्य जानकारी से, लाइव स्टॉक नहीं। जाँचने के लिए स्टोर लिंक देखें।", zh: "基于 Claude 的常识，并非实时库存。请用商店链接确认。", ar: "من معرفة Claude العامة وليس المخزون الحالي. استخدم روابط المتاجر للتحقق." },
  retryLabel: { en: "Retry", es: "Reintentar", fr: "Réessayer", pt: "Tentar novamente", hi: "फिर से कोशिश करें", zh: "重试", ar: "أعد المحاولة" },
  equipmentSectionTitle: { en: "Equipment", es: "Equipo", fr: "Matériel", pt: "Equipamento", hi: "उपकरण", zh: "厨具", ar: "المعدات" },
  ingredientsSectionTitle: { en: "Ingredients you're missing", es: "Ingredientes que te faltan", fr: "Ingrédients qui vous manquent", pt: "Ingredientes que faltam", hi: "जो सामग्री नहीं है", zh: "你缺少的食材", ar: "المكونات الناقصة" },
  ownedLabel: { en: "Owned", es: "Tienes", fr: "Possédé", pt: "Você tem", hi: "मौजूद है", zh: "已拥有", ar: "متوفر" },
  missingLabel: { en: "Missing", es: "Falta", fr: "Manquant", pt: "Faltando", hi: "गायब", zh: "缺少", ar: "ناقص" },
  groceryStoreLabel: { en: "🛒 Grocery store", es: "🛒 Supermercado", fr: "🛒 Épicerie", pt: "🛒 Mercado", hi: "🛒 किराना स्टोर", zh: "🛒 杂货店", ar: "🛒 متجر بقالة" },
  bigBoxStoreLabel: { en: "🏪 Big-box store", es: "🏪 Tienda grande", fr: "🏪 Grande surface", pt: "🏪 Loja de departamento", hi: "🏪 बड़ा स्टोर", zh: "🏪 大型商场", ar: "🏪 متجر كبير" },
  onlineStoreLabel: { en: "📦 Online", es: "📦 En línea", fr: "📦 En ligne", pt: "📦 Online", hi: "📦 ऑनलाइन", zh: "📦 网购", ar: "📦 عبر الإنترنت" },
  housewareStoreLabel: { en: "🍳 Kitchen/houseware store", es: "🍳 Tienda de cocina", fr: "🍳 Magasin d'ustensiles", pt: "🍳 Loja de utensílios", hi: "🍳 किचनवेयर स्टोर", zh: "🍳 厨具店", ar: "🍳 متجر أدوات مطبخ" },
  secondhandLabel: { en: "♻️ Secondhand/thrift", es: "♻️ Segunda mano", fr: "♻️ Occasion", pt: "♻️ Usado/brechó", hi: "♻️ सेकंडहैंड", zh: "♻️ 二手商店", ar: "♻️ مستعمل" },
  noMissingIngredientsText: { en: "Nothing missing right now — check back once you're closer to a new recipe.", es: "No falta nada por ahora — vuelve cuando estés más cerca de una nueva receta.", fr: "Rien ne manque pour le moment — revenez quand vous serez plus proche d'une nouvelle recette.", pt: "Nada faltando agora — volte quando estiver mais perto de uma nova receita.", hi: "अभी कुछ भी गायब नहीं है — किसी नई रेसिपी के करीब होने पर वापस देखें।", zh: "目前没有缺少的东西——等你更接近解锁新菜谱时再来看看。", ar: "لا شيء ناقص الآن — عد عندما تقترب من وصفة جديدة." },
  glossaryEmpty: { en: "No ingredients match that search.", es: "Ningún ingrediente coincide con esa búsqueda.", fr: "Aucun ingrédient ne correspond à cette recherche.", pt: "Nenhum ingrediente corresponde a essa busca.", hi: "उस खोज से कोई सामग्री मेल नहीं खाती।", zh: "没有符合该搜索的食材。", ar: "لا توجد مكونات تطابق هذا البحث." },
  aiGreeting: { en: "Hey! I'm your Sous-Chef. Ask me anything about a recipe, a substitution, or a technique.", es: "¡Hola! Soy tu Sous-Chef. Pregúntame lo que quieras sobre una receta, un sustituto o una técnica.", fr: "Salut ! Je suis votre Sous-Chef. Demandez-moi tout sur une recette, un remplacement ou une technique.", pt: "Oi! Sou seu Sous-Chef. Pergunte qualquer coisa sobre uma receita, uma substituição ou uma técnica.", hi: "नमस्ते! मैं आपका सू-शेफ हूँ। रेसिपी, विकल्प, या तकनीक के बारे में कुछ भी पूछें।", zh: "嗨！我是你的副厨师。随时问我关于食谱、替代品或技巧的任何问题。", ar: "مرحبًا! أنا مساعد الطاهي الخاص بك. اسألني أي شيء عن وصفة أو بديل أو تقنية." },
  askSousChefPlaceholder: { en: "Ask the Sous-Chef…", es: "Pregúntale al Sous-Chef…", fr: "Demandez au Sous-Chef…", pt: "Pergunte ao Sous-Chef…", hi: "सू-शेफ से पूछें…", zh: "问问副厨师…", ar: "اسأل مساعد الطاهي…" },
  settingsSub: { en: "Profile, targets, dietary preference", es: "Perfil, objetivos, preferencia alimentaria", fr: "Profil, objectifs, préférence alimentaire", pt: "Perfil, metas, preferência alimentar", hi: "प्रोफ़ाइल, लक्ष्य, आहार वरीयता", zh: "个人资料、目标、饮食偏好", ar: "الملف الشخصي، الأهداف، التفضيلات الغذائية" },

  cookbookHeaderSub: { en: "Recipes you've saved to make again", es: "Recetas que guardaste para hacer de nuevo", fr: "Recettes que vous avez enregistrées pour refaire", pt: "Receitas que você salvou para fazer de novo", hi: "आपकी सहेजी गई रेसिपी जिन्हें आप फिर बनाएंगे", zh: "你保存下来准备再次制作的菜谱", ar: "الوصفات التي حفظتها لصنعها مرة أخرى" },
  cookbookEmpty: { en: "Tap the heart on any recipe to save it here.", es: "Toca el corazón en cualquier receta para guardarla aquí.", fr: "Appuyez sur le cœur d'une recette pour l'enregistrer ici.", pt: "Toque no coração de qualquer receita para salvá-la aqui.", hi: "किसी भी रेसिपी को यहां सहेजने के लिए हार्ट पर टैप करें।", zh: "点击任意菜谱上的爱心即可保存到这里。", ar: "اضغط على القلب في أي وصفة لحفظها هنا." },
  personalNotePlaceholder: { en: "Add a personal note…", es: "Añade una nota personal…", fr: "Ajoutez une note personnelle…", pt: "Adicione uma nota pessoal…", hi: "एक व्यक्तिगत नोट जोड़ें…", zh: "添加个人备注…", ar: "أضف ملاحظة شخصية…" },
  cookThisLabel: { en: "Cook this", es: "Cocinar esto", fr: "Cuisiner ceci", pt: "Cozinhar isso", hi: "इसे पकाएं", zh: "做这道菜", ar: "اطبخ هذا" },

  communityHeaderSub: { en: "Learn from other cooks. Share tips, rate recipes, suggest improvements and post short tutorials.", es: "Aprende de otros cocineros. Comparte consejos, califica recetas, sugiere mejoras y publica tutoriales cortos.", fr: "Apprenez des autres cuisiniers. Partagez des astuces, notez des recettes, proposez des améliorations et publiez de courts tutoriels.", pt: "Aprenda com outros cozinheiros. Compartilhe dicas, avalie receitas, sugira melhorias e publique tutoriais curtos.", hi: "दूसरे रसोइयों से सीखें। टिप्स साझा करें, रेसिपी रेट करें, सुधार सुझाएं और छोटे ट्यूटोरियल पोस्ट करें।", zh: "向其他厨师学习：分享技巧、给食谱评分、提出改进建议、发布短教程。", ar: "تعلّم من طهاة آخرين. شارك النصائح وقيّم الوصفات واقترح تحسينات وانشر دروسًا قصيرة." },
  shareTipPlaceholder: { en: "Share a tip…", es: "Comparte un consejo…", fr: "Partagez une astuce…", pt: "Compartilhe uma dica…", hi: "एक सुझाव साझा करें…", zh: "分享一个小贴士…", ar: "شارك نصيحة…" },

  shoppingHeaderSub: { en: "What to buy next, based on what's almost ready", es: "Qué comprar después, según lo que está casi listo", fr: "Quoi acheter ensuite, selon ce qui est presque prêt", pt: "O que comprar a seguir, com base no que está quase pronto", hi: "आगे क्या खरीदें, जो लगभग तैयार है उसके आधार पर", zh: "根据即将凑齐的菜谱，接下来该买什么", ar: "ماذا تشتري بعد ذلك، بناءً على ما هو قريب من الاكتمال" },
  suggestedUnlocks: { en: "Suggested — unlocks the most recipes", es: "Sugerido — desbloquea más recetas", fr: "Suggéré — débloque le plus de recettes", pt: "Sugerido — desbloqueia mais receitas", hi: "सुझाया गया — सबसे अधिक रेसिपी अनलॉक करता है", zh: "推荐——解锁最多菜谱", ar: "مقترح — يفتح أكبر عدد من الوصفات" },
  yourListLabel: { en: "Your list", es: "Tu lista", fr: "Votre liste", pt: "Sua lista", hi: "आपकी सूची", zh: "你的清单", ar: "قائمتك" },
  addItemPlaceholder: { en: "Add an item…", es: "Añade un artículo…", fr: "Ajoutez un article…", pt: "Adicione um item…", hi: "एक आइटम जोड़ें…", zh: "添加一项…", ar: "أضف عنصرًا…" },
  emptyListText: { en: "Your list is empty.", es: "Tu lista está vacía.", fr: "Votre liste est vide.", pt: "Sua lista está vazia.", hi: "आपकी सूची खाली है।", zh: "你的清单是空的。", ar: "قائمتك فارغة." },
  addLabel: { en: "Add", es: "Añadir", fr: "Ajouter", pt: "Adicionar", hi: "जोड़ें", zh: "添加", ar: "أضف" },
  checkedToKitchenLabel: { en: "checked to My Kitchen", es: "marcados a Mi Cocina", fr: "cochés à Ma Cuisine", pt: "marcados à Minha Cozinha", hi: "चेक किए गए मेरी रसोई में", zh: "项已勾选的加入我的厨房", ar: "المحدد إلى مطبخي" },

  achievementFirstMeal: { en: "First Meal", es: "Primera comida", fr: "Premier repas", pt: "Primeira refeição", hi: "पहला भोजन", zh: "第一道菜", ar: "أول وجبة" },
  achievement5Meals: { en: "5 Meals Cooked", es: "5 comidas cocinadas", fr: "5 repas cuisinés", pt: "5 refeições cozinhadas", hi: "5 भोजन पके", zh: "已做5道菜", ar: "5 وجبات مطبوخة" },
  achievement10Meals: { en: "10 Meals Cooked", es: "10 comidas cocinadas", fr: "10 repas cuisinés", pt: "10 refeições cozinhadas", hi: "10 भोजन पके", zh: "已做10道菜", ar: "10 وجبات مطبوخة" },
  achievementKitchenPro: { en: "Kitchen Pro", es: "Experto de cocina", fr: "Pro de la cuisine", pt: "Pro da cozinha", hi: "किचन प्रो", zh: "厨房达人", ar: "محترف المطبخ" },

  targetsSubtitle: { en: "We recommend your targets from your profile — adjust manually below if anything feels off.", es: "Recomendamos tus objetivos según tu perfil — ajusta manualmente abajo si algo no se siente bien.", fr: "Nous recommandons vos objectifs selon votre profil — ajustez manuellement ci-dessous si besoin.", pt: "Recomendamos suas metas com base no seu perfil — ajuste manualmente abaixo se algo parecer errado.", hi: "हम आपकी प्रोफ़ाइल से आपके लक्ष्यों की सिफारिश करते हैं — यदि कुछ ठीक न लगे तो नीचे मैन्युअल रूप से समायोजित करें।", zh: "我们会根据你的资料推荐目标——如果感觉不合适，可以在下方手动调整。", ar: "نوصي بأهدافك بناءً على ملفك الشخصي — عدّلها يدويًا أدناه إذا شعرت أن شيئًا غير مناسب." },
  adjustManuallyLabel: { en: "Adjust manually", es: "Ajustar manualmente", fr: "Ajuster manuellement", pt: "Ajustar manualmente", hi: "मैन्युअल रूप से समायोजित करें", zh: "手动调整", ar: "تعديل يدوي" },
  saveTargetsLabel: { en: "Save targets", es: "Guardar objetivos", fr: "Enregistrer les objectifs", pt: "Salvar metas", hi: "लक्ष्य सहेजें", zh: "保存目标", ar: "حفظ الأهداف" },
  clearAllIngredients: { en: "Clear all ingredients", es: "Borrar todos los ingredientes", fr: "Effacer tous les ingrédients", pt: "Limpar todos os ingredientes", hi: "सभी सामग्री साफ़ करें", zh: "清空所有食材", ar: "مسح كل المكونات" },
  dietaryHint: { en: "Applied as a default filter in Cook — you can still change it there.", es: "Se aplica como filtro predeterminado en Cocinar — aún puedes cambiarlo allí.", fr: "Appliqué comme filtre par défaut dans Cuisiner — vous pouvez toujours le modifier là-bas.", pt: "Aplicado como filtro padrão em Cozinhar — você ainda pode mudar lá.", hi: "कुक में डिफ़ॉल्ट फ़िल्टर के रूप में लागू — आप इसे वहां भी बदल सकते हैं।", zh: "已作为“烹饪”页面的默认筛选条件应用——你仍可以在那里更改。", ar: "يُطبَّق كفلتر افتراضي في صفحة الطبخ — يمكنك تغييره هناك." },
};

const LanguageContext = createContext({ language: "en", t: (key) => TRANSLATIONS[key]?.en ?? key });

const INGREDIENT_TR = {
  ...WORLD_INGREDIENT_TR,
  "almonds": { en: "almonds", es: "almendras", fr: "amandes", pt: "amêndoas", hi: "बादाम", zh: "杏仁", ar: "لوز" },
  "apple": { en: "apple", es: "manzana", fr: "pomme", pt: "maçã", hi: "सेब", zh: "苹果", ar: "تفاح" },
  "baking powder": { en: "baking powder", es: "polvo de hornear", fr: "levure chimique", pt: "fermento em pó", hi: "बेकिंग पाउडर", zh: "泡打粉", ar: "بيكنغ باودر" },
  "beer": { en: "beer", es: "cerveza", fr: "bière", pt: "cerveja", hi: "बीयर", zh: "啤酒", ar: "بيرة" },
  "beet": { en: "beet", es: "remolacha", fr: "betterave", pt: "beterraba", hi: "चुकंदर", zh: "甜菜根", ar: "شمندر" },
  "breadcrumbs": { en: "breadcrumbs", es: "pan rallado", fr: "chapelure", pt: "farinha de rosca", hi: "ब्रेडक्रंब", zh: "面包糠", ar: "فتات الخبز" },
  "brussels sprouts": { en: "brussels sprouts", es: "coles de Bruselas", fr: "choux de Bruxelles", pt: "couve de Bruxelas", hi: "ब्रसेल्स स्प्राउट्स", zh: "抱子甘蓝", ar: "كرنب بروكسل" },
  "chicken wings": { en: "chicken wings", es: "alitas de pollo", fr: "ailes de poulet", pt: "asas de frango", hi: "चिकन विंग्स", zh: "鸡翅", ar: "أجنحة دجاج" },
  "chickpea flour": { en: "chickpea flour", es: "harina de garbanzo", fr: "farine de pois chiche", pt: "farinha de grão-de-bico", hi: "बेसन", zh: "鹰嘴豆粉", ar: "دقيق الحمص" },
  "cod": { en: "cod", es: "bacalao", fr: "cabillaud", pt: "bacalhau", hi: "कॉड मछली", zh: "鳕鱼", ar: "سمك القد" },
  "empanada dough": { en: "empanada dough", es: "masa para empanadas", fr: "pâte à empanada", pt: "massa de pastel", hi: "एम्पनाडा आटा", zh: "恩帕纳达面团", ar: "عجينة الإمبانادا" },
  "green beans": { en: "green beans", es: "judías verdes", fr: "haricots verts", pt: "vagem", hi: "हरी फलियाँ", zh: "四季豆", ar: "فاصولياء خضراء" },
  "green curry paste": { en: "green curry paste", es: "pasta de curry verde", fr: "pâte de curry vert", pt: "pasta de curry verde", hi: "हरी करी पेस्ट", zh: "青咖喱酱", ar: "معجون الكاري الأخضر" },
  "kale": { en: "kale", es: "col rizada", fr: "chou frisé", pt: "couve", hi: "केल", zh: "羽衣甘蓝", ar: "كرنب" },
  "ketchup": { en: "ketchup", es: "kétchup", fr: "ketchup", pt: "ketchup", hi: "केचप", zh: "番茄酱", ar: "كاتشب" },
  "lemongrass": { en: "lemongrass", es: "citronela", fr: "citronnelle", pt: "capim-limão", hi: "लेमनग्रास", zh: "香茅", ar: "عشب الليمون" },
  "mango": { en: "mango", es: "mango", fr: "mangue", pt: "manga", hi: "आम", zh: "芒果", ar: "مانجو" },
  "oil": { en: "oil", es: "aceite", fr: "huile", pt: "óleo", hi: "तेल", zh: "油", ar: "زيت" },
  "peas": { en: "peas", es: "guisantes", fr: "petits pois", pt: "ervilhas", hi: "मटर", zh: "豌豆", ar: "بازلاء" },
  "plantain": { en: "plantain", es: "plátano macho", fr: "banane plantain", pt: "banana-da-terra", hi: "प्लांटेन", zh: "大蕉", ar: "موز البلانتين" },
  "pork belly": { en: "pork belly", es: "panceta de cerdo", fr: "poitrine de porc", pt: "barriga de porco", hi: "पोर्क बेली", zh: "五花肉", ar: "صدر الخنزير" },
  "pork chops": { en: "pork chops", es: "chuletas de cerdo", fr: "côtelettes de porc", pt: "costeletas de porco", hi: "पोर्क चॉप्स", zh: "猪排", ar: "شرائح لحم الخنزير" },
  "spring roll wrappers": { en: "spring roll wrappers", es: "obleas para rollitos", fr: "feuilles de rouleaux de printemps", pt: "massa para rolinho primavera", hi: "स्प्रिंग रोल रैपर", zh: "春卷皮", ar: "ورق لفائف الربيع" },
  "steak": { en: "steak", es: "bistec", fr: "steak", pt: "bife", hi: "स्टेक", zh: "牛排", ar: "ستيك" },
  "sugar": { en: "sugar", es: "azúcar", fr: "sucre", pt: "açúcar", hi: "चीनी", zh: "糖", ar: "سكر" },
  "tapioca flour": { en: "tapioca flour", es: "harina de tapioca", fr: "farine de tapioca", pt: "polvilho", hi: "टैपिओका आटा", zh: "木薯粉", ar: "دقيق التابيوكا" },
  "asparagus": { en: "asparagus", es: "espárragos", fr: "asperges", pt: "aspargos", hi: "शतावरी" },
  "avocado": { en: "avocado", es: "aguacate", fr: "avocat", pt: "abacate", hi: "एवोकाडो" },
  "bacon": { en: "bacon", es: "tocino", fr: "bacon", pt: "bacon", hi: "बेकन" },
  "banana": { en: "banana", es: "plátano", fr: "banane", pt: "banana", hi: "केला" },
  "basil": { en: "basil", es: "albahaca", fr: "basilic", pt: "manjericão", hi: "तुलसी" },
  "bean sprouts": { en: "bean sprouts", es: "brotes de soja", fr: "germes de soja", pt: "brotos de feijão", hi: "बीन स्प्राउट्स" },
  "beef": { en: "beef", es: "carne de res", fr: "bœuf", pt: "carne bovina", hi: "गोमांस" },
  "beef broth": { en: "beef broth", es: "caldo de res", fr: "bouillon de bœuf", pt: "caldo de carne", hi: "गोमांस शोरबा" },
  "beef strips": { en: "beef strips", es: "tiras de carne", fr: "lanières de bœuf", pt: "tiras de carne", hi: "गोमांस की पट्टियां" },
  "bell pepper": { en: "bell pepper", es: "pimiento", fr: "poivron", pt: "pimentão", hi: "शिमला मिर्च" },
  "berbere spice": { en: "berbere spice", es: "especia berbere", fr: "épice berbéré", pt: "especiaria berbere", hi: "बरबरे मसाला" },
  "berries": { en: "berries", es: "bayas", fr: "baies", pt: "frutas vermelhas", hi: "बेरीज़" },
  "bread": { en: "bread", es: "pan", fr: "pain", pt: "pão", hi: "ब्रेड" },
  "broccoli": { en: "broccoli", es: "brócoli", fr: "brocoli", pt: "brócolis", hi: "ब्रोकली" },
  "bulgur": { en: "bulgur", es: "bulgur", fr: "boulgour", pt: "bulgur", hi: "दलिया गेहूं" },
  "butter": { en: "butter", es: "mantequilla", fr: "beurre", pt: "manteiga", hi: "मक्खन" },
  "butternut squash": { en: "butternut squash", es: "calabaza butternut", fr: "courge butternut", pt: "abóbora butternut", hi: "कद्दू" },
  "cabbage": { en: "cabbage", es: "repollo", fr: "chou", pt: "repolho", hi: "पत्ता गोभी" },
  "caesar dressing": { en: "caesar dressing", es: "aderezo césar", fr: "sauce césar", pt: "molho caesar", hi: "सीज़र ड्रेसिंग" },
  "canned black beans": { en: "canned black beans", es: "frijoles negros enlatados", fr: "haricots noirs en conserve", pt: "feijão preto enlatado", hi: "डिब्बाबंद काली फलियाँ" },
  "canned chickpeas": { en: "canned chickpeas", es: "garbanzos enlatados", fr: "pois chiches en conserve", pt: "grão-de-bico enlatado", hi: "डिब्बाबंद छोले" },
  "canned kidney beans": { en: "canned kidney beans", es: "frijoles rojos enlatados", fr: "haricots rouges en conserve", pt: "feijão vermelho enlatado", hi: "डिब्बाबंद राजमा" },
  "canned tomatoes": { en: "canned tomatoes", es: "tomates enlatados", fr: "tomates en conserve", pt: "tomate enlatado", hi: "डिब्बाबंद टमाटर" },
  "canned tuna": { en: "canned tuna", es: "atún enlatado", fr: "thon en conserve", pt: "atum enlatado", hi: "डिब्बाबंद टूना" },
  "carrot": { en: "carrot", es: "zanahoria", fr: "carotte", pt: "cenoura", hi: "गाजर" },
  "cauliflower": { en: "cauliflower", es: "coliflor", fr: "chou-fleur", pt: "couve-flor", hi: "फूलगोभी" },
  "celery": { en: "celery", es: "apio", fr: "céleri", pt: "aipo", hi: "अजवाइन" },
  "cheese": { en: "cheese", es: "queso", fr: "fromage", pt: "queijo", hi: "पनीर (चीज़)" },
  "cherry tomatoes": { en: "cherry tomatoes", es: "tomates cherry", fr: "tomates cerises", pt: "tomate cereja", hi: "चेरी टमाटर" },
  "chia seeds": { en: "chia seeds", es: "semillas de chía", fr: "graines de chia", pt: "sementes de chia", hi: "चिया बीज" },
  "chicken breast": { en: "chicken breast", es: "pechuga de pollo", fr: "blanc de poulet", pt: "peito de frango", hi: "चिकन ब्रेस्ट" },
  "chicken broth": { en: "chicken broth", es: "caldo de pollo", fr: "bouillon de poulet", pt: "caldo de galinha", hi: "चिकन शोरबा" },
  "chicken thighs": { en: "chicken thighs", es: "muslos de pollo", fr: "cuisses de poulet", pt: "coxa de frango", hi: "चिकन थाई" },
  "chili flakes": { en: "chili flakes", es: "hojuelas de chile", fr: "flocons de piment", pt: "flocos de pimenta", hi: "मिर्च के टुकड़े" },
  "cinnamon": { en: "cinnamon", es: "canela", fr: "cannelle", pt: "canela", hi: "दालचीनी" },
  "coconut milk": { en: "coconut milk", es: "leche de coco", fr: "lait de coco", pt: "leite de coco", hi: "नारियल का दूध" },
  "corn": { en: "corn", es: "maíz", fr: "maïs", pt: "milho", hi: "मक्का" },
  "cornstarch": { en: "cornstarch", es: "maicena", fr: "fécule de maïs", pt: "amido de milho", hi: "कॉर्नस्टार्च" },
  "cream": { en: "cream", es: "crema", fr: "crème", pt: "creme de leite", hi: "क्रीम" },
  "cucumber": { en: "cucumber", es: "pepino", fr: "concombre", pt: "pepino", hi: "खीरा" },
  "cumin": { en: "cumin", es: "comino", fr: "cumin", pt: "cominho", hi: "जीरा" },
  "curry powder": { en: "curry powder", es: "curry en polvo", fr: "poudre de curry", pt: "curry em pó", hi: "करी पाउडर" },
  "egg": { en: "egg", es: "huevo", fr: "œuf", pt: "ovo", hi: "अंडा" },
  "eggplant": { en: "eggplant", es: "berenjena", fr: "aubergine", pt: "berinjela", hi: "बैंगन" },
  "eggs": { en: "eggs", es: "huevos", fr: "œufs", pt: "ovos", hi: "अंडे" },
  "feta cheese": { en: "feta cheese", es: "queso feta", fr: "feta", pt: "queijo feta", hi: "फेटा चीज़" },
  "flour": { en: "flour", es: "harina", fr: "farine", pt: "farinha", hi: "आटा" },
  "garlic": { en: "garlic", es: "ajo", fr: "ail", pt: "alho", hi: "लहसुन" },
  "garlic powder": { en: "garlic powder", es: "ajo en polvo", fr: "poudre d'ail", pt: "alho em pó", hi: "लहसुन पाउडर" },
  "gochujang": { en: "gochujang", es: "gochujang", fr: "gochujang", pt: "gochujang", hi: "गोचुजांग" },
  "granola": { en: "granola", es: "granola", fr: "granola", pt: "granola", hi: "ग्रेनोला" },
  "greek yogurt": { en: "greek yogurt", es: "yogur griego", fr: "yaourt grec", pt: "iogurte grego", hi: "ग्रीक योगर्ट" },
  "green onion": { en: "green onion", es: "cebolleta", fr: "oignon vert", pt: "cebolinha", hi: "हरा प्याज" },
  "ground beef": { en: "ground beef", es: "carne molida", fr: "bœuf haché", pt: "carne moída", hi: "कीमा बीफ़" },
  "ground chicken": { en: "ground chicken", es: "pollo molido", fr: "poulet haché", pt: "frango moído", hi: "कीमा चिकन" },
  "ground turkey": { en: "ground turkey", es: "pavo molido", fr: "dinde hachée", pt: "peru moído", hi: "कीमा टर्की" },
  "ham": { en: "ham", es: "jamón", fr: "jambon", pt: "presunto", hi: "हैम" },
  "herbs": { en: "herbs", es: "hierbas", fr: "herbes", pt: "ervas", hi: "जड़ी-बूटियाँ" },
  "honey": { en: "honey", es: "miel", fr: "miel", pt: "mel", hi: "शहद" },
  "hummus": { en: "hummus", es: "hummus", fr: "houmous", pt: "homus", hi: "हुम्मस" },
  "instant ramen": { en: "instant ramen", es: "ramen instantáneo", fr: "ramen instantané", pt: "miojo", hi: "इंस्टेंट रामेन" },
  "jerk seasoning": { en: "jerk seasoning", es: "condimento jerk", fr: "assaisonnement jerk", pt: "tempero jerk", hi: "जर्क सीज़निंग" },
  "kimchi": { en: "kimchi", es: "kimchi", fr: "kimchi", pt: "kimchi", hi: "किमची" },
  "lemon": { en: "lemon", es: "limón", fr: "citron", pt: "limão", hi: "नींबू" },
  "lentils": { en: "lentils", es: "lentejas", fr: "lentilles", pt: "lentilhas", hi: "मसूर दाल" },
  "lettuce": { en: "lettuce", es: "lechuga", fr: "laitue", pt: "alface", hi: "सलाद पत्ता" },
  "lime": { en: "lime", es: "lima", fr: "citron vert", pt: "limão-taiti", hi: "नींबू (लाइम)" },
  "marinara sauce": { en: "marinara sauce", es: "salsa marinara", fr: "sauce marinara", pt: "molho marinara", hi: "मरीनारा सॉस" },
  "mayo": { en: "mayo", es: "mayonesa", fr: "mayonnaise", pt: "maionese", hi: "मेयो" },
  "milk": { en: "milk", es: "leche", fr: "lait", pt: "leite", hi: "दूध" },
  "miso paste": { en: "miso paste", es: "pasta de miso", fr: "pâte miso", pt: "pasta de missô", hi: "मिसो पेस्ट" },
  "mixed vegetables": { en: "mixed vegetables", es: "verduras mixtas", fr: "légumes mélangés", pt: "legumes variados", hi: "मिश्रित सब्ज़ियाँ" },
  "mozzarella": { en: "mozzarella", es: "mozzarella", fr: "mozzarella", pt: "muçarela", hi: "मोत्ज़ारेला" },
  "nori": { en: "nori", es: "nori", fr: "nori", pt: "nori", hi: "नोरी" },
  "oats": { en: "oats", es: "avena", fr: "flocons d'avoine", pt: "aveia", hi: "जई (ओट्स)" },
  "olive oil": { en: "olive oil", es: "aceite de oliva", fr: "huile d'olive", pt: "azeite de oliva", hi: "जैतून का तेल" },
  "olives": { en: "olives", es: "aceitunas", fr: "olives", pt: "azeitonas", hi: "जैतून" },
  "onion": { en: "onion", es: "cebolla", fr: "oignon", pt: "cebola", hi: "प्याज" },
  "paneer": { en: "paneer", es: "paneer", fr: "paneer", pt: "paneer", hi: "पनीर" },
  "paprika": { en: "paprika", es: "pimentón", fr: "paprika", pt: "páprica", hi: "पेपरिका" },
  "parmesan": { en: "parmesan", es: "parmesano", fr: "parmesan", pt: "parmesão", hi: "परमेसन" },
  "parsley": { en: "parsley", es: "perejil", fr: "persil", pt: "salsa", hi: "अजमोद" },
  "pasta": { en: "pasta", es: "pasta", fr: "pâtes", pt: "macarrão", hi: "पास्ता" },
  "peanut butter": { en: "peanut butter", es: "mantequilla de maní", fr: "beurre de cacahuète", pt: "pasta de amendoim", hi: "मूंगफली का मक्खन" },
  "peanuts": { en: "peanuts", es: "maníes", fr: "cacahuètes", pt: "amendoins", hi: "मूंगफली" },
  "pepper": { en: "pepper", es: "pimienta", fr: "poivre", pt: "pimenta", hi: "काली मिर्च" },
  "pita bread": { en: "pita bread", es: "pan de pita", fr: "pain pita", pt: "pão pita", hi: "पीटा ब्रेड" },
  "potato": { en: "potato", es: "papa", fr: "pomme de terre", pt: "batata", hi: "आलू" },
  "red lentils": { en: "red lentils", es: "lentejas rojas", fr: "lentilles rouges", pt: "lentilha vermelha", hi: "लाल मसूर दाल" },
  "red onion": { en: "red onion", es: "cebolla morada", fr: "oignon rouge", pt: "cebola roxa", hi: "लाल प्याज" },
  "rice": { en: "rice", es: "arroz", fr: "riz", pt: "arroz", hi: "चावल" },
  "rice noodles": { en: "rice noodles", es: "fideos de arroz", fr: "nouilles de riz", pt: "macarrão de arroz", hi: "राइस नूडल्स" },
  "rice paper": { en: "rice paper", es: "papel de arroz", fr: "galette de riz", pt: "papel de arroz", hi: "राइस पेपर" },
  "ricotta": { en: "ricotta", es: "ricotta", fr: "ricotta", pt: "ricota", hi: "रिकोटा" },
  "romaine": { en: "romaine", es: "lechuga romana", fr: "laitue romaine", pt: "alface romana", hi: "रोमेन लेट्यूस" },
  "salmon fillet": { en: "salmon fillet", es: "filete de salmón", fr: "filet de saumon", pt: "filé de salmão", hi: "सैल्मन फ़िलेट" },
  "salsa": { en: "salsa", es: "salsa", fr: "salsa", pt: "molho salsa", hi: "साल्सा" },
  "salt": { en: "salt", es: "sal", fr: "sel", pt: "sal", hi: "नमक" },
  "sausage": { en: "sausage", es: "salchicha", fr: "saucisse", pt: "linguiça", hi: "सॉसेज" },
  "seaweed": { en: "seaweed", es: "alga marina", fr: "algue", pt: "alga marinha", hi: "समुद्री शैवाल" },
  "sesame oil": { en: "sesame oil", es: "aceite de sésamo", fr: "huile de sésame", pt: "óleo de gergelim", hi: "तिल का तेल" },
  "sesame seeds": { en: "sesame seeds", es: "semillas de sésamo", fr: "graines de sésame", pt: "gergelim", hi: "तिल के बीज" },
  "shrimp": { en: "shrimp", es: "camarones", fr: "crevettes", pt: "camarão", hi: "झींगा" },
  "soy sauce": { en: "soy sauce", es: "salsa de soja", fr: "sauce soja", pt: "molho de soja", hi: "सोया सॉस" },
  "spices": { en: "spices", es: "especias", fr: "épices", pt: "especiarias", hi: "मसाले" },
  "sweet potato": { en: "sweet potato", es: "batata dulce", fr: "patate douce", pt: "batata-doce", hi: "शकरकंद" },
  "taco seasoning": { en: "taco seasoning", es: "condimento para tacos", fr: "assaisonnement à taco", pt: "tempero para taco", hi: "टैको सीज़निंग" },
  "thai basil": { en: "thai basil", es: "albahaca tailandesa", fr: "basilic thaï", pt: "manjericão tailandês", hi: "थाई तुलसी" },
  "tofu": { en: "tofu", es: "tofu", fr: "tofu", pt: "tofu", hi: "टोफू" },
  "tomato": { en: "tomato", es: "tomate", fr: "tomate", pt: "tomate", hi: "टमाटर" },
  "tomato paste": { en: "tomato paste", es: "pasta de tomate", fr: "concentré de tomate", pt: "extrato de tomate", hi: "टमाटर पेस्ट" },
  "tortilla": { en: "tortilla", es: "tortilla", fr: "tortilla", pt: "tortilha", hi: "टॉर्टिला" },
  "vanilla": { en: "vanilla", es: "vainilla", fr: "vanille", pt: "baunilha", hi: "वनीला" },
  "vegetable broth": { en: "vegetable broth", es: "caldo de verduras", fr: "bouillon de légumes", pt: "caldo de legumes", hi: "सब्ज़ी शोरबा" },
  "yogurt": { en: "yogurt", es: "yogur", fr: "yaourt", pt: "iogurte", hi: "दही" },
  "zucchini": { en: "zucchini", es: "calabacín", fr: "courgette", pt: "abobrinha", hi: "तोरी" },
};

// Fill in Chinese and Arabic for the original ingredient list.
for (const [key, [zh, ar]] of Object.entries(INGREDIENT_ZH_AR)) {
  if (INGREDIENT_TR[key]) {
    INGREDIENT_TR[key].zh ??= zh;
    INGREDIENT_TR[key].ar ??= ar;
  }
}

const EQUIPMENT_TR = {
  stove: { en: "Stove", es: "Estufa", fr: "Cuisinière", pt: "Fogão", hi: "चूल्हा", zh: "炉灶", ar: "موقد" },
  oven: { en: "Oven", es: "Horno", fr: "Four", pt: "Forno", hi: "ओवन", zh: "烤箱", ar: "فرن" },
  microwave: { en: "Microwave", es: "Microondas", fr: "Micro-ondes", pt: "Micro-ondas", hi: "माइक्रोवेव", zh: "微波炉", ar: "ميكروويف" },
  pot: { en: "Pot", es: "Olla", fr: "Marmite", pt: "Panela", hi: "बर्तन (पतीला)", zh: "锅", ar: "قدر" },
  pan: { en: "Pan", es: "Sartén", fr: "Poêle", pt: "Frigideira", hi: "तवा (पैन)", zh: "平底锅", ar: "مقلاة" },
  fridge: { en: "Mini fridge", es: "Mini refrigerador", fr: "Mini réfrigérateur", pt: "Mini geladeira", hi: "मिनी फ्रिज", zh: "迷你冰箱", ar: "ثلاجة صغيرة" },
  "air-fryer": { en: "Air fryer", es: "Freidora de aire", fr: "Friteuse à air", pt: "Fritadeira de ar", hi: "एयर फ्रायर", zh: "空气炸锅", ar: "مقلاة هوائية" },
};

const BASICS_TR = {
  salt: { en: "Salt", es: "Sal", fr: "Sel", pt: "Sal", hi: "नमक", zh: "盐", ar: "ملح" },
  pepper: { en: "Pepper", es: "Pimienta", fr: "Poivre", pt: "Pimenta", hi: "काली मिर्च", zh: "胡椒", ar: "فلفل" },
  oil: { en: "Cooking oil", es: "Aceite de cocina", fr: "Huile de cuisson", pt: "Óleo de cozinha", hi: "खाना पकाने का तेल", zh: "食用油", ar: "زيت الطهي" },
  butter: { en: "Butter", es: "Mantequilla", fr: "Beurre", pt: "Manteiga", hi: "मक्खन", zh: "黄油", ar: "زبدة" },
};

const CATEGORIES_TR = {
  "high-protein": { en: "High Protein", es: "Alto en Proteína", fr: "Riche en Protéines", pt: "Alto em Proteína", hi: "उच्च प्रोटीन", zh: "高蛋白", ar: "عالي البروتين" },
  "low-calorie": { en: "Low Calorie", es: "Bajo en Calorías", fr: "Faible en Calories", pt: "Baixo em Calorias", hi: "कम कैलोरी", zh: "低卡路里", ar: "منخفض السعرات" },
  "budget-friendly": { en: "Budget Friendly", es: "Económico", fr: "Économique", pt: "Econômico", hi: "बजट फ्रेंडली", zh: "经济实惠", ar: "اقتصادي" },
  "quick-easy": { en: "Quick & Easy", es: "Rápido y Fácil", fr: "Rapide et Facile", pt: "Rápido e Fácil", hi: "त्वरित और आसान", zh: "快捷简单", ar: "سريع وسهل" },
  "beginner-friendly": { en: "Beginner Friendly", es: "Para Principiantes", fr: "Pour Débutants", pt: "Para Iniciantes", hi: "शुरुआती के लिए उपयुक्त", zh: "适合新手", ar: "مناسب للمبتدئين" },
  "high-carb": { en: "High Carb", es: "Alto en Carbohidratos", fr: "Riche en Glucides", pt: "Alto em Carboidratos", hi: "उच्च कार्ब", zh: "高碳水", ar: "عالي الكربوهيدرات" },
  "healthy-balanced": { en: "Healthy & Balanced", es: "Saludable y Equilibrado", fr: "Sain et Équilibré", pt: "Saudável e Equilibrado", hi: "स्वस्थ और संतुलित", zh: "健康均衡", ar: "صحي ومتوازن" },
  vegetarian: { en: "Vegetarian", es: "Vegetariano", fr: "Végétarien", pt: "Vegetariano", hi: "शाकाहारी", zh: "素食", ar: "نباتي" },
  vegan: { en: "Vegan", es: "Vegano", fr: "Végétalien", pt: "Vegano", hi: "वीगन", zh: "纯素", ar: "نباتي صرف" },
  "high-fiber": { en: "High Fiber", es: "Alto en Fibra", fr: "Riche en Fibres", pt: "Alto em Fibra", hi: "उच्च फाइबर", zh: "高纤维", ar: "عالي الألياف" },
  "low-carb": { en: "Low Carb", es: "Bajo en Carbohidratos", fr: "Faible en Glucides", pt: "Baixo em Carboidratos", hi: "कम कार्ब", zh: "低碳水", ar: "منخفض الكربوهيدرات" },
  fruit: { en: "Fruit", es: "Frutas", fr: "Fruits", pt: "Frutas", hi: "फल", zh: "水果", ar: "فواكه" },
  "meal-prep": { en: "Meal Prep", es: "Preparación de Comidas", fr: "Prépa des Repas", pt: "Preparo de Refeições", hi: "मील प्रेप", zh: "备餐", ar: "تحضير الوجبات" },
};

const CUISINES_TR = {
  ghanaian: { en: "Ghanaian", es: "Ghanesa", fr: "Ghanéenne", pt: "Ganesa", hi: "घानाई", zh: "加纳菜", ar: "غانية" },
  italian: { en: "Italian", es: "Italiana", fr: "Italienne", pt: "Italiana", hi: "इतालवी", zh: "意大利菜", ar: "إيطالية" },
  mexican: { en: "Mexican", es: "Mexicana", fr: "Mexicaine", pt: "Mexicana", hi: "मैक्सिकन", zh: "墨西哥菜", ar: "مكسيكية" },
  asian: { en: "Asian", es: "Asiática", fr: "Asiatique", pt: "Asiática", hi: "एशियाई", zh: "亚洲菜", ar: "آسيوية" },
  american: { en: "American", es: "Americana", fr: "Américaine", pt: "Americana", hi: "अमेरिकी", zh: "美式", ar: "أمريكية" },
  indian: { en: "Indian", es: "India", fr: "Indienne", pt: "Indiana", hi: "भारतीय", zh: "印度菜", ar: "هندية" },
  mediterranean: { en: "Mediterranean", es: "Mediterránea", fr: "Méditerranéenne", pt: "Mediterrânea", hi: "भूमध्यसागरीय", zh: "地中海菜", ar: "متوسطية" },
  caribbean: { en: "Caribbean", es: "Caribeña", fr: "Caribéenne", pt: "Caribenha", hi: "कैरिबियाई", zh: "加勒比菜", ar: "كاريبية" },
  thai: { en: "Thai", es: "Tailandesa", fr: "Thaïlandaise", pt: "Tailandesa", hi: "थाई", zh: "泰国菜", ar: "تايلاندية" },
  chinese: { en: "Chinese", es: "China", fr: "Chinoise", pt: "Chinesa", hi: "चीनी", zh: "中国菜", ar: "صينية" },
  korean: { en: "Korean", es: "Coreana", fr: "Coréenne", pt: "Coreana", hi: "कोरियाई", zh: "韩国菜", ar: "كورية" },
  french: { en: "French", es: "Francesa", fr: "Française", pt: "Francesa", hi: "फ्रेंच", zh: "法国菜", ar: "فرنسية" },
  japanese: { en: "Japanese", es: "Japonesa", fr: "Japonaise", pt: "Japonesa", hi: "जापानी", zh: "日本菜", ar: "يابانية" },
  vietnamese: { en: "Vietnamese", es: "Vietnamita", fr: "Vietnamienne", pt: "Vietnamita", hi: "वियतनामी", zh: "越南菜", ar: "فيتنامية" },
  "middle-eastern": { en: "Middle Eastern", es: "Medio Oriente", fr: "Moyen-Orient", pt: "Oriente Médio", hi: "मध्य पूर्वी", zh: "中东菜", ar: "شرق أوسطية" },
  ethiopian: { en: "Ethiopian", es: "Etíope", fr: "Éthiopienne", pt: "Etíope", hi: "इथियोपियाई", zh: "埃塞俄比亚菜", ar: "إثيوبية" },
  spanish: { en: "Spanish", es: "Española", fr: "Espagnole", pt: "Espanhola", hi: "स्पेनिश", zh: "西班牙菜", ar: "إسبانية" },
  brazilian: { en: "Brazilian", es: "Brasileña", fr: "Brésilienne", pt: "Brasileira", hi: "ब्राज़ीलियाई", zh: "巴西菜", ar: "برازيلية" },
  british: { en: "British", es: "Británica", fr: "Britannique", pt: "Britânica", hi: "ब्रिटिश", zh: "英国菜", ar: "بريطانية" },
  african: { en: "African", es: "Africana", fr: "Africaine", pt: "Africana", hi: "अफ़्रीकी", zh: "非洲菜", ar: "أفريقية" },
};

const WEIGHT_GOALS_TR = {
  "no-track": { en: "I'd rather not track calories or weight", es: "Prefiero no registrar calorías ni peso", fr: "Je préfère ne pas suivre les calories ou le poids", pt: "Prefiro não acompanhar calorias ou peso", hi: "मैं कैलोरी या वज़न ट्रैक नहीं करना चाहूंगा/चाहूंगी", zh: "我不想追踪卡路里或体重", ar: "أفضل عدم تتبع السعرات الحرارية أو الوزن" },
  maintain: { en: "Maintain weight", es: "Mantener el peso", fr: "Maintenir le poids", pt: "Manter o peso", hi: "वज़न बनाए रखें", zh: "保持体重", ar: "الحفاظ على الوزن" },
  "mild-loss": { en: "Mild weight loss of 0.5 lb (0.25 kg) per week", es: "Pérdida leve de peso de 0.5 lb (0.25 kg) por semana", fr: "Perte de poids légère de 0,5 lb (0,25 kg) par semaine", pt: "Perda leve de peso de 0,5 lb (0,25 kg) por semana", hi: "साप्ताहिक 0.5 lb (0.25 kg) हल्की वज़न कमी", zh: "每周轻度减重0.5磅(0.25公斤)", ar: "خسارة وزن خفيفة 0.5 رطل (0.25 كجم) أسبوعيًا" },
  loss: { en: "Weight loss of 1 lb (0.5 kg) per week", es: "Pérdida de peso de 1 lb (0.5 kg) por semana", fr: "Perte de poids de 1 lb (0,5 kg) par semaine", pt: "Perda de peso de 1 lb (0,5 kg) por semana", hi: "साप्ताहिक 1 lb (0.5 kg) वज़न कमी", zh: "每周减重1磅(0.5公斤)", ar: "خسارة وزن 1 رطل (0.5 كجم) أسبوعيًا" },
  "extreme-loss": { en: "Extreme weight loss of 2 lb (1 kg) per week", es: "Pérdida extrema de peso de 2 lb (1 kg) por semana", fr: "Perte de poids extrême de 2 lb (1 kg) par semaine", pt: "Perda extrema de peso de 2 lb (1 kg) por semana", hi: "साप्ताहिक 2 lb (1 kg) अत्यधिक वज़न कमी", zh: "每周极速减重2磅(1公斤)", ar: "خسارة وزن شديدة 2 رطل (1 كجم) أسبوعيًا" },
  "mild-gain": { en: "Mild weight gain of 0.5 lb (0.25 kg) per week", es: "Aumento leve de peso de 0.5 lb (0.25 kg) por semana", fr: "Prise de poids légère de 0,5 lb (0,25 kg) par semaine", pt: "Ganho leve de peso de 0,5 lb (0,25 kg) por semana", hi: "साप्ताहिक 0.5 lb (0.25 kg) हल्की वज़न वृद्धि", zh: "每周轻度增重0.5磅(0.25公斤)", ar: "زيادة وزن خفيفة 0.5 رطل (0.25 كجم) أسبوعيًا" },
  gain: { en: "Weight gain of 1 lb (0.5 kg) per week", es: "Aumento de peso de 1 lb (0.5 kg) por semana", fr: "Prise de poids de 1 lb (0,5 kg) par semaine", pt: "Ganho de peso de 1 lb (0,5 kg) por semana", hi: "साप्ताहिक 1 lb (0.5 kg) वज़न वृद्धि", zh: "每周增重1磅(0.5公斤)", ar: "زيادة وزن 1 رطل (0.5 كجم) أسبوعيًا" },
  "extreme-gain": { en: "Extreme weight gain of 2 lb (1 kg) per week", es: "Aumento extremo de peso de 2 lb (1 kg) por semana", fr: "Prise de poids extrême de 2 lb (1 kg) par semaine", pt: "Ganho extremo de peso de 2 lb (1 kg) por semana", hi: "साप्ताहिक 2 lb (1 kg) अत्यधिक वज़न वृद्धि", zh: "每周极速增重2磅(1公斤)", ar: "زيادة وزن شديدة 2 رطل (1 كجم) أسبوعيًا" },
};

const COOKING_GOALS_TR = {
  "cant-cook": { en: "Can't cook", es: "No sé cocinar", fr: "Je ne sais pas cuisiner", pt: "Não sei cozinhar", hi: "पकाना नहीं आता", zh: "不会做饭", ar: "لا أعرف الطبخ" },
  "just-ideas": { en: "Just need ideas", es: "Solo necesito ideas", fr: "J'ai juste besoin d'idées", pt: "Só preciso de ideias", hi: "बस विचार चाहिए", zh: "只是需要一些点子", ar: "أحتاج أفكارًا فقط" },
};

const COOKING_LEVELS_TR = {
  beginner: { en: "Beginner", es: "Principiante", fr: "Débutant", pt: "Iniciante", hi: "शुरुआती", zh: "新手", ar: "مبتدئ" },
  intermediate: { en: "Intermediate", es: "Intermedio", fr: "Intermédiaire", pt: "Intermediário", hi: "मध्यम", zh: "中级", ar: "متوسط" },
  advanced: { en: "Advanced", es: "Avanzado", fr: "Avancé", pt: "Avançado", hi: "उन्नत", zh: "高级", ar: "متقدم" },
};

const ACTIVITY_LEVELS_TR = {
  bmr: { en: "Basal Metabolic Rate (BMR)", es: "Tasa Metabólica Basal (TMB)", fr: "Métabolisme de base (MB)", pt: "Taxa Metabólica Basal (TMB)", hi: "बेसल चयापचय दर (BMR)", zh: "基础代谢率(BMR)", ar: "معدل الأيض الأساسي (BMR)" },
  sedentary: { en: "Sedentary: little or no exercise", es: "Sedentario: poco o ningún ejercicio", fr: "Sédentaire : peu ou pas d'exercice", pt: "Sedentário: pouco ou nenhum exercício", hi: "गतिहीन: बहुत कम या कोई व्यायाम नहीं", zh: "久坐：很少或不运动", ar: "خامل: نشاط بدني قليل أو معدوم" },
  light: { en: "Light: exercise 1–3 times/week", es: "Ligero: ejercicio 1-3 veces/semana", fr: "Léger : exercice 1 à 3 fois/semaine", pt: "Leve: exercício 1-3 vezes/semana", hi: "हल्का: सप्ताह में 1-3 बार व्यायाम", zh: "轻度：每周运动1-3次", ar: "خفيف: تمارين 1-3 مرات/أسبوع" },
  moderate: { en: "Moderate: exercise 4–5 times/week", es: "Moderado: ejercicio 4-5 veces/semana", fr: "Modéré : exercice 4 à 5 fois/semaine", pt: "Moderado: exercício 4-5 vezes/semana", hi: "मध्यम: सप्ताह में 4-5 बार व्यायाम", zh: "中度：每周运动4-5次", ar: "معتدل: تمارين 4-5 مرات/أسبوع" },
  active: { en: "Active: daily exercise or intense exercise 3–4 times/week", es: "Activo: ejercicio diario o intenso 3-4 veces/semana", fr: "Actif : exercice quotidien ou intense 3 à 4 fois/semaine", pt: "Ativo: exercício diário ou intenso 3-4 vezes/semana", hi: "सक्रिय: दैनिक व्यायाम या सप्ताह में 3-4 बार तीव्र व्यायाम", zh: "活跃：每天运动或每周高强度运动3-4次", ar: "نشط: تمارين يومية أو تمارين مكثفة 3-4 مرات/أسبوع" },
  "very-active": { en: "Very Active: intense exercise 6–7 times/week", es: "Muy activo: ejercicio intenso 6-7 veces/semana", fr: "Très actif : exercice intense 6 à 7 fois/semaine", pt: "Muito ativo: exercício intenso 6-7 vezes/semana", hi: "बहुत सक्रिय: सप्ताह में 6-7 बार तीव्र व्यायाम", zh: "非常活跃：每周高强度运动6-7次", ar: "نشط جدًا: تمارين مكثفة 6-7 مرات/أسبوع" },
  "extra-active": { en: "Extra Active: very intense exercise daily, or physical job", es: "Extra activo: ejercicio muy intenso a diario, o trabajo físico", fr: "Extra actif : exercice très intense quotidien, ou travail physique", pt: "Extra ativo: exercício muito intenso diário, ou trabalho físico", hi: "अत्यधिक सक्रिय: प्रतिदिन बहुत तीव्र व्यायाम, या शारीरिक कार्य", zh: "超级活跃：每天高强度运动或体力劳动工作", ar: "نشط للغاية: تمارين مكثفة جدًا يوميًا، أو عمل بدني" },
};

function labelFor(map, id, language) {
  return map[id]?.[language] ?? map[id]?.en ?? id;
}

// Words that end in "s" but aren't plural — don't strip these.
const NON_PLURAL_S_WORDS = new Set(["hummus", "asparagus", "couscous"]);

// Reduces a plural ingredient name to a singular-ish form so "tomato" and
// "tomatoes" (or "egg" and "eggs") are treated as the same ingredient when
// matching a kitchen against a recipe. Only used for comparison — the
// original text the user typed or the recipe specifies is never overwritten.
function normalizeIngredient(str) {
  const s = (str || "").toLowerCase().trim();
  if (NON_PLURAL_S_WORDS.has(s)) return s;
  if (s.endsWith("ies") && s.length > 3) return s.slice(0, -3) + "y"; // berries -> berry
  if (s.endsWith("oes")) return s.slice(0, -2); // tomatoes -> tomato, potatoes -> potato
  if (s.endsWith("ches") || s.endsWith("shes") || s.endsWith("xes") || s.endsWith("sses")) return s.slice(0, -2); // dishes -> dish
  if (s.endsWith("s") && !s.endsWith("ss")) return s.slice(0, -1); // eggs -> egg, onions -> onion, cloves -> clove
  return s;
}

// Every cooking oil counts as any other: a recipe that calls for olive oil
// is still makeable with plain cooking oil (or the Cooking oil basic), and
// the other way round.
function isOil(str) {
  const s = normalizeIngredient(str);
  return s === "oil" || / oil$/.test(s);
}

// Whether a recipe ingredient matches what someone typed into "Search by
// ingredient". Handles plurals, other languages, partial words ("berry"
// finds "strawberries"), and treats all oils as one.
function ingredientMatchesQuery(recipeIngredient, query) {
  const q = normalizeIngredient(resolveIngredientCanonical(query));
  if (!q) return false;
  const ing = normalizeIngredient(recipeIngredient);
  if (isOil(q) && isOil(ing)) return true;
  if (ing === q || ing.includes(q)) return true;
  return q.length >= 4 && q.includes(ing);
}

const RECIPE_NAME_TR = {
  ...WORLD.names,
  "honey-lime-fruit-salad": { es: "Ensalada de frutas con miel y lima", fr: "Salade de fruits miel-citron vert", pt: "Salada de frutas com mel e limão", hi: "हनी लाइम फ्रूट सलाद", zh: "蜂蜜青柠水果沙拉", ar: "سلطة فواكه بالعسل والليمون" },
  "banana-oat-pancakes": { es: "Panqueques de plátano y avena (3 ingredientes)", fr: "Pancakes banane-avoine (3 ingrédients)", pt: "Panquecas de banana e aveia (3 ingredientes)", hi: "3-सामग्री बनाना ओट पैनकेक", zh: "三种食材香蕉燕麦煎饼", ar: "بان كيك الموز والشوفان (3 مكونات)" },
  "berry-smoothie-bowl": { es: "Bol de batido de frutos rojos", fr: "Smoothie bowl aux fruits rouges", pt: "Smoothie bowl de frutas vermelhas", hi: "बेरी स्मूदी बाउल", zh: "莓果奶昔碗", ar: "وعاء سموذي التوت" },
  "baked-cinnamon-apples": { es: "Manzanas al horno con canela", fr: "Pommes au four à la cannelle", pt: "Maçãs assadas com canela", hi: "बेक्ड दालचीनी सेब", zh: "肉桂烤苹果", ar: "تفاح مخبوز بالقرفة" },
  "banana-mug-cake": { es: "Bizcocho de plátano en taza (microondas)", fr: "Mug cake à la banane", pt: "Bolo de caneca de banana", hi: "माइक्रोवेव बनाना मग केक", zh: "微波炉香蕉杯子蛋糕", ar: "كيكة الموز في كوب بالميكروويف" },
  "mango-lassi": { es: "Lassi de mango", fr: "Lassi à la mangue", pt: "Lassi de manga", hi: "मैंगो लस्सी", zh: "芒果拉西", ar: "لاسي المانجو" },
  "strawberry-spinach-salad": { es: "Ensalada de espinacas y fresas", fr: "Salade d'épinards aux fraises", pt: "Salada de espinafre com morango", hi: "स्ट्रॉबेरी पालक सलाद", zh: "草莓菠菜沙拉", ar: "سلطة السبانخ بالفراولة" },
  "honey-seared-peaches": { es: "Duraznos dorados con miel y yogur", fr: "Pêches poêlées au miel et yaourt", pt: "Pêssegos dourados com mel e iogurte", hi: "शहद वाले सिके आड़ू और दही", zh: "蜂蜜煎桃配酸奶", ar: "خوخ محمّر بالعسل مع الزبادي" },
  "apple-pb-slices": { es: "Rodajas de manzana con mantequilla de maní", fr: "Tranches de pomme au beurre de cacahuète", pt: "Fatias de maçã com pasta de amendoim", hi: "पीनट बटर के साथ सेब के टुकड़े", zh: "苹果片配花生酱", ar: "شرائح تفاح بزبدة الفول السوداني" },
  "frozen-banana-bites": { es: "Bocaditos de plátano con chocolate congelados", fr: "Bouchées glacées banane-chocolat", pt: "Bocadinhos de banana com chocolate congelados", hi: "फ्रोज़न चॉकलेट बनाना बाइट्स", zh: "冰冻巧克力香蕉块", ar: "قطع موز مجمدة بالشوكولاتة" },
  "berry-chia-pudding": { es: "Pudín de chía con frutos rojos", fr: "Pudding de chia aux fruits rouges", pt: "Pudim de chia com frutas vermelhas", hi: "बेरी चिया पुडिंग", zh: "莓果奇亚籽布丁", ar: "بودينغ الشيا بالتوت" },
  "pineapple-fried-rice": { es: "Arroz frito con piña", fr: "Riz frit à l'ananas", pt: "Arroz frito com abacaxi", hi: "पाइनएप्पल फ्राइड राइस", zh: "菠萝炒饭", ar: "أرز مقلي بالأناناس" },
  "mango-salsa": { es: "Salsa fresca de mango", fr: "Salsa fraîche à la mangue", pt: "Salsa fresca de manga", hi: "ताज़ा मैंगो साल्सा", zh: "新鲜芒果莎莎酱", ar: "صلصة المانجو الطازجة" },
  "orange-chicken-simple": { es: "Pollo a la naranja sencillo", fr: "Poulet à l'orange simple", pt: "Frango com laranja simples", hi: "सिंपल ऑरेंज चिकन", zh: "简易橙汁鸡", ar: "دجاج بالبرتقال بسيط" },
  "apple-crumble": { es: "Crumble de manzana fácil", fr: "Crumble aux pommes facile", pt: "Crumble de maçã fácil", hi: "आसान एप्पल क्रम्बल", zh: "简易苹果酥", ar: "كرامبل التفاح السهل" },
  "berry-yogurt-bark": { es: "Barra congelada de yogur y frutos rojos", fr: "Écorce glacée yaourt et fruits rouges", pt: "Placa congelada de iogurte com frutas vermelhas", hi: "फ्रोज़न बेरी योगर्ट बार्क", zh: "冰冻莓果酸奶脆片", ar: "ألواح زبادي مجمدة بالتوت" },
  "watermelon-feta-salad": { es: "Ensalada de sandía y feta", fr: "Salade pastèque et feta", pt: "Salada de melancia com feta", hi: "तरबूज़ फेटा सलाद", zh: "西瓜菲达奶酪沙拉", ar: "سلطة البطيخ والفيتا" },
  "honey-baked-pears": { es: "Peras al horno con miel", fr: "Poires rôties au miel", pt: "Peras assadas com mel", hi: "शहद वाली बेक्ड नाशपाती", zh: "蜂蜜烤梨", ar: "كمثرى مخبوزة بالعسل" },
  "tropical-smoothie": { es: "Batido tropical", fr: "Smoothie tropical", pt: "Vitamina tropical", hi: "ट्रॉपिकल स्मूदी", zh: "热带水果奶昔", ar: "سموذي استوائي" },
  "kelewele": { es: "Kelewele (plátano macho frito picante)", fr: "Kelewele (bananes plantains frites épicées)", pt: "Kelewele (banana-da-terra frita picante)", hi: "केलेवेले (मसालेदार तले प्लांटेन)", zh: "加纳辣炸大蕉", ar: "كيليويلي (موز بلانتين مقلي حار)" },
  "acai-bowl": { es: "Bol de açaí", fr: "Bol d'açaï", pt: "Tigela de açaí", hi: "आसाई बाउल", zh: "巴西莓碗", ar: "وعاء الأساي" },
  "strawberry-shortcake-cups": { es: "Vasitos de tarta de fresa", fr: "Verrines fraises-chantilly", pt: "Copinhos de bolo de morango", hi: "स्ट्रॉबेरी शॉर्टकेक कप", zh: "草莓蛋糕杯", ar: "أكواب كعكة الفراولة" },
  "lemon-blueberry-muffins": { es: "Muffins de limón y arándanos", fr: "Muffins citron-myrtilles", pt: "Muffins de limão e mirtilo", hi: "लेमन ब्लूबेरी मफिन", zh: "柠檬蓝莓玛芬", ar: "مافن الليمون والتوت الأزرق" },
  "berry-french-toast": { es: "Tostadas francesas con frutos rojos", fr: "Pain perdu aux fruits rouges", pt: "Rabanada com frutas vermelhas", hi: "बेरी फ्रेंच टोस्ट", zh: "莓果法式吐司", ar: "توست فرنسي بالتوت" },
  "strawberry-banana-crepes": { es: "Crepas de fresa y plátano", fr: "Crêpes fraise-banane", pt: "Crepes de morango e banana", hi: "स्ट्रॉबेरी बनाना क्रेप्स", zh: "草莓香蕉可丽饼", ar: "كريب الفراولة والموز" },
  "fruta-con-chile": { es: "Fruta con chile", fr: "Fruits au piment (fruta con chile)", pt: "Frutas com pimenta", hi: "मिर्च वाले फल", zh: "辣椒粉水果条", ar: "فواكه بالفلفل الحار" },
  "fruit-sando": { es: "Sándwich japonés de frutas", fr: "Fruit sando japonais", pt: "Sanduíche japonês de frutas", hi: "जापानी फ्रूट सैंडो", zh: "日式水果三明治", ar: "ساندويتش الفواكه الياباني" },
  "avocado-smoothie": { es: "Batido vietnamita de aguacate", fr: "Smoothie vietnamien à l'avocat", pt: "Vitamina vietnamita de abacate", hi: "वियतनामी एवोकाडो स्मूदी", zh: "越南牛油果奶昔", ar: "سموذي الأفوكادو الفيتنامي" },
  "pineapple-teriyaki-chicken": { es: "Pollo teriyaki con piña", fr: "Poulet teriyaki à l'ananas", pt: "Frango teriyaki com abacaxi", hi: "पाइनएप्पल टेरियाकी चिकन", zh: "菠萝照烧鸡", ar: "دجاج ترياكي بالأناناس" },
  "apple-cinnamon-oatmeal": { es: "Avena con manzana y canela", fr: "Porridge pomme-cannelle", pt: "Mingau de aveia com maçã e canela", hi: "एप्पल दालचीनी ओटमील", zh: "苹果肉桂燕麦粥", ar: "شوفان بالتفاح والقرفة" },
  "mug-eggs": { es: "Huevos revueltos en taza (microondas)", fr: "Œufs brouillés au micro-ondes", pt: "Ovos mexidos no micro-ondas (na caneca)", hi: "माइक्रोवेव मग स्क्रैम्बल्ड एग्स", zh: "微波炉杯装炒蛋", ar: "بيض مخفوق بالميكروويف في كوب" },
  "garlic-pasta": { es: "Pasta con mantequilla de ajo en una olla", fr: "Pâtes au beurre à l'ail (une seule casserole)", pt: "Macarrão com manteiga de alho (uma panela)", hi: "गार्लिक बटर पास्ता (एक बर्तन में)", zh: "蒜香黄油意面（一锅出）", ar: "معكرونة بزبدة الثوم بقدر واحد" },
  "tuna-wrap": { es: "Wrap de atún sin cocción", fr: "Wrap au thon sans cuisson", pt: "Wrap de atum sem cozimento", hi: "बिना पकाए टूना रैप", zh: "免烹金枪鱼卷", ar: "لفافة تونة بدون طبخ" },
  "grilled-cheese": { es: "Sándwich de queso a la plancha", fr: "Sandwich au fromage grillé", pt: "Sanduíche de queijo grelhado", hi: "पैन-फ्राइड ग्रिल्ड चीज़", zh: "平底锅烤芝士三明治", ar: "ساندويتش جبنة مشوي بالمقلاة" },
  "ramen-upgrade": { es: "Ramen instantáneo mejorado", fr: "Ramen instantané amélioré", pt: "Miojo turbinado", hi: "इंस्टेंट रामेन अपग्रेड", zh: "方便面升级版", ar: "تحسين نودلز رامن سريع التحضير" },
  "overnight-oats": { es: "Avena remojada de un día para otro", fr: "Overnight oats (flocons d'avoine)", pt: "Aveia de geladeira (overnight oats)", hi: "ओवरनाइट ओट्स", zh: "隔夜燕麦", ar: "شوفان الليلة السابقة" },
  "jollof-rice": { es: "Arroz jollof sencillo", fr: "Riz jollof simple", pt: "Arroz jollof simples", hi: "सरल जोलोफ राइस", zh: "简易佐罗夫饭", ar: "أرز جولوف بسيط" },
  "black-bean-bowl": { es: "Bol de frijoles negros y arroz", fr: "Bol de haricots noirs et riz", pt: "Bowl de feijão preto e arroz", hi: "ब्लैक बीन एंड राइस बाउल", zh: "黑豆米饭碗", ar: "صحن فاصولياء سوداء وأرز" },
  "chicken-stir-fry": { es: "Pollo salteado sencillo", fr: "Poulet sauté simple", pt: "Frango salteado simples", hi: "सिंपल चिकन स्टिर फ्राय", zh: "简易炒鸡肉", ar: "دجاج مقلي سريع بسيط" },
  "creamy-chicken-pasta": { es: "Pasta cremosa con pollo", fr: "Pâtes crémeuses au poulet", pt: "Macarrão cremoso com frango", hi: "क्रीमी चिकन पास्ता", zh: "奶油鸡肉意面", ar: "معكرونة كريمية بالدجاج" },
  "chickpea-curry": { es: "Curry de garbanzos en 15 minutos", fr: "Curry de pois chiches en 15 minutes", pt: "Curry de grão-de-bico em 15 minutos", hi: "15-मिनट छोले करी", zh: "15分钟鹰嘴豆咖喱", ar: "كاري الحمص في 15 دقيقة" },
  "turkey-taco-bowl": { es: "Bol de tacos de pavo", fr: "Bol de tacos à la dinde", pt: "Bowl de taco de peru", hi: "टर्की टैको बाउल", zh: "火鸡塔可碗", ar: "صحن تاكو الديك الرومي" },
  "greek-yogurt-parfait": { es: "Parfait de yogur griego", fr: "Parfait au yaourt grec", pt: "Parfait de iogurte grego", hi: "ग्रीक योगर्ट परफे", zh: "希腊酸奶芭菲", ar: "بارفيه الزبادي اليوناني" },
  "avocado-toast": { es: "Tostada de aguacate", fr: "Toast à l'avocat", pt: "Torrada de abacate", hi: "एवोकाडो टोस्ट", zh: "牛油果吐司", ar: "توست الأفوكادو" },
  "lentil-soup": { es: "Sopa de lentejas sencilla", fr: "Soupe de lentilles simple", pt: "Sopa de lentilha simples", hi: "सरल दाल सूप", zh: "简易扁豆汤", ar: "حساء عدس بسيط" },
  "veggie-fried-rice": { es: "Arroz frito con vegetales", fr: "Riz frit aux légumes", pt: "Arroz frito com legumes", hi: "वेजी फ्राइड राइस", zh: "蔬菜炒饭", ar: "أرز مقلي بالخضار" },
  "greek-salad": { es: "Ensalada griega", fr: "Salade grecque", pt: "Salada grega", hi: "ग्रीक सलाद", zh: "希腊沙拉", ar: "سلطة يونانية" },
  "hummus-pita": { es: "Hummus con pan pita", fr: "Houmous et pain pita", pt: "Homus com pão pita", hi: "हुमस और पीटा", zh: "鹰嘴豆泥配皮塔饼", ar: "حمص مع خبز البيتا" },
  "shakshuka": { es: "Shakshuka", fr: "Chakchouka", pt: "Shakshuka", hi: "शकशुका", zh: "沙卡蔬卡", ar: "شكشوكة" },
  "jerk-chicken": { es: "Pollo jerk", fr: "Poulet jerk", pt: "Frango jerk", hi: "जर्क चिकन", zh: "牙买加香辣鸡", ar: "دجاج جيرك" },
  "rice-and-peas": { es: "Arroz con guisantes", fr: "Riz aux pois", pt: "Arroz com feijão", hi: "राइस एंड पीज़", zh: "米饭配豆子", ar: "أرز بالبازلاء" },
  "pad-thai": { es: "Pad Thai", fr: "Pad Thaï", pt: "Pad Thai", hi: "पैड थाई", zh: "泰式炒河粉", ar: "باد تاي" },
  "thai-basil-chicken": { es: "Pollo con albahaca tailandesa", fr: "Poulet au basilic thaï", pt: "Frango com manjericão tailandês", hi: "थाई तुलसी चिकन", zh: "泰式打抛鸡", ar: "دجاج بالريحان التايلاندي" },
  "kung-pao-chicken": { es: "Pollo Kung Pao", fr: "Poulet Kung Pao", pt: "Frango Kung Pao", hi: "कुंग पाओ चिकन", zh: "宫保鸡丁", ar: "دجاج كونغ باو" },
  "egg-drop-soup": { es: "Sopa de huevo", fr: "Soupe aux œufs", pt: "Sopa de ovo", hi: "एग ड्रॉप सूप", zh: "蛋花汤", ar: "حساء البيض" },
  "bibimbap": { es: "Bol bibimbap", fr: "Bol bibimbap", pt: "Bowl bibimbap", hi: "बिबिमबैप बाउल", zh: "拌饭", ar: "صحن بيبيمباب" },
  "kimchi-fried-rice": { es: "Arroz frito con kimchi", fr: "Riz frit au kimchi", pt: "Arroz frito com kimchi", hi: "किमची फ्राइड राइस", zh: "泡菜炒饭", ar: "أرز مقلي بالكيمتشي" },
  "ratatouille": { es: "Ratatouille", fr: "Ratatouille", pt: "Ratatouille", hi: "रैटटुई", zh: "普罗旺斯杂烩蔬菜", ar: "راتاتوي" },
  "croque-monsieur": { es: "Croque Monsieur", fr: "Croque-monsieur", pt: "Croque Monsieur", hi: "क्रोक मॉन्स्यूर", zh: "火腿奶酪三明治", ar: "كروك موسيو" },
  "blt": { es: "Sándwich BLT", fr: "Sandwich BLT", pt: "Sanduíche BLT", hi: "बीएलटी सैंडविच", zh: "培根生菜番茄三明治", ar: "ساندويتش بيكون وخس وطماطم" },
  "chili-con-carne": { es: "Chili con carne", fr: "Chili con carne", pt: "Chili com carne", hi: "चिली कॉन कार्ने", zh: "辣味牛肉汤", ar: "تشيلي كون كارني" },
  "pancakes": { es: "Panqueques esponjosos", fr: "Pancakes moelleux", pt: "Panquecas fofas", hi: "फ्लफी पैनकेक", zh: "蓬松煎饼", ar: "فطائر بان كيك هشة" },
  "mac-and-cheese": { es: "Mac and cheese en la estufa", fr: "Macaroni au fromage à la casserole", pt: "Macarrão com queijo no fogão", hi: "स्टोवटॉप मैक एंड चीज़", zh: "炉灶芝士通心粉", ar: "مكرونة بالجبن على الموقد" },
  "margherita-toast": { es: "Tostada margarita", fr: "Toast margherita", pt: "Torrada margherita", hi: "मार्गेरिटा टोस्ट", zh: "玛格丽特吐司", ar: "توست مارغريتا" },
  "caprese-salad": { es: "Ensalada Caprese", fr: "Salade Caprese", pt: "Salada Caprese", hi: "कैप्रेसे सलाद", zh: "卡普雷塞沙拉", ar: "سلطة كابريزي" },
  "minestrone": { es: "Sopa minestrone", fr: "Soupe minestrone", pt: "Sopa minestrone", hi: "मिनेस्ट्रोन सूप", zh: "蔬菜浓汤", ar: "حساء المينسترون" },
  "quesadillas": { es: "Quesadillas de queso", fr: "Quesadillas au fromage", pt: "Quesadillas de queijo", hi: "चीज़ क्वेसाडिया", zh: "芝士墨西哥卷饼", ar: "كيساديا بالجبن" },
  "breakfast-burrito": { es: "Burrito de desayuno", fr: "Burrito du petit-déjeuner", pt: "Burrito de café da manhã", hi: "ब्रेकफास्ट बुरिटो", zh: "早餐卷饼", ar: "بوريتو الإفطار" },
  "paneer-tikka": { es: "Paneer tikka", fr: "Paneer tikka", pt: "Paneer tikka", hi: "पनीर टिक्का", zh: "印度奶酪串烧", ar: "بانير تكة" },
  "aloo-gobi": { es: "Aloo gobi", fr: "Aloo gobi", pt: "Aloo gobi", hi: "आलू गोभी", zh: "土豆花菜咖喱", ar: "ألو غوبي" },
  "teriyaki-salmon": { es: "Salmón teriyaki", fr: "Saumon teriyaki", pt: "Salmão teriyaki", hi: "तेरियाकी सैल्मन", zh: "照烧三文鱼", ar: "سلمون تيرياكي" },
  "onigiri": { es: "Bolas de arroz onigiri", fr: "Boulettes de riz onigiri", pt: "Bolinhos de arroz onigiri", hi: "ओनिगिरी राइस बॉल्स", zh: "饭团", ar: "كرات أرز أونيغيري" },
  "miso-soup": { es: "Sopa de miso", fr: "Soupe miso", pt: "Sopa de miso", hi: "मिसो सूप", zh: "味噌汤", ar: "حساء الميسو" },
  "spring-rolls": { es: "Rollitos de primavera frescos", fr: "Rouleaux de printemps frais", pt: "Rolinhos primavera frescos", hi: "फ्रेश स्प्रिंग रोल्स", zh: "新鲜春卷", ar: "لفائف ربيع طازجة" },
  "quick-beef-pho": { es: "Pho de res rápido", fr: "Pho au bœuf rapide", pt: "Pho de carne rápido", hi: "क्विक बीफ फो", zh: "快手牛肉河粉", ar: "فو لحم بقري سريع" },
  "falafel-bowl": { es: "Bol de falafel", fr: "Bol de falafel", pt: "Bowl de falafel", hi: "फलाफेल बाउल", zh: "法拉费碗", ar: "صحن فلافل" },
  "tabbouleh": { es: "Tabulé", fr: "Taboulé", pt: "Tabule", hi: "तब्बूलेह", zh: "塔布勒沙拉", ar: "تبولة" },
  "chicken-shawarma-bowl": { es: "Bol de shawarma de pollo", fr: "Bol de chawarma au poulet", pt: "Bowl de shawarma de frango", hi: "चिकन शावरमा बाउल", zh: "鸡肉沙威玛碗", ar: "صحن شاورما دجاج" },
  "misir-wot": { es: "Misir wot (guiso de lentejas rojas)", fr: "Misir wot (ragoût de lentilles rouges)", pt: "Misir wot (ensopado de lentilha vermelha)", hi: "मिसिर वॉट (रेड लेंटिल स्ट्यू)", zh: "米西尔沃特红扁豆炖菜", ar: "ميسير وات (يخنة العدس الأحمر)" },
  "spanish-tortilla": { es: "Tortilla española", fr: "Tortilla espagnole", pt: "Tortilha espanhola", hi: "स्पैनिश टॉर्टिला", zh: "西班牙蛋饼", ar: "تورتيا إسبانية" },
  "garlic-shrimp": { es: "Camarones al ajillo", fr: "Crevettes à l'ail", pt: "Camarão ao alho", hi: "गार्लिक श्रिम्प", zh: "蒜香虾", ar: "جمبري بالثوم" },
  "brazilian-black-bean-stew": { es: "Guiso brasileño de frijoles negros", fr: "Ragoût brésilien de haricots noirs", pt: "Ensopado brasileiro de feijão preto", hi: "ब्राज़ीलियन ब्लैक बीन स्ट्यू", zh: "巴西黑豆炖菜", ar: "يخنة الفاصولياء السوداء البرازيلية" },
  "turkey-chili": { es: "Chili de pavo", fr: "Chili à la dinde", pt: "Chili de peru", hi: "टर्की चिली", zh: "火鸡辣肉酱", ar: "تشيلي الديك الرومي" },
  "baked-sweet-potato": { es: "Camote al horno", fr: "Patate douce au four", pt: "Batata-doce assada", hi: "बेक्ड स्वीट पोटैटो", zh: "烤红薯", ar: "بطاطا حلوة مخبوزة" },
  "chicken-caesar-wrap": { es: "Wrap césar de pollo", fr: "Wrap César au poulet", pt: "Wrap Caesar de frango", hi: "चिकन सीज़र रैप", zh: "凯撒鸡肉卷", ar: "لفافة دجاج سيزر" },
  "veggie-omelette": { es: "Tortilla de vegetales", fr: "Omelette aux légumes", pt: "Omelete de legumes", hi: "वेजी ऑमलेट", zh: "蔬菜煎蛋卷", ar: "أومليت بالخضار" },
  "pb-banana-smoothie": { es: "Batido de mantequilla de maní y plátano", fr: "Smoothie beurre de cacahuète-banane", pt: "Vitamina de pasta de amendoim e banana", hi: "पीनट बटर बनाना स्मूदी", zh: "花生酱香蕉奶昔", ar: "سموذي زبدة الفول السوداني والموز" },
  "baked-chicken-thighs": { es: "Muslos de pollo al horno", fr: "Cuisses de poulet au four", pt: "Coxas de frango assadas", hi: "बेक्ड चिकन थाइज़", zh: "烤鸡腿", ar: "أفخاذ دجاج مخبوزة" },
  "veggie-quesadilla": { es: "Quesadilla de vegetales", fr: "Quesadilla aux légumes", pt: "Quesadilla de legumes", hi: "वेजिटेबल क्वेसाडिया", zh: "蔬菜墨西哥卷饼", ar: "كيساديا بالخضار" },
  "shrimp-tacos": { es: "Tacos de camarón", fr: "Tacos aux crevettes", pt: "Tacos de camarão", hi: "श्रिम्प टैकोस", zh: "虾肉塔可", ar: "تاكو الجمبري" },
  "beef-and-broccoli": { es: "Res con brócoli", fr: "Bœuf au brocoli", pt: "Carne com brócolis", hi: "बीफ एंड ब्रोकली", zh: "牛肉西兰花", ar: "لحم بقر بالبروكلي" },
  "caprese-pasta-salad": { es: "Ensalada de pasta Caprese", fr: "Salade de pâtes Caprese", pt: "Salada de macarrão Caprese", hi: "कैप्रेसे पास्ता सलाद", zh: "卡普雷塞意面沙拉", ar: "سلطة معكرونة كابريزي" },
  "butternut-squash-soup": { es: "Sopa de calabaza butternut", fr: "Soupe de courge butternut", pt: "Sopa de abóbora butternut", hi: "बटरनट स्क्वैश सूप", zh: "南瓜浓汤", ar: "حساء اليقطين" },
  "sausage-and-peppers": { es: "Salchichas con pimientos", fr: "Saucisses et poivrons", pt: "Linguiça com pimentões", hi: "सॉसेज एंड पेपर्स", zh: "香肠彩椒", ar: "نقانق وفلفل" },
  "baked-ziti": { es: "Ziti al horno", fr: "Ziti au four", pt: "Ziti assado", hi: "बेक्ड ज़िटी", zh: "烤通心粉", ar: "زيتي مخبوز" },
  "chickpea-salad-sandwich": { es: "Sándwich de ensalada de garbanzos", fr: "Sandwich à la salade de pois chiches", pt: "Sanduíche de salada de grão-de-bico", hi: "छोले सलाद सैंडविच", zh: "鹰嘴豆沙拉三明治", ar: "ساندويتش سلطة الحمص" },
  "salmon-asparagus-sheet-pan": { es: "Salmón y espárragos en bandeja", fr: "Saumon et asperges sur plaque", pt: "Salmão e aspargos na assadeira", hi: "सैल्मन एंड एस्पैरागस शीट पैन", zh: "三文鱼芦笋烤盘", ar: "سلمون وهليون على صينية" },
  "chia-pudding": { es: "Pudín de chía", fr: "Pudding de chia", pt: "Pudim de chia", hi: "चिया पुडिंग", zh: "奇亚籽布丁", ar: "بودينغ الشيا" },
  "air-fryer-chicken-wings": { es: "Alitas de pollo en freidora de aire", fr: "Ailes de poulet à la friteuse à air", pt: "Asas de frango na air fryer", hi: "एयर फ्रायर चिकन विंग्स", zh: "空气炸锅鸡翅", ar: "أجنحة دجاج بالمقلاة الهوائية" },
  "air-fryer-chicken-breast": { es: "Pechuga de pollo en freidora de aire", fr: "Blanc de poulet à la friteuse à air", pt: "Peito de frango na air fryer", hi: "एयर फ्रायर चिकन ब्रेस्ट", zh: "空气炸锅鸡胸肉", ar: "صدر دجاج بالمقلاة الهوائية" },
  "air-fryer-chicken-thighs": { es: "Muslos de pollo en freidora de aire", fr: "Cuisses de poulet à la friteuse à air", pt: "Coxas de frango na air fryer", hi: "एयर फ्रायर चिकन थाइज़", zh: "空气炸锅鸡腿", ar: "أفخاذ دجاج بالمقلاة الهوائية" },
  "air-fryer-tofu": { es: "Tofu crujiente en freidora de aire", fr: "Tofu croustillant à la friteuse à air", pt: "Tofu crocante na air fryer", hi: "क्रिस्पी एयर फ्रायर टोफू", zh: "空气炸锅脆豆腐", ar: "توفو مقرمش بالمقلاة الهوائية" },
  "air-fryer-salmon": { es: "Salmón en freidora de aire", fr: "Saumon à la friteuse à air", pt: "Salmão na air fryer", hi: "एयर फ्रायर सैल्मन", zh: "空气炸锅三文鱼", ar: "سلمون بالمقلاة الهوائية" },
  "air-fryer-shrimp": { es: "Camarones en freidora de aire", fr: "Crevettes à la friteuse à air", pt: "Camarão na air fryer", hi: "एयर फ्रायर श्रिम्प", zh: "空气炸锅虾", ar: "جمبري بالمقلاة الهوائية" },
  "air-fryer-pork-chops": { es: "Chuletas de cerdo en freidora de aire", fr: "Côtelettes de porc à la friteuse à air", pt: "Costeletas de porco na air fryer", hi: "एयर फ्रायर पोर्क चॉप्स", zh: "空气炸锅猪排", ar: "شرائح لحم خنزير بالمقلاة الهوائية" },
  "air-fryer-steak-bites": { es: "Bocaditos de bistec en freidora de aire", fr: "Bouchées de steak à la friteuse à air", pt: "Pedacinhos de bife na air fryer", hi: "एयर फ्रायर स्टेक बाइट्स", zh: "空气炸锅牛排块", ar: "قطع ستيك بالمقلاة الهوائية" },
  "air-fryer-turkey-meatballs": { es: "Albóndigas de pavo en freidora de aire", fr: "Boulettes de dinde à la friteuse à air", pt: "Almôndegas de peru na air fryer", hi: "एयर फ्रायर टर्की मीटबॉल्स", zh: "空气炸锅火鸡肉丸", ar: "كرات لحم ديك رومي بالمقلاة الهوائية" },
  "air-fryer-broccoli": { es: "Brócoli en freidora de aire", fr: "Brocoli à la friteuse à air", pt: "Brócolis na air fryer", hi: "एयर फ्रायर ब्रोकली", zh: "空气炸锅西兰花", ar: "بروكلي بالمقلاة الهوائية" },
  "air-fryer-brussels-sprouts": { es: "Coles de Bruselas en freidora de aire", fr: "Choux de Bruxelles à la friteuse à air", pt: "Couve de Bruxelas na air fryer", hi: "एयर फ्रायर ब्रसेल्स स्प्राउट्स", zh: "空气炸锅抱子甘蓝", ar: "كرنب بروكسل بالمقلاة الهوائية" },
  "air-fryer-sweet-potato-fries": { es: "Papas fritas de camote en freidora de aire", fr: "Frites de patate douce à la friteuse à air", pt: "Batata-doce frita na air fryer", hi: "एयर फ्रायर स्वीट पोटैटो फ्राइज़", zh: "空气炸锅红薯条", ar: "بطاطا حلوة مقلية بالمقلاة الهوائية" },
  "air-fryer-fries": { es: "Papas fritas en freidora de aire", fr: "Frites à la friteuse à air", pt: "Batata frita na air fryer", hi: "एयर फ्रायर फ्रेंच फ्राइज़", zh: "空气炸锅薯条", ar: "بطاطا مقلية بالمقلاة الهوائية" },
  "air-fryer-zucchini-chips": { es: "Chips de calabacín en freidora de aire", fr: "Chips de courgette à la friteuse à air", pt: "Chips de abobrinha na air fryer", hi: "एयर फ्रायर तोरी चिप्स", zh: "空气炸锅西葫芦片", ar: "رقائق كوسا بالمقلاة الهوائية" },
  "air-fryer-cauliflower-bites": { es: "Bocaditos de coliflor en freidora de aire", fr: "Bouchées de chou-fleur à la friteuse à air", pt: "Pedacinhos de couve-flor na air fryer", hi: "एयर फ्रायर कॉलीफ्लावर बाइट्स", zh: "空气炸锅花菜块", ar: "قطع قرنبيط بالمقلاة الهوائية" },
  "air-fryer-asparagus": { es: "Espárragos en freidora de aire", fr: "Asperges à la friteuse à air", pt: "Aspargos na air fryer", hi: "एयर फ्रायर एस्पैरागस", zh: "空气炸锅芦笋", ar: "هليون بالمقلاة الهوائية" },
  "air-fryer-green-beans": { es: "Ejotes en freidora de aire", fr: "Haricots verts à la friteuse à air", pt: "Vagem na air fryer", hi: "एयर फ्रायर ग्रीन बीन्स", zh: "空气炸锅四季豆", ar: "فاصولياء خضراء بالمقلاة الهوائية" },
  "air-fryer-honey-carrots": { es: "Zanahorias con miel en freidora de aire", fr: "Carottes au miel à la friteuse à air", pt: "Cenoura ao mel na air fryer", hi: "एयर फ्रायर हनी कैरट्स", zh: "空气炸锅蜂蜜胡萝卜", ar: "جزر بالعسل بالمقلاة الهوائية" },
  "air-fryer-mozzarella-sticks": { es: "Palitos de mozzarella en freidora de aire", fr: "Bâtonnets de mozzarella à la friteuse à air", pt: "Palitos de muçarela na air fryer", hi: "एयर फ्रायर मोज़ेरेला स्टिक्स", zh: "空气炸锅马苏里拉芝士条", ar: "أصابع موزاريلا بالمقلاة الهوائية" },
  "air-fryer-onion-rings": { es: "Aros de cebolla en freidora de aire", fr: "Rondelles d'oignon à la friteuse à air", pt: "Anéis de cebola na air fryer", hi: "एयर फ्रायर अनियन रिंग्स", zh: "空气炸锅洋葱圈", ar: "حلقات بصل بالمقلاة الهوائية" },
  "air-fryer-chickpeas": { es: "Garbanzos crujientes en freidora de aire", fr: "Pois chiches croustillants à la friteuse à air", pt: "Grão-de-bico crocante na air fryer", hi: "क्रिस्पी एयर फ्रायर छोले", zh: "空气炸锅脆鹰嘴豆", ar: "حمص مقرمش بالمقلاة الهوائية" },
  "air-fryer-kale-chips": { es: "Chips de col rizada en freidora de aire", fr: "Chips de chou frisé à la friteuse à air", pt: "Chips de couve na air fryer", hi: "एयर फ्रायर केल चिप्स", zh: "空气炸锅羽衣甘蓝脆片", ar: "رقائق كرنب بالمقلاة الهوائية" },
  "air-fryer-bacon": { es: "Tocino en freidora de aire", fr: "Bacon à la friteuse à air", pt: "Bacon na air fryer", hi: "एयर फ्रायर बेकन", zh: "空气炸锅培根", ar: "بيكون بالمقلاة الهوائية" },
  "air-fryer-hash-browns": { es: "Papas ralladas en freidora de aire", fr: "Galettes de pommes de terre à la friteuse à air", pt: "Batata ralada na air fryer", hi: "एयर फ्रायर हैश ब्राउन", zh: "空气炸锅土豆饼", ar: "بطاطا مبشورة بالمقلاة الهوائية" },
  "air-fryer-eggs": { es: "Huevos \"duros\" en freidora de aire", fr: "Œufs « durs » à la friteuse à air", pt: "Ovos \"cozidos\" na air fryer", hi: "एयर फ्रायर \"हार्ड-बॉइल्ड\" एग्स", zh: "空气炸锅\"水煮\"蛋", ar: "بيض \"مسلوق\" بالمقلاة الهوائية" },
  "air-fryer-french-toast-sticks": { es: "Palitos de pan francés en freidora de aire", fr: "Bâtonnets de pain perdu à la friteuse à air", pt: "Palitos de rabanada na air fryer", hi: "एयर फ्रायर फ्रेंच टोस्ट स्टिक्स", zh: "空气炸锅法式吐司条", ar: "أصابع توست فرنسي بالمقلاة الهوائية" },
  "air-fryer-churros": { es: "Churros en freidora de aire", fr: "Churros à la friteuse à air", pt: "Churros na air fryer", hi: "एयर फ्रायर चुर्रोस", zh: "空气炸锅churros", ar: "تشورو بالمقلاة الهوائية" },
  "air-fryer-apple-chips": { es: "Chips de manzana en freidora de aire", fr: "Chips de pomme à la friteuse à air", pt: "Chips de maçã na air fryer", hi: "एयर फ्रायर एप्पल चिप्स", zh: "空气炸锅苹果脆片", ar: "رقائق تفاح بالمقلاة الهوائية" },
  "air-fryer-plantains": { es: "Plátanos dulces en freidora de aire", fr: "Bananes plantain sucrées à la friteuse à air", pt: "Banana-da-terra doce na air fryer", hi: "एयर फ्रायर स्वीट प्लांटेन", zh: "空气炸锅甜大蕉", ar: "موز بلانتين حلو بالمقلاة الهوائية" },
  "air-fryer-samosas": { es: "Samosas en freidora de aire", fr: "Samossas à la friteuse à air", pt: "Samosas na air fryer", hi: "एयर फ्रायर समोसे", zh: "空气炸锅萨摩萨", ar: "سمبوسة بالمقلاة الهوائية" },
  "air-fryer-spring-rolls": { es: "Rollitos de primavera en freidora de aire", fr: "Rouleaux de printemps à la friteuse à air", pt: "Rolinhos primavera na air fryer", hi: "एयर फ्रायर स्प्रिंग रोल्स", zh: "空气炸锅春卷", ar: "لفائف ربيع بالمقلاة الهوائية" },
  "air-fryer-karaage": { es: "Karaage de pollo en freidora de aire", fr: "Karaage de poulet à la friteuse à air", pt: "Karaage de frango na air fryer", hi: "एयर फ्रायर चिकन कराआगे", zh: "空气炸锅唐扬炸鸡", ar: "كاراجي دجاج بالمقلاة الهوائية" },
  "air-fryer-falafel": { es: "Falafel en freidora de aire", fr: "Falafel à la friteuse à air", pt: "Falafel na air fryer", hi: "एयर फ्रायर फलाफेल", zh: "空气炸锅法拉费", ar: "فلافل بالمقلاة الهوائية" },
  "air-fryer-arancini": { es: "Arancini en freidora de aire", fr: "Arancini à la friteuse à air", pt: "Arancini na air fryer", hi: "एयर फ्रायर अरांचिनी", zh: "空气炸锅炸饭团", ar: "أرانشيني بالمقلاة الهوائية" },
  "air-fryer-empanadas": { es: "Empanadas en freidora de aire", fr: "Empanadas à la friteuse à air", pt: "Empanadas na air fryer", hi: "एयर फ्रायर एम्पनाडास", zh: "空气炸锅恩帕纳达", ar: "إمبانادا بالمقلاة الهوائية" },
  "air-fryer-tandoori-chicken": { es: "Pollo tandoori en freidora de aire", fr: "Poulet tandoori à la friteuse à air", pt: "Frango tandoori na air fryer", hi: "एयर फ्रायर तंदूरी चिकन", zh: "空气炸锅坦都里鸡", ar: "دجاج تندوري بالمقلاة الهوائية" },
  "air-fryer-jerk-wings": { es: "Alitas jerk en freidora de aire", fr: "Ailes jerk à la friteuse à air", pt: "Asas jerk na air fryer", hi: "एयर फ्रायर जर्क चिकन विंग्स", zh: "空气炸锅牙买加香辣鸡翅", ar: "أجنحة جيرك بالمقلاة الهوائية" },
  "air-fryer-korean-fried-chicken": { es: "Pollo frito coreano en freidora de aire", fr: "Poulet frit coréen à la friteuse à air", pt: "Frango frito coreano na air fryer", hi: "एयर फ्रायर कोरियन फ्राइड चिकन", zh: "空气炸锅韩式炸鸡", ar: "دجاج مقلي كوري بالمقلاة الهوائية" },
  "air-fryer-fish-tacos": { es: "Tacos de pescado en freidora de aire", fr: "Tacos au poisson à la friteuse à air", pt: "Tacos de peixe na air fryer", hi: "एयर फ्रायर फिश टैकोस", zh: "空气炸锅鱼肉塔可", ar: "تاكو سمك بالمقلاة الهوائية" },
  "air-fryer-shrimp-tempura": { es: "Tempura de camarón en freidora de aire", fr: "Tempura de crevettes à la friteuse à air", pt: "Tempura de camarão na air fryer", hi: "एयर फ्रायर श्रिम्प टेम्पुरा", zh: "空气炸锅天妇罗虾", ar: "تمبورا جمبري بالمقلاة الهوائية" },
  "air-fryer-eggplant-parmesan": { es: "Berenjena a la parmesana en freidora de aire", fr: "Aubergine parmesane à la friteuse à air", pt: "Berinjela à parmegiana na air fryer", hi: "एयर फ्रायर एगप्लांट परमेसन", zh: "空气炸锅芝士茄子", ar: "باذنجان بارميزان بالمقلاة الهوائية" },
  "air-fryer-quesadilla": { es: "Quesadilla en freidora de aire", fr: "Quesadilla à la friteuse à air", pt: "Quesadilla na air fryer", hi: "एयर फ्रायर क्वेसाडिया", zh: "空气炸锅墨西哥卷饼", ar: "كيساديا بالمقلاة الهوائية" },
  "air-fryer-stuffed-peppers": { es: "Pimientos rellenos en freidora de aire", fr: "Poivrons farcis à la friteuse à air", pt: "Pimentão recheado na air fryer", hi: "एयर फ्रायर स्टफ्ड पेपर्स", zh: "空气炸锅酿甜椒", ar: "فلفل محشو بالمقلاة الهوائية" },
  "air-fryer-mini-meatloaves": { es: "Mini pastel de carne en freidora de aire", fr: "Mini pains de viande à la friteuse à air", pt: "Mini bolo de carne na air fryer", hi: "एयर फ्रायर मिनी मीटलोफ", zh: "空气炸锅迷你肉饼", ar: "أرغفة لحم صغيرة بالمقلاة الهوائية" },
  "air-fryer-salmon-bites": { es: "Bocaditos de salmón en freidora de aire", fr: "Bouchées de saumon à la friteuse à air", pt: "Pedacinhos de salmão na air fryer", hi: "एयर फ्रायर सैल्मन बाइट्स", zh: "空气炸锅三文鱼块", ar: "قطع سلمون بالمقلاة الهوائية" },
  "air-fryer-cod": { es: "Bacalao en freidora de aire", fr: "Cabillaud à la friteuse à air", pt: "Bacalhau na air fryer", hi: "एयर फ्रायर कॉड", zh: "空气炸锅鳕鱼", ar: "سمك القد بالمقلاة الهوائية" },
  "air-fryer-pork-belly-bites": { es: "Bocaditos crujientes de panceta en freidora de aire", fr: "Bouchées croustillantes de poitrine de porc à la friteuse à air", pt: "Pedacinhos crocantes de barriga de porco na air fryer", hi: "एयर फ्रायर क्रिस्पी पोर्क बेली बाइट्स", zh: "空气炸锅脆五花肉块", ar: "قطع صدر خنزير مقرمشة بالمقلاة الهوائية" },
  "air-fryer-tostones": { es: "Tostones en freidora de aire", fr: "Tostones à la friteuse à air", pt: "Tostones na air fryer", hi: "एयर फ्रायर टोस्टोन्स", zh: "空气炸锅炸大蕉片", ar: "توستونيس بالمقلاة الهوائية" },
  "air-fryer-granola": { es: "Granola en freidora de aire", fr: "Granola à la friteuse à air", pt: "Granola na air fryer", hi: "एयर फ्रायर ग्रेनोला", zh: "空气炸锅什锦麦片", ar: "غرانولا بالمقلاة الهوائية" },
  "air-fryer-veggie-chips": { es: "Chips de vegetales mixtos en freidora de aire", fr: "Chips de légumes variés à la friteuse à air", pt: "Chips de legumes variados na air fryer", hi: "एयर फ्रायर मिक्स्ड वेजी चिप्स", zh: "空气炸锅什锦蔬菜脆片", ar: "رقائق خضار مشكلة بالمقلاة الهوائية" },
  "british-fish-and-chips": { es: "Pescado y papas fritas", fr: "Fish and chips", pt: "Peixe com batatas fritas", hi: "फिश एंड चिप्स", zh: "炸鱼薯条", ar: "سمك وبطاطا مقلية" },
  "british-shepherds-pie": { es: "Pastel del pastor", fr: "Hachis parmentier britannique", pt: "Torta do pastor", hi: "शेफर्ड्स पाई", zh: "牧羊人派", ar: "فطيرة الراعي" },
  "british-full-english": { es: "Desayuno inglés completo", fr: "Petit-déjeuner anglais complet", pt: "Café da manhã inglês completo", hi: "फुल इंग्लिश ब्रेकफास्ट", zh: "英式全套早餐", ar: "إفطار إنجليزي كامل" },
  "british-bangers-mash": { es: "Salchichas con puré de papa", fr: "Saucisses purée", pt: "Linguiça com purê de batata", hi: "बैंगर्स एंड मैश", zh: "香肠土豆泥", ar: "نقانق مع بطاطا مهروسة" },
  "thai-green-curry": { es: "Curry verde tailandés", fr: "Curry vert thaï", pt: "Curry verde tailandês", hi: "थाई ग्रीन करी", zh: "泰式绿咖喱", ar: "كاري أخضر تايلاندي" },
  "thai-mango-sticky-rice": { es: "Arroz pegajoso con mango", fr: "Riz gluant à la mangue", pt: "Arroz pegajoso com manga", hi: "मैंगो स्टिकी राइस", zh: "芒果糯米饭", ar: "أرز لزج بالمانجو" },
  "thai-tom-yum-soup": { es: "Sopa tom yum", fr: "Soupe tom yum", pt: "Sopa tom yum", hi: "टॉम यम सूप", zh: "冬阴功汤", ar: "حساء توم يام" },
  "african-nigerian-jollof": { es: "Arroz jollof estilo nigeriano", fr: "Riz jollof à la nigériane", pt: "Arroz jollof estilo nigeriano", hi: "नाइजीरियन-स्टाइल जोलोफ राइस", zh: "尼日利亚风味佐罗夫饭", ar: "أرز جولوف على الطريقة النيجيرية" },
  "african-suya-skewers": { es: "Brochetas de res suya", fr: "Brochettes de bœuf suya", pt: "Espetinhos de carne suya", hi: "सुया स्पाइस्ड बीफ स्कूवर्स", zh: "苏亚香料牛肉串", ar: "أسياخ لحم بقر بتوابل السويا" },
  "african-chapati": { es: "Chapati del este de África", fr: "Chapati d'Afrique de l'Est", pt: "Chapati da África Oriental", hi: "ईस्ट अफ्रीकन चपाती", zh: "东非恰帕提饼", ar: "شباتي شرق أفريقي" },
  "african-peanut-stew": { es: "Guiso de maní de África Occidental", fr: "Ragoût d'arachide d'Afrique de l'Ouest", pt: "Ensopado de amendoim da África Ocidental", hi: "वेस्ट अफ्रीकन पीनट स्ट्यू", zh: "西非花生炖菜", ar: "يخنة الفول السوداني الغرب أفريقية" },
  "ethiopian-doro-wat": { es: "Doro wat (guiso de pollo especiado)", fr: "Doro wat (ragoût de poulet épicé)", pt: "Doro wat (ensopado de frango apimentado)", hi: "डोरो वॉट (स्पाइस्ड चिकन स्ट्यू)", zh: "多罗沃特香辣炖鸡", ar: "دورو وات (يخنة دجاج متبلة)" },
  "ethiopian-shiro": { es: "Shiro (guiso de harina de garbanzo)", fr: "Shiro (ragoût de farine de pois chiche)", pt: "Shiro (ensopado de farinha de grão-de-bico)", hi: "शिरो (चिकपी फ्लोर स्ट्यू)", zh: "希罗鹰嘴豆粉炖菜", ar: "شيرو (يخنة دقيق الحمص)" },
  "ethiopian-tikil-gomen": { es: "Tikil gomen (repollo y zanahorias)", fr: "Tikil gomen (chou et carottes)", pt: "Tikil gomen (repolho e cenoura)", hi: "टिकिल गोमेन (कैबेज एंड कैरट्स)", zh: "提基尔戈门卷心菜胡萝卜", ar: "تيكل غومن (ملفوف وجزر)" },
  "french-quiche-lorraine": { es: "Quiche lorena", fr: "Quiche lorraine", pt: "Quiche lorraine", hi: "क्विश लोरेन", zh: "洛林咸派", ar: "كيش لورين" },
  "french-onion-soup": { es: "Sopa de cebolla francesa", fr: "Soupe à l'oignon", pt: "Sopa de cebola francesa", hi: "फ्रेंच अनियन सूप", zh: "法式洋葱汤", ar: "حساء البصل الفرنسي" },
  "french-crepes": { es: "Crepas sencillas", fr: "Crêpes simples", pt: "Panquecas francesas simples", hi: "सिंपल क्रेप्स", zh: "简易可丽饼", ar: "كريب بسيط" },
  "spanish-paella": { es: "Paella de mariscos sencilla", fr: "Paella de fruits de mer simple", pt: "Paella de frutos do mar simples", hi: "सिंपल सीफूड पेएला", zh: "简易海鲜西班牙烩饭", ar: "بايلا مأكولات بحرية بسيطة" },
  "spanish-patatas-bravas": { es: "Patatas bravas", fr: "Patatas bravas", pt: "Patatas bravas", hi: "पटाटास ब्रावास", zh: "西班牙辣土豆", ar: "بطاطا برافاس" },
  "spanish-gazpacho": { es: "Gazpacho", fr: "Gaspacho", pt: "Gaspacho", hi: "गाज़्पाचो", zh: "西班牙冷汤", ar: "غاسباتشو" },
  "brazilian-coxinha": { es: "Coxinha (croquetas de pollo)", fr: "Coxinha (croquettes de poulet)", pt: "Coxinha (croquete de frango)", hi: "कोशिन्हा (चिकन क्रोकेट्स)", zh: "巴西鸡肉可乐饼", ar: "كوشينيا (كروكيت دجاج)" },
  "brazilian-pao-de-queijo": { es: "Pão de queijo (pan de queso)", fr: "Pão de queijo (pain au fromage)", pt: "Pão de queijo", hi: "पाओ डे केइजो (चीज़ ब्रेड बाइट्स)", zh: "巴西芝士面包球", ar: "باو دي كيجو (كرات خبز الجبن)" },
  "brazilian-moqueca": { es: "Moqueca (guiso brasileño de pescado)", fr: "Moqueca (ragoût brésilien de poisson)", pt: "Moqueca (ensopado brasileiro de peixe)", hi: "मोकेका (ब्राज़ीलियन फिश स्ट्यू)", zh: "巴西鱼炖菜", ar: "موكيكا (يخنة السمك البرازيلية)" },
};

// English name is always the recipe's own `name` field (source of truth);
// other languages come from RECIPE_NAME_TR, falling back to English if a
// specific recipe (e.g. a user-created one) has no translation entry.
const INTL_LOCALE = { en: "en", es: "es", fr: "fr", pt: "pt", hi: "hi", zh: "zh", ar: "ar" };
function whenLabel(entry, language) {
  if (!entry.at) return entry.when || "";
  const diff = Date.now() - entry.at;
  const loc = INTL_LOCALE[language] || "en";
  try {
    const rtf = new Intl.RelativeTimeFormat(loc, { numeric: "auto" });
    const mins = Math.round(diff / 60000);
    if (mins < 1) return rtf.format(0, "second");
    if (mins < 60) return rtf.format(-mins, "minute");
    const hours = Math.round(mins / 60);
    if (hours < 24) return rtf.format(-hours, "hour");
    const days = Math.round(hours / 24);
    if (days < 7) return rtf.format(-days, "day");
    return new Date(entry.at).toLocaleDateString(loc, { month: "short", day: "numeric" });
  } catch {
    return new Date(entry.at).toLocaleDateString();
  }
}

function recipeName(recipe, language) {
  if (language === "en" || !recipe) return recipe?.name ?? "";
  return RECIPE_NAME_TR[recipe.id]?.[language] ?? recipe.name;
}

// Step and flavor-boost translations, keyed by recipe id then language.
// Covers all 141 recipes across all 7 non-English languages.
const RECIPE_STEPS_TR = {
  ...WORLD.steps,
  ...FRUIT_STEPS_TR,
  "mug-eggs": {
    es: [{ instruction: "Rompe los huevos en una taza grande y bate con un tenedor", measure: "2 huevos + 2 cdas de leche", visual: "La mezcla debe ser de un color amarillo pálido uniforme, sin vetas" }, { instruction: "Añade sal y pimienta, bate de nuevo", measure: "Una pizca de cada uno", visual: "No hay zonas secas en la superficie" }, { instruction: "Cocina en el microondas, revolviendo a la mitad", measure: "45 seg, revuelve, luego 30 seg más", visual: "Los huevos son cuajos suaves y esponjosos — no brillantes ni húmedos" }],
    fr: [{ instruction: "Cassez les œufs dans une grande tasse et fouettez à la fourchette", measure: "2 œufs + 2 c. à s. de lait", visual: "Le mélange doit être d'une couleur jaune pâle uniforme, sans traînées" }, { instruction: "Ajoutez sel et poivre, fouettez à nouveau", measure: "Une pincée de chaque", visual: "Aucune zone sèche sur le dessus" }, { instruction: "Passez au micro-ondes, en remuant à mi-cuisson", measure: "45 sec, remuez, puis 30 sec de plus", visual: "Les œufs sont en grumeaux moelleux — pas brillants ni humides" }],
    pt: [{ instruction: "Quebre os ovos numa caneca grande e bata com um garfo", measure: "2 ovos + 2 colheres de sopa de leite", visual: "A mistura deve ficar de uma cor amarelo-clara uniforme, sem listras" }, { instruction: "Adicione sal e pimenta, bata novamente", measure: "Uma pitada de cada", visual: "Sem áreas secas por cima" }, { instruction: "Leve ao micro-ondas, mexendo na metade do tempo", measure: "45 seg, mexa, depois mais 30 seg", visual: "Os ovos formam grumos fofos e macios — não brilhantes nem molhados" }],
    hi: [{ instruction: "अंडों को एक बड़े मग में तोड़ें और कांटे से फेंटें", measure: "2 अंडे + 2 बड़े चम्मच दूध", visual: "मिश्रण एक समान हल्के पीले रंग का होना चाहिए, कोई धारियाँ नहीं" }, { instruction: "नमक और काली मिर्च डालें, फिर से फेंटें", measure: "प्रत्येक की एक चुटकी", visual: "ऊपर कोई सूखा हिस्सा नहीं" }, { instruction: "माइक्रोवेव करें, बीच में हिलाते हुए", measure: "45 सेकंड, हिलाएं, फिर 30 सेकंड और", visual: "अंडे नरम, फूले हुए टुकड़े हैं — चमकदार या गीले नहीं दिखने चाहिए" }],
    zh: [{ instruction: "将鸡蛋打入大马克杯中，用叉子搅打", measure: "2个鸡蛋 + 2汤匙牛奶", visual: "混合物应呈均匀的淡黄色，无条纹" }, { instruction: "加入盐和胡椒，再次搅打", measure: "各一小撮", visual: "表面没有干燥的斑点" }, { instruction: "微波加热，中途搅拌一次", measure: "45秒，搅拌，再加热30秒", visual: "鸡蛋呈柔软蓬松的凝块状——不是发亮或湿润的样子" }],
    ar: [{ instruction: "اكسر البيض في كوب كبير واخفقه بالشوكة", measure: "بيضتان + 2 ملعقة كبيرة حليب", visual: "يجب أن يكون الخليط بلون أصفر فاتح موحد، بدون خطوط" }, { instruction: "أضف الملح والفلفل، اخفق مرة أخرى", measure: "رشة من كل منهما", visual: "لا توجد بقع جافة على السطح" }, { instruction: "ضعه في الميكروويف، مع التحريك في المنتصف", measure: "45 ثانية، حرّك، ثم 30 ثانية أخرى", visual: "البيض قطع طرية ورقيقة — ليست لامعة أو رطبة المظهر" }],
  },
  "garlic-pasta": {
    es: [{ instruction: "Hierve agua con sal y cocina la pasta", measure: "8–9 min, hasta que el paquete indique que está lista", visual: "La pasta se dobla fácilmente pero aún tiene un ligero bocado firme" }, { instruction: "Derrite mantequilla en la misma olla, añade ajo picado", measure: "1 min a fuego medio-bajo", visual: "El ajo se vuelve fragante y ligeramente dorado — no marrón" }, { instruction: "Mezcla la pasta escurrida con mantequilla, ajo y parmesano", measure: "Fuera del fuego, mezcla 30 seg", visual: "Cada hebra se ve brillante y cubierta, ninguna seca" }],
    fr: [{ instruction: "Faites bouillir de l'eau salée et cuisez les pâtes", measure: "8–9 min, jusqu'à cuisson selon le paquet", visual: "Les pâtes plient facilement mais gardent un léger mordant" }, { instruction: "Faites fondre le beurre dans la même casserole, ajoutez l'ail émincé", measure: "1 min à feu moyen-doux", visual: "L'ail devient parfumé et légèrement doré — pas brun" }, { instruction: "Mélangez les pâtes égouttées avec le beurre, l'ail, le parmesan", measure: "Hors du feu, mélangez 30 sec", visual: "Chaque brin est brillant et enrobé, aucun n'est sec" }],
    pt: [{ instruction: "Ferva água com sal e cozinhe o macarrão", measure: "8–9 min, até o ponto indicado na embalagem", visual: "O macarrão dobra facilmente mas ainda tem uma leve firmeza" }, { instruction: "Derreta manteiga na mesma panela, adicione alho picado", measure: "1 min em fogo médio-baixo", visual: "O alho fica perfumado e levemente dourado — não marrom" }, { instruction: "Misture o macarrão escorrido com manteiga, alho e parmesão", measure: "Fora do fogo, misture por 30 seg", visual: "Cada fio fica brilhante e coberto, nenhum seco" }],
    hi: [{ instruction: "नमकीन पानी उबालें और पास्ता पकाएं", measure: "8-9 मिनट, पैकेज पर बताए अनुसार", visual: "पास्ता आसानी से मुड़ता है लेकिन फिर भी थोड़ा सख्त रहता है" }, { instruction: "उसी बर्तन में मक्खन पिघलाएं, कटा हुआ लहसुन डालें", measure: "मध्यम-धीमी आंच पर 1 मिनट", visual: "लहसुन से खुशबू आती है और हल्का सुनहरा हो जाता है — भूरा नहीं" }, { instruction: "छाने हुए पास्ता को मक्खन, लहसुन, परमेसन के साथ मिलाएं", measure: "आंच से हटाकर, 30 सेकंड मिलाएं", visual: "हर धागा चमकदार और लिपटा हुआ दिखे, कोई सूखा नहीं" }],
    zh: [{ instruction: "烧开盐水煮意面", measure: "8-9分钟，煮至包装说明的程度", visual: "意面容易弯曲但仍有轻微的嚼劲" }, { instruction: "在同一个锅里融化黄油，加入蒜末", measure: "中小火1分钟", visual: "大蒜变得香气四溢，呈浅金色——不是棕色" }, { instruction: "将沥干的意面与黄油、蒜末、帕玛森芝士拌匀", measure: "离火，拌30秒", visual: "每根面条看起来光亮均匀，没有干燥的部分" }],
    ar: [{ instruction: "اغلِ ماءً مملحًا واطبخ المعكرونة", measure: "8-9 دقائق، حتى تنضج حسب تعليمات العبوة", visual: "تنثني المعكرونة بسهولة لكنها تحتفظ بقوام متماسك خفيف" }, { instruction: "أذب الزبدة في نفس القدر، أضف الثوم المفروم", measure: "دقيقة واحدة على نار متوسطة منخفضة", visual: "يصبح الثوم عطرًا وذهبيًا فاتحًا — وليس بنيًا" }, { instruction: "اخلط المعكرونة المصفاة مع الزبدة والثوم والبارميزان", measure: "بعيدًا عن النار، اخلط 30 ثانية", visual: "كل خيط لامع ومغطى، لا شيء جاف" }],
  },
  "tuna-wrap": {
    es: [{ instruction: "Mezcla el atún con mayonesa en un tazón", measure: "1 lata de atún + 1 cda de mayonesa", visual: "El atún se mantiene unido al servirlo, no está aguado" }, { instruction: "Coloca la tortilla plana, añade lechuga y la mezcla de atún", measure: "Tercio central de la tortilla", visual: "El relleno queda en una línea ordenada, no esparcido de borde a borde" }, { instruction: "Dobla los lados, luego enrolla firmemente", measure: "N/A", visual: "El wrap mantiene su forma sin que se derrame el relleno" }],
    fr: [{ instruction: "Mélangez le thon avec la mayonnaise dans un bol", measure: "1 boîte de thon + 1 c. à s. de mayonnaise", visual: "Le thon tient ensemble quand on le prélève, pas liquide" }, { instruction: "Posez la tortilla à plat, ajoutez la laitue et le mélange au thon", measure: "Tiers central de la tortilla", visual: "La garniture forme une ligne nette, pas étalée bord à bord" }, { instruction: "Repliez les côtés, puis roulez serré", measure: "N/A", visual: "Le wrap garde sa forme sans que la garniture ne s'échappe" }],
    pt: [{ instruction: "Misture o atum com maionese numa tigela", measure: "1 lata de atum + 1 colher de sopa de maionese", visual: "O atum fica firme ao ser pego, não fica líquido" }, { instruction: "Estenda a tortilla, adicione alface e a mistura de atum", measure: "Terço central da tortilha", visual: "O recheio fica numa linha organizada, não espalhado até a borda" }, { instruction: "Dobre as laterais, depois enrole firme", measure: "N/A", visual: "O wrap mantém a forma sem o recheio vazar" }],
    hi: [{ instruction: "एक कटोरे में टूना को मेयो के साथ मिलाएं", measure: "1 कैन टूना + 1 बड़ा चम्मच मेयो", visual: "टूना उठाने पर एक साथ रहता है, बहता नहीं" }, { instruction: "टॉर्टिला बिछाएं, लेट्यूस और टूना मिश्रण डालें", measure: "टॉर्टिला के बीच वाले तिहाई हिस्से पर", visual: "फिलिंग एक साफ लाइन में रहे, किनारे तक न फैली हो" }, { instruction: "किनारों को मोड़ें, फिर कसकर रोल करें", measure: "लागू नहीं", visual: "रैप बिना फिलिंग गिराए अपना आकार बनाए रखता है" }],
    zh: [{ instruction: "在碗中将金枪鱼和蛋黄酱混合", measure: "1罐金枪鱼 + 1汤匙蛋黄酱", visual: "舀起时金枪鱼能保持形状，不会松散" }, { instruction: "摊平墨西哥薄饼，加入生菜和金枪鱼混合物", measure: "薄饼中间三分之一处", visual: "馅料呈整齐的一条线，不要铺满整张饼" }, { instruction: "将两侧折进来，然后卷紧", measure: "不适用", visual: "卷饼保持形状，馅料不会漏出" }],
    ar: [{ instruction: "اخلط التونة مع المايونيز في وعاء", measure: "علبة تونة واحدة + ملعقة كبيرة مايونيز", visual: "تتماسك التونة عند رفعها، وليست سائلة" }, { instruction: "افرد التورتيا، أضف الخس وخليط التونة", measure: "الثلث الأوسط من التورتيا", visual: "يبقى الحشو في خط مرتب، وليس ممتدًا حتى الحواف" }, { instruction: "اطوِ الجانبين، ثم لفّها بإحكام", measure: "غير محدد", visual: "تحافظ اللفافة على شكلها دون تسرب الحشو" }],
  },
  "grilled-cheese": {
    es: [{ instruction: "Unta con mantequilla un lado de cada rebanada de pan", measure: "1 cda de mantequilla en total", visual: "Capa fina y uniforme — sin zonas secas" }, { instruction: "Coloca con el lado de mantequilla hacia abajo en una sartén fría, añade queso, cubre con la otra rebanada", measure: "N/A", visual: "El queso queda completamente dentro de los bordes del pan" }, { instruction: "Cocina a fuego medio", measure: "3–4 min", visual: "La parte de abajo está dorada, no marrón oscuro" }, { instruction: "Voltea y cocina el otro lado", measure: "2–3 min", visual: "El queso se ve derritiéndose visiblemente en los bordes" }],
    fr: [{ instruction: "Beurrez un côté de chaque tranche de pain", measure: "1 c. à s. de beurre au total", visual: "Couche fine et régulière — pas de zones sèches" }, { instruction: "Placez côté beurré vers le bas dans une poêle froide, ajoutez le fromage, couvrez avec l'autre tranche", measure: "N/A", visual: "Le fromage reste entièrement à l'intérieur des bords du pain" }, { instruction: "Faites cuire à feu moyen", measure: "3–4 min", visual: "Le dessous est doré, pas brun foncé" }, { instruction: "Retournez et faites cuire l'autre côté", measure: "2–3 min", visual: "Le fromage fond visiblement sur les bords" }],
    pt: [{ instruction: "Passe manteiga num lado de cada fatia de pão", measure: "1 colher de sopa de manteiga no total", visual: "Camada fina e uniforme — sem áreas secas" }, { instruction: "Coloque com o lado da manteiga para baixo numa frigideira fria, adicione o queijo, cubra com a outra fatia", measure: "N/A", visual: "O queijo fica totalmente dentro das bordas do pão" }, { instruction: "Cozinhe em fogo médio", measure: "3–4 min", visual: "A parte de baixo está dourada, não marrom escuro" }, { instruction: "Vire e cozinhe o outro lado", measure: "2–3 min", visual: "O queijo está visivelmente derretendo nas bordas" }],
    hi: [{ instruction: "ब्रेड के हर टुकड़े के एक तरफ मक्खन लगाएं", measure: "कुल 1 बड़ा चम्मच मक्खन", visual: "पतली, समान परत — कोई सूखा हिस्सा नहीं" }, { instruction: "ठंडे पैन में मक्खन वाला हिस्सा नीचे रखें, चीज़ डालें, दूसरे टुकड़े से ढकें", measure: "लागू नहीं", visual: "चीज़ ब्रेड के किनारों के अंदर पूरी तरह रहे" }, { instruction: "मध्यम आंच पर पकाएं", measure: "3-4 मिनट", visual: "नीचे का हिस्सा सुनहरा है, गहरा भूरा नहीं" }, { instruction: "पलटें और दूसरी तरफ पकाएं", measure: "2-3 मिनट", visual: "चीज़ किनारों पर स्पष्ट रूप से पिघल रहा है" }],
    zh: [{ instruction: "在每片面包的一面涂黄油", measure: "共1汤匙黄油", visual: "薄而均匀的一层——没有干燥的部分" }, { instruction: "涂黄油的一面朝下放入冷锅中，加入芝士，盖上另一片面包", measure: "不适用", visual: "芝士完全在面包边缘之内" }, { instruction: "中火煎", measure: "3-4分钟", visual: "底部呈金黄色，不是深褐色" }, { instruction: "翻面煎另一面", measure: "2-3分钟", visual: "芝士在边缘处明显开始融化" }],
    ar: [{ instruction: "ادهن الزبدة على جانب واحد من كل شريحة خبز", measure: "ملعقة كبيرة زبدة إجمالًا", visual: "طبقة رقيقة وموحدة — بدون بقع جافة" }, { instruction: "ضع الجانب المزبد لأسفل في مقلاة باردة، أضف الجبنة، غطِّ بالشريحة الأخرى", measure: "غير محدد", visual: "تبقى الجبنة بالكامل داخل حواف الخبز" }, { instruction: "اطبخ على نار متوسطة", measure: "3-4 دقائق", visual: "الجزء السفلي ذهبي، وليس بنيًا داكنًا" }, { instruction: "اقلب واطبخ الجانب الآخر", measure: "2-3 دقائق", visual: "تذوب الجبنة بوضوح عند الحواف" }],
  },
  "ramen-upgrade": {
    es: [{ instruction: "Hierve agua y cocina los fideos con el condimento", measure: "3 min", visual: "Los fideos se han aflojado y separado por completo" }, { instruction: "Rompe un huevo en la olla, no revuelvas de inmediato", measure: "1 min sin tocar", visual: "La clara se está volviendo opaca, la yema aún blanda" }, { instruction: "Cubre con cebolla verde picada y sirve", measure: "Al gusto", visual: "La cebolla está verde brillante, no marchita por el calor" }],
    fr: [{ instruction: "Faites bouillir de l'eau et cuisez les nouilles avec l'assaisonnement", measure: "3 min", visual: "Les nouilles se sont détendues et complètement séparées" }, { instruction: "Cassez un œuf dans la casserole, ne remuez pas tout de suite", measure: "1 min sans y toucher", visual: "Le blanc devient opaque, le jaune encore mou" }, { instruction: "Garnissez d'oignon vert haché et servez", measure: "Selon le goût", visual: "L'oignon est vert vif, pas flétri par la chaleur" }],
    pt: [{ instruction: "Ferva água e cozinhe o macarrão com o tempero", measure: "3 min", visual: "O macarrão está solto e totalmente separado" }, { instruction: "Quebre um ovo na panela, não mexa imediatamente", measure: "1 min sem mexer", visual: "A clara está ficando opaca, a gema ainda mole" }, { instruction: "Cubra com cebolinha picada e sirva", measure: "A gosto", visual: "A cebolinha está verde vibrante, não murcha pelo calor" }],
    hi: [{ instruction: "पानी उबालें और सीज़निंग के साथ नूडल्स पकाएं", measure: "3 मिनट", visual: "नूडल्स पूरी तरह ढीले और अलग हो गए हैं" }, { instruction: "बर्तन में अंडा तोड़ें, तुरंत न हिलाएं", measure: "1 मिनट बिना छेड़े", visual: "सफेद भाग अपारदर्शी हो रहा है, जर्दी अभी भी नरम है" }, { instruction: "कटा हुआ हरा प्याज़ डालकर परोसें", measure: "स्वादानुसार", visual: "प्याज़ चमकीला हरा है, गर्मी से मुरझाया नहीं" }],
    zh: [{ instruction: "烧水，加调料煮面条", measure: "3分钟", visual: "面条已经完全松散分开" }, { instruction: "将鸡蛋打入锅中，不要立即搅拌", measure: "静置1分钟", visual: "蛋白正在变得不透明，蛋黄仍然柔软" }, { instruction: "撒上切好的青葱即可食用", measure: "适量", visual: "葱花呈鲜绿色，没有被热气烫蔫" }],
    ar: [{ instruction: "اغلِ الماء واطبخ النودلز مع التوابل", measure: "3 دقائق", visual: "أصبحت النودلز مفككة ومنفصلة تمامًا" }, { instruction: "اكسر بيضة في القدر، لا تحرك فورًا", measure: "دقيقة واحدة بدون تحريك", visual: "البياض يصبح معتمًا، الصفار لا يزال طريًا" }, { instruction: "أضف البصل الأخضر المفروم وقدّمه", measure: "حسب الرغبة", visual: "البصل أخضر زاهٍ، لم يذبل من الحرارة" }],
  },
  "overnight-oats": {
    es: [{ instruction: "Combina avena, leche y miel en un frasco", measure: "1/2 taza de avena + 1/2 taza de leche + 1 cdta de miel", visual: "La avena está totalmente sumergida, ninguna seca encima" }, { instruction: "Corta plátano encima, sella y refrigera", measure: "Toda la noche, 6+ horas", visual: "N/A" }, { instruction: "Revuelve antes de comer", measure: "N/A", visual: "La mezcla es espesa y cremosa, no aguada" }],
    fr: [{ instruction: "Mélangez flocons d'avoine, lait et miel dans un bocal", measure: "1/2 tasse de flocons + 1/2 tasse de lait + 1 c. à c. de miel", visual: "Les flocons sont complètement immergés, aucun sec dessus" }, { instruction: "Tranchez une banane dessus, fermez et réfrigérez", measure: "Toute la nuit, 6h ou plus", visual: "N/A" }, { instruction: "Remuez avant de manger", measure: "N/A", visual: "Le mélange est épais et crémeux, pas liquide" }],
    pt: [{ instruction: "Combine aveia, leite e mel num pote", measure: "1/2 xícara de aveia + 1/2 xícara de leite + 1 colher de chá de mel", visual: "A aveia está totalmente submersa, nenhuma seca por cima" }, { instruction: "Fatie banana por cima, feche e leve à geladeira", measure: "Durante a noite, 6+ horas", visual: "N/A" }, { instruction: "Mexa antes de comer", measure: "N/A", visual: "A mistura fica espessa e cremosa, não rala" }],
    hi: [{ instruction: "एक जार में ओट्स, दूध और शहद मिलाएं", measure: "1/2 कप ओट्स + 1/2 कप दूध + 1 छोटा चम्मच शहद", visual: "ओट्स पूरी तरह डूबे हों, ऊपर कोई सूखा हिस्सा न हो" }, { instruction: "ऊपर केला काटें, बंद करें और फ्रिज में रखें", measure: "रात भर, 6+ घंटे", visual: "लागू नहीं" }, { instruction: "खाने से पहले हिलाएं", measure: "लागू नहीं", visual: "मिश्रण गाढ़ा और मलाईदार है, पतला नहीं" }],
    zh: [{ instruction: "在罐子里混合燕麦片、牛奶和蜂蜜", measure: "1/2杯燕麦 + 1/2杯牛奶 + 1茶匙蜂蜜", visual: "燕麦完全浸没，上面没有干燥的部分" }, { instruction: "上面切香蕉片，密封后冷藏", measure: "隔夜，6小时以上", visual: "不适用" }, { instruction: "食用前搅拌", measure: "不适用", visual: "混合物浓稠顺滑，不是稀汤状" }],
    ar: [{ instruction: "اخلط الشوفان والحليب والعسل في برطمان", measure: "نصف كوب شوفان + نصف كوب حليب + ملعقة صغيرة عسل", visual: "الشوفان مغمور بالكامل، لا شيء جاف فوقه" }, { instruction: "قطّع الموز فوقه، أغلقه وضعه في الثلاجة", measure: "طوال الليل، 6 ساعات أو أكثر", visual: "غير محدد" }, { instruction: "حرّكه قبل الأكل", measure: "غير محدد", visual: "المزيج سميك وكريمي، وليس سائلًا" }],
  },
  "jollof-rice": {
    es: [{ instruction: "Licúa o pica finamente los tomates, la pasta de tomate y la mitad de la cebolla", measure: "1 lata de tomates + 2 cdas de pasta + 1/2 cebolla", visual: "La mezcla es suave y rojo intenso, sin trozos grandes" }, { instruction: "Fríe la cebolla restante en aceite, luego añade la mezcla y cocina hasta reducir", measure: "10–12 min a fuego medio-bajo", visual: "La salsa se oscurece y el aceite se separa visiblemente formando charcos arriba" }, { instruction: "Añade arroz y agua, tapa y cocina a fuego lento sin remover demasiado", measure: "2 tazas de arroz + agua justo para cubrir, 20 min tapado a fuego bajo", visual: "El arroz está tierno y uniformemente rojo — un poco de dorado en el fondo es normal" }, { instruction: "Apaga el fuego y deja reposar antes de esponjar", measure: "5–10 min tapado, luego esponja suavemente con un tenedor", visual: "Los granos se separan fácilmente y no están pastosos ni húmedos" }],
    fr: [{ instruction: "Mixez ou hachez finement les tomates, la pâte de tomate et la moitié de l'oignon", measure: "1 boîte de tomates + 2 c. à s. de pâte + 1/2 oignon", visual: "Le mélange est lisse et rouge foncé, sans gros morceaux" }, { instruction: "Faites frire l'oignon restant dans l'huile, puis ajoutez le mélange et laissez réduire", measure: "10–12 min à feu moyen-doux", visual: "La sauce fonce et l'huile se sépare visiblement en formant des flaques dessus" }, { instruction: "Ajoutez le riz et l'eau, couvrez et laissez mijoter sans trop remuer", measure: "2 tasses de riz + eau juste pour couvrir, 20 min couvert à feu doux", visual: "Le riz est tendre et uniformément rouge — un léger brunissement au fond est normal" }, { instruction: "Éteignez le feu et laissez reposer avant d'égrainer", measure: "5–10 min couvert, puis égrainez doucement à la fourchette", visual: "Les grains se séparent facilement et ne sont ni pâteux ni humides" }],
    pt: [{ instruction: "Bata ou pique bem os tomates, o extrato de tomate e metade da cebola", measure: "1 lata de tomate + 2 colheres de sopa de extrato + 1/2 cebola", visual: "A mistura fica lisa e vermelho intenso, sem pedaços grandes" }, { instruction: "Frite a cebola restante no óleo, depois adicione a mistura e cozinhe até reduzir", measure: "10–12 min em fogo médio-baixo", visual: "O molho escurece e o óleo se separa visivelmente formando poças em cima" }, { instruction: "Adicione o arroz e a água, tampe e cozinhe em fogo baixo sem mexer demais", measure: "2 xícaras de arroz + água só até cobrir, 20 min tampado em fogo baixo", visual: "O arroz fica macio e uniformemente vermelho — um pouco de dourado no fundo é normal" }, { instruction: "Desligue o fogo e deixe descansar antes de soltar os grãos", measure: "5–10 min tampado, depois solte suavemente com um garfo", visual: "Os grãos se separam facilmente e não ficam empapados ou úmidos" }],
    hi: [{ instruction: "टमाटर, टमाटर पेस्ट और आधा प्याज़ ब्लेंड करें या बारीक काटें", measure: "1 कैन टमाटर + 2 बड़े चम्मच पेस्ट + आधा प्याज़", visual: "मिश्रण चिकना और गहरा लाल हो, बड़े टुकड़े न हों" }, { instruction: "बाकी प्याज़ को तेल में भूनें, फिर मिश्रण डालकर पकाएं जब तक गाढ़ा न हो", measure: "मध्यम-धीमी आंच पर 10-12 मिनट", visual: "सॉस गहरा हो जाता है और तेल ऊपर स्पष्ट रूप से अलग होकर जमा हो जाता है" }, { instruction: "चावल और पानी डालें, ढककर बिना ज़्यादा हिलाए धीमी आंच पर पकाएं", measure: "2 कप चावल + बस ढकने लायक पानी, धीमी आंच पर 20 मिनट ढककर", visual: "चावल नरम और समान रूप से लाल हों — तली में थोड़ा भूरापन सामान्य है" }, { instruction: "आंच बंद करें और फुलाने से पहले आराम दें", measure: "5-10 मिनट ढककर, फिर कांटे से धीरे से फुलाएं", visual: "दाने आसानी से अलग हों, गीले या गूदेदार नहीं" }],
    zh: [{ instruction: "将番茄、番茄酱和一半洋葱打碎或切细", measure: "1罐番茄 + 2汤匙番茄酱 + 半个洋葱", visual: "混合物顺滑呈深红色，没有大块" }, { instruction: "将剩余洋葱用油炒香，然后加入混合物煮至收汁", measure: "中小火10-12分钟", visual: "酱汁颜色变深，油明显分离浮在表面" }, { instruction: "加入米饭和水，盖上锅盖小火焖煮，不要过度搅拌", measure: "2杯米 + 刚好没过的水，小火加盖焖20分钟", visual: "米饭软糯且均匀呈红色——锅底略微焦香是正常的" }, { instruction: "关火，静置后再用叉子轻轻拌松", measure: "加盖静置5-10分钟，然后用叉子轻轻拌松", visual: "米粒容易分开，不软烂也不湿" }],
    ar: [{ instruction: "اخلط أو افرم الطماطم ومعجون الطماطم ونصف البصل جيدًا", measure: "علبة طماطم + 2 ملعقة كبيرة معجون + نصف بصلة", visual: "الخليط ناعم وأحمر داكن، بدون قطع كبيرة" }, { instruction: "اقلِ باقي البصل بالزيت، ثم أضف الخليط واتركه ينضج حتى يقل حجمه", measure: "10-12 دقيقة على نار متوسطة منخفضة", visual: "تغمق الصلصة ويفصل الزيت بوضوح ويتجمع فوقها" }, { instruction: "أضف الأرز والماء، غطِّ واتركه ينضج على نار هادئة دون تحريك كثير", measure: "2 كوب أرز + ماء بقدر التغطية فقط، 20 دقيقة مغطى على نار هادئة", visual: "الأرز طري وأحمر بشكل موحد — بعض الاحمرار في القاع أمر طبيعي" }, { instruction: "أطفئ النار ودعه يرتاح قبل تفكيكه", measure: "5-10 دقائق مغطى، ثم فكّكه برفق بشوكة", visual: "تنفصل الحبوب بسهولة وليست طرية أو رطبة" }],
  },
  "black-bean-bowl": {
    es: [{ instruction: "Cocina el arroz según las instrucciones del paquete", measure: "1 taza de arroz + 2 tazas de agua, ~15 min", visual: "El agua está completamente absorbida, el arroz queda esponjoso al removerlo" }, { instruction: "Calienta los frijoles negros y el maíz juntos en una sartén", measure: "5 min a fuego medio", visual: "Los frijoles están calientes y brillantes, no secos ni agrietados" }, { instruction: "Coloca capas de arroz, frijoles y maíz, cubre con salsa", measure: "Al gusto", visual: "N/A" }],
    fr: [{ instruction: "Cuisez le riz selon les instructions du paquet", measure: "1 tasse de riz + 2 tasses d'eau, ~15 min", visual: "L'eau est totalement absorbée, le riz est moelleux une fois égrainé à la fourchette" }, { instruction: "Réchauffez les haricots noirs et le maïs ensemble dans une poêle", measure: "5 min à feu moyen", visual: "Les haricots sont chauds et brillants, ni secs ni craquelés" }, { instruction: "Superposez riz, haricots et maïs, garnissez de salsa", measure: "Selon le goût", visual: "N/A" }],
    pt: [{ instruction: "Cozinhe o arroz conforme as instruções da embalagem", measure: "1 xícara de arroz + 2 xícaras de água, ~15 min", visual: "A água foi totalmente absorvida, o arroz fica soltinho ao mexer com garfo" }, { instruction: "Aqueça o feijão preto e o milho juntos numa frigideira", measure: "5 min em fogo médio", visual: "Os feijões estão quentes e brilhantes, não secos ou rachados" }, { instruction: "Monte camadas de arroz, feijão e milho, cubra com salsa", measure: "A gosto", visual: "N/A" }],
    hi: [{ instruction: "पैकेज के निर्देशों के अनुसार चावल पकाएं", measure: "1 कप चावल + 2 कप पानी, ~15 मिनट", visual: "पानी पूरी तरह सोख लिया गया हो, कांटे से फुलाने पर चावल फूला हुआ हो" }, { instruction: "पैन में ब्लैक बीन्स और मकई को साथ गर्म करें", measure: "मध्यम आंच पर 5 मिनट", visual: "बीन्स गर्म और चमकदार हों, सूखे या फटे नहीं" }, { instruction: "चावल, बीन्स और मकई की परतें बनाएं, ऊपर साल्सा डालें", measure: "स्वादानुसार", visual: "लागू नहीं" }],
    zh: [{ instruction: "按包装说明煮米饭", measure: "1杯米 + 2杯水，约15分钟", visual: "水分完全吸收，用叉子拌松后米饭蓬松" }, { instruction: "在平底锅中一起加热黑豆和玉米", measure: "中火5分钟", visual: "豆子热透且有光泽，不干燥也不开裂" }, { instruction: "依次铺上米饭、豆子和玉米，淋上莎莎酱", measure: "适量", visual: "不适用" }],
    ar: [{ instruction: "اطبخ الأرز حسب تعليمات العبوة", measure: "كوب أرز + كوبان ماء، حوالي 15 دقيقة", visual: "الماء ممتص بالكامل، الأرز طري عند تفكيكه بالشوكة" }, { instruction: "سخّن الفاصولياء السوداء والذرة معًا في مقلاة", measure: "5 دقائق على نار متوسطة", visual: "الفاصولياء ساخنة ولامعة، ليست جافة أو متشققة" }, { instruction: "رتّب طبقات من الأرز والفاصولياء والذرة، غطِّ بالصلصة", measure: "حسب الرغبة", visual: "غير محدد" }],
  },
  "chicken-stir-fry": {
    es: [{ instruction: "Corta el pollo en tiras finas, sazona con sal y pimienta", measure: "1 lb de pechuga de pollo", visual: "Los trozos son uniformes, del ancho de un dedo" }, { instruction: "Sella el pollo en una sartén caliente con aceite", measure: "5–6 min", visual: "El pollo está opaco por dentro, bordes dorados" }, { instruction: "Añade ajo y vegetales, saltea", measure: "3–4 min", visual: "Los vegetales tienen color vivo y aún están crujientes, no blandos" }, { instruction: "Añade salsa de soya y mezcla para cubrir", measure: "1 min", visual: "La salsa se adhiere uniformemente, sin acumularse en el fondo" }],
    fr: [{ instruction: "Coupez le poulet en fines lanières, salez et poivrez", measure: "1 lb de blanc de poulet", visual: "Les morceaux sont uniformes, de la largeur d'un doigt" }, { instruction: "Saisissez le poulet dans une poêle chaude huilée", measure: "5–6 min", visual: "Le poulet est opaque à cœur, les bords dorés" }, { instruction: "Ajoutez l'ail et les légumes, faites sauter", measure: "3–4 min", visual: "Les légumes ont une couleur vive et sont encore croquants, pas mous" }, { instruction: "Ajoutez la sauce soja et mélangez pour enrober", measure: "1 min", visual: "La sauce enrobe uniformément, sans s'accumuler au fond" }],
    pt: [{ instruction: "Corte o frango em tiras finas, tempere com sal e pimenta", measure: "1 lb (450g) de peito de frango", visual: "Os pedaços são uniformes, do tamanho da largura de um dedo" }, { instruction: "Sele o frango numa frigideira quente com óleo", measure: "5–6 min", visual: "O frango está opaco por dentro, bordas douradas" }, { instruction: "Adicione alho e legumes, refogue", measure: "3–4 min", visual: "Os legumes têm cor viva e ainda estão crocantes, não murchos" }, { instruction: "Adicione molho de soja e misture para cobrir", measure: "1 min", visual: "O molho gruda uniformemente, sem acumular no fundo" }],
    hi: [{ instruction: "चिकन को पतली पट्टियों में काटें, नमक और काली मिर्च से सीज़न करें", measure: "1 पाउंड चिकन ब्रेस्ट", visual: "टुकड़े समान हों, उंगली जितने चौड़े" }, { instruction: "गर्म तेल वाले पैन में चिकन सियर करें", measure: "5-6 मिनट", visual: "चिकन अंदर से अपारदर्शी है, किनारे सुनहरे" }, { instruction: "लहसुन और सब्ज़ियां डालें, स्टिर फ्राय करें", measure: "3-4 मिनट", visual: "सब्ज़ियों का रंग चमकीला हो और अभी भी कुरकुरी हों, मुरझाई नहीं" }, { instruction: "सोया सॉस डालें और लपेटने के लिए मिलाएं", measure: "1 मिनट", visual: "सॉस समान रूप से चिपके, तली में जमा न हो" }],
    zh: [{ instruction: "将鸡肉切成细条，用盐和胡椒调味", measure: "1磅（约450克）鸡胸肉", visual: "肉块大小均匀，约手指宽" }, { instruction: "在热油锅中煎鸡肉", measure: "5-6分钟", visual: "鸡肉内部完全变白不透明，边缘金黄" }, { instruction: "加入大蒜和蔬菜，翻炒", measure: "3-4分钟", visual: "蔬菜色泽鲜艳且仍然爽脆，不软塌" }, { instruction: "加入酱油翻拌均匀", measure: "1分钟", visual: "酱汁均匀裹住食材，锅底不会积存" }],
    ar: [{ instruction: "قطّع الدجاج إلى شرائح رفيعة، تبّل بالملح والفلفل", measure: "1 رطل (450غ) صدر دجاج", visual: "القطع متساوية، بعرض الإصبع تقريبًا" }, { instruction: "حمّر الدجاج في مقلاة ساخنة بالزيت", measure: "5-6 دقائق", visual: "الدجاج معتم بالكامل من الداخل، الحواف ذهبية" }, { instruction: "أضف الثوم والخضار، وقلّب سريعًا", measure: "3-4 دقائق", visual: "الخضار زاهية اللون ولا تزال مقرمشة، غير ذابلة" }, { instruction: "أضف صلصة الصويا وقلّب للتغطية", measure: "دقيقة واحدة", visual: "الصلصة تلتصق بشكل متساوٍ، دون تجمّع في القاع" }],
  },
  "creamy-chicken-pasta": {
    es: [{ instruction: "Cocina la pasta en agua hirviendo con sal", measure: "8–9 min", visual: "Tierna pero aún firme al morder" }, { instruction: "Sella el pollo en cubos en una sartén aparte", measure: "6–7 min", visual: "El pollo está opaco con bordes dorados" }, { instruction: "Añade ajo y crema a la sartén del pollo, deja hervir a fuego lento", measure: "3–4 min", visual: "La salsa espesa lo suficiente para cubrir el dorso de una cuchara" }, { instruction: "Mezcla la pasta escurrida con la salsa y parmesano", measure: "1 min", visual: "Cada trozo está brillante y cubierto" }],
    fr: [{ instruction: "Cuisez les pâtes dans l'eau bouillante salée", measure: "8–9 min", visual: "Tendres mais encore fermes sous la dent" }, { instruction: "Saisissez le poulet en dés dans une poêle à part", measure: "6–7 min", visual: "Le poulet est opaque avec des bords dorés" }, { instruction: "Ajoutez l'ail et la crème dans la poêle du poulet, laissez mijoter", measure: "3–4 min", visual: "La sauce épaissit assez pour napper le dos d'une cuillère" }, { instruction: "Mélangez les pâtes égouttées avec la sauce et le parmesan", measure: "1 min", visual: "Chaque morceau est brillant et enrobé" }],
    pt: [{ instruction: "Cozinhe o macarrão em água fervente com sal", measure: "8–9 min", visual: "Macio mas ainda firme ao morder" }, { instruction: "Sele o frango em cubos numa frigideira separada", measure: "6–7 min", visual: "O frango está opaco com bordas douradas" }, { instruction: "Adicione alho e creme de leite na frigideira do frango, deixe apurar", measure: "3–4 min", visual: "O molho engrossa o suficiente para cobrir o dorso de uma colher" }, { instruction: "Misture o macarrão escorrido com o molho e parmesão", measure: "1 min", visual: "Cada pedaço fica brilhante e coberto" }],
    hi: [{ instruction: "नमकीन उबलते पानी में पास्ता पकाएं", measure: "8-9 मिनट", visual: "नरम लेकिन काटने पर अभी भी सख्त" }, { instruction: "अलग पैन में कटे हुए चिकन को सियर करें", measure: "6-7 मिनट", visual: "चिकन अपारदर्शी है, किनारे सुनहरे" }, { instruction: "चिकन वाले पैन में लहसुन और क्रीम डालें, उबलने दें", measure: "3-4 मिनट", visual: "सॉस इतना गाढ़ा हो कि चम्मच के पीछे को ढक सके" }, { instruction: "छाने हुए पास्ता को सॉस और परमेसन के साथ मिलाएं", measure: "1 मिनट", visual: "हर टुकड़ा चमकदार और लिपटा हुआ हो" }],
    zh: [{ instruction: "在加盐的沸水中煮意面", measure: "8-9分钟", visual: "软嫩但咬起来仍有嚼劲" }, { instruction: "在另一个锅中煎鸡肉丁", measure: "6-7分钟", visual: "鸡肉呈不透明状，边缘金黄" }, { instruction: "在鸡肉锅中加入蒜末和奶油，小火焖煮", measure: "3-4分钟", visual: "酱汁变浓稠到能挂在勺背上" }, { instruction: "将沥干的意面与酱汁和帕玛森芝士拌匀", measure: "1分钟", visual: "每一块都光亮均匀" }],
    ar: [{ instruction: "اطبخ المعكرونة في ماء مملح يغلي", measure: "8-9 دقائق", visual: "طرية لكن لا تزال متماسكة عند العض" }, { instruction: "حمّر الدجاج المكعب في مقلاة منفصلة", measure: "6-7 دقائق", visual: "الدجاج معتم بحواف ذهبية" }, { instruction: "أضف الثوم والكريمة إلى مقلاة الدجاج، اتركها تنضج", measure: "3-4 دقائق", visual: "تصبح الصلصة سميكة بما يكفي لتغطية ظهر الملعقة" }, { instruction: "اخلط المعكرونة المصفاة مع الصلصة والبارميزان", measure: "دقيقة واحدة", visual: "كل قطعة لامعة ومغطاة" }],
  },
  "chickpea-curry": {
    es: [{ instruction: "Sofríe cebolla picada en aceite hasta que esté suave", measure: "5 min", visual: "La cebolla se vuelve translúcida, no dorada" }, { instruction: "Añade curry en polvo y cocina brevemente", measure: "30 seg", visual: "Aromático, cubre la cebolla uniformemente" }, { instruction: "Añade tomates y garbanzos, deja hervir a fuego lento", measure: "15 min", visual: "La salsa se ha espesado y reducido ligeramente" }, { instruction: "Sazona al gusto y sirve", measure: "N/A", visual: "La salsa cubre el dorso de una cuchara" }],
    fr: [{ instruction: "Faites revenir l'oignon haché dans l'huile jusqu'à ce qu'il soit tendre", measure: "5 min", visual: "L'oignon devient translucide, pas doré" }, { instruction: "Ajoutez le curry en poudre et faites cuire brièvement", measure: "30 sec", visual: "Parfumé, enrobe l'oignon uniformément" }, { instruction: "Ajoutez les tomates et les pois chiches, laissez mijoter", measure: "15 min", visual: "La sauce a épaissi et légèrement réduit" }, { instruction: "Assaisonnez selon le goût et servez", measure: "N/A", visual: "La sauce nappe le dos d'une cuillère" }],
    pt: [{ instruction: "Refogue a cebola picada no óleo até ficar macia", measure: "5 min", visual: "A cebola fica translúcida, não dourada" }, { instruction: "Adicione o curry em pó e cozinhe brevemente", measure: "30 seg", visual: "Perfumado, cobre a cebola uniformemente" }, { instruction: "Adicione os tomates e o grão-de-bico, deixe apurar", measure: "15 min", visual: "O molho engrossou e reduziu levemente" }, { instruction: "Tempere a gosto e sirva", measure: "N/A", visual: "O molho cobre o dorso de uma colher" }],
    hi: [{ instruction: "प्याज़ को तेल में नरम होने तक भूनें", measure: "5 मिनट", visual: "प्याज़ पारदर्शी हो जाए, सुनहरा नहीं" }, { instruction: "करी पाउडर डालकर थोड़ी देर पकाएं", measure: "30 सेकंड", visual: "खुशबूदार, प्याज़ पर समान रूप से लिपटा हो" }, { instruction: "टमाटर और छोले डालें, उबलने दें", measure: "15 मिनट", visual: "सॉस गाढ़ा हो गया है और थोड़ा कम हुआ है" }, { instruction: "स्वादानुसार मसाला डालें और परोसें", measure: "लागू नहीं", visual: "सॉस चम्मच के पीछे को ढके" }],
    zh: [{ instruction: "用油将洋葱丁炒软", measure: "5分钟", visual: "洋葱变得半透明，不是焦黄色" }, { instruction: "加入咖喱粉稍微煮一下", measure: "30秒", visual: "香气四溢，均匀裹住洋葱" }, { instruction: "加入番茄和鹰嘴豆，煨煮", measure: "15分钟", visual: "酱汁已经变浓稠并略微收汁" }, { instruction: "按口味调味后即可食用", measure: "不适用", visual: "酱汁能挂在勺背上" }],
    ar: [{ instruction: "قلِّب البصل المفروم في الزيت حتى يلين", measure: "5 دقائق", visual: "يصبح البصل شفافًا، وليس ذهبيًا" }, { instruction: "أضف مسحوق الكاري واطبخ لفترة قصيرة", measure: "30 ثانية", visual: "عطر فوّاح، يغطي البصل بالتساوي" }, { instruction: "أضف الطماطم والحمص، اتركها تنضج", measure: "15 دقيقة", visual: "أصبحت الصلصة سميكة وقلّت كميتها قليلًا" }, { instruction: "تبّل حسب الرغبة وقدّمه", measure: "غير محدد", visual: "تغطي الصلصة ظهر الملعقة" }],
  },
  "turkey-taco-bowl": {
    es: [{ instruction: "Dora el pavo molido en una sartén", measure: "6–8 min", visual: "No queda rosado, desmenuzado uniformemente" }, { instruction: "Añade sazonador de tacos y un chorrito de agua", measure: "2 min", visual: "La carne está uniformemente cubierta y brillante" }, { instruction: "Arma el bol con lechuga y pavo", measure: "N/A", visual: "N/A" }, { instruction: "Cubre con salsa", measure: "Al gusto", visual: "N/A" }],
    fr: [{ instruction: "Faites dorer la dinde hachée dans une poêle", measure: "6–8 min", visual: "Plus aucune trace rose, émiettée uniformément" }, { instruction: "Ajoutez l'assaisonnement à tacos et un peu d'eau", measure: "2 min", visual: "La viande est uniformément enrobée et brillante" }, { instruction: "Composez le bol avec laitue et dinde", measure: "N/A", visual: "N/A" }, { instruction: "Garnissez de salsa", measure: "Selon le goût", visual: "N/A" }],
    pt: [{ instruction: "Doure a carne moída de peru numa frigideira", measure: "6–8 min", visual: "Sem nenhum rosa restante, esfarelada uniformemente" }, { instruction: "Adicione o tempero de taco e um pouco de água", measure: "2 min", visual: "A carne está uniformemente coberta e brilhante" }, { instruction: "Monte a tigela com alface e peru", measure: "N/A", visual: "N/A" }, { instruction: "Cubra com salsa", measure: "A gosto", visual: "N/A" }],
    hi: [{ instruction: "पैन में कीमा बनाया हुआ टर्की भूनें", measure: "6-8 मिनट", visual: "कोई गुलाबी हिस्सा न बचे, समान रूप से टूटा हुआ" }, { instruction: "टैको सीज़निंग और थोड़ा पानी डालें", measure: "2 मिनट", visual: "मांस समान रूप से लिपटा और चमकदार हो" }, { instruction: "लेट्यूस और टर्की के साथ बाउल बनाएं", measure: "लागू नहीं", visual: "लागू नहीं" }, { instruction: "साल्सा से ऊपर सजाएं", measure: "स्वादानुसार", visual: "लागू नहीं" }],
    zh: [{ instruction: "在平底锅中炒香火鸡肉末", measure: "6-8分钟", visual: "没有粉色残留，均匀碎散" }, { instruction: "加入塔可调料和一点水", measure: "2分钟", visual: "肉末均匀裹上调料且有光泽" }, { instruction: "用生菜和火鸡肉搭建碗", measure: "不适用", visual: "不适用" }, { instruction: "淋上莎莎酱", measure: "适量", visual: "不适用" }],
    ar: [{ instruction: "حمّر لحم الديك الرومي المفروم في مقلاة", measure: "6-8 دقائق", visual: "بلا أي لون وردي متبقٍ، مفتت بالتساوي" }, { instruction: "أضف توابل التاكو ورشة ماء", measure: "دقيقتان", visual: "اللحم مغطى بالتساوي ولامع" }, { instruction: "رتّب الصحن بالخس ولحم الديك الرومي", measure: "غير محدد", visual: "غير محدد" }, { instruction: "أضف الصلصة فوقها", measure: "حسب الرغبة", visual: "غير محدد" }],
  },
  "greek-yogurt-parfait": {
    es: [{ instruction: "Coloca una capa de yogur en un vaso o tazón", measure: "1/2 taza", visual: "Queda en una capa uniforme" }, { instruction: "Añade una capa de bayas y granola", measure: "Al gusto", visual: "Las capas permanecen visualmente distintas" }, { instruction: "Repite las capas y rocía miel encima", measure: "N/A", visual: "N/A" }],
    fr: [{ instruction: "Disposez une couche de yaourt dans un verre ou un bol", measure: "1/2 tasse", visual: "Reste en couche uniforme" }, { instruction: "Ajoutez une couche de fruits rouges et de granola", measure: "Selon le goût", visual: "Les couches restent visuellement distinctes" }, { instruction: "Répétez les couches et versez du miel dessus", measure: "N/A", visual: "N/A" }],
    pt: [{ instruction: "Faça uma camada de iogurte num copo ou tigela", measure: "1/2 xícara", visual: "Fica numa camada uniforme" }, { instruction: "Adicione uma camada de frutas vermelhas e granola", measure: "A gosto", visual: "As camadas ficam visualmente distintas" }, { instruction: "Repita as camadas e regue com mel por cima", measure: "N/A", visual: "N/A" }],
    hi: [{ instruction: "गिलास या कटोरे में दही की परत बनाएं", measure: "1/2 कप", visual: "एक समान परत में रहे" }, { instruction: "बेरीज़ और ग्रेनोला की परत डालें", measure: "स्वादानुसार", visual: "परतें अलग-अलग दिखाई दें" }, { instruction: "परतें दोहराएं और ऊपर शहद डालें", measure: "लागू नहीं", visual: "लागू नहीं" }],
    zh: [{ instruction: "在玻璃杯或碗中铺一层酸奶", measure: "1/2杯", visual: "呈均匀的一层" }, { instruction: "加一层浆果和格兰诺拉燕麦", measure: "适量", visual: "各层保持清晰分明" }, { instruction: "重复叠层，最后淋上蜂蜜", measure: "不适用", visual: "不适用" }],
    ar: [{ instruction: "رتّب طبقة من الزبادي في كوب أو وعاء", measure: "نصف كوب", visual: "تبقى في طبقة متساوية" }, { instruction: "أضف طبقة من التوت والغرانولا", measure: "حسب الرغبة", visual: "تبقى الطبقات مميزة بصريًا" }, { instruction: "كرر الطبقات ورشّ العسل فوقها", measure: "غير محدد", visual: "غير محدد" }],
  },
  "avocado-toast": {
    es: [{ instruction: "Tuesta el pan hasta que esté crujiente", measure: "2–3 min", visual: "Dorado intenso, firme al tocar" }, { instruction: "Machaca el aguacate con sal y pimienta", measure: "1/2 aguacate", visual: "La mezcla es grumosa pero untable" }, { instruction: "Unta sobre la tostada", measure: "N/A", visual: "El aguacate llega a cada borde" }],
    fr: [{ instruction: "Faites griller le pain jusqu'à ce qu'il soit croustillant", measure: "2–3 min", visual: "Bien doré, ferme au toucher" }, { instruction: "Écrasez l'avocat avec sel et poivre", measure: "1/2 avocat", visual: "Le mélange est grumeleux mais tartinable" }, { instruction: "Étalez sur le pain grillé", measure: "N/A", visual: "L'avocat atteint chaque bord" }],
    pt: [{ instruction: "Toste o pão até ficar crocante", measure: "2–3 min", visual: "Bem dourado, firme ao toque" }, { instruction: "Amasse o abacate com sal e pimenta", measure: "1/2 abacate", visual: "A mistura fica grossa mas fácil de espalhar" }, { instruction: "Espalhe sobre a torrada", measure: "N/A", visual: "O abacate chega a cada borda" }],
    hi: [{ instruction: "ब्रेड को कुरकुरा होने तक टोस्ट करें", measure: "2-3 मिनट", visual: "गहरा सुनहरा, छूने पर सख्त" }, { instruction: "एवोकाडो को नमक और काली मिर्च के साथ मैश करें", measure: "1/2 एवोकाडो", visual: "मिश्रण गुठलीदार लेकिन फैलाने लायक हो" }, { instruction: "टोस्ट पर फैलाएं", measure: "लागू नहीं", visual: "एवोकाडो हर किनारे तक पहुंचे" }],
    zh: [{ instruction: "将面包烤至酥脆", measure: "2-3分钟", visual: "深金黄色，触摸时坚实" }, { instruction: "将牛油果与盐和胡椒一起捣碎", measure: "半个牛油果", visual: "混合物块状但可涂抹" }, { instruction: "涂抹在吐司上", measure: "不适用", visual: "牛油果覆盖到每个边缘" }],
    ar: [{ instruction: "حمّص الخبز حتى يصبح مقرمشًا", measure: "2-3 دقائق", visual: "ذهبي داكن، متماسك عند اللمس" }, { instruction: "اهرس الأفوكادو مع الملح والفلفل", measure: "نصف حبة أفوكادو", visual: "الخليط متكتل لكن قابل للدهن" }, { instruction: "افرده على التوست", measure: "غير محدد", visual: "يصل الأفوكادو إلى كل حافة" }],
  },
  "lentil-soup": {
    es: [{ instruction: "Sofríe cebolla y zanahoria picadas", measure: "5 min", visual: "Los vegetales se ablandan y toman un ligero color dorado" }, { instruction: "Añade lentejas y caldo, lleva a hervor", measure: "2 min", visual: "El líquido está en un hervor fuerte y constante" }, { instruction: "Reduce el fuego y cocina a fuego lento hasta que las lentejas estén tiernas", measure: "20–25 min", visual: "Las lentejas se aplastan fácilmente contra la olla con una cuchara" }],
    fr: [{ instruction: "Faites revenir l'oignon et la carotte hachés", measure: "5 min", visual: "Les légumes s'attendrissent et prennent une légère couleur dorée" }, { instruction: "Ajoutez les lentilles et le bouillon, portez à ébullition", measure: "2 min", visual: "Le liquide est à pleine ébullition constante" }, { instruction: "Réduisez le feu et laissez mijoter jusqu'à ce que les lentilles soient tendres", measure: "20–25 min", visual: "Les lentilles s'écrasent facilement contre la casserole à la cuillère" }],
    pt: [{ instruction: "Refogue cebola e cenoura picadas", measure: "5 min", visual: "Os vegetais amolecem e ficam levemente dourados" }, { instruction: "Adicione as lentilhas e o caldo, leve a ferver", measure: "2 min", visual: "O líquido está em fervura forte e constante" }, { instruction: "Reduza o fogo e deixe cozinhar até as lentilhas ficarem macias", measure: "20–25 min", visual: "As lentilhas amassam facilmente contra a panela com uma colher" }],
    hi: [{ instruction: "कटा हुआ प्याज़ और गाजर भूनें", measure: "5 मिनट", visual: "सब्ज़ियां नरम हो जाएं और हल्की सुनहरी हो जाएं" }, { instruction: "दाल और शोरबा डालें, उबाल आने दें", measure: "2 मिनट", visual: "तरल तेज़ और लगातार उबल रहा हो" }, { instruction: "आंच धीमी करें और दाल नरम होने तक पकाएं", measure: "20-25 मिनट", visual: "दाल चम्मच से बर्तन में आसानी से मैश हो जाए" }],
    zh: [{ instruction: "炒香切好的洋葱和胡萝卜", measure: "5分钟", visual: "蔬菜变软并呈现淡淡的金黄色" }, { instruction: "加入扁豆和高汤，煮沸", measure: "2分钟", visual: "液体保持持续大滚" }, { instruction: "转小火煮至扁豆变软", measure: "20-25分钟", visual: "用勺子在锅中很容易把扁豆压碎" }],
    ar: [{ instruction: "قلِّب البصل والجزر المفرومين", measure: "5 دقائق", visual: "تلين الخضار وتكتسب لونًا ذهبيًا خفيفًا" }, { instruction: "أضف العدس والمرق، واتركه يغلي", measure: "دقيقتان", visual: "السائل في غليان قوي ومستمر" }, { instruction: "خفّف النار واتركه ينضج حتى يلين العدس", measure: "20-25 دقيقة", visual: "يُهرس العدس بسهولة داخل القدر بالملعقة" }],
  },
  "veggie-fried-rice": {
    es: [{ instruction: "Revuelve el huevo en una sartén caliente con aceite, reserva", measure: "2 min", visual: "El huevo está apenas cuajado, sin partes líquidas" }, { instruction: "Saltea los vegetales", measure: "3–4 min", visual: "Los vegetales están brillantes y ligeramente suaves" }, { instruction: "Añade arroz y salsa de soya, deshaciendo los grumos", measure: "4–5 min", visual: "Los granos de arroz se separan y toman un color dorado claro" }, { instruction: "Incorpora el huevo revuelto", measure: "1 min", visual: "Los trozos de huevo están distribuidos uniformemente" }],
    fr: [{ instruction: "Brouillez l'œuf dans une poêle chaude huilée, réservez", measure: "2 min", visual: "L'œuf est juste pris, sans partie liquide" }, { instruction: "Faites sauter les légumes", measure: "3–4 min", visual: "Les légumes sont vifs et légèrement ramollis" }, { instruction: "Ajoutez le riz et la sauce soja, en défaisant les grumeaux", measure: "4–5 min", visual: "Les grains de riz se séparent et deviennent légèrement dorés" }, { instruction: "Incorporez l'œuf brouillé", measure: "1 min", visual: "Les morceaux d'œuf sont répartis uniformément" }],
    pt: [{ instruction: "Mexa o ovo numa frigideira quente com óleo, reserve", measure: "2 min", visual: "O ovo está apenas firme, sem partes líquidas" }, { instruction: "Refogue os legumes", measure: "3–4 min", visual: "Os legumes estão vibrantes e levemente amolecidos" }, { instruction: "Adicione o arroz e o molho de soja, desfazendo os grumos", measure: "4–5 min", visual: "Os grãos de arroz se separam e ficam levemente dourados" }, { instruction: "Incorpore o ovo mexido", measure: "1 min", visual: "Os pedaços de ovo ficam distribuídos uniformemente" }],
    hi: [{ instruction: "गर्म तेल वाले पैन में अंडा स्क्रैम्बल करें, अलग रखें", measure: "2 मिनट", visual: "अंडा बस सेट हो, कोई तरल हिस्सा न हो" }, { instruction: "सब्ज़ियों को स्टिर फ्राय करें", measure: "3-4 मिनट", visual: "सब्ज़ियां चमकदार और थोड़ी नरम हों" }, { instruction: "चावल और सोया सॉस डालें, गुठलियां तोड़ते हुए", measure: "4-5 मिनट", visual: "चावल के दाने अलग हों और हल्के सुनहरे हो जाएं" }, { instruction: "स्क्रैम्बल्ड अंडा मिलाएं", measure: "1 मिनट", visual: "अंडे के टुकड़े समान रूप से फैले हों" }],
    zh: [{ instruction: "在热油锅中炒散鸡蛋，盛出备用", measure: "2分钟", visual: "鸡蛋刚好凝固，没有流动的部分" }, { instruction: "翻炒蔬菜", measure: "3-4分钟", visual: "蔬菜色泽鲜亮，略微变软" }, { instruction: "加入米饭和酱油，把结块打散", measure: "4-5分钟", visual: "米粒分开并呈浅金黄色" }, { instruction: "拌入炒蛋", measure: "1分钟", visual: "蛋碎均匀分布" }],
    ar: [{ instruction: "اخفق البيض في مقلاة ساخنة بالزيت، ضعه جانبًا", measure: "دقيقتان", visual: "البيض متماسك للتو، بدون أجزاء سائلة" }, { instruction: "قلِّب الخضار سريعًا", measure: "3-4 دقائق", visual: "الخضار زاهية ولينة قليلًا" }, { instruction: "أضف الأرز وصلصة الصويا، مع تفكيك التكتلات", measure: "4-5 دقائق", visual: "تنفصل حبات الأرز وتصبح ذهبية فاتحة" }, { instruction: "أضف البيض المخفوق", measure: "دقيقة واحدة", visual: "قطع البيض موزعة بالتساوي" }],
  },
  "greek-salad": {
    es: [{ instruction: "Corta pepino, tomate y cebolla morada en trozos pequeños", measure: "N/A", visual: "Los trozos son de tamaño relativamente uniforme" }, { instruction: "Mezcla con aceitunas y queso feta desmenuzado, rocía con aceite de oliva", measure: "N/A", visual: "El feta está esparcido uniformemente, no en grumos" }],
    fr: [{ instruction: "Coupez concombre, tomate et oignon rouge en petits morceaux", measure: "N/A", visual: "Les morceaux sont de taille relativement uniforme" }, { instruction: "Mélangez avec olives et feta émiettée, arrosez d'huile d'olive", measure: "N/A", visual: "La feta est répartie uniformément, pas en amas" }],
    pt: [{ instruction: "Pique pepino, tomate e cebola roxa em pedaços pequenos", measure: "N/A", visual: "Os pedaços são de tamanho relativamente uniforme" }, { instruction: "Misture com azeitonas e feta esfarelada, regue com azeite", measure: "N/A", visual: "O feta está distribuído uniformemente, sem grumos" }],
    hi: [{ instruction: "खीरा, टमाटर और लाल प्याज़ को छोटे टुकड़ों में काटें", measure: "लागू नहीं", visual: "टुकड़े लगभग समान आकार के हों" }, { instruction: "जैतून और चूरा किया फेटा चीज़ मिलाएं, ऊपर से जैतून का तेल डालें", measure: "लागू नहीं", visual: "फेटा समान रूप से फैला हो, गुठलियों में न हो" }],
    zh: [{ instruction: "将黄瓜、番茄和红洋葱切成小块", measure: "不适用", visual: "块状大小大致均匀" }, { instruction: "与橄榄和碎菲达奶酪拌匀，淋上橄榄油", measure: "不适用", visual: "菲达奶酪均匀分布，没有结块" }],
    ar: [{ instruction: "قطّع الخيار والطماطم والبصل الأحمر إلى قطع صغيرة", measure: "غير محدد", visual: "القطع متساوية الحجم تقريبًا" }, { instruction: "اخلط مع الزيتون وجبنة الفيتا المفتتة، رشّ بزيت الزيتون", measure: "غير محدد", visual: "الفيتا موزعة بالتساوي، غير متكتلة" }],
  },
  "hummus-pita": {
    es: [{ instruction: "Calienta ligeramente el pan pita si lo deseas", measure: "1 min", visual: "El pan pita está suave y flexible, no rígido" }, { instruction: "Unta hummus generosamente y cubre con pepino en rodajas", measure: "N/A", visual: "El hummus cubre de borde a borde" }],
    fr: [{ instruction: "Réchauffez légèrement le pain pita si vous le souhaitez", measure: "1 min", visual: "Le pita est souple et flexible, pas rigide" }, { instruction: "Tartinez généreusement de houmous et garnissez de concombre en tranches", measure: "N/A", visual: "Le houmous couvre d'un bord à l'autre" }],
    pt: [{ instruction: "Aqueça levemente o pão pita se desejar", measure: "1 min", visual: "O pita está macio e flexível, não rígido" }, { instruction: "Espalhe hummus generosamente e cubra com pepino fatiado", measure: "N/A", visual: "O hummus cobre de ponta a ponta" }],
    hi: [{ instruction: "अगर चाहें तो पीटा को हल्का गर्म करें", measure: "1 मिनट", visual: "पीटा नरम और लचीला हो, सख्त नहीं" }, { instruction: "हुमस को उदारता से फैलाएं और कटे हुए खीरे से सजाएं", measure: "लागू नहीं", visual: "हुमस किनारे से किनारे तक फैला हो" }],
    zh: [{ instruction: "如果喜欢可以稍微加热皮塔饼", measure: "1分钟", visual: "皮塔饼柔软有弹性，不僵硬" }, { instruction: "大方地涂上鹰嘴豆泥，铺上黄瓜片", measure: "不适用", visual: "鹰嘴豆泥覆盖到每个边缘" }],
    ar: [{ instruction: "سخّن خبز البيتا قليلًا إن أحببت", measure: "دقيقة واحدة", visual: "البيتا طري ومرن، غير متيبس" }, { instruction: "افرد الحمص بسخاء وأضف شرائح الخيار فوقه", measure: "غير محدد", visual: "يغطي الحمص من حافة لحافة" }],
  },
  "shakshuka": {
    es: [{ instruction: "Sofríe cebolla y pimiento hasta que estén suaves", measure: "5 min", visual: "Los vegetales están suaves y translúcidos" }, { instruction: "Añade tomates y cocina a fuego lento hasta formar una salsa espesa", measure: "8–10 min", visual: "La salsa se ha espesado, una cuchara deja un rastro" }, { instruction: "Rompe los huevos en la salsa y tapa hasta que cuajen", measure: "5–6 min", visual: "Las claras están completamente cuajadas, las yemas aún blandas" }],
    fr: [{ instruction: "Faites revenir l'oignon et le poivron jusqu'à tendreté", measure: "5 min", visual: "Les légumes sont tendres et translucides" }, { instruction: "Ajoutez les tomates et laissez mijoter jusqu'à obtenir une sauce épaisse", measure: "8–10 min", visual: "La sauce a épaissi, une cuillère y laisse une trace" }, { instruction: "Cassez les œufs dans la sauce et couvrez jusqu'à ce qu'ils prennent", measure: "5–6 min", visual: "Les blancs sont bien pris, les jaunes encore mous" }],
    pt: [{ instruction: "Refogue cebola e pimentão até amolecerem", measure: "5 min", visual: "Os vegetais estão macios e translúcidos" }, { instruction: "Adicione os tomates e cozinhe até formar um molho grosso", measure: "8–10 min", visual: "O molho engrossou, uma colher deixa um rastro" }, { instruction: "Quebre os ovos no molho e tampe até firmarem", measure: "5–6 min", visual: "As claras estão totalmente firmes, as gemas ainda moles" }],
    hi: [{ instruction: "प्याज़ और शिमला मिर्च को नरम होने तक भूनें", measure: "5 मिनट", visual: "सब्ज़ियां नरम और पारभासी हों" }, { instruction: "टमाटर डालें और गाढ़ा सॉस बनने तक पकाएं", measure: "8-10 मिनट", visual: "सॉस गाढ़ा हो गया हो, चम्मच से निशान बने" }, { instruction: "अंडे सॉस में तोड़ें और सेट होने तक ढकें", measure: "5-6 मिनट", visual: "सफेद भाग पूरी तरह सेट हो, जर्दी अभी भी नरम" }],
    zh: [{ instruction: "将洋葱和甜椒炒软", measure: "5分钟", visual: "蔬菜变软且半透明" }, { instruction: "加入番茄，煨煮成浓稠酱汁", measure: "8-10分钟", visual: "酱汁已变浓稠，勺子划过会留下痕迹" }, { instruction: "将鸡蛋打入酱汁中，加盖焖至凝固", measure: "5-6分钟", visual: "蛋白完全凝固，蛋黄仍然柔软" }],
    ar: [{ instruction: "قلِّب البصل والفلفل الحلو حتى يلينا", measure: "5 دقائق", visual: "الخضار طرية وشبه شفافة" }, { instruction: "أضف الطماطم واتركها تنضج حتى تصبح صلصة سميكة", measure: "8-10 دقائق", visual: "أصبحت الصلصة سميكة، تترك الملعقة أثرًا فيها" }, { instruction: "اكسر البيض في الصلصة وغطِّ حتى يتماسك", measure: "5-6 دقائق", visual: "البياض متماسك تمامًا، الصفار لا يزال طريًا" }],
  },
  "jerk-chicken": {
    es: [{ instruction: "Frota los muslos de pollo con sazonador jerk y jugo de lima", measure: "10 min de marinado si el tiempo lo permite", visual: "El sazonador cubre cada superficie uniformemente" }, { instruction: "Sella en una sartén caliente hasta que esté cocido, volteando una vez", measure: "12–14 min en total", visual: "Los jugos salen claros, sin rosado en el centro" }],
    fr: [{ instruction: "Frottez les cuisses de poulet avec l'assaisonnement jerk et le jus de citron vert", measure: "10 min de marinade si le temps le permet", visual: "L'assaisonnement enrobe chaque surface uniformément" }, { instruction: "Saisissez dans une poêle chaude jusqu'à cuisson complète, en retournant une fois", measure: "12–14 min au total", visual: "Le jus est clair, aucune trace rose au centre" }],
    pt: [{ instruction: "Esfregue as coxas de frango com tempero jerk e suco de limão", measure: "10 min de marinada se der tempo", visual: "O tempero cobre cada superfície uniformemente" }, { instruction: "Sele numa frigideira quente até cozinhar por completo, virando uma vez", measure: "12–14 min no total", visual: "Os sucos saem claros, sem rosado no centro" }],
    hi: [{ instruction: "चिकन थाइज़ को जर्क सीज़निंग और नींबू के रस से रगड़ें", measure: "समय हो तो 10 मिनट मैरिनेट करें", visual: "सीज़निंग हर सतह पर समान रूप से लिपटी हो" }, { instruction: "गर्म पैन में तब तक सियर करें जब तक पूरी तरह पक न जाए, एक बार पलटें", measure: "कुल 12-14 मिनट", visual: "रस साफ़ निकले, बीच में कोई गुलाबीपन न हो" }],
    zh: [{ instruction: "用牙买加香辣调料和青柠汁揉搓鸡腿肉", measure: "如有时间可腌制10分钟", visual: "调料均匀裹住每一处表面" }, { instruction: "在热锅中煎至完全熟透，翻面一次", measure: "共12-14分钟", visual: "肉汁清澈，中心没有粉色" }],
    ar: [{ instruction: "افرك أفخاذ الدجاج بتوابل الجيرك وعصير الليمون", measure: "تتبيل 10 دقائق إن سمح الوقت", visual: "التتبيل يغطي كل سطح بالتساوي" }, { instruction: "حمّر في مقلاة ساخنة حتى ينضج تمامًا، مع القلب مرة واحدة", measure: "12-14 دقيقة إجمالًا", visual: "العصارة صافية، بلا لون وردي في المنتصف" }],
  },
  "rice-and-peas": {
    es: [{ instruction: "Sofríe cebolla en aceite hasta que esté suave", measure: "3 min", visual: "La cebolla está translúcida" }, { instruction: "Añade arroz, frijoles y leche de coco, lleva a hervor y luego cocina a fuego lento tapado", measure: "18–20 min", visual: "El arroz está tierno y el líquido totalmente absorbido" }],
    fr: [{ instruction: "Faites revenir l'oignon dans l'huile jusqu'à tendreté", measure: "3 min", visual: "L'oignon est translucide" }, { instruction: "Ajoutez riz, haricots et lait de coco, portez à ébullition puis laissez mijoter couvert", measure: "18–20 min", visual: "Le riz est tendre et le liquide totalement absorbé" }],
    pt: [{ instruction: "Refogue a cebola no óleo até ficar macia", measure: "3 min", visual: "A cebola está translúcida" }, { instruction: "Adicione arroz, feijão e leite de coco, leve a ferver e depois cozinhe em fogo baixo tampado", measure: "18–20 min", visual: "O arroz está macio e o líquido totalmente absorvido" }],
    hi: [{ instruction: "प्याज़ को तेल में नरम होने तक भूनें", measure: "3 मिनट", visual: "प्याज़ पारदर्शी हो गया है" }, { instruction: "चावल, बीन्स और नारियल का दूध डालें, उबाल लाएं फिर ढककर धीमी आंच पर पकाएं", measure: "18-20 मिनट", visual: "चावल नरम हो और तरल पूरी तरह सोख लिया गया हो" }],
    zh: [{ instruction: "用油将洋葱炒软", measure: "3分钟", visual: "洋葱变得半透明" }, { instruction: "加入米饭、豆子和椰奶，煮沸后加盖转小火焖煮", measure: "18-20分钟", visual: "米饭软糯且水分完全吸收" }],
    ar: [{ instruction: "قلِّب البصل بالزيت حتى يلين", measure: "3 دقائق", visual: "البصل شفاف" }, { instruction: "أضف الأرز والفاصولياء وحليب جوز الهند، اغلِ ثم اتركه ينضج مغطى على نار هادئة", measure: "18-20 دقيقة", visual: "الأرز طري والسائل ممتص بالكامل" }],
  },
  "pad-thai": {
    es: [{ instruction: "Remoja los fideos de arroz en agua tibia (no hirviendo) hasta que estén flexibles", measure: "30–40 min", visual: "Los fideos se doblan fácilmente y conservan un poco de firmeza, no los dejes blandos" }, { instruction: "Revuelve los huevos en una sartén caliente, empuja hacia un lado", measure: "2 min", visual: "Los huevos apenas están cuajados" }, { instruction: "Añade fideos y salsa, mezcla con brotes y maní", measure: "4–5 min", visual: "Los fideos están brillantes y uniformemente cubiertos" }],
    fr: [{ instruction: "Faites tremper les nouilles de riz dans l'eau tiède (pas bouillante) jusqu'à souplesse", measure: "30–40 min", visual: "Les nouilles plient facilement en gardant un peu de tenue, ne les laissez pas ramollir" }, { instruction: "Brouillez les œufs dans une poêle chaude, poussez sur le côté", measure: "2 min", visual: "Les œufs sont juste pris" }, { instruction: "Ajoutez nouilles et sauce, mélangez avec pousses et cacahuètes", measure: "4–5 min", visual: "Les nouilles sont brillantes et bien enrobées" }],
    pt: [{ instruction: "Deixe o macarrão de arroz de molho em água morna (não fervente) até ficar flexível", measure: "30–40 min", visual: "O macarrão dobra facilmente mas ainda mantém firmeza, não deixe ficar mole" }, { instruction: "Mexa os ovos numa frigideira quente, empurre para o lado", measure: "2 min", visual: "Os ovos estão apenas firmes" }, { instruction: "Adicione o macarrão e o molho, misture com broto de feijão e amendoim", measure: "4–5 min", visual: "O macarrão está brilhante e uniformemente coberto" }],
    hi: [{ instruction: "चावल के नूडल्स को गुनगुने (उबलते नहीं) पानी में लचीला होने तक भिगोएं", measure: "30-40 मिनट", visual: "नूडल्स आसानी से मुड़ें लेकिन थोड़े सख्त रहें, उन्हें गूदेदार न होने दें" }, { instruction: "गर्म पैन में अंडे स्क्रैम्बल करें, एक तरफ कर दें", measure: "2 मिनट", visual: "अंडे बस सेट हुए हों" }, { instruction: "नूडल्स और सॉस डालें, स्प्राउट्स और मूंगफली के साथ मिलाएं", measure: "4-5 मिनट", visual: "नूडल्स चमकदार और समान रूप से लिपटे हों" }],
    zh: [{ instruction: "将米粉在温水（非沸水）中浸泡至柔软", measure: "30-40分钟", visual: "面条容易弯曲但仍带一点韧性，不要泡得太软烂" }, { instruction: "在热锅中炒散鸡蛋，推到一边", measure: "2分钟", visual: "鸡蛋刚好凝固" }, { instruction: "加入米粉和酱汁，与豆芽和花生拌匀", measure: "4-5分钟", visual: "米粉光亮且均匀裹汁" }],
    ar: [{ instruction: "انقع نودلز الأرز في ماء دافئ (غير مغلي) حتى يصبح مرنًا", measure: "30-40 دقيقة", visual: "تنثني النودلز بسهولة مع بقاء قوام خفيف، لا تتركها طرية جدًا" }, { instruction: "اخفق البيض في مقلاة ساخنة، ادفعه جانبًا", measure: "دقيقتان", visual: "البيض متماسك للتو" }, { instruction: "أضف النودلز والصلصة، قلّب مع البراعم والفول السوداني", measure: "4-5 دقائق", visual: "النودلز لامعة ومغطاة بالتساوي" }],
  },
  "thai-basil-chicken": {
    es: [{ instruction: "Sofríe ajo hasta que esté fragante", measure: "30 seg", visual: "Dorado pero no quemado" }, { instruction: "Añade pollo molido y cocina bien", measure: "6–7 min", visual: "No queda rosado, bien dorado" }, { instruction: "Mezcla salsa de soya y albahaca fuera del fuego", measure: "1 min", visual: "La albahaca apenas se marchita, aún verde brillante" }],
    fr: [{ instruction: "Faites revenir l'ail jusqu'à ce qu'il soit parfumé", measure: "30 sec", visual: "Doré mais pas brûlé" }, { instruction: "Ajoutez le poulet haché et cuisez complètement", measure: "6–7 min", visual: "Plus aucune trace rose, bien doré" }, { instruction: "Incorporez sauce soja et basilic hors du feu", measure: "1 min", visual: "Le basilic vient juste de flétrir, encore vert vif" }],
    pt: [{ instruction: "Refogue o alho até ficar perfumado", measure: "30 seg", visual: "Dourado mas não queimado" }, { instruction: "Adicione o frango moído e cozinhe bem", measure: "6–7 min", visual: "Sem rosa restante, bem dourado" }, { instruction: "Misture molho de soja e manjericão fora do fogo", measure: "1 min", visual: "O manjericão apenas murcha, ainda verde vivo" }],
    hi: [{ instruction: "लहसुन को खुशबूदार होने तक भूनें", measure: "30 सेकंड", visual: "सुनहरा लेकिन जला नहीं" }, { instruction: "कीमा बनाया हुआ चिकन डालें और पूरी तरह पकाएं", measure: "6-7 मिनट", visual: "कोई गुलाबीपन न बचे, अच्छी तरह भुना हो" }, { instruction: "आंच से हटाकर सोया सॉस और तुलसी मिलाएं", measure: "1 मिनट", visual: "तुलसी बस मुरझाई हो, अभी भी चमकीली हरी" }],
    zh: [{ instruction: "将蒜末炒香", measure: "30秒", visual: "呈金黄色但不要炒焦" }, { instruction: "加入鸡肉末炒熟", measure: "6-7分钟", visual: "没有粉色残留，炒至焦香" }, { instruction: "离火后拌入酱油和罗勒叶", measure: "1分钟", visual: "罗勒叶刚好变软，仍呈鲜绿色" }],
    ar: [{ instruction: "قلِّب الثوم حتى تفوح رائحته", measure: "30 ثانية", visual: "ذهبي لكن غير محروق" }, { instruction: "أضف الدجاج المفروم واطبخه جيدًا", measure: "6-7 دقائق", visual: "بلا لون وردي متبقٍ، محمر جيدًا" }, { instruction: "أضف صلصة الصويا والريحان بعيدًا عن النار", measure: "دقيقة واحدة", visual: "الريحان ذبل للتو، لا يزال أخضر زاهيًا" }],
  },
  "kung-pao-chicken": {
    es: [{ instruction: "Sella el pollo en cubos hasta dorar", measure: "5–6 min", visual: "Bordes dorados, cocido por dentro" }, { instruction: "Añade pimiento y maní, saltea", measure: "3 min", visual: "El pimiento está brillante y ligeramente suave" }, { instruction: "Mezcla con la salsa hasta cubrir", measure: "1–2 min", visual: "La salsa se adhiere uniformemente y brillante" }],
    fr: [{ instruction: "Saisissez le poulet en dés jusqu'à dorure", measure: "5–6 min", visual: "Bords dorés, cuit à cœur" }, { instruction: "Ajoutez poivron et cacahuètes, faites sauter", measure: "3 min", visual: "Le poivron est vif et légèrement ramolli" }, { instruction: "Mélangez avec la sauce jusqu'à enrobage", measure: "1–2 min", visual: "La sauce enrobe uniformément et brille" }],
    pt: [{ instruction: "Sele o frango em cubos até dourar", measure: "5–6 min", visual: "Bordas douradas, cozido por dentro" }, { instruction: "Adicione pimentão e amendoim, refogue", measure: "3 min", visual: "O pimentão está vibrante e levemente amolecido" }, { instruction: "Misture com o molho até cobrir", measure: "1–2 min", visual: "O molho gruda uniformemente e fica brilhante" }],
    hi: [{ instruction: "कटे हुए चिकन को सुनहरा होने तक सियर करें", measure: "5-6 मिनट", visual: "किनारे सुनहरे, अंदर तक पका हो" }, { instruction: "शिमला मिर्च और मूंगफली डालें, स्टिर फ्राय करें", measure: "3 मिनट", visual: "मिर्च चमकदार और थोड़ी नरम हो" }, { instruction: "सॉस के साथ मिलाकर लपेटें", measure: "1-2 मिनट", visual: "सॉस समान रूप से चिपके और चमकदार हो" }],
    zh: [{ instruction: "将鸡肉丁煎至金黄", measure: "5-6分钟", visual: "边缘金黄，内部熟透" }, { instruction: "加入甜椒和花生翻炒", measure: "3分钟", visual: "甜椒色泽鲜亮且略微变软" }, { instruction: "拌入酱汁至均匀裹上", measure: "1-2分钟", visual: "酱汁均匀光亮地裹住食材" }],
    ar: [{ instruction: "حمّر الدجاج المكعب حتى يصبح ذهبيًا", measure: "5-6 دقائق", visual: "حواف ذهبية، ناضج من الداخل" }, { instruction: "أضف الفلفل الحلو والفول السوداني، وقلّب سريعًا", measure: "3 دقائق", visual: "الفلفل زاهٍ ولين قليلًا" }, { instruction: "قلّب مع الصلصة حتى يتغطى", measure: "1-2 دقيقة", visual: "تلتصق الصلصة بالتساوي وتصبح لامعة" }],
  },
  "egg-drop-soup": {
    es: [{ instruction: "Lleva el caldo a un hervor suave", measure: "3–4 min", visual: "Burbujas pequeñas y constantes, no un hervor fuerte" }, { instruction: "Vierte huevo batido lentamente mientras revuelves", measure: "1 min", visual: "El huevo forma cintas finas, no grumos" }],
    fr: [{ instruction: "Portez le bouillon à un léger frémissement", measure: "3–4 min", visual: "Petites bulles constantes, pas une ébullition forte" }, { instruction: "Versez lentement l'œuf battu en remuant", measure: "1 min", visual: "L'œuf forme de fins rubans, pas de grumeaux" }],
    pt: [{ instruction: "Leve o caldo a uma fervura suave", measure: "3–4 min", visual: "Bolhinhas pequenas e constantes, não uma fervura forte" }, { instruction: "Despeje o ovo batido devagar enquanto mexe", measure: "1 min", visual: "O ovo forma fitas finas, não grumos" }],
    hi: [{ instruction: "शोरबा को हल्का उबालें", measure: "3-4 मिनट", visual: "छोटे लगातार बुलबुले, तेज़ उबाल नहीं" }, { instruction: "हिलाते हुए फेंटा हुआ अंडा धीरे-धीरे डालें", measure: "1 मिनट", visual: "अंडा पतली धारियां बनाए, गुठलियां नहीं" }],
    zh: [{ instruction: "将高汤煮至微沸", measure: "3-4分钟", visual: "持续小气泡，不是大滚" }, { instruction: "边搅拌边缓慢倒入打散的蛋液", measure: "1分钟", visual: "蛋液形成细丝状，不结块" }],
    ar: [{ instruction: "اجعل المرق يغلي برفق", measure: "3-4 دقائق", visual: "فقاعات صغيرة ثابتة، وليس غليانًا شديدًا" }, { instruction: "اسكب البيض المخفوق ببطء أثناء التحريك", measure: "دقيقة واحدة", visual: "يشكل البيض خيوطًا رفيعة، وليس تكتلات" }],
  },
  "bibimbap": {
    es: [{ instruction: "Cocina el arroz y resérvalo", measure: "Según el paquete", visual: "Esponjoso y bien cocido" }, { instruction: "Sofríe los vegetales por separado hasta que estén apenas tiernos", measure: "5–6 min", visual: "Aún ligeramente crujientes, colores vivos" }, { instruction: "Fríe un huevo con la yema líquida y arma el bol", measure: "2–3 min", visual: "La clara está cuajada, la yema aún líquida" }],
    fr: [{ instruction: "Cuisez le riz et réservez", measure: "Selon le paquet", visual: "Moelleux et bien cuit" }, { instruction: "Faites sauter les légumes séparément jusqu'à peine tendres", measure: "5–6 min", visual: "Encore légèrement croquants, couleurs vives" }, { instruction: "Faites frire un œuf au plat et assemblez le bol", measure: "2–3 min", visual: "Le blanc est pris, le jaune encore coulant" }],
    pt: [{ instruction: "Cozinhe o arroz e reserve", measure: "Conforme a embalagem", visual: "Soltinho e bem cozido" }, { instruction: "Refogue os legumes separadamente até ficarem apenas macios", measure: "5–6 min", visual: "Ainda levemente crocantes, cores vivas" }, { instruction: "Frite um ovo com a gema mole e monte a tigela", measure: "2–3 min", visual: "A clara está firme, a gema ainda mole" }],
    hi: [{ instruction: "चावल पकाएं और अलग रखें", measure: "पैकेज के अनुसार", visual: "फूला हुआ और पूरी तरह पका हुआ" }, { instruction: "सब्ज़ियों को अलग-अलग नरम होने तक भूनें", measure: "5-6 मिनट", visual: "अभी भी थोड़ी कुरकुरी, चमकीले रंग" }, { instruction: "एक अंडा सनी-साइड-अप तलें और बाउल बनाएं", measure: "2-3 मिनट", visual: "सफेद भाग सेट हो, जर्दी अभी भी बहती हो" }],
    zh: [{ instruction: "煮米饭并放在一边", measure: "按包装说明", visual: "蓬松且完全熟透" }, { instruction: "分别炒蔬菜至刚好变软", measure: "5-6分钟", visual: "仍略带脆感，色泽鲜艳" }, { instruction: "煎一个溏心蛋并组装碗", measure: "2-3分钟", visual: "蛋白凝固，蛋黄仍流动" }],
    ar: [{ instruction: "اطبخ الأرز وضعه جانبًا", measure: "حسب العبوة", visual: "طري ومطهو جيدًا" }, { instruction: "قلِّب الخضار كل على حدة حتى تصبح طرية قليلًا", measure: "5-6 دقائق", visual: "لا تزال مقرمشة قليلًا، ألوان زاهية" }, { instruction: "اقلِ بيضة بصفار سائل ورتّب الصحن", measure: "2-3 دقائق", visual: "البياض متماسك، الصفار لا يزال سائلًا" }],
  },
  "kimchi-fried-rice": {
    es: [{ instruction: "Sofríe kimchi picado en una sartén caliente", measure: "2–3 min", visual: "Los bordes del kimchi comienzan a caramelizarse" }, { instruction: "Añade arroz y aceite de sésamo, saltea hasta calentar", measure: "4–5 min", visual: "El arroz está uniformemente rojizo y ligeramente crujiente en zonas" }, { instruction: "Cubre con un huevo frito", measure: "2 min", visual: "La yema aún blanda" }],
    fr: [{ instruction: "Faites sauter le kimchi haché dans une poêle chaude", measure: "2–3 min", visual: "Les bords du kimchi commencent à caraméliser" }, { instruction: "Ajoutez le riz et l'huile de sésame, faites sauter jusqu'à réchauffement", measure: "4–5 min", visual: "Le riz est uniformément rougeâtre et légèrement croustillant par endroits" }, { instruction: "Garnissez d'un œuf au plat", measure: "2 min", visual: "Le jaune encore mou" }],
    pt: [{ instruction: "Refogue o kimchi picado numa frigideira quente", measure: "2–3 min", visual: "As bordas do kimchi começam a caramelizar" }, { instruction: "Adicione arroz e óleo de gergelim, refogue até aquecer", measure: "4–5 min", visual: "O arroz está uniformemente avermelhado e levemente crocante em partes" }, { instruction: "Cubra com um ovo frito", measure: "2 min", visual: "A gema ainda mole" }],
    hi: [{ instruction: "गर्म पैन में कटा हुआ किमची भूनें", measure: "2-3 मिनट", visual: "किमची के किनारे कैरेमलाइज़ होने लगें" }, { instruction: "चावल और तिल का तेल डालें, गर्म होने तक भूनें", measure: "4-5 मिनट", visual: "चावल समान रूप से लाल हो और जगह-जगह हल्का कुरकुरा हो" }, { instruction: "ऊपर तला हुआ अंडा डालें", measure: "2 मिनट", visual: "जर्दी अभी भी नरम हो" }],
    zh: [{ instruction: "在热锅中炒切碎的泡菜", measure: "2-3分钟", visual: "泡菜边缘开始焦糖化" }, { instruction: "加入米饭和香油，翻炒至热透", measure: "4-5分钟", visual: "米饭均匀呈红色，局部略带脆感" }, { instruction: "上面放一个煎蛋", measure: "2分钟", visual: "蛋黄仍然柔软" }],
    ar: [{ instruction: "قلِّب الكيمتشي المفروم في مقلاة ساخنة", measure: "2-3 دقائق", visual: "تبدأ حواف الكيمتشي بالتكرمل" }, { instruction: "أضف الأرز وزيت السمسم، قلّب حتى يسخن", measure: "4-5 دقائق", visual: "الأرز محمر بالتساوي ومقرمش قليلًا في بعض الأماكن" }, { instruction: "أضف بيضة مقلية فوقه", measure: "دقيقتان", visual: "الصفار لا يزال طريًا" }],
  },
  "ratatouille": {
    es: [{ instruction: "Corta todos los vegetales en trozos de tamaño similar", measure: "N/A", visual: "Los trozos son relativamente uniformes para cocción pareja" }, { instruction: "Sofríe por tandas empezando con los vegetales más firmes", measure: "15 min en total", visual: "Cada vegetal está tierno pero mantiene su forma" }, { instruction: "Combina todo y cocina a fuego lento juntos", measure: "10 min", visual: "La mezcla se ha fusionado en una consistencia espesa tipo guiso" }],
    fr: [{ instruction: "Coupez tous les légumes en morceaux de taille similaire", measure: "N/A", visual: "Les morceaux sont relativement uniformes pour une cuisson égale" }, { instruction: "Faites sauter par lots en commençant par les légumes les plus fermes", measure: "15 min au total", visual: "Chaque légume est tendre mais garde sa forme" }, { instruction: "Combinez le tout et laissez mijoter ensemble", measure: "10 min", visual: "Le mélange a fusionné en une consistance épaisse type ragoût" }],
    pt: [{ instruction: "Corte todos os vegetais em pedaços de tamanho parecido", measure: "N/A", visual: "Os pedaços são relativamente uniformes para cozimento parelho" }, { instruction: "Refogue em lotes começando pelos vegetais mais firmes", measure: "15 min no total", visual: "Cada vegetal fica macio mas mantém sua forma" }, { instruction: "Combine tudo e cozinhe junto em fogo baixo", measure: "10 min", visual: "A mistura se fundiu numa consistência espessa tipo ensopado" }],
    hi: [{ instruction: "सभी सब्ज़ियों को समान आकार के टुकड़ों में काटें", measure: "लागू नहीं", visual: "टुकड़े समान रूप से पकने के लिए लगभग एक जैसे हों" }, { instruction: "सबसे सख्त सब्ज़ियों से शुरू करके बैचों में भूनें", measure: "कुल 15 मिनट", visual: "हर सब्ज़ी नरम हो लेकिन आकार बनाए रखे" }, { instruction: "सब कुछ मिलाकर साथ में धीमी आंच पर पकाएं", measure: "10 मिनट", visual: "मिश्रण गाढ़ी, स्ट्यू जैसी बनावट में मिल गया हो" }],
    zh: [{ instruction: "将所有蔬菜切成大小相近的块", measure: "不适用", visual: "块状大小基本均匀以便均匀受热" }, { instruction: "分批炒制，从最硬的蔬菜开始", measure: "共15分钟", visual: "每种蔬菜都软嫩但保持形状" }, { instruction: "将所有食材混合一起炖煮", measure: "10分钟", visual: "混合物融合成浓稠的炖菜状" }],
    ar: [{ instruction: "قطّع كل الخضار إلى قطع متشابهة الحجم", measure: "غير محدد", visual: "القطع متساوية تقريبًا لطهي متساوٍ" }, { instruction: "قلِّب على دفعات بدءًا بأصلب الخضار", measure: "15 دقيقة إجمالًا", visual: "كل خضار طري لكنه يحتفظ بشكله" }, { instruction: "اجمع كل شيء واتركه ينضج معًا", measure: "10 دقائق", visual: "اندمج الخليط في قوام سميك أشبه باليخنة" }],
  },
  "croque-monsieur": {
    es: [{ instruction: "Coloca jamón y queso entre rebanadas de pan con mantequilla", measure: "N/A", visual: "El relleno llega a cada borde" }, { instruction: "Cocina en una sartén a fuego medio hasta dorar por ambos lados", measure: "3–4 min por lado", visual: "Dorado intenso, el queso visiblemente derritiéndose en los bordes" }],
    fr: [{ instruction: "Disposez jambon et fromage entre des tranches de pain beurrées", measure: "N/A", visual: "La garniture atteint chaque bord" }, { instruction: "Faites cuire à la poêle à feu moyen jusqu'à dorure des deux côtés", measure: "3–4 min par face", visual: "Doré intense, fromage visiblement fondant sur les bords" }],
    pt: [{ instruction: "Coloque presunto e queijo entre fatias de pão amanteigadas", measure: "N/A", visual: "O recheio chega a cada borda" }, { instruction: "Cozinhe numa frigideira em fogo médio até dourar dos dois lados", measure: "3–4 min de cada lado", visual: "Bem dourado, queijo visivelmente derretendo nas bordas" }],
    hi: [{ instruction: "मक्खन लगी ब्रेड के टुकड़ों के बीच हैम और चीज़ रखें", measure: "लागू नहीं", visual: "फिलिंग हर किनारे तक पहुंचे" }, { instruction: "मध्यम आंच पर पैन में दोनों तरफ सुनहरा होने तक पकाएं", measure: "हर तरफ 3-4 मिनट", visual: "गहरा सुनहरा, चीज़ किनारों पर स्पष्ट रूप से पिघल रहा हो" }],
    zh: [{ instruction: "在涂黄油的面包片之间夹入火腿和芝士", measure: "不适用", visual: "馅料覆盖到每个边缘" }, { instruction: "中火煎至两面金黄", measure: "每面3-4分钟", visual: "深金黄色，芝士在边缘明显融化" }],
    ar: [{ instruction: "رتّب الجبنة واللحم بين شرائح خبز مزبدة", measure: "غير محدد", visual: "يصل الحشو إلى كل حافة" }, { instruction: "اطبخ في مقلاة على نار متوسطة حتى يصبح ذهبيًا من الجانبين", measure: "3-4 دقائق لكل جانب", visual: "ذهبي داكن، الجبنة تذوب بوضوح عند الحواف" }],
  },
  "blt": {
    es: [{ instruction: "Cocina el tocino hasta que esté crujiente", measure: "6–8 min", visual: "Dorado intenso y firme, no flácido" }, { instruction: "Tuesta el pan", measure: "2 min", visual: "Dorado y firme al tocar" }, { instruction: "Coloca tocino, lechuga y tomate entre las rebanadas", measure: "N/A", visual: "Las rodajas de tomate no sobresalen del pan" }],
    fr: [{ instruction: "Faites cuire le bacon jusqu'à ce qu'il soit croustillant", measure: "6–8 min", visual: "Bien doré et ferme, pas flasque" }, { instruction: "Faites griller le pain", measure: "2 min", visual: "Doré et ferme au toucher" }, { instruction: "Disposez bacon, laitue et tomate entre les tranches", measure: "N/A", visual: "Les tranches de tomate ne dépassent pas du pain" }],
    pt: [{ instruction: "Cozinhe o bacon até ficar crocante", measure: "6–8 min", visual: "Bem dourado e firme, não mole" }, { instruction: "Toste o pão", measure: "2 min", visual: "Dourado e firme ao toque" }, { instruction: "Coloque bacon, alface e tomate entre as fatias", measure: "N/A", visual: "As fatias de tomate não ultrapassam o pão" }],
    hi: [{ instruction: "बेकन को कुरकुरा होने तक पकाएं", measure: "6-8 मिनट", visual: "गहरा सुनहरा और सख्त, ढीला नहीं" }, { instruction: "ब्रेड टोस्ट करें", measure: "2 मिनट", visual: "सुनहरा और छूने पर सख्त" }, { instruction: "टुकड़ों के बीच बेकन, लेट्यूस और टमाटर रखें", measure: "लागू नहीं", visual: "टमाटर के टुकड़े ब्रेड से बाहर न निकलें" }],
    zh: [{ instruction: "将培根煎至酥脆", measure: "6-8分钟", visual: "深金黄色且坚实，不软塌" }, { instruction: "烤面包", measure: "2分钟", visual: "金黄色，触摸时坚实" }, { instruction: "在面包片之间夹入培根、生菜和番茄", measure: "不适用", visual: "番茄片不要超出面包边缘" }],
    ar: [{ instruction: "اطبخ البيكون حتى يصبح مقرمشًا", measure: "6-8 دقائق", visual: "ذهبي داكن ومتماسك، غير مترهل" }, { instruction: "حمّص الخبز", measure: "دقيقتان", visual: "ذهبي ومتماسك عند اللمس" }, { instruction: "رتّب البيكون والخس والطماطم بين الشرائح", measure: "غير محدد", visual: "لا تتجاوز شرائح الطماطم حافة الخبز" }],
  },
  "chili-con-carne": {
    es: [{ instruction: "Dora la carne molida con cebolla", measure: "7–8 min", visual: "No queda rosado, cebolla ablandada" }, { instruction: "Añade tomates, frijoles y sazonador, cocina a fuego lento", measure: "20–25 min", visual: "La salsa se ha espesado y oscurecido" }],
    fr: [{ instruction: "Faites dorer le bœuf haché avec l'oignon", measure: "7–8 min", visual: "Plus aucune trace rose, oignon ramolli" }, { instruction: "Ajoutez tomates, haricots et assaisonnement, laissez mijoter", measure: "20–25 min", visual: "La sauce a épaissi et foncé" }],
    pt: [{ instruction: "Doure a carne moída com cebola", measure: "7–8 min", visual: "Sem rosa restante, cebola amolecida" }, { instruction: "Adicione tomates, feijão e tempero, cozinhe em fogo baixo", measure: "20–25 min", visual: "O molho engrossou e escureceu" }],
    hi: [{ instruction: "कीमा और प्याज़ को भूनें", measure: "7-8 मिनट", visual: "कोई गुलाबीपन न बचे, प्याज़ नरम हो" }, { instruction: "टमाटर, बीन्स और मसाले डालें, धीमी आंच पर पकाएं", measure: "20-25 मिनट", visual: "सॉस गाढ़ा और गहरा हो गया हो" }],
    zh: [{ instruction: "将牛肉末与洋葱一起炒香", measure: "7-8分钟", visual: "没有粉色残留，洋葱变软" }, { instruction: "加入番茄、豆子和调料，煨煮", measure: "20-25分钟", visual: "酱汁已经变浓稠并颜色加深" }],
    ar: [{ instruction: "حمّر لحم البقر المفروم مع البصل", measure: "7-8 دقائق", visual: "بلا لون وردي متبقٍ، البصل لان" }, { instruction: "أضف الطماطم والفاصولياء والتوابل، اتركه ينضج", measure: "20-25 دقيقة", visual: "أصبحت الصلصة سميكة وداكنة" }],
  },
  "pancakes": {
    es: [{ instruction: "Bate harina, huevos y leche hasta obtener una masa suave", measure: "2 min", visual: "Sin grumos visibles, cae en un chorro constante" }, { instruction: "Cocina cucharadas de masa en una sartén con mantequilla", measure: "2–3 min por lado", visual: "Se forman burbujas que revientan en la superficie antes de voltear, dorado por ambos lados" }],
    fr: [{ instruction: "Fouettez farine, œufs et lait en une pâte lisse", measure: "2 min", visual: "Aucun grumeau visible, s'écoule en un ruban régulier" }, { instruction: "Cuisez des cuillerées de pâte sur une poêle beurrée", measure: "2–3 min par face", visual: "Des bulles se forment et éclatent en surface avant de retourner, doré des deux côtés" }],
    pt: [{ instruction: "Bata farinha, ovos e leite até obter uma massa lisa", measure: "2 min", visual: "Sem grumos visíveis, escorre num fio constante" }, { instruction: "Cozinhe colheradas de massa numa frigideira amanteigada", measure: "2–3 min de cada lado", visual: "Formam-se bolhas que estouram na superfície antes de virar, dourado dos dois lados" }],
    hi: [{ instruction: "आटा, अंडे और दूध को चिकने घोल में फेंटें", measure: "2 मिनट", visual: "कोई गुठली न दिखे, स्थिर धारा में गिरे" }, { instruction: "मक्खन लगे पैन पर चम्मच भर घोल पकाएं", measure: "हर तरफ 2-3 मिनट", visual: "पलटने से पहले सतह पर बुलबुले बनें और फूटें, दोनों तरफ सुनहरा हो" }],
    zh: [{ instruction: "将面粉、鸡蛋和牛奶搅打成顺滑面糊", measure: "2分钟", visual: "无明显颗粒，倒下时呈稳定的带状" }, { instruction: "在涂黄油的锅中煎勺状面糊", measure: "每面2-3分钟", visual: "翻面前表面形成气泡并破裂，两面金黄" }],
    ar: [{ instruction: "اخفق الطحين والبيض والحليب حتى يصبح عجينة ناعمة", measure: "دقيقتان", visual: "بلا تكتلات ظاهرة، تسكب بشكل شريط ثابت" }, { instruction: "اطبخ ملاعق من العجينة على مقلاة مزبدة", measure: "2-3 دقائق لكل جانب", visual: "تتشكل فقاعات وتنفجر على السطح قبل القلب، ذهبي من الجانبين" }],
  },
  "mac-and-cheese": {
    es: [{ instruction: "Cocina la pasta hasta que esté tierna", measure: "8–9 min", visual: "Tierna pero firme al morder" }, { instruction: "Derrite mantequilla con leche, incorpora queso fuera del fuego", measure: "2–3 min", visual: "La salsa es suave y brillante, sin grumos" }, { instruction: "Mezcla la pasta escurrida con la salsa de queso", measure: "1 min", visual: "Cada trozo está completamente cubierto" }],
    fr: [{ instruction: "Cuisez les pâtes jusqu'à tendreté", measure: "8–9 min", visual: "Tendres mais fermes sous la dent" }, { instruction: "Faites fondre le beurre avec le lait, incorporez le fromage hors du feu", measure: "2–3 min", visual: "La sauce est lisse et brillante, sans grumeaux" }, { instruction: "Mélangez les pâtes égouttées avec la sauce au fromage", measure: "1 min", visual: "Chaque morceau est entièrement enrobé" }],
    pt: [{ instruction: "Cozinhe o macarrão até ficar macio", measure: "8–9 min", visual: "Macio mas firme ao morder" }, { instruction: "Derreta manteiga com leite, incorpore o queijo fora do fogo", measure: "2–3 min", visual: "O molho é liso e brilhante, sem grumos" }, { instruction: "Misture o macarrão escorrido com o molho de queijo", measure: "1 min", visual: "Cada pedaço fica totalmente coberto" }],
    hi: [{ instruction: "पास्ता को नरम होने तक पकाएं", measure: "8-9 मिनट", visual: "नरम लेकिन काटने पर सख्त" }, { instruction: "दूध के साथ मक्खन पिघलाएं, आंच से हटाकर चीज़ मिलाएं", measure: "2-3 मिनट", visual: "सॉस चिकना और चमकदार हो, गुठलियां नहीं" }, { instruction: "छाने हुए पास्ता को चीज़ सॉस के साथ मिलाएं", measure: "1 मिनट", visual: "हर टुकड़ा पूरी तरह लिपटा हो" }],
    zh: [{ instruction: "将意面煮至软嫩", measure: "8-9分钟", visual: "软嫩但咬起来仍紧实" }, { instruction: "用牛奶融化黄油，离火后拌入芝士", measure: "2-3分钟", visual: "酱汁顺滑光亮，无结块" }, { instruction: "将沥干的意面与芝士酱拌匀", measure: "1分钟", visual: "每一块都完全裹上酱汁" }],
    ar: [{ instruction: "اطبخ المعكرونة حتى تصبح طرية", measure: "8-9 دقائق", visual: "طرية لكن متماسكة عند العض" }, { instruction: "أذب الزبدة مع الحليب، أضف الجبنة بعيدًا عن النار", measure: "2-3 دقائق", visual: "الصلصة ناعمة ولامعة، بدون تكتلات" }, { instruction: "اخلط المعكرونة المصفاة مع صلصة الجبنة", measure: "دقيقة واحدة", visual: "كل قطعة مغطاة بالكامل" }],
  },
  "margherita-toast": {
    es: [{ instruction: "Cubre el pan con tomate en rodajas y mozzarella", measure: "N/A", visual: "El queso cubre el pan uniformemente" }, { instruction: "Gratina hasta que el queso esté derretido y burbujeante", measure: "3–4 min", visual: "El queso se ha dorado en zonas, sin quemarse" }],
    fr: [{ instruction: "Garnissez le pain de tomate en tranches et de mozzarella", measure: "N/A", visual: "Le fromage recouvre le pain uniformément" }, { instruction: "Passez au gril jusqu'à ce que le fromage soit fondu et bouillonnant", measure: "3–4 min", visual: "Le fromage a bruni par endroits, sans brûler" }],
    pt: [{ instruction: "Cubra o pão com tomate fatiado e muçarela", measure: "N/A", visual: "O queijo cobre o pão uniformemente" }, { instruction: "Leve para gratinar até o queijo derreter e borbulhar", measure: "3–4 min", visual: "O queijo dourou em partes, sem queimar" }],
    hi: [{ instruction: "ब्रेड पर कटा हुआ टमाटर और मोज़ेरेला डालें", measure: "लागू नहीं", visual: "चीज़ ब्रेड पर समान रूप से फैला हो" }, { instruction: "चीज़ पिघलने और बुलबुले आने तक ब्रॉइल करें", measure: "3-4 मिनट", visual: "चीज़ जगह-जगह भूरा हो गया हो, जला नहीं" }],
    zh: [{ instruction: "在面包上铺番茄片和马苏里拉芝士", measure: "不适用", visual: "芝士均匀覆盖面包" }, { instruction: "烤至芝士融化冒泡", measure: "3-4分钟", visual: "芝士局部呈焦黄色，没有烧焦" }],
    ar: [{ instruction: "ضع شرائح الطماطم والموزاريلا فوق الخبز", measure: "غير محدد", visual: "الجبنة تغطي الخبز بالتساوي" }, { instruction: "اشوِ حتى تذوب الجبنة وتصبح فقاعية", measure: "3-4 دقائق", visual: "اسمرت الجبنة في بعض الأماكن، دون احتراق" }],
  },
  "caprese-salad": {
    es: [{ instruction: "Corta tomate y mozzarella en rodajas uniformes", measure: "N/A", visual: "Las rodajas tienen un grosor similar" }, { instruction: "Alterna capas con hojas de albahaca, rocía con aceite de oliva", measure: "N/A", visual: "El aceite está distribuido uniformemente, no acumulado" }],
    fr: [{ instruction: "Coupez tomate et mozzarella en tranches régulières", measure: "N/A", visual: "Les tranches ont une épaisseur similaire" }, { instruction: "Alternez avec des feuilles de basilic, arrosez d'huile d'olive", measure: "N/A", visual: "L'huile est répartie uniformément, sans flaques" }],
    pt: [{ instruction: "Corte tomate e muçarela em fatias uniformes", measure: "N/A", visual: "As fatias têm espessura parecida" }, { instruction: "Alterne camadas com folhas de manjericão, regue com azeite", measure: "N/A", visual: "O azeite está distribuído uniformemente, sem acumular" }],
    hi: [{ instruction: "टमाटर और मोज़ेरेला को समान गोल टुकड़ों में काटें", measure: "लागू नहीं", visual: "टुकड़े लगभग एक जैसी मोटाई के हों" }, { instruction: "तुलसी के पत्तों के साथ बारी-बारी परतें बनाएं, जैतून का तेल डालें", measure: "लागू नहीं", visual: "तेल समान रूप से फैला हो, जमा न हो" }],
    zh: [{ instruction: "将番茄和马苏里拉芝士切成均匀的圆片", measure: "不适用", visual: "切片厚度相近" }, { instruction: "与罗勒叶交替叠放，淋上橄榄油", measure: "不适用", visual: "油均匀分布，不会积聚" }],
    ar: [{ instruction: "قطّع الطماطم والموزاريلا إلى شرائح متساوية", measure: "غير محدد", visual: "الشرائح متقاربة السماكة" }, { instruction: "رتّب بالتناوب مع أوراق الريحان، رشّ بزيت الزيتون", measure: "غير محدد", visual: "الزيت موزع بالتساوي، دون تجمّع" }],
  },
  "minestrone": {
    es: [{ instruction: "Sofríe los vegetales hasta que apenas se ablanden", measure: "5 min", visual: "Los bordes comienzan a ablandarse, aún coloridos" }, { instruction: "Añade caldo y tomates, cocina a fuego lento", measure: "15 min", visual: "Los vegetales están tiernos" }, { instruction: "Añade pasta y cocina hasta que esté al dente", measure: "8–9 min", visual: "La pasta tiene un poco de firmeza" }],
    fr: [{ instruction: "Faites revenir les légumes jusqu'à peine ramollir", measure: "5 min", visual: "Les bords commencent à ramollir, encore colorés" }, { instruction: "Ajoutez bouillon et tomates, laissez mijoter", measure: "15 min", visual: "Les légumes sont tendres" }, { instruction: "Ajoutez les pâtes et cuisez al dente", measure: "8–9 min", visual: "Les pâtes gardent un peu de fermeté" }],
    pt: [{ instruction: "Refogue os legumes até apenas amolecerem", measure: "5 min", visual: "As bordas começam a amolecer, ainda coloridos" }, { instruction: "Adicione caldo e tomates, cozinhe em fogo baixo", measure: "15 min", visual: "Os legumes estão macios" }, { instruction: "Adicione o macarrão e cozinhe até al dente", measure: "8–9 min", visual: "O macarrão mantém uma leve firmeza" }],
    hi: [{ instruction: "सब्ज़ियों को बस नरम होने तक भूनें", measure: "5 मिनट", visual: "किनारे नरम होने लगें, अभी भी रंगीन हों" }, { instruction: "शोरबा और टमाटर डालें, धीमी आंच पर पकाएं", measure: "15 मिनट", visual: "सब्ज़ियां नरम हों" }, { instruction: "पास्ता डालें और अल डेंटे होने तक पकाएं", measure: "8-9 मिनट", visual: "पास्ता में थोड़ी सख्ती बची हो" }],
    zh: [{ instruction: "将蔬菜炒至刚变软", measure: "5分钟", visual: "边缘开始变软，仍然色彩鲜艳" }, { instruction: "加入高汤和番茄，煨煮", measure: "15分钟", visual: "蔬菜变软" }, { instruction: "加入意面煮至有嚼劲", measure: "8-9分钟", visual: "意面还带一点韧性" }],
    ar: [{ instruction: "قلِّب الخضار حتى تلين قليلًا", measure: "5 دقائق", visual: "تبدأ الحواف باللين، لا تزال زاهية اللون" }, { instruction: "أضف المرق والطماطم، اتركه ينضج", measure: "15 دقيقة", visual: "الخضار طرية" }, { instruction: "أضف المعكرونة واطبخها حتى تصبح 'أل دنتي'", measure: "8-9 دقائق", visual: "المعكرونة تحتفظ بقوام خفيف" }],
  },
  "quesadillas": {
    es: [{ instruction: "Espolvorea queso sobre la mitad de una tortilla y dobla", measure: "N/A", visual: "El queso está distribuido uniformemente, no amontonado en un punto" }, { instruction: "Cocina en una sartén seca hasta que esté dorada y el queso derretido", measure: "2–3 min por lado", visual: "Ampollas doradas intensas, queso completamente derretido" }],
    fr: [{ instruction: "Saupoudrez du fromage sur la moitié d'une tortilla et repliez", measure: "N/A", visual: "Le fromage est réparti uniformément, pas entassé" }, { instruction: "Cuisez dans une poêle sèche jusqu'à dorure et fromage fondu", measure: "2–3 min par face", visual: "Cloques dorées intenses, fromage entièrement fondu" }],
    pt: [{ instruction: "Polvilhe queijo sobre metade da tortilha e dobre", measure: "N/A", visual: "O queijo está distribuído uniformemente, não empilhado num ponto" }, { instruction: "Cozinhe numa frigideira seca até dourar e o queijo derreter", measure: "2–3 min de cada lado", visual: "Bolhas douradas intensas, queijo totalmente derretido" }],
    hi: [{ instruction: "टॉर्टिला के आधे हिस्से पर चीज़ छिड़कें और मोड़ें", measure: "लागू नहीं", visual: "चीज़ समान रूप से फैला हो, एक जगह ढेर न हो" }, { instruction: "सूखे पैन में सुनहरा होने और चीज़ पिघलने तक पकाएं", measure: "हर तरफ 2-3 मिनट", visual: "गहरे सुनहरे फफोले, चीज़ पूरी तरह पिघला हो" }],
    zh: [{ instruction: "在半张薄饼上撒芝士并对折", measure: "不适用", visual: "芝士均匀分布，不要堆在一处" }, { instruction: "在干锅中煎至金黄且芝士融化", measure: "每面2-3分钟", visual: "出现深金黄色气泡，芝士完全融化" }],
    ar: [{ instruction: "رشّ الجبنة على نصف التورتيا واطوها", measure: "غير محدد", visual: "الجبنة موزعة بالتساوي، غير مكدسة في مكان واحد" }, { instruction: "اطبخ في مقلاة جافة حتى تصبح ذهبية وتذوب الجبنة", measure: "2-3 دقائق لكل جانب", visual: "فقاعات ذهبية داكنة، الجبنة ذائبة بالكامل" }],
  },
  "breakfast-burrito": {
    es: [{ instruction: "Revuelve huevos en una sartén caliente", measure: "3–4 min", visual: "Cuajos suaves, no dorados" }, { instruction: "Rellena la tortilla con huevos, queso y salsa, luego enrolla firmemente", measure: "N/A", visual: "El wrap mantiene su forma sin romperse" }],
    fr: [{ instruction: "Brouillez les œufs dans une poêle chaude", measure: "3–4 min", visual: "Grumeaux moelleux, non dorés" }, { instruction: "Garnissez la tortilla d'œufs, fromage et salsa, puis roulez serré", measure: "N/A", visual: "Le wrap garde sa forme sans se déchirer" }],
    pt: [{ instruction: "Mexa os ovos numa frigideira quente", measure: "3–4 min", visual: "Grumos macios, não dourados" }, { instruction: "Recheie a tortilha com ovos, queijo e salsa, depois enrole firme", measure: "N/A", visual: "O wrap mantém a forma sem rasgar" }],
    hi: [{ instruction: "गर्म पैन में अंडे स्क्रैम्बल करें", measure: "3-4 मिनट", visual: "नरम टुकड़े, सुनहरे नहीं" }, { instruction: "टॉर्टिला में अंडे, चीज़ और साल्सा भरें, फिर कसकर रोल करें", measure: "लागू नहीं", visual: "रैप बिना फटे अपना आकार बनाए रखे" }],
    zh: [{ instruction: "在热锅中炒散鸡蛋", measure: "3-4分钟", visual: "柔软的凝块，不要炒焦" }, { instruction: "在薄饼中填入鸡蛋、芝士和莎莎酱，然后卷紧", measure: "不适用", visual: "卷饼保持形状不会破裂" }],
    ar: [{ instruction: "اخفق البيض في مقلاة ساخنة", measure: "3-4 دقائق", visual: "قطع طرية، غير محمرة" }, { instruction: "املأ التورتيا بالبيض والجبنة والصلصة، ثم لفّها بإحكام", measure: "غير محدد", visual: "تحافظ اللفافة على شكلها دون تمزق" }],
  },
  "paneer-tikka": {
    es: [{ instruction: "Marina cubos de paneer en yogur y especias", measure: "10 min si hay tiempo", visual: "El recubrimiento es espeso y cubre uniformemente cada cubo" }, { instruction: "Sella paneer y pimientos en sartén hasta que se chamusquen en zonas", measure: "6–8 min", visual: "Manchas doradas distintivas, no uniformemente pálido" }],
    fr: [{ instruction: "Faites mariner les cubes de paneer dans du yaourt et des épices", measure: "10 min si le temps le permet", visual: "L'enrobage est épais et couvre uniformément chaque cube" }, { instruction: "Saisissez le paneer et les poivrons jusqu'à ce qu'ils soient grillés par endroits", measure: "6–8 min", visual: "Taches dorées distinctes, pas uniformément pâle" }],
    pt: [{ instruction: "Marine cubos de paneer em iogurte e especiarias", measure: "10 min se der tempo", visual: "O revestimento é espesso e cobre cada cubo uniformemente" }, { instruction: "Sele o paneer e os pimentões numa frigideira até chamuscar em partes", measure: "6–8 min", visual: "Manchas douradas distintas, não uniformemente pálido" }],
    hi: [{ instruction: "पनीर के टुकड़ों को दही और मसालों में मैरिनेट करें", measure: "समय हो तो 10 मिनट", visual: "कोटिंग गाढ़ी हो और हर टुकड़े को समान रूप से ढके" }, { instruction: "पनीर और शिमला मिर्च को जगह-जगह जलने तक पैन में सियर करें", measure: "6-8 मिनट", visual: "स्पष्ट सुनहरे-भूरे धब्बे हों, समान रूप से पीला नहीं" }],
    zh: [{ instruction: "将印度奶酪块用酸奶和香料腌制", measure: "如有时间腌10分钟", visual: "裹料浓厚且均匀覆盖每一块" }, { instruction: "将奶酪和甜椒煎至局部焦香", measure: "6-8分钟", visual: "出现明显的金棕色斑点，不是均匀浅色" }],
    ar: [{ instruction: "تبّل مكعبات البانير في الزبادي والتوابل", measure: "10 دقائق إن سمح الوقت", visual: "الطبقة سميكة وتغطي كل مكعب بالتساوي" }, { instruction: "حمّر البانير والفلفل حتى يتفحم قليلًا في بعض الأماكن", measure: "6-8 دقائق", visual: "بقع ذهبية داكنة واضحة، وليست شاحبة موحدة" }],
  },
  "aloo-gobi": {
    es: [{ instruction: "Sofríe cebolla con curry en polvo hasta que esté fragante", measure: "3–4 min", visual: "Las especias cubren la cebolla uniformemente y huelen tostadas" }, { instruction: "Añade papa y coliflor, tapa y cocina hasta que estén tiernas", measure: "18–20 min", visual: "Un tenedor entra fácilmente en la papa" }],
    fr: [{ instruction: "Faites revenir l'oignon avec le curry en poudre jusqu'à ce que ce soit parfumé", measure: "3–4 min", visual: "Les épices enrobent l'oignon uniformément et sentent le grillé" }, { instruction: "Ajoutez pomme de terre et chou-fleur, couvrez et cuisez jusqu'à tendreté", measure: "18–20 min", visual: "Une fourchette entre facilement dans la pomme de terre" }],
    pt: [{ instruction: "Refogue a cebola com curry em pó até ficar perfumado", measure: "3–4 min", visual: "As especiarias cobrem a cebola uniformemente e têm cheiro tostado" }, { instruction: "Adicione batata e couve-flor, tampe e cozinhe até ficarem macias", measure: "18–20 min", visual: "Um garfo entra facilmente na batata" }],
    hi: [{ instruction: "करी पाउडर के साथ प्याज़ को खुशबूदार होने तक भूनें", measure: "3-4 मिनट", visual: "मसाले प्याज़ पर समान रूप से लिपटे हों और भुनी खुशबू आए" }, { instruction: "आलू और फूलगोभी डालें, ढककर नरम होने तक पकाएं", measure: "18-20 मिनट", visual: "कांटा आलू में आसानी से चला जाए" }],
    zh: [{ instruction: "将洋葱和咖喱粉一起炒香", measure: "3-4分钟", visual: "香料均匀裹住洋葱，散发烘烤香气" }, { instruction: "加入土豆和花菜，加盖煮至软嫩", measure: "18-20分钟", visual: "叉子能轻松插入土豆" }],
    ar: [{ instruction: "قلِّب البصل مع مسحوق الكاري حتى تفوح رائحته", measure: "3-4 دقائق", visual: "تغطي التوابل البصل بالتساوي وتفوح برائحة التحميص" }, { instruction: "أضف البطاطا والقرنبيط، غطِّ واطبخ حتى تلين", measure: "18-20 دقيقة", visual: "تدخل الشوكة بسهولة في البطاطا" }],
  },
  "teriyaki-salmon": {
    es: [{ instruction: "Sella el salmón con la piel hacia abajo en una sartén caliente", measure: "4–5 min", visual: "La piel está crujiente y se despega fácilmente de la sartén" }, { instruction: "Voltea y añade salsa de soya, miel y ajo", measure: "3–4 min", visual: "La salsa se ha espesado en un glaseado brillante" }],
    fr: [{ instruction: "Saisissez le saumon côté peau vers le bas dans une poêle chaude", measure: "4–5 min", visual: "La peau est croustillante et se détache facilement de la poêle" }, { instruction: "Retournez et ajoutez sauce soja, miel et ail", measure: "3–4 min", visual: "La sauce a épaissi en un glaçage brillant" }],
    pt: [{ instruction: "Sele o salmão com a pele para baixo numa frigideira quente", measure: "4–5 min", visual: "A pele está crocante e solta facilmente da frigideira" }, { instruction: "Vire e adicione molho de soja, mel e alho", measure: "3–4 min", visual: "O molho engrossou num glaze brilhante" }],
    hi: [{ instruction: "गर्म पैन में सैल्मन को त्वचा नीचे की तरफ सियर करें", measure: "4-5 मिनट", visual: "त्वचा कुरकुरी हो और पैन से आसानी से अलग हो" }, { instruction: "पलटें और सोया सॉस, शहद और लहसुन डालें", measure: "3-4 मिनट", visual: "सॉस चमकदार ग्लेज़ में गाढ़ा हो गया हो" }],
    zh: [{ instruction: "三文鱼皮朝下放入热锅中煎", measure: "4-5分钟", visual: "鱼皮酥脆，容易从锅中脱离" }, { instruction: "翻面，加入酱油、蜂蜜和大蒜", measure: "3-4分钟", visual: "酱汁已收成有光泽的酱料" }],
    ar: [{ instruction: "حمّر السلمون بالجانب الجلدي لأسفل في مقلاة ساخنة", measure: "4-5 دقائق", visual: "الجلد مقرمش وينفصل بسهولة عن المقلاة" }, { instruction: "اقلبه وأضف صلصة الصويا والعسل والثوم", measure: "3-4 دقائق", visual: "تكثفت الصلصة إلى تتبيلة لامعة" }],
  },
  "onigiri": {
    es: [{ instruction: "Humedece las manos ligeramente con agua salada y forma el arroz en triángulo", measure: "1/2 taza de arroz por bola", visual: "El arroz se mantiene firmemente unido sin desmoronarse" }, { instruction: "Envuelve una tira de nori alrededor de la base", measure: "N/A", visual: "El nori queda liso y no se arruga" }],
    fr: [{ instruction: "Humidifiez légèrement les mains avec de l'eau salée et façonnez le riz en triangle", measure: "1/2 tasse de riz par boule", visual: "Le riz tient fermement sans s'effriter" }, { instruction: "Enroulez une bande de nori autour de la base", measure: "N/A", visual: "Le nori reste lisse et ne se froisse pas" }],
    pt: [{ instruction: "Umedeça levemente as mãos com água salgada e molde o arroz em triângulo", measure: "1/2 xícara de arroz por bola", visual: "O arroz fica firmemente unido sem esfarelar" }, { instruction: "Envolva uma tira de nori na base", measure: "N/A", visual: "O nori fica liso e não enruga" }],
    hi: [{ instruction: "नमकीन पानी से हाथ हल्के गीले करें और चावल को त्रिकोण आकार दें", measure: "प्रति बॉल 1/2 कप चावल", visual: "चावल बिना टूटे मज़बूती से जुड़ा रहे" }, { instruction: "आधार के चारों ओर नोरी की पट्टी लपेटें", measure: "लागू नहीं", visual: "नोरी चिकनी रहे और सिकुड़े नहीं" }],
    zh: [{ instruction: "用盐水轻轻沾湿双手，将米饭捏成三角形", measure: "每个饭团半杯米", visual: "米饭紧密结合不散开" }, { instruction: "在底部包一条海苔", measure: "不适用", visual: "海苔平整不起皱" }],
    ar: [{ instruction: "بلّل يديك قليلًا بماء مملح وشكّل الأرز على شكل مثلث", measure: "نصف كوب أرز لكل كرة", visual: "يتماسك الأرز بإحكام دون أن يتفتت" }, { instruction: "لفّ شريطًا من النوري حول القاعدة", measure: "غير محدد", visual: "يبقى النوري أملسًا ولا يتجعد" }],
  },
  "miso-soup": {
    es: [{ instruction: "Calienta agua hasta que humee, sin hervir", measure: "3–4 min", visual: "Se forman pequeñas burbujas en los bordes, sin hervor fuerte" }, { instruction: "Incorpora pasta de miso fuera del fuego, luego añade tofu y algas", measure: "1–2 cdas de miso", visual: "El caldo se vuelve opaco y de color uniforme, sin grumos de pasta" }],
    fr: [{ instruction: "Chauffez l'eau jusqu'à ce qu'elle fume, sans bouillir", measure: "3–4 min", visual: "De petites bulles se forment sur les bords, pas d'ébullition forte" }, { instruction: "Incorporez la pâte miso hors du feu, puis ajoutez tofu et algues", measure: "1–2 c. à s. de miso", visual: "Le bouillon devient opaque et de couleur uniforme, sans grumeaux de pâte" }],
    pt: [{ instruction: "Aqueça a água até fumegar, sem ferver", measure: "3–4 min", visual: "Formam-se pequenas bolhas nas bordas, sem fervura forte" }, { instruction: "Incorpore a pasta de missô fora do fogo, depois adicione tofu e alga", measure: "1–2 colheres de sopa de missô", visual: "O caldo fica opaco e com cor uniforme, sem grumos de pasta" }],
    hi: [{ instruction: "पानी को बिना उबाले भाप आने तक गर्म करें", measure: "3-4 मिनट", visual: "किनारों पर छोटे बुलबुले बनें, तेज़ उबाल नहीं" }, { instruction: "आंच से हटाकर मिसो पेस्ट मिलाएं, फिर टोफू और सीवीड डालें", measure: "1-2 बड़े चम्मच मिसो", visual: "शोरबा अपारदर्शी और समान रंग का हो जाए, कोई पेस्ट गुठली नहीं" }],
    zh: [{ instruction: "将水加热至冒蒸汽，但不要煮沸", measure: "3-4分钟", visual: "边缘出现小气泡，没有大滚" }, { instruction: "离火后拌入味噌酱，然后加入豆腐和海带", measure: "1-2汤匙味噌", visual: "汤变得不透明且颜色均匀，没有酱料结块" }],
    ar: [{ instruction: "سخّن الماء حتى يتصاعد منه البخار دون أن يغلي", measure: "3-4 دقائق", visual: "تتشكل فقاعات صغيرة عند الحواف، بدون غليان شديد" }, { instruction: "أضف معجون الميسو بعيدًا عن النار، ثم أضف التوفو والأعشاب البحرية", measure: "1-2 ملعقة كبيرة ميسو", visual: "يصبح المرق معتمًا وموحد اللون، بدون تكتلات من المعجون" }],
  },
  "spring-rolls": {
    es: [{ instruction: "Sumerge papel de arroz en agua tibia hasta que esté apenas flexible", measure: "5–10 seg", visual: "El papel está suave pero no pegajoso ni roto" }, { instruction: "Coloca capas de lechuga, fideos y hierbas, luego enrolla firmemente", measure: "N/A", visual: "El rollo queda ajustado sin bolsas de aire, el relleno visible a través del envoltorio" }],
    fr: [{ instruction: "Trempez la galette de riz dans l'eau tiède jusqu'à ce qu'elle soit juste souple", measure: "5–10 sec", visual: "La galette est souple mais ni collante ni déchirée" }, { instruction: "Superposez laitue, vermicelles et herbes, puis roulez serré", measure: "N/A", visual: "Le rouleau est bien serré sans poches d'air, la garniture visible à travers l'enveloppe" }],
    pt: [{ instruction: "Mergulhe o papel de arroz em água morna até ficar apenas flexível", measure: "5–10 seg", visual: "O papel está macio mas não pegajoso ou rasgado" }, { instruction: "Faça camadas de alface, macarrão e ervas, depois enrole firme", measure: "N/A", visual: "O rolo fica justo sem bolsas de ar, o recheio visível através do envoltório" }],
    hi: [{ instruction: "राइस पेपर को गुनगुने पानी में तब तक डुबोएं जब तक वह बस लचीला हो", measure: "5-10 सेकंड", visual: "पेपर नरम हो लेकिन चिपचिपा या फटा न हो" }, { instruction: "लेट्यूस, नूडल्स और जड़ी-बूटियों की परतें बनाएं, फिर कसकर रोल करें", measure: "लागू नहीं", visual: "रोल बिना हवा के छेद के कसा हो, भरावन रैप से दिखे" }],
    zh: [{ instruction: "将米纸浸入温水中至刚好变软", measure: "5-10秒", visual: "米纸柔软但不粘连或破裂" }, { instruction: "铺上生菜、米粉和香草，然后卷紧", measure: "不适用", visual: "卷得紧实没有空气孔，透过卷皮能看到馅料" }],
    ar: [{ instruction: "انقع ورق الأرز في ماء دافئ حتى يصبح مرنًا فقط", measure: "5-10 ثوانٍ", visual: "الورق طري لكنه غير لزج أو ممزق" }, { instruction: "رتّب طبقات من الخس والنودلز والأعشاب، ثم لفّها بإحكام", measure: "غير محدد", visual: "اللفافة محكمة بدون فراغات هوائية، الحشو مرئي عبر الغلاف" }],
  },
  "quick-beef-pho": {
    es: [{ instruction: "Lleva el caldo a fuego lento con especias", measure: "5 min", visual: "El caldo es aromático y hierve constantemente" }, { instruction: "Cocina los fideos de arroz por separado hasta que estén tiernos", measure: "5–6 min", visual: "Los fideos están suaves pero no pastosos" }, { instruction: "Añade res cruda en rodajas finas al caldo caliente justo antes de servir", measure: "1–2 min", visual: "La res pasa de roja a marrón claro, apenas cocida" }],
    fr: [{ instruction: "Portez le bouillon à mijoter avec les épices", measure: "5 min", visual: "Le bouillon est parfumé et mijote régulièrement" }, { instruction: "Cuisez les vermicelles de riz séparément jusqu'à tendreté", measure: "5–6 min", visual: "Les nouilles sont tendres mais pas pâteuses" }, { instruction: "Ajoutez le bœuf cru finement tranché au bouillon chaud juste avant de servir", measure: "1–2 min", visual: "Le bœuf passe du rouge au brun clair, juste cuit" }],
    pt: [{ instruction: "Deixe o caldo apurar com especiarias", measure: "5 min", visual: "O caldo é aromático e ferve constantemente" }, { instruction: "Cozinhe o macarrão de arroz separadamente até ficar macio", measure: "5–6 min", visual: "O macarrão está macio mas não empapado" }, { instruction: "Adicione carne crua fatiada fina ao caldo quente pouco antes de servir", measure: "1–2 min", visual: "A carne passa de vermelha a marrom claro, apenas no ponto" }],
    hi: [{ instruction: "मसालों के साथ शोरबे को उबलने दें", measure: "5 मिनट", visual: "शोरबा खुशबूदार हो और लगातार उबल रहा हो" }, { instruction: "चावल के नूडल्स को अलग से नरम होने तक पकाएं", measure: "5-6 मिनट", visual: "नूडल्स नरम हों लेकिन गूदेदार नहीं" }, { instruction: "परोसने से ठीक पहले पतले कटे कच्चे बीफ को गर्म शोरबे में डालें", measure: "1-2 मिनट", visual: "बीफ लाल से हल्के भूरे रंग में बदल जाए, बस पका हुआ" }],
    zh: [{ instruction: "将高汤与香料一起煮沸", measure: "5分钟", visual: "高汤香气四溢，持续微沸" }, { instruction: "将米粉另外煮至软嫩", measure: "5-6分钟", visual: "米粉柔软但不软烂" }, { instruction: "上桌前将切薄的生牛肉片放入热汤中", measure: "1-2分钟", visual: "牛肉由红变浅褐色，刚好熟透" }],
    ar: [{ instruction: "اترك المرق ينضج مع التوابل", measure: "5 دقائق", visual: "المرق عطر ويغلي بثبات" }, { instruction: "اطبخ نودلز الأرز على حدة حتى تصبح طرية", measure: "5-6 دقائق", visual: "النودلز طرية لكنها ليست طرية جدًا" }, { instruction: "أضف شرائح لحم البقر النيء الرفيعة إلى المرق الساخن قبل التقديم مباشرة", measure: "1-2 دقيقة", visual: "يتحول اللحم من الأحمر إلى البني الفاتح، ناضج للتو" }],
  },
  "falafel-bowl": {
    es: [{ instruction: "Machaca garbanzos con ajo, comino y harina en una pasta gruesa", measure: "N/A", visual: "La mezcla se mantiene unida al presionar, no está húmeda ni desmoronada" }, { instruction: "Forma pequeñas hamburguesas y fríe en sartén", measure: "3–4 min por lado", visual: "Costra dorada intensa por ambos lados" }],
    fr: [{ instruction: "Écrasez les pois chiches avec ail, cumin et farine en une pâte grossière", measure: "N/A", visual: "Le mélange tient ensemble à la pression, ni humide ni friable" }, { instruction: "Façonnez en petites galettes et poêlez", measure: "3–4 min par face", visual: "Croûte bien dorée des deux côtés" }],
    pt: [{ instruction: "Amasse grão-de-bico com alho, cominho e farinha numa pasta grossa", measure: "N/A", visual: "A mistura se mantém unida ao pressionar, não úmida ou esfarelada" }, { instruction: "Molde em hambúrgueres pequenos e frite na frigideira", measure: "3–4 min de cada lado", visual: "Crosta bem dourada dos dois lados" }],
    hi: [{ instruction: "छोले को लहसुन, जीरा और आटे के साथ मोटे पेस्ट में मैश करें", measure: "लागू नहीं", visual: "दबाने पर मिश्रण साथ रहे, गीला या भुरभुरा नहीं" }, { instruction: "छोटी पैटीज़ बनाएं और पैन में तलें", measure: "हर तरफ 3-4 मिनट", visual: "दोनों तरफ गहरी सुनहरी परत हो" }],
    zh: [{ instruction: "将鹰嘴豆与蒜末、孜然和面粉捣成粗糙的糊状", measure: "不适用", visual: "按压时能保持形状，不湿也不散" }, { instruction: "捏成小饼状并用平底锅煎", measure: "每面3-4分钟", visual: "两面都有深金黄色外壳" }],
    ar: [{ instruction: "اهرس الحمص مع الثوم والكمون والطحين إلى عجينة خشنة", measure: "غير محدد", visual: "يتماسك الخليط عند الضغط، غير رطب أو متفتت" }, { instruction: "شكّله على هيئة أقراص صغيرة واقلها في مقلاة", measure: "3-4 دقائق لكل جانب", visual: "قشرة ذهبية داكنة على الجانبين" }],
  },
  "tabbouleh": {
    es: [{ instruction: "Remoja bulgur en agua caliente hasta que esté tierno", measure: "10–15 min", visual: "Los granos se han ablandado y absorbido la mayor parte del agua" }, { instruction: "Mezcla con perejil picado, tomate y jugo de limón", measure: "N/A", visual: "Las hierbas superan visualmente al grano, verde brillante en todo" }],
    fr: [{ instruction: "Faites tremper le boulgour dans l'eau chaude jusqu'à tendreté", measure: "10–15 min", visual: "Les grains ont ramolli et absorbé la majeure partie de l'eau" }, { instruction: "Mélangez avec persil haché, tomate et jus de citron", measure: "N/A", visual: "Les herbes dominent visuellement le grain, vert vif partout" }],
    pt: [{ instruction: "Deixe o bulgur de molho em água quente até ficar macio", measure: "10–15 min", visual: "Os grãos amoleceram e absorveram a maior parte da água" }, { instruction: "Misture com salsinha picada, tomate e suco de limão", measure: "N/A", visual: "As ervas predominam visualmente sobre o grão, verde vivo por todo lado" }],
    hi: [{ instruction: "बुलगुर को गर्म पानी में नरम होने तक भिगोएं", measure: "10-15 मिनट", visual: "दाने नरम हो गए हों और ज़्यादातर पानी सोख लिया हो" }, { instruction: "कटे हुए अजमोद, टमाटर और नींबू के रस के साथ मिलाएं", measure: "लागू नहीं", visual: "जड़ी-बूटियां दाने से ज़्यादा दिखें, हर जगह चमकीला हरा हो" }],
    zh: [{ instruction: "将布格麦浸泡在热水中至变软", measure: "10-15分钟", visual: "麦粒变软并吸收了大部分水分" }, { instruction: "与切碎的欧芹、番茄和柠檬汁拌匀", measure: "不适用", visual: "香草在视觉上多于谷物，通体呈鲜绿色" }],
    ar: [{ instruction: "انقع البرغل في ماء ساخن حتى يلين", measure: "10-15 دقيقة", visual: "لانت الحبوب وامتصت معظم الماء" }, { instruction: "اخلط مع البقدونس المفروم والطماطم وعصير الليمون", measure: "غير محدد", visual: "تتفوق الأعشاب بصريًا على الحبوب، أخضر زاهٍ في كل مكان" }],
  },
  "chicken-shawarma-bowl": {
    es: [{ instruction: "Marina el pollo en yogur, ajo y especias", measure: "10 min si hay tiempo", visual: "El pollo está completamente cubierto, sin zonas secas" }, { instruction: "Sella hasta que esté chamuscado en zonas y cocido por dentro", measure: "10–12 min", visual: "Bordes marrón intenso, los jugos salen claros" }],
    fr: [{ instruction: "Faites mariner le poulet dans du yaourt, de l'ail et des épices", measure: "10 min si le temps le permet", visual: "Le poulet est entièrement enrobé, sans zones sèches" }, { instruction: "Saisissez jusqu'à ce que ce soit grillé par endroits et cuit à cœur", measure: "10–12 min", visual: "Bords bien bruns, le jus est clair" }],
    pt: [{ instruction: "Marine o frango em iogurte, alho e especiarias", measure: "10 min se der tempo", visual: "O frango está totalmente coberto, sem áreas secas" }, { instruction: "Sele até chamuscar em partes e cozinhar por dentro", measure: "10–12 min", visual: "Bordas marrom intenso, os sucos saem claros" }],
    hi: [{ instruction: "चिकन को दही, लहसुन और मसालों में मैरिनेट करें", measure: "समय हो तो 10 मिनट", visual: "चिकन पूरी तरह लिपटा हो, कोई सूखा हिस्सा न हो" }, { instruction: "जगह-जगह जलने और अंदर तक पकने तक सियर करें", measure: "10-12 मिनट", visual: "किनारे गहरे भूरे हों, रस साफ़ निकले" }],
    zh: [{ instruction: "将鸡肉用酸奶、大蒜和香料腌制", measure: "如有时间腌10分钟", visual: "鸡肉完全裹上腌料，没有干燥的部分" }, { instruction: "煎至局部焦香且内部熟透", measure: "10-12分钟", visual: "边缘呈深棕色，肉汁清澈" }],
    ar: [{ instruction: "تبّل الدجاج في الزبادي والثوم والتوابل", measure: "10 دقائق إن سمح الوقت", visual: "الدجاج مغطى بالكامل، بدون بقع جافة" }, { instruction: "حمّر حتى يتفحم قليلًا في بعض الأماكن وينضج من الداخل", measure: "10-12 دقيقة", visual: "حواف بنية داكنة، العصارة صافية" }],
  },
  "misir-wot": {
    es: [{ instruction: "Cocina la cebolla a fuego medio-bajo, revolviendo con frecuencia, con poco o nada de aceite", measure: "15–20 min", visual: "La cebolla se ha convertido en una pasta suave tipo mermelada — no apresures esta parte, aquí está el sabor" }, { instruction: "Añade ajo y especia berbere, cocina brevemente", measure: "1–2 min", visual: "Aromático, la especia cubre la pasta de cebolla uniformemente" }, { instruction: "Añade lentejas y agua, tapa y cocina a fuego lento, revolviendo cada pocos minutos", measure: "18–20 min", visual: "Las lentejas se han deshecho en un guiso espeso para servir con cuchara — suave pero no puré sólido" }],
    fr: [{ instruction: "Faites cuire l'oignon à feu moyen-doux, en remuant souvent, avec peu ou pas d'huile", measure: "15–20 min", visual: "L'oignon s'est transformé en une pâte douce et confite — ne précipitez pas cette étape, c'est là que naît la saveur" }, { instruction: "Incorporez ail et épice berbéré, cuisez brièvement", measure: "1–2 min", visual: "Parfumé, l'épice enrobe la pâte d'oignon uniformément" }, { instruction: "Ajoutez lentilles et eau, couvrez et laissez mijoter, en remuant toutes les quelques minutes", measure: "18–20 min", visual: "Les lentilles se sont défaites en un ragoût épais à la cuillère — tendre mais pas en purée" }],
    pt: [{ instruction: "Cozinhe a cebola em fogo médio-baixo, mexendo com frequência, com pouco ou nenhum óleo", measure: "15–20 min", visual: "A cebola se transformou numa pasta macia tipo geleia — não apresse essa parte, é onde está o sabor" }, { instruction: "Adicione alho e especiaria berbere, cozinhe brevemente", measure: "1–2 min", visual: "Perfumado, a especiaria cobre a pasta de cebola uniformemente" }, { instruction: "Adicione lentilhas e água, tampe e cozinhe em fogo baixo, mexendo a cada poucos minutos", measure: "18–20 min", visual: "As lentilhas se desfizeram num ensopado grosso de colher — macio mas não um purê sólido" }],
    hi: [{ instruction: "प्याज़ को मध्यम-धीमी आंच पर, बार-बार हिलाते हुए, बहुत कम या बिना तेल के पकाएं", measure: "15-20 मिनट", visual: "प्याज़ नरम, जैम जैसे पेस्ट में बदल गया हो — इसे जल्दी न करें, यहीं से स्वाद आता है" }, { instruction: "लहसुन और बरबरे मसाला डालें, थोड़ी देर पकाएं", measure: "1-2 मिनट", visual: "खुशबूदार, मसाला प्याज़ के पेस्ट पर समान रूप से लिपटा हो" }, { instruction: "दाल और पानी डालें, ढककर धीमी आंच पर पकाएं, हर कुछ मिनट में हिलाते रहें", measure: "18-20 मिनट", visual: "दाल गाढ़े, चम्मच से खाने लायक स्ट्यू में बदल गई हो — नरम लेकिन पूरी तरह मैश नहीं" }],
    zh: [{ instruction: "用中小火煮洋葱，经常搅拌，几乎不放油", measure: "15-20分钟", visual: "洋葱已经化成柔软的果酱状——不要急于这一步，风味就来自这里" }, { instruction: "加入大蒜和柏柏尔香料，稍微煮一下", measure: "1-2分钟", visual: "香气四溢，香料均匀裹住洋葱糊" }, { instruction: "加入扁豆和水，加盖焖煮，每隔几分钟搅拌一次", measure: "18-20分钟", visual: "扁豆已经化成浓稠可用勺舀的炖菜——软烂但不是完全糊状" }],
    ar: [{ instruction: "اطبخ البصل على نار متوسطة منخفضة، مع التحريك المتكرر، بقليل من الزيت أو بدونه", measure: "15-20 دقيقة", visual: "تحوّل البصل إلى معجون طري أشبه بالمربى — لا تستعجل هذه الخطوة فهي مصدر النكهة" }, { instruction: "أضف الثوم وتوابل البربري، اطبخ لفترة قصيرة", measure: "1-2 دقيقة", visual: "عطر فوّاح، تغطي التوابل معجون البصل بالتساوي" }, { instruction: "أضف العدس والماء، غطِّ واتركه ينضج، مع التحريك كل بضع دقائق", measure: "18-20 دقيقة", visual: "تفكك العدس إلى يخنة سميكة تُؤكل بالملعقة — طرية لكن ليست هريسة صلبة" }],
  },
  "spanish-tortilla": {
    es: [{ instruction: "Cocina papa y cebolla en rodajas finas en aceite hasta que estén suaves", measure: "12–15 min a fuego bajo", visual: "Las papas están lo bastante tiernas para romperse con una cuchara, sin dorarse" }, { instruction: "Mezcla con huevos batidos y cocina en la sartén, volteando una vez", measure: "4–5 min por lado", visual: "Cuajada por fuera, aún un poco suave en el centro" }],
    fr: [{ instruction: "Cuisez la pomme de terre et l'oignon finement tranchés dans l'huile jusqu'à tendreté", measure: "12–15 min à feu doux", visual: "Les pommes de terre sont assez tendres pour être écrasées à la cuillère, sans dorer" }, { instruction: "Mélangez aux œufs battus et cuisez dans la poêle, en retournant une fois", measure: "4–5 min par face", visual: "Pris à l'extérieur, encore un peu mou au centre" }],
    pt: [{ instruction: "Cozinhe batata e cebola em fatias finas no óleo até ficarem macias", measure: "12–15 min em fogo baixo", visual: "As batatas estão macias o suficiente para quebrar com uma colher, sem dourar" }, { instruction: "Misture com ovos batidos e cozinhe na frigideira, virando uma vez", measure: "4–5 min de cada lado", visual: "Firme por fora, ainda um pouco mole no centro" }],
    hi: [{ instruction: "पतले कटे आलू और प्याज़ को तेल में नरम होने तक पकाएं", measure: "धीमी आंच पर 12-15 मिनट", visual: "आलू इतने नरम हों कि चम्मच से टूट जाएं, सुनहरे नहीं" }, { instruction: "फेंटे हुए अंडों में मिलाएं और पैन में पकाएं, एक बार पलटें", measure: "हर तरफ 4-5 मिनट", visual: "बाहर से सेट हो, बीच में अभी भी थोड़ा नरम" }],
    zh: [{ instruction: "将切薄的土豆和洋葱用油煮软", measure: "小火12-15分钟", visual: "土豆软到可以用勺子压碎，但不要变焦黄" }, { instruction: "与打散的鸡蛋混合，在锅中煎制，翻面一次", measure: "每面4-5分钟", visual: "外部凝固，中心仍略软" }],
    ar: [{ instruction: "اطبخ البطاطا والبصل المقطعين رفيعًا بالزيت حتى يلينا", measure: "12-15 دقيقة على نار هادئة", visual: "البطاطا طرية بما يكفي لتتفتت بالملعقة، دون أن تصبح ذهبية" }, { instruction: "اخلطها مع البيض المخفوق واطبخها في المقلاة، مع القلب مرة واحدة", measure: "4-5 دقائق لكل جانب", visual: "متماسكة من الخارج، لا تزال طرية قليلًا في المنتصف" }],
  },
  "garlic-shrimp": {
    es: [{ instruction: "Calienta suavemente el ajo y las hojuelas de chile en aceite de oliva", measure: "1–2 min", visual: "El ajo se vuelve dorado claro, el aceite está fragante" }, { instruction: "Añade los camarones y cocina hasta que estén apenas rosados", measure: "2–3 min por lado", visual: "Los camarones se curvan en forma de C floja, opacos por dentro" }],
    fr: [{ instruction: "Chauffez doucement l'ail et les flocons de piment dans l'huile d'olive", measure: "1–2 min", visual: "L'ail devient doré clair, l'huile est parfumée" }, { instruction: "Ajoutez les crevettes et cuisez jusqu'à ce qu'elles soient juste roses", measure: "2–3 min par face", visual: "Les crevettes s'enroulent en C lâche, opaques à cœur" }],
    pt: [{ instruction: "Aqueça suavemente o alho e as flocos de pimenta no azeite", measure: "1–2 min", visual: "O alho fica dourado claro, o óleo está perfumado" }, { instruction: "Adicione o camarão e cozinhe até ficar rosado", measure: "2–3 min de cada lado", visual: "Os camarões se curvam em C frouxo, opacos por dentro" }],
    hi: [{ instruction: "जैतून के तेल में लहसुन और मिर्च के फ्लेक्स धीरे से गर्म करें", measure: "1-2 मिनट", visual: "लहसुन हल्का सुनहरा हो जाए, तेल खुशबूदार हो" }, { instruction: "झींगा डालें और गुलाबी होने तक पकाएं", measure: "हर तरफ 2-3 मिनट", visual: "झींगे ढीले C आकार में मुड़ें, अंदर तक अपारदर्शी हों" }],
    zh: [{ instruction: "在橄榄油中轻轻加热蒜末和辣椒碎", measure: "1-2分钟", visual: "大蒜变浅金色，油散发香气" }, { instruction: "加入虾并煮至刚变粉色", measure: "每面2-3分钟", visual: "虾卷成松散的C形，内部不透明" }],
    ar: [{ instruction: "سخّن الثوم ورقائق الفلفل الحار برفق في زيت الزيتون", measure: "1-2 دقيقة", visual: "يصبح الثوم ذهبيًا فاتحًا، الزيت عطر" }, { instruction: "أضف الجمبري واطبخه حتى يصبحورديًا فقط", measure: "2-3 دقائق لكل جانب", visual: "يتقوس الجمبري بشكل حرف C فضفاض، معتم من الداخل" }],
  },
  "brazilian-black-bean-stew": {
    es: [{ instruction: "Dora salchicha en rodajas con cebolla y ajo", measure: "6–7 min", visual: "La salchicha tiene buen color en los bordes cortados" }, { instruction: "Añade frijoles y cocina a fuego lento hasta espesar", measure: "15 min", visual: "El guiso cubre el dorso de una cuchara, no está aguado" }],
    fr: [{ instruction: "Faites dorer la saucisse tranchée avec l'oignon et l'ail", measure: "6–7 min", visual: "La saucisse a une belle couleur sur les tranches" }, { instruction: "Ajoutez les haricots et laissez mijoter jusqu'à épaississement", measure: "15 min", visual: "Le ragoût nappe le dos d'une cuillère, pas liquide" }],
    pt: [{ instruction: "Doure a linguiça fatiada com cebola e alho", measure: "6–7 min", visual: "A linguiça tem boa cor nas bordas cortadas" }, { instruction: "Adicione o feijão e cozinhe em fogo baixo até engrossar", measure: "15 min", visual: "O ensopado cobre o dorso de uma colher, não está aguado" }],
    hi: [{ instruction: "कटे हुए सॉसेज को प्याज़ और लहसुन के साथ भूनें", measure: "6-7 मिनट", visual: "सॉसेज के कटे किनारों पर अच्छा रंग हो" }, { instruction: "बीन्स डालें और गाढ़ा होने तक धीमी आंच पर पकाएं", measure: "15 मिनट", visual: "स्ट्यू चम्मच के पीछे को ढके, पतला नहीं" }],
    zh: [{ instruction: "将香肠片与洋葱和大蒜一起炒香", measure: "6-7分钟", visual: "香肠切面呈现良好色泽" }, { instruction: "加入豆子煨煮至浓稠", measure: "15分钟", visual: "炖菜能挂在勺背上，不稀" }],
    ar: [{ instruction: "حمّر النقانق المقطعة مع البصل والثوم", measure: "6-7 دقائق", visual: "للنقانق لون جيد عند حواف القطع" }, { instruction: "أضف الفاصولياء واتركها تنضج حتى تتكاثف", measure: "15 دقيقة", visual: "يغطي اليخنة ظهر الملعقة، وليس مائيًا" }],
  },
  "turkey-chili": {
    es: [{ instruction: "Dora el pavo molido con cebolla", measure: "6–7 min", visual: "No queda rosado, ligeramente dorado" }, { instruction: "Añade tomates, frijoles y sazonador de chili, cocina a fuego lento", measure: "20 min", visual: "El chili se ha espesado y oscurecido" }],
    fr: [{ instruction: "Faites dorer la dinde hachée avec l'oignon", measure: "6–7 min", visual: "Plus aucune trace rose, légèrement doré" }, { instruction: "Ajoutez tomates, haricots et assaisonnement à chili, laissez mijoter", measure: "20 min", visual: "Le chili a épaissi et foncé" }],
    pt: [{ instruction: "Doure a carne moída de peru com cebola", measure: "6–7 min", visual: "Sem rosa restante, levemente dourado" }, { instruction: "Adicione tomates, feijão e tempero de chili, cozinhe em fogo baixo", measure: "20 min", visual: "O chili engrossou e escureceu" }],
    hi: [{ instruction: "कीमा और प्याज़ को भूनें", measure: "6-7 मिनट", visual: "कोई गुलाबीपन न बचे, हल्का भूरा हो" }, { instruction: "टमाटर, बीन्स और चिली सीज़निंग डालें, धीमी आंच पर पकाएं", measure: "20 मिनट", visual: "चिली गाढ़ा और गहरे रंग का हो गया हो" }],
    zh: [{ instruction: "将火鸡肉末与洋葱一起炒香", measure: "6-7分钟", visual: "没有粉色残留，微微焦黄" }, { instruction: "加入番茄、豆子和辣椒调料，煨煮", measure: "20分钟", visual: "辣肉酱已变浓稠且颜色加深" }],
    ar: [{ instruction: "حمّر لحم الديك الرومي المفروم مع البصل", measure: "6-7 دقائق", visual: "بلا لون وردي متبقٍ، محمر خفيفًا" }, { instruction: "أضف الطماطم والفاصولياء وتوابل التشيلي، اتركه ينضج", measure: "20 دقيقة", visual: "تكاثف التشيلي وأصبح داكنًا" }],
  },
  "baked-sweet-potato": {
    es: [{ instruction: "Pincha el camote varias veces con un tenedor", measure: "N/A", visual: "La piel tiene varias perforaciones pequeñas" }, { instruction: "Hornea hasta que esté completamente tierno", measure: "40–45 min a 400°F", visual: "Un tenedor se desliza sin resistencia" }],
    fr: [{ instruction: "Piquez la patate douce plusieurs fois avec une fourchette", measure: "N/A", visual: "La peau a plusieurs petites perforations" }, { instruction: "Faites cuire au four jusqu'à tendreté complète", measure: "40–45 min à 200°C", visual: "Une fourchette y glisse sans résistance" }],
    pt: [{ instruction: "Fure a batata-doce algumas vezes com um garfo", measure: "N/A", visual: "A casca tem várias perfurações pequenas" }, { instruction: "Asse até ficar totalmente macia", measure: "40–45 min a 200°C", visual: "Um garfo desliza sem resistência" }],
    hi: [{ instruction: "शकरकंद को कांटे से कुछ बार छेदें", measure: "लागू नहीं", visual: "त्वचा पर कई छोटे छेद हों" }, { instruction: "पूरी तरह नरम होने तक बेक करें", measure: "400°F पर 40-45 मिनट", visual: "कांटा बिना प्रतिरोध के अंदर चला जाए" }],
    zh: [{ instruction: "用叉子在红薯上戳几个孔", measure: "不适用", visual: "表皮有几个小孔" }, { instruction: "烤至完全软透", measure: "400°F烤40-45分钟", visual: "叉子插入毫无阻力" }],
    ar: [{ instruction: "اثقب البطاطا الحلوة عدة مرات بالشوكة", measure: "غير محدد", visual: "للقشرة عدة ثقوب صغيرة" }, { instruction: "اخبزها حتى تصبح طرية تمامًا", measure: "40-45 دقيقة على 400 فهرنهايت", visual: "تنزلق الشوكة بدون مقاومة" }],
  },
  "chicken-caesar-wrap": {
    es: [{ instruction: "Mezcla pollo cocido en rodajas y lechuga romana con aderezo", measure: "N/A", visual: "Las hojas están cubiertas uniformemente, no secas ni empapadas" }, { instruction: "Rellena la tortilla y enrolla firmemente", measure: "N/A", visual: "El wrap se mantiene unido sin romperse" }],
    fr: [{ instruction: "Mélangez le poulet cuit tranché et la romaine avec la vinaigrette", measure: "N/A", visual: "Les feuilles sont uniformément enrobées, ni sèches ni détrempées" }, { instruction: "Garnissez la tortilla et roulez serré", measure: "N/A", visual: "Le wrap tient ensemble sans se fendre" }],
    pt: [{ instruction: "Misture frango cozido fatiado e alface romana com o molho", measure: "N/A", visual: "As folhas estão uniformemente cobertas, nem secas nem encharcadas" }, { instruction: "Recheie a tortilha e enrole firme", measure: "N/A", visual: "O wrap se mantém unido sem rachar" }],
    hi: [{ instruction: "कटे हुए पके चिकन और रोमेन लेट्यूस को ड्रेसिंग के साथ मिलाएं", measure: "लागू नहीं", visual: "पत्तियां समान रूप से लिपटी हों, सूखी या गीली नहीं" }, { instruction: "टॉर्टिला भरें और कसकर रोल करें", measure: "लागू नहीं", visual: "रैप बिना टूटे साथ रहे" }],
    zh: [{ instruction: "将切片熟鸡肉和罗马生菜与调味汁拌匀", measure: "不适用", visual: "叶子均匀裹汁，不干燥也不湿软" }, { instruction: "填入薄饼并卷紧", measure: "不适用", visual: "卷饼保持完整不裂开" }],
    ar: [{ instruction: "اخلط شرائح الدجاج المطهو والخس الروماني مع التتبيلة", measure: "غير محدد", visual: "الأوراق مغطاة بالتساوي، غير جافة أو مبللة" }, { instruction: "املأ التورتيا ولفّها بإحكام", measure: "غير محدد", visual: "تبقى اللفافة متماسكة دون تشقق" }],
  },
  "veggie-omelette": {
    es: [{ instruction: "Sofríe pimiento y cebolla hasta que estén suaves", measure: "3–4 min", visual: "Los vegetales están tiernos, no crudos y crujientes" }, { instruction: "Vierte huevos batidos, añade queso, dobla cuando cuaje", measure: "3–4 min", visual: "Los huevos apenas cuajados sin parte líquida arriba" }],
    fr: [{ instruction: "Faites revenir poivron et oignon jusqu'à tendreté", measure: "3–4 min", visual: "Les légumes sont tendres, pas croquants et crus" }, { instruction: "Versez les œufs battus, ajoutez le fromage, repliez une fois pris", measure: "3–4 min", visual: "Les œufs sont juste pris sans partie liquide dessus" }],
    pt: [{ instruction: "Refogue pimentão e cebola até amolecerem", measure: "3–4 min", visual: "Os legumes estão macios, não crus e crocantes" }, { instruction: "Despeje os ovos batidos, adicione queijo, dobre quando firmar", measure: "3–4 min", visual: "Os ovos estão apenas firmes sem parte líquida por cima" }],
    hi: [{ instruction: "शिमला मिर्च और प्याज़ को नरम होने तक भूनें", measure: "3-4 मिनट", visual: "सब्ज़ियां नरम हों, कच्ची-कुरकुरी नहीं" }, { instruction: "फेंटे हुए अंडे डालें, चीज़ डालें, सेट होने पर मोड़ें", measure: "3-4 मिनट", visual: "अंडे बस सेट हों, ऊपर कोई तरल भाग न हो" }],
    zh: [{ instruction: "将甜椒和洋葱炒软", measure: "3-4分钟", visual: "蔬菜变软，不是生脆的" }, { instruction: "倒入打散的鸡蛋，加芝士，凝固后对折", measure: "3-4分钟", visual: "鸡蛋刚好凝固，上面没有流动部分" }],
    ar: [{ instruction: "قلِّب الفلفل الحلو والبصل حتى يلينا", measure: "3-4 دقائق", visual: "الخضار طرية، ليست نيئة ومقرمشة" }, { instruction: "اسكب البيض المخفوق، أضف الجبنة، اطوِ عند التماسك", measure: "3-4 دقائق", visual: "البيض متماسك للتو بدون جزء سائل فوقه" }],
  },
  "pb-banana-smoothie": {
    es: [{ instruction: "Licúa plátano, mantequilla de maní, leche y miel hasta que esté suave", measure: "30–60 seg", visual: "No quedan grumos de plátano ni de mantequilla de maní" }],
    fr: [{ instruction: "Mixez banane, beurre de cacahuète, lait et miel jusqu'à consistance lisse", measure: "30–60 sec", visual: "Aucun grumeau de banane ou de beurre de cacahuète" }],
    pt: [{ instruction: "Bata banana, pasta de amendoim, leite e mel até ficar liso", measure: "30–60 seg", visual: "Nenhum grumo de banana ou pasta de amendoim" }],
    hi: [{ instruction: "केला, पीनट बटर, दूध और शहद को चिकना होने तक ब्लेंड करें", measure: "30-60 सेकंड", visual: "केले या पीनट बटर की कोई गुठली न बचे" }],
    zh: [{ instruction: "将香蕉、花生酱、牛奶和蜂蜜搅打至顺滑", measure: "30-60秒", visual: "没有香蕉或花生酱的结块" }],
    ar: [{ instruction: "اخلط الموز وزبدة الفول السوداني والحليب والعسل حتى يصبح ناعمًا", measure: "30-60 ثانية", visual: "لا تتبقى تكتلات من الموز أو زبدة الفول السوداني" }],
  },
  "baked-chicken-thighs": {
    es: [{ instruction: "Frota los muslos de pollo con aceite y sazonador", measure: "N/A", visual: "La piel está cubierta uniformemente, sin zonas desnudas" }, { instruction: "Hornea hasta que la piel esté crujiente y los jugos salgan claros", measure: "30–35 min a 425°F", visual: "La piel es de un dorado intenso y crujiente" }],
    fr: [{ instruction: "Frottez les cuisses de poulet avec l'huile et l'assaisonnement", measure: "N/A", visual: "La peau est uniformément enrobée, sans zones nues" }, { instruction: "Faites cuire au four jusqu'à ce que la peau soit croustillante et le jus clair", measure: "30–35 min à 220°C", visual: "La peau est bien dorée et croquante" }],
    pt: [{ instruction: "Esfregue as coxas de frango com óleo e tempero", measure: "N/A", visual: "A pele está uniformemente coberta, sem áreas nuas" }, { instruction: "Asse até a pele ficar crocante e os sucos saírem claros", measure: "30–35 min a 220°C", visual: "A pele está bem dourada e crocante" }],
    hi: [{ instruction: "चिकन थाइज़ को तेल और सीज़निंग से रगड़ें", measure: "लागू नहीं", visual: "त्वचा समान रूप से लिपटी हो, कोई खाली जगह न हो" }, { instruction: "त्वचा कुरकुरी होने और रस साफ़ निकलने तक बेक करें", measure: "425°F पर 30-35 मिनट", visual: "त्वचा गहरी सुनहरी और कुरकुरी हो" }],
    zh: [{ instruction: "用油和调料揉搓鸡腿肉", measure: "不适用", visual: "鸡皮均匀裹上调料，没有裸露部分" }, { instruction: "烤至鸡皮酥脆、肉汁清澈", measure: "425°F烤30-35分钟", visual: "鸡皮呈深金黄色且酥脆" }],
    ar: [{ instruction: "افرك أفخاذ الدجاج بالزيت والتوابل", measure: "غير محدد", visual: "الجلد مغطى بالتساوي، بدون بقع عارية" }, { instruction: "اخبز حتى يصبح الجلد مقرمشًا والعصارة صافية", measure: "30-35 دقيقة على 425 فهرنهايت", visual: "الجلد ذهبي داكن ومقرمش" }],
  },
  "veggie-quesadilla": {
    es: [{ instruction: "Sofríe pimiento y cebolla hasta que se ablanden", measure: "4 min", visual: "Los vegetales están tiernos con un ligero dorado" }, { instruction: "Coloca capas con queso en una tortilla y cocina hasta dorar", measure: "2–3 min por lado", visual: "El queso está completamente derretido, la tortilla tiene manchas doradas" }],
    fr: [{ instruction: "Faites revenir poivron et oignon jusqu'à tendreté", measure: "4 min", visual: "Les légumes sont tendres avec une légère dorure" }, { instruction: "Superposez avec du fromage dans une tortilla et cuisez jusqu'à dorure", measure: "2–3 min par face", visual: "Le fromage est entièrement fondu, la tortilla a des taches dorées" }],
    pt: [{ instruction: "Refogue pimentão e cebola até amolecerem", measure: "4 min", visual: "Os legumes estão macios com leve douramento" }, { instruction: "Faça camadas com queijo numa tortilha e cozinhe até dourar", measure: "2–3 min de cada lado", visual: "O queijo está totalmente derretido, a tortilha tem manchas douradas" }],
    hi: [{ instruction: "शिमला मिर्च और प्याज़ को नरम होने तक भूनें", measure: "4 मिनट", visual: "सब्ज़ियां नरम हों और हल्की सुनहरी हों" }, { instruction: "टॉर्टिला में चीज़ की परतें बनाएं और सुनहरा होने तक पकाएं", measure: "हर तरफ 2-3 मिनट", visual: "चीज़ पूरी तरह पिघला हो, टॉर्टिला पर सुनहरे धब्बे हों" }],
    zh: [{ instruction: "将甜椒和洋葱炒软", measure: "4分钟", visual: "蔬菜变软并微微焦黄" }, { instruction: "在薄饼中铺上芝士层，煎至金黄", measure: "每面2-3分钟", visual: "芝士完全融化，薄饼出现金棕色斑点" }],
    ar: [{ instruction: "قلِّب الفلفل الحلو والبصل حتى يلينا", measure: "4 دقائق", visual: "الخضار طرية مع اسمرار خفيف" }, { instruction: "رتّب طبقات مع الجبنة في تورتيا واطبخ حتى يصبح ذهبيًا", measure: "2-3 دقائق لكل جانب", visual: "الجبنة ذائبة بالكامل، للتورتيا بقع ذهبية" }],
  },
  "shrimp-tacos": {
    es: [{ instruction: "Sazona los camarones y cocina hasta que estén apenas opacos", measure: "2–3 min por lado", visual: "Los camarones son rosados por completo, sin manchas grises translúcidas" }, { instruction: "Rellena tortillas calientes con camarones, repollo y un chorrito de limón", measure: "N/A", visual: "El repollo se mantiene crujiente y brillante, no marchito" }],
    fr: [{ instruction: "Assaisonnez les crevettes et cuisez jusqu'à ce qu'elles soient juste opaques", measure: "2–3 min par face", visual: "Les crevettes sont roses à cœur, sans zones grises translucides" }, { instruction: "Garnissez des tortillas chaudes de crevettes, chou et un filet de citron vert", measure: "N/A", visual: "Le chou reste croquant et vif, pas flétri" }],
    pt: [{ instruction: "Tempere o camarão e cozinhe até ficar apenas opaco", measure: "2–3 min de cada lado", visual: "Os camarões estão rosados por completo, sem manchas cinzas translúcidas" }, { instruction: "Recheie tortillas quentes com camarão, repolho e um toque de limão", measure: "N/A", visual: "O repolho fica crocante e vibrante, não murcho" }],
    hi: [{ instruction: "झींगे को मसाला लगाएं और बस अपारदर्शी होने तक पकाएं", measure: "हर तरफ 2-3 मिनट", visual: "झींगे पूरी तरह गुलाबी हों, कोई धूसर पारदर्शी धब्बा न हो" }, { instruction: "गर्म टॉर्टिला में झींगा, गोभी और नींबू की एक बूंद भरें", measure: "लागू नहीं", visual: "गोभी कुरकुरी और चमकदार रहे, मुरझाई नहीं" }],
    zh: [{ instruction: "给虾调味并煮至刚好不透明", measure: "每面2-3分钟", visual: "虾全身呈粉色，没有灰色半透明斑点" }, { instruction: "在温热的薄饼中填入虾、卷心菜和一点青柠汁", measure: "不适用", visual: "卷心菜保持爽脆鲜亮，不蔫" }],
    ar: [{ instruction: "تبّل الجمبري واطبخه حتى يصبح معتمًا فقط", measure: "2-3 دقائق لكل جانب", visual: "الجمبري وردي بالكامل، بدون بقع رمادية شفافة" }, { instruction: "املأ التورتيا الدافئة بالجمبري والملفوف ورشة ليمون", measure: "غير محدد", visual: "يبقى الملفوف مقرمشًا وزاهيًا، غير ذابل" }],
  },
  "beef-and-broccoli": {
    es: [{ instruction: "Sella tiras de res en una sartén caliente hasta dorar", measure: "2–3 min", visual: "Costra marrón intensa, aún un poco rosado por dentro" }, { instruction: "Añade brócoli y ajo, saltea", measure: "3–4 min", visual: "El brócoli se vuelve verde brillante, aún crujiente" }, { instruction: "Añade salsa de soya y mezcla para cubrir", measure: "1 min", visual: "La salsa se adhiere uniformemente a todo" }],
    fr: [{ instruction: "Saisissez les lanières de bœuf dans une poêle chaude jusqu'à dorure", measure: "2–3 min", visual: "Croûte bien brune, encore légèrement rosé à l'intérieur" }, { instruction: "Ajoutez brocoli et ail, faites sauter", measure: "3–4 min", visual: "Le brocoli devient vert vif, encore croquant" }, { instruction: "Ajoutez la sauce soja et mélangez pour enrober", measure: "1 min", visual: "La sauce enrobe tout uniformément" }],
    pt: [{ instruction: "Sele tiras de carne numa frigideira quente até dourar", measure: "2–3 min", visual: "Crosta bem marrom, ainda um pouco rosada por dentro" }, { instruction: "Adicione brócolis e alho, refogue", measure: "3–4 min", visual: "O brócolis fica verde vivo, ainda crocante" }, { instruction: "Adicione molho de soja e misture para cobrir", measure: "1 min", visual: "O molho gruda uniformemente em tudo" }],
    hi: [{ instruction: "गर्म पैन में बीफ की पट्टियां सुनहरा होने तक सियर करें", measure: "2-3 मिनट", visual: "गहरी भूरी परत, अंदर अभी भी थोड़ा गुलाबी" }, { instruction: "ब्रोकली और लहसुन डालें, स्टिर फ्राय करें", measure: "3-4 मिनट", visual: "ब्रोकली चमकीली हरी हो जाए, अभी भी कुरकुरी" }, { instruction: "सोया सॉस डालें और लपेटने के लिए मिलाएं", measure: "1 मिनट", visual: "सॉस समान रूप से सब पर चिपके" }],
    zh: [{ instruction: "将牛肉条在热锅中煎至焦黄", measure: "2-3分钟", visual: "表面焦褐，内部仍略带粉色" }, { instruction: "加入西兰花和大蒜，翻炒", measure: "3-4分钟", visual: "西兰花变鲜绿色，仍然爽脆" }, { instruction: "加入酱油拌匀", measure: "1分钟", visual: "酱汁均匀裹住所有食材" }],
    ar: [{ instruction: "حمّر شرائح اللحم في مقلاة ساخنة حتى تصبح بنية", measure: "2-3 دقائق", visual: "قشرة بنية داكنة، لا تزال وردية قليلًا من الداخل" }, { instruction: "أضف البروكلي والثوم، وقلّب سريعًا", measure: "3-4 دقائق", visual: "يتحول البروكلي إلى أخضر زاهٍ، لا يزال مقرمشًا" }, { instruction: "أضف صلصة الصويا وقلّب للتغطية", measure: "دقيقة واحدة", visual: "تلتصق الصلصة بكل شيء بالتساوي" }],
  },
  "caprese-pasta-salad": {
    es: [{ instruction: "Cocina la pasta hasta que esté tierna, luego deja enfriar un poco", measure: "8–9 min", visual: "Tierna con un poco de firmeza, no pastosa" }, { instruction: "Mezcla con tomates cherry cortados por la mitad, mozzarella y albahaca", measure: "N/A", visual: "Los ingredientes están distribuidos uniformemente, no amontonados" }],
    fr: [{ instruction: "Cuisez les pâtes jusqu'à tendreté, puis laissez refroidir légèrement", measure: "8–9 min", visual: "Tendres avec un peu de tenue, pas pâteuses" }, { instruction: "Mélangez avec tomates cerises coupées en deux, mozzarella et basilic", measure: "N/A", visual: "Les ingrédients sont répartis uniformément, pas en amas" }],
    pt: [{ instruction: "Cozinhe o macarrão até ficar macio, depois deixe esfriar um pouco", measure: "8–9 min", visual: "Macio com uma leve firmeza, não empapado" }, { instruction: "Misture com tomate-cereja cortado ao meio, muçarela e manjericão", measure: "N/A", visual: "Os ingredientes estão distribuídos uniformemente, não amontoados" }],
    hi: [{ instruction: "पास्ता को नरम होने तक पकाएं, फिर थोड़ा ठंडा होने दें", measure: "8-9 मिनट", visual: "नरम लेकिन थोड़ी सख्ती के साथ, गूदेदार नहीं" }, { instruction: "आधे कटे चेरी टमाटर, मोज़ेरेला और तुलसी के साथ मिलाएं", measure: "लागू नहीं", visual: "सामग्री समान रूप से फैली हो, गुच्छों में नहीं" }],
    zh: [{ instruction: "将意面煮至软嫩，然后稍微放凉", measure: "8-9分钟", visual: "软嫩带一点嚼劲，不软烂" }, { instruction: "与切半的圣女果、马苏里拉芝士和罗勒拌匀", measure: "不适用", visual: "食材分布均匀，不结块" }],
    ar: [{ instruction: "اطبخ المعكرونة حتى تصبح طرية، ثم اتركها تبرد قليلًا", measure: "8-9 دقائق", visual: "طرية مع قوام خفيف، غير طرية جدًا" }, { instruction: "اخلط مع طماطم كرزية مقطعة نصفين وموزاريلا وريحان", measure: "غير محدد", visual: "المكونات موزعة بالتساوي، غير متكتلة" }],
  },
  "butternut-squash-soup": {
    es: [{ instruction: "Sofríe cebolla y ajo hasta que estén suaves", measure: "4–5 min", visual: "La cebolla está translúcida, no dorada" }, { instruction: "Añade calabaza y caldo, cocina a fuego lento hasta que esté tierna", measure: "20 min", visual: "La calabaza se deshace fácilmente con una cuchara" }, { instruction: "Licúa hasta que esté suave", measure: "1–2 min", visual: "Sin trozos visibles, consistencia sedosa" }],
    fr: [{ instruction: "Faites revenir l'oignon et l'ail jusqu'à tendreté", measure: "4–5 min", visual: "L'oignon est translucide, pas doré" }, { instruction: "Ajoutez la courge et le bouillon, laissez mijoter jusqu'à tendreté", measure: "20 min", visual: "La courge s'écrase facilement à la cuillère" }, { instruction: "Mixez jusqu'à consistance lisse", measure: "1–2 min", visual: "Aucun morceau visible, consistance soyeuse" }],
    pt: [{ instruction: "Refogue cebola e alho até ficarem macios", measure: "4–5 min", visual: "A cebola está translúcida, não dourada" }, { instruction: "Adicione a abóbora e o caldo, cozinhe em fogo baixo até ficar macia", measure: "20 min", visual: "A abóbora se desfaz facilmente com uma colher" }, { instruction: "Bata até ficar liso", measure: "1–2 min", visual: "Sem pedaços visíveis, consistência sedosa" }],
    hi: [{ instruction: "प्याज़ और लहसुन को नरम होने तक भूनें", measure: "4-5 मिनट", visual: "प्याज़ पारदर्शी हो, सुनहरा नहीं" }, { instruction: "स्क्वैश और शोरबा डालें, नरम होने तक धीमी आंच पर पकाएं", measure: "20 मिनट", visual: "स्क्वैश चम्मच से आसानी से टूट जाए" }, { instruction: "चिकना होने तक ब्लेंड करें", measure: "1-2 मिनट", visual: "कोई टुकड़ा न दिखे, रेशमी बनावट" }],
    zh: [{ instruction: "将洋葱和大蒜炒软", measure: "4-5分钟", visual: "洋葱变得半透明，不焦黄" }, { instruction: "加入南瓜和高汤，煨煮至软", measure: "20分钟", visual: "南瓜用勺子轻易压碎" }, { instruction: "搅打至顺滑", measure: "1-2分钟", visual: "没有明显颗粒，丝滑的质地" }],
    ar: [{ instruction: "قلِّب البصل والثوم حتى يلينا", measure: "4-5 دقائق", visual: "البصل شفاف، غير محمر" }, { instruction: "أضف اليقطين والمرق، اتركه ينضج حتى يلين", measure: "20 دقيقة", visual: "يتفتت اليقطين بسهولة بالملعقة" }, { instruction: "اخلطه حتى يصبح ناعمًا", measure: "1-2 دقيقة", visual: "بدون قطع ظاهرة، قوام حريري" }],
  },
  "sausage-and-peppers": {
    es: [{ instruction: "Dora la salchicha en una sartén, luego resérvala", measure: "6–7 min", visual: "Dorado intenso por todos lados" }, { instruction: "Sofríe pimientos y cebolla en la misma sartén", measure: "6–7 min", visual: "Suaves con un ligero chamuscado en los bordes" }, { instruction: "Regresa la salchicha a la sartén y mezcla todo", measure: "1–2 min", visual: "Todo está mezclado uniformemente y caliente" }],
    fr: [{ instruction: "Faites dorer la saucisse dans une poêle, puis réservez", measure: "6–7 min", visual: "Bien dorée de tous côtés" }, { instruction: "Faites revenir poivrons et oignon dans la même poêle", measure: "6–7 min", visual: "Ramollis avec un léger grillé sur les bords" }, { instruction: "Remettez la saucisse dans la poêle et mélangez le tout", measure: "1–2 min", visual: "Tout est mélangé uniformément et réchauffé" }],
    pt: [{ instruction: "Doure a linguiça numa frigideira, depois reserve", measure: "6–7 min", visual: "Bem dourada de todos os lados" }, { instruction: "Refogue pimentões e cebola na mesma frigideira", measure: "6–7 min", visual: "Amolecidos com leve chamuscado nas bordas" }, { instruction: "Volte a linguiça para a frigideira e misture tudo", measure: "1–2 min", visual: "Tudo está misturado uniformemente e aquecido" }],
    hi: [{ instruction: "पैन में सॉसेज भूनें, फिर अलग रखें", measure: "6-7 मिनट", visual: "सभी तरफ गहरा सुनहरा हो" }, { instruction: "उसी पैन में शिमला मिर्च और प्याज़ भूनें", measure: "6-7 मिनट", visual: "नरम हों और किनारों पर हल्का जला हुआ हो" }, { instruction: "सॉसेज को वापस पैन में डालें और साथ मिलाएं", measure: "1-2 मिनट", visual: "सब कुछ समान रूप से मिला और गर्म हो" }],
    zh: [{ instruction: "在锅中将香肠煎香，然后盛出备用", measure: "6-7分钟", visual: "各面呈深金黄色" }, { instruction: "在同一个锅中炒甜椒和洋葱", measure: "6-7分钟", visual: "变软，边缘略带焦香" }, { instruction: "将香肠放回锅中一起翻炒", measure: "1-2分钟", visual: "所有食材均匀混合并热透" }],
    ar: [{ instruction: "حمّر النقانق في مقلاة، ثم ضعها جانبًا", measure: "6-7 دقائق", visual: "ذهبية داكنة من كل الجوانب" }, { instruction: "قلِّب الفلفل والبصل في نفس المقلاة", measure: "6-7 دقائق", visual: "لانت مع احتراق خفيف عند الحواف" }, { instruction: "أعد النقانق إلى المقلاة وقلّب الجميع معًا", measure: "1-2 دقيقة", visual: "كل شيء ممزوج بالتساوي وساخن" }],
  },
  "baked-ziti": {
    es: [{ instruction: "Cocina la pasta hasta que esté apenas al dente", measure: "7 min", visual: "Más firme de lo usual — terminará de cocinarse en el horno" }, { instruction: "Mezcla la pasta con salsa marinara y ricotta, cubre con mozzarella", measure: "N/A", visual: "La mozzarella cubre la superficie uniformemente" }, { instruction: "Hornea hasta que burbujee y esté dorada por encima", measure: "20 min a 400°F", visual: "El queso está completamente derretido con manchas doradas" }],
    fr: [{ instruction: "Cuisez les pâtes juste en dessous d'al dente", measure: "7 min", visual: "Plus fermes que d'habitude — elles finiront de cuire au four" }, { instruction: "Mélangez les pâtes avec la sauce marinara et la ricotta, garnissez de mozzarella", measure: "N/A", visual: "La mozzarella recouvre la surface uniformément" }, { instruction: "Enfournez jusqu'à ce que ça bouillonne et dore sur le dessus", measure: "20 min à 200°C", visual: "Le fromage est entièrement fondu avec des taches dorées" }],
    pt: [{ instruction: "Cozinhe a massa até ficar quase al dente", measure: "7 min", visual: "Mais firme que o normal — vai terminar de cozinhar no forno" }, { instruction: "Misture a massa com molho marinara e ricota, cubra com muçarela", measure: "N/A", visual: "A muçarela cobre a superfície uniformemente" }, { instruction: "Asse até borbulhar e dourar por cima", measure: "20 min a 200°C", visual: "O queijo está totalmente derretido com manchas douradas" }],
    hi: [{ instruction: "पास्ता को थोड़ा कम पकाएं", measure: "7 मिनट", visual: "सामान्य से ज़्यादा सख्त — यह ओवन में पूरा पकेगा" }, { instruction: "पास्ता को मरीनारा और रिकोटा के साथ मिलाएं, ऊपर मोज़ेरेला डालें", measure: "लागू नहीं", visual: "मोज़ेरेला सतह पर समान रूप से फैला हो" }, { instruction: "बुलबुले आने और ऊपर सुनहरा होने तक बेक करें", measure: "400°F पर 20 मिनट", visual: "चीज़ पूरी तरह पिघला हो, सुनहरे धब्बों के साथ" }],
    zh: [{ instruction: "将意面煮至稍欠火候", measure: "7分钟", visual: "比平时更硬——它会在烤箱中继续熟透" }, { instruction: "将意面与番茄肉酱和乳清干酪拌匀，铺上马苏里拉芝士", measure: "不适用", visual: "马苏里拉芝士均匀覆盖表面" }, { instruction: "烤至冒泡且表面金黄", measure: "400°F烤20分钟", visual: "芝士完全融化并带金棕色斑点" }],
    ar: [{ instruction: "اطبخ المعكرونة حتى تصبح أقل نضجًا من المعتاد قليلًا", measure: "7 دقائق", visual: "أكثر صلابة من المعتاد — ستكمل نضجها في الفرن" }, { instruction: "اخلط المعكرونة مع صلصة المارينارا والريكوتا، غطِّ بالموزاريلا", measure: "غير محدد", visual: "تغطي الموزاريلا السطح بالتساوي" }, { instruction: "اخبز حتى يصبح فقاعيًا وذهبيًا من الأعلى", measure: "20 دقيقة على 400 فهرنهايت", visual: "الجبنة ذائبة بالكامل مع بقع ذهبية" }],
  },
  "chickpea-salad-sandwich": {
    es: [{ instruction: "Machaca los garbanzos con mayonesa y apio picado", measure: "N/A", visual: "Mayormente machacado con algo de textura, se mantiene unido al servir" }, { instruction: "Unta sobre el pan", measure: "N/A", visual: "La mezcla llega a cada borde" }],
    fr: [{ instruction: "Écrasez les pois chiches avec la mayonnaise et le céleri en dés", measure: "N/A", visual: "Majoritairement écrasé en gardant un peu de texture, tient ensemble quand on le prélève" }, { instruction: "Étalez sur le pain", measure: "N/A", visual: "Le mélange atteint chaque bord" }],
    pt: [{ instruction: "Amasse o grão-de-bico com maionese e aipo picado", measure: "N/A", visual: "Majoritariamente amassado com alguma textura, mantém-se unido ao pegar" }, { instruction: "Espalhe no pão", measure: "N/A", visual: "A mistura chega a cada borda" }],
    hi: [{ instruction: "छोले को मेयो और कटी हुई सेलेरी के साथ मैश करें", measure: "लागू नहीं", visual: "ज़्यादातर मैश हो लेकिन कुछ बनावट बची रहे, उठाने पर साथ रहे" }, { instruction: "ब्रेड पर फैलाएं", measure: "लागू नहीं", visual: "मिश्रण हर किनारे तक पहुंचे" }],
    zh: [{ instruction: "将鹰嘴豆与蛋黄酱和芹菜丁一起捣碎", measure: "不适用", visual: "大部分捣碎但保留一些质感，舀起时能保持形状" }, { instruction: "涂抹在面包上", measure: "不适用", visual: "混合物覆盖到每个边缘" }],
    ar: [{ instruction: "اهرس الحمص مع المايونيز والكرفس المقطع", measure: "غير محدد", visual: "مهروس في الغالب مع بقاء بعض القوام، يتماسك عند رفعه" }, { instruction: "افرده على الخبز", measure: "غير محدد", visual: "يصل الخليط إلى كل حافة" }],
  },
  "salmon-asparagus-sheet-pan": {
    es: [{ instruction: "Coloca salmón y espárragos en una bandeja con aceite y limón", measure: "N/A", visual: "Todo está en una sola capa, sin superponerse" }, { instruction: "Asa hasta que el salmón se desmenuce fácilmente", measure: "12–15 min a 400°F", visual: "El salmón se deshace con un tenedor, los espárragos están verdes brillantes y tiernos" }],
    fr: [{ instruction: "Disposez saumon et asperges sur une plaque avec huile et citron", measure: "N/A", visual: "Tout est en une seule couche, sans se chevaucher" }, { instruction: "Faites rôtir jusqu'à ce que le saumon s'effeuille facilement", measure: "12–15 min à 200°C", visual: "Le saumon s'effeuille à la fourchette, les asperges sont vert vif et tendres" }],
    pt: [{ instruction: "Arrume salmão e aspargos numa assadeira com óleo e limão", measure: "N/A", visual: "Tudo está numa única camada, sem sobrepor" }, { instruction: "Asse até o salmão desmanchar facilmente", measure: "12–15 min a 200°C", visual: "O salmão desmancha com um garfo, os aspargos estão verde vivo e macios" }],
    hi: [{ instruction: "तेल और नींबू के साथ शीट पैन पर सैल्मन और एस्पैरागस रखें", measure: "लागू नहीं", visual: "सब कुछ एक परत में हो, ओवरलैप न करे" }, { instruction: "सैल्मन के आसानी से टूटने तक भूनें", measure: "400°F पर 12-15 मिनट", visual: "सैल्मन कांटे से टूटे, एस्पैरागस चमकीला हरा और नरम हो" }],
    zh: [{ instruction: "将三文鱼和芦笋摆在烤盘上，淋油和柠檬汁", measure: "不适用", visual: "所有食材摆成单层，不重叠" }, { instruction: "烤至三文鱼容易剥落", measure: "400°F烤12-15分钟", visual: "三文鱼用叉子轻松剥落，芦笋鲜绿软嫩" }],
    ar: [{ instruction: "رتّب السلمون والهليون على صينية مع الزيت والليمون", measure: "غير محدد", visual: "كل شيء في طبقة واحدة، دون تداخل" }, { instruction: "اشوِ حتى يتفتت السلمون بسهولة", measure: "12-15 دقيقة على 400 فهرنهايت", visual: "يتفتت السلمون بالشوكة، الهليون أخضر زاهٍ وطري" }],
  },
  "chia-pudding": {
    es: [{ instruction: "Bate semillas de chía en leche con miel y vainilla", measure: "3 cdas de chía + 1 taza de leche", visual: "Las semillas están distribuidas uniformemente, no acumuladas en el fondo" }, { instruction: "Refrigera hasta que espese", measure: "Toda la noche, o al menos 4 horas", visual: "La mezcla tiene una textura tipo pudín, para comer con cuchara" }],
    fr: [{ instruction: "Fouettez les graines de chia dans le lait avec miel et vanille", measure: "3 c. à s. de chia + 1 tasse de lait", visual: "Les graines sont réparties uniformément, pas amassées au fond" }, { instruction: "Réfrigérez jusqu'à épaississement", measure: "Toute la nuit, ou au moins 4h", visual: "Le mélange a une texture de pudding, à la cuillère" }],
    pt: [{ instruction: "Misture sementes de chia no leite com mel e baunilha", measure: "3 colheres de sopa de chia + 1 xícara de leite", visual: "As sementes estão distribuídas uniformemente, não acumuladas no fundo" }, { instruction: "Leve à geladeira até engrossar", measure: "Durante a noite, ou pelo menos 4 horas", visual: "A mistura tem textura de pudim, para comer de colher" }],
    hi: [{ instruction: "चिया बीज को दूध में शहद और वैनिला के साथ फेंटें", measure: "3 बड़े चम्मच चिया + 1 कप दूध", visual: "बीज समान रूप से फैले हों, तली में जमा न हों" }, { instruction: "गाढ़ा होने तक फ्रिज में रखें", measure: "रात भर, या कम से कम 4 घंटे", visual: "मिश्रण पुडिंग जैसी बनावट का हो, चम्मच से खाने लायक" }],
    zh: [{ instruction: "将奇亚籽与蜂蜜和香草一起搅入牛奶中", measure: "3汤匙奇亚籽 + 1杯牛奶", visual: "籽粒均匀分布，不结块沉底" }, { instruction: "冷藏至变浓稠", measure: "隔夜，或至少4小时", visual: "混合物呈布丁状质地，可用勺舀" }],
    ar: [{ instruction: "اخفق بذور الشيا في الحليب مع العسل والفانيليا", measure: "3 ملاعق كبيرة شيا + كوب حليب", visual: "البذور موزعة بالتساوي، غير متجمعة في القاع" }, { instruction: "ضعه في الثلاجة حتى يتكاثف", measure: "طوال الليل، أو 4 ساعات على الأقل", visual: "المزيج له قوام أشبه بالبودينغ يمكن تناوله بالملعقة" }],
  },
  "air-fryer-chicken-wings": {
    es: [{ instruction: "Seca las alitas completamente, luego mezcla con polvo de hornear y especias", measure: "1 lb de alitas + 1 cda de polvo de hornear", visual: "Las alitas están cubiertas uniformemente, sin zonas húmedas" }, { instruction: "Cocina en freidora de aire en una sola capa, volteando a la mitad", measure: "380°F (193°C), 22-24 min en total", visual: "La piel está dorada intensa y audiblemente crujiente" }],
    fr: [{ instruction: "Séchez complètement les ailes, puis mélangez avec levure chimique et épices", measure: "1 lb d'ailes + 1 c. à s. de levure chimique", visual: "Les ailes sont uniformément enrobées, sans zones humides" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en retournant à mi-cuisson", measure: "380°F (193°C), 22-24 min au total", visual: "La peau est bien dorée et audiblement croustillante" }],
    pt: [{ instruction: "Seque as asas completamente, depois misture com fermento e especiarias", measure: "1 lb de asas + 1 colher de sopa de fermento", visual: "As asas estão uniformemente cobertas, sem áreas úmidas" }, { instruction: "Cozinhe na air fryer numa única camada, virando na metade", measure: "380°F (193°C), 22-24 min no total", visual: "A pele está bem dourada e audivelmente crocante" }],
    hi: [{ instruction: "विंग्स को पूरी तरह सुखाएं, फिर बेकिंग पाउडर और मसालों के साथ मिलाएं", measure: "1 पाउंड विंग्स + 1 बड़ा चम्मच बेकिंग पाउडर", visual: "विंग्स समान रूप से लिपटे हों, कोई गीला हिस्सा न हो" }, { instruction: "एयर फ्रायर में एक परत में पकाएं, बीच में पलटें", measure: "380°F (193°C), कुल 22-24 मिनट", visual: "त्वचा गहरी सुनहरी और सुनने लायक कुरकुरी हो" }],
    zh: [{ instruction: "将鸡翅完全擦干，然后与泡打粉和香料拌匀", measure: "1磅鸡翅 + 1汤匙泡打粉", visual: "鸡翅均匀裹上料，没有湿润的斑点" }, { instruction: "在空气炸锅中单层摆放，中途翻面", measure: "380°F（193°C），共22-24分钟", visual: "鸡皮呈深金黄色，能听到清脆的声音" }],
    ar: [{ instruction: "جفف الأجنحة تمامًا، ثم قلّبها مع بيكنغ باودر والتوابل", measure: "1 رطل أجنحة + ملعقة كبيرة بيكنغ باودر", visual: "الأجنحة مغطاة بالتساوي، بدون بقع رطبة" }, { instruction: "اطبخ بالمقلاة الهوائية في طبقة واحدة، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 22-24 دقيقة إجمالًا", visual: "الجلد ذهبي داكن ومقرمش بشكل مسموع" }],
  },
  "air-fryer-chicken-breast": {
    es: [{ instruction: "Frota la pechuga de pollo con aceite y especias por ambos lados", measure: "1 cda de aceite por pechuga", visual: "El sazonador está distribuido uniformemente, sin zonas desnudas" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "380°F (193°C), 16-18 min en total", visual: "La temperatura interna alcanza 165°F, los jugos salen claros" }],
    fr: [{ instruction: "Frottez le blanc de poulet avec huile et épices des deux côtés", measure: "1 c. à s. d'huile par blanc", visual: "L'assaisonnement est réparti uniformément, sans zones nues" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "380°F (193°C), 16-18 min au total", visual: "La température interne atteint 74°C, le jus est clair" }],
    pt: [{ instruction: "Esfregue o peito de frango com óleo e especiarias dos dois lados", measure: "1 colher de sopa de óleo por peito", visual: "O tempero está distribuído uniformemente, sem áreas nuas" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "380°F (193°C), 16-18 min no total", visual: "A temperatura interna atinge 74°C, os sucos saem claros" }],
    hi: [{ instruction: "चिकन ब्रेस्ट को दोनों तरफ तेल और मसालों से रगड़ें", measure: "हर ब्रेस्ट के लिए 1 बड़ा चम्मच तेल", visual: "मसाला समान रूप से फैला हो, कोई खाली जगह न हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), कुल 16-18 मिनट", visual: "अंदर का तापमान 165°F तक पहुंचे, रस साफ़ निकले" }],
    zh: [{ instruction: "将鸡胸肉两面用油和香料揉搓", measure: "每块鸡胸1汤匙油", visual: "调料均匀分布，没有裸露部分" }, { instruction: "空气炸锅烹饪，中途翻面", measure: "380°F（193°C），共16-18分钟", visual: "内部温度达到165°F，肉汁清澈" }],
    ar: [{ instruction: "افرك صدر الدجاج بالزيت والتوابل من الجانبين", measure: "ملعقة كبيرة زيت لكل صدر", visual: "التتبيل موزع بالتساوي، بدون بقع عارية" }, { instruction: "اطبخ بالمقلاة الهوائية، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 16-18 دقيقة إجمالًا", visual: "تصل الحرارة الداخلية إلى 165 فهرنهايت، العصارة صافية" }],
  },
  "air-fryer-chicken-thighs": {
    es: [{ instruction: "Sazona los muslos de pollo con la piel hacia arriba con aceite y especias", measure: "1 cda de aceite en total", visual: "La piel está brillante y sazonada uniformemente" }, { instruction: "Cocina en freidora de aire con la piel hacia arriba hasta que esté crujiente y bien cocido", measure: "380°F (193°C), 20-22 min", visual: "La piel es dorada intensa y crujiente, los jugos salen claros" }],
    fr: [{ instruction: "Assaisonnez les cuisses de poulet côté peau vers le haut avec huile et épices", measure: "1 c. à s. d'huile au total", visual: "La peau est brillante et assaisonnée uniformément" }, { instruction: "Cuisez à la friteuse à air côté peau vers le haut jusqu'à croustillant et cuit à cœur", measure: "380°F (193°C), 20-22 min", visual: "La peau est bien dorée et craquante, le jus est clair" }],
    pt: [{ instruction: "Tempere as coxas de frango com a pele para cima com óleo e especiarias", measure: "1 colher de sopa de óleo no total", visual: "A pele está brilhante e temperada uniformemente" }, { instruction: "Cozinhe na air fryer com a pele para cima até ficar crocante e bem cozida", measure: "380°F (193°C), 20-22 min", visual: "A pele está bem dourada e crocante, os sucos saem claros" }],
    hi: [{ instruction: "चिकन थाइज़ को त्वचा ऊपर की तरफ तेल और मसालों से सीज़न करें", measure: "कुल 1 बड़ा चम्मच तेल", visual: "त्वचा चमकदार और समान रूप से सीज़न हो" }, { instruction: "त्वचा ऊपर रखकर एयर फ्रायर में कुरकुरा और पूरी तरह पकने तक पकाएं", measure: "380°F (193°C), 20-22 मिनट", visual: "त्वचा गहरी सुनहरी और कुरकुरी हो, रस साफ़ निकले" }],
    zh: [{ instruction: "将鸡腿肉皮朝上用油和香料调味", measure: "共1汤匙油", visual: "鸡皮有光泽且均匀调味" }, { instruction: "皮朝上放入空气炸锅烤至酥脆熟透", measure: "380°F（193°C），20-22分钟", visual: "鸡皮呈深金黄色且酥脆，肉汁清澈" }],
    ar: [{ instruction: "تبّل أفخاذ الدجاج بالجلد لأعلى بالزيت والتوابل", measure: "ملعقة كبيرة زيت إجمالًا", visual: "الجلد لامع ومتبل بالتساوي" }, { instruction: "اطبخ بالمقلاة الهوائية بالجلد لأعلى حتى يصبح مقرمشًا وناضجًا", measure: "380 فهرنهايت (193 مئوية)، 20-22 دقيقة", visual: "الجلد ذهبي داكن ومقرمش، العصارة صافية" }],
  },
  "air-fryer-tofu": {
    es: [{ instruction: "Prensa el tofu para eliminar el exceso de agua, luego córtalo en cubos", measure: "15 min de prensado, luego cubos de 1 pulgada", visual: "El tofu se siente firme y seco al tacto" }, { instruction: "Mezcla los cubos con maicena, salsa de soya y aceite de sésamo", measure: "2 cdas de maicena", visual: "Los cubos están ligera y uniformemente cubiertos, no apelmazados" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "390°F (199°C), 15 min", visual: "Los bordes están dorados y crujientes por todas partes" }],
    fr: [{ instruction: "Pressez le tofu pour retirer l'excès d'eau, puis coupez-le en cubes", measure: "15 min de pressage, puis cubes de 2,5 cm", visual: "Le tofu est ferme et sec au toucher" }, { instruction: "Mélangez les cubes avec fécule de maïs, sauce soja et huile de sésame", measure: "2 c. à s. de fécule de maïs", visual: "Les cubes sont légèrement et uniformément enrobés, pas agglutinés" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "390°F (199°C), 15 min", visual: "Les bords sont dorés et croustillants partout" }],
    pt: [{ instruction: "Prense o tofu para remover o excesso de água, depois corte em cubos", measure: "15 min prensando, depois cubos de 2,5 cm", visual: "O tofu está firme e seco ao toque" }, { instruction: "Misture os cubos com amido de milho, molho de soja e óleo de gergelim", measure: "2 colheres de sopa de amido de milho", visual: "Os cubos estão leve e uniformemente cobertos, não grudados" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "390°F (199°C), 15 min", visual: "As bordas estão douradas e crocantes por toda parte" }],
    hi: [{ instruction: "टोफू को अतिरिक्त पानी निकालने के लिए दबाएं, फिर क्यूब्स में काटें", measure: "15 मिनट दबाना, फिर 1 इंच के क्यूब्स", visual: "टोफू छूने पर सख्त और सूखा महसूस हो" }, { instruction: "क्यूब्स को कॉर्नस्टार्च, सोया सॉस और तिल के तेल के साथ मिलाएं", measure: "2 बड़े चम्मच कॉर्नस्टार्च", visual: "क्यूब्स हल्के और समान रूप से लिपटे हों, गुठलियों में नहीं" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "390°F (199°C), 15 मिनट", visual: "किनारे हर जगह सुनहरे और कुरकुरे हों" }],
    zh: [{ instruction: "将豆腐压出多余水分，然后切块", measure: "压15分钟，然后切成1英寸方块", visual: "豆腐摸起来结实干燥" }, { instruction: "将豆腐块与玉米淀粉、酱油和香油拌匀", measure: "2汤匙玉米淀粉", visual: "豆腐块轻薄均匀裹料，不结块" }, { instruction: "放入空气炸锅烹饪，中途摇晃篮子", measure: "390°F（199°C），15分钟", visual: "边缘各处呈金黄色且酥脆" }],
    ar: [{ instruction: "اضغط التوفو لإزالة الماء الزائد، ثم قطّعه مكعبات", measure: "اضغط 15 دقيقة، ثم مكعبات بحجم إنش", visual: "التوفو صلب وجاف عند اللمس" }, { instruction: "قلّب المكعبات مع نشا الذرة وصلصة الصويا وزيت السمسم", measure: "ملعقتان كبيرتان نشا ذرة", visual: "المكعبات مغطاة بخفة وتساوٍ، غير متكتلة" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "390 فهرنهايت (199 مئوية)، 15 دقيقة", visual: "الحواف ذهبية ومقرمشة في كل مكان" }],
  },
  "air-fryer-salmon": {
    es: [{ instruction: "Frota el salmón con aceite, ajo en polvo y un chorrito de limón", measure: "1 cdta de aceite por filete", visual: "La superficie está brillante y cubierta uniformemente" }, { instruction: "Cocina en freidora de aire con la piel hacia abajo hasta que esté apenas cocido", measure: "380°F (193°C), 8-10 min", visual: "Se desmenuza fácilmente con un tenedor, aún húmedo por dentro" }],
    fr: [{ instruction: "Frottez le saumon avec huile, ail en poudre et un filet de citron", measure: "1 c. à c. d'huile par filet", visual: "La surface est brillante et uniformément enrobée" }, { instruction: "Cuisez à la friteuse à air côté peau vers le bas jusqu'à cuisson complète", measure: "380°F (193°C), 8-10 min", visual: "S'effeuille facilement à la fourchette, encore moelleux à l'intérieur" }],
    pt: [{ instruction: "Esfregue o salmão com óleo, alho em pó e um toque de limão", measure: "1 colher de chá de óleo por filé", visual: "A superfície está brilhante e coberta uniformemente" }, { instruction: "Cozinhe na air fryer com a pele para baixo até ficar apenas no ponto", measure: "380°F (193°C), 8-10 min", visual: "Desmancha facilmente com um garfo, ainda úmido por dentro" }],
    hi: [{ instruction: "सैल्मन को तेल, लहसुन पाउडर और नींबू की बूंद से रगड़ें", measure: "हर फिलेट के लिए 1 छोटा चम्मच तेल", visual: "सतह चमकदार और समान रूप से लिपटी हो" }, { instruction: "त्वचा नीचे रखकर एयर फ्रायर में बस पकने तक पकाएं", measure: "380°F (193°C), 8-10 मिनट", visual: "कांटे से आसानी से टूटे, अंदर अभी भी नम हो" }],
    zh: [{ instruction: "将三文鱼用油、蒜粉和一点柠檬汁揉搓", measure: "每片鱼1茶匙油", visual: "表面有光泽且均匀裹料" }, { instruction: "鱼皮朝下放入空气炸锅烤至刚好熟透", measure: "380°F（193°C），8-10分钟", visual: "用叉子轻松剥落，内部仍然湿润" }],
    ar: [{ instruction: "افرك السلمون بالزيت وبودرة الثوم ورشة ليمون", measure: "ملعقة صغيرة زيت لكل شريحة", visual: "السطح لامع ومغطى بالتساوي" }, { instruction: "اطبخ بالمقلاة الهوائية بالجانب الجلدي لأسفل حتى ينضج للتو", measure: "380 فهرنهايت (193 مئوية)، 8-10 دقائق", visual: "يتفتت بسهولة بالشوكة، لا يزال رطبًا من الداخل" }],
  },
  "air-fryer-shrimp": {
    es: [{ instruction: "Mezcla los camarones con aceite y especias", measure: "1 cda de aceite por libra", visual: "Los camarones están cubiertos uniformemente, brillantes" }, { instruction: "Cocina en freidora de aire en una sola capa, agitando la canasta a la mitad", measure: "400°F (204°C), 6-7 min", visual: "Los camarones están rosados y curvados en forma de C floja" }],
    fr: [{ instruction: "Mélangez les crevettes avec huile et épices", measure: "1 c. à s. d'huile par livre", visual: "Les crevettes sont uniformément enrobées, brillantes" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en secouant le panier à mi-cuisson", measure: "400°F (204°C), 6-7 min", visual: "Les crevettes sont roses et enroulées en C lâche" }],
    pt: [{ instruction: "Misture o camarão com óleo e especiarias", measure: "1 colher de sopa de óleo por libra", visual: "O camarão está uniformemente coberto, brilhante" }, { instruction: "Cozinhe na air fryer numa única camada, sacudindo a cesta na metade", measure: "400°F (204°C), 6-7 min", visual: "O camarão está rosado e curvado em C frouxo" }],
    hi: [{ instruction: "झींगे को तेल और मसालों के साथ मिलाएं", measure: "प्रति पाउंड 1 बड़ा चम्मच तेल", visual: "झींगे समान रूप से लिपटे, चमकदार हों" }, { instruction: "एक परत में एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "400°F (204°C), 6-7 मिनट", visual: "झींगे गुलाबी हों और ढीले C आकार में मुड़े हों" }],
    zh: [{ instruction: "将虾与油和香料拌匀", measure: "每磅1汤匙油", visual: "虾均匀裹料，有光泽" }, { instruction: "单层放入空气炸锅，中途摇晃篮子", measure: "400°F（204°C），6-7分钟", visual: "虾呈粉色并卷成松散的C形" }],
    ar: [{ instruction: "قلّب الجمبري مع الزيت والتوابل", measure: "ملعقة كبيرة زيت لكل رطل", visual: "الجمبري مغطى بالتساوي ولامع" }, { instruction: "اطبخه بالمقلاة الهوائية في طبقة واحدة، مع هز السلة في المنتصف", measure: "400 فهرنهايت (204 مئوية)، 6-7 دقائق", visual: "الجمبري وردي ومتقوس بشكل حرف C فضفاض" }],
  },
  "air-fryer-pork-chops": {
    es: [{ instruction: "Frota las chuletas de cerdo con aceite y especias por ambos lados", measure: "1 cda de aceite en total", visual: "El sazonador cubre la superficie uniformemente" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "380°F (193°C), 12-14 min", visual: "La temperatura interna alcanza 145°F, los jugos salen claros" }],
    fr: [{ instruction: "Frottez les côtelettes de porc avec huile et épices des deux côtés", measure: "1 c. à s. d'huile au total", visual: "L'assaisonnement enrobe la surface uniformément" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "380°F (193°C), 12-14 min", visual: "La température interne atteint 63°C, le jus est clair" }],
    pt: [{ instruction: "Esfregue as costeletas de porco com óleo e especiarias dos dois lados", measure: "1 colher de sopa de óleo no total", visual: "O tempero cobre a superfície uniformemente" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "380°F (193°C), 12-14 min", visual: "A temperatura interna atinge 63°C, os sucos saem claros" }],
    hi: [{ instruction: "पोर्क चॉप्स को दोनों तरफ तेल और मसालों से रगड़ें", measure: "कुल 1 बड़ा चम्मच तेल", visual: "मसाला सतह पर समान रूप से फैला हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), 12-14 मिनट", visual: "अंदर का तापमान 145°F तक पहुंचे, रस साफ़ निकले" }],
    zh: [{ instruction: "将猪排两面用油和香料揉搓", measure: "共1汤匙油", visual: "调料均匀覆盖表面" }, { instruction: "空气炸锅烹饪，中途翻面", measure: "380°F（193°C），12-14分钟", visual: "内部温度达到145°F，肉汁清澈" }],
    ar: [{ instruction: "افرك شرائح لحم الخنزير بالزيت والتوابل من الجانبين", measure: "ملعقة كبيرة زيت إجمالًا", visual: "التتبيل يغطي السطح بالتساوي" }, { instruction: "اطبخ بالمقلاة الهوائية، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 12-14 دقيقة", visual: "تصل الحرارة الداخلية إلى 145 فهرنهايت، العصارة صافية" }],
  },
  "air-fryer-steak-bites": {
    es: [{ instruction: "Corta el bistec en cubos pequeños, mezcla con aceite y especias", measure: "Cubos de 1 pulgada", visual: "Los cubos son uniformes en tamaño para cocción pareja" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "400°F (204°C), 8-9 min para término medio", visual: "Costra marrón intensa por fuera" }],
    fr: [{ instruction: "Coupez le steak en petits cubes, mélangez avec huile et épices", measure: "Cubes de 2,5 cm", visual: "Les cubes sont de taille uniforme pour une cuisson égale" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "400°F (204°C), 8-9 min pour à point", visual: "Croûte bien brune à l'extérieur" }],
    pt: [{ instruction: "Corte o bife em cubos pequenos, misture com óleo e especiarias", measure: "Cubos de 2,5 cm", visual: "Os cubos são uniformes em tamanho para cozimento parelho" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "400°F (204°C), 8-9 min para ao ponto", visual: "Crosta bem marrom por fora" }],
    hi: [{ instruction: "स्टेक को छोटे क्यूब्स में काटें, तेल और मसालों के साथ मिलाएं", measure: "1 इंच के क्यूब्स", visual: "समान पकाने के लिए क्यूब्स एक जैसे आकार के हों" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "400°F (204°C), मीडियम के लिए 8-9 मिनट", visual: "बाहर गहरी भूरी परत हो" }],
    zh: [{ instruction: "将牛排切成小方块，与油和香料拌匀", measure: "1英寸方块", visual: "方块大小均匀以便均匀受热" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "400°F（204°C），五分熟8-9分钟", visual: "外部呈深棕色外壳" }],
    ar: [{ instruction: "قطّع الستيك إلى مكعبات صغيرة، قلّب مع الزيت والتوابل", measure: "مكعبات بحجم إنش", visual: "المكعبات متساوية الحجم لطهي متساوٍ" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "400 فهرنهايت (204 مئوية)، 8-9 دقائق للنضج المتوسط", visual: "قشرة بنية داكنة من الخارج" }],
  },
  "air-fryer-turkey-meatballs": {
    es: [{ instruction: "Mezcla pavo molido, pan rallado, huevo y sazonador, forma bolas", measure: "Bolas de 1.5 pulgadas", visual: "La mezcla se mantiene unida sin estar pegajosa" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "380°F (193°C), 12 min", visual: "Dorado por fuera, sin rosado por dentro" }],
    fr: [{ instruction: "Mélangez dinde hachée, chapelure, œuf et assaisonnement, formez des boules", measure: "Boules de 4 cm", visual: "Le mélange tient ensemble sans être collant" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "380°F (193°C), 12 min", visual: "Doré à l'extérieur, aucune trace rose à l'intérieur" }],
    pt: [{ instruction: "Misture peru moído, farinha de rosca, ovo e tempero, forme bolinhas", measure: "Bolinhas de 4 cm", visual: "A mistura se mantém unida sem ficar pegajosa" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "380°F (193°C), 12 min", visual: "Dourado por fora, sem rosa por dentro" }],
    hi: [{ instruction: "कीमा टर्की, ब्रेडक्रंब, अंडा और सीज़निंग मिलाएं, बॉल्स बनाएं", measure: "1.5 इंच की बॉल्स", visual: "मिश्रण चिपचिपा हुए बिना साथ रहे" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "380°F (193°C), 12 मिनट", visual: "बाहर सुनहरा हो, अंदर कोई गुलाबीपन न हो" }],
    zh: [{ instruction: "将火鸡肉末、面包糠、鸡蛋和调料混合，捏成球状", measure: "1.5英寸大小的丸子", visual: "混合物能保持形状且不粘手" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "380°F（193°C），12分钟", visual: "外部金黄，内部没有粉色" }],
    ar: [{ instruction: "اخلط لحم الديك الرومي المفروم وفتات الخبز والبيض والتوابل، شكّلها كرات", measure: "كرات بحجم 1.5 إنش", visual: "يتماسك الخليط دون أن يكون لزجًا" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 12 دقيقة", visual: "ذهبية من الخارج، بدون لون وردي من الداخل" }],
  },
  "air-fryer-broccoli": {
    es: [{ instruction: "Mezcla los floretes de brócoli con aceite y ajo en polvo", measure: "1 cda de aceite por cabeza", visual: "Los floretes están ligeramente cubiertos, no empapados" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "380°F (193°C), 8-9 min", visual: "Los bordes están crujientes y dorados, los tallos aún tiernos" }],
    fr: [{ instruction: "Mélangez les fleurons de brocoli avec huile et ail en poudre", measure: "1 c. à s. d'huile par tête", visual: "Les fleurons sont légèrement enrobés, pas détrempés" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "380°F (193°C), 8-9 min", visual: "Les bords sont croustillants et dorés, les tiges encore tendres" }],
    pt: [{ instruction: "Misture os floretes de brócolis com óleo e alho em pó", measure: "1 colher de sopa de óleo por cabeça", visual: "Os floretes estão levemente cobertos, não encharcados" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "380°F (193°C), 8-9 min", visual: "As bordas estão crocantes e douradas, os talos ainda macios" }],
    hi: [{ instruction: "ब्रोकली के फूलों को तेल और लहसुन पाउडर के साथ मिलाएं", measure: "प्रति सिर 1 बड़ा चम्मच तेल", visual: "फूल हल्के लिपटे हों, गीले नहीं" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "380°F (193°C), 8-9 मिनट", visual: "किनारे कुरकुरे और भूरे हों, डंठल अभी भी नरम हों" }],
    zh: [{ instruction: "将西兰花小朵与油和蒜粉拌匀", measure: "每颗1汤匙油", visual: "小朵轻薄裹料，不软烂" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "380°F（193°C），8-9分钟", visual: "边缘酥脆焦黄，茎部仍然软嫩" }],
    ar: [{ instruction: "قلّب زهيرات البروكلي مع الزيت وبودرة الثوم", measure: "ملعقة كبيرة زيت لكل رأس", visual: "الزهيرات مغطاة بخفة، غير رطبة" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 8-9 دقائق", visual: "الحواف مقرمشة ومحمرة، السيقان لا تزال طرية" }],
  },
  "air-fryer-brussels-sprouts": {
    es: [{ instruction: "Corta las coles de Bruselas por la mitad y mezcla con aceite", measure: "1 cda de aceite por libra", visual: "Los lados cortados están ligeramente cubiertos" }, { instruction: "Cocina en freidora de aire con el lado cortado hacia abajo, agitando a la mitad", measure: "380°F (193°C), 14-16 min", visual: "Las hojas exteriores están crujientes y muy doradas" }],
    fr: [{ instruction: "Coupez les choux de Bruxelles en deux et mélangez avec l'huile", measure: "1 c. à s. d'huile par livre", visual: "Les côtés coupés sont légèrement enrobés" }, { instruction: "Cuisez à la friteuse à air côté coupé vers le bas, en secouant à mi-cuisson", measure: "380°F (193°C), 14-16 min", visual: "Les feuilles extérieures sont croustillantes et bien dorées" }],
    pt: [{ instruction: "Corte as couves de Bruxelas ao meio e misture com óleo", measure: "1 colher de sopa de óleo por libra", visual: "Os lados cortados estão levemente cobertos" }, { instruction: "Cozinhe na air fryer com o lado cortado para baixo, sacudindo na metade", measure: "380°F (193°C), 14-16 min", visual: "As folhas externas estão crocantes e bem douradas" }],
    hi: [{ instruction: "ब्रसेल्स स्प्राउट्स को आधा काटें और तेल के साथ मिलाएं", measure: "प्रति पाउंड 1 बड़ा चम्मच तेल", visual: "कटे हुए हिस्से हल्के लिपटे हों" }, { instruction: "कटा हिस्सा नीचे रखकर एयर फ्रायर में पकाएं, बीच में हिलाएं", measure: "380°F (193°C), 14-16 मिनट", visual: "बाहरी पत्तियां कुरकुरी और गहरी भूरी हों" }],
    zh: [{ instruction: "将抱子甘蓝对半切开，与油拌匀", measure: "每磅1汤匙油", visual: "切面轻薄裹油" }, { instruction: "切面朝下放入空气炸锅，中途摇晃", measure: "380°F（193°C），14-16分钟", visual: "外层叶片酥脆且呈深棕色" }],
    ar: [{ instruction: "قطّع كرنب بروكسل نصفين وقلّبه مع الزيت", measure: "ملعقة كبيرة زيت لكل رطل", visual: "الجوانب المقطوعة مغطاة بخفة" }, { instruction: "اطبخه بالمقلاة الهوائية بالجانب المقطوع لأسفل، مع الهز في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 14-16 دقيقة", visual: "الأوراق الخارجية مقرمشة وبنية داكنة" }],
  },
  "air-fryer-sweet-potato-fries": {
    es: [{ instruction: "Corta el camote en bastones uniformes, mezcla con aceite", measure: "Bastones de 1/4 de pulgada", visual: "Los bastones son uniformes para cocción pareja" }, { instruction: "Cocina en freidora de aire en una sola capa, agitando a la mitad", measure: "380°F (193°C), 15-18 min", visual: "Los bordes están crujientes, los centros tiernos" }],
    fr: [{ instruction: "Coupez la patate douce en bâtonnets réguliers, mélangez avec l'huile", measure: "Bâtonnets de 0,5 cm", visual: "Les bâtonnets sont uniformes pour une cuisson égale" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en secouant à mi-cuisson", measure: "380°F (193°C), 15-18 min", visual: "Les bords sont croustillants, les centres tendres" }],
    pt: [{ instruction: "Corte a batata-doce em palitos uniformes, misture com óleo", measure: "Palitos de 0,5 cm", visual: "Os palitos são uniformes para cozimento parelho" }, { instruction: "Cozinhe na air fryer numa única camada, sacudindo na metade", measure: "380°F (193°C), 15-18 min", visual: "As bordas estão crocantes, os centros macios" }],
    hi: [{ instruction: "शकरकंद को समान तीलियों में काटें, तेल के साथ मिलाएं", measure: "1/4 इंच की तीलियां", visual: "समान पकाने के लिए तीलियां एक जैसी हों" }, { instruction: "एक परत में एयर फ्रायर में पकाएं, बीच में हिलाएं", measure: "380°F (193°C), 15-18 मिनट", visual: "किनारे कुरकुरे हों, बीच नरम हो" }],
    zh: [{ instruction: "将红薯切成均匀的细条，与油拌匀", measure: "1/4英寸的条状", visual: "条状大小均匀以便均匀受热" }, { instruction: "单层放入空气炸锅，中途摇晃", measure: "380°F（193°C），15-18分钟", visual: "边缘酥脆，中心软嫩" }],
    ar: [{ instruction: "قطّع البطاطا الحلوة إلى أعواد متساوية، قلّبها مع الزيت", measure: "أعواد بسماكة ربع إنش", visual: "الأعواد متساوية لطهي متجانس" }, { instruction: "اطبخها بالمقلاة الهوائية في طبقة واحدة، مع الهز في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 15-18 دقيقة", visual: "الحواف مقرمشة، المراكز طرية" }],
  },
  "air-fryer-fries": {
    es: [{ instruction: "Corta las papas en bastones, remoja en agua fría", measure: "20 min de remojo", visual: "El agua se pone turbia por el almidón liberado" }, { instruction: "Seca, mezcla con aceite, cocina en freidora de aire agitando con frecuencia", measure: "380°F (193°C), 18-20 min", visual: "Las papas están doradas y crujientes por fuera" }],
    fr: [{ instruction: "Coupez les pommes de terre en frites, trempez dans l'eau froide", measure: "20 min de trempage", visual: "L'eau devient trouble à cause de l'amidon libéré" }, { instruction: "Séchez, mélangez avec l'huile, cuisez à la friteuse à air en secouant souvent", measure: "380°F (193°C), 18-20 min", visual: "Les frites sont dorées et croustillantes à l'extérieur" }],
    pt: [{ instruction: "Corte as batatas em fritas, deixe de molho em água fria", measure: "20 min de molho", visual: "A água fica turva por causa do amido liberado" }, { instruction: "Seque, misture com óleo, cozinhe na air fryer sacudindo com frequência", measure: "380°F (193°C), 18-20 min", visual: "As fritas estão douradas e crocantes por fora" }],
    hi: [{ instruction: "आलू को फ्राइज़ में काटें, ठंडे पानी में भिगोएं", measure: "20 मिनट भिगोएं", visual: "निकले स्टार्च से पानी धुंधला हो जाए" }, { instruction: "सुखाएं, तेल के साथ मिलाएं, बार-बार हिलाते हुए एयर फ्रायर में पकाएं", measure: "380°F (193°C), 18-20 मिनट", visual: "फ्राइज़ बाहर से सुनहरे और कुरकुरे हों" }],
    zh: [{ instruction: "将土豆切成薯条，浸泡在冷水中", measure: "浸泡20分钟", visual: "水因析出的淀粉变得浑浊" }, { instruction: "擦干，与油拌匀，放入空气炸锅经常摇晃烹饪", measure: "380°F（193°C），18-20分钟", visual: "薯条外部金黄酥脆" }],
    ar: [{ instruction: "قطّع البطاطا إلى أصابع، انقعها في ماء بارد", measure: "نقع 20 دقيقة", visual: "يصبح الماء عكرًا بسبب النشا المنطلق" }, { instruction: "جففها، قلّبها مع الزيت، اطبخها بالمقلاة الهوائية مع الهز كثيرًا", measure: "380 فهرنهايت (193 مئوية)، 18-20 دقيقة", visual: "البطاطا ذهبية ومقرمشة من الخارج" }],
  },
  "air-fryer-zucchini-chips": {
    es: [{ instruction: "Corta el calabacín en rodajas finas, mezcla con aceite y luego pan rallado", measure: "Rodajas de 1/4 de pulgada", visual: "Las rodajas están cubiertas uniformemente con pan rallado" }, { instruction: "Cocina en freidora de aire en una sola capa, volteando a la mitad", measure: "380°F (193°C), 10-12 min", visual: "El pan rallado está dorado y crujiente" }],
    fr: [{ instruction: "Coupez la courgette en fines rondelles, mélangez avec l'huile puis la chapelure", measure: "Rondelles de 0,5 cm", visual: "Les rondelles sont uniformément enrobées de chapelure" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en retournant à mi-cuisson", measure: "380°F (193°C), 10-12 min", visual: "La chapelure est dorée et croustillante" }],
    pt: [{ instruction: "Corte a abobrinha em fatias finas, misture com óleo e depois farinha de rosca", measure: "Fatias de 0,5 cm", visual: "As fatias estão uniformemente cobertas de farinha de rosca" }, { instruction: "Cozinhe na air fryer numa única camada, virando na metade", measure: "380°F (193°C), 10-12 min", visual: "A farinha de rosca está dourada e crocante" }],
    hi: [{ instruction: "तोरी को पतले गोल टुकड़ों में काटें, तेल फिर ब्रेडक्रंब में मिलाएं", measure: "1/4 इंच के गोल टुकड़े", visual: "टुकड़े समान रूप से ब्रेडक्रंब में लिपटे हों" }, { instruction: "एक परत में एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), 10-12 मिनट", visual: "ब्रेडक्रंब सुनहरा और कुरकुरा हो" }],
    zh: [{ instruction: "将西葫芦切成薄圆片，先裹油再裹面包糠", measure: "1/4英寸圆片", visual: "圆片均匀裹上面包糠" }, { instruction: "单层放入空气炸锅，中途翻面", measure: "380°F（193°C），10-12分钟", visual: "面包糠呈金黄酥脆" }],
    ar: [{ instruction: "قطّع الكوسا إلى شرائح رفيعة، قلّبها مع الزيت ثم فتات الخبز", measure: "شرائح بسماكة ربع إنش", visual: "الشرائح مغطاة بالتساوي بفتات الخبز" }, { instruction: "اطبخها بالمقلاة الهوائية في طبقة واحدة، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 10-12 دقيقة", visual: "فتات الخبز ذهبي ومقرمش" }],
  },
  "air-fryer-cauliflower-bites": {
    es: [{ instruction: "Corta la coliflor en floretes pequeños, mezcla con aceite y especias", measure: "1 cda de aceite por cabeza", visual: "Los floretes están ligera y uniformemente cubiertos" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "380°F (193°C), 12-14 min", visual: "Los bordes están dorados intensos y crujientes" }],
    fr: [{ instruction: "Coupez le chou-fleur en petits fleurons, mélangez avec l'huile et les épices", measure: "1 c. à s. d'huile par tête", visual: "Les fleurons sont légèrement et uniformément enrobés" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "380°F (193°C), 12-14 min", visual: "Les bords sont bien dorés et croustillants" }],
    pt: [{ instruction: "Corte a couve-flor em floretes pequenos, misture com óleo e especiarias", measure: "1 colher de sopa de óleo por cabeça", visual: "Os floretes estão leve e uniformemente cobertos" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "380°F (193°C), 12-14 min", visual: "As bordas estão bem douradas e crocantes" }],
    hi: [{ instruction: "फूलगोभी को छोटे फूलों में काटें, तेल और मसालों के साथ मिलाएं", measure: "प्रति सिर 1 बड़ा चम्मच तेल", visual: "फूल हल्के और समान रूप से लिपटे हों" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "380°F (193°C), 12-14 मिनट", visual: "किनारे गहरे सुनहरे और कुरकुरे हों" }],
    zh: [{ instruction: "将花菜切成一口大小的小朵，与油和香料拌匀", measure: "每颗1汤匙油", visual: "小朵轻薄均匀裹料" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "380°F（193°C），12-14分钟", visual: "边缘呈深金黄色且酥脆" }],
    ar: [{ instruction: "قطّع القرنبيط إلى زهيرات صغيرة، قلّبها مع الزيت والتوابل", measure: "ملعقة كبيرة زيت لكل رأس", visual: "الزهيرات مغطاة بخفة وتساوٍ" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 12-14 دقيقة", visual: "الحواف ذهبية داكنة ومقرمشة" }],
  },
  "air-fryer-asparagus": {
    es: [{ instruction: "Recorta los extremos leñosos, mezcla los tallos con aceite", measure: "1 cda de aceite por manojo", visual: "Los tallos están ligeramente brillantes, cubiertos uniformemente" }, { instruction: "Cocina en freidora de aire en una sola capa", measure: "380°F (193°C), 6-7 min", visual: "Verde brillante con puntas ligeramente chamuscadas" }],
    fr: [{ instruction: "Coupez les extrémités ligneuses, mélangez les tiges avec l'huile", measure: "1 c. à s. d'huile par botte", visual: "Les tiges sont légèrement brillantes, enrobées uniformément" }, { instruction: "Cuisez à la friteuse à air en une seule couche", measure: "380°F (193°C), 6-7 min", visual: "Vert vif avec pointes légèrement grillées" }],
    pt: [{ instruction: "Corte as pontas duras, misture os talos com óleo", measure: "1 colher de sopa de óleo por maço", visual: "Os talos estão levemente brilhantes, cobertos uniformemente" }, { instruction: "Cozinhe na air fryer numa única camada", measure: "380°F (193°C), 6-7 min", visual: "Verde vivo com pontas levemente chamuscadas" }],
    hi: [{ instruction: "सख्त सिरे काटें, डंठलों को तेल के साथ मिलाएं", measure: "प्रति गुच्छा 1 बड़ा चम्मच तेल", visual: "डंठल हल्के चमकदार हों, समान रूप से लिपटे हों" }, { instruction: "एक परत में एयर फ्रायर में पकाएं", measure: "380°F (193°C), 6-7 मिनट", visual: "चमकीला हरा, सिरे हल्के जले हुए" }],
    zh: [{ instruction: "修剪老硬的尾部，将芦笋与油拌匀", measure: "每束1汤匙油", visual: "芦笋略有光泽，均匀裹油" }, { instruction: "单层放入空气炸锅", measure: "380°F（193°C），6-7分钟", visual: "呈鲜绿色，尖端略微焦香" }],
    ar: [{ instruction: "قصّ الأطراف الخشبية، قلّب السيقان مع الزيت", measure: "ملعقة كبيرة زيت لكل حزمة", visual: "السيقان لامعة قليلًا ومغطاة بالتساوي" }, { instruction: "اطبخها بالمقلاة الهوائية في طبقة واحدة", measure: "380 فهرنهايت (193 مئوية)، 6-7 دقائق", visual: "أخضر زاهٍ مع أطراف محروقة قليلًا" }],
  },
  "air-fryer-green-beans": {
    es: [{ instruction: "Recorta los extremos, mezcla los ejotes con aceite", measure: "1 cda de aceite por libra", visual: "Los ejotes están ligeramente cubiertos, sin acumular aceite" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "380°F (193°C), 8-9 min", visual: "Los ejotes están verdes brillantes con marcas de chamuscado" }],
    fr: [{ instruction: "Coupez les extrémités, mélangez les haricots verts avec l'huile", measure: "1 c. à s. d'huile par livre", visual: "Les haricots sont légèrement enrobés, sans excès d'huile" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "380°F (193°C), 8-9 min", visual: "Les haricots sont vert vif avec des marques de grillage légères" }],
    pt: [{ instruction: "Corte as pontas, misture a vagem com óleo", measure: "1 colher de sopa de óleo por libra", visual: "A vagem está levemente coberta, sem acumular óleo" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "380°F (193°C), 8-9 min", visual: "A vagem está verde viva com marcas leves de chamuscado" }],
    hi: [{ instruction: "सिरे काटें, हरी फलियों को तेल के साथ मिलाएं", measure: "प्रति पाउंड 1 बड़ा चम्मच तेल", visual: "फलियां हल्की लिपटी हों, तेल जमा न हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "380°F (193°C), 8-9 मिनट", visual: "फलियां चमकीली हरी हों, हल्के जले निशान हों" }],
    zh: [{ instruction: "修剪两端，将四季豆与油拌匀", measure: "每磅1汤匙油", visual: "豆子轻薄裹油，不积油" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "380°F（193°C），8-9分钟", visual: "豆子呈鲜绿色带轻微焦痕" }],
    ar: [{ instruction: "قصّ الأطراف، قلّب الفاصولياء الخضراء مع الزيت", measure: "ملعقة كبيرة زيت لكل رطل", visual: "الفاصولياء مغطاة بخفة، بدون تجمع زيت" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 8-9 دقائق", visual: "الفاصولياء خضراء زاهية مع آثار احتراق خفيفة" }],
  },
  "air-fryer-honey-carrots": {
    es: [{ instruction: "Corta las zanahorias en bastones, mezcla con aceite y miel", measure: "1 cda de miel por libra", visual: "Los bastones están glaseados uniformemente" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "380°F (193°C), 10-12 min", visual: "Los bordes están caramelizados y ligeramente chamuscados" }],
    fr: [{ instruction: "Coupez les carottes en bâtonnets, mélangez avec huile et miel", measure: "1 c. à s. de miel par livre", visual: "Les bâtonnets sont uniformément glacés" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "380°F (193°C), 10-12 min", visual: "Les bords sont caramélisés et légèrement grillés" }],
    pt: [{ instruction: "Corte as cenouras em palitos, misture com óleo e mel", measure: "1 colher de sopa de mel por libra", visual: "Os palitos estão glaceados uniformemente" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "380°F (193°C), 10-12 min", visual: "As bordas estão caramelizadas e levemente chamuscadas" }],
    hi: [{ instruction: "गाजर को तीलियों में काटें, तेल और शहद के साथ मिलाएं", measure: "प्रति पाउंड 1 बड़ा चम्मच शहद", visual: "तीलियां समान रूप से ग्लेज़ हों" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "380°F (193°C), 10-12 मिनट", visual: "किनारे कैरेमलाइज़ और हल्के जले हुए हों" }],
    zh: [{ instruction: "将胡萝卜切条，与油和蜂蜜拌匀", measure: "每磅1汤匙蜂蜜", visual: "条状均匀裹上糖浆" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "380°F（193°C），10-12分钟", visual: "边缘焦糖化并轻微焦香" }],
    ar: [{ instruction: "قطّع الجزر إلى أعواد، قلّبها مع الزيت والعسل", measure: "ملعقة كبيرة عسل لكل رطل", visual: "الأعواد مغطاة بالتساوي بالتتبيلة" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 10-12 دقيقة", visual: "الحواف مكرملة ومحروقة قليلًا" }],
  },
  "air-fryer-mozzarella-sticks": {
    es: [{ instruction: "Congela los palitos de mozzarella, luego cubre con harina, huevo y pan rallado dos veces", measure: "Congela primero 30 min", visual: "El recubrimiento es grueso y cubre completamente el queso" }, { instruction: "Cocina en freidora de aire desde congelado hasta dorar", measure: "390°F (199°C), 6-8 min", visual: "El pan rallado está dorado intenso, el queso apenas comienza a asomarse" }],
    fr: [{ instruction: "Congelez les bâtonnets de mozzarella, puis enrobez de farine, œuf, puis chapelure deux fois", measure: "Congelez d'abord 30 min", visual: "L'enrobage est épais et recouvre entièrement le fromage" }, { instruction: "Cuisez à la friteuse à air depuis surgelé jusqu'à dorure", measure: "390°F (199°C), 6-8 min", visual: "La chapelure est bien dorée, le fromage commence tout juste à apparaître" }],
    pt: [{ instruction: "Congele os palitos de muçarela, depois cubra com farinha, ovo e farinha de rosca duas vezes", measure: "Congele primeiro por 30 min", visual: "O revestimento é grosso e cobre totalmente o queijo" }, { instruction: "Cozinhe na air fryer direto do congelador até dourar", measure: "390°F (199°C), 6-8 min", visual: "A farinha de rosca está bem dourada, o queijo começando a aparecer" }],
    hi: [{ instruction: "मोज़ेरेला स्टिक्स को फ्रीज़ करें, फिर आटे, अंडे, फिर ब्रेडक्रंब में दो बार लपेटें", measure: "पहले 30 मिनट फ्रीज़ करें", visual: "कोटिंग गाढ़ी हो और चीज़ को पूरी तरह ढके" }, { instruction: "जमे हुए से एयर फ्रायर में सुनहरा होने तक पकाएं", measure: "390°F (199°C), 6-8 मिनट", visual: "ब्रेडक्रंब गहरे सुनहरे हों, चीज़ बस झांकना शुरू करे" }],
    zh: [{ instruction: "将马苏里拉芝士条冷冻，然后依次裹面粉、鸡蛋，再裹两次面包糠", measure: "先冷冻30分钟", visual: "裹料层厚实完全包裹芝士" }, { instruction: "从冷冻状态直接放入空气炸锅炸至金黄", measure: "390°F（199°C），6-8分钟", visual: "面包糠呈深金黄色，芝士刚开始渗出" }],
    ar: [{ instruction: "جمّد أصابع الموزاريلا، ثم غطها بالطحين والبيض ثم فتات الخبز مرتين", measure: "جمّدها أولًا 30 دقيقة", visual: "الطبقة سميكة وتغطي الجبنة بالكامل" }, { instruction: "اطبخها بالمقلاة الهوائية من حالة التجميد حتى تصبح ذهبية", measure: "390 فهرنهايت (199 مئوية)، 6-8 دقائق", visual: "فتات الخبز ذهبي داكن، الجبنة بدأت تظهر للتو" }],
  },
  "air-fryer-onion-rings": {
    es: [{ instruction: "Corta la cebolla en aros gruesos, cubre con harina, huevo y luego pan rallado", measure: "Aros de 1/2 pulgada", visual: "El recubrimiento es uniforme sin zonas desnudas" }, { instruction: "Cocina en freidora de aire en una sola capa, volteando a la mitad", measure: "390°F (199°C), 10-12 min", visual: "El recubrimiento está dorado y crujiente" }],
    fr: [{ instruction: "Coupez l'oignon en rondelles épaisses, enrobez de farine, œuf, puis chapelure", measure: "Rondelles de 1,5 cm", visual: "L'enrobage est uniforme sans zones nues" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en retournant à mi-cuisson", measure: "390°F (199°C), 10-12 min", visual: "L'enrobage est doré et croustillant" }],
    pt: [{ instruction: "Corte a cebola em anéis grossos, cubra com farinha, ovo e depois farinha de rosca", measure: "Anéis de 1,5 cm", visual: "O revestimento é uniforme sem áreas nuas" }, { instruction: "Cozinhe na air fryer numa única camada, virando na metade", measure: "390°F (199°C), 10-12 min", visual: "O revestimento está dourado e crocante" }],
    hi: [{ instruction: "प्याज़ को मोटे छल्लों में काटें, आटे, अंडे, फिर ब्रेडक्रंब में लपेटें", measure: "1/2 इंच के छल्ले", visual: "कोटिंग समान हो, कोई खाली जगह न हो" }, { instruction: "एक परत में एयर फ्रायर में पकाएं, बीच में पलटें", measure: "390°F (199°C), 10-12 मिनट", visual: "कोटिंग सुनहरी और कुरकुरी हो" }],
    zh: [{ instruction: "将洋葱切成粗圈，依次裹面粉、鸡蛋，再裹面包糠", measure: "1/2英寸厚的圈", visual: "裹料均匀，没有裸露部分" }, { instruction: "单层放入空气炸锅，中途翻面", measure: "390°F（199°C），10-12分钟", visual: "裹料呈金黄酥脆" }],
    ar: [{ instruction: "قطّع البصل إلى حلقات سميكة، غطها بالطحين والبيض ثم فتات الخبز", measure: "حلقات بسماكة نصف إنش", visual: "الطبقة متساوية بدون بقع عارية" }, { instruction: "اطبخها بالمقلاة الهوائية في طبقة واحدة، مع القلب في المنتصف", measure: "390 فهرنهايت (199 مئوية)، 10-12 دقيقة", visual: "الطبقة ذهبية ومقرمشة" }],
  },
  "air-fryer-chickpeas": {
    es: [{ instruction: "Seca muy bien los garbanzos, mezcla con aceite y especias", measure: "1 cda de aceite por lata", visual: "Los garbanzos están ligeramente cubiertos, no húmedos" }, { instruction: "Cocina en freidora de aire, agitando la canasta con frecuencia", measure: "390°F (199°C), 12-15 min", visual: "Los garbanzos están crujientes y dorados intensos" }],
    fr: [{ instruction: "Séchez très bien les pois chiches, mélangez avec huile et épices", measure: "1 c. à s. d'huile par boîte", visual: "Les pois chiches sont légèrement enrobés, pas humides" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier souvent", measure: "390°F (199°C), 12-15 min", visual: "Les pois chiches sont croustillants et bien dorés" }],
    pt: [{ instruction: "Seque muito bem o grão-de-bico, misture com óleo e especiarias", measure: "1 colher de sopa de óleo por lata", visual: "O grão-de-bico está levemente coberto, não úmido" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta com frequência", measure: "390°F (199°C), 12-15 min", visual: "O grão-de-bico está crocante e bem dourado" }],
    hi: [{ instruction: "छोले को अच्छी तरह सुखाएं, तेल और मसालों के साथ मिलाएं", measure: "प्रति कैन 1 बड़ा चम्मच तेल", visual: "छोले हल्के लिपटे हों, गीले नहीं" }, { instruction: "एयर फ्रायर में पकाएं, बार-बार टोकरी हिलाएं", measure: "390°F (199°C), 12-15 मिनट", visual: "छोले कुरकुरे और गहरे सुनहरे हों" }],
    zh: [{ instruction: "将鹰嘴豆彻底擦干，与油和香料拌匀", measure: "每罐1汤匙油", visual: "鹰嘴豆轻薄裹油，不湿" }, { instruction: "放入空气炸锅，经常摇晃篮子", measure: "390°F（199°C），12-15分钟", visual: "鹰嘴豆酥脆且呈深金黄色" }],
    ar: [{ instruction: "جفف الحمص جيدًا، قلّبه مع الزيت والتوابل", measure: "ملعقة كبيرة زيت لكل علبة", visual: "الحمص مغطى بخفة، غير رطب" }, { instruction: "اطبخه بالمقلاة الهوائية، مع هز السلة كثيرًا", measure: "390 فهرنهايت (199 مئوية)، 12-15 دقيقة", visual: "الحمص مقرمش وذهبي داكن" }],
  },
  "air-fryer-kale-chips": {
    es: [{ instruction: "Rompe la col rizada en trozos, quitando los tallos gruesos, mezcla con aceite", measure: "1 cda de aceite por manojo", visual: "Las hojas están muy ligeramente cubiertas, no empapadas" }, { instruction: "Cocina en freidora de aire en una sola capa, vigilando de cerca", measure: "350°F (177°C), 5-6 min", visual: "Las hojas están crujientes y encogidas, no quemadas" }],
    fr: [{ instruction: "Déchirez le chou frisé en morceaux, en retirant les tiges épaisses, mélangez avec l'huile", measure: "1 c. à s. d'huile par botte", visual: "Les feuilles sont très légèrement enrobées, pas détrempées" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en surveillant de près", measure: "350°F (177°C), 5-6 min", visual: "Les feuilles sont croustillantes et ratatinées, pas brûlées" }],
    pt: [{ instruction: "Rasgue a couve em pedaços, removendo os talos grossos, misture com óleo", measure: "1 colher de sopa de óleo por maço", visual: "As folhas estão muito levemente cobertas, não encharcadas" }, { instruction: "Cozinhe na air fryer numa única camada, observando de perto", measure: "350°F (177°C), 5-6 min", visual: "As folhas estão crocantes e encolhidas, não queimadas" }],
    hi: [{ instruction: "केल को टुकड़ों में फाड़ें, मोटे डंठल हटाएं, तेल के साथ मिलाएं", measure: "प्रति गुच्छा 1 बड़ा चम्मच तेल", visual: "पत्तियां बहुत हल्की लिपटी हों, गीली नहीं" }, { instruction: "एक परत में एयर फ्रायर में पकाएं, ध्यान से देखते रहें", measure: "350°F (177°C), 5-6 मिनट", visual: "पत्तियां कुरकुरी और सिकुड़ी हों, जली नहीं" }],
    zh: [{ instruction: "将羽衣甘蓝撕成小块，去除粗梗，与油拌匀", measure: "每束1汤匙油", visual: "叶片非常轻薄裹油，不软烂" }, { instruction: "单层放入空气炸锅，密切观察", measure: "350°F（177°C），5-6分钟", visual: "叶片酥脆蜷缩，没有烧焦" }],
    ar: [{ instruction: "مزّق الكرنب إلى قطع، وأزل السيقان السميكة، قلّبه مع الزيت", measure: "ملعقة كبيرة زيت لكل حزمة", visual: "الأوراق مغطاة بخفة شديدة، غير رطبة" }, { instruction: "اطبخه بالمقلاة الهوائية في طبقة واحدة، مع المراقبة عن كثب", measure: "350 فهرنهايت (177 مئوية)، 5-6 دقائق", visual: "الأوراق مقرمشة ومنكمشة، غير محروقة" }],
  },
  "air-fryer-bacon": {
    es: [{ instruction: "Coloca las tiras de tocino en una sola capa sin superponer", measure: "N/A", visual: "Las tiras tienen espacio entre ellas" }, { instruction: "Cocina en freidora de aire hasta que esté crujiente", measure: "380°F (193°C), 8-10 min", visual: "Dorado intenso y firme, no flácido" }],
    fr: [{ instruction: "Disposez les tranches de bacon en une seule couche sans chevaucher", measure: "N/A", visual: "Les tranches ont de l'espace entre elles" }, { instruction: "Cuisez à la friteuse à air jusqu'à ce que ce soit croustillant", measure: "380°F (193°C), 8-10 min", visual: "Bien doré et ferme, pas flasque" }],
    pt: [{ instruction: "Coloque as fatias de bacon numa única camada sem sobrepor", measure: "N/A", visual: "As fatias têm espaço entre elas" }, { instruction: "Cozinhe na air fryer até ficar crocante", measure: "380°F (193°C), 8-10 min", visual: "Bem dourado e firme, não mole" }],
    hi: [{ instruction: "बेकन की स्ट्रिप्स को बिना ओवरलैप किए एक परत में रखें", measure: "लागू नहीं", visual: "स्ट्रिप्स के बीच जगह हो" }, { instruction: "कुरकुरा होने तक एयर फ्रायर में पकाएं", measure: "380°F (193°C), 8-10 मिनट", visual: "गहरा सुनहरा और सख्त, ढीला नहीं" }],
    zh: [{ instruction: "将培根条单层摆放，不要重叠", measure: "不适用", visual: "培根条之间留有空隙" }, { instruction: "放入空气炸锅炸至酥脆", measure: "380°F（193°C），8-10分钟", visual: "深金黄色且坚实，不软塌" }],
    ar: [{ instruction: "رتّب شرائح البيكون في طبقة واحدة دون تداخل", measure: "غير محدد", visual: "توجد مسافة بين الشرائح" }, { instruction: "اطبخه بالمقلاة الهوائية حتى يصبح مقرمشًا", measure: "380 فهرنهايت (193 مئوية)، 8-10 دقائق", visual: "ذهبي داكن ومتماسك، غير مترهل" }],
  },
  "air-fryer-hash-browns": {
    es: [{ instruction: "Ralla la papa, exprime el exceso de agua, mezcla con aceite", measure: "Exprime firmemente para eliminar la humedad", visual: "Las ralladuras se sienten mayormente secas" }, { instruction: "Presiona en una hamburguesa plana y cocina en freidora de aire, volteando a la mitad", measure: "380°F (193°C), 14-16 min", visual: "Ambos lados están dorados y crujientes" }],
    fr: [{ instruction: "Râpez la pomme de terre, essorez l'excès d'eau, mélangez avec l'huile", measure: "Pressez fermement pour retirer l'humidité", visual: "Les râpures semblent principalement sèches" }, { instruction: "Pressez en galette plate et cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "380°F (193°C), 14-16 min", visual: "Les deux côtés sont dorés et croustillants" }],
    pt: [{ instruction: "Ralhe a batata, esprema o excesso de água, misture com óleo", measure: "Esprema firmemente para remover a umidade", visual: "Os ralados parecem principalmente secos" }, { instruction: "Pressione num hambúrguer achatado e cozinhe na air fryer, virando na metade", measure: "380°F (193°C), 14-16 min", visual: "Os dois lados estão dourados e crocantes" }],
    hi: [{ instruction: "आलू कद्दूकस करें, अतिरिक्त पानी निचोड़ें, तेल के साथ मिलाएं", measure: "नमी निकालने के लिए मज़बूती से निचोड़ें", visual: "कद्दूकस किया हुआ ज़्यादातर सूखा लगे" }, { instruction: "चपटी पैटी में दबाएं और एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), 14-16 मिनट", visual: "दोनों तरफ सुनहरे और कुरकुरे हों" }],
    zh: [{ instruction: "将土豆擦丝，挤出多余水分，与油拌匀", measure: "用力挤压去除水分", visual: "丝状大多摸起来干燥" }, { instruction: "压成扁平饼状放入空气炸锅，中途翻面", measure: "380°F（193°C），14-16分钟", visual: "两面都金黄酥脆" }],
    ar: [{ instruction: "ابشر البطاطا، اعصر الماء الزائد، قلّبها مع الزيت", measure: "اعصر بقوة لإزالة الرطوبة", visual: "تبدو البشرات جافة في الغالب" }, { instruction: "اضغطها على شكل قرص مسطح واطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 14-16 دقيقة", visual: "الجانبان ذهبيان ومقرمشان" }],
  },
  "air-fryer-eggs": {
    es: [{ instruction: "Coloca huevos enteros directamente en la canasta de la freidora de aire", measure: "N/A", visual: "Los huevos están en una sola capa, no apilados" }, { instruction: "Cocina en freidora de aire, luego pasa directamente a un baño de hielo", measure: "270°F (132°C), 15 min, luego 5 min en baño de hielo", visual: "Las cáscaras se pelan limpiamente una vez fríos" }],
    fr: [{ instruction: "Placez les œufs entiers directement dans le panier de la friteuse à air", measure: "N/A", visual: "Les œufs sont en une seule couche, pas empilés" }, { instruction: "Cuisez à la friteuse à air, puis transférez directement dans un bain de glace", measure: "270°F (132°C), 15 min, puis 5 min de bain de glace", visual: "Les coquilles se retirent proprement une fois refroidis" }],
    pt: [{ instruction: "Coloque ovos inteiros diretamente na cesta da air fryer", measure: "N/A", visual: "Os ovos estão numa única camada, não empilhados" }, { instruction: "Cozinhe na air fryer, depois transfira direto para um banho de gelo", measure: "270°F (132°C), 15 min, depois 5 min de banho de gelo", visual: "As cascas descascam limpas depois de esfriar" }],
    hi: [{ instruction: "साबुत अंडों को सीधे एयर फ्रायर की टोकरी में रखें", measure: "लागू नहीं", visual: "अंडे एक परत में हों, ढेर में नहीं" }, { instruction: "एयर फ्रायर में पकाएं, फिर सीधे बर्फ के पानी में डालें", measure: "270°F (132°C), 15 मिनट, फिर 5 मिनट बर्फ के पानी में", visual: "ठंडा होने पर छिलके साफ़ उतरें" }],
    zh: [{ instruction: "将整个鸡蛋直接放入空气炸锅篮中", measure: "不适用", visual: "鸡蛋单层摆放，不要堆叠" }, { instruction: "空气炸锅烹饪，然后直接放入冰水中", measure: "270°F（132°C），15分钟，然后冰水浸泡5分钟", visual: "冷却后蛋壳很容易剥落" }],
    ar: [{ instruction: "ضع البيض كاملًا مباشرة في سلة المقلاة الهوائية", measure: "غير محدد", visual: "البيض في طبقة واحدة، غير مكدس" }, { instruction: "اطبخه بالمقلاة الهوائية، ثم انقله مباشرة إلى حمام ثلج", measure: "270 فهرنهايت (132 مئوية)، 15 دقيقة، ثم حمام ثلج 5 دقائق", visual: "تُقشر القشرة بسهولة بعد التبريد" }],
  },
  "air-fryer-french-toast-sticks": {
    es: [{ instruction: "Corta el pan en palitos, sumerge en huevo batido, leche y canela", measure: "2 huevos + 1/4 taza de leche", visual: "Los palitos están cubiertos uniformemente, no empapados" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "370°F (188°C), 8-10 min", visual: "Dorado y firme por fuera" }],
    fr: [{ instruction: "Coupez le pain en bâtonnets, trempez dans œuf battu, lait et cannelle", measure: "2 œufs + 1/4 tasse de lait", visual: "Les bâtonnets sont uniformément enrobés, pas détrempés" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "370°F (188°C), 8-10 min", visual: "Doré et ferme à l'extérieur" }],
    pt: [{ instruction: "Corte o pão em palitos, mergulhe em ovo batido, leite e canela", measure: "2 ovos + 1/4 xícara de leite", visual: "Os palitos estão uniformemente cobertos, não encharcados" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "370°F (188°C), 8-10 min", visual: "Dourado e firme por fora" }],
    hi: [{ instruction: "ब्रेड को स्टिक्स में काटें, फेंटे अंडे, दूध और दालचीनी में डुबोएं", measure: "2 अंडे + 1/4 कप दूध", visual: "स्टिक्स समान रूप से लिपटे हों, गीले नहीं" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "370°F (188°C), 8-10 मिनट", visual: "बाहर सुनहरा और सख्त हो" }],
    zh: [{ instruction: "将面包切条，蘸打散的鸡蛋、牛奶和肉桂粉", measure: "2个鸡蛋 + 1/4杯牛奶", visual: "面包条均匀裹料，不湿软" }, { instruction: "放入空气炸锅，中途翻面", measure: "370°F（188°C），8-10分钟", visual: "外部金黄坚实" }],
    ar: [{ instruction: "قطّع الخبز إلى أعواد، اغمسها في بيض مخفوق وحليب وقرفة", measure: "بيضتان + ربع كوب حليب", visual: "الأعواد مغطاة بالتساوي، غير رطبة" }, { instruction: "اطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "370 فهرنهايت (188 مئوية)، 8-10 دقائق", visual: "ذهبية ومتماسكة من الخارج" }],
  },
  "air-fryer-churros": {
    es: [{ instruction: "Lleva a hervor mantequilla y agua, mezcla harina para formar una masa, luego bate huevos", measure: "1/2 taza de mantequilla", visual: "La masa es suave y brillante, se despega de la olla" }, { instruction: "Forma tiras con manga pastelera y cocina en freidora de aire hasta dorar", measure: "380°F (193°C), 10-12 min", visual: "El exterior es firme y dorado intenso" }],
    fr: [{ instruction: "Portez le beurre et l'eau à ébullition, incorporez la farine pour former une pâte, puis battez les œufs", measure: "1/2 tasse de beurre", visual: "La pâte est lisse et brillante, se détache de la casserole" }, { instruction: "Formez des bandes à la poche à douille et cuisez à la friteuse à air jusqu'à dorure", measure: "380°F (193°C), 10-12 min", visual: "L'extérieur est ferme et bien doré" }],
    pt: [{ instruction: "Ferva manteiga e água, misture farinha para formar uma massa, depois bata os ovos", measure: "1/2 xícara de manteiga", visual: "A massa é lisa e brilhante, solta da panela" }, { instruction: "Modele em tiras com saco de confeitar e cozinhe na air fryer até dourar", measure: "380°F (193°C), 10-12 min", visual: "O exterior está firme e bem dourado" }],
    hi: [{ instruction: "मक्खन और पानी उबालें, आटा मिलाकर आटा बनाएं, फिर अंडे फेंटें", measure: "1/2 कप मक्खन", visual: "आटा चिकना और चमकदार हो, पैन से अलग हो" }, { instruction: "पाइपिंग बैग से पट्टियां बनाएं और सुनहरा होने तक एयर फ्रायर में पकाएं", measure: "380°F (193°C), 10-12 मिनट", visual: "बाहर सख्त और गहरा सुनहरा हो" }],
    zh: [{ instruction: "将黄油和水煮沸，拌入面粉形成面团，然后打入鸡蛋搅拌", measure: "1/2杯黄油", visual: "面团顺滑有光泽，能从锅中脱离" }, { instruction: "挤成条状放入空气炸锅炸至金黄", measure: "380°F（193°C），10-12分钟", visual: "外表坚实呈深金黄色" }],
    ar: [{ instruction: "اغلِ الزبدة والماء، أضف الطحين لتكوين عجينة، ثم اخفق البيض فيها", measure: "نصف كوب زبدة", visual: "العجينة ناعمة ولامعة، تنفصل عن المقلاة" }, { instruction: "شكّلها أشرطة بكيس التزيين واطبخها بالمقلاة الهوائية حتى تصبح ذهبية", measure: "380 فهرنهايت (193 مئوية)، 10-12 دقيقة", visual: "الخارج متماسك وذهبي داكن" }],
  },
  "air-fryer-apple-chips": {
    es: [{ instruction: "Corta las manzanas muy finas, espolvorea con canela", measure: "Rodajas de 1/8 de pulgada", visual: "Las rodajas son uniformemente finas y translúcidas en los bordes" }, { instruction: "Cocina en freidora de aire en una sola capa, volteando a la mitad", measure: "330°F (166°C), 12-15 min", visual: "Los bordes están secos y ligeramente curvados, no demasiado dorados" }],
    fr: [{ instruction: "Coupez les pommes très finement, saupoudrez de cannelle", measure: "Tranches de 3 mm", visual: "Les tranches sont uniformément fines et translucides sur les bords" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en retournant à mi-cuisson", measure: "330°F (166°C), 12-15 min", visual: "Les bords sont secs et légèrement recroquevillés, pas trop dorés" }],
    pt: [{ instruction: "Corte as maçãs bem finas, polvilhe com canela", measure: "Fatias de 3 mm", visual: "As fatias são uniformemente finas e translúcidas nas bordas" }, { instruction: "Cozinhe na air fryer numa única camada, virando na metade", measure: "330°F (166°C), 12-15 min", visual: "As bordas estão secas e levemente enroladas, não muito douradas" }],
    hi: [{ instruction: "सेब को बहुत पतला काटें, दालचीनी छिड़कें", measure: "1/8 इंच के टुकड़े", visual: "टुकड़े समान रूप से पतले हों और किनारों पर पारदर्शी हों" }, { instruction: "एक परत में एयर फ्रायर में पकाएं, बीच में पलटें", measure: "330°F (166°C), 12-15 मिनट", visual: "किनारे सूखे और थोड़े मुड़े हों, ज़्यादा भूरे नहीं" }],
    zh: [{ instruction: "将苹果切得非常薄，撒上肉桂粉", measure: "1/8英寸厚的切片", visual: "切片均匀薄透，边缘半透明" }, { instruction: "单层放入空气炸锅，中途翻面", measure: "330°F（166°C），12-15分钟", visual: "边缘干燥并略微卷曲，不要太深的颜色" }],
    ar: [{ instruction: "قطّع التفاح رفيعًا جدًا، رشّه بالقرفة", measure: "شرائح بسماكة ثمن إنش", visual: "الشرائح رفيعة بالتساوي وشفافة عند الحواف" }, { instruction: "اطبخها بالمقلاة الهوائية في طبقة واحدة، مع القلب في المنتصف", measure: "330 فهرنهايت (166 مئوية)، 12-15 دقيقة", visual: "الحواف جافة ومجعدة قليلًا، غير محمرة كثيرًا" }],
  },
  "air-fryer-plantains": {
    es: [{ instruction: "Corta plátanos muy maduros en diagonal, unta con aceite", measure: "Rodajas de 1/2 pulgada", visual: "Los plátanos son negro-amarillentos y suaves al tacto" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "370°F (188°C), 10-12 min", visual: "Los bordes están caramelizados y dorados intensos" }],
    fr: [{ instruction: "Coupez des bananes plantain très mûres en diagonale, badigeonnez d'huile", measure: "Tranches de 1,5 cm", visual: "Les plantains sont jaune-noir et souples au toucher" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "370°F (188°C), 10-12 min", visual: "Les bords sont caramélisés et bien dorés" }],
    pt: [{ instruction: "Corte bananas-da-terra bem maduras na diagonal, pincele com óleo", measure: "Fatias de 1,5 cm", visual: "As bananas-da-terra estão amarelo-pretas e macias ao toque" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "370°F (188°C), 10-12 min", visual: "As bordas estão caramelizadas e bem douradas" }],
    hi: [{ instruction: "बहुत पके प्लांटेन को तिरछा काटें, तेल लगाएं", measure: "1/2 इंच के टुकड़े", visual: "प्लांटेन पीले-काले हों और छूने पर नरम हों" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "370°F (188°C), 10-12 मिनट", visual: "किनारे कैरेमलाइज़ और गहरे सुनहरे हों" }],
    zh: [{ instruction: "将非常成熟的大蕉斜切，刷上油", measure: "1/2英寸厚的切片", visual: "大蕉呈黄黑色，摸起来柔软" }, { instruction: "放入空气炸锅，中途翻面", measure: "370°F（188°C），10-12分钟", visual: "边缘焦糖化并呈深金黄色" }],
    ar: [{ instruction: "قطّع الموز الناضج جدًا بشكل قطري، ادهنه بالزيت", measure: "شرائح بسماكة نصف إنش", visual: "الموز أصفر-أسود وطري عند اللمس" }, { instruction: "اطبخه بالمقلاة الهوائية، مع القلب في المنتصف", measure: "370 فهرنهايت (188 مئوية)، 10-12 دقيقة", visual: "الحواف مكرملة وذهبية داكنة" }],
  },
  "air-fryer-samosas": {
    es: [{ instruction: "Machaca papa cocida con guisantes y curry en polvo para el relleno", measure: "2 tazas de puré de papa", visual: "El relleno se mantiene unido, bien sazonado" }, { instruction: "Dobla el relleno en triángulos de masa, unta con aceite", measure: "N/A", visual: "Los bordes están sellados, sin fuga de relleno" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "380°F (193°C), 12-14 min", visual: "La masa está dorada intensa y hojaldrada" }],
    fr: [{ instruction: "Écrasez la pomme de terre cuite avec les petits pois et le curry en poudre pour la garniture", measure: "2 tasses de purée de pomme de terre", visual: "La garniture tient ensemble, bien assaisonnée" }, { instruction: "Repliez la garniture dans des triangles de pâte, badigeonnez d'huile", measure: "N/A", visual: "Les bords sont scellés, aucune garniture ne fuit" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "380°F (193°C), 12-14 min", visual: "La pâte est bien dorée et feuilletée" }],
    pt: [{ instruction: "Amasse batata cozida com ervilhas e curry em pó para o recheio", measure: "2 xícaras de purê de batata", visual: "O recheio se mantém unido, bem temperado" }, { instruction: "Dobre o recheio em triângulos de massa, pincele com óleo", measure: "N/A", visual: "As bordas estão seladas, sem vazamento de recheio" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "380°F (193°C), 12-14 min", visual: "A massa está bem dourada e folhada" }],
    hi: [{ instruction: "भरावन के लिए पके आलू को मटर और करी पाउडर के साथ मैश करें", measure: "2 कप मैश किया आलू", visual: "भरावन साथ रहे, अच्छी तरह मसालेदार हो" }, { instruction: "भरावन को पेस्ट्री त्रिकोणों में भरें, तेल लगाएं", measure: "लागू नहीं", visual: "किनारे सील हों, कोई भरावन न निकले" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), 12-14 मिनट", visual: "पेस्ट्री गहरी सुनहरी और परतदार हो" }],
    zh: [{ instruction: "将熟土豆与豌豆和咖喱粉捣碎作为馅料", measure: "2杯土豆泥", visual: "馅料能保持形状，调味充分" }, { instruction: "将馅料包入三角形面皮中，刷上油", measure: "不适用", visual: "边缘密封，没有馅料泄漏" }, { instruction: "放入空气炸锅，中途翻面", measure: "380°F（193°C），12-14分钟", visual: "面皮呈深金黄色且酥松" }],
    ar: [{ instruction: "اهرس البطاطا المطهوة مع البازلاء ومسحوق الكاري للحشو", measure: "2 كوب بطاطا مهروسة", visual: "يتماسك الحشو ومتبل جيدًا" }, { instruction: "اطوِ الحشو داخل مثلثات العجين، ادهنها بالزيت", measure: "غير محدد", visual: "الحواف مغلقة بإحكام، بدون تسرب للحشو" }, { instruction: "اطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 12-14 دقيقة", visual: "العجين ذهبي داكن ومقرمش" }],
  },
  "air-fryer-spring-rolls": {
    es: [{ instruction: "Saltea los vegetales hasta que estén apenas tiernos, deja enfriar un poco", measure: "4-5 min", visual: "Los vegetales están suaves pero no pastosos" }, { instruction: "Enrolla el relleno firmemente en las envolturas, unta con aceite", measure: "N/A", visual: "Los rollos están apretados sin espacios" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "370°F (188°C), 10-12 min", visual: "Las envolturas están doradas y crujientes por todas partes" }],
    fr: [{ instruction: "Faites sauter les légumes jusqu'à peine tendres, laissez refroidir légèrement", measure: "4-5 min", visual: "Les légumes sont ramollis mais pas pâteux" }, { instruction: "Roulez la garniture fermement dans les feuilles, badigeonnez d'huile", measure: "N/A", visual: "Les rouleaux sont serrés sans espace" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "370°F (188°C), 10-12 min", visual: "Les feuilles sont dorées et croustillantes partout" }],
    pt: [{ instruction: "Refogue os legumes até apenas amolecerem, deixe esfriar um pouco", measure: "4-5 min", visual: "Os legumes estão amolecidos mas não moles demais" }, { instruction: "Enrole o recheio firmemente nas massas, pincele com óleo", measure: "N/A", visual: "Os rolinhos estão firmes sem espaços" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "370°F (188°C), 10-12 min", visual: "As massas estão douradas e crocantes por toda parte" }],
    hi: [{ instruction: "सब्ज़ियों को बस नरम होने तक स्टिर फ्राय करें, थोड़ा ठंडा होने दें", measure: "4-5 मिनट", visual: "सब्ज़ियां नरम हों लेकिन गूदेदार नहीं" }, { instruction: "भरावन को रैपर में कसकर रोल करें, तेल लगाएं", measure: "लागू नहीं", visual: "रोल कसे हों, कोई गैप न हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "370°F (188°C), 10-12 मिनट", visual: "रैपर हर जगह सुनहरे और कुरकुरे हों" }],
    zh: [{ instruction: "将蔬菜翻炒至刚好变软，稍微放凉", measure: "4-5分钟", visual: "蔬菜变软但不软烂" }, { instruction: "将馅料紧紧卷入春卷皮中，刷上油", measure: "不适用", visual: "卷得紧实没有空隙" }, { instruction: "放入空气炸锅，中途翻面", measure: "370°F（188°C），10-12分钟", visual: "春卷皮各处呈金黄酥脆" }],
    ar: [{ instruction: "قلّب الخضار سريعًا حتى تصبح طرية فقط، دعها تبرد قليلًا", measure: "4-5 دقائق", visual: "الخضار لينة لكن غير طرية جدًا" }, { instruction: "لفّ الحشو بإحكام داخل الأوراق، ادهنها بالزيت", measure: "غير محدد", visual: "اللفائف محكمة بدون فراغات" }, { instruction: "اطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "370 فهرنهايت (188 مئوية)، 10-12 دقيقة", visual: "الأوراق ذهبية ومقرمشة في كل مكان" }],
  },
  "air-fryer-karaage": {
    es: [{ instruction: "Marina trozos de pollo del tamaño de un bocado en salsa de soya y ajo", measure: "20 min mínimo", visual: "El pollo ha absorbido el adobo, un poco más oscuro" }, { instruction: "Mezcla el pollo marinado con maicena, sacudiendo el exceso", measure: "N/A", visual: "Recubrimiento ligero y uniforme sin grumos gruesos" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "390°F (199°C), 12-14 min", visual: "El recubrimiento está crujiente y dorado intenso" }],
    fr: [{ instruction: "Faites mariner des morceaux de poulet en bouchées dans sauce soja et ail", measure: "20 min minimum", visual: "Le poulet a absorbé la marinade, légèrement plus foncé" }, { instruction: "Mélangez le poulet mariné avec la fécule de maïs, en secouant l'excès", measure: "N/A", visual: "Enrobage léger et uniforme sans gros grumeaux" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "390°F (199°C), 12-14 min", visual: "L'enrobage est croustillant et bien doré" }],
    pt: [{ instruction: "Marine pedaços de frango do tamanho de uma mordida em molho de soja e alho", measure: "Mínimo de 20 min", visual: "O frango absorveu a marinada, um pouco mais escuro" }, { instruction: "Misture o frango marinado com amido de milho, sacudindo o excesso", measure: "N/A", visual: "Revestimento leve e uniforme sem grumos grossos" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "390°F (199°C), 12-14 min", visual: "O revestimento está crocante e bem dourado" }],
    hi: [{ instruction: "एक बाइट-साइज़ चिकन के टुकड़ों को सोया सॉस और लहसुन में मैरिनेट करें", measure: "कम से कम 20 मिनट", visual: "चिकन ने मैरिनेड सोख लिया हो, थोड़ा गहरा हो" }, { instruction: "मैरिनेट किया चिकन कॉर्नस्टार्च में लपेटें, अतिरिक्त झाड़ें", measure: "लागू नहीं", visual: "हल्की, समान कोटिंग हो, कोई गाढ़ी गुठली नहीं" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "390°F (199°C), 12-14 मिनट", visual: "कोटिंग कुरकुरी और गहरी सुनहरी हो" }],
    zh: [{ instruction: "将一口大小的鸡肉块用酱油和大蒜腌制", measure: "至少20分钟", visual: "鸡肉吸收了腌料，颜色略深" }, { instruction: "将腌好的鸡肉裹上玉米淀粉，抖掉多余的", measure: "不适用", visual: "裹层轻薄均匀，没有厚重结块" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "390°F（199°C），12-14分钟", visual: "裹层酥脆呈深金黄色" }],
    ar: [{ instruction: "تبّل قطع الدجاج بحجم اللقمة في صلصة الصويا والثوم", measure: "20 دقيقة على الأقل", visual: "امتص الدجاج التتبيلة، أصبح أغمق قليلًا" }, { instruction: "قلّب الدجاج المتبل بنشا الذرة، مع نفض الزائد", measure: "غير محدد", visual: "طبقة خفيفة ومتساوية بدون تكتلات سميكة" }, { instruction: "اطبخه بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "390 فهرنهايت (199 مئوية)، 12-14 دقيقة", visual: "الطبقة مقرمشة وذهبية داكنة" }],
  },
  "air-fryer-falafel": {
    es: [{ instruction: "Procesa garbanzos, ajo, comino y harina en una mezcla gruesa", measure: "N/A", visual: "La mezcla se mantiene unida al presionar, no húmeda" }, { instruction: "Forma hamburguesas pequeñas, unta con aceite", measure: "Hamburguesas de 1.5 pulgadas", visual: "Las hamburguesas mantienen su forma" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "380°F (193°C), 14-16 min", visual: "Costra dorada intensa por ambos lados" }],
    fr: [{ instruction: "Mixez pois chiches, ail, cumin et farine en un mélange grossier", measure: "N/A", visual: "Le mélange tient ensemble à la pression, pas humide" }, { instruction: "Façonnez en petites galettes, badigeonnez d'huile", measure: "Galettes de 4 cm", visual: "Les galettes gardent leur forme" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "380°F (193°C), 14-16 min", visual: "Croûte bien dorée des deux côtés" }],
    pt: [{ instruction: "Processe grão-de-bico, alho, cominho e farinha numa mistura grossa", measure: "N/A", visual: "A mistura se mantém unida ao pressionar, não úmida" }, { instruction: "Molde em hambúrgueres pequenos, pincele com óleo", measure: "Hambúrgueres de 4 cm", visual: "Os hambúrgueres mantêm a forma" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "380°F (193°C), 14-16 min", visual: "Crosta bem dourada dos dois lados" }],
    hi: [{ instruction: "छोले, लहसुन, जीरा और आटे को मोटे मिश्रण में पीसें", measure: "लागू नहीं", visual: "दबाने पर मिश्रण साथ रहे, गीला नहीं" }, { instruction: "छोटी पैटीज़ बनाएं, तेल लगाएं", measure: "1.5 इंच की पैटीज़", visual: "पैटीज़ अपना आकार बनाए रखें" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), 14-16 मिनट", visual: "दोनों तरफ गहरी सुनहरी परत हो" }],
    zh: [{ instruction: "将鹰嘴豆、大蒜、孜然和面粉打成粗糙的混合物", measure: "不适用", visual: "按压时能保持形状，不湿" }, { instruction: "捏成小饼状，刷上油", measure: "1.5英寸大小的饼", visual: "饼状能保持形状" }, { instruction: "放入空气炸锅，中途翻面", measure: "380°F（193°C），14-16分钟", visual: "两面都有深金黄色外壳" }],
    ar: [{ instruction: "اطحن الحمص والثوم والكمون والطحين إلى خليط خشن", measure: "غير محدد", visual: "يتماسك الخليط عند الضغط، غير رطب" }, { instruction: "شكّله على هيئة أقراص صغيرة، ادهنها بالزيت", measure: "أقراص بحجم 1.5 إنش", visual: "تحافظ الأقراص على شكلها" }, { instruction: "اطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 14-16 دقيقة", visual: "قشرة ذهبية داكنة على الجانبين" }],
  },
  "air-fryer-arancini": {
    es: [{ instruction: "Forma arroz tipo risotto enfriado alrededor de un cubo de mozzarella en una bola", measure: "Tamaño de pelota de golf", visual: "El queso está completamente sellado adentro" }, { instruction: "Cubre con huevo y luego pan rallado", measure: "N/A", visual: "Recubrimiento uniforme y completo sin arroz visible" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "380°F (193°C), 12-14 min", visual: "El recubrimiento está dorado y crujiente" }],
    fr: [{ instruction: "Formez le riz façon risotto refroidi autour d'un cube de mozzarella en boule", measure: "Taille d'une balle de golf", visual: "Le fromage est entièrement scellé à l'intérieur" }, { instruction: "Enrobez d'œuf puis de chapelure", measure: "N/A", visual: "Enrobage uniforme et complet sans riz visible" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "380°F (193°C), 12-14 min", visual: "L'enrobage est doré et croustillant" }],
    pt: [{ instruction: "Modele arroz tipo risoto resfriado ao redor de um cubo de muçarela numa bola", measure: "Tamanho de bola de golfe", visual: "O queijo está totalmente selado dentro" }, { instruction: "Cubra com ovo e depois farinha de rosca", measure: "N/A", visual: "Revestimento uniforme e completo sem arroz visível" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "380°F (193°C), 12-14 min", visual: "O revestimento está dourado e crocante" }],
    hi: [{ instruction: "ठंडे रिसोट्टो-स्टाइल चावल को मोज़ेरेला क्यूब के चारों ओर बॉल में बनाएं", measure: "गोल्फ-बॉल आकार", visual: "चीज़ अंदर पूरी तरह सील हो" }, { instruction: "अंडे में फिर ब्रेडक्रंब में लपेटें", measure: "लागू नहीं", visual: "समान, पूरी कोटिंग हो, कोई चावल न दिखे" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "380°F (193°C), 12-14 मिनट", visual: "कोटिंग सुनहरी और कुरकुरी हो" }],
    zh: [{ instruction: "将放凉的意式烩饭围着一块马苏里拉芝士捏成球状", measure: "高尔夫球大小", visual: "芝士完全封闭在里面" }, { instruction: "裹上鸡蛋再裹面包糠", measure: "不适用", visual: "裹层均匀完整，看不到裸露的米饭" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "380°F（193°C），12-14分钟", visual: "裹层呈金黄酥脆" }],
    ar: [{ instruction: "شكّل أرز الريزوتو المبرد حول مكعب موزاريلا على هيئة كرة", measure: "بحجم كرة الغولف", visual: "الجبنة مختومة بالكامل من الداخل" }, { instruction: "غطها بالبيض ثم فتات الخبز", measure: "غير محدد", visual: "تغطية متساوية وكاملة دون ظهور الأرز" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 12-14 دقيقة", visual: "الطبقة ذهبية ومقرمشة" }],
  },
  "air-fryer-empanadas": {
    es: [{ instruction: "Dora carne molida con cebolla para el relleno", measure: "7-8 min", visual: "No queda rosado, cebolla ablandada" }, { instruction: "Rellena círculos de masa, dobla y sella los bordes, unta con huevo batido", measure: "N/A", visual: "Los bordes están sellados firmemente" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "370°F (188°C), 12-14 min", visual: "La masa está dorada intensa y hojaldrada" }],
    fr: [{ instruction: "Faites dorer le bœuf haché avec l'oignon pour la garniture", measure: "7-8 min", visual: "Plus aucune trace rose, oignon ramolli" }, { instruction: "Garnissez des ronds de pâte, repliez et pincez les bords, badigeonnez d'œuf battu", measure: "N/A", visual: "Les bords sont bien scellés" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "370°F (188°C), 12-14 min", visual: "La pâte est bien dorée et feuilletée" }],
    pt: [{ instruction: "Doure a carne moída com cebola para o recheio", measure: "7-8 min", visual: "Sem rosa restante, cebola amolecida" }, { instruction: "Recheie discos de massa, dobre e feche as bordas, pincele com ovo batido", measure: "N/A", visual: "As bordas estão firmemente seladas" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "370°F (188°C), 12-14 min", visual: "A massa está bem dourada e folhada" }],
    hi: [{ instruction: "भरावन के लिए कीमा को प्याज़ के साथ भूनें", measure: "7-8 मिनट", visual: "कोई गुलाबीपन न बचे, प्याज़ नरम हो" }, { instruction: "आटे के गोलों में भरें, किनारों को मोड़कर बंद करें, फेंटे अंडे से ब्रश करें", measure: "लागू नहीं", visual: "किनारे मज़बूती से सील हों" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "370°F (188°C), 12-14 मिनट", visual: "आटा गहरा सुनहरा और परतदार हो" }],
    zh: [{ instruction: "将牛肉末与洋葱炒香作为馅料", measure: "7-8分钟", visual: "没有粉色残留，洋葱变软" }, { instruction: "在圆形面皮中填入馅料，折叠并压紧边缘，刷上蛋液", measure: "不适用", visual: "边缘紧密封口" }, { instruction: "放入空气炸锅，中途翻面", measure: "370°F（188°C），12-14分钟", visual: "面皮呈深金黄色且酥松" }],
    ar: [{ instruction: "حمّر اللحم المفروم مع البصل للحشو", measure: "7-8 دقائق", visual: "بلا لون وردي متبقٍ، البصل لان" }, { instruction: "املأ أقراص العجين، اطوِ واضغط الحواف، ادهنها بغسلة البيض", measure: "غير محدد", visual: "الحواف مغلقة بإحكام" }, { instruction: "اطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "370 فهرنهايت (188 مئوية)، 12-14 دقيقة", visual: "العجين ذهبي داكن ومقرمش" }],
  },
  "air-fryer-tandoori-chicken": {
    es: [{ instruction: "Marina el pollo en yogur, curry en polvo y jugo de limón", measure: "20 min mínimo, más tiempo es mejor", visual: "El pollo está completamente cubierto, un poco más oscuro" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "380°F (193°C), 18-20 min", visual: "Manchas chamuscadas en los bordes, los jugos salen claros" }],
    fr: [{ instruction: "Faites mariner le poulet dans du yaourt, du curry en poudre et du jus de citron", measure: "20 min minimum, plus long c'est mieux", visual: "Le poulet est entièrement enrobé, légèrement plus foncé" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "380°F (193°C), 18-20 min", visual: "Taches grillées sur les bords, le jus est clair" }],
    pt: [{ instruction: "Marine o frango em iogurte, curry em pó e suco de limão", measure: "Mínimo de 20 min, mais tempo é melhor", visual: "O frango está totalmente coberto, um pouco mais escuro" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "380°F (193°C), 18-20 min", visual: "Manchas chamuscadas nas bordas, os sucos saem claros" }],
    hi: [{ instruction: "चिकन को दही, करी पाउडर और नींबू के रस में मैरिनेट करें", measure: "कम से कम 20 मिनट, ज़्यादा बेहतर है", visual: "चिकन पूरी तरह लिपटा हो, थोड़ा गहरा हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), 18-20 मिनट", visual: "किनारों पर जले हुए धब्बे हों, रस साफ़ निकले" }],
    zh: [{ instruction: "将鸡肉用酸奶、咖喱粉和柠檬汁腌制", measure: "至少20分钟，时间越长越好", visual: "鸡肉完全裹上腌料，颜色略深" }, { instruction: "放入空气炸锅，中途翻面", measure: "380°F（193°C），18-20分钟", visual: "边缘有焦香斑点，肉汁清澈" }],
    ar: [{ instruction: "تبّل الدجاج في الزبادي ومسحوق الكاري وعصير الليمون", measure: "20 دقيقة على الأقل، الأطول أفضل", visual: "الدجاج مغطى بالكامل، أغمق قليلًا" }, { instruction: "اطبخه بالمقلاة الهوائية، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 18-20 دقيقة", visual: "بقع محروقة عند الحواف، العصارة صافية" }],
  },
  "air-fryer-jerk-wings": {
    es: [{ instruction: "Mezcla las alitas con sazonador jerk y jugo de lima", measure: "10 min de marinado si hay tiempo", visual: "Las alitas están cubiertas uniformemente, sin zonas desnudas" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "380°F (193°C), 22-24 min", visual: "La piel está dorada intensa y crujiente" }],
    fr: [{ instruction: "Mélangez les ailes avec l'assaisonnement jerk et le jus de citron vert", measure: "10 min de marinade si le temps le permet", visual: "Les ailes sont uniformément enrobées, sans zones nues" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "380°F (193°C), 22-24 min", visual: "La peau est bien dorée et croustillante" }],
    pt: [{ instruction: "Misture as asas com tempero jerk e suco de limão", measure: "10 min de marinada se der tempo", visual: "As asas estão uniformemente cobertas, sem áreas nuas" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "380°F (193°C), 22-24 min", visual: "A pele está bem dourada e crocante" }],
    hi: [{ instruction: "विंग्स को जर्क सीज़निंग और नींबू के रस के साथ मिलाएं", measure: "समय हो तो 10 मिनट मैरिनेट करें", visual: "विंग्स समान रूप से लिपटे हों, कोई खाली जगह न हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "380°F (193°C), 22-24 मिनट", visual: "त्वचा गहरी सुनहरी और कुरकुरी हो" }],
    zh: [{ instruction: "将鸡翅与牙买加香辣调料和青柠汁拌匀", measure: "如有时间腌10分钟", visual: "鸡翅均匀裹料，没有裸露部分" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "380°F（193°C），22-24分钟", visual: "鸡皮呈深金黄色且酥脆" }],
    ar: [{ instruction: "قلّب الأجنحة مع توابل الجيرك وعصير الليمون", measure: "تتبيل 10 دقائق إن سمح الوقت", visual: "الأجنحة مغطاة بالتساوي، بدون بقع عارية" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 22-24 دقيقة", visual: "الجلد ذهبي داكن ومقرمش" }],
  },
  "air-fryer-korean-fried-chicken": {
    es: [{ instruction: "Mezcla las alitas con maicena, sacudiendo el exceso", measure: "N/A", visual: "Recubrimiento ligero y uniforme, sin grumos gruesos" }, { instruction: "Cocina en freidora de aire, agitando la canasta a la mitad", measure: "390°F (199°C), 20-22 min", visual: "El recubrimiento está crujiente y dorado" }, { instruction: "Mezcla las alitas calientes con glaseado de soya-gochujang", measure: "2 cdas de gochujang + 1 cda de salsa de soya", visual: "El glaseado se adhiere uniformemente, recubrimiento brillante" }],
    fr: [{ instruction: "Mélangez les ailes avec la fécule de maïs, en secouant l'excès", measure: "N/A", visual: "Enrobage léger et uniforme, sans gros grumeaux" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier à mi-cuisson", measure: "390°F (199°C), 20-22 min", visual: "L'enrobage est croustillant et doré" }, { instruction: "Mélangez les ailes chaudes dans le glaçage soja-gochujang", measure: "2 c. à s. de gochujang + 1 c. à s. de sauce soja", visual: "Le glaçage adhère uniformément, enrobage brillant" }],
    pt: [{ instruction: "Misture as asas com amido de milho, sacudindo o excesso", measure: "N/A", visual: "Revestimento leve e uniforme, sem grumos grossos" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta na metade", measure: "390°F (199°C), 20-22 min", visual: "O revestimento está crocante e dourado" }, { instruction: "Misture as asas quentes no glaze de soja-gochujang", measure: "2 colheres de sopa de gochujang + 1 colher de sopa de molho de soja", visual: "O glaze gruda uniformemente, revestimento brilhante" }],
    hi: [{ instruction: "विंग्स को कॉर्नस्टार्च में मिलाएं, अतिरिक्त झाड़ें", measure: "लागू नहीं", visual: "हल्की समान कोटिंग हो, कोई गाढ़ी गुठली नहीं" }, { instruction: "एयर फ्रायर में पकाएं, बीच में टोकरी हिलाएं", measure: "390°F (199°C), 20-22 मिनट", visual: "कोटिंग कुरकुरी और सुनहरी हो" }, { instruction: "गर्म विंग्स को सोया-गोचुजांग ग्लेज़ में मिलाएं", measure: "2 बड़े चम्मच गोचुजांग + 1 बड़ा चम्मच सोया सॉस", visual: "ग्लेज़ समान रूप से चिपके, चमकदार कोटिंग हो" }],
    zh: [{ instruction: "将鸡翅裹上玉米淀粉，抖掉多余的", measure: "不适用", visual: "裹层轻薄均匀，没有厚重结块" }, { instruction: "放入空气炸锅，中途摇晃篮子", measure: "390°F（199°C），20-22分钟", visual: "裹层酥脆金黄" }, { instruction: "将热鸡翅拌入酱油韩式辣酱调味汁", measure: "2汤匙韩式辣酱 + 1汤匙酱油", visual: "酱汁均匀裹住，有光泽的裹层" }],
    ar: [{ instruction: "قلّب الأجنحة بنشا الذرة، مع نفض الزائد", measure: "غير محدد", visual: "طبقة خفيفة ومتساوية، بدون تكتلات سميكة" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة في المنتصف", measure: "390 فهرنهايت (199 مئوية)، 20-22 دقيقة", visual: "الطبقة مقرمشة وذهبية" }, { instruction: "قلّب الأجنحة الساخنة في تتبيلة الصويا والغوتشوجانغ", measure: "2 ملعقة كبيرة غوتشوجانغ + ملعقة كبيرة صلصة صويا", visual: "تلتصق التتبيلة بالتساوي، طبقة لامعة" }],
  },
  "air-fryer-fish-tacos": {
    es: [{ instruction: "Sazona los filetes de bacalao y cocina en freidora de aire hasta que se desmenucen", measure: "380°F (193°C), 10-12 min", visual: "El pescado se desmenuza fácilmente con un tenedor" }, { instruction: "Rellena tortillas calientes con pescado, repollo y lima", measure: "N/A", visual: "El repollo se mantiene crujiente y brillante" }],
    fr: [{ instruction: "Assaisonnez les filets de cabillaud et cuisez à la friteuse à air jusqu'à effeuillage", measure: "380°F (193°C), 10-12 min", visual: "Le poisson s'effeuille facilement à la fourchette" }, { instruction: "Garnissez des tortillas chaudes de poisson, chou et citron vert", measure: "N/A", visual: "Le chou reste croquant et vif" }],
    pt: [{ instruction: "Tempere os filés de bacalhau e cozinhe na air fryer até desmanchar", measure: "380°F (193°C), 10-12 min", visual: "O peixe desmancha facilmente com um garfo" }, { instruction: "Recheie tortillas quentes com peixe, repolho e limão", measure: "N/A", visual: "O repolho fica crocante e vibrante" }],
    hi: [{ instruction: "कॉड फिलेट्स को सीज़न करें और परतदार होने तक एयर फ्रायर में पकाएं", measure: "380°F (193°C), 10-12 मिनट", visual: "मछली कांटे से आसानी से टूटे" }, { instruction: "गर्म टॉर्टिला में मछली, गोभी और नींबू भरें", measure: "लागू नहीं", visual: "गोभी कुरकुरी और चमकदार रहे" }],
    zh: [{ instruction: "给鳕鱼片调味，放入空气炸锅炸至可剥落", measure: "380°F（193°C），10-12分钟", visual: "鱼肉用叉子轻松剥落" }, { instruction: "在温热的薄饼中填入鱼肉、卷心菜和青柠", measure: "不适用", visual: "卷心菜保持爽脆鲜亮" }],
    ar: [{ instruction: "تبّل شرائح سمك القد واطبخها بالمقلاة الهوائية حتى تتفتت", measure: "380 فهرنهايت (193 مئوية)، 10-12 دقيقة", visual: "يتفتت السمك بسهولة بالشوكة" }, { instruction: "املأ التورتيا الدافئة بالسمك والملفوف والليمون", measure: "غير محدد", visual: "يبقى الملفوف مقرمشًا وزاهيًا" }],
  },
  "air-fryer-shrimp-tempura": {
    es: [{ instruction: "Sumerge los camarones en harina, luego huevo, luego pan rallado", measure: "N/A", visual: "El recubrimiento es uniforme, las colas quedan expuestas" }, { instruction: "Cocina en freidora de aire en una sola capa, volteando a la mitad", measure: "390°F (199°C), 8-10 min", visual: "El recubrimiento está dorado y crujiente" }],
    fr: [{ instruction: "Trempez les crevettes dans la farine, puis l'œuf, puis la chapelure", measure: "N/A", visual: "L'enrobage est uniforme, les queues restent visibles" }, { instruction: "Cuisez à la friteuse à air en une seule couche, en retournant à mi-cuisson", measure: "390°F (199°C), 8-10 min", visual: "L'enrobage est doré et croustillant" }],
    pt: [{ instruction: "Mergulhe o camarão na farinha, depois no ovo, depois na farinha de rosca", measure: "N/A", visual: "O revestimento é uniforme, as caudas ficam expostas" }, { instruction: "Cozinhe na air fryer numa única camada, virando na metade", measure: "390°F (199°C), 8-10 min", visual: "O revestimento está dourado e crocante" }],
    hi: [{ instruction: "झींगे को आटे में डुबोएं, फिर अंडे में, फिर ब्रेडक्रंब में", measure: "लागू नहीं", visual: "कोटिंग समान हो, पूंछ बाहर दिखे" }, { instruction: "एक परत में एयर फ्रायर में पकाएं, बीच में पलटें", measure: "390°F (199°C), 8-10 मिनट", visual: "कोटिंग सुनहरी और कुरकुरी हो" }],
    zh: [{ instruction: "将虾依次裹面粉、鸡蛋，再裹面包糠", measure: "不适用", visual: "裹料均匀，虾尾露出" }, { instruction: "单层放入空气炸锅，中途翻面", measure: "390°F（199°C），8-10分钟", visual: "裹层金黄酥脆" }],
    ar: [{ instruction: "اغمس الجمبري في الطحين، ثم البيض، ثم فتات الخبز", measure: "غير محدد", visual: "الطبقة متساوية، الذيول مكشوفة" }, { instruction: "اطبخه بالمقلاة الهوائية في طبقة واحدة، مع القلب في المنتصف", measure: "390 فهرنهايت (199 مئوية)، 8-10 دقائق", visual: "الطبقة ذهبية ومقرمشة" }],
  },
  "air-fryer-eggplant-parmesan": {
    es: [{ instruction: "Corta la berenjena en rodajas, cubre con huevo y luego pan rallado", measure: "Rodajas de 1/2 pulgada", visual: "El recubrimiento es uniforme por ambos lados" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "380°F (193°C), 14-16 min", visual: "El recubrimiento está dorado y crujiente" }, { instruction: "Cubre con marinara y queso, cocina en freidora de aire brevemente hasta derretir", measure: "370°F (188°C), 3-4 min", visual: "El queso está completamente derretido y burbujeante" }],
    fr: [{ instruction: "Coupez l'aubergine en rondelles, enrobez d'œuf puis de chapelure", measure: "Rondelles de 1,5 cm", visual: "L'enrobage est uniforme des deux côtés" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "380°F (193°C), 14-16 min", visual: "L'enrobage est doré et croustillant" }, { instruction: "Garnissez de marinara et fromage, cuisez brièvement à la friteuse à air jusqu'à fonte", measure: "370°F (188°C), 3-4 min", visual: "Le fromage est entièrement fondu et bouillonnant" }],
    pt: [{ instruction: "Corte a berinjela em rodelas, cubra com ovo e depois farinha de rosca", measure: "Rodelas de 1,5 cm", visual: "O revestimento é uniforme dos dois lados" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "380°F (193°C), 14-16 min", visual: "O revestimento está dourado e crocante" }, { instruction: "Cubra com marinara e queijo, cozinhe na air fryer brevemente até derreter", measure: "370°F (188°C), 3-4 min", visual: "O queijo está totalmente derretido e borbulhante" }],
    hi: [{ instruction: "बैंगन को गोल टुकड़ों में काटें, अंडे में फिर ब्रेडक्रंब में लपेटें", measure: "1/2 इंच के गोल टुकड़े", visual: "कोटिंग दोनों तरफ समान हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "380°F (193°C), 14-16 मिनट", visual: "कोटिंग सुनहरी और कुरकुरी हो" }, { instruction: "मरीनारा और चीज़ से ढकें, पिघलने तक थोड़ी देर एयर फ्रायर में पकाएं", measure: "370°F (188°C), 3-4 मिनट", visual: "चीज़ पूरी तरह पिघला और बुलबुलेदार हो" }],
    zh: [{ instruction: "将茄子切成圆片，裹上鸡蛋再裹面包糠", measure: "1/2英寸厚的圆片", visual: "两面裹料均匀" }, { instruction: "放入空气炸锅，中途翻面", measure: "380°F（193°C），14-16分钟", visual: "裹层金黄酥脆" }, { instruction: "铺上番茄肉酱和芝士，短暂空气炸至融化", measure: "370°F（188°C），3-4分钟", visual: "芝士完全融化冒泡" }],
    ar: [{ instruction: "قطّع الباذنجان إلى شرائح، غطها بالبيض ثم فتات الخبز", measure: "شرائح بسماكة نصف إنش", visual: "الطبقة متساوية من الجانبين" }, { instruction: "اطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "380 فهرنهايت (193 مئوية)، 14-16 دقيقة", visual: "الطبقة ذهبية ومقرمشة" }, { instruction: "غطها بصلصة المارينارا والجبنة، اطبخها بالمقلاة الهوائية لفترة قصيرة حتى تذوب", measure: "370 فهرنهايت (188 مئوية)، 3-4 دقائق", visual: "الجبنة ذائبة بالكامل وفقاعية" }],
  },
  "air-fryer-quesadilla": {
    es: [{ instruction: "Espolvorea queso sobre la mitad de una tortilla y dobla", measure: "N/A", visual: "El queso está distribuido uniformemente, no amontonado" }, { instruction: "Cocina en freidora de aire, volteando a la mitad", measure: "370°F (188°C), 6-8 min", visual: "La tortilla está dorada intensa, el queso completamente derretido" }],
    fr: [{ instruction: "Saupoudrez du fromage sur la moitié d'une tortilla et repliez", measure: "N/A", visual: "Le fromage est réparti uniformément, pas entassé" }, { instruction: "Cuisez à la friteuse à air, en retournant à mi-cuisson", measure: "370°F (188°C), 6-8 min", visual: "La tortilla est bien dorée, le fromage entièrement fondu" }],
    pt: [{ instruction: "Polvilhe queijo sobre metade de uma tortilha e dobre", measure: "N/A", visual: "O queijo está distribuído uniformemente, não empilhado" }, { instruction: "Cozinhe na air fryer, virando na metade", measure: "370°F (188°C), 6-8 min", visual: "A tortilha está bem dourada, o queijo totalmente derretido" }],
    hi: [{ instruction: "टॉर्टिला के आधे हिस्से पर चीज़ छिड़कें और मोड़ें", measure: "लागू नहीं", visual: "चीज़ समान रूप से फैला हो, एक जगह ढेर न हो" }, { instruction: "एयर फ्रायर में पकाएं, बीच में पलटें", measure: "370°F (188°C), 6-8 मिनट", visual: "टॉर्टिला गहरा सुनहरा हो, चीज़ पूरी तरह पिघला हो" }],
    zh: [{ instruction: "在半张薄饼上撒芝士并对折", measure: "不适用", visual: "芝士均匀分布，不堆积" }, { instruction: "放入空气炸锅，中途翻面", measure: "370°F（188°C），6-8分钟", visual: "薄饼呈深金黄色，芝士完全融化" }],
    ar: [{ instruction: "رشّ الجبنة على نصف التورتيا واطوها", measure: "غير محدد", visual: "الجبنة موزعة بالتساوي، غير مكدسة" }, { instruction: "اطبخها بالمقلاة الهوائية، مع القلب في المنتصف", measure: "370 فهرنهايت (188 مئوية)، 6-8 دقائق", visual: "التورتيا ذهبية داكنة، الجبنة ذائبة بالكامل" }],
  },
  "air-fryer-stuffed-peppers": {
    es: [{ instruction: "Corta los pimientos por la mitad y quita las semillas, dora la res y mezcla con arroz cocido", measure: "N/A", visual: "El relleno está bien combinado, sin carne rosada" }, { instruction: "Rellena los pimientos, cubre con queso", measure: "N/A", visual: "El relleno está compacto pero no se desborda" }, { instruction: "Cocina en freidora de aire hasta que los pimientos estén tiernos y el queso derretido", measure: "360°F (182°C), 12-14 min", visual: "Los bordes del pimiento están un poco suaves, el queso burbujeante" }],
    fr: [{ instruction: "Coupez les poivrons en deux et retirez les graines, faites dorer le bœuf et mélangez avec le riz cuit", measure: "N/A", visual: "La garniture est bien mélangée, aucune viande rose" }, { instruction: "Farcissez les poivrons de garniture, garnissez de fromage", measure: "N/A", visual: "La garniture est tassée mais ne déborde pas" }, { instruction: "Cuisez à la friteuse à air jusqu'à ce que les poivrons soient tendres et le fromage fondu", measure: "360°F (182°C), 12-14 min", visual: "Les bords du poivron sont légèrement ramollis, le fromage bouillonne" }],
    pt: [{ instruction: "Corte os pimentões ao meio e remova as sementes, doure a carne e misture com arroz cozido", measure: "N/A", visual: "O recheio está bem combinado, sem carne rosada" }, { instruction: "Recheie os pimentões, cubra com queijo", measure: "N/A", visual: "O recheio está compactado mas não transborda" }, { instruction: "Cozinhe na air fryer até os pimentões ficarem macios e o queijo derretido", measure: "360°F (182°C), 12-14 min", visual: "As bordas do pimentão estão levemente amolecidas, o queijo borbulhando" }],
    hi: [{ instruction: "शिमला मिर्च को आधा काटें और बीज निकालें, बीफ भूनें और पके चावल के साथ मिलाएं", measure: "लागू नहीं", visual: "भरावन अच्छी तरह मिला हो, कोई गुलाबी मांस न हो" }, { instruction: "मिर्च में भरावन भरें, ऊपर चीज़ डालें", measure: "लागू नहीं", visual: "भरावन भरा हो लेकिन बाहर न बहे" }, { instruction: "मिर्च नरम और चीज़ पिघलने तक एयर फ्रायर में पकाएं", measure: "360°F (182°C), 12-14 मिनट", visual: "मिर्च के किनारे थोड़े नरम हों, चीज़ बुलबुलेदार हो" }],
    zh: [{ instruction: "将甜椒对半切开去籽，炒香牛肉与熟米饭混合", measure: "不适用", visual: "馅料混合均匀，没有粉色的肉" }, { instruction: "将馅料填入甜椒，铺上芝士", measure: "不适用", visual: "馅料填满但不溢出" }, { instruction: "放入空气炸锅烤至甜椒变软芝士融化", measure: "360°F（182°C），12-14分钟", visual: "甜椒边缘略微变软，芝士冒泡" }],
    ar: [{ instruction: "قسّم الفلفل نصفين وأزل البذور، حمّر اللحم واخلطه مع الأرز المطهو", measure: "غير محدد", visual: "الحشو ممزوج جيدًا، بلا لحم وردي" }, { instruction: "احشُ الفلفل بالحشو، غطِّ بالجبنة", measure: "غير محدد", visual: "الحشو مضغوط لكن غير فائض" }, { instruction: "اطبخها بالمقلاة الهوائية حتى يلين الفلفل وتذوب الجبنة", measure: "360 فهرنهايت (182 مئوية)، 12-14 دقيقة", visual: "حواف الفلفل لانت قليلًا، الجبنة تفقع" }],
  },
  "air-fryer-mini-meatloaves": {
    es: [{ instruction: "Mezcla carne molida, pan rallado, huevo y sazonador, forma panes pequeños", measure: "4 mini panes", visual: "La mezcla se mantiene unida sin ser densa" }, { instruction: "Unta la parte superior con ketchup", measure: "N/A", visual: "El glaseado cubre la parte superior uniformemente" }, { instruction: "Cocina en freidora de aire hasta que esté bien cocido", measure: "370°F (188°C), 15-18 min", visual: "La temperatura interna alcanza 160°F, sin centro rosado" }],
    fr: [{ instruction: "Mélangez bœuf haché, chapelure, œuf et assaisonnement, formez de petits pains", measure: "4 mini pains", visual: "Le mélange tient ensemble sans être dense" }, { instruction: "Badigeonnez le dessus de ketchup", measure: "N/A", visual: "Le glaçage recouvre le dessus uniformément" }, { instruction: "Cuisez à la friteuse à air jusqu'à cuisson complète", measure: "370°F (188°C), 15-18 min", visual: "La température interne atteint 71°C, aucun centre rose" }],
    pt: [{ instruction: "Misture carne moída, farinha de rosca, ovo e tempero, forme bolinhos pequenos", measure: "4 mini bolos", visual: "A mistura se mantém unida sem ser densa" }, { instruction: "Pincele o topo com ketchup", measure: "N/A", visual: "O glaze cobre o topo uniformemente" }, { instruction: "Cozinhe na air fryer até cozinhar por completo", measure: "370°F (188°C), 15-18 min", visual: "A temperatura interna atinge 71°C, sem centro rosado" }],
    hi: [{ instruction: "कीमा, ब्रेडक्रंब, अंडा और सीज़निंग मिलाएं, छोटी लोफ बनाएं", measure: "4 मिनी लोफ", visual: "मिश्रण घना हुए बिना साथ रहे" }, { instruction: "ऊपर केचप लगाएं", measure: "लागू नहीं", visual: "ग्लेज़ ऊपर समान रूप से फैला हो" }, { instruction: "पूरी तरह पकने तक एयर फ्रायर में पकाएं", measure: "370°F (188°C), 15-18 मिनट", visual: "अंदर का तापमान 160°F तक पहुंचे, कोई गुलाबी केंद्र न हो" }],
    zh: [{ instruction: "将牛肉末、面包糠、鸡蛋和调料混合，捏成小肉饼形状", measure: "4个迷你肉饼", visual: "混合物能保持形状且不过于紧实" }, { instruction: "在顶部刷上番茄酱", measure: "不适用", visual: "酱汁均匀覆盖顶部" }, { instruction: "放入空气炸锅烤至熟透", measure: "370°F（188°C），15-18分钟", visual: "内部温度达到160°F，中心没有粉色" }],
    ar: [{ instruction: "اخلط اللحم المفروم وفتات الخبز والبيض والتوابل، شكّلها أرغفة صغيرة", measure: "4 أرغفة صغيرة", visual: "يتماسك الخليط دون أن يكون كثيفًا" }, { instruction: "ادهن الأعلى بالكاتشب", measure: "غير محدد", visual: "تغطي التتبيلة الأعلى بالتساوي" }, { instruction: "اطبخها بالمقلاة الهوائية حتى تنضج تمامًا", measure: "370 فهرنهايت (188 مئوية)، 15-18 دقيقة", visual: "تصل الحرارة الداخلية إلى 160 فهرنهايت، بدون مركز وردي" }],
  },
  "air-fryer-salmon-bites": {
    es: [{ instruction: "Corta el salmón en cubos y mezcla con salsa de soya, miel y aceite de sésamo", measure: "Cubos de 1 pulgada", visual: "Los cubos están cubiertos uniformemente y brillantes" }, { instruction: "Cocina en freidora de aire en una sola capa", measure: "400°F (204°C), 7-8 min", visual: "Los bordes están ligeramente caramelizados, los centros apenas cocidos" }],
    fr: [{ instruction: "Coupez le saumon en cubes et mélangez avec sauce soja, miel et huile de sésame", measure: "Cubes de 2,5 cm", visual: "Les cubes sont uniformément enrobés et brillants" }, { instruction: "Cuisez à la friteuse à air en une seule couche", measure: "400°F (204°C), 7-8 min", visual: "Les bords sont légèrement caramélisés, les centres tout juste cuits" }],
    pt: [{ instruction: "Corte o salmão em cubos e misture com molho de soja, mel e óleo de gergelim", measure: "Cubos de 2,5 cm", visual: "Os cubos estão uniformemente cobertos e brilhantes" }, { instruction: "Cozinhe na air fryer numa única camada", measure: "400°F (204°C), 7-8 min", visual: "As bordas estão levemente caramelizadas, os centros apenas no ponto" }],
    hi: [{ instruction: "सैल्मन को क्यूब्स में काटें, सोया सॉस, शहद और तिल के तेल के साथ मिलाएं", measure: "1 इंच के क्यूब्स", visual: "क्यूब्स समान रूप से लिपटे और चमकदार हों" }, { instruction: "एक परत में एयर फ्रायर में पकाएं", measure: "400°F (204°C), 7-8 मिनट", visual: "किनारे हल्के कैरेमलाइज़ हों, बीच बस पका हो" }],
    zh: [{ instruction: "将三文鱼切块，与酱油、蜂蜜和香油拌匀", measure: "1英寸方块", visual: "方块均匀裹料且有光泽" }, { instruction: "单层放入空气炸锅", measure: "400°F（204°C），7-8分钟", visual: "边缘轻微焦糖化，中心刚好熟透" }],
    ar: [{ instruction: "قطّع السلمون مكعبات وقلّبه مع صلصة الصويا والعسل وزيت السمسم", measure: "مكعبات بحجم إنش", visual: "المكعبات مغطاة بالتساوي ولامعة" }, { instruction: "اطبخها بالمقلاة الهوائية في طبقة واحدة", measure: "400 فهرنهايت (204 مئوية)، 7-8 دقائق", visual: "الحواف مكرملة قليلًا، المراكز ناضجة للتو" }],
  },
  "air-fryer-cod": {
    es: [{ instruction: "Frota los filetes de bacalao con aceite, limón y pimentón", measure: "1 cdta de aceite por filete", visual: "La superficie está cubierta uniformemente" }, { instruction: "Cocina en freidora de aire hasta que esté apenas cocido", measure: "380°F (193°C), 8-10 min", visual: "Se desmenuza fácilmente con un tenedor, opaco por dentro" }],
    fr: [{ instruction: "Frottez les filets de cabillaud avec huile, citron et paprika", measure: "1 c. à c. d'huile par filet", visual: "La surface est uniformément enrobée" }, { instruction: "Cuisez à la friteuse à air jusqu'à cuisson complète", measure: "380°F (193°C), 8-10 min", visual: "S'effeuille facilement à la fourchette, opaque à cœur" }],
    pt: [{ instruction: "Esfregue os filés de bacalhau com óleo, limão e páprica", measure: "1 colher de chá de óleo por filé", visual: "A superfície está coberta uniformemente" }, { instruction: "Cozinhe na air fryer até ficar apenas no ponto", measure: "380°F (193°C), 8-10 min", visual: "Desmancha facilmente com um garfo, opaco por dentro" }],
    hi: [{ instruction: "कॉड फिलेट्स को तेल, नींबू और पपरिका से रगड़ें", measure: "हर फिलेट के लिए 1 छोटा चम्मच तेल", visual: "सतह समान रूप से लिपटी हो" }, { instruction: "बस पकने तक एयर फ्रायर में पकाएं", measure: "380°F (193°C), 8-10 मिनट", visual: "कांटे से आसानी से टूटे, अंदर तक अपारदर्शी हो" }],
    zh: [{ instruction: "将鳕鱼片用油、柠檬和红椒粉揉搓", measure: "每片鱼1茶匙油", visual: "表面均匀裹料" }, { instruction: "空气炸至刚好熟透", measure: "380°F（193°C），8-10分钟", visual: "用叉子轻松剥落，内部不透明" }],
    ar: [{ instruction: "افرك شرائح سمك القد بالزيت والليمون والبابريكا", measure: "ملعقة صغيرة زيت لكل شريحة", visual: "السطح مغطى بالتساوي" }, { instruction: "اطبخه بالمقلاة الهوائية حتى ينضج للتو", measure: "380 فهرنهايت (193 مئوية)، 8-10 دقائق", visual: "يتفتت بسهولة بالشوكة، معتم بالكامل" }],
  },
  "air-fryer-pork-belly-bites": {
    es: [{ instruction: "Corta la panceta en cubos, mezcla con salsa de soya, ajo y miel", measure: "Cubos de 1 pulgada", visual: "Los cubos están glaseados uniformemente" }, { instruction: "Cocina en freidora de aire, agitando la canasta con frecuencia", measure: "380°F (193°C), 18-20 min", visual: "El exterior está profundamente caramelizado y crujiente" }],
    fr: [{ instruction: "Coupez la poitrine de porc en cubes, mélangez avec sauce soja, ail et miel", measure: "Cubes de 2,5 cm", visual: "Les cubes sont uniformément glacés" }, { instruction: "Cuisez à la friteuse à air, en secouant le panier souvent", measure: "380°F (193°C), 18-20 min", visual: "L'extérieur est profondément caramélisé et croustillant" }],
    pt: [{ instruction: "Corte a barriga de porco em cubos, misture com molho de soja, alho e mel", measure: "Cubos de 2,5 cm", visual: "Os cubos estão glaceados uniformemente" }, { instruction: "Cozinhe na air fryer, sacudindo a cesta com frequência", measure: "380°F (193°C), 18-20 min", visual: "O exterior está profundamente caramelizado e crocante" }],
    hi: [{ instruction: "पोर्क बेली को क्यूब्स में काटें, सोया सॉस, लहसुन और शहद के साथ मिलाएं", measure: "1 इंच के क्यूब्स", visual: "क्यूब्स समान रूप से ग्लेज़ हों" }, { instruction: "एयर फ्रायर में पकाएं, बार-बार टोकरी हिलाएं", measure: "380°F (193°C), 18-20 मिनट", visual: "बाहर गहरा कैरेमलाइज़ और कुरकुरा हो" }],
    zh: [{ instruction: "将五花肉切块，与酱油、大蒜和蜂蜜拌匀", measure: "1英寸方块", visual: "方块均匀裹上糖浆" }, { instruction: "放入空气炸锅，经常摇晃篮子", measure: "380°F（193°C），18-20分钟", visual: "外部深度焦糖化且酥脆" }],
    ar: [{ instruction: "قطّع صدر الخنزير مكعبات، قلّبها مع صلصة الصويا والثوم والعسل", measure: "مكعبات بحجم إنش", visual: "المكعبات مغطاة بالتساوي بالتتبيلة" }, { instruction: "اطبخها بالمقلاة الهوائية، مع هز السلة كثيرًا", measure: "380 فهرنهايت (193 مئوية)، 18-20 دقيقة", visual: "الخارج مكرمل بعمق ومقرمش" }],
  },
  "air-fryer-tostones": {
    es: [{ instruction: "Corta plátanos verdes en rodajas, cocina brevemente en freidora de aire para ablandar", measure: "350°F (177°C), 5 min", visual: "Las rodajas están apenas suaves, no doradas" }, { instruction: "Aplasta, unta con aceite, cocina en freidora de aire hasta que estén crujientes", measure: "380°F (193°C), 8-10 min", visual: "Los bordes están dorados y crujientes" }],
    fr: [{ instruction: "Coupez des bananes plantain vertes en rondelles, cuisez brièvement à la friteuse à air pour ramollir", measure: "350°F (177°C), 5 min", visual: "Les tranches sont juste ramollies, pas dorées" }, { instruction: "Écrasez à plat, badigeonnez d'huile, cuisez à la friteuse à air jusqu'à croustillant", measure: "380°F (193°C), 8-10 min", visual: "Les bords sont dorés et croustillants" }],
    pt: [{ instruction: "Corte bananas-da-terra verdes em rodelas, cozinhe brevemente na air fryer para amolecer", measure: "350°F (177°C), 5 min", visual: "As fatias estão apenas amolecidas, não douradas" }, { instruction: "Amasse achatado, pincele com óleo, cozinhe na air fryer até ficar crocante", measure: "380°F (193°C), 8-10 min", visual: "As bordas estão douradas e crocantes" }],
    hi: [{ instruction: "हरे प्लांटेन को गोल टुकड़ों में काटें, नरम करने के लिए थोड़ी देर एयर फ्रायर में पकाएं", measure: "350°F (177°C), 5 मिनट", visual: "टुकड़े बस नरम हुए हों, सुनहरे नहीं" }, { instruction: "चपटा दबाएं, तेल लगाएं, कुरकुरा होने तक एयर फ्रायर में पकाएं", measure: "380°F (193°C), 8-10 मिनट", visual: "किनारे सुनहरे और कुरकुरे हों" }],
    zh: [{ instruction: "将青大蕉切成圆片，短暂空气炸至变软", measure: "350°F（177°C），5分钟", visual: "切片刚好变软，不焦黄" }, { instruction: "压扁，刷上油，空气炸至酥脆", measure: "380°F（193°C），8-10分钟", visual: "边缘金黄酥脆" }],
    ar: [{ instruction: "قطّع الموز الأخضر إلى شرائح، اطبخها بالمقلاة الهوائية لفترة قصيرة لتليينها", measure: "350 فهرنهايت (177 مئوية)، 5 دقائق", visual: "الشرائح لانت فقط، غير محمرة" }, { instruction: "اهرسها مسطحة، ادهنها بالزيت، اطبخها بالمقلاة الهوائية حتى تصبح مقرمشة", measure: "380 فهرنهايت (193 مئوية)، 8-10 دقائق", visual: "الحواف ذهبية ومقرمشة" }],
  },
  "air-fryer-granola": {
    es: [{ instruction: "Mezcla avena, miel, aceite y almendras hasta que estén cubiertas uniformemente", measure: "2 tazas de avena + 3 cdas de miel", visual: "La avena está brillante y ligeramente pegajosa" }, { instruction: "Cocina en freidora de aire, revolviendo cada pocos minutos", measure: "300°F (149°C), 10-12 min", visual: "Dorado y fragante, se vuelve crujiente al enfriarse" }],
    fr: [{ instruction: "Mélangez flocons d'avoine, miel, huile et amandes jusqu'à enrobage uniforme", measure: "2 tasses de flocons + 3 c. à s. de miel", visual: "Les flocons sont brillants et légèrement agglutinés" }, { instruction: "Cuisez à la friteuse à air, en remuant toutes les quelques minutes", measure: "300°F (149°C), 10-12 min", visual: "Doré et parfumé, devient croustillant en refroidissant" }],
    pt: [{ instruction: "Misture aveia, mel, óleo e amêndoas até ficarem uniformemente cobertas", measure: "2 xícaras de aveia + 3 colheres de sopa de mel", visual: "A aveia está brilhante e levemente grudenta" }, { instruction: "Cozinhe na air fryer, mexendo a cada poucos minutos", measure: "300°F (149°C), 10-12 min", visual: "Dourada e perfumada, fica crocante ao esfriar" }],
    hi: [{ instruction: "ओट्स, शहद, तेल और बादाम को समान रूप से लिपटने तक मिलाएं", measure: "2 कप ओट्स + 3 बड़े चम्मच शहद", visual: "ओट्स चमकदार हों और थोड़े चिपके हों" }, { instruction: "एयर फ्रायर में पकाएं, हर कुछ मिनट में हिलाएं", measure: "300°F (149°C), 10-12 मिनट", visual: "सुनहरा और खुशबूदार हो, ठंडा होने पर कुरकुरा हो जाए" }],
    zh: [{ instruction: "将燕麦、蜂蜜、油和杏仁混合至均匀裹料", measure: "2杯燕麦 + 3汤匙蜂蜜", visual: "燕麦有光泽并略微结块" }, { instruction: "放入空气炸锅，每隔几分钟搅拌一次", measure: "300°F（149°C），10-12分钟", visual: "金黄芳香，冷却后变得酥脆" }],
    ar: [{ instruction: "اخلط الشوفان والعسل والزيت واللوز حتى يتغطى بالتساوي", measure: "2 كوب شوفان + 3 ملاعق كبيرة عسل", visual: "الشوفان لامع ومتكتل قليلًا" }, { instruction: "اطبخه بالمقلاة الهوائية، مع التحريك كل بضع دقائق", measure: "300 فهرنهايت (149 مئوية)، 10-12 دقيقة", visual: "ذهبي وعطر، يصبح مقرمشًا عند التبريد" }],
  },
  "air-fryer-veggie-chips": {
    es: [{ instruction: "Corta los vegetales muy finos con una mandolina o cuchillo afilado", measure: "Rodajas de 1/16 de pulgada", visual: "Las rodajas son uniformemente finas y translúcidas" }, { instruction: "Mezcla con aceite, cocina en freidora de aire por tandas, agitando con frecuencia", measure: "360°F (182°C), 10-12 min", visual: "Las chips están crujientes con bordes ligeramente curvados" }],
    fr: [{ instruction: "Coupez les légumes très finement avec une mandoline ou un couteau tranchant", measure: "Tranches de 2 mm", visual: "Les tranches sont uniformément fines et translucides" }, { instruction: "Mélangez avec l'huile, cuisez à la friteuse à air par lots, en secouant souvent", measure: "360°F (182°C), 10-12 min", visual: "Les chips sont croustillantes avec des bords légèrement recroquevillés" }],
    pt: [{ instruction: "Corte os legumes bem finos com um mandolim ou faca afiada", measure: "Fatias de 2 mm", visual: "As fatias são uniformemente finas e translúcidas" }, { instruction: "Misture com óleo, cozinhe na air fryer em lotes, sacudindo com frequência", measure: "360°F (182°C), 10-12 min", visual: "Os chips estão crocantes com bordas levemente enroladas" }],
    hi: [{ instruction: "मैंडोलिन या तेज़ चाकू से सब्ज़ियों को बहुत पतला काटें", measure: "1/16 इंच के टुकड़े", visual: "टुकड़े समान रूप से पतले और पारदर्शी हों" }, { instruction: "तेल के साथ मिलाएं, बैचों में एयर फ्रायर में पकाएं, बार-बार हिलाएं", measure: "360°F (182°C), 10-12 मिनट", visual: "चिप्स कुरकुरे हों, किनारे थोड़े मुड़े हों" }],
    zh: [{ instruction: "用切片器或锋利的刀将蔬菜切得非常薄", measure: "1/16英寸厚的切片", visual: "切片均匀薄透" }, { instruction: "与油拌匀，分批放入空气炸锅，经常摇晃", measure: "360°F（182°C），10-12分钟", visual: "脆片酥脆，边缘略微卷曲" }],
    ar: [{ instruction: "قطّع الخضار رفيعة جدًا باستخدام مبشرة أو سكين حاد", measure: "شرائح بسماكة 1/16 إنش", visual: "الشرائح رفيعة بالتساوي وشفافة" }, { instruction: "قلّبها مع الزيت، اطبخها بالمقلاة الهوائية على دفعات، مع الهز كثيرًا", measure: "360 فهرنهايت (182 مئوية)، 10-12 دقيقة", visual: "الرقائق مقرمشة مع حواف مجعدة قليلًا" }],
  },
  "british-fish-and-chips": {
    es: [{ instruction: "Corta las papas en bastones gruesos, remoja en agua fría", measure: "20 min de remojo", visual: "El agua se pone turbia por el almidón liberado" }, { instruction: "Bate harina y cerveza en una masa suave, sumerge los filetes de bacalao", measure: "1 taza de harina + 1 taza de cerveza", visual: "La masa cubre el pescado en una capa uniforme" }, { instruction: "Fríe primero las papas, luego el pescado empanizado hasta dorar", measure: "Aceite a 350°F (177°C), 4-5 min el pescado", visual: "La masa está crujiente y dorada intensa, las papas tiernas por dentro" }],
    fr: [{ instruction: "Coupez les pommes de terre en frites épaisses, trempez dans l'eau froide", measure: "20 min de trempage", visual: "L'eau devient trouble à cause de l'amidon libéré" }, { instruction: "Fouettez farine et bière en une pâte lisse, trempez les filets de cabillaud", measure: "1 tasse de farine + 1 tasse de bière", visual: "La pâte enrobe le poisson en une couche uniforme" }, { instruction: "Faites frire d'abord les frites, puis le poisson pané jusqu'à dorure", measure: "Huile à 350°F (177°C), 4-5 min pour le poisson", visual: "La pâte est croustillante et bien dorée, les frites tendres à l'intérieur" }],
    pt: [{ instruction: "Corte as batatas em fritas grossas, deixe de molho em água fria", measure: "20 min de molho", visual: "A água fica turva por causa do amido liberado" }, { instruction: "Bata farinha e cerveja numa massa lisa, mergulhe os filés de bacalhau", measure: "1 xícara de farinha + 1 xícara de cerveja", visual: "A massa cobre o peixe numa camada uniforme" }, { instruction: "Frite primeiro as fritas, depois o peixe empanado até dourar", measure: "Óleo a 350°F (177°C), 4-5 min o peixe", visual: "A massa está crocante e bem dourada, as fritas macias por dentro" }],
    hi: [{ instruction: "आलू को मोटे चिप्स में काटें, ठंडे पानी में भिगोएं", measure: "20 मिनट भिगोएं", visual: "निकले स्टार्च से पानी धुंधला हो जाए" }, { instruction: "आटा और बीयर को चिकने घोल में फेंटें, कॉड फिलेट्स डुबोएं", measure: "1 कप आटा + 1 कप बीयर", visual: "घोल मछली को समान परत में ढके" }, { instruction: "पहले चिप्स तलें, फिर घोल लगी मछली सुनहरी होने तक तलें", measure: "तेल 350°F (177°C), मछली 4-5 मिनट", visual: "घोल कुरकुरा और गहरा सुनहरा हो, चिप्स अंदर से नरम हों" }],
    zh: [{ instruction: "将土豆切成厚薯条，浸泡在冷水中", measure: "浸泡20分钟", visual: "水因析出的淀粉变得浑浊" }, { instruction: "将面粉和啤酒搅打成顺滑面糊，蘸鳕鱼片", measure: "1杯面粉 + 1杯啤酒", visual: "面糊均匀裹住鱼肉" }, { instruction: "先炸薯条，再炸裹粉的鱼至金黄", measure: "油温350°F（177°C），鱼炸4-5分钟", visual: "面糊酥脆呈深金黄色，薯条内部软嫩" }],
    ar: [{ instruction: "قطّع البطاطا إلى أصابع سميكة، انقعها في ماء بارد", measure: "نقع 20 دقيقة", visual: "يصبح الماء عكرًا بسبب النشا المنطلق" }, { instruction: "اخفق الطحين والبيرة إلى عجينة ناعمة، اغمس شرائح سمك القد فيها", measure: "كوب طحين + كوب بيرة", visual: "العجينة تغطي السمك بطبقة متساوية" }, { instruction: "اقلِ الأصابع أولًا، ثم السمك المغطى بالعجين حتى يصبح ذهبيًا", measure: "زيت 350 فهرنهايت (177 مئوية)، السمك 4-5 دقائق", visual: "العجينة مقرمشة وذهبية داكنة، الأصابع طرية من الداخل" }],
  },
  "british-shepherds-pie": {
    es: [{ instruction: "Dora la res con cebolla y zanahoria", measure: "8-10 min", visual: "No queda rosado, vegetales ablandados" }, { instruction: "Hierve y machaca las papas hasta que estén suaves", measure: "15 min hervir", visual: "El puré es suave sin grumos" }, { instruction: "Coloca la carne en capas en un plato, cubre con puré, hornea hasta dorar", measure: "400°F (204°C), 20 min", visual: "La parte superior del puré tiene picos dorados intensos" }],
    fr: [{ instruction: "Faites dorer le bœuf avec l'oignon et la carotte", measure: "8-10 min", visual: "Plus aucune trace rose, légumes ramollis" }, { instruction: "Faites bouillir et écrasez les pommes de terre jusqu'à consistance lisse", measure: "15 min de cuisson", visual: "La purée est lisse sans grumeaux" }, { instruction: "Étalez la viande dans un plat, couvrez de purée, enfournez jusqu'à dorure", measure: "400°F (204°C), 20 min", visual: "Le dessus de la purée a des pics bien dorés" }],
    pt: [{ instruction: "Doure a carne com cebola e cenoura", measure: "8-10 min", visual: "Sem rosa restante, legumes amolecidos" }, { instruction: "Ferva e amasse as batatas até ficarem lisas", measure: "15 min de fervura", visual: "O purê está liso sem grumos" }, { instruction: "Coloque a carne num prato, cubra com purê, asse até dourar", measure: "400°F (204°C), 20 min", visual: "O topo do purê tem picos bem dourados" }],
    hi: [{ instruction: "बीफ को प्याज़ और गाजर के साथ भूनें", measure: "8-10 मिनट", visual: "कोई गुलाबीपन न बचे, सब्ज़ियां नरम हों" }, { instruction: "आलू को उबालें और चिकना होने तक मैश करें", measure: "15 मिनट उबालें", visual: "मैश चिकना हो, कोई गुठली न हो" }, { instruction: "मांस को डिश में परत बनाएं, ऊपर मैश डालें, सुनहरा होने तक बेक करें", measure: "400°F (204°C), 20 मिनट", visual: "मैश के ऊपर सुनहरी चोटियां हों" }],
    zh: [{ instruction: "将牛肉与洋葱和胡萝卜一起炒香", measure: "8-10分钟", visual: "没有粉色残留，蔬菜变软" }, { instruction: "将土豆煮沸并捣成顺滑泥状", measure: "煮15分钟", visual: "土豆泥顺滑无颗粒" }, { instruction: "将肉铺在盘中，盖上土豆泥，烤至金黄", measure: "400°F（204°C），20分钟", visual: "土豆泥表面有金棕色尖峰" }],
    ar: [{ instruction: "حمّر اللحم مع البصل والجزر", measure: "8-10 دقائق", visual: "بلا لون وردي متبقٍ، الخضار لانت" }, { instruction: "اغلِ البطاطا واهرسها حتى تصبح ناعمة", measure: "15 دقيقة غلي", visual: "الهريس ناعم بلا تكتلات" }, { instruction: "رتّب اللحم في طبق، غطِّ بالهريس، اخبز حتى يصبح ذهبيًا", measure: "400 فهرنهايت (204 مئوية)، 20 دقيقة", visual: "لسطح الهريس قمم ذهبية داكنة" }],
  },
  "british-full-english": {
    es: [{ instruction: "Cocina la salchicha y el tocino en una sartén hasta dorar", measure: "8-10 min", visual: "La salchicha está bien cocida, el tocino crujiente" }, { instruction: "Fríe los huevos y calienta los tomates en la misma sartén", measure: "3-4 min", visual: "Las claras están cuajadas, las yemas aún blandas" }],
    fr: [{ instruction: "Faites cuire la saucisse et le bacon dans une poêle jusqu'à dorure", measure: "8-10 min", visual: "La saucisse est bien cuite, le bacon croustillant" }, { instruction: "Faites frire les œufs et réchauffez les tomates dans la même poêle", measure: "3-4 min", visual: "Les blancs sont pris, les jaunes encore mous" }],
    pt: [{ instruction: "Cozinhe a linguiça e o bacon numa frigideira até dourar", measure: "8-10 min", visual: "A linguiça está bem cozida, o bacon crocante" }, { instruction: "Frite os ovos e aqueça os tomates na mesma frigideira", measure: "3-4 min", visual: "As claras estão firmes, as gemas ainda moles" }],
    hi: [{ instruction: "सॉसेज और बेकन को पैन में सुनहरा होने तक पकाएं", measure: "8-10 मिनट", visual: "सॉसेज पूरी तरह पका हो, बेकन कुरकुरा हो" }, { instruction: "उसी पैन में अंडे तलें और टमाटर गर्म करें", measure: "3-4 मिनट", visual: "सफेद भाग सेट हो, जर्दी अभी भी नरम हो" }],
    zh: [{ instruction: "将香肠和培根在锅中煎至焦黄", measure: "8-10分钟", visual: "香肠熟透，培根酥脆" }, { instruction: "在同一个锅中煎鸡蛋并加热番茄", measure: "3-4分钟", visual: "蛋白凝固，蛋黄仍然柔软" }],
    ar: [{ instruction: "اطبخ النقانق والبيكون في مقلاة حتى يصبحا محمرين", measure: "8-10 دقائق", visual: "النقانق مطهوة تمامًا، البيكون مقرمش" }, { instruction: "اقلِ البيض وسخّن الطماطم في نفس المقلاة", measure: "3-4 دقائق", visual: "البياض متماسك، الصفار لا يزال طريًا" }],
  },
  "british-bangers-mash": {
    es: [{ instruction: "Hierve las papas hasta que estén tiernas, luego machaca con mantequilla", measure: "15-18 min hervir", visual: "El puré es suave y cremoso" }, { instruction: "Fríe las salchichas con cebolla en rodajas hasta dorar", measure: "12-15 min", visual: "Las salchichas están marrón intenso, cebollas ablandadas" }],
    fr: [{ instruction: "Faites bouillir les pommes de terre jusqu'à tendreté, puis écrasez avec du beurre", measure: "15-18 min de cuisson", visual: "La purée est lisse et crémeuse" }, { instruction: "Faites frire les saucisses avec l'oignon tranché jusqu'à dorure", measure: "12-15 min", visual: "Les saucisses sont bien brunes, oignons ramollis" }],
    pt: [{ instruction: "Ferva as batatas até ficarem macias, depois amasse com manteiga", measure: "15-18 min de fervura", visual: "O purê está liso e cremoso" }, { instruction: "Frite as salsichas com cebola fatiada até dourar", measure: "12-15 min", visual: "As salsichas estão bem douradas, cebolas amolecidas" }],
    hi: [{ instruction: "आलू को नरम होने तक उबालें, फिर मक्खन से मैश करें", measure: "15-18 मिनट उबालें", visual: "मैश चिकना और मलाईदार हो" }, { instruction: "कटे प्याज़ के साथ सॉसेज को सुनहरा होने तक तलें", measure: "12-15 मिनट", visual: "सॉसेज गहरे भूरे हों, प्याज़ नरम हों" }],
    zh: [{ instruction: "将土豆煮软，然后与黄油一起捣成泥", measure: "煮15-18分钟", visual: "土豆泥顺滑绵密" }, { instruction: "将香肠与洋葱片一起煎至焦黄", measure: "12-15分钟", visual: "香肠呈深棕色，洋葱变软" }],
    ar: [{ instruction: "اغلِ البطاطا حتى تلين، ثم اهرسها مع الزبدة", measure: "15-18 دقيقة غلي", visual: "الهريس ناعم وكريمي" }, { instruction: "اقلِ النقانق مع البصل المقطع حتى يصبحا محمرين", measure: "12-15 دقيقة", visual: "النقانق بنية داكنة، البصل لان" }],
  },
  "thai-green-curry": {
    es: [{ instruction: "Fríe la pasta de curry en una cucharada de leche de coco hasta que esté fragante", measure: "1-2 min", visual: "La pasta se oscurece ligeramente y huele fragante" }, { instruction: "Añade pollo y el resto de la leche de coco, cocina a fuego lento", measure: "10-12 min", visual: "El pollo está bien cocido, la salsa se ha espesado ligeramente" }, { instruction: "Añade vegetales, cocina a fuego lento hasta que estén tiernos", measure: "5 min", visual: "Los vegetales están brillantes y apenas tiernos" }],
    fr: [{ instruction: "Faites frire la pâte de curry dans une cuillerée de lait de coco jusqu'à ce que ce soit parfumé", measure: "1-2 min", visual: "La pâte fonce légèrement et sent bon" }, { instruction: "Ajoutez le poulet et le reste du lait de coco, laissez mijoter", measure: "10-12 min", visual: "Le poulet est bien cuit, la sauce a légèrement épaissi" }, { instruction: "Ajoutez les légumes, laissez mijoter jusqu'à tendreté", measure: "5 min", visual: "Les légumes sont vifs et juste tendres" }],
    pt: [{ instruction: "Frite a pasta de curry numa colherada de leite de coco até ficar perfumada", measure: "1-2 min", visual: "A pasta escurece levemente e cheira bem" }, { instruction: "Adicione o frango e o restante do leite de coco, cozinhe em fogo baixo", measure: "10-12 min", visual: "O frango está bem cozido, o molho engrossou levemente" }, { instruction: "Adicione os legumes, cozinhe em fogo baixo até ficarem macios", measure: "5 min", visual: "Os legumes estão vivos e apenas macios" }],
    hi: [{ instruction: "करी पेस्ट को एक चम्मच नारियल के दूध में खुशबूदार होने तक भूनें", measure: "1-2 मिनट", visual: "पेस्ट थोड़ा गहरा हो और खुशबू आए" }, { instruction: "चिकन और बचा हुआ नारियल का दूध डालें, धीमी आंच पर पकाएं", measure: "10-12 मिनट", visual: "चिकन पूरी तरह पका हो, सॉस थोड़ा गाढ़ा हुआ हो" }, { instruction: "सब्ज़ियां डालें, नरम होने तक धीमी आंच पर पकाएं", measure: "5 मिनट", visual: "सब्ज़ियां चमकीली और बस नरम हों" }],
    zh: [{ instruction: "用一勺椰奶将咖喱酱炒香", measure: "1-2分钟", visual: "酱料颜色略微加深并散发香气" }, { instruction: "加入鸡肉和剩余的椰奶，煨煮", measure: "10-12分钟", visual: "鸡肉熟透，酱汁略微变浓稠" }, { instruction: "加入蔬菜，煨煮至变软", measure: "5分钟", visual: "蔬菜色泽鲜亮且刚好变软" }],
    ar: [{ instruction: "اقلِ معجون الكاري في ملعقة من حليب جوز الهند حتى تفوح رائحته", measure: "1-2 دقيقة", visual: "يغمق المعجون قليلًا وتفوح رائحته" }, { instruction: "أضف الدجاج وباقي حليب جوز الهند، اتركه ينضج", measure: "10-12 دقيقة", visual: "الدجاج ناضج تمامًا، الصلصة تكاثفت قليلًا" }, { instruction: "أضف الخضار، اتركها تنضج حتى تلين", measure: "5 دقائق", visual: "الخضار زاهية ولينة فقط" }],
  },
  "thai-mango-sticky-rice": {
    es: [{ instruction: "Cocina al vapor el arroz glutinoso hasta que esté tierno", measure: "20-25 min", visual: "El arroz está translúcido y pegajoso" }, { instruction: "Calienta leche de coco con azúcar, vierte sobre el arroz", measure: "2-3 min calentar", visual: "El arroz absorbe la leche de coco, brillante" }, { instruction: "Sirve con mango en rodajas", measure: "N/A", visual: "El mango está maduro y dorado" }],
    fr: [{ instruction: "Faites cuire le riz gluant à la vapeur jusqu'à tendreté", measure: "20-25 min", visual: "Le riz est translucide et collant" }, { instruction: "Chauffez le lait de coco avec le sucre, versez sur le riz", measure: "2-3 min de chauffe", visual: "Le riz absorbe le lait de coco, brillant" }, { instruction: "Servez avec de la mangue en tranches", measure: "N/A", visual: "La mangue est mûre et dorée" }],
    pt: [{ instruction: "Cozinhe o arroz glutinoso no vapor até ficar macio", measure: "20-25 min", visual: "O arroz está translúcido e pegajoso" }, { instruction: "Aqueça o leite de coco com açúcar, despeje sobre o arroz", measure: "2-3 min aquecendo", visual: "O arroz absorve o leite de coco, brilhante" }, { instruction: "Sirva com manga fatiada", measure: "N/A", visual: "A manga está madura e dourada" }],
    hi: [{ instruction: "चिपचिपे चावल को नरम होने तक भाप में पकाएं", measure: "20-25 मिनट", visual: "चावल पारदर्शी और चिपचिपे हों" }, { instruction: "नारियल के दूध को चीनी के साथ गर्म करें, चावल पर डालें", measure: "2-3 मिनट गर्म करें", visual: "चावल नारियल का दूध सोख लें, चमकदार हों" }, { instruction: "कटे हुए आम के साथ परोसें", measure: "लागू नहीं", visual: "आम पका और सुनहरा हो" }],
    zh: [{ instruction: "将糯米蒸至软糯", measure: "20-25分钟", visual: "米粒半透明且黏糯" }, { instruction: "将椰奶与糖一起加热，浇在米饭上", measure: "加热2-3分钟", visual: "米饭吸收椰奶，有光泽" }, { instruction: "配切好的芒果一起食用", measure: "不适用", visual: "芒果成熟呈金黄色" }],
    ar: [{ instruction: "بخّر الأرز اللزج حتى يلين", measure: "20-25 دقيقة", visual: "الأرز شفاف ولزج" }, { instruction: "سخّن حليب جوز الهند مع السكر، اسكبه فوق الأرز", measure: "تسخين 2-3 دقائق", visual: "يمتص الأرز حليب جوز الهند، لامع" }, { instruction: "قدّمه مع شرائح المانجو", measure: "غير محدد", visual: "المانجو ناضجة وذهبية" }],
  },
  "thai-tom-yum-soup": {
    es: [{ instruction: "Cocina a fuego lento el caldo con hierba limón y hojas de lima", measure: "5-6 min", visual: "El caldo está fragante y humeante" }, { instruction: "Añade camarones y cocina a fuego lento hasta que estén apenas cocidos", measure: "3-4 min", visual: "Los camarones se vuelven rosados y se curvan en forma de C floja" }],
    fr: [{ instruction: "Laissez mijoter le bouillon avec la citronnelle et les feuilles de citron vert", measure: "5-6 min", visual: "Le bouillon est parfumé et fumant" }, { instruction: "Ajoutez les crevettes et laissez mijoter jusqu'à cuisson complète", measure: "3-4 min", visual: "Les crevettes deviennent roses et s'enroulent en C lâche" }],
    pt: [{ instruction: "Cozinhe o caldo em fogo baixo com capim-limão e folhas de limão", measure: "5-6 min", visual: "O caldo está perfumado e fumegante" }, { instruction: "Adicione o camarão e cozinhe em fogo baixo até ficar apenas no ponto", measure: "3-4 min", visual: "O camarão fica rosado e se curva em C frouxo" }],
    hi: [{ instruction: "शोरबे को लेमनग्रास और नींबू के पत्तों के साथ उबलने दें", measure: "5-6 मिनट", visual: "शोरबा खुशबूदार और भाप छोड़ता हो" }, { instruction: "झींगे डालें और बस पकने तक उबलने दें", measure: "3-4 मिनट", visual: "झींगे गुलाबी हों और ढीले C आकार में मुड़ें" }],
    zh: [{ instruction: "将高汤与香茅和青柠叶一起煨煮", measure: "5-6分钟", visual: "高汤香气四溢并冒着热气" }, { instruction: "加入虾并煨煮至刚好熟透", measure: "3-4分钟", visual: "虾变成粉色并卷成松散的C形" }],
    ar: [{ instruction: "اترك المرق ينضج مع الليمون العشبي وأوراق الليمون", measure: "5-6 دقائق", visual: "المرق عطر ويتصاعد منه البخار" }, { instruction: "أضف الجمبري واتركه ينضج حتى ينضج للتو", measure: "3-4 دقائق", visual: "يتحول الجمبري إلى وردي ويتقوس بشكل حرف C فضفاض" }],
  },
  "african-nigerian-jollof": {
    es: [{ instruction: "Licúa tomates, pasta de tomate, cebolla y pimiento en una base suave", measure: "N/A", visual: "La mezcla es suave y rojo intenso" }, { instruction: "Fríe la base en aceite hasta que se oscurezca y reduzca", measure: "15-18 min", visual: "La salsa se ha espesado, el aceite se separa arriba" }, { instruction: "Mezcla con arroz parhervido, tapa y cocina a fuego bajo hasta que esté tierno", measure: "20-25 min", visual: "El arroz está tierno con un fondo ligeramente ahumado" }],
    fr: [{ instruction: "Mixez tomates, pâte de tomate, oignon et poivron en une base lisse", measure: "N/A", visual: "Le mélange est lisse et rouge foncé" }, { instruction: "Faites frire la base dans l'huile jusqu'à ce qu'elle fonce et réduise", measure: "15-18 min", visual: "La sauce a épaissi, l'huile se sépare dessus" }, { instruction: "Incorporez le riz étuvé, couvrez et cuisez à feu doux jusqu'à tendreté", measure: "20-25 min", visual: "Le riz est tendre avec un fond légèrement fumé" }],
    pt: [{ instruction: "Bata tomates, extrato de tomate, cebola e pimentão numa base lisa", measure: "N/A", visual: "A mistura é lisa e vermelho intenso" }, { instruction: "Frite a base no óleo até escurecer e reduzir", measure: "15-18 min", visual: "O molho engrossou, o óleo se separa em cima" }, { instruction: "Misture com arroz pré-cozido, tampe e cozinhe em fogo baixo até ficar macio", measure: "20-25 min", visual: "O arroz está macio com um fundo levemente defumado" }],
    hi: [{ instruction: "टमाटर, टमाटर पेस्ट, प्याज़ और मिर्च को चिकने बेस में ब्लेंड करें", measure: "लागू नहीं", visual: "मिश्रण चिकना और गहरा लाल हो" }, { instruction: "बेस को तेल में गहरा होने और गाढ़ा होने तक भूनें", measure: "15-18 मिनट", visual: "सॉस गाढ़ा हो गया हो, तेल ऊपर अलग हो" }, { instruction: "पैरबॉइल्ड चावल मिलाएं, ढककर धीमी आंच पर नरम होने तक पकाएं", measure: "20-25 मिनट", visual: "चावल नरम हों, तली हल्की धुएँदार हो" }],
    zh: [{ instruction: "将番茄、番茄酱、洋葱和辣椒打成顺滑的酱底", measure: "不适用", visual: "混合物顺滑呈深红色" }, { instruction: "将酱底用油炒至颜色变深并收汁", measure: "15-18分钟", visual: "酱汁已变浓稠，油在表面分离" }, { instruction: "拌入半熟米，盖上锅盖小火煮至软透", measure: "20-25分钟", visual: "米饭软糯，锅底略带烟熏味" }],
    ar: [{ instruction: "اخلط الطماطم ومعجون الطماطم والبصل والفلفل إلى قاعدة ناعمة", measure: "غير محدد", visual: "الخليط ناعم وأحمر داكن" }, { instruction: "اقلِ القاعدة بالزيت حتى تغمق وتقل كميتها", measure: "15-18 دقيقة", visual: "تكاثفت الصلصة، ينفصل الزيت فوقها" }, { instruction: "أضف الأرز نصف المطهو، غطِّ واطبخ على نار هادئة حتى يلين", measure: "20-25 دقيقة", visual: "الأرز طري مع قاع مدخن قليلًا" }],
  },
  "african-suya-skewers": {
    es: [{ instruction: "Corta la res en rodajas finas, cubre generosamente con maní triturado y especias", measure: "N/A", visual: "El recubrimiento cubre la carne uniformemente por todos lados" }, { instruction: "Ensarta en brochetas y asa o sella en sartén, volteando con frecuencia", measure: "10-12 min", visual: "Los bordes están chamuscados y crujientes, la carne bien cocida" }],
    fr: [{ instruction: "Coupez le bœuf finement, enrobez généreusement de cacahuètes concassées et d'épices", measure: "N/A", visual: "L'enrobage recouvre la viande uniformément de tous côtés" }, { instruction: "Enfilez sur des brochettes et grillez ou saisissez à la poêle, en retournant souvent", measure: "10-12 min", visual: "Les bords sont grillés et croustillants, la viande bien cuite" }],
    pt: [{ instruction: "Corte a carne fina, cubra generosamente com amendoim triturado e especiarias", measure: "N/A", visual: "O revestimento cobre a carne uniformemente em todos os lados" }, { instruction: "Enfie em espetos e grelhe ou sele na frigideira, virando com frequência", measure: "10-12 min", visual: "As bordas estão chamuscadas e crocantes, a carne bem cozida" }],
    hi: [{ instruction: "बीफ को पतला काटें, कुटी हुई मूंगफली और मसालों से उदारता से ढकें", measure: "लागू नहीं", visual: "कोटिंग मांस को हर तरफ समान रूप से ढके" }, { instruction: "सींक में पिरोएं और ग्रिल या पैन-सियर करें, बार-बार पलटें", measure: "10-12 मिनट", visual: "किनारे जले और कुरकुरे हों, मांस पूरी तरह पका हो" }],
    zh: [{ instruction: "将牛肉切薄片，慷慨地裹上碎花生和香料", measure: "不适用", visual: "裹料均匀覆盖肉的各面" }, { instruction: "穿在扦子上烤制或用平底锅煎，经常翻面", measure: "10-12分钟", visual: "边缘焦香酥脆，肉完全熟透" }],
    ar: [{ instruction: "قطّع اللحم البقري رفيعًا، غطّه بسخاء بالفول السوداني المطحون والتوابل", measure: "غير محدد", visual: "تغطي الطبقة اللحم بالتساوي من كل الجوانب" }, { instruction: "ضعه على أسياخ واشوِه أو حمّره في مقلاة، مع القلب كثيرًا", measure: "10-12 دقيقة", visual: "الحواف محروقة ومقرمشة، اللحم مطهو تمامًا" }],
  },
  "african-chapati": {
    es: [{ instruction: "Amasa harina, aceite, sal y agua en una masa suave, deja reposar", measure: "15 min de reposo", visual: "La masa es suave y elástica, no pegajosa" }, { instruction: "Extiende fina, unta con aceite, cocina en una sartén seca caliente, volteando con frecuencia", measure: "2-3 min por lado", visual: "Se forman manchas doradas intensas en ambos lados, las capas son hojaldradas" }],
    fr: [{ instruction: "Pétrissez farine, huile, sel et eau en une pâte souple, laissez reposer", measure: "15 min de repos", visual: "La pâte est souple et élastique, pas collante" }, { instruction: "Étalez finement, badigeonnez d'huile, cuisez sur une poêle sèche chaude, en retournant souvent", measure: "2-3 min par face", visual: "Des taches bien dorées se forment des deux côtés, les couches sont feuilletées" }],
    pt: [{ instruction: "Sove farinha, óleo, sal e água numa massa macia, deixe descansar", measure: "15 min de descanso", visual: "A massa está macia e elástica, não grudenta" }, { instruction: "Abra fina, pincele com óleo, cozinhe numa frigideira seca quente, virando com frequência", measure: "2-3 min de cada lado", visual: "Formam-se manchas bem douradas dos dois lados, as camadas são folhadas" }],
    hi: [{ instruction: "आटा, तेल, नमक और पानी को नरम आटे में गूंधें, आराम दें", measure: "15 मिनट आराम", visual: "आटा नरम और लचीला हो, चिपचिपा नहीं" }, { instruction: "पतला बेलें, तेल लगाएं, गर्म सूखे पैन में पकाएं, बार-बार पलटें", measure: "हर तरफ 2-3 मिनट", visual: "दोनों तरफ सुनहरे धब्बे बनें, परतें परतदार हों" }],
    zh: [{ instruction: "将面粉、油、盐和水揉成柔软的面团，静置", measure: "静置15分钟", visual: "面团柔软有弹性，不粘手" }, { instruction: "擀薄，刷上油，在热干锅中烹饪，经常翻面", measure: "每面2-3分钟", visual: "两面都出现金棕色斑点，层次酥松" }],
    ar: [{ instruction: "اعجن الطحين والزيت والملح والماء إلى عجينة طرية، دعها ترتاح", measure: "راحة 15 دقيقة", visual: "العجينة طرية ومرنة، غير لزجة" }, { instruction: "افردها رفيعة، ادهنها بالزيت، اطبخها على مقلاة جافة ساخنة، مع القلب كثيرًا", measure: "2-3 دقائق لكل جانب", visual: "تتشكل بقع ذهبية داكنة على الجانبين، الطبقات هشة" }],
  },
  "african-peanut-stew": {
    es: [{ instruction: "Sofríe la cebolla hasta que esté suave", measure: "4-5 min", visual: "La cebolla está translúcida" }, { instruction: "Mezcla con tomates, mantequilla de maní y camote, cocina a fuego lento", measure: "20-25 min", visual: "El camote está tierno al tenedor, la salsa es espesa y brillante" }],
    fr: [{ instruction: "Faites revenir l'oignon jusqu'à tendreté", measure: "4-5 min", visual: "L'oignon est translucide" }, { instruction: "Incorporez tomates, beurre de cacahuète et patate douce, laissez mijoter", measure: "20-25 min", visual: "La patate douce est tendre à la fourchette, la sauce est épaisse et brillante" }],
    pt: [{ instruction: "Refogue a cebola até ficar macia", measure: "4-5 min", visual: "A cebola está translúcida" }, { instruction: "Misture com tomates, pasta de amendoim e batata-doce, cozinhe em fogo baixo", measure: "20-25 min", visual: "A batata-doce está macia ao garfo, o molho é grosso e brilhante" }],
    hi: [{ instruction: "प्याज़ को नरम होने तक भूनें", measure: "4-5 मिनट", visual: "प्याज़ पारदर्शी हो" }, { instruction: "टमाटर, पीनट बटर और शकरकंद डालें, धीमी आंच पर पकाएं", measure: "20-25 मिनट", visual: "शकरकंद कांटे से नरम हो, सॉस गाढ़ा और चमकदार हो" }],
    zh: [{ instruction: "将洋葱炒软", measure: "4-5分钟", visual: "洋葱变得半透明" }, { instruction: "拌入番茄、花生酱和红薯，煨煮", measure: "20-25分钟", visual: "红薯用叉子能轻松插入，酱汁浓稠有光泽" }],
    ar: [{ instruction: "قلِّب البصل حتى يلين", measure: "4-5 دقائق", visual: "البصل شفاف" }, { instruction: "أضف الطماطم وزبدة الفول السوداني والبطاطا الحلوة، اتركه ينضج", measure: "20-25 دقيقة", visual: "البطاطا الحلوة طرية بالشوكة، الصلصة سميكة ولامعة" }],
  },
  "ethiopian-doro-wat": {
    es: [{ instruction: "Cocina la cebolla a fuego bajo hasta que esté muy suave, revolviendo con frecuencia", measure: "15-20 min", visual: "La cebolla se ha convertido en una pasta suave tipo mermelada" }, { instruction: "Mezcla con especia berbere, cocina brevemente, luego añade pollo y cocina a fuego lento", measure: "25-30 min", visual: "El pollo está tierno, la salsa es roja intensa y espesa" }, { instruction: "Añade huevos duros para calentar", measure: "5 min", visual: "Los huevos están cubiertos de salsa, calientes por dentro" }],
    fr: [{ instruction: "Faites cuire l'oignon à feu doux jusqu'à ce qu'il soit très tendre, en remuant souvent", measure: "15-20 min", visual: "L'oignon s'est transformé en une pâte douce et confite" }, { instruction: "Incorporez l'épice berbéré, cuisez brièvement, puis ajoutez le poulet et laissez mijoter", measure: "25-30 min", visual: "Le poulet est tendre, la sauce est rouge foncé et épaisse" }, { instruction: "Ajoutez les œufs durs pour les réchauffer", measure: "5 min", visual: "Les œufs sont enrobés de sauce, bien chauds" }],
    pt: [{ instruction: "Cozinhe a cebola em fogo baixo até ficar bem macia, mexendo com frequência", measure: "15-20 min", visual: "A cebola se transformou numa pasta macia tipo geleia" }, { instruction: "Misture com especiaria berbere, cozinhe brevemente, depois adicione o frango e cozinhe em fogo baixo", measure: "25-30 min", visual: "O frango está macio, o molho é vermelho intenso e grosso" }, { instruction: "Adicione ovos cozidos para aquecer", measure: "5 min", visual: "Os ovos estão cobertos de molho, aquecidos por dentro" }],
    hi: [{ instruction: "प्याज़ को धीमी आंच पर बार-बार हिलाते हुए बहुत नरम होने तक पकाएं", measure: "15-20 मिनट", visual: "प्याज़ नरम, जैम जैसे पेस्ट में बदल गया हो" }, { instruction: "बरबरे मसाला मिलाएं, थोड़ी देर पकाएं, फिर चिकन डालकर धीमी आंच पर पकाएं", measure: "25-30 मिनट", visual: "चिकन नरम हो, सॉस गहरा लाल और गाढ़ा हो" }, { instruction: "गर्म करने के लिए उबले अंडे डालें", measure: "5 मिनट", visual: "अंडे सॉस में लिपटे हों, अंदर तक गर्म हों" }],
    zh: [{ instruction: "用小火煮洋葱至非常软烂，经常搅拌", measure: "15-20分钟", visual: "洋葱已经化成柔软的果酱状" }, { instruction: "拌入柏柏尔香料，稍微煮一下，然后加入鸡肉煨煮", measure: "25-30分钟", visual: "鸡肉软嫩，酱汁呈深红色且浓稠" }, { instruction: "加入水煮蛋加热", measure: "5分钟", visual: "鸡蛋裹上酱汁，热透" }],
    ar: [{ instruction: "اطبخ البصل على نار هادئة حتى يلين تمامًا، مع التحريك المتكرر", measure: "15-20 دقيقة", visual: "تحوّل البصل إلى معجون طري أشبه بالمربى" }, { instruction: "أضف توابل البربري، اطبخ لفترة قصيرة، ثم أضف الدجاج واتركه ينضج", measure: "25-30 دقيقة", visual: "الدجاج طري، الصلصة حمراء داكنة وسميكة" }, { instruction: "أضف البيض المسلوق لتسخينه", measure: "5 دقائق", visual: "البيض مغطى بالصلصة، ساخن من الداخل" }],
  },
  "ethiopian-shiro": {
    es: [{ instruction: "Sofríe cebolla y ajo hasta que estén suaves", measure: "5 min", visual: "La cebolla está translúcida" }, { instruction: "Bate harina de garbanzo en agua hasta que esté suave, añade a la olla con berbere", measure: "2 tazas de agua", visual: "La mezcla no tiene grumos antes de añadir" }, { instruction: "Cocina a fuego lento, batiendo con frecuencia, hasta que espese", measure: "10-12 min", visual: "El guiso está suave y espeso como una avena líquida" }],
    fr: [{ instruction: "Faites revenir l'oignon et l'ail jusqu'à tendreté", measure: "5 min", visual: "L'oignon est translucide" }, { instruction: "Fouettez la farine de pois chiche dans l'eau jusqu'à consistance lisse, ajoutez à la casserole avec le berbéré", measure: "2 tasses d'eau", visual: "Le mélange est sans grumeaux avant d'ajouter" }, { instruction: "Laissez mijoter, en fouettant souvent, jusqu'à épaississement", measure: "10-12 min", visual: "Le ragoût est lisse et épais comme une bouillie liquide" }],
    pt: [{ instruction: "Refogue cebola e alho até ficarem macios", measure: "5 min", visual: "A cebola está translúcida" }, { instruction: "Bata a farinha de grão-de-bico na água até ficar lisa, adicione à panela com berbere", measure: "2 xícaras de água", visual: "A mistura está sem grumos antes de adicionar" }, { instruction: "Cozinhe em fogo baixo, batendo com frequência, até engrossar", measure: "10-12 min", visual: "O ensopado está liso e grosso como um mingau ralo" }],
    hi: [{ instruction: "प्याज़ और लहसुन को नरम होने तक भूनें", measure: "5 मिनट", visual: "प्याज़ पारदर्शी हो" }, { instruction: "बेसन को पानी में चिकना होने तक फेंटें, बरबरे के साथ बर्तन में डालें", measure: "2 कप पानी", visual: "डालने से पहले मिश्रण में कोई गुठली न हो" }, { instruction: "गाढ़ा होने तक बार-बार फेंटते हुए धीमी आंच पर पकाएं", measure: "10-12 मिनट", visual: "स्ट्यू चिकना और पतले दलिया जैसा गाढ़ा हो" }],
    zh: [{ instruction: "将洋葱和大蒜炒软", measure: "5分钟", visual: "洋葱变得半透明" }, { instruction: "将鹰嘴豆粉在水中搅打至顺滑，加入锅中并放入柏柏尔香料", measure: "2杯水", visual: "加入前混合物无颗粒" }, { instruction: "煨煮，经常搅打，直至变浓稠", measure: "10-12分钟", visual: "炖菜顺滑浓稠，像稀粥一样" }],
    ar: [{ instruction: "قلِّب البصل والثوم حتى يلينا", measure: "5 دقائق", visual: "البصل شفاف" }, { instruction: "اخفق دقيق الحمص في الماء حتى يصبح ناعمًا، أضفه للقدر مع البربري", measure: "كوبان ماء", visual: "الخليط خالٍ من التكتلات قبل الإضافة" }, { instruction: "اتركه ينضج، مع الخفق كثيرًا، حتى يتكاثف", measure: "10-12 دقيقة", visual: "اليخنة ناعمة وسميكة كعصيدة رخوة" }],
  },
  "ethiopian-tikil-gomen": {
    es: [{ instruction: "Sofríe cebolla y ajo hasta que estén fragantes", measure: "3-4 min", visual: "La cebolla está suave y translúcida" }, { instruction: "Añade repollo y zanahoria, tapa y cocina hasta que estén tiernos", measure: "15-18 min", visual: "Los vegetales están tiernos pero mantienen su forma" }],
    fr: [{ instruction: "Faites revenir l'oignon et l'ail jusqu'à ce que ce soit parfumé", measure: "3-4 min", visual: "L'oignon est tendre et translucide" }, { instruction: "Ajoutez chou et carotte, couvrez et cuisez jusqu'à tendreté", measure: "15-18 min", visual: "Les légumes sont tendres mais gardent leur forme" }],
    pt: [{ instruction: "Refogue cebola e alho até ficarem perfumados", measure: "3-4 min", visual: "A cebola está macia e translúcida" }, { instruction: "Adicione repolho e cenoura, tampe e cozinhe até ficarem macios", measure: "15-18 min", visual: "Os legumes estão macios mas mantêm a forma" }],
    hi: [{ instruction: "प्याज़ और लहसुन को खुशबूदार होने तक भूनें", measure: "3-4 मिनट", visual: "प्याज़ नरम और पारदर्शी हो" }, { instruction: "गोभी और गाजर डालें, ढककर नरम होने तक पकाएं", measure: "15-18 मिनट", visual: "सब्ज़ियां नरम हों लेकिन आकार बनाए रखें" }],
    zh: [{ instruction: "将洋葱和大蒜炒香", measure: "3-4分钟", visual: "洋葱变软且半透明" }, { instruction: "加入卷心菜和胡萝卜，加盖煮至变软", measure: "15-18分钟", visual: "蔬菜变软但仍保持形状" }],
    ar: [{ instruction: "قلِّب البصل والثوم حتى تفوح رائحتهما", measure: "3-4 دقائق", visual: "البصل لين وشفاف" }, { instruction: "أضف الملفوف والجزر، غطِّ واطبخ حتى يلينا", measure: "15-18 دقيقة", visual: "الخضار طرية لكنها تحتفظ بشكلها" }],
  },
  "french-quiche-lorraine": {
    es: [{ instruction: "Cocina el tocino hasta que esté crujiente, resérvalo", measure: "6-8 min", visual: "Dorado intenso y firme" }, { instruction: "Bate huevos, crema y queso, vierte sobre el tocino en una masa de tarta", measure: "4 huevos + 1 taza de crema", visual: "La mezcla es suave y se vierte uniformemente" }, { instruction: "Hornea hasta que cuaje y esté dorado", measure: "375°F (190°C), 30-35 min", visual: "El centro está apenas cuajado, la parte superior dorada" }],
    fr: [{ instruction: "Faites cuire le bacon jusqu'à ce qu'il soit croustillant, réservez", measure: "6-8 min", visual: "Bien doré et ferme" }, { instruction: "Fouettez œufs, crème et fromage, versez sur le bacon dans une pâte à tarte", measure: "4 œufs + 1 tasse de crème", visual: "Le mélange est lisse et versé uniformément" }, { instruction: "Enfournez jusqu'à ce que ce soit pris et doré", measure: "190°C, 30-35 min", visual: "Le centre est juste pris, le dessus doré" }],
    pt: [{ instruction: "Cozinhe o bacon até ficar crocante, reserve", measure: "6-8 min", visual: "Bem dourado e firme" }, { instruction: "Bata ovos, creme de leite e queijo, despeje sobre o bacon numa massa de torta", measure: "4 ovos + 1 xícara de creme de leite", visual: "A mistura é lisa e despejada uniformemente" }, { instruction: "Asse até firmar e dourar", measure: "190°C, 30-35 min", visual: "O centro está apenas firme, o topo dourado" }],
    hi: [{ instruction: "बेकन को कुरकुरा होने तक पकाएं, अलग रखें", measure: "6-8 मिनट", visual: "गहरा सुनहरा और सख्त" }, { instruction: "अंडे, क्रीम और चीज़ फेंटें, पाई क्रस्ट में बेकन पर डालें", measure: "4 अंडे + 1 कप क्रीम", visual: "मिश्रण चिकना हो और समान रूप से डाला जाए" }, { instruction: "सेट होने और सुनहरा होने तक बेक करें", measure: "190°C, 30-35 मिनट", visual: "बीच बस सेट हो, ऊपर सुनहरा हो" }],
    zh: [{ instruction: "将培根煎至酥脆，盛出备用", measure: "6-8分钟", visual: "深金黄色且坚实" }, { instruction: "将鸡蛋、奶油和芝士搅打，倒在派皮中的培根上", measure: "4个鸡蛋 + 1杯奶油", visual: "混合物顺滑且均匀倒入" }, { instruction: "烤至凝固金黄", measure: "190°C，30-35分钟", visual: "中心刚好凝固，表面金黄" }],
    ar: [{ instruction: "اطبخ البيكون حتى يصبح مقرمشًا، ضعه جانبًا", measure: "6-8 دقائق", visual: "ذهبي داكن ومتماسك" }, { instruction: "اخفق البيض والكريمة والجبنة، اسكبها فوق البيكون في قاعدة فطيرة", measure: "4 بيضات + كوب كريمة", visual: "الخليط ناعم ومسكوب بالتساوي" }, { instruction: "اخبز حتى يتماسك ويصبح ذهبيًا", measure: "190 مئوية، 30-35 دقيقة", visual: "المنتصف متماسك للتو، الأعلى ذهبي" }],
  },
  "french-onion-soup": {
    es: [{ instruction: "Cocina las cebollas en rodajas con mantequilla a fuego bajo hasta que estén profundamente caramelizadas", measure: "35-40 min", visual: "Las cebollas están doradas intensas y tipo mermelada" }, { instruction: "Añade caldo y cocina a fuego lento", measure: "10 min", visual: "El caldo es rico y oscuro" }, { instruction: "Cubre con pan y queso, gratina hasta que burbujee", measure: "3-4 min", visual: "El queso está completamente derretido y dorado en zonas" }],
    fr: [{ instruction: "Faites cuire les oignons tranchés dans le beurre à feu doux jusqu'à caramélisation profonde", measure: "35-40 min", visual: "Les oignons sont bien dorés et confits" }, { instruction: "Ajoutez le bouillon et laissez mijoter", measure: "10 min", visual: "Le bouillon est riche et foncé" }, { instruction: "Garnissez de pain et de fromage, passez au gril jusqu'à ce que ça bouillonne", measure: "3-4 min", visual: "Le fromage est entièrement fondu et bruni par endroits" }],
    pt: [{ instruction: "Cozinhe as cebolas fatiadas na manteiga em fogo baixo até caramelizar profundamente", measure: "35-40 min", visual: "As cebolas estão bem douradas e tipo geleia" }, { instruction: "Adicione o caldo e cozinhe em fogo baixo", measure: "10 min", visual: "O caldo é rico e escuro" }, { instruction: "Cubra com pão e queijo, gratine até borbulhar", measure: "3-4 min", visual: "O queijo está totalmente derretido e dourado em partes" }],
    hi: [{ instruction: "कटे प्याज़ को मक्खन में धीमी आंच पर गहरा कैरेमलाइज़ होने तक पकाएं", measure: "35-40 मिनट", visual: "प्याज़ गहरे सुनहरे और जैम जैसे हों" }, { instruction: "शोरबा डालें और धीमी आंच पर पकाएं", measure: "10 मिनट", visual: "शोरबा गाढ़ा और गहरा हो" }, { instruction: "ब्रेड और चीज़ से ढकें, बुलबुले आने तक ब्रॉइल करें", measure: "3-4 मिनट", visual: "चीज़ पूरी तरह पिघला और जगह-जगह भूरा हो" }],
    zh: [{ instruction: "将洋葱片用黄油小火煮至深度焦糖化", measure: "35-40分钟", visual: "洋葱呈深金黄色且果酱状" }, { instruction: "加入高汤煨煮", measure: "10分钟", visual: "高汤浓郁深色" }, { instruction: "铺上面包和芝士，烤至冒泡", measure: "3-4分钟", visual: "芝士完全融化并局部焦黄" }],
    ar: [{ instruction: "اطبخ البصل المقطع بالزبدة على نار هادئة حتى يتكرمل بعمق", measure: "35-40 دقيقة", visual: "البصل ذهبي داكن ومربى القوام" }, { instruction: "أضف المرق واتركه ينضج", measure: "10 دقائق", visual: "المرق غني وداكن" }, { instruction: "غطِّ بالخبز والجبنة، اشوِ حتى يصبح فقاعيًا", measure: "3-4 دقائق", visual: "الجبنة ذائبة بالكامل ومحمرة في بعض الأماكن" }],
  },
  "french-crepes": {
    es: [{ instruction: "Bate harina, huevos, leche y mantequilla derretida en una masa fina y suave", measure: "1 taza de harina + 2 huevos + 1.5 tazas de leche", visual: "La masa se puede verter, sin grumos" }, { instruction: "Vierte una capa fina en una sartén caliente con mantequilla, gira para cubrir, voltea una vez", measure: "1-2 min por lado", visual: "Los bordes están ligeramente dorados y encajados" }],
    fr: [{ instruction: "Fouettez farine, œufs, lait et beurre fondu en une pâte fine et lisse", measure: "1 tasse de farine + 2 œufs + 1,5 tasse de lait", visual: "La pâte est fluide, sans grumeaux" }, { instruction: "Versez une fine couche dans une poêle chaude beurrée, tournez pour enrober, retournez une fois", measure: "1-2 min par face", visual: "Les bords sont légèrement dorés et dentelés" }],
    pt: [{ instruction: "Bata farinha, ovos, leite e manteiga derretida numa massa fina e lisa", measure: "1 xícara de farinha + 2 ovos + 1,5 xícara de leite", visual: "A massa é despejável, sem grumos" }, { instruction: "Despeje uma camada fina numa frigideira quente amanteigada, gire para cobrir, vire uma vez", measure: "1-2 min de cada lado", visual: "As bordas estão levemente douradas e rendadas" }],
    hi: [{ instruction: "आटा, अंडे, दूध और पिघला मक्खन पतले, चिकने घोल में फेंटें", measure: "1 कप आटा + 2 अंडे + 1.5 कप दूध", visual: "घोल डालने लायक हो, कोई गुठली नहीं" }, { instruction: "गर्म मक्खन लगे पैन में पतली परत डालें, घुमाकर फैलाएं, एक बार पलटें", measure: "हर तरफ 1-2 मिनट", visual: "किनारे हल्के सुनहरे और जालीदार हों" }],
    zh: [{ instruction: "将面粉、鸡蛋、牛奶和融化的黄油搅打成薄而顺滑的面糊", measure: "1杯面粉 + 2个鸡蛋 + 1.5杯牛奶", visual: "面糊可倾倒，无颗粒" }, { instruction: "倒一薄层入热黄油锅中，转动铺匀，翻面一次", measure: "每面1-2分钟", visual: "边缘微微金黄呈蕾丝状" }],
    ar: [{ instruction: "اخفق الطحين والبيض والحليب والزبدة الذائبة إلى عجينة رفيعة وناعمة", measure: "كوب طحين + بيضتان + كوب ونصف حليب", visual: "العجينة قابلة للسكب، بدون تكتلات" }, { instruction: "اسكب طبقة رفيعة في مقلاة ساخنة مزبدة، أدرها للتغطية، اقلبها مرة واحدة", measure: "1-2 دقيقة لكل جانب", visual: "الحواف ذهبية خفيفة وشبكية" }],
  },
  "spanish-paella": {
    es: [{ instruction: "Sofríe pimiento en una sartén ancha hasta que esté suave", measure: "4-5 min", visual: "El pimiento está suave, ligeramente dorado" }, { instruction: "Añade arroz y caldo, cocina a fuego lento sin remover", measure: "18-20 min", visual: "El arroz ha absorbido el líquido, se forma una costra ligera en el fondo" }, { instruction: "Coloca camarones en el arroz, tapa brevemente hasta que estén cocidos", measure: "5 min", visual: "Los camarones están rosados y curvados" }],
    fr: [{ instruction: "Faites revenir le poivron dans une large poêle jusqu'à tendreté", measure: "4-5 min", visual: "Le poivron est tendre, légèrement doré" }, { instruction: "Ajoutez riz et bouillon, laissez mijoter sans remuer", measure: "18-20 min", visual: "Le riz a absorbé le liquide, une légère croûte se forme au fond" }, { instruction: "Nichez les crevettes dans le riz, couvrez brièvement jusqu'à cuisson", measure: "5 min", visual: "Les crevettes sont roses et enroulées" }],
    pt: [{ instruction: "Refogue o pimentão numa frigideira larga até amolecer", measure: "4-5 min", visual: "O pimentão está macio, levemente dourado" }, { instruction: "Adicione arroz e caldo, cozinhe em fogo baixo sem mexer", measure: "18-20 min", visual: "O arroz absorveu o líquido, forma-se uma leve crosta no fundo" }, { instruction: "Aninhe o camarão no arroz, tampe brevemente até cozinhar", measure: "5 min", visual: "O camarão está rosado e curvado" }],
    hi: [{ instruction: "चौड़े पैन में शिमला मिर्च को नरम होने तक भूनें", measure: "4-5 मिनट", visual: "मिर्च नरम हो, हल्की सुनहरी हो" }, { instruction: "चावल और शोरबा डालें, बिना हिलाए धीमी आंच पर पकाएं", measure: "18-20 मिनट", visual: "चावल ने तरल सोख लिया हो, तली में हल्की परत बने" }, { instruction: "झींगे को चावल में रखें, पकने तक थोड़ी देर ढकें", measure: "5 मिनट", visual: "झींगे गुलाबी हों और मुड़े हों" }],
    zh: [{ instruction: "在宽底锅中将甜椒炒软", measure: "4-5分钟", visual: "甜椒变软，微微焦黄" }, { instruction: "加入米饭和高汤，不搅拌地煨煮", measure: "18-20分钟", visual: "米饭吸收了液体，锅底形成一层薄脆壳" }, { instruction: "将虾摆入米饭中，短暂加盖至熟", measure: "5分钟", visual: "虾呈粉色且卷曲" }],
    ar: [{ instruction: "قلِّب الفلفل الحلو في مقلاة واسعة حتى يلين", measure: "4-5 دقائق", visual: "الفلفل لين، محمر قليلًا" }, { instruction: "أضف الأرز والمرق، اتركه ينضج دون تحريك", measure: "18-20 دقيقة", visual: "امتص الأرز السائل، تتكون قشرة خفيفة في القاع" }, { instruction: "رتّب الجمبري في الأرز، غطِّ لفترة قصيرة حتى ينضج", measure: "5 دقائق", visual: "الجمبري وردي ومتقوس" }],
  },
  "spanish-patatas-bravas": {
    es: [{ instruction: "Corta las papas en cubos y fríe o asa hasta que estén crujientes y doradas", measure: "400°F (204°C), 25 min", visual: "Los bordes están dorados intensos y crujientes" }, { instruction: "Cocina tomates a fuego lento con pimentón en una salsa espesa y especiada", measure: "10 min", visual: "La salsa se ha espesado y oscurecido" }],
    fr: [{ instruction: "Coupez les pommes de terre en cubes et faites frire ou rôtir jusqu'à croustillant et doré", measure: "200°C, 25 min", visual: "Les bords sont bien dorés et croustillants" }, { instruction: "Laissez mijoter les tomates avec le paprika en une sauce épaisse et épicée", measure: "10 min", visual: "La sauce a épaissi et foncé" }],
    pt: [{ instruction: "Corte as batatas em cubos e frite ou asse até ficarem crocantes e douradas", measure: "200°C, 25 min", visual: "As bordas estão bem douradas e crocantes" }, { instruction: "Cozinhe tomates em fogo baixo com páprica numa molho grosso e temperado", measure: "10 min", visual: "O molho engrossou e escureceu" }],
    hi: [{ instruction: "आलू को क्यूब्स में काटें और कुरकुरा सुनहरा होने तक तलें या भूनें", measure: "400°F (204°C), 25 मिनट", visual: "किनारे गहरे सुनहरे और कुरकुरे हों" }, { instruction: "टमाटर को पपरिका के साथ गाढ़े मसालेदार सॉस में धीमी आंच पर पकाएं", measure: "10 मिनट", visual: "सॉस गाढ़ा और गहरा हो गया हो" }],
    zh: [{ instruction: "将土豆切块，油炸或烤至酥脆金黄", measure: "400°F（204°C），25分钟", visual: "边缘呈深金黄色且酥脆" }, { instruction: "将番茄与红椒粉煨煮成浓稠的香辣酱", measure: "10分钟", visual: "酱汁已变浓稠且颜色加深" }],
    ar: [{ instruction: "قطّع البطاطا مكعبات واقليها أو اشويها حتى تصبح مقرمشة وذهبية", measure: "400 فهرنهايت (204 مئوية)، 25 دقيقة", visual: "الحواف ذهبية داكنة ومقرمشة" }, { instruction: "اترك الطماطم تنضج مع البابريكا في صلصة سميكة متبلة", measure: "10 دقائق", visual: "تكاثفت الصلصة وأصبحت داكنة" }],
  },
  "spanish-gazpacho": {
    es: [{ instruction: "Licúa tomate, pepino, pimiento y aceite de oliva hasta que esté suave", measure: "N/A", visual: "La mezcla es sedosa y suave, sin trozos" }, { instruction: "Enfría antes de servir", measure: "1 hora mínimo, o toda la noche", visual: "La sopa está fría y bien mezclada" }],
    fr: [{ instruction: "Mixez tomate, concombre, poivron et huile d'olive jusqu'à consistance lisse", measure: "N/A", visual: "Le mélange est soyeux et lisse, sans morceaux" }, { instruction: "Réfrigérez avant de servir", measure: "1h minimum, ou toute la nuit", visual: "La soupe est froide et bien mixée" }],
    pt: [{ instruction: "Bata tomate, pepino, pimentão e azeite até ficar liso", measure: "N/A", visual: "A mistura é sedosa e lisa, sem pedaços" }, { instruction: "Leve à geladeira antes de servir", measure: "1 hora no mínimo, ou durante a noite", visual: "A sopa está gelada e bem misturada" }],
    hi: [{ instruction: "टमाटर, खीरा, शिमला मिर्च और जैतून का तेल चिकना होने तक ब्लेंड करें", measure: "लागू नहीं", visual: "मिश्रण रेशमी चिकना हो, कोई टुकड़ा नहीं" }, { instruction: "परोसने से पहले ठंडा करें", measure: "कम से कम 1 घंटा, या रात भर", visual: "सूप ठंडा और अच्छी तरह मिला हो" }],
    zh: [{ instruction: "将番茄、黄瓜、甜椒和橄榄油搅打至顺滑", measure: "不适用", visual: "混合物丝滑顺滑，没有颗粒" }, { instruction: "食用前冷藏", measure: "至少1小时，或隔夜", visual: "汤冷却且混合均匀" }],
    ar: [{ instruction: "اخلط الطماطم والخيار والفلفل الحلو وزيت الزيتون حتى يصبح ناعمًا", measure: "غير محدد", visual: "الخليط حريري وناعم، بدون قطع" }, { instruction: "برّده قبل التقديم", measure: "ساعة على الأقل، أو طوال الليل", visual: "الحساء بارد وممزوج جيدًا" }],
  },
  "brazilian-coxinha": {
    es: [{ instruction: "Cocina y desmenuza el pollo, mezcla con un poco de caldo", measure: "N/A", visual: "El pollo está finamente desmenuzado y húmedo" }, { instruction: "Cocina harina y caldo en una masa espesa, enfría", measure: "8-10 min", visual: "La masa se despega de la sartén, suave" }, { instruction: "Forma la masa alrededor del relleno de pollo en lágrimas, cubre con pan rallado y fríe", measure: "350°F (177°C), 4-5 min", visual: "El recubrimiento está dorado intenso y crujiente" }],
    fr: [{ instruction: "Faites cuire et effilochez le poulet, mélangez avec un peu de bouillon", measure: "N/A", visual: "Le poulet est finement effiloché et moelleux" }, { instruction: "Cuisez farine et bouillon en une pâte épaisse, laissez refroidir", measure: "8-10 min", visual: "La pâte se détache de la poêle, lisse" }, { instruction: "Façonnez la pâte autour de la garniture au poulet en larmes, enrobez de chapelure et faites frire", measure: "350°F (177°C), 4-5 min", visual: "L'enrobage est bien doré et croustillant" }],
    pt: [{ instruction: "Cozinhe e desfie o frango, misture com um pouco de caldo", measure: "N/A", visual: "O frango está finamente desfiado e úmido" }, { instruction: "Cozinhe farinha e caldo numa massa grossa, deixe esfriar", measure: "8-10 min", visual: "A massa solta da panela, lisa" }, { instruction: "Molde a massa ao redor do recheio de frango em formato de lágrima, cubra com farinha de rosca e frite", measure: "350°F (177°C), 4-5 min", visual: "O revestimento está bem dourado e crocante" }],
    hi: [{ instruction: "चिकन पकाएं और कद्दूकस करें, थोड़े शोरबे के साथ मिलाएं", measure: "लागू नहीं", visual: "चिकन बारीक कद्दूकस और नम हो" }, { instruction: "आटा और शोरबे को गाढ़े आटे में पकाएं, ठंडा करें", measure: "8-10 मिनट", visual: "आटा पैन से अलग हो, चिकना हो" }, { instruction: "आटे को चिकन भरावन के चारों ओर आंसू के आकार में बनाएं, ब्रेडक्रंब में लपेटें और तलें", measure: "350°F (177°C), 4-5 मिनट", visual: "कोटिंग गहरी सुनहरी और कुरकुरी हो" }],
    zh: [{ instruction: "将鸡肉煮熟并撕碎，与少量高汤混合", measure: "不适用", visual: "鸡肉细碎且湿润" }, { instruction: "将面粉和高汤煮成浓稠面团，放凉", measure: "8-10分钟", visual: "面团脱离锅面，顺滑" }, { instruction: "将面团包裹鸡肉馅捏成水滴形，裹上面包糠油炸", measure: "350°F（177°C），4-5分钟", visual: "裹层呈深金黄色且酥脆" }],
    ar: [{ instruction: "اطبخ الدجاج ومزّقه، اخلطه مع القليل من المرق", measure: "غير محدد", visual: "الدجاج ممزق بدقة ورطب" }, { instruction: "اطبخ الطحين والمرق إلى عجينة سميكة، دعها تبرد", measure: "8-10 دقائق", visual: "تنفصل العجينة عن المقلاة، ناعمة" }, { instruction: "شكّل العجينة حول حشو الدجاج على هيئة دموع، غطها بفتات الخبز واقليها", measure: "350 فهرنهايت (177 مئوية)، 4-5 دقائق", visual: "الطبقة ذهبية داكنة ومقرمشة" }],
  },
  "brazilian-pao-de-queijo": {
    es: [{ instruction: "Calienta leche y aceite, vierte sobre harina de tapioca y mezcla", measure: "N/A", visual: "La mezcla forma una pasta espesa y pegajosa" }, { instruction: "Mezcla con huevos y queso hasta formar una masa suave", measure: "N/A", visual: "La masa es suave y ligeramente pegajosa" }, { instruction: "Forma bolas y hornea hasta que estén infladas y doradas", measure: "400°F (204°C), 20 min", visual: "Infladas con un exterior dorado, ligeramente crujiente" }],
    fr: [{ instruction: "Chauffez lait et huile, versez sur la farine de tapioca et mélangez", measure: "N/A", visual: "Le mélange forme une pâte épaisse et collante" }, { instruction: "Mélangez avec œufs et fromage jusqu'à formation d'une pâte souple", measure: "N/A", visual: "La pâte est lisse et légèrement collante" }, { instruction: "Formez des boules et enfournez jusqu'à gonflement et dorure", measure: "200°C, 20 min", visual: "Gonflé avec un extérieur doré, légèrement croustillant" }],
    pt: [{ instruction: "Aqueça leite e óleo, despeje sobre a farinha de tapioca e misture", measure: "N/A", visual: "A mistura forma uma pasta grossa e pegajosa" }, { instruction: "Misture com ovos e queijo até formar uma massa macia", measure: "N/A", visual: "A massa está lisa e levemente pegajosa" }, { instruction: "Molde em bolinhas e asse até incharem e dourarem", measure: "400°F (204°C), 20 min", visual: "Infladas com exterior dourado, levemente crocante" }],
    hi: [{ instruction: "दूध और तेल गर्म करें, टैपिओका आटे पर डालें और मिलाएं", measure: "लागू नहीं", visual: "मिश्रण गाढ़ा, चिपचिपा पेस्ट बने" }, { instruction: "अंडे और चीज़ मिलाकर नरम आटा बनाएं", measure: "लागू नहीं", visual: "आटा चिकना और थोड़ा चिपचिपा हो" }, { instruction: "बॉल्स बनाएं और फूलने और सुनहरा होने तक बेक करें", measure: "400°F (204°C), 20 मिनट", visual: "फूले हुए हों, सुनहरा और थोड़ा कुरकुरा बाहरी हिस्सा हो" }],
    zh: [{ instruction: "将牛奶和油加热，倒入木薯粉中混合", measure: "不适用", visual: "混合物形成浓稠黏糊状" }, { instruction: "加入鸡蛋和芝士混合成软面团", measure: "不适用", visual: "面团顺滑略带黏性" }, { instruction: "捏成球状烤至膨胀金黄", measure: "400°F（204°C），20分钟", visual: "膨胀起来，外表金黄略脆" }],
    ar: [{ instruction: "سخّن الحليب والزيت، اسكبه فوق دقيق التابيوكا واخلط", measure: "غير محدد", visual: "يشكل الخليط عجينة سميكة ولزجة" }, { instruction: "اخلط مع البيض والجبنة حتى تتشكل عجينة طرية", measure: "غير محدد", visual: "العجينة ناعمة ولزجة قليلًا" }, { instruction: "شكّلها كرات واخبزها حتى تنتفخ وتصبح ذهبية", measure: "400 فهرنهايت (204 مئوية)، 20 دقيقة", visual: "منتفخة بمظهر خارجي ذهبي ومقرمش قليلًا" }],
  },
  "brazilian-moqueca": {
    es: [{ instruction: "Sofríe pimiento y cebolla hasta que estén suaves", measure: "5 min", visual: "Los vegetales están suaves, ligeramente dorados" }, { instruction: "Añade tomates y leche de coco, cocina a fuego lento en una salsa", measure: "8-10 min", visual: "La salsa es naranja-roja y fragante" }, { instruction: "Coloca el pescado en la salsa y cocina a fuego lento hasta que esté apenas cocido", measure: "8-10 min", visual: "El pescado se desmenuza fácilmente, opaco por dentro" }],
    fr: [{ instruction: "Faites revenir poivron et oignon jusqu'à tendreté", measure: "5 min", visual: "Les légumes sont tendres, légèrement dorés" }, { instruction: "Ajoutez tomates et lait de coco, laissez mijoter en une sauce", measure: "8-10 min", visual: "La sauce est orange-rouge et parfumée" }, { instruction: "Nichez le poisson dans la sauce et laissez mijoter jusqu'à cuisson complète", measure: "8-10 min", visual: "Le poisson s'effeuille facilement, opaque à cœur" }],
    pt: [{ instruction: "Refogue pimentão e cebola até amolecerem", measure: "5 min", visual: "Os legumes estão macios, levemente dourados" }, { instruction: "Adicione tomates e leite de coco, cozinhe em fogo baixo num molho", measure: "8-10 min", visual: "O molho é laranja-avermelhado e perfumado" }, { instruction: "Aninhe o peixe no molho e cozinhe em fogo baixo até ficar no ponto", measure: "8-10 min", visual: "O peixe desmancha facilmente, opaco por dentro" }],
    hi: [{ instruction: "शिमला मिर्च और प्याज़ को नरम होने तक भूनें", measure: "5 मिनट", visual: "सब्ज़ियां नरम हों, हल्की सुनहरी हों" }, { instruction: "टमाटर और नारियल का दूध डालें, सॉस में धीमी आंच पर पकाएं", measure: "8-10 मिनट", visual: "सॉस नारंगी-लाल और खुशबूदार हो" }, { instruction: "मछली को सॉस में रखें और बस पकने तक धीमी आंच पर पकाएं", measure: "8-10 मिनट", visual: "मछली आसानी से टूटे, अंदर तक अपारदर्शी हो" }],
    zh: [{ instruction: "将甜椒和洋葱炒软", measure: "5分钟", visual: "蔬菜变软，微微焦黄" }, { instruction: "加入番茄和椰奶，煨煮成酱汁", measure: "8-10分钟", visual: "酱汁呈橙红色且香气四溢" }, { instruction: "将鱼放入酱汁中煨煮至刚好熟透", measure: "8-10分钟", visual: "鱼肉容易剥落，内部不透明" }],
    ar: [{ instruction: "قلِّب الفلفل الحلو والبصل حتى يلينا", measure: "5 دقائق", visual: "الخضار لينة، محمرة قليلًا" }, { instruction: "أضف الطماطم وحليب جوز الهند، اتركه ينضج في صلصة", measure: "8-10 دقائق", visual: "الصلصة برتقالية حمراء وعطرة" }, { instruction: "رتّب السمك في الصلصة واتركه ينضج حتى ينضج للتو", measure: "8-10 دقائق", visual: "يتفتت السمك بسهولة، معتم من الداخل" }],
  },
};

const RECIPE_FLAVOR_TR = {
  ...WORLD.flavors,
  ...FRUIT_FLAVOR_TR,
  "mug-eggs": {
    es: ["Queso rallado mezclado al final", "Un chorrito de salsa picante", "Cebollín o cebolleta picada"],
    fr: ["Fromage râpé incorporé à la fin", "Un trait de sauce piquante", "Ciboulette ou oignon vert haché"],
    pt: ["Queijo ralado misturado no final", "Um toque de molho picante", "Cebolinha picada"],
    hi: ["अंत में मिलाया गया कद्दूकस किया चीज़", "थोड़ी सी हॉट सॉस", "कटी हुई चाइव्स या हरा प्याज़"],
    zh: ["最后拌入的碎奶酪", "一点辣酱", "切碎的香葱或小葱"],
    ar: ["جبنة مبشورة تُضاف في النهاية", "رشة من صلصة حارة", "ثوم معمر أو بصل أخضر مفروم"],
  },
  "garlic-pasta": {
    es: ["Hojuelas de chile rojo", "Parmesano extra por encima", "Un chorrito de jugo de limón"],
    fr: ["Flocons de piment rouge", "Parmesan supplémentaire dessus", "Un filet de jus de citron"],
    pt: ["Flocos de pimenta vermelha", "Parmesão extra por cima", "Um toque de suco de limão"],
    hi: ["लाल मिर्च के फ्लेक्स", "ऊपर से अतिरिक्त परमेसन", "नींबू के रस की एक बूंद"],
    zh: ["红辣椒碎", "额外的帕玛森芝士", "一点柠檬汁"],
    ar: ["رقائق الفلفل الأحمر", "بارميزان إضافي فوقها", "رشة من عصير الليمون"],
  },
  "tuna-wrap": {
    es: ["Sriracha o salsa picante", "Aguacate en rodajas", "Pepinillos para dar textura crujiente"],
    fr: ["Sriracha ou sauce piquante", "Avocat en tranches", "Cornichons pour le croquant"],
    pt: ["Sriracha ou molho picante", "Abacate fatiado", "Picles para crocância"],
    hi: ["श्रीराचा या हॉट सॉस", "कटा हुआ एवोकाडो", "कुरकुरेपन के लिए अचार"],
    zh: ["是拉差辣酱或辣椒酱", "牛油果片", "腌黄瓜增添脆感"],
    ar: ["سريراتشا أو صلصة حارة", "أفوكادو مقطع", "مخلل للقرمشة"],
  },
  "grilled-cheese": {
    es: ["Tomate en rodajas dentro", "Capa fina de mostaza", "Sazonador de bagel everything en la corteza"],
    fr: ["Tranche de tomate à l'intérieur", "Fine couche de moutarde", "Assaisonnement everything bagel sur la croûte"],
    pt: ["Tomate fatiado por dentro", "Camada fina de mostarda", "Tempero de everything bagel na casca"],
    hi: ["अंदर कटा हुआ टमाटर", "सरसों की पतली परत", "क्रस्ट पर एवरीथिंग बेगल सीज़निंग"],
    zh: ["里面加番茄片", "薄薄一层芥末", "外皮撒万能贝果调料"],
    ar: ["طماطم مقطعة بالداخل", "طبقة رقيقة من الخردل", "توابل إيفريثينغ بيغل على القشرة"],
  },
  "ramen-upgrade": {
    es: ["Chorrito de aceite de sésamo", "Chili crujiente", "Alga nori desmenuzada encima"],
    fr: ["Filet d'huile de sésame", "Piment croustillant", "Nori émietté dessus"],
    pt: ["Fio de óleo de gergelim", "Chili crisp (pimenta crocante)", "Alga nori desfiada por cima"],
    hi: ["तिल के तेल की बूंदें", "चिली क्रिस्प", "ऊपर कटा हुआ नोरी"],
    zh: ["淋一点香油", "辣椒脆", "上面撒海苔碎"],
    ar: ["رشة من زيت السمسم", "فلفل حار مقرمش", "نوري مفتت فوقها"],
  },
  "overnight-oats": {
    es: ["Canela", "Un remolino de mantequilla de maní", "Un puñado de nueces picadas"],
    fr: ["Cannelle", "Un filet de beurre de cacahuète", "Une poignée de noix hachées"],
    pt: ["Canela", "Um redemoinho de pasta de amendoim", "Um punhado de nozes picadas"],
    hi: ["दालचीनी", "पीनट बटर का स्वर्ल", "कटे हुए मेवों की मुट्ठी"],
    zh: ["肉桂粉", "一圈花生酱", "一把碎坚果"],
    ar: ["قرفة", "لفة من زبدة الفول السوداني", "حفنة من المكسرات المفرومة"],
  },
  "jollof-rice": {
    es: ["Plátano frito al lado", "Un chile scotch bonnet o picante para dar calor", "Una pizca de curry en polvo en la base"],
    fr: ["Banane plantain frite en accompagnement", "Un piment scotch bonnet pour le piquant", "Une pincée de curry en poudre dans la base"],
    pt: ["Banana-da-terra frita ao lado", "Uma pimenta scotch bonnet para picância", "Uma pitada de curry em pó na base"],
    hi: ["साथ में तला हुआ प्लांटेन", "तीखेपन के लिए स्कॉच बॉनेट या मिर्च", "बेस में थोड़ा करी पाउडर"],
    zh: ["旁边配炸大蕉", "苏格兰帽椒或辣椒增加辣度", "底料中加一小撮咖喱粉"],
    ar: ["موز مقلي بجانبه", "فلفل سكوتش بونيت أو فلفل حار", "رشة كاري بودر في القاعدة"],
  },
  "black-bean-bowl": {
    es: ["Aguacate en cubos", "Jugo de lima fresco", "Cilantro picado"],
    fr: ["Avocat en dés", "Jus de citron vert frais", "Coriandre hachée"],
    pt: ["Abacate em cubos", "Suco de limão fresco", "Coentro picado"],
    hi: ["कटा हुआ एवोकाडो", "ताज़ा नींबू का रस", "कटा हुआ धनिया"],
    zh: ["牛油果丁", "新鲜青柠汁", "切碎的香菜"],
    ar: ["أفوكادو مقطع مكعبات", "عصير ليمون طازج", "كزبرة مفرومة"],
  },
  "chicken-stir-fry": {
    es: ["Semillas de sésamo tostadas", "Chorrito de sriracha", "Jengibre fresco rallado"],
    fr: ["Graines de sésame grillées", "Filet de sriracha", "Gingembre frais râpé"],
    pt: ["Gergelim torrado", "Fio de sriracha", "Gengibre fresco ralado"],
    hi: ["भुने हुए तिल", "श्रीराचा की बूंदें", "ताज़ा कद्दूकस किया अदरक"],
    zh: ["烤芝麻", "淋一点是拉差辣酱", "新鲜姜末"],
    ar: ["سمسم محمص", "رشة سريراتشا", "زنجبيل طازج مبشور"],
  },
  "creamy-chicken-pasta": {
    es: ["Pimienta negra recién molida", "Albahaca fresca", "Hojuelas de chile rojo"],
    fr: ["Poivre noir fraîchement moulu", "Basilic frais", "Flocons de piment rouge"],
    pt: ["Pimenta-do-reino moída na hora", "Manjericão fresco", "Flocos de pimenta vermelha"],
    hi: ["ताज़ी पिसी काली मिर्च", "ताज़ी तुलसी", "लाल मिर्च के फ्लेक्स"],
    zh: ["现磨黑胡椒", "新鲜罗勒", "红辣椒碎"],
    ar: ["فلفل أسود مطحون طازج", "ريحان طازج", "رقائق الفلفل الأحمر"],
  },
  "chickpea-curry": {
    es: ["Cilantro fresco", "Un chorrito de lima", "Un remolino de leche de coco"],
    fr: ["Coriandre fraîche", "Un filet de citron vert", "Un filet de lait de coco"],
    pt: ["Coentro fresco", "Um toque de limão", "Um redemoinho de leite de coco"],
    hi: ["ताज़ा धनिया", "नींबू की एक बूंद", "नारियल के दूध का स्वर्ल"],
    zh: ["新鲜香菜", "一点青柠汁", "一圈椰奶"],
    ar: ["كزبرة طازجة", "رشة ليمون", "لفة من حليب جوز الهند"],
  },
  "turkey-taco-bowl": {
    es: ["Queso rallado", "Crema agria", "Jalapeño en rodajas"],
    fr: ["Fromage râpé", "Crème fraîche", "Jalapeño en tranches"],
    pt: ["Queijo ralado", "Creme azedo (sour cream)", "Jalapeño fatiado"],
    hi: ["कद्दूकस किया चीज़", "खट्टी क्रीम", "कटा हुआ जलापेनो"],
    zh: ["刨丝芝士", "酸奶油", "墨西哥辣椒片"],
    ar: ["جبنة مبشورة", "كريمة حامضة", "فلفل هالبينو مقطع"],
  },
  "greek-yogurt-parfait": {
    es: ["Semillas de chía", "Miel extra por encima", "Almendras trituradas"],
    fr: ["Graines de chia", "Filet de miel supplémentaire", "Amandes concassées"],
    pt: ["Sementes de chia", "Mel extra por cima", "Amêndoas trituradas"],
    hi: ["चिया बीज", "अतिरिक्त शहद", "कुटे हुए बादाम"],
    zh: ["奇亚籽", "额外淋一层蜂蜜", "碎杏仁"],
    ar: ["بذور الشيا", "رشة عسل إضافية", "لوز مطحون"],
  },
  "avocado-toast": {
    es: ["Hojuelas de chile rojo", "Un huevo escalfado encima", "Sazonador de bagel everything"],
    fr: ["Flocons de piment rouge", "Un œuf poché dessus", "Assaisonnement everything bagel"],
    pt: ["Flocos de pimenta vermelha", "Um ovo pochê por cima", "Tempero de everything bagel"],
    hi: ["लाल मिर्च के फ्लेक्स", "ऊपर पोच किया अंडा", "एवरीथिंग बेगल सीज़निंग"],
    zh: ["红辣椒碎", "上面放一个水波蛋", "万能贝果调料"],
    ar: ["رقائق الفلفل الأحمر", "بيضة مسلوقة برفق فوقها", "توابل إيفريثينغ بيغل"],
  },
  "lentil-soup": {
    es: ["Comino tostado en aceite", "Jugo de limón fresco", "Perejil picado"],
    fr: ["Cumin torréfié dans l'huile", "Jus de citron frais", "Persil haché"],
    pt: ["Cominho torrado no óleo", "Suco de limão fresco", "Salsinha picada"],
    hi: ["तेल में भुना जीरा", "ताज़ा नींबू का रस", "कटा हुआ अजमोद"],
    zh: ["油炒孜然", "新鲜柠檬汁", "切碎的欧芹"],
    ar: ["كمون محمص بالزيت", "عصير ليمون طازج", "بقدونس مفروم"],
  },
  "veggie-fried-rice": {
    es: ["Aceite de sésamo", "Sriracha", "Cebolletas en rodajas"],
    fr: ["Huile de sésame", "Sriracha", "Oignons verts émincés"],
    pt: ["Óleo de gergelim", "Sriracha", "Cebolinha fatiada"],
    hi: ["तिल का तेल", "श्रीराचा", "कटा हुआ हरा प्याज़"],
    zh: ["香油", "是拉差辣酱", "葱花"],
    ar: ["زيت السمسم", "سريراتشا", "بصل أخضر مقطع"],
  },
  "greek-salad": {
    es: ["Orégano seco", "Chorrito de aceite de oliva extra virgen", "Un toque de limón"],
    fr: ["Origan séché", "Filet d'huile d'olive extra vierge", "Un filet de citron"],
    pt: ["Orégano seco", "Fio extra de azeite extra virgem", "Um toque de limão"],
    hi: ["सूखा ऑरेगैनो", "अतिरिक्त एक्स्ट्रा वर्जिन जैतून तेल", "नींबू की एक बूंद"],
    zh: ["干牛至", "特级初榨橄榄油", "一点柠檬汁"],
    ar: ["أوريغانو مجفف", "رشة زيت زيتون بكر ممتاز إضافية", "رشة ليمون"],
  },
  "hummus-pita": {
    es: ["Espolvoreado de pimentón", "Aceite de oliva extra", "Perejil picado"],
    fr: ["Saupoudrage de paprika", "Huile d'olive supplémentaire", "Persil haché"],
    pt: ["Pitada de páprica", "Azeite extra", "Salsinha picada"],
    hi: ["पपरिका छिड़कें", "अतिरिक्त जैतून तेल", "कटा हुआ अजमोद"],
    zh: ["撒一点红椒粉", "额外的橄榄油", "切碎的欧芹"],
    ar: ["رشة بابريكا", "زيت زيتون إضافي", "بقدونس مفروم"],
  },
  "shakshuka": {
    es: ["Queso feta desmenuzado", "Perejil fresco", "Una pizca de comino"],
    fr: ["Feta émiettée", "Persil frais", "Une pincée de cumin"],
    pt: ["Queijo feta esfarelado", "Salsinha fresca", "Uma pitada de cominho"],
    hi: ["चूरा किया फेटा चीज़", "ताज़ा अजमोद", "एक चुटकी जीरा"],
    zh: ["碎菲达奶酪", "新鲜欧芹", "一小撮孜然"],
    ar: ["جبنة فيتا مفتتة", "بقدونس طازج", "رشة كمون"],
  },
  "jerk-chicken": {
    es: ["Piña asada al lado", "Lima extra", "Salsa picante scotch bonnet"],
    fr: ["Ananas grillé en accompagnement", "Citron vert supplémentaire", "Sauce piquante scotch bonnet"],
    pt: ["Abacaxi grelhado ao lado", "Limão extra", "Molho picante scotch bonnet"],
    hi: ["साथ में ग्रिल्ड अनानास", "अतिरिक्त नींबू", "स्कॉच बॉनेट हॉट सॉस"],
    zh: ["旁边配烤菠萝", "额外的青柠", "苏格兰帽椒辣酱"],
    ar: ["أناناس مشوي بجانبه", "ليمون إضافي", "صلصة سكوتش بونيت الحارة"],
  },
  "rice-and-peas": {
    es: ["Tomillo fresco", "Scotch bonnet para dar calor", "Ajo extra"],
    fr: ["Thym frais", "Piment scotch bonnet pour le piquant", "Ail supplémentaire"],
    pt: ["Tomilho fresco", "Scotch bonnet para picância", "Alho extra"],
    hi: ["ताज़ा थाइम", "तीखेपन के लिए स्कॉच बॉनेट", "अतिरिक्त लहसुन"],
    zh: ["新鲜百里香", "苏格兰帽椒增加辣度", "额外的大蒜"],
    ar: ["زعتر طازج", "سكوتش بونيت للحرارة", "ثوم إضافي"],
  },
  "pad-thai": {
    es: ["Maní triturado", "Gajo de lima", "Hojuelas de chile"],
    fr: ["Cacahuètes concassées", "Quartier de citron vert", "Flocons de piment"],
    pt: ["Amendoim triturado", "Gomo de limão", "Flocos de pimenta"],
    hi: ["कुटी हुई मूंगफली", "नींबू का टुकड़ा", "मिर्च के फ्लेक्स"],
    zh: ["碎花生", "青柠角", "辣椒碎"],
    ar: ["فول سوداني مطحون", "شريحة ليمون", "رقائق الفلفل الحار"],
  },
  "thai-basil-chicken": {
    es: ["Huevo frito encima", "Chile extra", "Un chorrito de salsa de pescado"],
    fr: ["Œuf au plat dessus", "Piment supplémentaire", "Un filet de sauce de poisson"],
    pt: ["Ovo frito por cima", "Pimenta extra", "Um toque de molho de peixe"],
    hi: ["ऊपर तला हुआ अंडा", "अतिरिक्त मिर्च", "थोड़ी सी फिश सॉस"],
    zh: ["上面放煎蛋", "额外的辣椒", "一点鱼露"],
    ar: ["بيضة مقلية فوقها", "فلفل إضافي", "رشة من صلصة السمك"],
  },
  "kung-pao-chicken": {
    es: ["Chiles secos", "Maní extra", "Cebolleta picada"],
    fr: ["Piments séchés", "Cacahuètes supplémentaires", "Oignons verts hachés"],
    pt: ["Pimentas secas", "Amendoim extra", "Cebolinha picada"],
    hi: ["सूखी मिर्च", "अतिरिक्त मूंगफली", "कटा हुआ हरा प्याज़"],
    zh: ["干辣椒", "额外的花生", "切碎的葱花"],
    ar: ["فلفل حار مجفف", "فول سوداني إضافي", "بصل أخضر مفروم"],
  },
  "egg-drop-soup": {
    es: ["Pimienta blanca", "Chorrito de aceite de sésamo", "Cebolleta extra"],
    fr: ["Poivre blanc", "Filet d'huile de sésame", "Oignons verts supplémentaires"],
    pt: ["Pimenta branca", "Fio de óleo de gergelim", "Cebolinha extra"],
    hi: ["सफेद मिर्च", "तिल के तेल की बूंदें", "अतिरिक्त हरा प्याज़"],
    zh: ["白胡椒", "淋一点香油", "额外的葱花"],
    ar: ["فلفل أبيض", "رشة زيت سمسم", "بصل أخضر إضافي"],
  },
  "bibimbap": {
    es: ["Gochujang extra", "Aceite de sésamo", "Semillas de sésamo tostadas"],
    fr: ["Gochujang supplémentaire", "Huile de sésame", "Graines de sésame grillées"],
    pt: ["Gochujang extra", "Óleo de gergelim", "Gergelim torrado"],
    hi: ["अतिरिक्त गोचुजांग", "तिल का तेल", "भुने हुए तिल"],
    zh: ["额外的韩式辣酱", "香油", "烤芝麻"],
    ar: ["غوتشوجانغ إضافي", "زيت سمسم", "سمسم محمص"],
  },
  "kimchi-fried-rice": {
    es: ["Huevo frito encima", "Jugo extra de kimchi", "Tiras de alga"],
    fr: ["Œuf au plat dessus", "Jus de kimchi supplémentaire", "Lanières d'algue"],
    pt: ["Ovo frito por cima", "Suco extra de kimchi", "Tiras de alga"],
    hi: ["ऊपर तला हुआ अंडा", "अतिरिक्त किमची रस", "सीवीड की पट्टियां"],
    zh: ["上面放煎蛋", "额外的泡菜汁", "海苔丝"],
    ar: ["بيضة مقلية فوقها", "عصير كيمتشي إضافي", "شرائح أعشاب بحرية"],
  },
  "ratatouille": {
    es: ["Albahaca fresca", "Aceite de oliva extra virgen", "Parmesano rallado (opcional)"],
    fr: ["Basilic frais", "Huile d'olive extra vierge", "Parmesan râpé (facultatif)"],
    pt: ["Manjericão fresco", "Azeite extra virgem", "Parmesão ralado (opcional)"],
    hi: ["ताज़ी तुलसी", "एक्स्ट्रा वर्जिन जैतून तेल", "कद्दूकस किया परमेसन (वैकल्पिक)"],
    zh: ["新鲜罗勒", "特级初榨橄榄油", "刨丝帕玛森芝士（可选）"],
    ar: ["ريحان طازج", "زيت زيتون بكر ممتاز", "بارميزان مبشور (اختياري)"],
  },
  "croque-monsieur": {
    es: ["Mostaza Dijon", "Una pizca de nuez moscada", "Queso extra derretido encima"],
    fr: ["Moutarde de Dijon", "Une pincée de muscade", "Fromage fondu supplémentaire dessus"],
    pt: ["Mostarda Dijon", "Uma pitada de noz-moscada", "Queijo derretido extra por cima"],
    hi: ["डिजॉन सरसों", "एक चुटकी जायफल", "ऊपर अतिरिक्त पिघला चीज़"],
    zh: ["第戎芥末酱", "一小撮肉豆蔻", "上面额外融化的芝士"],
    ar: ["خردل ديجون", "رشة من جوزة الطيب", "جبنة إضافية ذائبة فوقها"],
  },
  "blt": {
    es: ["Mayonesa untada", "Aguacate en rodajas", "Pimienta negra recién molida"],
    fr: ["Mayonnaise tartinée", "Avocat en tranches", "Poivre noir fraîchement moulu"],
    pt: ["Maionese espalhada", "Abacate fatiado", "Pimenta-do-reino moída na hora"],
    hi: ["मेयो फैलाएं", "कटा हुआ एवोकाडो", "ताज़ी पिसी काली मिर्च"],
    zh: ["涂抹蛋黄酱", "牛油果片", "现磨黑胡椒"],
    ar: ["مايونيز مدهون", "أفوكادو مقطع", "فلفل أسود مطحون طازج"],
  },
  "chili-con-carne": {
    es: ["Queso rallado", "Crema agria", "Jalapeño picado"],
    fr: ["Fromage râpé", "Crème fraîche", "Jalapeño haché"],
    pt: ["Queijo ralado", "Creme azedo", "Jalapeño picado"],
    hi: ["कद्दूकस किया चीज़", "खट्टी क्रीम", "कटा हुआ जलापेनो"],
    zh: ["刨丝芝士", "酸奶油", "切碎的墨西哥辣椒"],
    ar: ["جبنة مبشورة", "كريمة حامضة", "هالبينو مفروم"],
  },
  "pancakes": {
    es: ["Jarabe de arce", "Bayas frescas", "Mantequilla batida"],
    fr: ["Sirop d'érable", "Fruits rouges frais", "Beurre fouetté"],
    pt: ["Xarope de bordo", "Frutas vermelhas frescas", "Manteiga batida"],
    hi: ["मेपल सिरप", "ताज़ी बेरीज़", "फेंटा हुआ मक्खन"],
    zh: ["枫糖浆", "新鲜浆果", "打发黄油"],
    ar: ["شراب القيقب", "توت طازج", "زبدة مخفوقة"],
  },
  "mac-and-cheese": {
    es: ["Cobertura de pan rallado", "Salsa picante", "Cheddar extra fuerte"],
    fr: ["Chapelure sur le dessus", "Sauce piquante", "Cheddar extra fort"],
    pt: ["Cobertura de farinha de rosca", "Molho picante", "Cheddar extra forte"],
    hi: ["ब्रेडक्रंब टॉपिंग", "हॉट सॉस", "अतिरिक्त तीखा चेडर"],
    zh: ["面包糠顶层", "辣酱", "额外的浓郁切达芝士"],
    ar: ["طبقة فتات خبز", "صلصة حارة", "شيدر إضافي حاد"],
  },
  "margherita-toast": {
    es: ["Chorrito de glaseado balsámico", "Hojuelas de chile rojo", "Albahaca extra"],
    fr: ["Filet de glaçage balsamique", "Flocons de piment rouge", "Basilic supplémentaire"],
    pt: ["Fio de redução balsâmica", "Flocos de pimenta vermelha", "Manjericão extra"],
    hi: ["बाल्समिक ग्लेज़ की बूंदें", "लाल मिर्च के फ्लेक्स", "अतिरिक्त तुलसी"],
    zh: ["淋一点香醋汁", "红辣椒碎", "额外的罗勒"],
    ar: ["رشة من صلصة البلسمك المركزة", "رقائق الفلفل الأحمر", "ريحان إضافي"],
  },
  "caprese-salad": {
    es: ["Reducción balsámica", "Sal marina en escamas", "Pimienta molida"],
    fr: ["Réduction balsamique", "Fleur de sel", "Poivre concassé"],
    pt: ["Redução balsâmica", "Sal marinho em flocos", "Pimenta moída na hora"],
    hi: ["बाल्समिक रिडक्शन", "फ्लेकी सी सॉल्ट", "कुटी हुई काली मिर्च"],
    zh: ["香醋浓缩汁", "片状海盐", "现磨黑胡椒"],
    ar: ["مركز البلسمك", "ملح بحري رقائقي", "فلفل مطحون خشن"],
  },
  "minestrone": {
    es: ["Parmesano rallado", "Albahaca fresca", "Chorrito de aceite de oliva"],
    fr: ["Parmesan râpé", "Basilic frais", "Filet d'huile d'olive"],
    pt: ["Parmesão ralado", "Manjericão fresco", "Fio de azeite"],
    hi: ["कद्दूकस किया परमेसन", "ताज़ी तुलसी", "जैतून के तेल की बूंदें"],
    zh: ["刨丝帕玛森芝士", "新鲜罗勒", "淋一点橄榄油"],
    ar: ["بارميزان مبشور", "ريحان طازج", "رشة من زيت الزيتون"],
  },
  "quesadillas": {
    es: ["Crema agria", "Jalapeños en rodajas", "Cilantro fresco"],
    fr: ["Crème fraîche", "Jalapeños en tranches", "Coriandre fraîche"],
    pt: ["Creme azedo", "Jalapeños fatiados", "Coentro fresco"],
    hi: ["खट्टी क्रीम", "कटे हुए जलापेनो", "ताज़ा धनिया"],
    zh: ["酸奶油", "墨西哥辣椒片", "新鲜香菜"],
    ar: ["كريمة حامضة", "هالبينو مقطع", "كزبرة طازجة"],
  },
  "breakfast-burrito": {
    es: ["Aguacate en rodajas", "Salsa picante", "Frijoles negros"],
    fr: ["Avocat en tranches", "Sauce piquante", "Haricots noirs"],
    pt: ["Abacate fatiado", "Molho picante", "Feijão preto"],
    hi: ["कटा हुआ एवोकाडो", "हॉट सॉस", "ब्लैक बीन्स"],
    zh: ["牛油果片", "辣酱", "黑豆"],
    ar: ["أفوكادو مقطع", "صلصة حارة", "فاصولياء سوداء"],
  },
  "paneer-tikka": {
    es: ["Chutney de menta", "Chorrito de limón", "Chile en polvo extra"],
    fr: ["Chutney à la menthe", "Filet de citron", "Piment en poudre supplémentaire"],
    pt: ["Chutney de hortelã", "Toque de limão", "Pimenta em pó extra"],
    hi: ["मिंट चटनी", "नींबू की बूंद", "अतिरिक्त मिर्च पाउडर"],
    zh: ["薄荷酸辣酱", "挤一点柠檬汁", "额外的辣椒粉"],
    ar: ["تشدني النعناع", "رشة ليمون", "بودرة فلفل حار إضافية"],
  },
  "aloo-gobi": {
    es: ["Cilantro fresco", "Chorrito de limón", "Chile extra"],
    fr: ["Coriandre fraîche", "Filet de citron", "Piment supplémentaire"],
    pt: ["Coentro fresco", "Toque de limão", "Pimenta extra"],
    hi: ["ताज़ा धनिया", "नींबू की बूंद", "अतिरिक्त मिर्च"],
    zh: ["新鲜香菜", "挤一点柠檬汁", "额外的辣椒"],
    ar: ["كزبرة طازجة", "رشة ليمون", "فلفل حار إضافي"],
  },
  "teriyaki-salmon": {
    es: ["Semillas de sésamo tostadas", "Cebolleta en rodajas", "Un chorrito de lima"],
    fr: ["Graines de sésame grillées", "Oignons verts émincés", "Un filet de citron vert"],
    pt: ["Gergelim torrado", "Cebolinha fatiada", "Um toque de limão"],
    hi: ["भुने हुए तिल", "कटा हुआ हरा प्याज़", "नींबू की एक बूंद"],
    zh: ["烤芝麻", "葱花", "一点青柠汁"],
    ar: ["سمسم محمص", "بصل أخضر مقطع", "رشة ليمون"],
  },
  "onigiri": {
    es: ["Centro de ciruela encurtida", "Sazonador furikake", "Un toque de salsa de soya"],
    fr: ["Un centre de prune marinée", "Assaisonnement furikake", "Une touche de sauce soja"],
    pt: ["Centro de ameixa em conserva", "Tempero furikake", "Um toque de molho de soja"],
    hi: ["अचार वाले आलूबुखारे का केंद्र", "फुरिकाके सीज़निंग", "थोड़ी सोया सॉस"],
    zh: ["中间放腌梅子", "撒香松调味料", "一点酱油"],
    ar: ["حشوة برقوق مخلل في المنتصف", "توابل فوريكاكي", "لمسة من صلصة الصويا"],
  },
  "miso-soup": {
    es: ["Cubos extra de tofu", "Chorrito de aceite de sésamo", "Aceite picante para dar calor"],
    fr: ["Cubes de tofu supplémentaires", "Filet d'huile de sésame", "Huile pimentée pour le piquant"],
    pt: ["Cubos extras de tofu", "Fio de óleo de gergelim", "Óleo picante para picância"],
    hi: ["अतिरिक्त टोफू क्यूब्स", "तिल के तेल की बूंदें", "तीखेपन के लिए चिली ऑयल"],
    zh: ["额外的豆腐块", "淋一点香油", "辣椒油增加辣度"],
    ar: ["مكعبات توفو إضافية", "رشة زيت سمسم", "زيت حار للحرارة"],
  },
  "spring-rolls": {
    es: ["Salsa de maní para mojar", "Pepino en rodajas", "Menta fresca"],
    fr: ["Sauce aux cacahuètes pour tremper", "Concombre en tranches", "Menthe fraîche"],
    pt: ["Molho de amendoim para molhar", "Pepino fatiado", "Hortelã fresca"],
    hi: ["डिपिंग के लिए मूंगफली सॉस", "कटा हुआ खीरा", "ताज़ा पुदीना"],
    zh: ["花生蘸酱", "黄瓜片", "新鲜薄荷"],
    ar: ["صلصة فول سوداني للغمس", "خيار مقطع", "نعناع طازج"],
  },
  "quick-beef-pho": {
    es: ["Albahaca fresca y lima", "Sriracha", "Salsa hoisin"],
    fr: ["Basilic frais et citron vert", "Sriracha", "Sauce hoisin"],
    pt: ["Manjericão fresco e limão", "Sriracha", "Molho hoisin"],
    hi: ["ताज़ी तुलसी और नींबू", "श्रीराचा", "होइसिन सॉस"],
    zh: ["新鲜罗勒和青柠", "是拉差辣酱", "海鲜酱"],
    ar: ["ريحان طازج وليمون", "سريراتشا", "صلصة الهويسين"],
  },
  "falafel-bowl": {
    es: ["Chorrito de tahini", "Nabo encurtido", "Perejil fresco"],
    fr: ["Filet de tahini", "Navet mariné", "Persil frais"],
    pt: ["Fio de tahine", "Nabo em conserva", "Salsinha fresca"],
    hi: ["तिल के पेस्ट (ताहिनी) की बूंदें", "अचार वाली शलजम", "ताज़ा अजमोद"],
    zh: ["淋一点芝麻酱", "腌萝卜", "新鲜欧芹"],
    ar: ["رشة طحينة", "لفت مخلل", "بقدونس طازج"],
  },
  "tabbouleh": {
    es: ["Menta extra", "Una pizca de pimienta de Jamaica", "Aceite de oliva extra virgen"],
    fr: ["Menthe supplémentaire", "Une pincée de piment de la Jamaïque", "Huile d'olive extra vierge"],
    pt: ["Hortelã extra", "Uma pitada de pimenta-da-jamaica", "Azeite extra virgem"],
    hi: ["अतिरिक्त पुदीना", "एक चुटकी ऑलस्पाइस", "एक्स्ट्रा वर्जिन जैतून तेल"],
    zh: ["额外的薄荷", "一小撮多香果粉", "特级初榨橄榄油"],
    ar: ["نعناع إضافي", "رشة من البهار الحلو", "زيت زيتون بكر ممتاز"],
  },
  "chicken-shawarma-bowl": {
    es: ["Salsa de yogur con ajo", "Cebolla encurtida", "Limón extra"],
    fr: ["Sauce au yaourt à l'ail", "Oignons marinés", "Citron supplémentaire"],
    pt: ["Molho de iogurte com alho", "Cebola em conserva", "Limão extra"],
    hi: ["लहसुन दही सॉस", "अचार वाला प्याज़", "अतिरिक्त नींबू"],
    zh: ["蒜香酸奶酱", "腌洋葱", "额外的柠檬"],
    ar: ["صلصة زبادي بالثوم", "بصل مخلل", "ليمون إضافي"],
  },
  "misir-wot": {
    es: ["Berbere extra para dar calor", "Un chorrito de limón", "Cilantro fresco"],
    fr: ["Berbéré supplémentaire pour le piquant", "Un filet de citron", "Coriandre fraîche"],
    pt: ["Berbere extra para picância", "Um toque de limão", "Coentro fresco"],
    hi: ["तीखेपन के लिए अतिरिक्त बरबरे", "नींबू की एक बूंद", "ताज़ा धनिया"],
    zh: ["额外的柏柏尔辣椒增加辣度", "一点柠檬汁", "新鲜香菜"],
    ar: ["بربري إضافي للحرارة", "رشة ليمون", "كزبرة طازجة"],
  },
  "spanish-tortilla": {
    es: ["Alioli al lado", "Espolvoreado de pimentón ahumado", "Cebollín fresco"],
    fr: ["Un peu d'aïoli à côté", "Saupoudrage de paprika fumé", "Ciboulette fraîche"],
    pt: ["Aioli para acompanhar", "Pitada de páprica defumada", "Cebolinha fresca"],
    hi: ["साथ में आयोली", "स्मोक्ड पपरिका छिड़कें", "ताज़ी चाइव्स"],
    zh: ["旁边配蒜泥蛋黄酱", "撒烟熏红椒粉", "新鲜细香葱"],
    ar: ["أيولي بجانبها", "رشة بابريكا مدخنة", "ثوم معمر طازج"],
  },
  "garlic-shrimp": {
    es: ["Pan crujiente para el aceite", "Limón extra", "Perejil fresco"],
    fr: ["Pain croustillant pour l'huile", "Citron supplémentaire", "Persil frais"],
    pt: ["Pão crocante para o óleo", "Limão extra", "Salsinha fresca"],
    hi: ["तेल के लिए कुरकुरी ब्रेड", "अतिरिक्त नींबू", "ताज़ा अजमोद"],
    zh: ["用脆面包蘸油", "额外的柠檬", "新鲜欧芹"],
    ar: ["خبز مقرمش للزيت", "ليمون إضافي", "بقدونس طازج"],
  },
  "brazilian-black-bean-stew": {
    es: ["Rodajas de naranja al lado", "Cilantro fresco", "Salsa picante"],
    fr: ["Tranches d'orange en accompagnement", "Coriandre fraîche", "Sauce piquante"],
    pt: ["Fatias de laranja ao lado", "Coentro fresco", "Molho picante"],
    hi: ["साथ में संतरे के टुकड़े", "ताज़ा धनिया", "हॉट सॉस"],
    zh: ["旁边配橙子片", "新鲜香菜", "辣酱"],
    ar: ["شرائح برتقال بجانبها", "كزبرة طازجة", "صلصة حارة"],
  },
  "turkey-chili": {
    es: ["Queso rallado", "Aguacate en rodajas", "Una cucharada de crema agria"],
    fr: ["Fromage râpé", "Avocat en tranches", "Une cuillerée de crème fraîche"],
    pt: ["Queijo ralado", "Abacate fatiado", "Uma colherada de creme azedo"],
    hi: ["कद्दूकस किया चीज़", "कटा हुआ एवोकाडो", "खट्टी क्रीम का एक चम्मच"],
    zh: ["刨丝芝士", "牛油果片", "一勺酸奶油"],
    ar: ["جبنة مبشورة", "أفوكادو مقطع", "ملعقة من الكريمة الحامضة"],
  },
  "baked-sweet-potato": {
    es: ["Nueces pecanas tostadas", "Un chorrito de jarabe de arce", "Una pizca de nuez moscada"],
    fr: ["Noix de pécan grillées", "Un filet de sirop d'érable", "Une pincée de muscade"],
    pt: ["Nozes-pecã tostadas", "Um fio de xarope de bordo", "Uma pitada de noz-moscada"],
    hi: ["भुने हुए पीकन", "मेपल सिरप की बूंदें", "एक चुटकी जायफल"],
    zh: ["烤山核桃", "淋一点枫糖浆", "一小撮肉豆蔻"],
    ar: ["جوز البقان المحمص", "رشة من شراب القيقب", "رشة من جوزة الطيب"],
  },
  "chicken-caesar-wrap": {
    es: ["Parmesano en láminas", "Pimienta negra molida", "Crutones desmenuzados"],
    fr: ["Copeaux de parmesan", "Poivre noir concassé", "Croûtons émiettés"],
    pt: ["Lascas de parmesão", "Pimenta-do-reino moída", "Croutons esfarelados"],
    hi: ["परमेसन के टुकड़े", "कुटी हुई काली मिर्च", "टूटे हुए क्राउटन"],
    zh: ["帕玛森芝士片", "现磨黑胡椒", "碎面包丁"],
    ar: ["رقائق بارميزان", "فلفل أسود مطحون", "فتات خبز محمص مفتت"],
  },
  "veggie-omelette": {
    es: ["Hierbas frescas", "Salsa picante", "Queso extra"],
    fr: ["Herbes fraîches", "Sauce piquante", "Fromage supplémentaire"],
    pt: ["Ervas frescas", "Molho picante", "Queijo extra"],
    hi: ["ताज़ी जड़ी-बूटियां", "हॉट सॉस", "अतिरिक्त चीज़"],
    zh: ["新鲜香草", "辣酱", "额外的芝士"],
    ar: ["أعشاب طازجة", "صلصة حارة", "جبنة إضافية"],
  },
  "pb-banana-smoothie": {
    es: ["Un poco de avena para espesar", "Canela", "Un puñado de hielo"],
    fr: ["Une cuillerée de flocons d'avoine pour épaissir", "Cannelle", "Une poignée de glace"],
    pt: ["Uma porção de aveia para engrossar", "Canela", "Um punhado de gelo"],
    hi: ["गाढ़ेपन के लिए ओट्स का स्कूप", "दालचीनी", "बर्फ की मुट्ठी"],
    zh: ["加一勺燕麦增加浓稠度", "肉桂粉", "一把冰块"],
    ar: ["ملعقة شوفان لزيادة القوام", "قرفة", "حفنة من الثلج"],
  },
  "baked-chicken-thighs": {
    es: ["Gajos de limón", "Romero fresco", "Un chorrito de miel picante"],
    fr: ["Quartiers de citron", "Romarin frais", "Un filet de miel pimenté"],
    pt: ["Gomos de limão", "Alecrim fresco", "Um fio de mel picante"],
    hi: ["नींबू के टुकड़े", "ताज़ा रोज़मेरी", "तीखे शहद की बूंदें"],
    zh: ["柠檬角", "新鲜迷迭香", "淋一点辣蜂蜜"],
    ar: ["أرباع ليمون", "إكليل الجبل الطازج", "رشة من العسل الحار"],
  },
  "veggie-quesadilla": {
    es: ["Salsa verde", "Aguacate en rodajas", "Crema agria"],
    fr: ["Salsa verde", "Avocat en tranches", "Crème fraîche"],
    pt: ["Salsa verde", "Abacate fatiado", "Creme azedo"],
    hi: ["साल्सा वर्दे", "कटा हुआ एवोकाडो", "खट्टी क्रीम"],
    zh: ["青莎莎酱", "牛油果片", "酸奶油"],
    ar: ["صلصة خضراء", "أفوكادو مقطع", "كريمة حامضة"],
  },
  "shrimp-tacos": {
    es: ["Crema de chipotle", "Cilantro fresco", "Cebolla morada encurtida"],
    fr: ["Crème au chipotle", "Coriandre fraîche", "Oignon rouge mariné"],
    pt: ["Creme de chipotle", "Coentro fresco", "Cebola roxa em conserva"],
    hi: ["चिपोटल क्रीमा", "ताज़ा धनिया", "अचार वाला लाल प्याज़"],
    zh: ["奇波雷奶油酱", "新鲜香菜", "腌红洋葱"],
    ar: ["كريمة تشيبوتلي", "كزبرة طازجة", "بصل أحمر مخلل"],
  },
  "beef-and-broccoli": {
    es: ["Toque final de aceite de sésamo", "Ajo extra", "Semillas de sésamo tostadas"],
    fr: ["Filet d'huile de sésame pour finir", "Ail supplémentaire", "Graines de sésame grillées"],
    pt: ["Toque final de óleo de gergelim", "Alho extra", "Gergelim torrado"],
    hi: ["तिल के तेल का फिनिश", "अतिरिक्त लहसुन", "भुने हुए तिल"],
    zh: ["最后淋一点香油", "额外的大蒜", "烤芝麻"],
    ar: ["لمسة أخيرة من زيت السمسم", "ثوم إضافي", "سمسم محمص"],
  },
  "caprese-pasta-salad": {
    es: ["Glaseado balsámico", "Albahaca extra", "Pimienta negra molida"],
    fr: ["Glaçage balsamique", "Basilic supplémentaire", "Poivre noir concassé"],
    pt: ["Redução balsâmica", "Manjericão extra", "Pimenta-do-reino moída"],
    hi: ["बाल्समिक ग्लेज़", "अतिरिक्त तुलसी", "कुटी हुई काली मिर्च"],
    zh: ["香醋汁", "额外的罗勒", "现磨黑胡椒"],
    ar: ["صلصة البلسمك المركزة", "ريحان إضافي", "فلفل أسود مطحون"],
  },
  "butternut-squash-soup": {
    es: ["Un remolino de leche de coco", "Semillas de calabaza tostadas", "Una pizca de nuez moscada"],
    fr: ["Un filet de lait de coco", "Graines de courge grillées", "Une pincée de muscade"],
    pt: ["Um redemoinho de leite de coco", "Sementes de abóbora torradas", "Uma pitada de noz-moscada"],
    hi: ["नारियल के दूध का स्वर्ल", "भुने हुए कद्दू के बीज", "एक चुटकी जायफल"],
    zh: ["一圈椰奶", "烤南瓜籽", "一小撮肉豆蔻"],
    ar: ["لفة من حليب جوز الهند", "بذور يقطين محمصة", "رشة من جوزة الطيب"],
  },
  "sausage-and-peppers": {
    es: ["Chorrito de limón", "Pan crujiente al lado", "Ajo extra"],
    fr: ["Filet de citron", "Pain croustillant en accompagnement", "Ail supplémentaire"],
    pt: ["Toque de limão", "Pão crocante ao lado", "Alho extra"],
    hi: ["नींबू की बूंद", "साथ में कुरकुरी ब्रेड", "अतिरिक्त लहसुन"],
    zh: ["挤一点柠檬汁", "旁边配脆面包", "额外的大蒜"],
    ar: ["رشة ليمون", "خبز مقرمش بجانبه", "ثوم إضافي"],
  },
  "baked-ziti": {
    es: ["Albahaca fresca encima", "Hojuelas de chile rojo", "Parmesano extra"],
    fr: ["Basilic frais dessus", "Flocons de piment rouge", "Parmesan supplémentaire"],
    pt: ["Manjericão fresco por cima", "Flocos de pimenta vermelha", "Parmesão extra"],
    hi: ["ऊपर ताज़ी तुलसी", "लाल मिर्च के फ्लेक्स", "अतिरिक्त परमेसन"],
    zh: ["上面放新鲜罗勒", "红辣椒碎", "额外的帕玛森芝士"],
    ar: ["ريحان طازج فوقها", "رقائق الفلفل الأحمر", "بارميزان إضافي"],
  },
  "chickpea-salad-sandwich": {
    es: ["Chorrito de limón", "Pepinillos picados", "Eneldo fresco"],
    fr: ["Filet de citron", "Cornichons en dés", "Aneth frais"],
    pt: ["Toque de limão", "Picles picados", "Endro fresco"],
    hi: ["नींबू की बूंद", "कटा हुआ अचार", "ताज़ा डिल"],
    zh: ["挤一点柠檬汁", "切碎的腌黄瓜", "新鲜莳萝"],
    ar: ["رشة ليمون", "مخلل مقطع مكعبات", "شبت طازج"],
  },
  "salmon-asparagus-sheet-pan": {
    es: ["Eneldo fresco", "Ralladura extra de limón", "Un toque de mantequilla de ajo"],
    fr: ["Aneth frais", "Zeste de citron supplémentaire", "Une noisette de beurre à l'ail"],
    pt: ["Endro fresco", "Raspas extras de limão", "Um toque de manteiga de alho"],
    hi: ["ताज़ा डिल", "अतिरिक्त नींबू का ज़ेस्ट", "लहसुन मक्खन का एक टुकड़ा"],
    zh: ["新鲜莳萝", "额外的柠檬皮屑", "一块蒜香黄油"],
    ar: ["شبت طازج", "قشر ليمون إضافي", "قطعة زبدة بالثوم"],
  },
  "chia-pudding": {
    es: ["Bayas frescas", "Un remolino de mantequilla de nuez", "Coco tostado"],
    fr: ["Fruits rouges frais", "Un filet de beurre de noix", "Noix de coco grillée"],
    pt: ["Frutas vermelhas frescas", "Um redemoinho de manteiga de nozes", "Coco torrado"],
    hi: ["ताज़ी बेरीज़", "नट बटर का स्वर्ल", "भुना हुआ नारियल"],
    zh: ["新鲜浆果", "一圈坚果酱", "烤椰丝"],
    ar: ["توت طازج", "لفة من زبدة المكسرات", "جوز هند محمص"],
  },
  "air-fryer-chicken-wings": {
    es: ["Mezcla con salsa buffalo", "Ranch para mojar", "Cebollín fresco picado"],
    fr: ["Mélangez avec sauce buffalo", "Sauce ranch pour tremper", "Ciboulette fraîche hachée"],
    pt: ["Misture com molho buffalo", "Ranch para molhar", "Cebolinha fresca picada"],
    hi: ["बफेलो सॉस में मिलाएं", "डिपिंग के लिए रांच", "ताज़ी कटी चाइव्स"],
    zh: ["拌入水牛城辣酱", "蘸牧场沙拉酱", "新鲜切碎的香葱"],
    ar: ["قلّبها بصلصة البوفالو", "صلصة رانش للغمس", "ثوم معمر طازج مفروم"],
  },
  "air-fryer-chicken-breast": {
    es: ["Chorrito de limón antes de servir", "Hierbas frescas encima", "Un toque de mantequilla de ajo"],
    fr: ["Filet de citron avant de servir", "Herbes fraîches dessus", "Une noisette de beurre à l'ail"],
    pt: ["Toque de limão antes de servir", "Ervas frescas por cima", "Um toque de manteiga de alho"],
    hi: ["परोसने से पहले नींबू निचोड़ें", "ऊपर ताज़ी जड़ी-बूटियां", "लहसुन मक्खन का एक टुकड़ा"],
    zh: ["食用前挤一点柠檬汁", "上面放新鲜香草", "一块蒜香黄油"],
    ar: ["رشة ليمون قبل التقديم", "أعشاب طازجة فوقه", "قطعة زبدة بالثوم"],
  },
  "air-fryer-chicken-thighs": {
    es: ["Chorrito de miel picante", "Pimienta recién molida", "Chorrito de lima"],
    fr: ["Filet de miel pimenté", "Poivre fraîchement moulu", "Filet de citron vert"],
    pt: ["Fio de mel picante", "Pimenta moída na hora", "Toque de limão"],
    hi: ["तीखे शहद की बूंदें", "ताज़ी पिसी काली मिर्च", "नींबू की बूंद"],
    zh: ["淋一点辣蜂蜜", "现磨黑胡椒", "挤一点青柠汁"],
    ar: ["رشة من العسل الحار", "فلفل مطحون طازج", "رشة ليمون"],
  },
  "air-fryer-tofu": {
    es: ["Espolvoreado de semillas de sésamo", "Chorrito de chile crujiente", "Cebolleta en rodajas"],
    fr: ["Graines de sésame saupoudrées", "Filet de piment croustillant", "Oignons verts émincés"],
    pt: ["Gergelim salpicado", "Fio de chili crisp", "Cebolinha fatiada"],
    hi: ["तिल छिड़कें", "चिली क्रिस्प की बूंदें", "कटा हुआ हरा प्याज़"],
    zh: ["撒芝麻", "淋一点辣椒脆", "葱花"],
    ar: ["رشة سمسم", "رشة فلفل حار مقرمش", "بصل أخضر مقطع"],
  },
  "air-fryer-salmon": {
    es: ["Eneldo fresco", "Ralladura extra de limón", "Chorrito de mantequilla de ajo"],
    fr: ["Aneth frais", "Zeste de citron supplémentaire", "Filet de beurre à l'ail"],
    pt: ["Endro fresco", "Raspas extras de limão", "Fio de manteiga de alho"],
    hi: ["ताज़ा डिल", "अतिरिक्त नींबू का ज़ेस्ट", "लहसुन मक्खन की बूंदें"],
    zh: ["新鲜莳萝", "额外的柠檬皮屑", "淋一点蒜香黄油"],
    ar: ["شبت طازج", "قشر ليمون إضافي", "رشة زبدة بالثوم"],
  },
  "air-fryer-shrimp": {
    es: ["Chorrito de lima", "Salsa cóctel", "Hojuelas de chile"],
    fr: ["Filet de citron vert", "Sauce cocktail", "Flocons de piment"],
    pt: ["Toque de limão", "Molho coquetel", "Flocos de pimenta"],
    hi: ["नींबू की बूंद", "कॉकटेल सॉस", "मिर्च के फ्लेक्स"],
    zh: ["挤一点青柠汁", "鸡尾酒酱", "辣椒碎"],
    ar: ["رشة ليمون", "صلصة كوكتيل", "رقائق فلفل حار"],
  },
  "air-fryer-pork-chops": {
    es: ["Compota de manzana al lado", "Romero fresco", "Glaseado de mostaza Dijon"],
    fr: ["Compote de pommes en accompagnement", "Romarin frais", "Glaçage à la moutarde de Dijon"],
    pt: ["Molho de maçã ao lado", "Alecrim fresco", "Glaze de mostarda Dijon"],
    hi: ["साथ में सेब की चटनी", "ताज़ी रोज़मेरी", "डिजॉन सरसों का ग्लेज़"],
    zh: ["旁边配苹果酱", "新鲜迷迭香", "第戎芥末酱汁"],
    ar: ["صلصة تفاح بجانبها", "إكليل الجبل الطازج", "تتبيلة خردل ديجون"],
  },
  "air-fryer-steak-bites": {
    es: ["Mantequilla de ajo y hierbas derretida", "Perejil fresco", "Pimienta negra molida"],
    fr: ["Beurre à l'ail et aux herbes fondu", "Persil frais", "Poivre noir concassé"],
    pt: ["Manteiga de alho e ervas derretida", "Salsinha fresca", "Pimenta-do-reino moída"],
    hi: ["पिघला हुआ गार्लिक हर्ब बटर", "ताज़ा अजमोद", "कुटी हुई काली मिर्च"],
    zh: ["融化的蒜香黄油", "新鲜欧芹", "现磨黑胡椒"],
    ar: ["زبدة ثوم وأعشاب ذائبة", "بقدونس طازج", "فلفل أسود مطحون"],
  },
  "air-fryer-turkey-meatballs": {
    es: ["Marinara para mojar", "Albahaca fresca", "Parmesano rallado"],
    fr: ["Marinara pour tremper", "Basilic frais", "Parmesan râpé"],
    pt: ["Molho marinara para molhar", "Manjericão fresco", "Parmesão ralado"],
    hi: ["डिपिंग के लिए मरीनारा", "ताज़ी तुलसी", "कद्दूकस किया परमेसन"],
    zh: ["蘸番茄肉酱", "新鲜罗勒", "刨丝帕玛森芝士"],
    ar: ["صلصة مارينارا للغمس", "ريحان طازج", "بارميزان مبشور"],
  },
  "air-fryer-broccoli": {
    es: ["Espolvoreado de parmesano", "Ralladura de limón", "Hojuelas de chile"],
    fr: ["Parmesan saupoudré", "Zeste de citron", "Flocons de piment"],
    pt: ["Parmesão salpicado", "Raspas de limão", "Flocos de pimenta"],
    hi: ["परमेसन छिड़कें", "नींबू का ज़ेस्ट", "मिर्च के फ्लेक्स"],
    zh: ["撒帕玛森芝士", "柠檬皮屑", "辣椒碎"],
    ar: ["رشة بارميزان", "قشر ليمون", "رقائق فلفل حار"],
  },
  "air-fryer-brussels-sprouts": {
    es: ["Chorrito de glaseado balsámico", "Nueces pecanas tostadas", "Toque final de jarabe de arce"],
    fr: ["Filet de glaçage balsamique", "Noix de pécan grillées", "Touche finale de sirop d'érable"],
    pt: ["Fio de redução balsâmica", "Nozes-pecã tostadas", "Toque final de xarope de bordo"],
    hi: ["बाल्समिक ग्लेज़ की बूंदें", "भुने हुए पीकन", "अंत में मेपल सिरप"],
    zh: ["淋一点香醋汁", "烤山核桃", "最后淋枫糖浆"],
    ar: ["رشة من صلصة البلسمك", "جوز بقان محمص", "لمسة أخيرة من شراب القيقب"],
  },
  "air-fryer-sweet-potato-fries": {
    es: ["Alioli de ajo", "Sazonador de chile y lima", "Cilantro fresco"],
    fr: ["Aïoli à l'ail", "Assaisonnement chili-citron vert", "Coriandre fraîche"],
    pt: ["Aioli de alho", "Tempero de chili e limão", "Coentro fresco"],
    hi: ["गार्लिक आयोली", "चिली लाइम सीज़निंग", "ताज़ा धनिया"],
    zh: ["蒜泥蛋黄酱", "辣椒青柠调料", "新鲜香菜"],
    ar: ["أيولي بالثوم", "توابل فلفل حار وليمون", "كزبرة طازجة"],
  },
  "air-fryer-fries": {
    es: ["Vinagre de malta", "Mezcla de ajo y parmesano", "Pimentón ahumado"],
    fr: ["Vinaigre de malt", "Mélange ail-parmesan", "Paprika fumé"],
    pt: ["Vinagre de malte", "Mistura de alho e parmesão", "Páprica defumada"],
    hi: ["माल्ट सिरका", "गार्लिक परमेसन मिक्स", "स्मोक्ड पपरिका"],
    zh: ["麦芽醋", "蒜香帕玛森芝士拌料", "烟熏红椒粉"],
    ar: ["خل الشعير", "خلطة ثوم وبارميزان", "بابريكا مدخنة"],
  },
  "air-fryer-zucchini-chips": {
    es: ["Marinara para mojar", "Espolvoreado de parmesano", "Albahaca fresca"],
    fr: ["Marinara pour tremper", "Parmesan saupoudré", "Basilic frais"],
    pt: ["Molho marinara para molhar", "Parmesão salpicado", "Manjericão fresco"],
    hi: ["डिपिंग के लिए मरीनारा", "परमेसन छिड़कें", "ताज़ी तुलसी"],
    zh: ["蘸番茄肉酱", "撒帕玛森芝士", "新鲜罗勒"],
    ar: ["صلصة مارينارا للغمس", "رشة بارميزان", "ريحان طازج"],
  },
  "air-fryer-cauliflower-bites": {
    es: ["Mezcla con salsa buffalo", "Salsa ranch", "Cebollín fresco"],
    fr: ["Mélangez avec sauce buffalo", "Sauce ranch", "Ciboulette fraîche"],
    pt: ["Misture com molho buffalo", "Molho ranch", "Cebolinha fresca"],
    hi: ["बफेलो सॉस में मिलाएं", "रांच डिप", "ताज़ी चाइव्स"],
    zh: ["拌入水牛城辣酱", "牧场蘸酱", "新鲜香葱"],
    ar: ["قلّبها بصلصة البوفالو", "غمس رانش", "ثوم معمر طازج"],
  },
  "air-fryer-asparagus": {
    es: ["Ralladura de limón", "Parmesano en láminas", "Pimienta molida"],
    fr: ["Zeste de citron", "Copeaux de parmesan", "Poivre concassé"],
    pt: ["Raspas de limão", "Lascas de parmesão", "Pimenta moída"],
    hi: ["नींबू का ज़ेस्ट", "कटा हुआ परमेसन", "कुटी हुई काली मिर्च"],
    zh: ["柠檬皮屑", "刨片帕玛森芝士", "现磨黑胡椒"],
    ar: ["قشر ليمون", "بارميزان مبشور", "فلفل مطحون"],
  },
  "air-fryer-green-beans": {
    es: ["Almendras tostadas", "Chorrito de limón", "Hojuelas de chile"],
    fr: ["Amandes grillées", "Filet de citron", "Flocons de piment"],
    pt: ["Amêndoas torradas", "Toque de limão", "Flocos de pimenta"],
    hi: ["भुने हुए बादाम", "नींबू की बूंद", "मिर्च के फ्लेक्स"],
    zh: ["烤杏仁", "挤一点柠檬汁", "辣椒碎"],
    ar: ["لوز محمص", "رشة ليمون", "رقائق فلفل حار"],
  },
  "air-fryer-honey-carrots": {
    es: ["Tomillo fresco", "Nueces tostadas", "Ralladura de naranja"],
    fr: ["Thym frais", "Noix grillées", "Zeste d'orange"],
    pt: ["Tomilho fresco", "Nozes torradas", "Raspas de laranja"],
    hi: ["ताज़ा थाइम", "भुने हुए अखरोट", "संतरे का ज़ेस्ट"],
    zh: ["新鲜百里香", "烤核桃", "橙皮屑"],
    ar: ["زعتر طازج", "جوز محمص", "قشر برتقال"],
  },
  "air-fryer-mozzarella-sticks": {
    es: ["Marinara para mojar", "Sazonador italiano en el pan rallado", "Albahaca fresca"],
    fr: ["Marinara pour tremper", "Assaisonnement italien dans la chapelure", "Basilic frais"],
    pt: ["Molho marinara para molhar", "Tempero italiano na farinha de rosca", "Manjericão fresco"],
    hi: ["डिपिंग के लिए मरीनारा", "ब्रेडक्रंब में इटैलियन सीज़निंग", "ताज़ी तुलसी"],
    zh: ["蘸番茄肉酱", "面包糠中加意式香料", "新鲜罗勒"],
    ar: ["صلصة مارينارا للغمس", "توابل إيطالية في الفتات", "ريحان طازج"],
  },
  "air-fryer-onion-rings": {
    es: ["Mayonesa picante para mojar", "Pimentón ahumado en el pan rallado", "Cebollín fresco"],
    fr: ["Mayo épicée pour tremper", "Paprika fumé dans la chapelure", "Ciboulette fraîche"],
    pt: ["Maionese picante para molhar", "Páprica defumada na farinha de rosca", "Cebolinha fresca"],
    hi: ["तीखी मेयो डिप", "ब्रेडक्रंब में स्मोक्ड पपरिका", "ताज़ी चाइव्स"],
    zh: ["辣味蛋黄酱蘸料", "面包糠中加烟熏红椒粉", "新鲜细香葱"],
    ar: ["غمس مايونيز حار", "بابريكا مدخنة في الفتات", "ثوم معمر طازج"],
  },
  "air-fryer-chickpeas": {
    es: ["Comino y lima", "Sazonador de bagel everything", "Chile en polvo"],
    fr: ["Cumin et citron vert", "Assaisonnement everything bagel", "Piment en poudre"],
    pt: ["Cominho e limão", "Tempero de everything bagel", "Pimenta em pó"],
    hi: ["जीरा और नींबू", "एवरीथिंग बेगल सीज़निंग", "मिर्च पाउडर"],
    zh: ["孜然和青柠", "万能贝果调料", "辣椒粉"],
    ar: ["كمون وليمون", "توابل إيفريثينغ بيغل", "بودرة فلفل حار"],
  },
  "air-fryer-kale-chips": {
    es: ["Espolvoreado de levadura nutricional", "Hojuelas de chile", "Ajo en polvo"],
    fr: ["Levure nutritionnelle saupoudrée", "Flocons de piment", "Ail en poudre"],
    pt: ["Levedura nutricional polvilhada", "Flocos de pimenta", "Alho em pó"],
    hi: ["न्यूट्रिशनल यीस्ट छिड़कें", "मिर्च के फ्लेक्स", "लहसुन पाउडर"],
    zh: ["撒营养酵母粉", "辣椒碎", "蒜粉"],
    ar: ["رشة خميرة غذائية", "رقائق فلفل حار", "بودرة ثوم"],
  },
  "air-fryer-bacon": {
    es: ["Pimienta negra molida", "Glaseado de azúcar morena", "Chorrito de jarabe de arce"],
    fr: ["Poivre noir concassé", "Glaçage à la cassonade", "Filet de sirop d'érable"],
    pt: ["Pimenta-do-reino moída", "Glaze de açúcar mascavo", "Fio de xarope de bordo"],
    hi: ["कुटी हुई काली मिर्च", "ब्राउन शुगर ग्लेज़", "मेपल सिरप की बूंदें"],
    zh: ["现磨黑胡椒", "红糖糖浆", "淋一点枫糖浆"],
    ar: ["فلفل أسود مطحون", "تتبيلة سكر بني", "رشة من شراب القيقب"],
  },
  "air-fryer-hash-browns": {
    es: ["Ketchup al lado", "Salsa picante", "Cebollín fresco"],
    fr: ["Ketchup en accompagnement", "Sauce piquante", "Ciboulette fraîche"],
    pt: ["Ketchup ao lado", "Molho picante", "Cebolinha fresca"],
    hi: ["साथ में केचप", "हॉट सॉस", "ताज़ी चाइव्स"],
    zh: ["旁边配番茄酱", "辣酱", "新鲜细香葱"],
    ar: ["كاتشب بجانبها", "صلصة حارة", "ثوم معمر طازج"],
  },
  "air-fryer-eggs": {
    es: ["Sazonador de bagel everything", "Sal en escamas", "Salsa picante"],
    fr: ["Assaisonnement everything bagel", "Sel en flocons", "Sauce piquante"],
    pt: ["Tempero de everything bagel", "Sal em flocos", "Molho picante"],
    hi: ["एवरीथिंग बेगल सीज़निंग", "फ्लेकी नमक", "हॉट सॉस"],
    zh: ["万能贝果调料", "片状海盐", "辣酱"],
    ar: ["توابل إيفريثينغ بيغل", "ملح رقائقي", "صلصة حارة"],
  },
  "air-fryer-french-toast-sticks": {
    es: ["Salsa de jarabe de arce", "Espolvoreado de azúcar glas", "Bayas frescas"],
    fr: ["Sauce au sirop d'érable", "Saupoudrage de sucre glace", "Fruits rouges frais"],
    pt: ["Molho de xarope de bordo", "Açúcar de confeiteiro polvilhado", "Frutas vermelhas frescas"],
    hi: ["मेपल सिरप डिप", "पिसी चीनी छिड़कें", "ताज़ी बेरीज़"],
    zh: ["蘸枫糖浆", "撒糖粉", "新鲜浆果"],
    ar: ["غمس بشراب القيقب", "رشة سكر بودرة", "توت طازج"],
  },
  "air-fryer-churros": {
    es: ["Cobertura de azúcar y canela", "Salsa de chocolate para mojar", "Dulce de leche"],
    fr: ["Enrobage sucre-cannelle", "Sauce au chocolat pour tremper", "Confiture de lait"],
    pt: ["Cobertura de açúcar com canela", "Molho de chocolate para mergulhar", "Doce de leite"],
    hi: ["चीनी-दालचीनी कोटिंग", "डिपिंग के लिए चॉकलेट सॉस", "डल्से डे लेचे"],
    zh: ["肉桂糖裹层", "蘸巧克力酱", "牛奶焦糖酱"],
    ar: ["طبقة سكر بالقرفة", "صلصة شوكولاتة للغمس", "دولسي دي ليتشي"],
  },
  "air-fryer-apple-chips": {
    es: ["Canela extra", "Chorrito de miel", "Mantequilla de nuez para mojar"],
    fr: ["Cannelle supplémentaire", "Filet de miel", "Beurre de noix pour tremper"],
    pt: ["Canela extra", "Fio de mel", "Manteiga de nozes para mergulhar"],
    hi: ["अतिरिक्त दालचीनी", "शहद की बूंदें", "डिपिंग के लिए नट बटर"],
    zh: ["额外的肉桂粉", "淋一点蜂蜜", "蘸坚果酱"],
    ar: ["رشة قرفة إضافية", "رشة عسل", "زبدة مكسرات للغمس"],
  },
  "air-fryer-plantains": {
    es: ["Espolvoreado de canela", "Chorrito de lima", "Chorrito de miel"],
    fr: ["Saupoudrage de cannelle", "Filet de citron vert", "Filet de miel"],
    pt: ["Canela polvilhada", "Toque de limão", "Fio de mel"],
    hi: ["दालचीनी छिड़कें", "नींबू की बूंद", "शहद की बूंदें"],
    zh: ["撒肉桂粉", "挤一点青柠汁", "淋一点蜂蜜"],
    ar: ["رشة قرفة", "رشة ليمون", "رشة عسل"],
  },
  "air-fryer-samosas": {
    es: ["Chutney de menta", "Salsa de tamarindo", "Chile extra"],
    fr: ["Chutney à la menthe", "Sauce au tamarin", "Piment supplémentaire"],
    pt: ["Chutney de hortelã", "Molho de tamarindo", "Pimenta extra"],
    hi: ["मिंट चटनी", "इमली सॉस", "अतिरिक्त मिर्च"],
    zh: ["薄荷酸辣酱", "罗望子酱", "额外的辣椒"],
    ar: ["تشدني النعناع", "صلصة التمر الهندي", "فلفل حار إضافي"],
  },
  "air-fryer-spring-rolls": {
    es: ["Salsa dulce de chile para mojar", "Hierbas frescas", "Aceite de sésamo extra"],
    fr: ["Sauce chili sucrée pour tremper", "Herbes fraîches", "Huile de sésame supplémentaire"],
    pt: ["Molho agridoce para molhar", "Ervas frescas", "Óleo de gergelim extra"],
    hi: ["डिपिंग के लिए मीठी चिली सॉस", "ताज़ी जड़ी-बूटियां", "अतिरिक्त तिल का तेल"],
    zh: ["甜辣蘸酱", "新鲜香草", "额外的香油"],
    ar: ["صلصة تشيلي حلوة للغمس", "أعشاب طازجة", "زيت سمسم إضافي"],
  },
  "air-fryer-karaage": {
    es: ["Chorrito de mayonesa kewpie", "Gajo de limón", "Shichimi togarashi"],
    fr: ["Filet de mayonnaise kewpie", "Quartier de citron", "Shichimi togarashi"],
    pt: ["Fio de maionese kewpie", "Gomo de limão", "Shichimi togarashi"],
    hi: ["क्यूपी मेयो की बूंदें", "नींबू का टुकड़ा", "शिचिमी तोगाराशी"],
    zh: ["淋一点丘比蛋黄酱", "柠檬角", "七味唐辛子"],
    ar: ["رشة مايونيز كيوبي", "شريحة ليمون", "شيشيمي توغاراشي"],
  },
  "air-fryer-falafel": {
    es: ["Chorrito de tahini", "Nabo encurtido", "Perejil fresco"],
    fr: ["Filet de tahini", "Navet mariné", "Persil frais"],
    pt: ["Fio de tahine", "Nabo em conserva", "Salsinha fresca"],
    hi: ["तिल के पेस्ट की बूंदें", "अचार वाली शलजम", "ताज़ा अजमोद"],
    zh: ["淋一点芝麻酱", "腌萝卜", "新鲜欧芹"],
    ar: ["رشة طحينة", "لفت مخلل", "بقدونس طازج"],
  },
  "air-fryer-arancini": {
    es: ["Marinara para mojar", "Albahaca fresca", "Parmesano extra"],
    fr: ["Marinara pour tremper", "Basilic frais", "Parmesan supplémentaire"],
    pt: ["Molho marinara para molhar", "Manjericão fresco", "Parmesão extra"],
    hi: ["डिपिंग के लिए मरीनारा", "ताज़ी तुलसी", "अतिरिक्त परमेसन"],
    zh: ["蘸番茄肉酱", "新鲜罗勒", "额外的帕玛森芝士"],
    ar: ["صلصة مارينارا للغمس", "ريحان طازج", "بارميزان إضافي"],
  },
  "air-fryer-empanadas": {
    es: ["Salsa verde", "Cilantro fresco", "Salsa picante"],
    fr: ["Salsa verde", "Coriandre fraîche", "Sauce piquante"],
    pt: ["Salsa verde", "Coentro fresco", "Molho picante"],
    hi: ["साल्सा वर्दे", "ताज़ा धनिया", "हॉट सॉस"],
    zh: ["青莎莎酱", "新鲜香菜", "辣酱"],
    ar: ["صلصة خضراء", "كزبرة طازجة", "صلصة حارة"],
  },
  "air-fryer-tandoori-chicken": {
    es: ["Salsa de yogur con menta", "Cilantro fresco", "Limón extra"],
    fr: ["Sauce au yaourt à la menthe", "Coriandre fraîche", "Citron supplémentaire"],
    pt: ["Molho de iogurte com hortelã", "Coentro fresco", "Limão extra"],
    hi: ["मिंट दही सॉस", "ताज़ा धनिया", "अतिरिक्त नींबू"],
    zh: ["薄荷酸奶酱", "新鲜香菜", "额外的柠檬"],
    ar: ["صلصة زبادي بالنعناع", "كزبرة طازجة", "ليمون إضافي"],
  },
  "air-fryer-jerk-wings": {
    es: ["Piña asada", "Lima extra", "Salsa picante scotch bonnet"],
    fr: ["Ananas grillé", "Citron vert supplémentaire", "Sauce piquante scotch bonnet"],
    pt: ["Abacaxi grelhado", "Limão extra", "Molho picante scotch bonnet"],
    hi: ["ग्रिल्ड अनानास", "अतिरिक्त नींबू", "स्कॉच बॉनेट हॉट सॉस"],
    zh: ["烤菠萝", "额外的青柠", "苏格兰帽椒辣酱"],
    ar: ["أناناس مشوي", "ليمون إضافي", "صلصة سكوتش بونيت الحارة"],
  },
  "air-fryer-korean-fried-chicken": {
    es: ["Semillas de sésamo tostadas", "Cebolleta en rodajas", "Gochujang extra"],
    fr: ["Graines de sésame grillées", "Oignons verts émincés", "Gochujang supplémentaire"],
    pt: ["Gergelim torrado", "Cebolinha fatiada", "Gochujang extra"],
    hi: ["भुने हुए तिल", "कटा हुआ हरा प्याज़", "अतिरिक्त गोचुजांग"],
    zh: ["烤芝麻", "葱花", "额外的韩式辣酱"],
    ar: ["سمسم محمص", "بصل أخضر مقطع", "غوتشوجانغ إضافي"],
  },
  "air-fryer-fish-tacos": {
    es: ["Crema de chipotle", "Cilantro fresco", "Cebolla morada encurtida"],
    fr: ["Crème au chipotle", "Coriandre fraîche", "Oignon rouge mariné"],
    pt: ["Creme de chipotle", "Coentro fresco", "Cebola roxa em conserva"],
    hi: ["चिपोटल क्रीमा", "ताज़ा धनिया", "अचार वाला लाल प्याज़"],
    zh: ["奇波雷奶油酱", "新鲜香菜", "腌红洋葱"],
    ar: ["كريمة تشيبوتلي", "كزبرة طازجة", "بصل أحمر مخلل"],
  },
  "air-fryer-shrimp-tempura": {
    es: ["Salsa tempura para mojar", "Rábano daikon rallado", "Limón extra"],
    fr: ["Sauce tempura pour tremper", "Radis daikon râpé", "Citron supplémentaire"],
    pt: ["Molho tempura para molhar", "Rabanete daikon ralado", "Limão extra"],
    hi: ["टेम्पुरा डिपिंग सॉस", "कद्दूकस किया डाइकॉन", "अतिरिक्त नींबू"],
    zh: ["天妇罗蘸酱", "刨丝白萝卜", "额外的柠檬"],
    ar: ["صلصة تمبورا للغمس", "فجل دايكون مبشور", "ليمون إضافي"],
  },
  "air-fryer-eggplant-parmesan": {
    es: ["Albahaca fresca", "Mozzarella extra", "Hojuelas de chile rojo"],
    fr: ["Basilic frais", "Mozzarella supplémentaire", "Flocons de piment rouge"],
    pt: ["Manjericão fresco", "Muçarela extra", "Flocos de pimenta vermelha"],
    hi: ["ताज़ी तुलसी", "अतिरिक्त मोज़ेरेला", "लाल मिर्च के फ्लेक्स"],
    zh: ["新鲜罗勒", "额外的马苏里拉芝士", "红辣椒碎"],
    ar: ["ريحان طازج", "موزاريلا إضافية", "رقائق الفلفل الأحمر"],
  },
  "air-fryer-quesadilla": {
    es: ["Crema agria", "Jalapeños en rodajas", "Cilantro fresco"],
    fr: ["Crème fraîche", "Jalapeños en tranches", "Coriandre fraîche"],
    pt: ["Creme azedo", "Jalapeños fatiados", "Coentro fresco"],
    hi: ["खट्टी क्रीम", "कटे हुए जलापेनो", "ताज़ा धनिया"],
    zh: ["酸奶油", "墨西哥辣椒片", "新鲜香菜"],
    ar: ["كريمة حامضة", "هالبينو مقطع", "كزبرة طازجة"],
  },
  "air-fryer-stuffed-peppers": {
    es: ["Cilantro fresco", "Queso extra encima", "Salsa picante"],
    fr: ["Coriandre fraîche", "Fromage supplémentaire dessus", "Sauce piquante"],
    pt: ["Coentro fresco", "Queijo extra por cima", "Molho picante"],
    hi: ["ताज़ा धनिया", "ऊपर अतिरिक्त चीज़", "हॉट सॉस"],
    zh: ["新鲜香菜", "上面额外的芝士", "辣酱"],
    ar: ["كزبرة طازجة", "جبنة إضافية فوقها", "صلصة حارة"],
  },
  "air-fryer-mini-meatloaves": {
    es: ["Glaseado extra de ketchup", "Tomillo fresco", "Toque de salsa Worcestershire"],
    fr: ["Glaçage ketchup supplémentaire", "Thym frais", "Filet de sauce Worcestershire"],
    pt: ["Glaze extra de ketchup", "Tomilho fresco", "Toque de molho inglês"],
    hi: ["अतिरिक्त केचप ग्लेज़", "ताज़ा थाइम", "वॉर्सेस्टरशर सॉस की बूंदें"],
    zh: ["额外的番茄酱", "新鲜百里香", "一点伍斯特酱"],
    ar: ["تتبيلة كاتشب إضافية", "زعتر طازج", "رشة صلصة وستر"],
  },
  "air-fryer-salmon-bites": {
    es: ["Semillas de sésamo tostadas", "Cebolleta en rodajas", "Chorrito de sriracha"],
    fr: ["Graines de sésame grillées", "Oignons verts émincés", "Filet de sriracha"],
    pt: ["Gergelim torrado", "Cebolinha fatiada", "Fio de sriracha"],
    hi: ["भुने हुए तिल", "कटा हुआ हरा प्याज़", "श्रीराचा की बूंदें"],
    zh: ["烤芝麻", "葱花", "淋一点是拉差辣酱"],
    ar: ["سمسم محمص", "بصل أخضر مقطع", "رشة سريراتشا"],
  },
  "air-fryer-cod": {
    es: ["Eneldo fresco", "Guarnición de alcaparras", "Mantequilla de ajo"],
    fr: ["Aneth frais", "Garniture de câpres", "Beurre à l'ail"],
    pt: ["Endro fresco", "Guarnição de alcaparras", "Manteiga de alho"],
    hi: ["ताज़ा डिल", "केपर गार्निश", "गार्लिक बटर"],
    zh: ["新鲜莳萝", "刺山柑点缀", "蒜香黄油"],
    ar: ["شبت طازج", "تزيين بالكبر", "زبدة ثوم"],
  },
  "air-fryer-pork-belly-bites": {
    es: ["Cebolleta en rodajas", "Semillas de sésamo", "Aceite de chile extra"],
    fr: ["Oignons verts émincés", "Graines de sésame", "Huile pimentée supplémentaire"],
    pt: ["Cebolinha fatiada", "Gergelim", "Óleo de pimenta extra"],
    hi: ["कटा हुआ हरा प्याज़", "तिल", "अतिरिक्त चिली ऑयल"],
    zh: ["葱花", "芝麻", "额外的辣椒油"],
    ar: ["بصل أخضر مقطع", "سمسم", "زيت فلفل حار إضافي"],
  },
  "air-fryer-tostones": {
    es: ["Salsa mojo de ajo", "Lima extra", "Sal con chile"],
    fr: ["Sauce mojo à l'ail", "Citron vert supplémentaire", "Sel pimenté"],
    pt: ["Molho mojo de alho", "Limão extra", "Sal com pimenta"],
    hi: ["गार्लिक मोजो सॉस", "अतिरिक्त नींबू", "चिली नमक"],
    zh: ["蒜香莫霍酱", "额外的青柠", "辣椒盐"],
    ar: ["صلصة موخو بالثوم", "ليمون إضافي", "ملح بالفلفل الحار"],
  },
  "air-fryer-granola": {
    es: ["Mezcla de fruta seca", "Espolvoreado de canela", "Chispas de chocolate oscuro"],
    fr: ["Mélange de fruits secs", "Saupoudrage de cannelle", "Pépites de chocolat noir"],
    pt: ["Mistura de frutas secas", "Canela polvilhada", "Gotas de chocolate amargo"],
    hi: ["सूखे फलों का मिश्रण", "दालचीनी छिड़कें", "डार्क चॉकलेट चिप्स"],
    zh: ["混入干果", "撒肉桂粉", "黑巧克力碎片"],
    ar: ["خليط فواكه مجففة", "رشة قرفة", "رقائق شوكولاتة داكنة"],
  },
  "air-fryer-veggie-chips": {
    es: ["Escamas de sal marina", "Espolvoreado de sazonador ranch", "Hierbas frescas"],
    fr: ["Flocons de sel marin", "Saupoudrage d'assaisonnement ranch", "Herbes fraîches"],
    pt: ["Flocos de sal marinho", "Tempero ranch polvilhado", "Ervas frescas"],
    hi: ["सी सॉल्ट फ्लेक्स", "रांच सीज़निंग छिड़कें", "ताज़ी जड़ी-बूटियां"],
    zh: ["片状海盐", "撒牧场调料", "新鲜香草"],
    ar: ["رقائق ملح بحري", "رشة توابل رانش", "أعشاب طازجة"],
  },
  "british-fish-and-chips": {
    es: ["Chorrito de vinagre de malta", "Guisantes machacados al lado", "Salsa tártara"],
    fr: ["Filet de vinaigre de malt", "Purée de petits pois en accompagnement", "Sauce tartare"],
    pt: ["Toque de vinagre de malte", "Purê de ervilha ao lado", "Molho tártaro"],
    hi: ["माल्ट सिरके की बूंदें", "साथ में मैश किए मटर", "टार्टर सॉस"],
    zh: ["淋一点麦芽醋", "旁边配豌豆泥", "塔塔酱"],
    ar: ["رشة خل الشعير", "بازلاء مهروسة بجانبها", "صلصة تارتار"],
  },
  "british-shepherds-pie": {
    es: ["Salsa Worcestershire", "Tomillo fresco", "Queso extra en el puré"],
    fr: ["Sauce Worcestershire", "Thym frais", "Fromage supplémentaire sur la purée"],
    pt: ["Molho inglês", "Tomilho fresco", "Queijo extra no purê"],
    hi: ["वॉर्सेस्टरशर सॉस", "ताज़ा थाइम", "मैश पर अतिरिक्त चीज़"],
    zh: ["伍斯特酱", "新鲜百里香", "土豆泥上额外的芝士"],
    ar: ["صلصة وستر", "زعتر طازج", "جبنة إضافية على الهريس"],
  },
  "british-full-english": {
    es: ["Frijoles horneados al lado", "Tostada con mantequilla", "Salsa HP"],
    fr: ["Haricots blancs en accompagnement", "Toast beurré", "Sauce HP"],
    pt: ["Feijão ao molho ao lado", "Torrada com manteiga", "Molho HP"],
    hi: ["साथ में बेक्ड बीन्स", "मक्खन लगा टोस्ट", "एचपी सॉस"],
    zh: ["旁边配烤豆子", "涂黄油的吐司", "HP酱"],
    ar: ["فاصولياء مطبوخة بجانبه", "توست بالزبدة", "صلصة HP"],
  },
  "british-bangers-mash": {
    es: ["Salsa de cebolla", "Cebollín fresco", "Pimienta negra extra"],
    fr: ["Sauce à l'oignon", "Ciboulette fraîche", "Poivre noir supplémentaire"],
    pt: ["Molho de cebola", "Cebolinha fresca", "Pimenta-do-reino extra"],
    hi: ["प्याज़ की ग्रेवी", "ताज़ी चाइव्स", "अतिरिक्त काली मिर्च"],
    zh: ["洋葱肉汁", "新鲜细香葱", "额外的黑胡椒"],
    ar: ["مرق بصل", "ثوم معمر طازج", "فلفل أسود إضافي"],
  },
  "thai-green-curry": {
    es: ["Albahaca tailandesa fresca", "Lima extra", "Chile rojo en rodajas"],
    fr: ["Basilic thaï frais", "Citron vert supplémentaire", "Piment rouge en tranches"],
    pt: ["Manjericão tailandês fresco", "Limão extra", "Pimenta vermelha fatiada"],
    hi: ["ताज़ी थाई तुलसी", "अतिरिक्त नींबू", "कटी हुई लाल मिर्च"],
    zh: ["新鲜泰国罗勒", "额外的青柠", "红辣椒片"],
    ar: ["ريحان تايلاندي طازج", "ليمون إضافي", "فلفل أحمر مقطع"],
  },
  "thai-mango-sticky-rice": {
    es: ["Semillas de sésamo tostadas", "Chorrito extra de leche de coco", "Guarnición de menta"],
    fr: ["Graines de sésame grillées", "Filet supplémentaire de lait de coco", "Garniture de menthe"],
    pt: ["Gergelim torrado", "Fio extra de leite de coco", "Guarnição de hortelã"],
    hi: ["भुने हुए तिल", "अतिरिक्त नारियल दूध की बूंदें", "पुदीने की गार्निश"],
    zh: ["烤芝麻", "额外淋一层椰奶", "薄荷装饰"],
    ar: ["سمسم محمص", "رشة إضافية من حليب جوز الهند", "تزيين بالنعناع"],
  },
  "thai-tom-yum-soup": {
    es: ["Cilantro fresco", "Pasta de chile extra", "Chorrito de salsa de pescado"],
    fr: ["Coriandre fraîche", "Pâte de piment supplémentaire", "Filet de sauce de poisson"],
    pt: ["Coentro fresco", "Pasta de pimenta extra", "Toque de molho de peixe"],
    hi: ["ताज़ा धनिया", "अतिरिक्त मिर्च पेस्ट", "फिश सॉस की बूंदें"],
    zh: ["新鲜香菜", "额外的辣椒酱", "一点鱼露"],
    ar: ["كزبرة طازجة", "معجون فلفل حار إضافي", "رشة من صلصة السمك"],
  },
  "african-nigerian-jollof": {
    es: ["Plátano frito", "Scotch bonnet extra", "Hojas de curry"],
    fr: ["Banane plantain frite", "Piment scotch bonnet supplémentaire", "Feuilles de curry"],
    pt: ["Banana-da-terra frita", "Scotch bonnet extra", "Folhas de curry"],
    hi: ["तला हुआ प्लांटेन", "अतिरिक्त स्कॉच बॉनेट", "करी पत्ते"],
    zh: ["炸大蕉", "额外的苏格兰帽椒", "咖喱叶"],
    ar: ["موز مقلي", "سكوتش بونيت إضافي", "أوراق الكاري"],
  },
  "african-suya-skewers": {
    es: ["Especia suya extra encima", "Cebolla y tomate en rodajas", "Chorrito de lima"],
    fr: ["Épice suya supplémentaire dessus", "Oignon et tomate en tranches", "Filet de citron vert"],
    pt: ["Especiaria suya extra por cima", "Cebola e tomate fatiados", "Toque de limão"],
    hi: ["ऊपर अतिरिक्त सुया मसाला", "कटा हुआ प्याज़ और टमाटर", "नींबू की बूंद"],
    zh: ["上面额外的苏亚香料", "洋葱和番茄片", "挤一点青柠汁"],
    ar: ["توابل سويا إضافية فوقها", "بصل وطماطم مقطعة", "رشة ليمون"],
  },
  "african-chapati": {
    es: ["Sirve con guiso de lentejas", "Un toque de mantequilla", "Salsa de chile fresca"],
    fr: ["Servez avec un ragoût de lentilles", "Une noisette de beurre", "Sauce piquante fraîche"],
    pt: ["Sirva com ensopado de lentilha", "Um toque de manteiga", "Molho de pimenta fresco"],
    hi: ["दाल के स्ट्यू के साथ परोसें", "मक्खन का एक टुकड़ा", "ताज़ी मिर्च सॉस"],
    zh: ["搭配扁豆炖菜食用", "一块黄油", "新鲜辣椒酱"],
    ar: ["قدّمها مع يخنة عدس", "قطعة زبدة", "صلصة فلفل حار طازجة"],
  },
  "african-peanut-stew": {
    es: ["Cilantro fresco", "Chile extra para dar calor", "Maní tostado encima"],
    fr: ["Coriandre fraîche", "Piment supplémentaire pour le piquant", "Cacahuètes grillées dessus"],
    pt: ["Coentro fresco", "Pimenta extra para picância", "Amendoim torrado por cima"],
    hi: ["ताज़ा धनिया", "तीखेपन के लिए अतिरिक्त मिर्च", "ऊपर भुनी मूंगफली"],
    zh: ["新鲜香菜", "额外的辣椒增加辣度", "上面放烤花生"],
    ar: ["كزبرة طازجة", "فلفل حار إضافي للحرارة", "فول سوداني محمص فوقها"],
  },
  "ethiopian-doro-wat": {
    es: ["Berbere extra para dar calor", "Mitades de huevo duro", "Limón fresco"],
    fr: ["Berbéré supplémentaire pour le piquant", "Moitiés d'œufs durs", "Citron frais"],
    pt: ["Berbere extra para picância", "Metades de ovo cozido", "Limão fresco"],
    hi: ["तीखेपन के लिए अतिरिक्त बरबरे", "उबले अंडे के आधे टुकड़े", "ताज़ा नींबू"],
    zh: ["额外的柏柏尔辣椒增加辣度", "水煮蛋对半切", "新鲜柠檬"],
    ar: ["بربري إضافي للحرارة", "أنصاف بيض مسلوق", "ليمون طازج"],
  },
  "ethiopian-shiro": {
    es: ["Ajo extra", "Chile fresco", "Chorrito de aceite encima"],
    fr: ["Ail supplémentaire", "Piment frais", "Filet d'huile dessus"],
    pt: ["Alho extra", "Pimenta fresca", "Fio de óleo por cima"],
    hi: ["अतिरिक्त लहसुन", "ताज़ी मिर्च", "ऊपर तेल की बूंदें"],
    zh: ["额外的大蒜", "新鲜辣椒", "上面淋一点油"],
    ar: ["ثوم إضافي", "فلفل حار طازج", "رشة زيت فوقها"],
  },
  "ethiopian-tikil-gomen": {
    es: ["Jengibre fresco", "Cúrcuma extra", "Chorrito de limón"],
    fr: ["Gingembre frais", "Curcuma supplémentaire", "Filet de citron"],
    pt: ["Gengibre fresco", "Açafrão-da-terra extra", "Toque de limão"],
    hi: ["ताज़ा अदरक", "अतिरिक्त हल्दी", "नींबू की बूंद"],
    zh: ["新鲜姜", "额外的姜黄粉", "挤一点柠檬汁"],
    ar: ["زنجبيل طازج", "كركم إضافي", "رشة ليمون"],
  },
  "french-quiche-lorraine": {
    es: ["Cebollín fresco", "Pimienta negra molida", "Pizca de nuez moscada"],
    fr: ["Ciboulette fraîche", "Poivre noir concassé", "Pincée de muscade"],
    pt: ["Cebolinha fresca", "Pimenta-do-reino moída", "Pitada de noz-moscada"],
    hi: ["ताज़ी चाइव्स", "कुटी हुई काली मिर्च", "जायफल की चुटकी"],
    zh: ["新鲜细香葱", "现磨黑胡椒", "一小撮肉豆蔻"],
    ar: ["ثوم معمر طازج", "فلفل أسود مطحون", "رشة جوزة الطيب"],
  },
  "french-onion-soup": {
    es: ["Tomillo fresco", "Gruyere extra", "Chorrito de jerez"],
    fr: ["Thym frais", "Gruyère supplémentaire", "Filet de xérès"],
    pt: ["Tomilho fresco", "Gruyère extra", "Toque de xerez"],
    hi: ["ताज़ा थाइम", "अतिरिक्त ग्रुयेर", "शेरी की बूंदें"],
    zh: ["新鲜百里香", "额外的格鲁耶尔芝士", "一点雪利酒"],
    ar: ["زعتر طازج", "غرويير إضافي", "رشة من الشيري"],
  },
  "french-crepes": {
    es: ["Untado de Nutella", "Bayas frescas", "Limón y azúcar"],
    fr: ["Pâte à tartiner Nutella", "Fruits rouges frais", "Citron et sucre"],
    pt: ["Nutella espalhada", "Frutas vermelhas frescas", "Limão e açúcar"],
    hi: ["न्यूटेला स्प्रेड", "ताज़ी बेरीज़", "नींबू और चीनी"],
    zh: ["涂抹能多益", "新鲜浆果", "柠檬和糖"],
    ar: ["دهن نوتيلا", "توت طازج", "ليمون وسكر"],
  },
  "spanish-paella": {
    es: ["Gajos de limón fresco", "Pimentón ahumado", "Perejil fresco"],
    fr: ["Quartiers de citron frais", "Paprika fumé", "Persil frais"],
    pt: ["Gomos de limão fresco", "Páprica defumada", "Salsinha fresca"],
    hi: ["ताज़े नींबू के टुकड़े", "स्मोक्ड पपरिका", "ताज़ा अजमोद"],
    zh: ["新鲜柠檬角", "烟熏红椒粉", "新鲜欧芹"],
    ar: ["أرباع ليمون طازج", "بابريكا مدخنة", "بقدونس طازج"],
  },
  "spanish-patatas-bravas": {
    es: ["Alioli de ajo", "Pimentón ahumado extra", "Perejil fresco"],
    fr: ["Aïoli à l'ail", "Paprika fumé supplémentaire", "Persil frais"],
    pt: ["Aioli de alho", "Páprica defumada extra", "Salsinha fresca"],
    hi: ["गार्लिक आयोली", "अतिरिक्त स्मोक्ड पपरिका", "ताज़ा अजमोद"],
    zh: ["蒜泥蛋黄酱", "额外的烟熏红椒粉", "新鲜欧芹"],
    ar: ["أيولي بالثوم", "بابريكا مدخنة إضافية", "بقدونس طازج"],
  },
  "spanish-gazpacho": {
    es: ["Crutones en cubos", "Chorrito extra de aceite de oliva", "Albahaca fresca"],
    fr: ["Croûtons en dés", "Filet supplémentaire d'huile d'olive", "Basilic frais"],
    pt: ["Croutons em cubos", "Fio extra de azeite", "Manjericão fresco"],
    hi: ["कटे हुए क्राउटन", "अतिरिक्त जैतून तेल की बूंदें", "ताज़ी तुलसी"],
    zh: ["切块的面包丁", "额外淋一点橄榄油", "新鲜罗勒"],
    ar: ["فتات خبز مقطعة", "رشة إضافية من زيت الزيتون", "ريحان طازج"],
  },
  "brazilian-coxinha": {
    es: ["Salsa picante para mojar", "Lima fresca", "Recubrimiento extra crujiente"],
    fr: ["Sauce piquante pour tremper", "Citron vert frais", "Enrobage extra croustillant"],
    pt: ["Molho picante para molhar", "Limão fresco", "Cobertura extra crocante"],
    hi: ["डिपिंग के लिए हॉट सॉस", "ताज़ा नींबू", "अतिरिक्त कुरकुरी कोटिंग"],
    zh: ["蘸辣酱", "新鲜青柠", "额外酥脆的裹层"],
    ar: ["غمس صلصة حارة", "ليمون طازج", "طبقة إضافية مقرمشة"],
  },
  "brazilian-pao-de-queijo": {
    es: ["Parmesano extra mezclado", "Hierbas frescas", "Untado de mantequilla de ajo"],
    fr: ["Parmesan supplémentaire incorporé", "Herbes fraîches", "Badigeonnage de beurre à l'ail"],
    pt: ["Parmesão extra misturado", "Ervas frescas", "Pincelada de manteiga de alho"],
    hi: ["अतिरिक्त परमेसन मिलाया गया", "ताज़ी जड़ी-बूटियां", "गार्लिक बटर ब्रश"],
    zh: ["额外拌入帕玛森芝士", "新鲜香草", "刷蒜香黄油"],
    ar: ["بارميزان إضافي ممزوج", "أعشاب طازجة", "دهن زبدة بالثوم"],
  },
  "brazilian-moqueca": {
    es: ["Cilantro fresco", "Gajos de lima", "Chorrito de aceite de chile"],
    fr: ["Coriandre fraîche", "Quartiers de citron vert", "Filet d'huile pimentée"],
    pt: ["Coentro fresco", "Gomos de limão", "Fio de óleo de pimenta"],
    hi: ["ताज़ा धनिया", "नींबू के टुकड़े", "चिली ऑयल की बूंदें"],
    zh: ["新鲜香菜", "青柠角", "淋一点辣椒油"],
    ar: ["كزبرة طازجة", "أرباع ليمون", "رشة من زيت الفلفل الحار"],
  },
};

// Falls back to the recipe's own English steps/flavorBoosts if no
// translation exists yet for this recipe+language combination.
function recipeSteps(recipe, language) {
  if (language === "en" || !recipe) return recipe?.steps ?? [];
  return RECIPE_STEPS_TR[recipe.id]?.[language] ?? recipe.steps;
}

function recipeFlavorBoosts(recipe, language) {
  if (language === "en" || !recipe) return recipe?.flavorBoosts ?? [];
  return RECIPE_FLAVOR_TR[recipe.id]?.[language] ?? recipe.flavorBoosts;
}

// recipe.time is stored as a plain English string like "8–9 min" — this swaps
// just the "min" unit word for its translation rather than requiring a whole
// separate translated copy of every recipe's time field.
const OVERNIGHT_WORD_TR = { en: "overnight", es: "toda la noche", fr: "une nuit", pt: "durante a noite", hi: "रात भर", zh: "过夜", ar: "طوال الليل" };
const MIN_WORD_TR = { en: "min", es: "min", fr: "min", pt: "min", hi: "मिनट", zh: "分钟", ar: "دقيقة" };
function recipeTime(recipe, language) {
  if (!recipe?.time) return "";
  if (language === "en") return recipe.time;
  const word = MIN_WORD_TR[language] ?? "min";
  const overnight = OVERNIGHT_WORD_TR[language] ?? "overnight";
  return recipe.time.replace(/\bmin\b/gi, word).replace(/\bovernight\b/gi, overnight);
}

// A small set of translated "what else to check" signals, chosen per step by
// matching the step's own English instruction/measure text against common
// cooking-technique keywords. This adds a second, genuinely useful sensory
// cue to every step across all recipes without requiring new per-recipe
// content (and therefore without re-opening the whole translation project).
const SECONDARY_SIGNAL_TR = {
  sear: { en: "Listen for a steady sizzle — silence means it's too cool, violent popping means it's too hot.", es: "Escucha un chisporroteo constante — el silencio significa que está muy frío, y estallidos violentos significan que está muy caliente.", fr: "Écoutez un grésillement constant — le silence signifie que c'est trop froid, des éclats violents signifient que c'est trop chaud.", pt: "Escute um chiado constante — silêncio significa que está frio demais, estalos violentos significam que está quente demais.", hi: "लगातार तड़कने की आवाज़ सुनें — चुप्पी का मतलब है बहुत ठंडा, ज़ोरदार फटने का मतलब है बहुत गर्म।", zh: "听持续的滋滋声——安静说明太凉，剧烈爆裂说明太热。", ar: "استمع لصوت قلي ثابت — الصمت يعني أنه بارد جدًا، والفرقعة العنيفة تعني أنه ساخن جدًا." },
  bake: { en: "A toothpick or knife inserted in the center comes out clean.", es: "Un palillo o cuchillo insertado en el centro sale limpio.", fr: "Un cure-dent ou couteau inséré au centre ressort propre.", pt: "Um palito ou faca inserido no centro sai limpo.", hi: "बीच में डाला गया टूथपिक या चाकू साफ़ बाहर आए।", zh: "插入中心的牙签或刀取出时是干净的。", ar: "عود أسنان أو سكين مدخل في المنتصف يخرج نظيفًا." },
  boil: { en: "Look for small, steady bubbles breaking the surface, not a hard rolling boil unless the step says so.", es: "Busca burbujas pequeñas y constantes rompiendo la superficie, no un hervor fuerte a menos que el paso lo indique.", fr: "Cherchez de petites bulles constantes qui crèvent la surface, pas une ébullition forte sauf indication contraire.", pt: "Procure bolhas pequenas e constantes rompendo a superfície, não uma fervura forte a menos que o passo indique.", hi: "सतह पर टूटते छोटे, लगातार बुलबुले देखें, तेज़ उबाल नहीं जब तक स्टेप में न कहा गया हो।", zh: "观察表面持续的小气泡，除非步骤说明否则不要大滚。", ar: "ابحث عن فقاعات صغيرة وثابتة تكسر السطح، وليس غليانًا قويًا إلا إذا ذكرت الخطوة ذلك." },
  mix: { en: "No dry streaks or lumps remain when you lift the whisk or spatula.", es: "No quedan vetas secas ni grumos al levantar el batidor o la espátula.", fr: "Aucune traînée sèche ni grumeau ne reste quand vous soulevez le fouet ou la spatule.", pt: "Não sobram listras secas nem grumos ao levantar o batedor ou a espátula.", hi: "व्हिस्क या स्पैचुला उठाने पर कोई सूखी धारियां या गुठलियां न बचें।", zh: "提起打蛋器或刮刀时没有干粉条纹或结块。", ar: "لا تبقى خطوط جافة أو تكتلات عند رفع الخفّاقة أو الملعقة." },
  cut: { en: "Pieces are a consistent size, so everything cooks at the same rate.", es: "Los trozos son de tamaño uniforme, para que todo se cocine al mismo ritmo.", fr: "Les morceaux sont de taille uniforme, pour une cuisson égale.", pt: "Os pedaços têm tamanho uniforme, para que tudo cozinhe no mesmo ritmo.", hi: "टुकड़े समान आकार के हों, ताकि सब कुछ एक ही दर से पके।", zh: "食材大小均匀，这样才能同时熟透。", ar: "القطع متساوية الحجم، حتى ينضج كل شيء بنفس المعدل." },
  wait: { en: "This step is about time passing more than a visual change — set a timer.", es: "Este paso es más sobre dejar pasar el tiempo que un cambio visual — pon un temporizador.", fr: "Cette étape concerne plus le temps qui passe qu'un changement visuel — réglez une minuterie.", pt: "Esta etapa é mais sobre o tempo passando do que uma mudança visual — programe um temporizador.", hi: "यह स्टेप दृश्य बदलाव से ज़्यादा समय बीतने के बारे में है — टाइमर सेट करें।", zh: "这一步更多是等待时间而不是视觉变化——设个计时器。", ar: "هذه الخطوة تتعلق بمرور الوقت أكثر من تغيّر بصري — اضبط مؤقتًا." },
  airfry: { en: "Shake or flip halfway through so both sides brown evenly.", es: "Sacude o voltea a la mitad para que ambos lados se doren uniformemente.", fr: "Secouez ou retournez à mi-cuisson pour un brunissement égal des deux côtés.", pt: "Sacuda ou vire na metade para que os dois lados dourem igualmente.", hi: "बीच में हिलाएं या पलटें ताकि दोनों तरफ समान रूप से भूरा हो।", zh: "中途摇晃或翻面，让两面均匀上色。", ar: "هزّ أو اقلب في المنتصف حتى يتحمّر الجانبان بالتساوي." },
  knead: { en: "Dough springs back slowly when poked, instead of tearing or staying dented.", es: "La masa rebota lentamente al presionarla, en vez de romperse o quedar hundida.", fr: "La pâte reprend lentement sa forme quand on appuie dessus, au lieu de se déchirer ou de rester marquée.", pt: "A massa volta devagar ao ser pressionada, em vez de rasgar ou ficar afundada.", hi: "छूने पर आटा धीरे से वापस आए, फटे या दबा हुआ न रहे।", zh: "按压时面团缓慢回弹，而不是撕裂或凹陷不起。", ar: "تعود العجينة ببطء عند الضغط عليها، بدلًا من أن تتمزق أو تبقى غائرة." },
  microwave: { en: "Microwave heats unevenly — pause partway through and stir or rotate if the recipe doesn't already say to.", es: "El microondas calienta de forma desigual — pausa a la mitad y remueve o gira si la receta no lo indica ya.", fr: "Le micro-ondes chauffe de façon inégale — faites une pause à mi-cuisson et remuez ou tournez si la recette ne le précise pas déjà.", pt: "O micro-ondas aquece de forma desigual — pause na metade e mexa ou gire se a receita ainda não pedir isso.", hi: "माइक्रोवेव असमान रूप से गर्म करता है — बीच में रुककर हिलाएं या घुमाएं अगर रेसिपी में पहले से न कहा गया हो।", zh: "微波炉加热不均匀——如果食谱没有说明，中途暂停搅拌或转动一下。", ar: "الميكروويف يسخّن بشكل غير متساوٍ — توقف في المنتصف وحرّك أو أدر الطبق إذا لم تذكر الوصفة ذلك مسبقًا." },
  combine: { en: "Everything should be evenly distributed — no dry pockets or one ingredient piled in a corner.", es: "Todo debe estar distribuido uniformemente — sin bolsillos secos ni un ingrediente amontonado en una esquina.", fr: "Tout doit être réparti uniformément — pas de poches sèches ni un ingrédient entassé dans un coin.", pt: "Tudo deve estar distribuído uniformemente — sem bolsões secos ou um ingrediente amontoado num canto.", hi: "सब कुछ समान रूप से फैला होना चाहिए — कोई सूखा हिस्सा या एक जगह ढेर की गई सामग्री न हो।", zh: "所有食材应均匀分布——没有干燥的部分，也没有某种食材堆积在一角。", ar: "يجب أن يكون كل شيء موزعًا بالتساوي — بدون جيوب جافة أو مكوّن واحد مكدّس في زاوية." },
  warm: { en: "It just needs to be heated through, not bubbling or sizzling hard.", es: "Solo necesita calentarse por dentro, no hervir ni chisporrotear fuerte.", fr: "Il doit juste être bien chaud à cœur, pas bouillonnant ni grésillant fort.", pt: "Só precisa estar aquecido por dentro, não borbulhando ou chiando forte.", hi: "बस अंदर तक गर्म होना चाहिए, ज़ोर से उबलना या तड़कना नहीं।", zh: "只需要热透，不需要剧烈冒泡或滋滋作响。", ar: "يحتاج فقط أن يسخن من الداخل، وليس أن يغلي أو يقلي بشدة." },
  serve: { en: "Taste before serving — this is your last chance to adjust salt or acid.", es: "Prueba antes de servir — es tu última oportunidad de ajustar sal o acidez.", fr: "Goûtez avant de servir — c'est votre dernière chance d'ajuster le sel ou l'acidité.", pt: "Prove antes de servir — esta é sua última chance de ajustar sal ou acidez.", hi: "परोसने से पहले चखें — नमक या खटास ठीक करने का यह आखिरी मौका है।", zh: "上桌前尝一尝——这是调整咸淡或酸度的最后机会。", ar: "تذوّق قبل التقديم — هذه فرصتك الأخيرة لضبط الملح أو الحموضة." },
  general: { en: "If it doesn't look right, trust the description over the clock — every stove, oven, and ingredient batch is a little different.", es: "Si no se ve bien, confía en la descripción más que en el reloj — cada estufa, horno y lote de ingredientes es un poco diferente.", fr: "Si ça ne semble pas correct, fiez-vous à la description plutôt qu'à l'horloge — chaque cuisinière, four et lot d'ingrédients est un peu différent.", pt: "Se não parecer certo, confie na descrição em vez do relógio — cada fogão, forno e lote de ingredientes é um pouco diferente.", hi: "अगर सही न दिखे, तो घड़ी से ज़्यादा विवरण पर भरोसा करें — हर चूल्हा, ओवन, और सामग्री का बैच थोड़ा अलग होता है।", zh: "如果看起来不对，相信描述而不是时钟——每个炉灶、烤箱和食材批次都略有不同。", ar: "إذا لم يبدُ صحيحًا، ثق بالوصف أكثر من الساعة — كل موقد وفرن ودفعة مكونات مختلفة قليلًا." },
};

// Classifies a step by its (always-English) source instruction/measure text
// so classification works the same regardless of which language is displayed,
// then returns the matching signal already translated into that language.
// Every step gets *something* — the "general" bucket is a deliberate catch-all
// so no step is ever left without a second signal.
function secondarySignal(recipe, stepIndex, language) {
  const step = recipe?.steps?.[stepIndex];
  if (!step) return null;
  const text = `${step.instruction} ${step.measure}`.toLowerCase();
  let category = "general";
  if (/air fry/.test(text)) category = "airfry";
  else if (/knead/.test(text)) category = "knead";
  else if (/marinate|chill|rest\b|freeze|refrigerate|soak/.test(text)) category = "wait";
  else if (/microwave/.test(text)) category = "microwave";
  else if (/chop|dice|mince|slice|cut into|julienne/.test(text)) category = "cut";
  else if (/whisk|beat|fold|batter/.test(text)) category = "mix";
  else if (/boil|simmer|poach|\bcook\b.*(pasta|rice|noodles|orzo)|steam/.test(text)) category = "boil";
  else if (/bake|roast/.test(text) && /°f|°c|oven/.test(text)) category = "bake";
  else if (/sear|\bfry\b|sauté|saute|pan-fry|brown|crisp|cook over|over (low|medium|high)|flip|other side|cook through|cook until|cook the|scramble|crack.*egg|broil|toast|golden|melt.*pan|in a (dry |hot |buttered )?pan/.test(text)) category = "sear";
  else if (/toss|combine|layer|top with|\bmix\b|mash|spread|\bbuild\b|stir in|melt|\brub\b|season\b|brush|coat|press|\bform\b|shape|\broll\b|\bwrap\b|arrange|blend|pulse|pierce|nestle|\bdip\b|\bfill\b/.test(text)) category = "combine";
  else if (/warm\b/.test(text)) category = "warm";
  else if (/season to taste|\bserve\b|garnish/.test(text)) category = "serve";
  return SECONDARY_SIGNAL_TR[category][language] ?? SECONDARY_SIGNAL_TR[category].en;
}

function parseQtyToken(str) {
  const mixed = str.trim().match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + (Number(mixed[3]) ? Number(mixed[2]) / Number(mixed[3]) : 0);
  if (str.includes("/")) {
    const [n, d] = str.split("/").map(Number);
    return d ? n / d : n;
  }
  return parseFloat(str);
}

function formatQtyToken(n) {
  if (n <= 0) return "0";
  const whole = Math.floor(n);
  const frac = n - whole;
  const fractions = [[0.125, "1/8"], [0.25, "1/4"], [0.33, "1/3"], [0.5, "1/2"], [0.67, "2/3"], [0.75, "3/4"]];
  for (const [val, label] of fractions) {
    if (Math.abs(frac - val) < 0.05) return whole > 0 ? `${whole} ${label}` : label;
  }
  if (n < 0.25) return String(Math.round(n * 100) / 100); // tiny amounts: don't round down to 0
  const rounded = Math.round(n * 4) / 4;
  return String(rounded);
}

// Scales only the quantity numbers immediately followed by a measurement unit
// (cups, tbsp, eggs, cloves, etc). Numbers followed by time units (min, sec, °F)
// are deliberately left untouched so cook times and temperatures never change
// just because someone adjusted the serving count.
const QTY_UNIT_PATTERN = /(\d+\s+\d+\/\d+|\d+(?:\.\d+)?(?:\/\d+)?)(\s*)(cups?|tbsp|tsp|oz|lbs?|g|kg|ml|l|cloves?|eggs?|slices?|cans?|dozen)\b/gi;

// Scale a translated measure by reusing the English scaling: every quantity
// the English text scales (e.g. "2 cups" -> "4 cups") has its number swapped,
// in order, in the translated text ("2 tazas" -> "4 tazas"). Numbers the
// English text leaves alone (times, temperatures) stay untouched.
function scaleTranslatedMeasure(translated, english, ratio) {
  if (!translated || !english || ratio === 1 || translated === english) return scaleMeasureText(translated, ratio);
  translated = translated.replace(/(\d)?\s*([¼½¾])/g, (m, whole, f) => (whole ? whole + " " : "") + ({ "¼": "1/4", "½": "1/2", "¾": "3/4" })[f]);
  const swaps = [];
  english.replace(QTY_UNIT_PATTERN, (match, numStr) => { swaps.push([numStr, formatQtyToken(parseQtyToken(numStr) * ratio)]); return match; });
  if (!swaps.length) return translated;
  let out = "";
  let rest = translated;
  for (const [from, to] of swaps) {
    const re = new RegExp("(^|[^\\d/.])" + from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+").replace(/\\\./g, "[.,]") + "(?![\\d/.])");
    const m = rest.match(re);
    if (!m) continue;
    const at = m.index + m[1].length;
    out += rest.slice(0, at) + to;
    rest = rest.slice(at + m[0].length - m[1].length);
  }
  return agreeUnits(out + rest);
}

function scaleMeasureText(text, ratio) {
  if (!text || text === "N/A" || ratio === 1) return text;
  return agreeUnits(text.replace(QTY_UNIT_PATTERN, (match, numStr, space, unit) => `${formatQtyToken(parseQtyToken(numStr) * ratio)}${space}${unit}`));
}

// Singular/plural pairs for words that follow an amount, in English, Spanish,
// French and Portuguese. After scaling, each word is made to agree with its
// new amount ("1 taza" -> "2 tazas", "2 cups" -> "1 cup"). French uses the
// singular below 2 ("1,5 tasse"); the others use the plural above 1.
const UNIT_PAIRS = [
  ["cup", "cups"], ["can", "cans"], ["slice", "slices"], ["clove", "cloves"], ["egg", "eggs"], ["lb", "lbs"], ["apple", "apples"],
  ["taza", "tazas"], ["cda", "cdas"], ["cdta", "cdtas"], ["huevo", "huevos"], ["lata", "latas"], ["rebanada", "rebanadas"], ["diente", "dientes"],
  ["plátano", "plátanos"], ["manzana", "manzanas"], ["aguacate", "aguacates"], ["pulgada", "pulgadas"], ["cebolla", "cebollas"], ["tomate", "tomates"],
  ["cucharada", "cucharadas"], ["cucharadita", "cucharaditas"],
  ["xícara", "xícaras"], ["colher", "colheres"], ["ovo", "ovos"], ["fatia", "fatias"], ["dente", "dentes"], ["maçã", "maçãs"], ["abacate", "abacates"],
  ["cebola", "cebolas"], ["limão", "limões"],
];
const FR_UNIT_PAIRS = [
  ["tasse", "tasses"], ["œuf", "œufs"], ["boîte", "boîtes"], ["tranche", "tranches"], ["gousse", "gousses"], ["banane", "bananes"],
  ["pomme", "pommes"], ["avocat", "avocats"], ["oignon", "oignons"], ["citron", "citrons"], ["cuillère", "cuillères"],
];
const UNIT_FORMS = {};
for (const [one, many] of UNIT_PAIRS) UNIT_FORMS[one] = UNIT_FORMS[many] = { one, many, fr: false };
for (const [one, many] of FR_UNIT_PAIRS) UNIT_FORMS[one] = UNIT_FORMS[many] = { one, many, fr: true };
const AMOUNT_WORD = /(^|[^\d\/.,])(\d+\s+\d+\/\d+|\d+(?:[.,]\d+)?(?:\/\d+)?)(\s+)([A-Za-z\u00C0-\u00FF\u0153]+)/g;

function agreeUnits(text) {
  if (!text) return text;
  return text.replace(AMOUNT_WORD, (m, pre, num, space, word) => {
    const forms = UNIT_FORMS[word.toLowerCase()];
    if (!forms) return m;
    const amount = parseQtyToken(num.replace(",", "."));
    const plural = forms.fr ? amount >= 2 : amount > 1;
    let out = plural ? forms.many : forms.one;
    if (word[0] !== word[0].toLowerCase()) out = out[0].toUpperCase() + out.slice(1);
    return pre + num + space + out;
  });
}

// Real store search URLs, verified directly against each site rather than
// guessed, for Canada, the US, Australia, the UK (Tesco), and New Zealand
// (New World) — I found real indexed search pages confirming the exact query
// parameter for each. Mexico reuses Walmart's confirmed pattern on its
// .com.mx domain since it's the same corporate platform. Metro (Canada) is
// deliberately left out: its search only works inside a logged-in,
// store-selected cart session, and Metro's own site states online grocery
// isn't available in Ontario at all.
//
// For the remaining stores (Sainsbury's, Tesco Ireland, SuperValu,
// Countdown, BigBasket, Reliance Fresh, REWE, Edeka, Carrefour, Auchan) I
// could not confirm an exact working search parameter after several search
// attempts — several of these sites gate search behind a JS session or
// account/store selection, same as Metro. Rather than guess a parameter that
// might silently produce a blank page, those link to the store's real
// homepage instead.
//
// Ingredients change store lineup by country, since grocery chains are
// national. Equipment stays fixed to the Canadian lineup (including Amazon)
// regardless of the ingredient country toggle.
const STORES_INGREDIENTS_BY_COUNTRY = {
  ca: [
    { name: "Walmart", search: (q) => `https://www.walmart.ca/en/search?q=${encodeURIComponent(q)}` },
    { name: "Real Canadian Superstore", search: (q) => `https://www.realcanadiansuperstore.ca/en/search?search-bar=${encodeURIComponent(q)}` },
    { name: "No Frills", search: (q) => `https://www.nofrills.ca/en/search?search-bar=${encodeURIComponent(q)}` },
  ],
  us: [
    { name: "Walmart", search: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}` },
    { name: "Target", search: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}` },
  ],
  au: [
    { name: "Woolworths", search: (q) => `https://www.woolworths.com.au/shop/search/products?searchTerm=${encodeURIComponent(q)}` },
    { name: "Coles", search: (q) => `https://www.coles.com.au/search/products?q=${encodeURIComponent(q)}` },
  ],
  mx: [
    { name: "Walmart", search: (q) => `https://www.walmart.com.mx/busqueda?q=${encodeURIComponent(q)}` },
  ],
  gb: [
    { name: "Tesco", search: (q) => `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(q)}` },
    { name: "Sainsbury's", search: () => `https://www.sainsburys.co.uk` },
  ],
  ie: [
    { name: "Tesco Ireland", search: () => `https://www.tesco.ie` },
    { name: "SuperValu", search: () => `https://shop.supervalu.ie` },
  ],
  nz: [
    { name: "New World", search: (q) => `https://www.newworld.co.nz/shop/search?q=${encodeURIComponent(q)}` },
    { name: "Countdown", search: () => `https://www.woolworths.co.nz` },
  ],
  in: [
    { name: "BigBasket", search: () => `https://www.bigbasket.com` },
    { name: "Reliance Fresh", search: () => `https://www.reliancefreshdirect.com` },
  ],
  de: [
    { name: "REWE", search: () => `https://www.rewe.de` },
    { name: "Edeka", search: () => `https://www.edeka.de` },
  ],
  fr: [
    { name: "Carrefour", search: () => `https://www.carrefour.fr` },
    { name: "Auchan", search: () => `https://www.auchan.fr` },
  ],
};
const COUNTRY_OPTIONS = [
  { id: "ca", label: "🇨🇦 Canada" },
  { id: "us", label: "🇺🇸 United States" },
  { id: "au", label: "🇦🇺 Australia" },
  { id: "mx", label: "🇲🇽 Mexico" },
  { id: "gb", label: "🇬🇧 United Kingdom" },
  { id: "ie", label: "🇮🇪 Ireland" },
  { id: "nz", label: "🇳🇿 New Zealand" },
  { id: "in", label: "🇮🇳 India" },
  { id: "de", label: "🇩🇪 Germany" },
  { id: "fr", label: "🇫🇷 France" },
];
const STORES_EQUIPMENT = [
  { name: "Walmart", search: (q) => `https://www.walmart.ca/en/search?q=${encodeURIComponent(q)}` },
  { name: "Amazon", search: (q) => `https://www.amazon.ca/s?k=${encodeURIComponent(q)}` },
  { name: "Canadian Tire", search: () => `https://www.canadiantire.ca` },
  { name: "Costco", search: () => `https://www.costco.ca` },
  { name: "IKEA", search: () => `https://www.ikea.com/ca/en/` },
];

// Builds the actual search term: runs the item name through the same
// singular/plural normalizer used for kitchen matching, so "eggs" and "egg"
// both search as the same clean term rather than whatever form happened to
// be stored.
function buildSearchTerm(name) {
  return normalizeIngredient((name || "").toLowerCase().trim());
}

function ingredientLabel(name, language) {
  const raw = (name || "").toLowerCase().trim();
  if (INGREDIENT_TR[raw]) return INGREDIENT_TR[raw][language] ?? name;
  const norm = normalizeIngredient(raw);
  return INGREDIENT_TR[norm]?.[language] ?? name;
}

// Lets someone type an ingredient in whatever language they're using and still
// have it recognized against the recipe database, which is keyed in English.
// Checks the raw input against every language's translated ingredient names
// (not just the active one) so a typo in the wrong language still resolves,
// then falls back to whatever was typed if it's not a known ingredient at all.
function resolveIngredientCanonical(text) {
  const raw = (text || "").toLowerCase().trim();
  if (!raw) return raw;
  const norm = normalizeIngredient(raw);
  if (INGREDIENT_TR[raw]) return raw;
  if (INGREDIENT_TR[norm]) return norm;
  for (const [key, translations] of Object.entries(INGREDIENT_TR)) {
    for (const lang of Object.keys(translations)) {
      if ((translations[lang] || "").toLowerCase().trim() === raw) return key;
    }
  }
  return raw;
}

// Picks the right singular/plural translation pair based on count — English-style
// pluralization for es/fr/pt (which follow similar patterns), with best-effort
// forms for tw/hi where pluralization works differently.
function pl(count, map, language) {
  const entry = count === 1 ? map.one : map.other;
  return entry[language] ?? entry.en;
}

const RECIPES = [
  {
    id: "mug-eggs",
    name: "Microwave Mug Scrambled Eggs",
    emoji: "🍳",
    color: ["#FFE8B8", "#FFD27A"],
    time: "3 min",
    categories: ["high-protein", "low-calorie", "quick-easy", "beginner-friendly", "budget-friendly", "vegetarian", "low-carb"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["microwave"],
    ingredients: ["eggs", "milk", "salt", "pepper"],
    macros: { calories: 180, protein: 14, carbs: 3, fat: 12 },
    flavorBoosts: ["Shredded cheese stirred in at the end", "A dash of hot sauce", "Chopped chives or green onion"],
    steps: [
      { instruction: "Crack eggs into a large mug and whisk with a fork", measure: "2 eggs + 2 tbsp milk", visual: "Mixture should be one even pale-yellow color, no streaks" },
      { instruction: "Add salt and pepper, whisk again", measure: "Pinch of each", visual: "No dry spots on top" },
      { instruction: "Microwave, stirring halfway through", measure: "45 sec, stir, then 30 sec more", visual: "Eggs are soft, fluffy curds — not shiny or wet-looking" },
    ],
  },
  {
    id: "garlic-pasta",
    name: "One-Pot Garlic Butter Pasta",
    emoji: "🍝",
    color: ["#FFE1D1", "#FDBA9A"],
    time: "15 min",
    categories: ["beginner-friendly", "high-carb", "budget-friendly", "vegetarian", "quick-easy"],
    cuisine: "italian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["pasta", "garlic", "butter", "parmesan", "salt"],
    macros: { calories: 520, protein: 14, carbs: 78, fat: 16 },
    flavorBoosts: ["Red pepper flakes", "Extra parmesan on top", "A squeeze of lemon juice"],
    steps: [
      { instruction: "Boil salted water and cook pasta", measure: "8–9 min, until package says done", visual: "Pasta bends easily but still has a slight firm bite" },
      { instruction: "Melt butter in the same pot, add minced garlic", measure: "1 min over medium-low", visual: "Garlic turns fragrant and light golden — not brown" },
      { instruction: "Toss drained pasta with butter, garlic, parmesan", measure: "Off heat, 30 sec toss", visual: "Every strand looks glossy and coated, none dry" },
    ],
  },
  {
    id: "tuna-wrap",
    name: "No-Cook Tuna Wrap",
    emoji: "🌯",
    color: ["#DCEEDC", "#B8DCC0"],
    time: "5 min",
    categories: ["high-protein", "low-calorie", "quick-easy", "budget-friendly"],
    cuisine: "american",
    mealTime: ["lunch"],
    equipment: [],
    ingredients: ["tortilla", "canned tuna", "mayo", "lettuce"],
    macros: { calories: 340, protein: 22, carbs: 30, fat: 14 },
    flavorBoosts: ["Sriracha or hot sauce", "Sliced avocado", "Pickles for crunch"],
    steps: [
      { instruction: "Mix tuna with mayo in a bowl", measure: "1 can tuna + 1 tbsp mayo", visual: "Tuna holds together when scooped, not runny" },
      { instruction: "Lay tortilla flat, add lettuce and tuna mix", measure: "Center third of the tortilla", visual: "Filling sits in a neat line, not spread edge to edge" },
      { instruction: "Fold in sides, then roll tight", measure: "N/A", visual: "Wrap holds its shape without filling spilling out" },
    ],
  },
  {
    id: "grilled-cheese",
    name: "Pan-Fried Grilled Cheese",
    emoji: "🥪",
    color: ["#FFF0C2", "#FFDD8A"],
    time: "8 min",
    categories: ["beginner-friendly", "quick-easy", "budget-friendly", "high-carb", "vegetarian"],
    cuisine: "american",
    mealTime: ["lunch", "snack"],
    equipment: ["stove", "pan"],
    ingredients: ["bread", "cheese", "butter"],
    macros: { calories: 430, protein: 16, carbs: 32, fat: 26 },
    flavorBoosts: ["Sliced tomato inside", "Thin layer of mustard", "Everything bagel seasoning on the crust"],
    steps: [
      { instruction: "Butter one side of each bread slice", measure: "1 tbsp butter total", visual: "Thin, even layer — no dry patches" },
      { instruction: "Place butter-side down in a cold pan, add cheese, top with other slice", measure: "N/A", visual: "Cheese sits fully inside the bread edges" },
      { instruction: "Cook over medium heat", measure: "3–4 min", visual: "Bottom is golden brown, not dark brown" },
      { instruction: "Flip and cook the other side", measure: "2–3 min", visual: "Cheese is visibly melting at the edges" },
    ],
  },
  {
    id: "ramen-upgrade",
    name: "Instant Ramen Upgrade",
    emoji: "🍜",
    color: ["#FFE0DA", "#FFB6A8"],
    time: "6 min",
    categories: ["quick-easy", "budget-friendly", "high-carb", "beginner-friendly"],
    cuisine: "asian",
    mealTime: ["lunch", "snack"],
    equipment: ["pot"],
    ingredients: ["instant ramen", "egg", "green onion"],
    macros: { calories: 450, protein: 17, carbs: 55, fat: 18 },
    flavorBoosts: ["Sesame oil drizzle", "Chili crisp", "Shredded nori on top"],
    steps: [
      { instruction: "Boil water and cook noodles with seasoning", measure: "3 min", visual: "Noodles have loosened and separated fully" },
      { instruction: "Crack egg into the pot, don't stir immediately", measure: "1 min undisturbed", visual: "White is turning opaque, yolk still soft" },
      { instruction: "Top with chopped green onion and serve", measure: "To taste", visual: "Onion is bright green, not wilted from heat" },
    ],
  },
  {
    id: "overnight-oats",
    name: "Overnight Oats",
    emoji: "🥣",
    color: ["#F0E6D8", "#DDC9A8"],
    time: "5 min + overnight",
    categories: ["healthy-balanced", "high-fiber", "vegetarian", "meal-prep", "budget-friendly"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["fridge"],
    ingredients: ["oats", "milk", "honey", "banana"],
    macros: { calories: 320, protein: 10, carbs: 52, fat: 8 },
    flavorBoosts: ["Cinnamon", "A swirl of peanut butter", "A handful of chopped nuts"],
    steps: [
      { instruction: "Combine oats, milk, and honey in a jar", measure: "1/2 cup oats + 1/2 cup milk + 1 tsp honey", visual: "Oats are fully submerged, none sitting dry on top" },
      { instruction: "Slice banana on top, seal and refrigerate", measure: "Overnight, 6+ hrs", visual: "N/A" },
      { instruction: "Stir before eating", measure: "N/A", visual: "Mixture is thick and creamy, not soupy" },
    ],
  },
  {
    id: "jollof-rice",
    name: "Simple Jollof Rice",
    emoji: "🍚",
    color: ["#FFD9C7", "#F4A97E"],
    time: "35 min",
    categories: ["high-carb", "budget-friendly", "meal-prep", "vegetarian", "vegan"],
    cuisine: "ghanaian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["rice", "canned tomatoes", "tomato paste", "onion"],
    macros: { calories: 380, protein: 7, carbs: 74, fat: 7 },
    flavorBoosts: ["Fried plantain on the side", "A scotch bonnet or chili for heat", "A pinch of curry powder in the base"],
    steps: [
      { instruction: "Blend or finely chop tomatoes, tomato paste, and half the onion", measure: "1 can tomatoes + 2 tbsp paste + 1/2 onion", visual: "Mixture is smooth and deep red, no large chunks" },
      { instruction: "Fry the remaining onion in oil, then add the blend and cook it down", measure: "10–12 min over medium-low heat", visual: "Sauce darkens and the oil visibly separates and pools on top" },
      { instruction: "Stir in rice and water, cover and simmer without stirring too much", measure: "2 cups rice + water to just cover, 20 min covered on low", visual: "Rice is tender and evenly red — a little browning at the bottom is normal" },
      { instruction: "Turn off heat and let it rest before fluffing", measure: "5–10 min covered, then fluff gently with a fork", visual: "Grains separate easily and aren't mushy or wet" },
    ],
  },
  {
    id: "black-bean-bowl",
    name: "Black Bean & Rice Bowl",
    emoji: "🍛",
    color: ["#E3F0DD", "#BFE0B0"],
    time: "20 min",
    categories: ["high-protein", "high-fiber", "high-carb", "budget-friendly", "meal-prep", "healthy-balanced", "vegetarian", "vegan"],
    cuisine: "mexican",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["rice", "canned black beans", "salsa", "corn"],
    macros: { calories: 420, protein: 15, carbs: 78, fat: 6 },
    flavorBoosts: ["Diced avocado", "Fresh lime juice", "Chopped cilantro"],
    steps: [
      { instruction: "Cook rice according to package directions", measure: "1 cup rice + 2 cups water, ~15 min", visual: "Water is fully absorbed, rice is fluffy when fluffed with a fork" },
      { instruction: "Warm black beans and corn together in a pan", measure: "5 min over medium heat", visual: "Beans are heated through and glossy, not dry or cracking" },
      { instruction: "Layer rice, beans and corn, top with salsa", measure: "To taste", visual: "N/A" },
    ],
  },
  {
    id: "chicken-stir-fry",
    name: "Simple Chicken Stir Fry",
    emoji: "🥘",
    color: ["#FFE3C7", "#FFC48A"],
    time: "18 min",
    categories: ["high-protein", "quick-easy", "low-carb", "healthy-balanced"],
    cuisine: "asian",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["chicken breast", "soy sauce", "mixed vegetables", "garlic"],
    macros: { calories: 380, protein: 34, carbs: 18, fat: 16 },
    flavorBoosts: ["Toasted sesame seeds", "Sriracha drizzle", "Fresh grated ginger"],
    steps: [
      { instruction: "Slice chicken into thin strips, season with salt and pepper", measure: "1 lb chicken breast", visual: "Pieces are uniform, about finger-width" },
      { instruction: "Sear chicken in a hot oiled pan", measure: "5–6 min", visual: "Chicken is opaque throughout, edges golden" },
      { instruction: "Add garlic and vegetables, stir fry", measure: "3–4 min", visual: "Veggies are bright colored and still crisp, not limp" },
      { instruction: "Add soy sauce and toss to coat", measure: "1 min", visual: "Sauce clings evenly, no pooling at the bottom" },
    ],
  },
  {
    id: "creamy-chicken-pasta",
    name: "Creamy Chicken Pasta",
    emoji: "🍝",
    color: ["#FDE7E0", "#F7C3B4"],
    time: "25 min",
    categories: ["high-protein", "high-carb"],
    cuisine: "italian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot", "pan"],
    ingredients: ["pasta", "chicken breast", "cream", "garlic", "parmesan"],
    macros: { calories: 610, protein: 38, carbs: 58, fat: 24 },
    flavorBoosts: ["Cracked black pepper", "Fresh basil", "Red pepper flakes"],
    steps: [
      { instruction: "Cook pasta in salted boiling water", measure: "8–9 min", visual: "Tender but still firm to the bite" },
      { instruction: "Sear diced chicken in a separate pan", measure: "6–7 min", visual: "Chicken is opaque with golden edges" },
      { instruction: "Add garlic and cream to the chicken pan, simmer", measure: "3–4 min", visual: "Sauce thickens enough to coat the back of a spoon" },
      { instruction: "Toss drained pasta with sauce and parmesan", measure: "1 min", visual: "Every piece is glossy and coated" },
    ],
  },
  {
    id: "chickpea-curry",
    name: "15-Minute Chickpea Curry",
    emoji: "🍛",
    color: ["#FBE7C6", "#F0C27B"],
    time: "20 min",
    categories: ["vegan", "vegetarian", "high-fiber", "budget-friendly", "meal-prep", "healthy-balanced"],
    cuisine: "indian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["canned chickpeas", "canned tomatoes", "onion", "curry powder"],
    macros: { calories: 340, protein: 14, carbs: 52, fat: 9 },
    flavorBoosts: ["Fresh cilantro", "A squeeze of lime", "A swirl of coconut milk"],
    steps: [
      { instruction: "Sauté chopped onion in oil until soft", measure: "5 min", visual: "Onion turns translucent, not browned" },
      { instruction: "Stir in curry powder and cook briefly", measure: "30 sec", visual: "Fragrant, coats the onion evenly" },
      { instruction: "Add tomatoes and chickpeas, simmer", measure: "15 min", visual: "Sauce has thickened and reduced slightly" },
      { instruction: "Season to taste and serve", measure: "N/A", visual: "Sauce coats the back of a spoon" },
    ],
  },
  {
    id: "turkey-taco-bowl",
    name: "Turkey Taco Bowl",
    emoji: "🌮",
    color: ["#FFE4D6", "#FCB89A"],
    time: "15 min",
    categories: ["high-protein", "low-carb", "healthy-balanced"],
    cuisine: "mexican",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["ground turkey", "taco seasoning", "lettuce", "salsa"],
    macros: { calories: 390, protein: 32, carbs: 16, fat: 20 },
    flavorBoosts: ["Shredded cheese", "Sour cream", "Sliced jalapeño"],
    steps: [
      { instruction: "Brown ground turkey in a pan", measure: "6–8 min", visual: "No pink remaining, crumbled evenly" },
      { instruction: "Stir in taco seasoning and a splash of water", measure: "2 min", visual: "Meat is evenly coated and glossy" },
      { instruction: "Build bowl with lettuce and turkey", measure: "N/A", visual: "N/A" },
      { instruction: "Top with salsa", measure: "To taste", visual: "N/A" },
    ],
  },
  {
    id: "greek-yogurt-parfait",
    name: "Greek Yogurt Parfait",
    emoji: "🍓",
    color: ["#FDE2EC", "#F8B4CE"],
    time: "5 min",
    categories: ["vegetarian", "high-protein", "low-calorie", "quick-easy", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: ["fridge"],
    ingredients: ["greek yogurt", "granola", "honey", "berries"],
    macros: { calories: 260, protein: 20, carbs: 34, fat: 5 },
    flavorBoosts: ["Chia seeds", "Extra honey drizzle", "Crushed almonds"],
    steps: [
      { instruction: "Layer yogurt in a glass or bowl", measure: "1/2 cup", visual: "Sits in an even layer" },
      { instruction: "Add a layer of berries and granola", measure: "To taste", visual: "Layers stay visually distinct" },
      { instruction: "Repeat layers and drizzle honey on top", measure: "N/A", visual: "N/A" },
    ],
  },
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    emoji: "🥑",
    color: ["#E7F2DD", "#C3E0AE"],
    time: "6 min",
    categories: ["vegetarian", "vegan", "quick-easy", "budget-friendly"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: [],
    ingredients: ["bread", "avocado", "salt", "pepper"],
    macros: { calories: 290, protein: 7, carbs: 30, fat: 17 },
    flavorBoosts: ["Red pepper flakes", "A poached egg on top", "Everything bagel seasoning"],
    steps: [
      { instruction: "Toast the bread until crisp", measure: "2–3 min", visual: "Deep golden brown, firm when tapped" },
      { instruction: "Mash avocado with salt and pepper", measure: "1/2 avocado", visual: "Mixture is chunky but spreadable" },
      { instruction: "Spread over toast", measure: "N/A", visual: "Avocado reaches every edge" },
    ],
  },
  {
    id: "lentil-soup",
    name: "Simple Lentil Soup",
    emoji: "🍲",
    color: ["#F3E6D3", "#DDBE8C"],
    time: "30 min",
    categories: ["vegan", "vegetarian", "high-fiber", "budget-friendly", "meal-prep", "healthy-balanced"],
    cuisine: "indian",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["lentils", "carrot", "onion", "vegetable broth"],
    macros: { calories: 310, protein: 18, carbs: 52, fat: 3 },
    flavorBoosts: ["Cumin toasted in oil", "Fresh lemon juice", "Chopped parsley"],
    steps: [
      { instruction: "Sauté chopped onion and carrot", measure: "5 min", visual: "Vegetables soften and turn slightly golden" },
      { instruction: "Add lentils and broth, bring to a boil", measure: "2 min", visual: "Liquid is at a steady rolling boil" },
      { instruction: "Reduce heat and simmer until lentils are tender", measure: "20–25 min", visual: "Lentils mash easily against the pot with a spoon" },
    ],
  },
  {
    id: "veggie-fried-rice",
    name: "Veggie Fried Rice",
    emoji: "🍚",
    color: ["#EAF3DC", "#C9E2AE"],
    time: "15 min",
    categories: ["vegetarian", "quick-easy", "budget-friendly", "meal-prep"],
    cuisine: "asian",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["rice", "egg", "mixed vegetables", "soy sauce"],
    macros: { calories: 360, protein: 11, carbs: 58, fat: 9 },
    flavorBoosts: ["Sesame oil", "Sriracha", "Sliced scallions"],
    steps: [
      { instruction: "Scramble egg in a hot oiled pan, set aside", measure: "2 min", visual: "Egg is just set, no runny parts" },
      { instruction: "Stir fry vegetables", measure: "3–4 min", visual: "Veggies are bright and slightly softened" },
      { instruction: "Add rice and soy sauce, breaking up clumps", measure: "4–5 min", visual: "Rice grains separate and turn light golden" },
      { instruction: "Fold in scrambled egg", measure: "1 min", visual: "Egg pieces evenly distributed throughout" },
    ],
  },
  {
    id: "greek-salad",
    name: "Greek Salad",
    emoji: "🥗",
    color: ["#E8F3E0", "#BFE0A8"],
    time: "10 min",
    categories: ["vegetarian", "low-calorie", "quick-easy", "healthy-balanced", "budget-friendly"],
    cuisine: "mediterranean",
    mealTime: ["lunch"],
    equipment: [],
    ingredients: ["cucumber", "tomato", "feta cheese", "olives", "red onion"],
    macros: { calories: 220, protein: 7, carbs: 12, fat: 16 },
    flavorBoosts: ["Dried oregano", "Extra virgin olive oil drizzle", "A squeeze of lemon"],
    steps: [
      { instruction: "Chop cucumber, tomato, and red onion into bite-size pieces", measure: "N/A", visual: "Pieces are roughly uniform in size" },
      { instruction: "Toss with olives and crumbled feta, drizzle with olive oil", measure: "N/A", visual: "Feta is scattered evenly, not clumped" },
    ],
  },
  {
    id: "hummus-pita",
    name: "Hummus & Pita",
    emoji: "🧆",
    color: ["#FBEFD6", "#EFCB86"],
    time: "5 min",
    categories: ["vegan", "vegetarian", "quick-easy", "budget-friendly"],
    cuisine: "mediterranean",
    mealTime: ["lunch", "snack"],
    equipment: [],
    ingredients: ["hummus", "pita bread", "cucumber", "olive oil"],
    macros: { calories: 310, protein: 9, carbs: 38, fat: 14 },
    flavorBoosts: ["Paprika sprinkle", "Extra olive oil", "Chopped parsley"],
    steps: [
      { instruction: "Warm pita lightly if you'd like", measure: "1 min", visual: "Pita is soft and pliable, not stiff" },
      { instruction: "Spread hummus generously and top with sliced cucumber", measure: "N/A", visual: "Hummus covers edge to edge" },
    ],
  },
  {
    id: "shakshuka",
    name: "Shakshuka",
    emoji: "🍳",
    color: ["#FFE3D6", "#F7A98A"],
    time: "20 min",
    categories: ["vegetarian", "high-protein", "healthy-balanced"],
    cuisine: "mediterranean",
    mealTime: ["breakfast"],
    equipment: ["stove", "pan"],
    ingredients: ["eggs", "canned tomatoes", "onion", "bell pepper"],
    macros: { calories: 290, protein: 16, carbs: 18, fat: 17 },
    flavorBoosts: ["Crumbled feta", "Fresh parsley", "A pinch of cumin"],
    steps: [
      { instruction: "Sauté onion and bell pepper until soft", measure: "5 min", visual: "Vegetables are soft and translucent" },
      { instruction: "Add tomatoes and simmer into a thick sauce", measure: "8–10 min", visual: "Sauce has thickened, a spoon leaves a trail" },
      { instruction: "Crack eggs into the sauce and cover until set", measure: "5–6 min", visual: "Whites are fully set, yolks still slightly soft" },
    ],
  },
  {
    id: "jerk-chicken",
    name: "Jerk Chicken",
    emoji: "🍗",
    color: ["#FFE0C7", "#F5A65E"],
    time: "30 min",
    categories: ["high-protein", "low-carb"],
    cuisine: "caribbean",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["chicken thighs", "jerk seasoning", "lime"],
    macros: { calories: 340, protein: 36, carbs: 4, fat: 19 },
    flavorBoosts: ["Grilled pineapple on the side", "Extra lime", "Scotch bonnet hot sauce"],
    steps: [
      { instruction: "Rub chicken thighs with jerk seasoning and lime juice", measure: "10 min marinate if time allows", visual: "Seasoning coats every surface evenly" },
      { instruction: "Sear in a hot pan until cooked through, flipping once", measure: "12–14 min total", visual: "Juices run clear, no pink at the center" },
    ],
  },
  {
    id: "rice-and-peas",
    name: "Rice and Peas",
    emoji: "🍚",
    color: ["#EAF3DC", "#B8DDA0"],
    time: "25 min",
    categories: ["vegan", "vegetarian", "budget-friendly", "meal-prep", "high-carb"],
    cuisine: "caribbean",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["rice", "canned kidney beans", "coconut milk", "onion"],
    macros: { calories: 380, protein: 9, carbs: 68, fat: 9 },
    flavorBoosts: ["Fresh thyme", "Scotch bonnet for heat", "Extra garlic"],
    steps: [
      { instruction: "Sauté onion in oil until soft", measure: "3 min", visual: "Onion is translucent" },
      { instruction: "Add rice, beans, and coconut milk, bring to a boil then simmer covered", measure: "18–20 min", visual: "Rice is tender and liquid fully absorbed" },
    ],
  },
  {
    id: "pad-thai",
    name: "Pad Thai",
    emoji: "🍜",
    color: ["#FFEFD1", "#F7C877"],
    time: "20 min",
    categories: ["high-protein", "quick-easy"],
    cuisine: "thai",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["rice noodles", "eggs", "bean sprouts", "peanuts"],
    macros: { calories: 460, protein: 18, carbs: 62, fat: 16 },
    flavorBoosts: ["Crushed peanuts", "Lime wedge", "Chili flakes"],
    steps: [
      { instruction: "Soak rice noodles in warm (not boiling) water until pliable", measure: "30–40 min", visual: "Noodles bend easily with a slight bite left, don't leave them mushy" },
      { instruction: "Scramble eggs in a hot pan, push to the side", measure: "2 min", visual: "Eggs are just set" },
      { instruction: "Add noodles and sauce, toss with sprouts and peanuts", measure: "4–5 min", visual: "Noodles are glossy and evenly coated" },
    ],
  },
  {
    id: "thai-basil-chicken",
    name: "Thai Basil Chicken",
    emoji: "🌶️",
    color: ["#E7F2DB", "#B7DD9C"],
    time: "15 min",
    categories: ["high-protein", "quick-easy", "low-carb"],
    cuisine: "thai",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["ground chicken", "garlic", "thai basil", "soy sauce"],
    macros: { calories: 320, protein: 30, carbs: 8, fat: 18 },
    flavorBoosts: ["Fried egg on top", "Extra chili", "A splash of fish sauce"],
    steps: [
      { instruction: "Sauté garlic until fragrant", measure: "30 sec", visual: "Golden but not browned" },
      { instruction: "Add ground chicken and cook through", measure: "6–7 min", visual: "No pink remaining, well browned" },
      { instruction: "Stir in soy sauce and basil off heat", measure: "1 min", visual: "Basil is just wilted, still bright green" },
    ],
  },
  {
    id: "kung-pao-chicken",
    name: "Kung Pao Chicken",
    emoji: "🥡",
    color: ["#FDE3DC", "#F5A895"],
    time: "20 min",
    categories: ["high-protein", "quick-easy"],
    cuisine: "chinese",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["chicken breast", "peanuts", "bell pepper", "soy sauce"],
    macros: { calories: 390, protein: 32, carbs: 16, fat: 22 },
    flavorBoosts: ["Dried chilies", "Extra peanuts", "Chopped scallions"],
    steps: [
      { instruction: "Sear diced chicken until golden", measure: "5–6 min", visual: "Edges golden, cooked through" },
      { instruction: "Add bell pepper and peanuts, stir fry", measure: "3 min", visual: "Pepper is bright and slightly softened" },
      { instruction: "Toss with sauce until coated", measure: "1–2 min", visual: "Sauce clings evenly and glossy" },
    ],
  },
  {
    id: "egg-drop-soup",
    name: "Egg Drop Soup",
    emoji: "🍲",
    color: ["#FFF3D6", "#F5D98A"],
    time: "10 min",
    categories: ["low-calorie", "quick-easy", "high-protein"],
    cuisine: "chinese",
    mealTime: ["lunch"],
    equipment: ["stove", "pot"],
    ingredients: ["chicken broth", "eggs", "cornstarch", "green onion"],
    macros: { calories: 140, protein: 11, carbs: 6, fat: 7 },
    flavorBoosts: ["White pepper", "Sesame oil drizzle", "Extra scallions"],
    steps: [
      { instruction: "Bring broth to a gentle simmer", measure: "3–4 min", visual: "Small steady bubbles, not a rolling boil" },
      { instruction: "Drizzle beaten egg in slowly while stirring", measure: "1 min", visual: "Egg forms thin ribbons, not clumps" },
    ],
  },
  {
    id: "bibimbap",
    name: "Bibimbap Bowl",
    emoji: "🍱",
    color: ["#FBE7D3", "#F0B27E"],
    time: "25 min",
    categories: ["healthy-balanced", "high-fiber", "high-protein"],
    cuisine: "korean",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["rice", "mixed vegetables", "egg", "gochujang"],
    macros: { calories: 420, protein: 16, carbs: 58, fat: 14 },
    flavorBoosts: ["Extra gochujang", "Sesame oil", "Toasted sesame seeds"],
    steps: [
      { instruction: "Cook rice and set aside", measure: "Per package", visual: "Fluffy and fully cooked" },
      { instruction: "Sauté vegetables separately until just tender", measure: "5–6 min", visual: "Still slightly crisp, bright colors" },
      { instruction: "Fry an egg sunny-side up and assemble the bowl", measure: "2–3 min", visual: "White is set, yolk still runny" },
    ],
  },
  {
    id: "kimchi-fried-rice",
    name: "Kimchi Fried Rice",
    emoji: "🍚",
    color: ["#FFE3DE", "#F5A79B"],
    time: "15 min",
    categories: ["quick-easy", "budget-friendly", "meal-prep"],
    cuisine: "korean",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["rice", "kimchi", "egg", "sesame oil"],
    macros: { calories: 380, protein: 11, carbs: 52, fat: 14 },
    flavorBoosts: ["Fried egg on top", "Extra kimchi juice", "Seaweed strips"],
    steps: [
      { instruction: "Sauté chopped kimchi in a hot pan", measure: "2–3 min", visual: "Kimchi edges start to caramelize" },
      { instruction: "Add rice and sesame oil, stir fry until heated through", measure: "4–5 min", visual: "Rice is evenly reddish and slightly crisp in spots" },
      { instruction: "Top with a fried egg", measure: "2 min", visual: "Yolk still soft" },
    ],
  },
  {
    id: "ratatouille",
    name: "Ratatouille",
    emoji: "🍆",
    color: ["#F0E4D4", "#D6A96F"],
    time: "35 min",
    categories: ["vegan", "vegetarian", "healthy-balanced", "meal-prep"],
    cuisine: "french",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["eggplant", "zucchini", "tomato", "bell pepper"],
    macros: { calories: 180, protein: 4, carbs: 24, fat: 9 },
    flavorBoosts: ["Fresh basil", "Extra virgin olive oil", "Grated parmesan (optional)"],
    steps: [
      { instruction: "Chop all vegetables into similar-sized pieces", measure: "N/A", visual: "Pieces are roughly uniform for even cooking" },
      { instruction: "Sauté in batches starting with the firmest vegetables", measure: "15 min total", visual: "Each vegetable is tender but holds its shape" },
      { instruction: "Combine everything and simmer together", measure: "10 min", visual: "Mixture has melded into a thick, stew-like consistency" },
    ],
  },
  {
    id: "croque-monsieur",
    name: "Croque Monsieur",
    emoji: "🥪",
    color: ["#FFEFCB", "#F0CB7A"],
    time: "12 min",
    categories: ["high-protein", "beginner-friendly"],
    cuisine: "french",
    mealTime: ["lunch"],
    equipment: ["stove", "pan"],
    ingredients: ["bread", "ham", "cheese", "butter"],
    macros: { calories: 480, protein: 24, carbs: 30, fat: 29 },
    flavorBoosts: ["Dijon mustard", "A pinch of nutmeg", "Extra melted cheese on top"],
    steps: [
      { instruction: "Layer ham and cheese between buttered bread slices", measure: "N/A", visual: "Filling reaches every edge" },
      { instruction: "Cook in a pan over medium heat until golden on both sides", measure: "3–4 min per side", visual: "Deep golden brown, cheese visibly melting at the edges" },
    ],
  },
  {
    id: "blt",
    name: "BLT Sandwich",
    emoji: "🥓",
    color: ["#FFE7DC", "#F4AE9A"],
    time: "12 min",
    categories: ["quick-easy", "beginner-friendly"],
    cuisine: "american",
    mealTime: ["lunch"],
    equipment: ["stove", "pan"],
    ingredients: ["bacon", "bread", "lettuce", "tomato"],
    macros: { calories: 410, protein: 15, carbs: 28, fat: 26 },
    flavorBoosts: ["Mayo spread", "Sliced avocado", "Cracked black pepper"],
    steps: [
      { instruction: "Cook bacon until crisp", measure: "6–8 min", visual: "Deep golden-brown and firm, not floppy" },
      { instruction: "Toast the bread", measure: "2 min", visual: "Golden and firm when tapped" },
      { instruction: "Layer bacon, lettuce, and tomato between the slices", measure: "N/A", visual: "Tomato slices don't overhang the bread" },
    ],
  },
  {
    id: "chili-con-carne",
    name: "Chili Con Carne",
    emoji: "🌶️",
    color: ["#FBE0D8", "#EF9E86"],
    time: "35 min",
    categories: ["high-protein", "meal-prep", "budget-friendly"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["ground beef", "canned kidney beans", "canned tomatoes", "onion"],
    macros: { calories: 420, protein: 28, carbs: 30, fat: 20 },
    flavorBoosts: ["Shredded cheese", "Sour cream", "Chopped jalapeño"],
    steps: [
      { instruction: "Brown ground beef with onion", measure: "7–8 min", visual: "No pink remaining, onion softened" },
      { instruction: "Add tomatoes, beans, and seasoning, simmer", measure: "20–25 min", visual: "Sauce has thickened and darkened" },
    ],
  },
  {
    id: "pancakes",
    name: "Fluffy Pancakes",
    emoji: "🥞",
    color: ["#FFF0C7", "#F5D27A"],
    time: "20 min",
    categories: ["vegetarian", "beginner-friendly"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["stove", "pan"],
    ingredients: ["flour", "eggs", "milk", "butter"],
    macros: { calories: 350, protein: 10, carbs: 48, fat: 13 },
    flavorBoosts: ["Maple syrup", "Fresh berries", "Whipped butter"],
    steps: [
      { instruction: "Whisk flour, eggs, and milk into a smooth batter", measure: "2 min", visual: "No visible lumps, pours in a steady ribbon" },
      { instruction: "Cook spoonfuls of batter on a buttered pan", measure: "2–3 min per side", visual: "Bubbles form and pop on the surface before flipping, golden brown on both sides" },
    ],
  },
  {
    id: "mac-and-cheese",
    name: "Stovetop Mac and Cheese",
    emoji: "🧀",
    color: ["#FFEBB0", "#F4C34F"],
    time: "20 min",
    categories: ["vegetarian", "high-carb", "beginner-friendly", "budget-friendly"],
    cuisine: "american",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["pasta", "cheese", "milk", "butter"],
    macros: { calories: 560, protein: 20, carbs: 62, fat: 24 },
    flavorBoosts: ["Breadcrumb topping", "Hot sauce", "Extra sharp cheddar"],
    steps: [
      { instruction: "Cook pasta until tender", measure: "8–9 min", visual: "Tender but firm to the bite" },
      { instruction: "Melt butter with milk, stir in cheese off heat", measure: "2–3 min", visual: "Sauce is smooth and glossy, no clumps" },
      { instruction: "Toss drained pasta with the cheese sauce", measure: "1 min", visual: "Every piece is fully coated" },
    ],
  },
  {
    id: "margherita-toast",
    name: "Margherita Toast",
    emoji: "🍕",
    color: ["#FDE8DC", "#F3AE93"],
    time: "10 min",
    categories: ["vegetarian", "quick-easy", "budget-friendly"],
    cuisine: "italian",
    mealTime: ["snack", "lunch"],
    equipment: ["oven"],
    ingredients: ["bread", "tomato", "mozzarella", "basil"],
    macros: { calories: 310, protein: 14, carbs: 30, fat: 15 },
    flavorBoosts: ["Balsamic glaze drizzle", "Red pepper flakes", "Extra basil"],
    steps: [
      { instruction: "Top bread with sliced tomato and mozzarella", measure: "N/A", visual: "Cheese covers the bread evenly" },
      { instruction: "Broil until cheese is melted and bubbling", measure: "3–4 min", visual: "Cheese has browned in spots, not burnt" },
    ],
  },
  {
    id: "caprese-salad",
    name: "Caprese Salad",
    emoji: "🍅",
    color: ["#FCE7DE", "#F2AC94"],
    time: "8 min",
    categories: ["vegetarian", "low-calorie", "quick-easy", "healthy-balanced"],
    cuisine: "italian",
    mealTime: ["lunch"],
    equipment: [],
    ingredients: ["tomato", "mozzarella", "basil", "olive oil"],
    macros: { calories: 250, protein: 12, carbs: 8, fat: 19 },
    flavorBoosts: ["Balsamic reduction", "Flaky sea salt", "Cracked pepper"],
    steps: [
      { instruction: "Slice tomato and mozzarella into even rounds", measure: "N/A", visual: "Slices are similar thickness" },
      { instruction: "Layer alternating with basil leaves, drizzle with olive oil", measure: "N/A", visual: "Oil is evenly distributed, not pooled" },
    ],
  },
  {
    id: "minestrone",
    name: "Minestrone Soup",
    emoji: "🍲",
    color: ["#EFF2D8", "#C7D89C"],
    time: "30 min",
    categories: ["vegan", "vegetarian", "high-fiber", "meal-prep", "healthy-balanced"],
    cuisine: "italian",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["canned tomatoes", "mixed vegetables", "pasta", "vegetable broth"],
    macros: { calories: 260, protein: 9, carbs: 46, fat: 5 },
    flavorBoosts: ["Grated parmesan", "Fresh basil", "Drizzle of olive oil"],
    steps: [
      { instruction: "Sauté vegetables until just softening", measure: "5 min", visual: "Edges starting to soften, still colorful" },
      { instruction: "Add broth and tomatoes, simmer", measure: "15 min", visual: "Vegetables are tender" },
      { instruction: "Add pasta and cook until al dente", measure: "8–9 min", visual: "Pasta has a slight bite left" },
    ],
  },
  {
    id: "quesadillas",
    name: "Cheese Quesadillas",
    emoji: "🧀",
    color: ["#FFEACB", "#F3C077"],
    time: "10 min",
    categories: ["vegetarian", "quick-easy", "beginner-friendly", "budget-friendly"],
    cuisine: "mexican",
    mealTime: ["lunch", "snack"],
    equipment: ["stove", "pan"],
    ingredients: ["tortilla", "cheese", "salsa"],
    macros: { calories: 380, protein: 16, carbs: 34, fat: 20 },
    flavorBoosts: ["Sour cream", "Sliced jalapeños", "Fresh cilantro"],
    steps: [
      { instruction: "Sprinkle cheese over half a tortilla and fold over", measure: "N/A", visual: "Cheese is spread evenly, not piled in one spot" },
      { instruction: "Cook in a dry pan until golden and cheese is melted", measure: "2–3 min per side", visual: "Deep golden-brown blisters, cheese fully melted" },
    ],
  },
  {
    id: "breakfast-burrito",
    name: "Breakfast Burrito",
    emoji: "🌯",
    color: ["#FFE6D2", "#F3AC7C"],
    time: "12 min",
    categories: ["high-protein", "quick-easy"],
    cuisine: "mexican",
    mealTime: ["breakfast"],
    equipment: ["stove", "pan"],
    ingredients: ["eggs", "tortilla", "cheese", "salsa"],
    macros: { calories: 420, protein: 20, carbs: 32, fat: 23 },
    flavorBoosts: ["Sliced avocado", "Hot sauce", "Black beans"],
    steps: [
      { instruction: "Scramble eggs in a hot pan", measure: "3–4 min", visual: "Soft curds, not browned" },
      { instruction: "Fill tortilla with eggs, cheese, and salsa, then roll tightly", measure: "N/A", visual: "Wrap holds its shape without tearing" },
    ],
  },
  {
    id: "paneer-tikka",
    name: "Paneer Tikka",
    emoji: "🧀",
    color: ["#FBE4CE", "#EFAE6E"],
    time: "20 min",
    categories: ["vegetarian", "high-protein", "low-carb"],
    cuisine: "indian",
    mealTime: ["dinner", "snack"],
    equipment: ["stove", "pan"],
    ingredients: ["paneer", "yogurt", "bell pepper", "spices"],
    macros: { calories: 320, protein: 18, carbs: 12, fat: 22 },
    flavorBoosts: ["Mint chutney", "Lemon squeeze", "Extra chili powder"],
    steps: [
      { instruction: "Marinate paneer cubes in yogurt and spices", measure: "10 min if time allows", visual: "Coating is thick and evenly covers each cube" },
      { instruction: "Pan-sear paneer and peppers until charred in spots", measure: "6–8 min", visual: "Distinct golden-brown spots, not uniformly pale" },
    ],
  },
  {
    id: "aloo-gobi",
    name: "Aloo Gobi",
    emoji: "🥔",
    color: ["#FBEFCB", "#E8CD82"],
    time: "30 min",
    categories: ["vegan", "vegetarian", "budget-friendly", "healthy-balanced"],
    cuisine: "indian",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["potato", "cauliflower", "onion", "curry powder"],
    macros: { calories: 250, protein: 6, carbs: 38, fat: 9 },
    flavorBoosts: ["Fresh cilantro", "Squeeze of lemon", "Extra chili"],
    steps: [
      { instruction: "Sauté onion with curry powder until fragrant", measure: "3–4 min", visual: "Spices coat the onion evenly and smell toasted" },
      { instruction: "Add potato and cauliflower, cover and cook until tender", measure: "18–20 min", visual: "A fork slides into the potato easily" },
    ],
  },
  {
    id: "teriyaki-salmon",
    name: "Teriyaki Salmon",
    emoji: "🐟",
    color: ["#FFE3D2", "#F2A98A"],
    time: "18 min",
    categories: ["high-protein", "quick-easy", "low-carb"],
    cuisine: "japanese",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["salmon fillet", "soy sauce", "honey", "garlic"],
    macros: { calories: 420, protein: 34, carbs: 14, fat: 24 },
    flavorBoosts: ["Toasted sesame seeds", "Sliced scallions", "A squeeze of lime"],
    steps: [
      { instruction: "Sear salmon skin-side down in a hot pan", measure: "4–5 min", visual: "Skin is crisp and releases easily from the pan" },
      { instruction: "Flip and add soy sauce, honey, and garlic", measure: "3–4 min", visual: "Sauce has thickened into a glossy glaze" },
    ],
  },
  {
    id: "onigiri",
    name: "Onigiri Rice Balls",
    emoji: "🍙",
    color: ["#F4F0E3", "#DCD2AE"],
    time: "15 min",
    categories: ["vegetarian", "budget-friendly", "meal-prep", "quick-easy"],
    cuisine: "japanese",
    mealTime: ["snack", "lunch"],
    equipment: [],
    ingredients: ["rice", "nori", "salt", "sesame seeds"],
    macros: { calories: 180, protein: 4, carbs: 38, fat: 1 },
    flavorBoosts: ["A pickled plum center", "Furikake seasoning", "A dab of soy sauce"],
    steps: [
      { instruction: "Wet hands lightly with salted water and shape rice into a triangle", measure: "1/2 cup rice per ball", visual: "Rice holds together firmly without crumbling" },
      { instruction: "Wrap a strip of nori around the base", measure: "N/A", visual: "Nori sits smooth and doesn't wrinkle" },
    ],
  },
  {
    id: "miso-soup",
    name: "Miso Soup",
    emoji: "🍲",
    color: ["#EFE7D8", "#D8C79A"],
    time: "10 min",
    categories: ["vegan", "vegetarian", "low-calorie", "quick-easy"],
    cuisine: "japanese",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["miso paste", "tofu", "seaweed", "green onion"],
    macros: { calories: 90, protein: 7, carbs: 6, fat: 4 },
    flavorBoosts: ["Extra tofu cubes", "A drizzle of sesame oil", "Chili oil for heat"],
    steps: [
      { instruction: "Heat water until steaming, not boiling", measure: "3–4 min", visual: "Small bubbles form at the edges, no rolling boil" },
      { instruction: "Whisk in miso paste off heat, then add tofu and seaweed", measure: "1–2 tbsp miso", visual: "Broth turns opaque and evenly colored, no paste clumps" },
    ],
  },
  {
    id: "spring-rolls",
    name: "Fresh Spring Rolls",
    emoji: "🥬",
    color: ["#E9F3DE", "#BEE0A4"],
    time: "20 min",
    categories: ["vegan", "vegetarian", "low-calorie", "quick-easy"],
    cuisine: "vietnamese",
    mealTime: ["lunch", "snack"],
    equipment: [],
    ingredients: ["rice paper", "lettuce", "rice noodles", "herbs"],
    macros: { calories: 210, protein: 6, carbs: 38, fat: 3 },
    flavorBoosts: ["Peanut dipping sauce", "Sliced cucumber", "Fresh mint"],
    steps: [
      { instruction: "Dip rice paper in warm water until just pliable", measure: "5–10 sec", visual: "Paper is soft but not sticky or torn" },
      { instruction: "Layer lettuce, noodles, and herbs, then roll tightly", measure: "N/A", visual: "Roll is snug with no air pockets, fillings visible through the wrap" },
    ],
  },
  {
    id: "quick-beef-pho",
    name: "Quick Beef Pho",
    emoji: "🍜",
    color: ["#FCE7DA", "#F0AE8C"],
    time: "20 min",
    categories: ["high-protein", "healthy-balanced"],
    cuisine: "vietnamese",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["beef broth", "rice noodles", "beef", "bean sprouts"],
    macros: { calories: 380, protein: 26, carbs: 46, fat: 9 },
    flavorBoosts: ["Fresh basil and lime", "Sriracha", "Hoisin sauce"],
    steps: [
      { instruction: "Bring broth to a simmer with spices", measure: "5 min", visual: "Broth is fragrant and steadily simmering" },
      { instruction: "Cook rice noodles separately until tender", measure: "5–6 min", visual: "Noodles are soft but not mushy" },
      { instruction: "Add thinly sliced raw beef to hot broth just before serving", measure: "1–2 min", visual: "Beef turns from red to light brown, just cooked through" },
    ],
  },
  {
    id: "falafel-bowl",
    name: "Falafel Bowl",
    emoji: "🧆",
    color: ["#FBEFCE", "#E8CE84"],
    time: "25 min",
    categories: ["vegan", "vegetarian", "high-fiber", "budget-friendly"],
    cuisine: "middle-eastern",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["canned chickpeas", "flour", "garlic", "cumin"],
    macros: { calories: 380, protein: 14, carbs: 46, fat: 16 },
    flavorBoosts: ["Tahini drizzle", "Pickled turnip", "Fresh parsley"],
    steps: [
      { instruction: "Mash chickpeas with garlic, cumin, and flour into a coarse paste", measure: "N/A", visual: "Mixture holds together when pressed, not wet or crumbly" },
      { instruction: "Shape into small patties and pan-fry", measure: "3–4 min per side", visual: "Deep golden-brown crust on both sides" },
    ],
  },
  {
    id: "tabbouleh",
    name: "Tabbouleh",
    emoji: "🌿",
    color: ["#E9F2DC", "#BFE0A0"],
    time: "15 min",
    categories: ["vegan", "vegetarian", "low-calorie", "quick-easy"],
    cuisine: "middle-eastern",
    mealTime: ["lunch", "snack"],
    equipment: [],
    ingredients: ["bulgur", "parsley", "tomato", "lemon"],
    macros: { calories: 180, protein: 4, carbs: 26, fat: 7 },
    flavorBoosts: ["Extra mint", "A pinch of allspice", "Extra virgin olive oil"],
    steps: [
      { instruction: "Soak bulgur in hot water until tender", measure: "10–15 min", visual: "Grains have softened and absorbed most of the water" },
      { instruction: "Toss with chopped parsley, tomato, and lemon juice", measure: "N/A", visual: "Herbs outweigh the grain visually, bright green throughout" },
    ],
  },
  {
    id: "chicken-shawarma-bowl",
    name: "Chicken Shawarma Bowl",
    emoji: "🌯",
    color: ["#FFE6D0", "#F3AD7A"],
    time: "25 min",
    categories: ["high-protein", "healthy-balanced"],
    cuisine: "middle-eastern",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["chicken thighs", "yogurt", "garlic", "spices"],
    macros: { calories: 400, protein: 34, carbs: 20, fat: 20 },
    flavorBoosts: ["Garlic yogurt sauce", "Pickled onions", "Extra lemon"],
    steps: [
      { instruction: "Marinate chicken in yogurt, garlic, and spices", measure: "10 min if time allows", visual: "Chicken is fully coated, no dry patches" },
      { instruction: "Sear until charred in spots and cooked through", measure: "10–12 min", visual: "Deep brown edges, juices run clear" },
    ],
  },
  {
    id: "misir-wot",
    name: "Misir Wot (Red Lentil Stew)",
    emoji: "🍛",
    color: ["#F7E1CB", "#E9AE6E"],
    time: "30 min",
    categories: ["vegan", "vegetarian", "high-fiber", "budget-friendly", "meal-prep"],
    cuisine: "ethiopian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["red lentils", "berbere spice", "onion", "garlic"],
    macros: { calories: 300, protein: 17, carbs: 46, fat: 6 },
    flavorBoosts: ["Extra berbere for heat", "A squeeze of lemon", "Fresh cilantro"],
    steps: [
      { instruction: "Cook onion over low-medium heat, stirring often, with little to no oil", measure: "15–20 min", visual: "Onion has broken down into a soft, jammy paste — don't rush this part, it's where the flavor comes from" },
      { instruction: "Stir in garlic and berbere spice, cook briefly", measure: "1–2 min", visual: "Fragrant, spice coats the onion paste evenly" },
      { instruction: "Add lentils and water, cover and simmer, stirring every few minutes", measure: "18–20 min", visual: "Lentils have broken down into a thick, spoonable stew — soft but not a solid mush" },
    ],
  },
  {
    id: "spanish-tortilla",
    name: "Spanish Tortilla",
    emoji: "🍳",
    color: ["#FDEEC5", "#F0CE73"],
    time: "30 min",
    categories: ["vegetarian", "budget-friendly", "beginner-friendly"],
    cuisine: "spanish",
    mealTime: ["breakfast", "lunch"],
    equipment: ["stove", "pan"],
    ingredients: ["potato", "eggs", "onion"],
    macros: { calories: 320, protein: 13, carbs: 26, fat: 18 },
    flavorBoosts: ["A side of aioli", "Smoked paprika dusting", "Fresh chives"],
    steps: [
      { instruction: "Cook thinly sliced potato and onion in oil until soft", measure: "12–15 min over low heat", visual: "Potatoes are tender enough to break with a spoon, not browned" },
      { instruction: "Mix into beaten eggs and cook in the pan, flipping once", measure: "4–5 min per side", visual: "Set on the outside, still a little soft in the center" },
    ],
  },
  {
    id: "garlic-shrimp",
    name: "Garlic Shrimp",
    emoji: "🍤",
    color: ["#FFE9DD", "#F5B39F"],
    time: "12 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "spanish",
    mealTime: ["dinner", "snack"],
    equipment: ["stove", "pan"],
    ingredients: ["shrimp", "garlic", "olive oil", "chili flakes"],
    macros: { calories: 260, protein: 24, carbs: 4, fat: 16 },
    flavorBoosts: ["Crusty bread for the oil", "Extra lemon", "Fresh parsley"],
    steps: [
      { instruction: "Warm garlic and chili flakes gently in olive oil", measure: "1–2 min", visual: "Garlic turns light golden, oil is fragrant" },
      { instruction: "Add shrimp and cook until just pink", measure: "2–3 min per side", visual: "Shrimp curl into a loose C-shape, opaque throughout" },
    ],
  },
  {
    id: "brazilian-black-bean-stew",
    name: "Brazilian Black Bean Stew",
    emoji: "🍲",
    color: ["#EFE3D4", "#D3B384"],
    time: "30 min",
    categories: ["high-protein", "high-fiber", "budget-friendly", "meal-prep"],
    cuisine: "brazilian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["canned black beans", "sausage", "onion", "garlic"],
    macros: { calories: 380, protein: 22, carbs: 38, fat: 16 },
    flavorBoosts: ["Orange slices on the side", "Fresh cilantro", "Hot sauce"],
    steps: [
      { instruction: "Brown sliced sausage with onion and garlic", measure: "6–7 min", visual: "Sausage has good color on the cut edges" },
      { instruction: "Add beans and simmer until thickened", measure: "15 min", visual: "Stew coats the back of a spoon, not watery" },
    ],
  },
  {
    id: "turkey-chili",
    name: "Turkey Chili",
    emoji: "🌶️",
    color: ["#FBE1D8", "#EF9F87"],
    time: "35 min",
    categories: ["high-protein", "meal-prep", "budget-friendly"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["ground turkey", "canned tomatoes", "canned kidney beans", "onion"],
    macros: { calories: 360, protein: 30, carbs: 30, fat: 12 },
    flavorBoosts: ["Shredded cheese", "Sliced avocado", "A dollop of sour cream"],
    steps: [
      { instruction: "Brown ground turkey with onion", measure: "6–7 min", visual: "No pink remaining, lightly browned" },
      { instruction: "Add tomatoes, beans, and chili seasoning, simmer", measure: "20 min", visual: "Chili has thickened and darkened in color" },
    ],
  },
  {
    id: "baked-sweet-potato",
    name: "Baked Sweet Potato",
    emoji: "🍠",
    color: ["#FCE4CC", "#EFA85F"],
    time: "45 min",
    categories: ["vegan", "vegetarian", "high-fiber", "budget-friendly", "beginner-friendly"],
    cuisine: "american",
    mealTime: ["dinner", "snack"],
    equipment: ["oven"],
    ingredients: ["sweet potato", "butter", "cinnamon"],
    macros: { calories: 220, protein: 4, carbs: 46, fat: 4 },
    flavorBoosts: ["Toasted pecans", "A drizzle of maple syrup", "A pinch of nutmeg"],
    steps: [
      { instruction: "Pierce sweet potato a few times with a fork", measure: "N/A", visual: "Skin has several small punctures" },
      { instruction: "Bake until fully tender", measure: "40–45 min at 400°F", visual: "A fork slides in with no resistance" },
    ],
  },
  {
    id: "chicken-caesar-wrap",
    name: "Chicken Caesar Wrap",
    emoji: "🌯",
    color: ["#EFF4DD", "#C7DDA0"],
    time: "10 min",
    categories: ["high-protein", "quick-easy"],
    cuisine: "american",
    mealTime: ["lunch"],
    equipment: [],
    ingredients: ["chicken breast", "romaine", "caesar dressing", "tortilla"],
    macros: { calories: 420, protein: 28, carbs: 34, fat: 20 },
    flavorBoosts: ["Shaved parmesan", "Cracked black pepper", "Crumbled croutons"],
    steps: [
      { instruction: "Toss sliced cooked chicken and romaine with dressing", measure: "N/A", visual: "Leaves are evenly coated, not dry or soggy" },
      { instruction: "Fill tortilla and roll tightly", measure: "N/A", visual: "Wrap holds together without splitting" },
    ],
  },
  {
    id: "veggie-omelette",
    name: "Veggie Omelette",
    emoji: "🍳",
    color: ["#FFEFC0", "#F3CD6C"],
    time: "10 min",
    categories: ["vegetarian", "high-protein", "low-carb", "quick-easy"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["stove", "pan"],
    ingredients: ["eggs", "bell pepper", "onion", "cheese"],
    macros: { calories: 280, protein: 20, carbs: 6, fat: 20 },
    flavorBoosts: ["Fresh herbs", "Hot sauce", "Extra cheese"],
    steps: [
      { instruction: "Sauté bell pepper and onion until soft", measure: "3–4 min", visual: "Vegetables are tender, not raw-crunchy" },
      { instruction: "Pour in beaten eggs, add cheese, fold when set", measure: "3–4 min", visual: "Eggs are just set with no runny top" },
    ],
  },
  {
    id: "pb-banana-smoothie",
    name: "Peanut Butter Banana Smoothie",
    emoji: "🍌",
    color: ["#FBF0CE", "#EFCF7C"],
    time: "5 min",
    categories: ["vegetarian", "high-protein", "quick-easy"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: [],
    ingredients: ["peanut butter", "banana", "milk", "honey"],
    macros: { calories: 320, protein: 12, carbs: 42, fat: 12 },
    flavorBoosts: ["A scoop of oats for thickness", "Cinnamon", "A handful of ice"],
    steps: [
      { instruction: "Blend banana, peanut butter, milk, and honey until smooth", measure: "30–60 sec", visual: "No lumps of banana or peanut butter remain" },
    ],
  },
  {
    id: "baked-chicken-thighs",
    name: "Baked Chicken Thighs",
    emoji: "🍗",
    color: ["#FFE3C7", "#F5B073"],
    time: "35 min",
    categories: ["high-protein", "low-carb", "budget-friendly"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["oven"],
    ingredients: ["chicken thighs", "olive oil", "garlic powder", "paprika"],
    macros: { calories: 360, protein: 32, carbs: 2, fat: 24 },
    flavorBoosts: ["Lemon wedges", "Fresh rosemary", "A drizzle of hot honey"],
    steps: [
      { instruction: "Rub chicken thighs with oil and seasoning", measure: "N/A", visual: "Skin is evenly coated, no bare patches" },
      { instruction: "Bake until skin is crisp and juices run clear", measure: "30–35 min at 425°F", visual: "Skin is deep golden-brown and crackly" },
    ],
  },
  {
    id: "veggie-quesadilla",
    name: "Vegetable Quesadilla",
    emoji: "🧀",
    color: ["#FFEACB", "#F3C077"],
    time: "12 min",
    categories: ["vegetarian", "quick-easy", "budget-friendly"],
    cuisine: "mexican",
    mealTime: ["lunch", "snack"],
    equipment: ["stove", "pan"],
    ingredients: ["tortilla", "cheese", "bell pepper", "onion"],
    macros: { calories: 340, protein: 13, carbs: 34, fat: 17 },
    flavorBoosts: ["Salsa verde", "Sliced avocado", "Sour cream"],
    steps: [
      { instruction: "Sauté bell pepper and onion until softened", measure: "4 min", visual: "Vegetables are tender with light browning" },
      { instruction: "Layer with cheese in a tortilla and cook until golden", measure: "2–3 min per side", visual: "Cheese is fully melted, tortilla has golden-brown spots" },
    ],
  },
  {
    id: "shrimp-tacos",
    name: "Shrimp Tacos",
    emoji: "🌮",
    color: ["#FFE4D4", "#F5AE8E"],
    time: "15 min",
    categories: ["high-protein", "quick-easy", "low-carb"],
    cuisine: "mexican",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["shrimp", "tortilla", "cabbage", "lime"],
    macros: { calories: 320, protein: 22, carbs: 32, fat: 11 },
    flavorBoosts: ["Chipotle crema", "Fresh cilantro", "Pickled red onion"],
    steps: [
      { instruction: "Season shrimp and cook until just opaque", measure: "2–3 min per side", visual: "Shrimp are pink throughout, no gray translucent spots" },
      { instruction: "Fill warm tortillas with shrimp, cabbage, and a squeeze of lime", measure: "N/A", visual: "Cabbage stays crisp and bright, not wilted" },
    ],
  },
  {
    id: "beef-and-broccoli",
    name: "Beef and Broccoli",
    emoji: "🥦",
    color: ["#E9F3DD", "#BADFA0"],
    time: "20 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "chinese",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["beef strips", "broccoli", "soy sauce", "garlic"],
    macros: { calories: 360, protein: 30, carbs: 14, fat: 20 },
    flavorBoosts: ["Sesame oil finish", "Extra garlic", "Toasted sesame seeds"],
    steps: [
      { instruction: "Sear beef strips in a hot pan until browned", measure: "2–3 min", visual: "Deep brown crust, still slightly pink inside" },
      { instruction: "Add broccoli and garlic, stir fry", measure: "3–4 min", visual: "Broccoli turns bright green, still crisp" },
      { instruction: "Add soy sauce and toss to coat", measure: "1 min", visual: "Sauce clings evenly to everything" },
    ],
  },
  {
    id: "caprese-pasta-salad",
    name: "Caprese Pasta Salad",
    emoji: "🍝",
    color: ["#FDE6DC", "#F3AC98"],
    time: "20 min",
    categories: ["vegetarian", "meal-prep", "quick-easy"],
    cuisine: "italian",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["pasta", "cherry tomatoes", "mozzarella", "basil"],
    macros: { calories: 420, protein: 16, carbs: 52, fat: 16 },
    flavorBoosts: ["Balsamic glaze", "Extra basil", "Cracked black pepper"],
    steps: [
      { instruction: "Cook pasta until tender, then cool slightly", measure: "8–9 min", visual: "Tender with a slight bite, not mushy" },
      { instruction: "Toss with halved cherry tomatoes, mozzarella, and basil", measure: "N/A", visual: "Ingredients are evenly distributed, not clumped" },
    ],
  },
  {
    id: "butternut-squash-soup",
    name: "Butternut Squash Soup",
    emoji: "🎃",
    color: ["#FCE7C0", "#F0B85E"],
    time: "35 min",
    categories: ["vegan", "vegetarian", "healthy-balanced", "meal-prep"],
    cuisine: "american",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["butternut squash", "onion", "vegetable broth", "garlic"],
    macros: { calories: 190, protein: 4, carbs: 36, fat: 4 },
    flavorBoosts: ["A swirl of coconut milk", "Toasted pumpkin seeds", "A pinch of nutmeg"],
    steps: [
      { instruction: "Sauté onion and garlic until soft", measure: "4–5 min", visual: "Onion is translucent, not browned" },
      { instruction: "Add squash and broth, simmer until tender", measure: "20 min", visual: "Squash breaks apart easily with a spoon" },
      { instruction: "Blend until smooth", measure: "1–2 min", visual: "No visible chunks, silky consistency" },
    ],
  },
  {
    id: "sausage-and-peppers",
    name: "Sausage and Peppers",
    emoji: "🌭",
    color: ["#FCE0D2", "#EFA184"],
    time: "20 min",
    categories: ["high-protein", "quick-easy", "low-carb"],
    cuisine: "italian",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["sausage", "bell pepper", "onion", "garlic"],
    macros: { calories: 380, protein: 20, carbs: 12, fat: 28 },
    flavorBoosts: ["A squeeze of lemon", "Crusty bread on the side", "Extra garlic"],
    steps: [
      { instruction: "Brown sausage in a pan, then set aside", measure: "6–7 min", visual: "Deep golden-brown on all sides" },
      { instruction: "Sauté peppers and onion in the same pan", measure: "6–7 min", visual: "Softened with light charring at the edges" },
      { instruction: "Return sausage to the pan and toss together", measure: "1–2 min", visual: "Everything is evenly mixed and heated through" },
    ],
  },
  {
    id: "baked-ziti",
    name: "Baked Ziti",
    emoji: "🍝",
    color: ["#FBE7D8", "#EFAF86"],
    time: "40 min",
    categories: ["vegetarian", "high-carb", "meal-prep", "beginner-friendly"],
    cuisine: "italian",
    mealTime: ["dinner"],
    equipment: ["oven", "pot"],
    ingredients: ["pasta", "marinara sauce", "mozzarella", "ricotta"],
    macros: { calories: 520, protein: 24, carbs: 56, fat: 22 },
    flavorBoosts: ["Fresh basil on top", "Red pepper flakes", "Extra parmesan"],
    steps: [
      { instruction: "Cook pasta until just underdone", measure: "7 min", visual: "Firmer than usual — it'll finish cooking in the oven" },
      { instruction: "Mix pasta with marinara and ricotta, top with mozzarella", measure: "N/A", visual: "Mozzarella covers the surface evenly" },
      { instruction: "Bake until bubbling and golden on top", measure: "20 min at 400°F", visual: "Cheese is fully melted with golden-brown spots" },
    ],
  },
  {
    id: "chickpea-salad-sandwich",
    name: "Chickpea Salad Sandwich",
    emoji: "🥪",
    color: ["#F3F0DE", "#D9CE9E"],
    time: "10 min",
    categories: ["vegan", "vegetarian", "quick-easy", "budget-friendly"],
    cuisine: "american",
    mealTime: ["lunch"],
    equipment: [],
    ingredients: ["canned chickpeas", "mayo", "celery", "bread"],
    macros: { calories: 360, protein: 13, carbs: 46, fat: 14 },
    flavorBoosts: ["A squeeze of lemon", "Diced pickles", "Fresh dill"],
    steps: [
      { instruction: "Mash chickpeas with mayo and diced celery", measure: "N/A", visual: "Mostly mashed with some texture left, holds together when scooped" },
      { instruction: "Spread onto bread", measure: "N/A", visual: "Mixture reaches every edge" },
    ],
  },
  {
    id: "salmon-asparagus-sheet-pan",
    name: "Salmon and Asparagus Sheet Pan",
    emoji: "🐟",
    color: ["#E8F1DC", "#BEDBA0"],
    time: "25 min",
    categories: ["high-protein", "low-carb", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["oven"],
    ingredients: ["salmon fillet", "asparagus", "olive oil", "lemon"],
    macros: { calories: 380, protein: 33, carbs: 8, fat: 24 },
    flavorBoosts: ["Fresh dill", "Extra lemon zest", "A pat of garlic butter"],
    steps: [
      { instruction: "Arrange salmon and asparagus on a sheet pan with oil and lemon", measure: "N/A", visual: "Everything is in a single layer, not overlapping" },
      { instruction: "Roast until salmon flakes easily", measure: "12–15 min at 400°F", visual: "Salmon flakes with a fork, asparagus is bright green and tender" },
    ],
  },
  {
    id: "chia-pudding",
    name: "Chia Pudding",
    emoji: "🍮",
    color: ["#F0E9D8", "#D6C79E"],
    time: "5 min + overnight",
    categories: ["vegan", "vegetarian", "high-fiber", "meal-prep", "quick-easy"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: ["fridge"],
    ingredients: ["chia seeds", "milk", "honey", "vanilla"],
    macros: { calories: 230, protein: 7, carbs: 26, fat: 11 },
    flavorBoosts: ["Fresh berries", "A swirl of nut butter", "Toasted coconut"],
    steps: [
      { instruction: "Whisk chia seeds into milk with honey and vanilla", measure: "3 tbsp chia + 1 cup milk", visual: "Seeds are evenly distributed, not clumped at the bottom" },
      { instruction: "Refrigerate until thickened", measure: "Overnight, or at least 4 hrs", visual: "Mixture has a pudding-like, spoonable texture" },
    ],
  },
  {
    id: "air-fryer-chicken-wings",
    name: "Air Fryer Chicken Wings",
    emoji: "🍗",
    color: ["#FFE3C7", "#F5B073"],
    time: "25 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["chicken wings", "baking powder", "garlic powder", "paprika"],
    macros: { calories: 380, protein: 32, carbs: 2, fat: 27 },
    flavorBoosts: ["Buffalo sauce toss", "Ranch for dipping", "Fresh chopped chives"],
    steps: [
      { instruction: "Pat wings completely dry, then toss with baking powder and spices", measure: "1 lb wings + 1 tbsp baking powder", visual: "Wings are evenly coated, no wet spots" },
      { instruction: "Air fry in a single layer, flipping halfway", measure: "380°F (193°C), 22-24 min total", visual: "Skin is deep golden-brown and audibly crispy" },
    ],
  },
  {
    id: "air-fryer-chicken-breast",
    name: "Air Fryer Chicken Breast",
    emoji: "🍗",
    color: ["#FFE8D2", "#F7C094"],
    time: "20 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["chicken breast", "olive oil", "garlic powder", "paprika"],
    macros: { calories: 280, protein: 42, carbs: 1, fat: 11 },
    flavorBoosts: ["Lemon squeeze before serving", "Fresh herbs on top", "A pat of garlic butter"],
    steps: [
      { instruction: "Rub chicken breast with oil and spices on both sides", measure: "1 tbsp oil per breast", visual: "Seasoning is evenly distributed, no bare patches" },
      { instruction: "Air fry, flipping halfway through", measure: "380°F (193°C), 16-18 min total", visual: "Internal temp reaches 165°F, juices run clear" },
    ],
  },
  {
    id: "air-fryer-chicken-thighs",
    name: "Air Fryer Chicken Thighs",
    emoji: "🍗",
    color: ["#FFE0C7", "#F5A65E"],
    time: "25 min",
    categories: ["high-protein", "budget-friendly"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["chicken thighs", "olive oil", "garlic powder", "paprika"],
    macros: { calories: 350, protein: 28, carbs: 1, fat: 25 },
    flavorBoosts: ["Hot honey drizzle", "Fresh cracked pepper", "Squeeze of lime"],
    steps: [
      { instruction: "Season chicken thighs skin-side up with oil and spices", measure: "1 tbsp oil total", visual: "Skin is glossy and evenly seasoned" },
      { instruction: "Air fry skin-side up until crisp and cooked through", measure: "380°F (193°C), 20-22 min", visual: "Skin is deep golden and crackly, juices run clear" },
    ],
  },
  {
    id: "air-fryer-tofu",
    name: "Crispy Air Fryer Tofu",
    emoji: "🧊",
    color: ["#E9F3DE", "#BEE0A4"],
    time: "25 min",
    categories: ["vegan", "vegetarian", "high-protein"],
    cuisine: "asian",
    mealTime: ["dinner", "lunch"],
    equipment: ["air-fryer"],
    ingredients: ["tofu", "cornstarch", "soy sauce", "sesame oil"],
    macros: { calories: 210, protein: 15, carbs: 10, fat: 13 },
    flavorBoosts: ["Sesame seed sprinkle", "Chili crisp drizzle", "Sliced scallions"],
    steps: [
      { instruction: "Press tofu to remove excess water, then cube it", measure: "15 min pressing, then 1-inch cubes", visual: "Tofu feels firm and dry to the touch" },
      { instruction: "Toss cubes with cornstarch, soy sauce, and sesame oil", measure: "2 tbsp cornstarch", visual: "Cubes are lightly and evenly coated, not clumped" },
      { instruction: "Air fry, shaking basket halfway", measure: "390°F (199°C), 15 min", visual: "Edges are golden-brown and crisp all over" },
    ],
  },
  {
    id: "air-fryer-salmon",
    name: "Air Fryer Salmon",
    emoji: "🐟",
    color: ["#FFE3D2", "#F2A98A"],
    time: "15 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["salmon fillet", "olive oil", "lemon", "garlic powder"],
    macros: { calories: 340, protein: 34, carbs: 1, fat: 21 },
    flavorBoosts: ["Fresh dill", "Extra lemon zest", "Garlic butter drizzle"],
    steps: [
      { instruction: "Rub salmon with oil, garlic powder, and a squeeze of lemon", measure: "1 tsp oil per fillet", visual: "Surface is glossy and evenly coated" },
      { instruction: "Air fry skin-side down until just cooked through", measure: "380°F (193°C), 8-10 min", visual: "Flakes easily with a fork, still moist inside" },
    ],
  },
  {
    id: "air-fryer-shrimp",
    name: "Air Fryer Shrimp",
    emoji: "🍤",
    color: ["#FFE9DD", "#F5B39F"],
    time: "12 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["shrimp", "olive oil", "garlic powder", "paprika"],
    macros: { calories: 180, protein: 24, carbs: 2, fat: 8 },
    flavorBoosts: ["Squeeze of lime", "Cocktail sauce", "Chili flakes"],
    steps: [
      { instruction: "Toss shrimp with oil and spices", measure: "1 tbsp oil per lb", visual: "Shrimp are evenly coated, glossy" },
      { instruction: "Air fry in a single layer, shaking basket halfway", measure: "400°F (204°C), 6-7 min", visual: "Shrimp are pink and curled into a loose C-shape" },
    ],
  },
  {
    id: "air-fryer-pork-chops",
    name: "Air Fryer Pork Chops",
    emoji: "🥩",
    color: ["#FBE0D8", "#EF9E86"],
    time: "18 min",
    categories: ["high-protein"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["pork chops", "olive oil", "garlic powder", "paprika"],
    macros: { calories: 320, protein: 30, carbs: 1, fat: 21 },
    flavorBoosts: ["Apple sauce on the side", "Fresh rosemary", "Dijon mustard glaze"],
    steps: [
      { instruction: "Rub pork chops with oil and spices on both sides", measure: "1 tbsp oil total", visual: "Seasoning coats the surface evenly" },
      { instruction: "Air fry, flipping halfway", measure: "380°F (193°C), 12-14 min", visual: "Internal temp reaches 145°F, juices run clear" },
    ],
  },
  {
    id: "air-fryer-steak-bites",
    name: "Air Fryer Steak Bites",
    emoji: "🥩",
    color: ["#FDE7E0", "#F7C3B4"],
    time: "15 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["steak", "olive oil", "garlic powder", "butter"],
    macros: { calories: 310, protein: 28, carbs: 1, fat: 21 },
    flavorBoosts: ["Garlic herb butter melt", "Fresh parsley", "Cracked black pepper"],
    steps: [
      { instruction: "Cut steak into bite-size cubes, toss with oil and spices", measure: "1-inch cubes", visual: "Cubes are uniform in size for even cooking" },
      { instruction: "Air fry, shaking basket halfway", measure: "400°F (204°C), 8-9 min for medium", visual: "Deep brown crust on the outside" },
    ],
  },
  {
    id: "air-fryer-turkey-meatballs",
    name: "Air Fryer Turkey Meatballs",
    emoji: "🍡",
    color: ["#FBE7D3", "#F0B27E"],
    time: "20 min",
    categories: ["high-protein", "meal-prep"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["ground turkey", "breadcrumbs", "egg", "garlic powder"],
    macros: { calories: 220, protein: 24, carbs: 8, fat: 10 },
    flavorBoosts: ["Marinara for dipping", "Fresh basil", "Grated parmesan"],
    steps: [
      { instruction: "Mix ground turkey, breadcrumbs, egg, and seasoning, form into balls", measure: "1.5-inch balls", visual: "Mixture holds together without being sticky" },
      { instruction: "Air fry, shaking basket halfway", measure: "380°F (193°C), 12 min", visual: "Golden-brown outside, no pink inside" },
    ],
  },
  {
    id: "air-fryer-broccoli",
    name: "Air Fryer Broccoli",
    emoji: "🥦",
    color: ["#E9F3DD", "#BADFA0"],
    time: "12 min",
    categories: ["vegan", "vegetarian", "low-calorie", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner", "lunch"],
    equipment: ["air-fryer"],
    ingredients: ["broccoli", "olive oil", "garlic powder"],
    macros: { calories: 90, protein: 4, carbs: 9, fat: 6 },
    flavorBoosts: ["Parmesan sprinkle", "Lemon zest", "Chili flakes"],
    steps: [
      { instruction: "Toss broccoli florets with oil and garlic powder", measure: "1 tbsp oil per head", visual: "Florets are lightly coated, not soggy" },
      { instruction: "Air fry, shaking basket halfway", measure: "380°F (193°C), 8-9 min", visual: "Edges are crispy and browned, stems still tender" },
    ],
  },
  {
    id: "air-fryer-brussels-sprouts",
    name: "Air Fryer Brussels Sprouts",
    emoji: "🥬",
    color: ["#E7F2DD", "#C3E0AE"],
    time: "18 min",
    categories: ["vegan", "vegetarian", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["brussels sprouts", "olive oil", "salt", "pepper"],
    macros: { calories: 110, protein: 4, carbs: 12, fat: 7 },
    flavorBoosts: ["Balsamic glaze drizzle", "Toasted pecans", "Maple syrup finish"],
    steps: [
      { instruction: "Halve brussels sprouts and toss with oil", measure: "1 tbsp oil per lb", visual: "Cut sides are lightly coated" },
      { instruction: "Air fry cut-side down, shaking halfway", measure: "380°F (193°C), 14-16 min", visual: "Outer leaves are crispy and deep brown" },
    ],
  },
  {
    id: "air-fryer-sweet-potato-fries",
    name: "Air Fryer Sweet Potato Fries",
    emoji: "🍠",
    color: ["#FCE4CC", "#EFA85F"],
    time: "20 min",
    categories: ["vegan", "vegetarian", "budget-friendly"],
    cuisine: "american",
    mealTime: ["snack", "lunch"],
    equipment: ["air-fryer"],
    ingredients: ["sweet potato", "olive oil", "paprika", "salt"],
    macros: { calories: 180, protein: 3, carbs: 30, fat: 7 },
    flavorBoosts: ["Garlic aioli", "Chili lime seasoning", "Fresh cilantro"],
    steps: [
      { instruction: "Cut sweet potato into even matchsticks, toss with oil", measure: "1/4-inch sticks", visual: "Sticks are uniform for even cooking" },
      { instruction: "Air fry in a single layer, shaking halfway", measure: "380°F (193°C), 15-18 min", visual: "Edges are crispy, centers are tender" },
    ],
  },
  {
    id: "air-fryer-fries",
    name: "Air Fryer French Fries",
    emoji: "🍟",
    color: ["#FFEBB0", "#F4C34F"],
    time: "25 min",
    categories: ["vegan", "vegetarian", "budget-friendly"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["potato", "olive oil", "salt"],
    macros: { calories: 220, protein: 3, carbs: 35, fat: 8 },
    flavorBoosts: ["Malt vinegar", "Garlic parmesan toss", "Smoked paprika"],
    steps: [
      { instruction: "Cut potatoes into fries, soak in cold water", measure: "20 min soak", visual: "Water turns cloudy from released starch" },
      { instruction: "Pat dry, toss with oil, air fry shaking often", measure: "380°F (193°C), 18-20 min", visual: "Fries are golden and crisp on the outside" },
    ],
  },
  {
    id: "air-fryer-zucchini-chips",
    name: "Air Fryer Zucchini Chips",
    emoji: "🥬",
    color: ["#EAF3DC", "#C9E2AE"],
    time: "18 min",
    categories: ["vegan", "vegetarian", "low-calorie"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["zucchini", "olive oil", "breadcrumbs", "garlic powder"],
    macros: { calories: 120, protein: 4, carbs: 14, fat: 6 },
    flavorBoosts: ["Marinara for dipping", "Parmesan dust", "Fresh basil"],
    steps: [
      { instruction: "Slice zucchini into thin rounds, toss with oil then breadcrumbs", measure: "1/4-inch rounds", visual: "Rounds are evenly coated in crumbs" },
      { instruction: "Air fry in a single layer, flipping halfway", measure: "380°F (193°C), 10-12 min", visual: "Crumbs are golden and crisp" },
    ],
  },
  {
    id: "air-fryer-cauliflower-bites",
    name: "Air Fryer Cauliflower Bites",
    emoji: "🥗",
    color: ["#F3F0DE", "#D9CE9E"],
    time: "20 min",
    categories: ["vegan", "vegetarian", "low-carb"],
    cuisine: "american",
    mealTime: ["dinner", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["cauliflower", "olive oil", "garlic powder", "paprika"],
    macros: { calories: 100, protein: 4, carbs: 12, fat: 5 },
    flavorBoosts: ["Buffalo sauce toss", "Ranch dip", "Fresh chives"],
    steps: [
      { instruction: "Cut cauliflower into bite-size florets, toss with oil and spices", measure: "1 tbsp oil per head", visual: "Florets are lightly and evenly coated" },
      { instruction: "Air fry, shaking basket halfway", measure: "380°F (193°C), 12-14 min", visual: "Edges are golden-brown and crisp" },
    ],
  },
  {
    id: "air-fryer-asparagus",
    name: "Air Fryer Asparagus",
    emoji: "🌱",
    color: ["#E7F2DB", "#B7DD9C"],
    time: "10 min",
    categories: ["vegan", "vegetarian", "low-calorie", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["asparagus", "olive oil", "garlic powder"],
    macros: { calories: 70, protein: 3, carbs: 6, fat: 5 },
    flavorBoosts: ["Lemon zest", "Shaved parmesan", "Cracked pepper"],
    steps: [
      { instruction: "Trim woody ends, toss spears with oil", measure: "1 tbsp oil per bunch", visual: "Spears are lightly glossy, evenly coated" },
      { instruction: "Air fry in a single layer", measure: "380°F (193°C), 6-7 min", visual: "Bright green with lightly charred tips" },
    ],
  },
  {
    id: "air-fryer-green-beans",
    name: "Air Fryer Green Beans",
    emoji: "🫘",
    color: ["#E3F0DD", "#BFE0B0"],
    time: "12 min",
    categories: ["vegan", "vegetarian", "low-calorie"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["green beans", "olive oil", "garlic powder"],
    macros: { calories: 80, protein: 3, carbs: 8, fat: 5 },
    flavorBoosts: ["Toasted almonds", "Lemon squeeze", "Chili flakes"],
    steps: [
      { instruction: "Trim ends, toss green beans with oil", measure: "1 tbsp oil per lb", visual: "Beans are lightly coated, not pooling oil" },
      { instruction: "Air fry, shaking basket halfway", measure: "380°F (193°C), 8-9 min", visual: "Beans are bright green with light char marks" },
    ],
  },
  {
    id: "air-fryer-honey-carrots",
    name: "Air Fryer Honey Carrots",
    emoji: "🥕",
    color: ["#FCE7C0", "#F0B85E"],
    time: "15 min",
    categories: ["vegetarian", "budget-friendly"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["carrot", "olive oil", "honey", "salt"],
    macros: { calories: 110, protein: 1, carbs: 18, fat: 4 },
    flavorBoosts: ["Fresh thyme", "Toasted walnuts", "Orange zest"],
    steps: [
      { instruction: "Cut carrots into sticks, toss with oil and honey", measure: "1 tbsp honey per lb", visual: "Sticks are evenly glazed" },
      { instruction: "Air fry, shaking basket halfway", measure: "380°F (193°C), 10-12 min", visual: "Edges are caramelized and lightly charred" },
    ],
  },
  {
    id: "air-fryer-mozzarella-sticks",
    name: "Air Fryer Mozzarella Sticks",
    emoji: "🧀",
    color: ["#FFEBB0", "#F4C34F"],
    time: "20 min",
    categories: ["vegetarian", "quick-easy"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["mozzarella", "breadcrumbs", "egg", "flour"],
    macros: { calories: 280, protein: 14, carbs: 22, fat: 15 },
    flavorBoosts: ["Marinara for dipping", "Italian seasoning in the crumbs", "Fresh basil"],
    steps: [
      { instruction: "Freeze mozzarella sticks, then coat in flour, egg, then breadcrumbs twice", measure: "30 min freeze first", visual: "Coating is thick and fully covers the cheese" },
      { instruction: "Air fry from frozen until golden", measure: "390°F (199°C), 6-8 min", visual: "Crumbs are deep golden, cheese just starting to peek out" },
    ],
  },
  {
    id: "air-fryer-onion-rings",
    name: "Air Fryer Onion Rings",
    emoji: "🧅",
    color: ["#FBEFD6", "#EFCB86"],
    time: "20 min",
    categories: ["vegetarian", "budget-friendly"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["onion", "flour", "breadcrumbs", "egg"],
    macros: { calories: 210, protein: 6, carbs: 28, fat: 8 },
    flavorBoosts: ["Spicy mayo dip", "Smoked paprika in the crumbs", "Fresh chives"],
    steps: [
      { instruction: "Slice onion into thick rings, coat in flour, egg, then breadcrumbs", measure: "1/2-inch rings", visual: "Coating is even with no bare patches" },
      { instruction: "Air fry in a single layer, flipping halfway", measure: "390°F (199°C), 10-12 min", visual: "Coating is golden-brown and crisp" },
    ],
  },
  {
    id: "air-fryer-chickpeas",
    name: "Crispy Air Fryer Chickpeas",
    emoji: "🫘",
    color: ["#FBE7C6", "#F0C27B"],
    time: "18 min",
    categories: ["vegan", "vegetarian", "high-fiber", "high-protein"],
    cuisine: "mediterranean",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["canned chickpeas", "olive oil", "paprika", "salt"],
    macros: { calories: 150, protein: 7, carbs: 18, fat: 6 },
    flavorBoosts: ["Cumin and lime", "Everything bagel seasoning", "Chili powder"],
    steps: [
      { instruction: "Pat chickpeas very dry, toss with oil and spices", measure: "1 tbsp oil per can", visual: "Chickpeas are lightly coated, not wet" },
      { instruction: "Air fry, shaking basket often", measure: "390°F (199°C), 12-15 min", visual: "Chickpeas are crunchy and deep golden" },
    ],
  },
  {
    id: "air-fryer-kale-chips",
    name: "Air Fryer Kale Chips",
    emoji: "🥬",
    color: ["#E9F3DE", "#BEE0A4"],
    time: "10 min",
    categories: ["vegan", "vegetarian", "low-calorie"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["kale", "olive oil", "salt"],
    macros: { calories: 60, protein: 2, carbs: 6, fat: 4 },
    flavorBoosts: ["Nutritional yeast dust", "Chili flakes", "Garlic powder"],
    steps: [
      { instruction: "Tear kale into pieces, removing thick stems, toss with oil", measure: "1 tbsp oil per bunch", visual: "Leaves are very lightly coated, not soggy" },
      { instruction: "Air fry in a single layer, watching closely", measure: "350°F (177°C), 5-6 min", visual: "Leaves are crisp and shrunken, not burnt" },
    ],
  },
  {
    id: "air-fryer-bacon",
    name: "Air Fryer Bacon",
    emoji: "🥓",
    color: ["#FFE7DC", "#F4AE9A"],
    time: "12 min",
    categories: ["high-protein", "quick-easy"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["air-fryer"],
    ingredients: ["bacon"],
    macros: { calories: 160, protein: 10, carbs: 1, fat: 13 },
    flavorBoosts: ["Cracked black pepper", "Brown sugar glaze", "Maple drizzle"],
    steps: [
      { instruction: "Lay bacon strips in a single layer without overlapping", measure: "N/A", visual: "Strips have space between them" },
      { instruction: "Air fry until crisp", measure: "380°F (193°C), 8-10 min", visual: "Deep golden-brown and firm, not floppy" },
    ],
  },
  {
    id: "air-fryer-hash-browns",
    name: "Air Fryer Hash Browns",
    emoji: "🥔",
    color: ["#FBEFCB", "#E8CD82"],
    time: "18 min",
    categories: ["vegetarian", "budget-friendly"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["air-fryer"],
    ingredients: ["potato", "olive oil", "salt", "pepper"],
    macros: { calories: 170, protein: 2, carbs: 24, fat: 7 },
    flavorBoosts: ["Ketchup on the side", "Hot sauce", "Fresh chives"],
    steps: [
      { instruction: "Grate potato, squeeze out excess water, toss with oil", measure: "Squeeze firmly to remove moisture", visual: "Shreds feel mostly dry" },
      { instruction: "Press into a flat patty and air fry, flipping halfway", measure: "380°F (193°C), 14-16 min", visual: "Both sides are golden-brown and crisp" },
    ],
  },
  {
    id: "air-fryer-eggs",
    name: "Air Fryer \"Hard-Boiled\" Eggs",
    emoji: "🥚",
    color: ["#FFE8B8", "#FFD27A"],
    time: "16 min",
    categories: ["vegetarian", "high-protein", "quick-easy"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["air-fryer"],
    ingredients: ["eggs"],
    macros: { calories: 70, protein: 6, carbs: 0.5, fat: 5 },
    flavorBoosts: ["Everything bagel seasoning", "Flaky salt", "Hot sauce"],
    steps: [
      { instruction: "Place whole eggs directly in the air fryer basket", measure: "N/A", visual: "Eggs sit in a single layer, not stacked" },
      { instruction: "Air fry, then transfer straight to an ice bath", measure: "270°F (132°C), 15 min, then 5 min ice bath", visual: "Shells peel away cleanly once cooled" },
    ],
  },
  {
    id: "air-fryer-french-toast-sticks",
    name: "Air Fryer French Toast Sticks",
    emoji: "🍞",
    color: ["#FFF0C7", "#F5D27A"],
    time: "15 min",
    categories: ["vegetarian"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["air-fryer"],
    ingredients: ["bread", "eggs", "milk", "cinnamon"],
    macros: { calories: 240, protein: 9, carbs: 30, fat: 9 },
    flavorBoosts: ["Maple syrup dip", "Powdered sugar dust", "Fresh berries"],
    steps: [
      { instruction: "Cut bread into sticks, dip in whisked egg, milk, and cinnamon", measure: "2 eggs + 1/4 cup milk", visual: "Sticks are evenly coated, not soggy" },
      { instruction: "Air fry, flipping halfway", measure: "370°F (188°C), 8-10 min", visual: "Golden-brown and firm on the outside" },
    ],
  },
  {
    id: "air-fryer-churros",
    name: "Air Fryer Churros",
    emoji: "🍩",
    color: ["#FDE8DC", "#F3AE93"],
    time: "25 min",
    categories: ["vegetarian", "quick-easy"],
    cuisine: "mexican",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["flour", "butter", "eggs", "sugar"],
    macros: { calories: 210, protein: 4, carbs: 26, fat: 10 },
    flavorBoosts: ["Cinnamon sugar coating", "Chocolate dipping sauce", "Dulce de leche"],
    steps: [
      { instruction: "Bring butter and water to a boil, stir in flour to form a dough, then beat in eggs", measure: "1/2 cup butter", visual: "Dough is smooth and glossy, pulls from the pan" },
      { instruction: "Pipe into strips and air fry until golden", measure: "380°F (193°C), 10-12 min", visual: "Exterior is firm and golden-brown" },
    ],
  },
  {
    id: "air-fryer-apple-chips",
    name: "Air Fryer Apple Chips",
    emoji: "🍎",
    color: ["#FCE7DE", "#F2AC94"],
    time: "20 min",
    categories: ["vegan", "vegetarian", "low-calorie"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["apple", "cinnamon"],
    macros: { calories: 80, protein: 0.5, carbs: 21, fat: 0.3 },
    flavorBoosts: ["Extra cinnamon dust", "Drizzle of honey", "Nut butter for dipping"],
    steps: [
      { instruction: "Slice apples very thin, dust with cinnamon", measure: "1/8-inch slices", visual: "Slices are uniformly thin and translucent at the edges" },
      { instruction: "Air fry in a single layer, flipping halfway", measure: "330°F (166°C), 12-15 min", visual: "Edges are dry and slightly curled, not browned too dark" },
    ],
  },
  {
    id: "air-fryer-plantains",
    name: "Air Fryer Sweet Plantains",
    emoji: "🍌",
    color: ["#FFD9C7", "#F4A97E"],
    time: "15 min",
    categories: ["vegan", "vegetarian", "budget-friendly"],
    cuisine: "caribbean",
    mealTime: ["dinner", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["plantain", "olive oil"],
    macros: { calories: 180, protein: 1, carbs: 39, fat: 3 },
    flavorBoosts: ["Cinnamon dust", "Squeeze of lime", "Drizzle of honey"],
    steps: [
      { instruction: "Slice very ripe plantains diagonally, brush with oil", measure: "1/2-inch slices", visual: "Plantains are yellow-black and soft to the touch" },
      { instruction: "Air fry, flipping halfway", measure: "370°F (188°C), 10-12 min", visual: "Edges are caramelized and deep golden" },
    ],
  },
  {
    id: "air-fryer-samosas",
    name: "Air Fryer Samosas",
    emoji: "🥟",
    color: ["#FBE4CE", "#EFAE6E"],
    time: "30 min",
    categories: ["vegetarian"],
    cuisine: "indian",
    mealTime: ["snack", "lunch"],
    equipment: ["air-fryer"],
    ingredients: ["potato", "peas", "curry powder", "flour"],
    macros: { calories: 220, protein: 5, carbs: 32, fat: 8 },
    flavorBoosts: ["Mint chutney", "Tamarind sauce", "Extra chili"],
    steps: [
      { instruction: "Mash cooked potato with peas and curry powder for the filling", measure: "2 cups mashed potato", visual: "Filling holds together, well seasoned" },
      { instruction: "Fold filling into pastry triangles, brush with oil", measure: "N/A", visual: "Edges are sealed, no filling leaking" },
      { instruction: "Air fry, flipping halfway", measure: "380°F (193°C), 12-14 min", visual: "Pastry is golden-brown and flaky" },
    ],
  },
  {
    id: "air-fryer-spring-rolls",
    name: "Air Fryer Spring Rolls",
    emoji: "🥢",
    color: ["#E9F3DE", "#BEE0A4"],
    time: "20 min",
    categories: ["vegetarian", "quick-easy"],
    cuisine: "asian",
    mealTime: ["snack", "lunch"],
    equipment: ["air-fryer"],
    ingredients: ["spring roll wrappers", "mixed vegetables", "soy sauce"],
    macros: { calories: 160, protein: 4, carbs: 24, fat: 5 },
    flavorBoosts: ["Sweet chili dipping sauce", "Fresh herbs", "Extra sesame oil"],
    steps: [
      { instruction: "Stir fry vegetables until just tender, cool slightly", measure: "4-5 min", visual: "Vegetables are softened but not mushy" },
      { instruction: "Roll filling tightly in wrappers, brush with oil", measure: "N/A", visual: "Rolls are tight with no gaps" },
      { instruction: "Air fry, flipping halfway", measure: "370°F (188°C), 10-12 min", visual: "Wrappers are golden and crisp all over" },
    ],
  },
  {
    id: "air-fryer-karaage",
    name: "Air Fryer Chicken Karaage",
    emoji: "🍗",
    color: ["#FDE3DC", "#F5A895"],
    time: "30 min",
    categories: ["high-protein"],
    cuisine: "japanese",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["chicken thighs", "soy sauce", "garlic", "cornstarch"],
    macros: { calories: 320, protein: 27, carbs: 14, fat: 17 },
    flavorBoosts: ["Kewpie mayo drizzle", "Lemon wedge", "Shichimi togarashi"],
    steps: [
      { instruction: "Marinate bite-size chicken pieces in soy sauce and garlic", measure: "20 min minimum", visual: "Chicken has absorbed the marinade, slightly darker" },
      { instruction: "Toss marinated chicken in cornstarch, shaking off excess", measure: "N/A", visual: "Light, even coating with no thick clumps" },
      { instruction: "Air fry, shaking basket halfway", measure: "390°F (199°C), 12-14 min", visual: "Coating is crisp and golden-brown" },
    ],
  },
  {
    id: "air-fryer-falafel",
    name: "Air Fryer Falafel",
    emoji: "🧆",
    color: ["#FBEFCE", "#E8CE84"],
    time: "25 min",
    categories: ["vegan", "vegetarian", "high-fiber"],
    cuisine: "middle-eastern",
    mealTime: ["lunch", "dinner"],
    equipment: ["air-fryer"],
    ingredients: ["canned chickpeas", "garlic", "cumin", "flour"],
    macros: { calories: 210, protein: 8, carbs: 28, fat: 8 },
    flavorBoosts: ["Tahini drizzle", "Pickled turnip", "Fresh parsley"],
    steps: [
      { instruction: "Pulse chickpeas, garlic, cumin, and flour into a coarse mixture", measure: "N/A", visual: "Mixture holds together when pressed, not wet" },
      { instruction: "Form into small patties, brush with oil", measure: "1.5-inch patties", visual: "Patties hold their shape" },
      { instruction: "Air fry, flipping halfway", measure: "380°F (193°C), 14-16 min", visual: "Deep golden-brown crust on both sides" },
    ],
  },
  {
    id: "air-fryer-arancini",
    name: "Air Fryer Arancini",
    emoji: "🍙",
    color: ["#F4F0E3", "#DCD2AE"],
    time: "30 min",
    categories: ["vegetarian"],
    cuisine: "italian",
    mealTime: ["snack", "lunch"],
    equipment: ["air-fryer"],
    ingredients: ["rice", "mozzarella", "breadcrumbs", "egg"],
    macros: { calories: 260, protein: 9, carbs: 34, fat: 9 },
    flavorBoosts: ["Marinara for dipping", "Fresh basil", "Extra parmesan"],
    steps: [
      { instruction: "Form cooled risotto-style rice around a mozzarella cube into a ball", measure: "Golf-ball size", visual: "Cheese is fully sealed inside" },
      { instruction: "Coat in egg then breadcrumbs", measure: "N/A", visual: "Even, complete coating with no bare rice showing" },
      { instruction: "Air fry, shaking basket halfway", measure: "380°F (193°C), 12-14 min", visual: "Coating is golden-brown and crisp" },
    ],
  },
  {
    id: "air-fryer-empanadas",
    name: "Air Fryer Empanadas",
    emoji: "🥟",
    color: ["#FFE6D2", "#F3AC7C"],
    time: "30 min",
    categories: ["budget-friendly"],
    cuisine: "mexican",
    mealTime: ["lunch", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["ground beef", "onion", "empanada dough", "egg"],
    macros: { calories: 290, protein: 14, carbs: 26, fat: 15 },
    flavorBoosts: ["Salsa verde", "Fresh cilantro", "Hot sauce"],
    steps: [
      { instruction: "Brown ground beef with onion for the filling", measure: "7-8 min", visual: "No pink remaining, onion softened" },
      { instruction: "Fill dough rounds, fold and crimp edges, brush with egg wash", measure: "N/A", visual: "Edges are tightly sealed" },
      { instruction: "Air fry, flipping halfway", measure: "370°F (188°C), 12-14 min", visual: "Dough is golden-brown and flaky" },
    ],
  },
  {
    id: "air-fryer-tandoori-chicken",
    name: "Air Fryer Tandoori Chicken",
    emoji: "🍗",
    color: ["#FFE0C7", "#F5A65E"],
    time: "35 min",
    categories: ["high-protein", "low-carb"],
    cuisine: "indian",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["chicken thighs", "yogurt", "curry powder", "lemon"],
    macros: { calories: 300, protein: 29, carbs: 5, fat: 18 },
    flavorBoosts: ["Mint yogurt sauce", "Fresh cilantro", "Extra lemon"],
    steps: [
      { instruction: "Marinate chicken in yogurt, curry powder, and lemon juice", measure: "20 min minimum, longer is better", visual: "Chicken is fully coated, slightly darker" },
      { instruction: "Air fry, flipping halfway", measure: "380°F (193°C), 18-20 min", visual: "Charred spots on the edges, juices run clear" },
    ],
  },
  {
    id: "air-fryer-jerk-wings",
    name: "Air Fryer Jerk Chicken Wings",
    emoji: "🍗",
    color: ["#FFE0C7", "#F5A65E"],
    time: "25 min",
    categories: ["high-protein"],
    cuisine: "caribbean",
    mealTime: ["dinner", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["chicken wings", "jerk seasoning", "lime"],
    macros: { calories: 370, protein: 31, carbs: 3, fat: 25 },
    flavorBoosts: ["Grilled pineapple", "Extra lime", "Scotch bonnet hot sauce"],
    steps: [
      { instruction: "Toss wings with jerk seasoning and lime juice", measure: "10 min marinate if time allows", visual: "Wings are evenly coated, no bare spots" },
      { instruction: "Air fry, shaking basket halfway", measure: "380°F (193°C), 22-24 min", visual: "Skin is deep golden-brown and crisp" },
    ],
  },
  {
    id: "air-fryer-korean-fried-chicken",
    name: "Air Fryer Korean Fried Chicken",
    emoji: "🍗",
    color: ["#FFE3DE", "#F5A79B"],
    time: "30 min",
    categories: ["high-protein"],
    cuisine: "korean",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["chicken wings", "cornstarch", "soy sauce", "gochujang"],
    macros: { calories: 390, protein: 29, carbs: 18, fat: 23 },
    flavorBoosts: ["Toasted sesame seeds", "Sliced scallions", "Extra gochujang"],
    steps: [
      { instruction: "Toss wings in cornstarch, shaking off excess", measure: "N/A", visual: "Light even coating, no thick clumps" },
      { instruction: "Air fry, shaking basket halfway", measure: "390°F (199°C), 20-22 min", visual: "Coating is crisp and golden" },
      { instruction: "Toss hot wings in soy-gochujang glaze", measure: "2 tbsp gochujang + 1 tbsp soy sauce", visual: "Glaze clings evenly, glossy coating" },
    ],
  },
  {
    id: "air-fryer-fish-tacos",
    name: "Air Fryer Fish Tacos",
    emoji: "🌮",
    color: ["#FFE4D6", "#FCB89A"],
    time: "20 min",
    categories: ["high-protein"],
    cuisine: "mexican",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["cod", "tortilla", "cabbage", "lime"],
    macros: { calories: 320, protein: 24, carbs: 32, fat: 11 },
    flavorBoosts: ["Chipotle crema", "Fresh cilantro", "Pickled red onion"],
    steps: [
      { instruction: "Season cod fillets and air fry until flaky", measure: "380°F (193°C), 10-12 min", visual: "Fish flakes easily with a fork" },
      { instruction: "Fill warm tortillas with fish, cabbage, and lime", measure: "N/A", visual: "Cabbage stays crisp and bright" },
    ],
  },
  {
    id: "air-fryer-shrimp-tempura",
    name: "Air Fryer Shrimp Tempura",
    emoji: "🍤",
    color: ["#FFE9DD", "#F5B39F"],
    time: "20 min",
    categories: ["high-protein"],
    cuisine: "japanese",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["shrimp", "flour", "egg", "breadcrumbs"],
    macros: { calories: 260, protein: 22, carbs: 22, fat: 9 },
    flavorBoosts: ["Tempura dipping sauce", "Grated daikon", "Extra lemon"],
    steps: [
      { instruction: "Dip shrimp in flour, then egg, then breadcrumbs", measure: "N/A", visual: "Coating is even, tails left exposed" },
      { instruction: "Air fry in a single layer, flipping halfway", measure: "390°F (199°C), 8-10 min", visual: "Coating is golden and crisp" },
    ],
  },
  {
    id: "air-fryer-eggplant-parmesan",
    name: "Air Fryer Eggplant Parmesan",
    emoji: "🍆",
    color: ["#F0E4D4", "#D6A96F"],
    time: "30 min",
    categories: ["vegetarian"],
    cuisine: "italian",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["eggplant", "breadcrumbs", "egg", "marinara sauce"],
    macros: { calories: 280, protein: 12, carbs: 30, fat: 13 },
    flavorBoosts: ["Fresh basil", "Extra mozzarella", "Red pepper flakes"],
    steps: [
      { instruction: "Slice eggplant into rounds, coat in egg then breadcrumbs", measure: "1/2-inch rounds", visual: "Coating is even on both sides" },
      { instruction: "Air fry, flipping halfway", measure: "380°F (193°C), 14-16 min", visual: "Coating is golden-brown and crisp" },
      { instruction: "Top with marinara and cheese, air fry briefly to melt", measure: "370°F (188°C), 3-4 min", visual: "Cheese is fully melted and bubbling" },
    ],
  },
  {
    id: "air-fryer-quesadilla",
    name: "Air Fryer Quesadilla",
    emoji: "🧀",
    color: ["#FFEACB", "#F3C077"],
    time: "12 min",
    categories: ["vegetarian", "quick-easy"],
    cuisine: "mexican",
    mealTime: ["lunch"],
    equipment: ["air-fryer"],
    ingredients: ["tortilla", "cheese", "salsa"],
    macros: { calories: 350, protein: 15, carbs: 32, fat: 18 },
    flavorBoosts: ["Sour cream", "Sliced jalapeños", "Fresh cilantro"],
    steps: [
      { instruction: "Sprinkle cheese over half a tortilla and fold over", measure: "N/A", visual: "Cheese is spread evenly, not piled" },
      { instruction: "Air fry, flipping halfway", measure: "370°F (188°C), 6-8 min", visual: "Tortilla is golden-brown, cheese fully melted" },
    ],
  },
  {
    id: "air-fryer-stuffed-peppers",
    name: "Air Fryer Stuffed Peppers",
    emoji: "🫑",
    color: ["#E9F3DD", "#BADFA0"],
    time: "25 min",
    categories: ["healthy-balanced", "meal-prep"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["bell pepper", "ground beef", "rice", "cheese"],
    macros: { calories: 310, protein: 20, carbs: 24, fat: 15 },
    flavorBoosts: ["Fresh cilantro", "Extra cheese on top", "Hot sauce"],
    steps: [
      { instruction: "Halve peppers and remove seeds, brown beef and mix with cooked rice", measure: "N/A", visual: "Filling is well combined, no pink meat" },
      { instruction: "Stuff peppers with filling, top with cheese", measure: "N/A", visual: "Filling is packed but not overflowing" },
      { instruction: "Air fry until peppers are tender and cheese melted", measure: "360°F (182°C), 12-14 min", visual: "Pepper edges are slightly softened, cheese bubbling" },
    ],
  },
  {
    id: "air-fryer-mini-meatloaves",
    name: "Air Fryer Mini Meatloaves",
    emoji: "🍖",
    color: ["#FBE0D8", "#EF9E86"],
    time: "25 min",
    categories: ["high-protein", "meal-prep"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["ground beef", "breadcrumbs", "egg", "ketchup"],
    macros: { calories: 310, protein: 24, carbs: 14, fat: 18 },
    flavorBoosts: ["Extra ketchup glaze", "Fresh thyme", "Worcestershire splash"],
    steps: [
      { instruction: "Mix ground beef, breadcrumbs, egg, and seasoning, form into small loaves", measure: "4 mini loaves", visual: "Mixture holds together without being dense" },
      { instruction: "Brush tops with ketchup", measure: "N/A", visual: "Glaze coats the top evenly" },
      { instruction: "Air fry until cooked through", measure: "370°F (188°C), 15-18 min", visual: "Internal temp reaches 160°F, no pink center" },
    ],
  },
  {
    id: "air-fryer-salmon-bites",
    name: "Air Fryer Salmon Bites",
    emoji: "🐟",
    color: ["#E8F1DC", "#BEDBA0"],
    time: "12 min",
    categories: ["high-protein", "low-carb", "quick-easy"],
    cuisine: "american",
    mealTime: ["dinner", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["salmon fillet", "soy sauce", "honey", "sesame oil"],
    macros: { calories: 280, protein: 27, carbs: 8, fat: 15 },
    flavorBoosts: ["Toasted sesame seeds", "Sliced scallions", "Sriracha drizzle"],
    steps: [
      { instruction: "Cube salmon and toss with soy sauce, honey, and sesame oil", measure: "1-inch cubes", visual: "Cubes are evenly coated and glossy" },
      { instruction: "Air fry in a single layer", measure: "400°F (204°C), 7-8 min", visual: "Edges are lightly caramelized, centers just cooked" },
    ],
  },
  {
    id: "air-fryer-cod",
    name: "Air Fryer Cod",
    emoji: "🐟",
    color: ["#FFE3D2", "#F2A98A"],
    time: "15 min",
    categories: ["high-protein", "low-carb"],
    cuisine: "american",
    mealTime: ["dinner"],
    equipment: ["air-fryer"],
    ingredients: ["cod", "olive oil", "lemon", "paprika"],
    macros: { calories: 190, protein: 27, carbs: 1, fat: 8 },
    flavorBoosts: ["Fresh dill", "Caper garnish", "Garlic butter"],
    steps: [
      { instruction: "Rub cod fillets with oil, lemon, and paprika", measure: "1 tsp oil per fillet", visual: "Surface is evenly coated" },
      { instruction: "Air fry until just cooked through", measure: "380°F (193°C), 8-10 min", visual: "Flakes easily with a fork, opaque throughout" },
    ],
  },
  {
    id: "air-fryer-pork-belly-bites",
    name: "Air Fryer Crispy Pork Belly Bites",
    emoji: "🥓",
    color: ["#FFE7DC", "#F4AE9A"],
    time: "30 min",
    categories: ["high-protein"],
    cuisine: "asian",
    mealTime: ["dinner", "snack"],
    equipment: ["air-fryer"],
    ingredients: ["pork belly", "soy sauce", "garlic", "honey"],
    macros: { calories: 420, protein: 18, carbs: 8, fat: 35 },
    flavorBoosts: ["Sliced scallions", "Sesame seeds", "Extra chili oil"],
    steps: [
      { instruction: "Cube pork belly, toss with soy sauce, garlic, and honey", measure: "1-inch cubes", visual: "Cubes are evenly glazed" },
      { instruction: "Air fry, shaking basket often", measure: "380°F (193°C), 18-20 min", visual: "Exterior is deeply caramelized and crisp" },
    ],
  },
  {
    id: "air-fryer-tostones",
    name: "Air Fryer Tostones",
    emoji: "🍌",
    color: ["#FFD9C7", "#F4A97E"],
    time: "20 min",
    categories: ["vegan", "vegetarian", "budget-friendly"],
    cuisine: "caribbean",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["plantain", "olive oil", "salt"],
    macros: { calories: 160, protein: 1, carbs: 32, fat: 4 },
    flavorBoosts: ["Garlic mojo sauce", "Extra lime", "Chili salt"],
    steps: [
      { instruction: "Slice green plantains into rounds, air fry briefly to soften", measure: "350°F (177°C), 5 min", visual: "Slices are just softened, not browned" },
      { instruction: "Smash flattened, brush with oil, air fry until crisp", measure: "380°F (193°C), 8-10 min", visual: "Edges are golden and crispy" },
    ],
  },
  {
    id: "air-fryer-granola",
    name: "Air Fryer Granola",
    emoji: "🥣",
    color: ["#F0E6D8", "#DDC9A8"],
    time: "15 min",
    categories: ["vegetarian", "meal-prep", "budget-friendly"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["air-fryer"],
    ingredients: ["oats", "honey", "olive oil", "almonds"],
    macros: { calories: 220, protein: 6, carbs: 28, fat: 10 },
    flavorBoosts: ["Dried fruit mix-in", "Cinnamon dust", "Dark chocolate chips"],
    steps: [
      { instruction: "Mix oats, honey, oil, and almonds until evenly coated", measure: "2 cups oats + 3 tbsp honey", visual: "Oats are glossy and clumping slightly" },
      { instruction: "Air fry, stirring every few minutes", measure: "300°F (149°C), 10-12 min", visual: "Golden-brown and fragrant, crisps as it cools" },
    ],
  },
  {
    id: "air-fryer-veggie-chips",
    name: "Air Fryer Mixed Veggie Chips",
    emoji: "🥕",
    color: ["#FCE7C0", "#F0B85E"],
    time: "20 min",
    categories: ["vegan", "vegetarian", "low-calorie"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["air-fryer"],
    ingredients: ["carrot", "potato", "beet", "olive oil"],
    macros: { calories: 130, protein: 2, carbs: 22, fat: 5 },
    flavorBoosts: ["Sea salt flakes", "Ranch seasoning dust", "Fresh herbs"],
    steps: [
      { instruction: "Slice vegetables very thin using a mandoline or sharp knife", measure: "1/16-inch slices", visual: "Slices are uniformly thin and translucent" },
      { instruction: "Toss with oil, air fry in batches, shaking often", measure: "360°F (182°C), 10-12 min", visual: "Chips are crisp with slightly curled edges" },
    ],
  },
  {
    id: "british-fish-and-chips",
    name: "Fish and Chips",
    emoji: "🐟",
    color: ["#FFEBB0", "#F4C34F"],
    time: "35 min",
    categories: ["high-protein"],
    cuisine: "british",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["cod", "flour", "beer", "potato"],
    macros: { calories: 520, protein: 32, carbs: 58, fat: 18 },
    flavorBoosts: ["Malt vinegar splash", "Mushy peas on the side", "Tartar sauce"],
    steps: [
      { instruction: "Cut potatoes into thick chips, soak in cold water", measure: "20 min soak", visual: "Water turns cloudy from released starch" },
      { instruction: "Whisk flour and beer into a smooth batter, dip cod fillets", measure: "1 cup flour + 1 cup beer", visual: "Batter coats the fish in an even layer" },
      { instruction: "Fry chips first, then battered fish until golden", measure: "350°F (177°C) oil, 4-5 min fish", visual: "Batter is crisp and deep golden, chips are tender inside" },
    ],
  },
  {
    id: "british-shepherds-pie",
    name: "Shepherd's Pie",
    emoji: "🥧",
    color: ["#F0E4D4", "#D6A96F"],
    time: "45 min",
    categories: ["high-protein", "meal-prep"],
    cuisine: "british",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["ground beef", "potato", "carrot", "onion"],
    macros: { calories: 420, protein: 24, carbs: 38, fat: 19 },
    flavorBoosts: ["Worcestershire sauce", "Fresh thyme", "Extra cheese on the mash"],
    steps: [
      { instruction: "Brown beef with onion and carrot", measure: "8-10 min", visual: "No pink remaining, vegetables softened" },
      { instruction: "Boil and mash potatoes until smooth", measure: "15 min boil", visual: "Mash is smooth with no lumps" },
      { instruction: "Layer meat in a dish, top with mash, bake until golden", measure: "400°F (204°C), 20 min", visual: "Mash top has golden-brown peaks" },
    ],
  },
  {
    id: "british-full-english",
    name: "Full English Breakfast",
    emoji: "🍳",
    color: ["#FFE3C7", "#F5B073"],
    time: "25 min",
    categories: ["high-protein"],
    cuisine: "british",
    mealTime: ["breakfast"],
    equipment: ["stove", "pot"],
    ingredients: ["bacon", "eggs", "sausage", "canned tomatoes"],
    macros: { calories: 520, protein: 30, carbs: 12, fat: 38 },
    flavorBoosts: ["Baked beans on the side", "Buttered toast", "HP sauce"],
    steps: [
      { instruction: "Cook sausage and bacon in a pan until browned", measure: "8-10 min", visual: "Sausage is cooked through, bacon is crisp" },
      { instruction: "Fry eggs and warm tomatoes in the same pan", measure: "3-4 min", visual: "Egg whites are set, yolks still soft" },
    ],
  },
  {
    id: "british-bangers-mash",
    name: "Bangers and Mash",
    emoji: "🌭",
    color: ["#FCE0D2", "#EFA184"],
    time: "30 min",
    categories: ["budget-friendly"],
    cuisine: "british",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["sausage", "potato", "onion", "butter"],
    macros: { calories: 480, protein: 20, carbs: 42, fat: 27 },
    flavorBoosts: ["Onion gravy", "Fresh chives", "Extra black pepper"],
    steps: [
      { instruction: "Boil potatoes until tender, then mash with butter", measure: "15-18 min boil", visual: "Mash is smooth and creamy" },
      { instruction: "Pan-fry sausages with sliced onion until browned", measure: "12-15 min", visual: "Sausages are deep brown, onions softened" },
    ],
  },
  {
    id: "thai-green-curry",
    name: "Thai Green Curry",
    emoji: "🍛",
    color: ["#E9F3DE", "#BEE0A4"],
    time: "25 min",
    categories: ["high-protein"],
    cuisine: "thai",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["chicken breast", "coconut milk", "green curry paste", "mixed vegetables"],
    macros: { calories: 380, protein: 28, carbs: 14, fat: 24 },
    flavorBoosts: ["Fresh Thai basil", "Extra lime", "Sliced red chili"],
    steps: [
      { instruction: "Fry curry paste in a spoonful of coconut milk until fragrant", measure: "1-2 min", visual: "Paste darkens slightly and smells fragrant" },
      { instruction: "Add chicken and remaining coconut milk, simmer", measure: "10-12 min", visual: "Chicken is cooked through, sauce has thickened slightly" },
      { instruction: "Add vegetables, simmer until tender", measure: "5 min", visual: "Vegetables are bright and just tender" },
    ],
  },
  {
    id: "thai-mango-sticky-rice",
    name: "Mango Sticky Rice",
    emoji: "🥭",
    color: ["#FBEFCB", "#E8CD82"],
    time: "35 min",
    categories: ["vegetarian"],
    cuisine: "thai",
    mealTime: ["snack"],
    equipment: ["stove", "pot"],
    ingredients: ["rice", "coconut milk", "mango", "sugar"],
    macros: { calories: 340, protein: 5, carbs: 62, fat: 9 },
    flavorBoosts: ["Toasted sesame seeds", "Extra coconut milk drizzle", "Mint garnish"],
    steps: [
      { instruction: "Steam glutinous rice until tender", measure: "20-25 min", visual: "Rice is translucent and sticky" },
      { instruction: "Warm coconut milk with sugar, pour over rice", measure: "2-3 min warm", visual: "Rice absorbs the coconut milk, glossy" },
      { instruction: "Serve with sliced mango", measure: "N/A", visual: "Mango is ripe and golden" },
    ],
  },
  {
    id: "thai-tom-yum-soup",
    name: "Tom Yum Soup",
    emoji: "🍲",
    color: ["#FFE0DA", "#FFB6A8"],
    time: "20 min",
    categories: ["low-calorie", "quick-easy"],
    cuisine: "thai",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["shrimp", "chicken broth", "lemongrass", "lime"],
    macros: { calories: 140, protein: 18, carbs: 8, fat: 4 },
    flavorBoosts: ["Fresh cilantro", "Extra chili paste", "Fish sauce splash"],
    steps: [
      { instruction: "Simmer broth with lemongrass and lime leaves", measure: "5-6 min", visual: "Broth is fragrant and steaming" },
      { instruction: "Add shrimp and simmer until just cooked", measure: "3-4 min", visual: "Shrimp turn pink and curl into a loose C" },
    ],
  },
  {
    id: "african-nigerian-jollof",
    name: "Nigerian-Style Jollof Rice",
    emoji: "🍚",
    color: ["#FFD9C7", "#F4A97E"],
    time: "40 min",
    categories: ["high-carb", "budget-friendly", "meal-prep"],
    cuisine: "african",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["rice", "canned tomatoes", "tomato paste", "onion"],
    macros: { calories: 400, protein: 8, carbs: 76, fat: 8 },
    flavorBoosts: ["Fried plantain", "Extra scotch bonnet", "Curry leaves"],
    steps: [
      { instruction: "Blend tomatoes, tomato paste, onion, and pepper into a smooth base", measure: "N/A", visual: "Mixture is smooth and deep red" },
      { instruction: "Fry the base in oil until it darkens and reduces", measure: "15-18 min", visual: "Sauce has thickened, oil separates on top" },
      { instruction: "Stir in parboiled rice, cover and cook on low until tender", measure: "20-25 min", visual: "Rice is tender with a light smoky bottom" },
    ],
  },
  {
    id: "african-suya-skewers",
    name: "Suya Spiced Beef Skewers",
    emoji: "🍢",
    color: ["#FBE0D8", "#EF9E86"],
    time: "25 min",
    categories: ["high-protein", "low-carb"],
    cuisine: "african",
    mealTime: ["dinner", "snack"],
    equipment: ["stove", "pot"],
    ingredients: ["beef", "peanuts", "paprika", "onion"],
    macros: { calories: 320, protein: 30, carbs: 8, fat: 19 },
    flavorBoosts: ["Extra suya spice on top", "Sliced onion and tomato", "Squeeze of lime"],
    steps: [
      { instruction: "Slice beef thin, coat generously in crushed peanuts and spices", measure: "N/A", visual: "Coating covers the meat evenly on all sides" },
      { instruction: "Thread onto skewers and grill or pan-sear, turning often", measure: "10-12 min", visual: "Edges are charred and crisp, meat cooked through" },
    ],
  },
  {
    id: "african-chapati",
    name: "East African Chapati",
    emoji: "🫓",
    color: ["#FBEFD6", "#EFCB86"],
    time: "30 min",
    categories: ["vegetarian", "budget-friendly"],
    cuisine: "african",
    mealTime: ["lunch"],
    equipment: ["stove", "pot"],
    ingredients: ["flour", "oil", "salt"],
    macros: { calories: 220, protein: 5, carbs: 34, fat: 7 },
    flavorBoosts: ["Serve with lentil stew", "A pat of butter", "Fresh chili sauce"],
    steps: [
      { instruction: "Knead flour, oil, salt, and water into a soft dough, rest", measure: "15 min rest", visual: "Dough is smooth and elastic, not sticky" },
      { instruction: "Roll thin, brush with oil, and cook on a hot dry pan, flipping often", measure: "2-3 min per side", visual: "Golden-brown spots form on both sides, layers are flaky" },
    ],
  },
  {
    id: "african-peanut-stew",
    name: "West African Peanut Stew",
    emoji: "🥜",
    color: ["#F7E1CB", "#E9AE6E"],
    time: "35 min",
    categories: ["vegan", "vegetarian", "high-protein"],
    cuisine: "african",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["peanut butter", "canned tomatoes", "sweet potato", "onion"],
    macros: { calories: 360, protein: 12, carbs: 34, fat: 21 },
    flavorBoosts: ["Fresh cilantro", "Extra chili for heat", "Roasted peanuts on top"],
    steps: [
      { instruction: "Sauté onion until softened", measure: "4-5 min", visual: "Onion is translucent" },
      { instruction: "Stir in tomatoes, peanut butter, and sweet potato, simmer", measure: "20-25 min", visual: "Sweet potato is fork-tender, sauce is thick and glossy" },
    ],
  },
  {
    id: "ethiopian-doro-wat",
    name: "Doro Wat (Spiced Chicken Stew)",
    emoji: "🍗",
    color: ["#FFE0C7", "#F5A65E"],
    time: "45 min",
    categories: ["high-protein"],
    cuisine: "ethiopian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["chicken thighs", "berbere spice", "onion", "eggs"],
    macros: { calories: 380, protein: 32, carbs: 10, fat: 23 },
    flavorBoosts: ["Extra berbere for heat", "Hard-boiled egg halves", "Fresh lemon"],
    steps: [
      { instruction: "Cook onion over low heat until deeply softened, stirring often", measure: "15-20 min", visual: "Onion has broken down into a soft, jammy paste" },
      { instruction: "Stir in berbere spice, cook briefly, then add chicken and simmer", measure: "25-30 min", visual: "Chicken is tender, sauce is deep red and thick" },
      { instruction: "Add hard-boiled eggs to warm through", measure: "5 min", visual: "Eggs are coated in sauce, heated through" },
    ],
  },
  {
    id: "ethiopian-shiro",
    name: "Shiro (Chickpea Flour Stew)",
    emoji: "🍲",
    color: ["#FBE7C6", "#F0C27B"],
    time: "25 min",
    categories: ["vegan", "vegetarian", "budget-friendly", "high-protein"],
    cuisine: "ethiopian",
    mealTime: ["dinner", "lunch"],
    equipment: ["stove", "pot"],
    ingredients: ["chickpea flour", "onion", "garlic", "berbere spice"],
    macros: { calories: 280, protein: 14, carbs: 32, fat: 11 },
    flavorBoosts: ["Extra garlic", "Fresh chili", "Drizzle of oil on top"],
    steps: [
      { instruction: "Sauté onion and garlic until softened", measure: "5 min", visual: "Onion is translucent" },
      { instruction: "Whisk chickpea flour into water until smooth, add to the pot with berbere", measure: "2 cups water", visual: "Mixture is lump-free before adding" },
      { instruction: "Simmer, whisking often, until thickened", measure: "10-12 min", visual: "Stew is smooth and thick like a loose porridge" },
    ],
  },
  {
    id: "ethiopian-tikil-gomen",
    name: "Tikil Gomen (Cabbage and Carrots)",
    emoji: "🥬",
    color: ["#E9F3DD", "#BADFA0"],
    time: "25 min",
    categories: ["vegan", "vegetarian", "healthy-balanced"],
    cuisine: "ethiopian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["cabbage", "carrot", "onion", "garlic"],
    macros: { calories: 140, protein: 3, carbs: 20, fat: 6 },
    flavorBoosts: ["Fresh ginger", "Extra turmeric", "Squeeze of lemon"],
    steps: [
      { instruction: "Sauté onion and garlic until fragrant", measure: "3-4 min", visual: "Onion is soft and translucent" },
      { instruction: "Add cabbage and carrot, cover and cook until tender", measure: "15-18 min", visual: "Vegetables are tender but still hold their shape" },
    ],
  },
  {
    id: "french-quiche-lorraine",
    name: "Quiche Lorraine",
    emoji: "🥧",
    color: ["#FFEFCB", "#F0CB7A"],
    time: "50 min",
    categories: ["high-protein"],
    cuisine: "french",
    mealTime: ["breakfast", "lunch"],
    equipment: ["stove", "pot"],
    ingredients: ["eggs", "bacon", "cream", "cheese"],
    macros: { calories: 420, protein: 18, carbs: 16, fat: 32 },
    flavorBoosts: ["Fresh chives", "Cracked black pepper", "Nutmeg pinch"],
    steps: [
      { instruction: "Cook bacon until crisp, set aside", measure: "6-8 min", visual: "Deep golden-brown and firm" },
      { instruction: "Whisk eggs, cream, and cheese, pour over bacon in a pie crust", measure: "4 eggs + 1 cup cream", visual: "Mixture is smooth and evenly poured" },
      { instruction: "Bake until set and golden", measure: "375°F (190°C), 30-35 min", visual: "Center is just set, top is golden-brown" },
    ],
  },
  {
    id: "french-onion-soup",
    name: "French Onion Soup",
    emoji: "🍲",
    color: ["#FBEFD6", "#EFCB86"],
    time: "50 min",
    categories: ["vegetarian"],
    cuisine: "french",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["onion", "butter", "beef broth", "cheese"],
    macros: { calories: 320, protein: 14, carbs: 28, fat: 17 },
    flavorBoosts: ["Fresh thyme", "Extra gruyere", "Splash of sherry"],
    steps: [
      { instruction: "Cook sliced onions in butter over low heat until deeply caramelized", measure: "35-40 min", visual: "Onions are deep golden-brown and jammy" },
      { instruction: "Add broth and simmer", measure: "10 min", visual: "Broth is rich and dark" },
      { instruction: "Top with bread and cheese, broil until bubbling", measure: "3-4 min", visual: "Cheese is fully melted and browned in spots" },
    ],
  },
  {
    id: "french-crepes",
    name: "Simple Crepes",
    emoji: "🥞",
    color: ["#FFF0C7", "#F5D27A"],
    time: "20 min",
    categories: ["vegetarian", "quick-easy"],
    cuisine: "french",
    mealTime: ["breakfast"],
    equipment: ["stove", "pot"],
    ingredients: ["flour", "eggs", "milk", "butter"],
    macros: { calories: 220, protein: 8, carbs: 26, fat: 9 },
    flavorBoosts: ["Nutella spread", "Fresh berries", "Lemon and sugar"],
    steps: [
      { instruction: "Whisk flour, eggs, milk, and melted butter into a thin, smooth batter", measure: "1 cup flour + 2 eggs + 1.5 cups milk", visual: "Batter is pourable, no lumps" },
      { instruction: "Pour a thin layer into a hot buttered pan, swirl to coat, flip once", measure: "1-2 min per side", visual: "Edges are lightly golden and lacy" },
    ],
  },
  {
    id: "spanish-paella",
    name: "Simple Seafood Paella",
    emoji: "🥘",
    color: ["#FDEEC5", "#F0CE73"],
    time: "40 min",
    categories: ["high-protein"],
    cuisine: "spanish",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["rice", "shrimp", "chicken broth", "bell pepper"],
    macros: { calories: 420, protein: 26, carbs: 54, fat: 10 },
    flavorBoosts: ["Fresh lemon wedges", "Smoked paprika", "Fresh parsley"],
    steps: [
      { instruction: "Sauté bell pepper in a wide pan until softened", measure: "4-5 min", visual: "Pepper is softened, lightly browned" },
      { instruction: "Add rice and broth, simmer without stirring", measure: "18-20 min", visual: "Rice has absorbed the liquid, a light crust forms on the bottom" },
      { instruction: "Nestle shrimp into the rice, cover briefly until cooked", measure: "5 min", visual: "Shrimp are pink and curled" },
    ],
  },
  {
    id: "spanish-patatas-bravas",
    name: "Patatas Bravas",
    emoji: "🥔",
    color: ["#FBEFCB", "#E8CD82"],
    time: "30 min",
    categories: ["vegan", "vegetarian", "budget-friendly"],
    cuisine: "spanish",
    mealTime: ["snack"],
    equipment: ["stove", "pot"],
    ingredients: ["potato", "olive oil", "canned tomatoes", "paprika"],
    macros: { calories: 260, protein: 4, carbs: 38, fat: 10 },
    flavorBoosts: ["Garlic aioli", "Extra smoked paprika", "Fresh parsley"],
    steps: [
      { instruction: "Cube potatoes and fry or roast until crisp and golden", measure: "400°F (204°C), 25 min", visual: "Edges are deep golden and crisp" },
      { instruction: "Simmer tomatoes with paprika into a thick spiced sauce", measure: "10 min", visual: "Sauce has thickened and darkened" },
    ],
  },
  {
    id: "spanish-gazpacho",
    name: "Gazpacho",
    emoji: "🍅",
    color: ["#FCE7DE", "#F2AC94"],
    time: "15 min",
    categories: ["vegan", "vegetarian", "low-calorie", "quick-easy"],
    cuisine: "spanish",
    mealTime: ["lunch"],
    equipment: ["stove", "pot"],
    ingredients: ["tomato", "cucumber", "bell pepper", "olive oil"],
    macros: { calories: 120, protein: 2, carbs: 14, fat: 7 },
    flavorBoosts: ["Diced croutons", "Extra olive oil drizzle", "Fresh basil"],
    steps: [
      { instruction: "Blend tomato, cucumber, bell pepper, and olive oil until smooth", measure: "N/A", visual: "Mixture is silky smooth, no chunks" },
      { instruction: "Chill before serving", measure: "1 hr minimum, or overnight", visual: "Soup is cold and well-blended" },
    ],
  },
  {
    id: "brazilian-coxinha",
    name: "Coxinha (Chicken Croquettes)",
    emoji: "🥟",
    color: ["#FBE4CE", "#EFAE6E"],
    time: "45 min",
    categories: ["high-protein"],
    cuisine: "brazilian",
    mealTime: ["snack"],
    equipment: ["stove", "pot"],
    ingredients: ["chicken breast", "flour", "chicken broth", "breadcrumbs"],
    macros: { calories: 280, protein: 16, carbs: 28, fat: 11 },
    flavorBoosts: ["Hot sauce dip", "Fresh lime", "Extra crispy coating"],
    steps: [
      { instruction: "Cook and shred chicken, mix with a little broth", measure: "N/A", visual: "Chicken is finely shredded and moist" },
      { instruction: "Cook flour and broth into a thick dough, cool", measure: "8-10 min", visual: "Dough pulls away from the pan, smooth" },
      { instruction: "Shape dough around chicken filling into teardrops, coat in breadcrumbs and fry", measure: "350°F (177°C), 4-5 min", visual: "Coating is deep golden and crisp" },
    ],
  },
  {
    id: "brazilian-pao-de-queijo",
    name: "Pão de Queijo (Cheese Bread Bites)",
    emoji: "🧀",
    color: ["#FFEBB0", "#F4C34F"],
    time: "30 min",
    categories: ["vegetarian"],
    cuisine: "brazilian",
    mealTime: ["breakfast", "snack"],
    equipment: ["stove", "pot"],
    ingredients: ["tapioca flour", "cheese", "milk", "eggs"],
    macros: { calories: 180, protein: 6, carbs: 18, fat: 9 },
    flavorBoosts: ["Extra parmesan mixed in", "Fresh herbs", "Garlic butter brush"],
    steps: [
      { instruction: "Heat milk and oil, pour over tapioca flour and mix", measure: "N/A", visual: "Mixture forms a thick, sticky paste" },
      { instruction: "Mix in eggs and cheese until a soft dough forms", measure: "N/A", visual: "Dough is smooth and slightly sticky" },
      { instruction: "Roll into balls and bake until puffed and golden", measure: "400°F (204°C), 20 min", visual: "Puffed up with a golden, slightly crisp exterior" },
    ],
  },
  {
    id: "brazilian-moqueca",
    name: "Moqueca (Brazilian Fish Stew)",
    emoji: "🐟",
    color: ["#FFE3D2", "#F2A98A"],
    time: "30 min",
    categories: ["high-protein", "low-carb"],
    cuisine: "brazilian",
    mealTime: ["dinner"],
    equipment: ["stove", "pot"],
    ingredients: ["cod", "coconut milk", "bell pepper", "canned tomatoes"],
    macros: { calories: 320, protein: 28, carbs: 12, fat: 18 },
    flavorBoosts: ["Fresh cilantro", "Lime wedges", "Chili oil drizzle"],
    steps: [
      { instruction: "Sauté bell pepper and onion until softened", measure: "5 min", visual: "Vegetables are softened, lightly golden" },
      { instruction: "Add tomatoes and coconut milk, simmer into a sauce", measure: "8-10 min", visual: "Sauce is orange-red and fragrant" },
      { instruction: "Nestle fish into the sauce and simmer until just cooked", measure: "8-10 min", visual: "Fish flakes easily, opaque throughout" },
    ],
  },
  {
    id: "honey-lime-fruit-salad",
    name: "Honey Lime Fruit Salad",
    emoji: "🍓",
    color: ["#FFE3E3", "#F7B2B7"],
    time: "10 min",
    categories: ["fruit", "vegan", "vegetarian", "quick-easy", "beginner-friendly", "low-calorie", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: [],
    ingredients: ["strawberries", "blueberries", "kiwi", "grapes", "honey", "lime"],
    macros: { calories: 150, protein: 2, carbs: 38, fat: 1 },
    flavorBoosts: ["Fresh mint, torn", "A pinch of lime zest", "A spoon of Greek yogurt on top"],
    steps: [
      { instruction: "Wash all the fruit, then hull and quarter the strawberries, peel and slice the kiwi, and halve the grapes", measure: "About 1 cup of each", visual: "Pieces are roughly the same bite size, no whole strawberries left" },
      { instruction: "Whisk honey with the juice of the lime", measure: "1 tbsp honey + juice of 1 lime", visual: "Dressing is runny and evenly mixed, no honey stuck to the bottom" },
      { instruction: "Pour the dressing over the fruit and toss gently", measure: "Rest 5 min before serving", visual: "Fruit looks glossy and the juices start to pool in the bowl" },
    ],
  },
  {
    id: "banana-oat-pancakes",
    name: "3-Ingredient Banana Oat Pancakes",
    emoji: "🥞",
    color: ["#FFF1CF", "#F2D38A"],
    time: "15 min",
    categories: ["fruit", "vegetarian", "beginner-friendly", "budget-friendly", "high-fiber", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["stove", "pan"],
    ingredients: ["banana", "eggs", "oats", "butter"],
    macros: { calories: 330, protein: 13, carbs: 45, fat: 11 },
    flavorBoosts: ["A drizzle of maple syrup", "Cinnamon in the batter", "Sliced banana on top"],
    steps: [
      { instruction: "Mash the banana well, then stir in the eggs and oats", measure: "1 ripe banana + 2 eggs + 1/2 cup oats", visual: "Batter is thick and lumpy from the oats, with no big banana chunks" },
      { instruction: "Melt a little butter in a pan over medium-low heat and spoon in small pancakes", measure: "2 tbsp batter each", visual: "Pancakes hold a round shape and don't spread thin" },
      { instruction: "Cook until bubbles appear, then flip and cook the other side", measure: "2–3 min per side", visual: "Both sides are golden brown and the center springs back when pressed" },
    ],
  },
  {
    id: "berry-smoothie-bowl",
    name: "Berry Smoothie Bowl",
    emoji: "🫐",
    color: ["#E6DDF6", "#BFA8E6"],
    time: "5 min",
    categories: ["fruit", "vegetarian", "quick-easy", "beginner-friendly", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: [],
    ingredients: ["frozen berries", "banana", "greek yogurt", "granola"],
    macros: { calories: 360, protein: 15, carbs: 62, fat: 7 },
    flavorBoosts: ["Chia seeds sprinkled on top", "A drizzle of honey", "Shredded coconut"],
    steps: [
      { instruction: "Blend frozen berries, half the banana and the yogurt until thick", measure: "1 cup berries + 1/2 banana + 1/2 cup yogurt", visual: "Mixture is thick like soft-serve, it holds a peak on the spoon" },
      { instruction: "Scoop into a bowl and top with granola and the rest of the banana, sliced", measure: "1/4 cup granola", visual: "Toppings sit on the surface instead of sinking" },
    ],
  },
  {
    id: "baked-cinnamon-apples",
    name: "Baked Cinnamon Apples",
    emoji: "🍎",
    color: ["#FFE0D6", "#F0A48C"],
    time: "30 min",
    categories: ["fruit", "vegetarian", "beginner-friendly", "budget-friendly", "high-fiber"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["oven"],
    ingredients: ["apple", "cinnamon", "brown sugar", "butter"],
    macros: { calories: 210, protein: 1, carbs: 38, fat: 7 },
    flavorBoosts: ["A scoop of vanilla ice cream", "Chopped walnuts", "A splash of maple syrup"],
    steps: [
      { instruction: "Heat the oven, then core the apples and cut them into thick wedges", measure: "375°F (190°C), 2 apples", visual: "Wedges are about the same thickness so they cook evenly" },
      { instruction: "Toss wedges with melted butter, brown sugar and cinnamon in a baking dish", measure: "1 tbsp butter + 1 tbsp sugar + 1 tsp cinnamon", visual: "Every wedge is coated, no dry white patches" },
      { instruction: "Bake, stirring once halfway", measure: "20–25 min", visual: "Apples are soft when poked with a fork and sitting in a bubbling syrup" },
    ],
  },
  {
    id: "banana-mug-cake",
    name: "Microwave Banana Mug Cake",
    emoji: "🧁",
    color: ["#FCEFD4", "#E6C68A"],
    time: "5 min",
    categories: ["fruit", "vegetarian", "quick-easy", "beginner-friendly", "budget-friendly"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["microwave"],
    ingredients: ["banana", "flour", "eggs", "sugar", "baking powder"],
    macros: { calories: 340, protein: 9, carbs: 62, fat: 6 },
    flavorBoosts: ["A few chocolate chips", "Cinnamon", "Chopped walnuts"],
    steps: [
      { instruction: "Mash half a banana in a large mug, then mix in the egg and sugar", measure: "1/2 banana + 1 egg + 1 tbsp sugar", visual: "Mixture is smooth with only tiny banana bits" },
      { instruction: "Stir in the flour and baking powder", measure: "4 tbsp flour + 1/4 tsp baking powder", visual: "No dry flour left at the bottom of the mug" },
      { instruction: "Microwave until risen and set", measure: "60–90 sec", visual: "Top looks dry and springs back; a toothpick comes out clean" },
    ],
  },
  {
    id: "mango-lassi",
    name: "Mango Lassi",
    emoji: "🥭",
    color: ["#FFE9C2", "#F7C25E"],
    time: "5 min",
    categories: ["fruit", "vegetarian", "quick-easy", "beginner-friendly"],
    cuisine: "indian",
    mealTime: ["breakfast", "snack"],
    equipment: [],
    ingredients: ["mango", "yogurt", "milk", "sugar"],
    macros: { calories: 260, protein: 8, carbs: 46, fat: 5 },
    flavorBoosts: ["A pinch of ground cardamom", "A few ice cubes", "Crushed pistachios on top"],
    steps: [
      { instruction: "Peel and chop the mango, or use frozen chunks", measure: "1 cup mango", visual: "Pieces are small enough to blend easily" },
      { instruction: "Blend mango, yogurt, milk and sugar until completely smooth", measure: "1/2 cup yogurt + 1/2 cup milk + 1–2 tsp sugar, 30–60 sec", visual: "Drink is bright orange-yellow and pours like a thick milkshake" },
    ],
  },
  {
    id: "strawberry-spinach-salad",
    name: "Strawberry Spinach Salad",
    emoji: "🥗",
    color: ["#E2F2DD", "#F4B9BF"],
    time: "10 min",
    categories: ["fruit", "vegetarian", "low-calorie", "quick-easy", "healthy-balanced", "low-carb"],
    cuisine: "american",
    mealTime: ["lunch"],
    equipment: [],
    ingredients: ["spinach", "strawberries", "feta", "balsamic vinegar", "olive oil"],
    macros: { calories: 220, protein: 7, carbs: 14, fat: 16 },
    flavorBoosts: ["Toasted walnuts or almonds", "Thin slices of red onion", "Grilled chicken for protein"],
    steps: [
      { instruction: "Slice the strawberries and add them to a bowl of washed spinach", measure: "2 cups spinach + 1 cup strawberries", visual: "Spinach leaves are dry, not dripping, so the dressing sticks" },
      { instruction: "Shake oil and balsamic together with a pinch of salt", measure: "2 tbsp oil + 1 tbsp balsamic", visual: "Dressing looks cloudy and blended, not separated" },
      { instruction: "Toss with the dressing and crumble feta on top", measure: "1/4 cup feta", visual: "Leaves are lightly shiny, not soggy or wilted" },
    ],
  },
  {
    id: "honey-seared-peaches",
    name: "Honey Seared Peaches with Yogurt",
    emoji: "🍑",
    color: ["#FFE4D2", "#F7B184"],
    time: "10 min",
    categories: ["fruit", "vegetarian", "quick-easy", "beginner-friendly"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: ["stove", "pan"],
    ingredients: ["peaches", "honey", "butter", "greek yogurt"],
    macros: { calories: 240, protein: 10, carbs: 32, fat: 9 },
    flavorBoosts: ["A pinch of cinnamon", "Granola for crunch", "Fresh mint leaves"],
    steps: [
      { instruction: "Halve the peaches and remove the pits", measure: "2 peaches", visual: "Cut sides are flat so they sit evenly in the pan" },
      { instruction: "Melt butter in a pan over medium heat and place peaches cut-side down", measure: "1 tbsp butter, 3–4 min", visual: "Cut sides turn deep golden with caramelized edges" },
      { instruction: "Drizzle with honey, then serve over yogurt", measure: "1 tbsp honey + 1/2 cup yogurt", visual: "Peaches are warm and soft but still hold their shape" },
    ],
  },
  {
    id: "apple-pb-slices",
    name: "Apple Slices with Peanut Butter",
    emoji: "🍏",
    color: ["#E5F4D7", "#B9DE95"],
    time: "5 min",
    categories: ["fruit", "vegetarian", "vegan", "quick-easy", "beginner-friendly", "budget-friendly", "high-fiber"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: [],
    ingredients: ["apple", "peanut butter", "granola"],
    macros: { calories: 290, protein: 8, carbs: 34, fat: 16 },
    flavorBoosts: ["A sprinkle of cinnamon", "A few chocolate chips", "A drizzle of honey"],
    steps: [
      { instruction: "Core the apple and cut it into thin rings or wedges", measure: "1 apple", visual: "Slices are even, about 1/4 inch thick" },
      { instruction: "Spread peanut butter on each slice and sprinkle with granola", measure: "2 tbsp peanut butter + 2 tbsp granola", visual: "Granola sticks to the peanut butter and doesn't fall off" },
    ],
  },
  {
    id: "frozen-banana-bites",
    name: "Frozen Chocolate Banana Bites",
    emoji: "🍫",
    color: ["#F2E3D3", "#C9A07A"],
    time: "70 min",
    categories: ["fruit", "vegetarian", "beginner-friendly", "meal-prep"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["microwave", "fridge"],
    ingredients: ["banana", "chocolate chips", "peanut butter"],
    macros: { calories: 250, protein: 5, carbs: 30, fat: 13 },
    flavorBoosts: ["Flaky sea salt on top", "Crushed peanuts", "Shredded coconut"],
    steps: [
      { instruction: "Slice bananas into coins and spread a little peanut butter on half of them, then top with the other half", measure: "2 bananas, 1/2-inch coins", visual: "Little sandwiches hold together without sliding" },
      { instruction: "Melt the chocolate in the microwave in short bursts, stirring between each", measure: "1/2 cup chips, 20 sec at a time", visual: "Chocolate is smooth and glossy with no lumps" },
      { instruction: "Dip each bite halfway in chocolate, set on a lined plate and freeze", measure: "At least 1 hr", visual: "Chocolate is hard and snaps when bitten" },
    ],
  },
  {
    id: "berry-chia-pudding",
    name: "Berry Chia Pudding",
    emoji: "🍇",
    color: ["#EEDDF0", "#CDA5D6"],
    time: "5 min + overnight",
    categories: ["fruit", "vegetarian", "high-fiber", "meal-prep", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["fridge"],
    ingredients: ["chia seeds", "milk", "berries", "honey"],
    macros: { calories: 280, protein: 9, carbs: 32, fat: 13 },
    flavorBoosts: ["A splash of vanilla", "Sliced almonds", "Lemon zest"],
    steps: [
      { instruction: "Stir chia seeds, milk and honey together in a jar", measure: "3 tbsp chia + 3/4 cup milk + 1 tsp honey", visual: "Seeds are spread through the milk, not clumped at the bottom" },
      { instruction: "Wait 5 minutes, then stir again to break up clumps", measure: "5 min", visual: "Mixture has started to thicken slightly" },
      { instruction: "Refrigerate overnight, then top with berries", measure: "At least 4 hr", visual: "Pudding is thick and holds on a spoon like custard" },
    ],
  },
  {
    id: "pineapple-fried-rice",
    name: "Pineapple Fried Rice",
    emoji: "🍍",
    color: ["#FFF3C4", "#F5D66A"],
    time: "20 min",
    categories: ["fruit", "vegetarian", "budget-friendly", "high-carb"],
    cuisine: "thai",
    mealTime: ["lunch", "dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["rice", "pineapple", "eggs", "soy sauce", "onion", "oil"],
    macros: { calories: 470, protein: 13, carbs: 78, fat: 12 },
    flavorBoosts: ["Cashews toasted in the pan", "Sliced green onion", "A pinch of curry powder"],
    steps: [
      { instruction: "Scramble the eggs in a hot oiled pan, then set them aside", measure: "2 eggs, 1–2 min", visual: "Eggs are just set, no runny parts" },
      { instruction: "Cook chopped onion in a little more oil, then add the pineapple", measure: "3 min + 2 min", visual: "Onion is soft and the pineapple edges start to brown" },
      { instruction: "Add cold cooked rice and soy sauce, stir-fry, then fold the eggs back in", measure: "2 cups rice + 2 tbsp soy sauce, 4–5 min", visual: "Rice is evenly light brown and some grains are crisp" },
    ],
  },
  {
    id: "mango-salsa",
    name: "Fresh Mango Salsa",
    emoji: "🌶️",
    color: ["#FFE7C2", "#9ED18A"],
    time: "10 min",
    categories: ["fruit", "vegan", "vegetarian", "low-calorie", "quick-easy"],
    cuisine: "mexican",
    mealTime: ["snack"],
    equipment: [],
    ingredients: ["mango", "red onion", "lime", "cilantro", "jalapeño"],
    macros: { calories: 90, protein: 1, carbs: 22, fat: 0 },
    flavorBoosts: ["Diced avocado", "Diced red bell pepper", "Serve with tortilla chips or on fish tacos"],
    steps: [
      { instruction: "Dice the mango and red onion small, and finely chop the cilantro and jalapeño", measure: "1 mango + 1/4 onion + 1/2 jalapeño", visual: "Pieces are about the size of a pea so every scoop gets some of everything" },
      { instruction: "Mix everything with the lime juice and a pinch of salt", measure: "Juice of 1 lime", visual: "Salsa looks juicy and the colors are evenly mixed" },
      { instruction: "Let it sit before serving", measure: "5–10 min", visual: "The onion has softened slightly and the juices have pooled" },
    ],
  },
  {
    id: "orange-chicken-simple",
    name: "Simple Orange Chicken",
    emoji: "🍊",
    color: ["#FFE2C4", "#F5A55A"],
    time: "25 min",
    categories: ["fruit", "high-protein"],
    cuisine: "chinese",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["chicken breast", "orange", "soy sauce", "honey", "cornstarch", "oil"],
    macros: { calories: 420, protein: 38, carbs: 30, fat: 14 },
    flavorBoosts: ["Grated fresh ginger in the sauce", "Red pepper flakes", "Sesame seeds and green onion on top"],
    steps: [
      { instruction: "Cut chicken into bite-size pieces and toss with cornstarch", measure: "1 lb chicken + 2 tbsp cornstarch", visual: "Pieces are lightly dusted all over, no wet spots" },
      { instruction: "Cook chicken in a hot oiled pan, turning occasionally", measure: "6–8 min", visual: "Chicken is golden on the outside and white all the way through" },
      { instruction: "Add the orange juice and zest, soy sauce and honey, and simmer", measure: "Juice of 1 orange + 2 tbsp soy + 2 tbsp honey, 2–3 min", visual: "Sauce thickens into a glossy glaze that coats the chicken" },
    ],
  },
  {
    id: "apple-crumble",
    name: "Easy Apple Crumble",
    emoji: "🥧",
    color: ["#F7E4CF", "#D9A774"],
    time: "45 min",
    categories: ["fruit", "vegetarian", "budget-friendly"],
    cuisine: "british",
    mealTime: ["snack"],
    equipment: ["oven"],
    ingredients: ["apple", "oats", "flour", "butter", "brown sugar", "cinnamon"],
    macros: { calories: 380, protein: 4, carbs: 56, fat: 16 },
    flavorBoosts: ["Custard or vanilla ice cream", "A handful of blackberries with the apples", "Chopped nuts in the topping"],
    steps: [
      { instruction: "Heat the oven, then slice the apples and toss with cinnamon and half the sugar in a baking dish", measure: "350°F (180°C), 3 apples + 1 tsp cinnamon", visual: "Apples are spread in an even layer" },
      { instruction: "Rub cold butter into the flour, oats and remaining sugar with your fingertips", measure: "1/3 cup each of butter, flour and oats + 1/4 cup sugar", visual: "Mixture looks like rough crumbs with some pea-size clumps" },
      { instruction: "Scatter the crumble over the apples and bake", measure: "30–35 min", visual: "Topping is golden and the fruit juices bubble up at the edges" },
    ],
  },
  {
    id: "berry-yogurt-bark",
    name: "Frozen Berry Yogurt Bark",
    emoji: "🍒",
    color: ["#FCE3EA", "#EFA3B6"],
    time: "130 min",
    categories: ["fruit", "vegetarian", "high-protein", "meal-prep", "low-calorie"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: ["fridge"],
    ingredients: ["greek yogurt", "berries", "honey"],
    macros: { calories: 140, protein: 12, carbs: 20, fat: 2 },
    flavorBoosts: ["Dark chocolate chips", "Granola pressed into the top", "Lemon zest"],
    steps: [
      { instruction: "Stir honey into the yogurt and spread it on a lined tray", measure: "1 1/2 cups yogurt + 1 tbsp honey, 1/2 inch thick", visual: "Layer is even with no thin spots that will break" },
      { instruction: "Press berries into the top", measure: "1 cup berries", visual: "Berries are half sunk in the yogurt so they don't fall off" },
      { instruction: "Freeze until solid, then break into pieces", measure: "At least 2 hr", visual: "Bark snaps cleanly instead of bending" },
    ],
  },
  {
    id: "watermelon-feta-salad",
    name: "Watermelon Feta Salad",
    emoji: "🍉",
    color: ["#FFDCDC", "#9FD3A2"],
    time: "10 min",
    categories: ["fruit", "vegetarian", "low-calorie", "quick-easy", "beginner-friendly"],
    cuisine: "mediterranean",
    mealTime: ["lunch", "snack"],
    equipment: [],
    ingredients: ["watermelon", "feta", "mint", "lime"],
    macros: { calories: 170, protein: 6, carbs: 22, fat: 7 },
    flavorBoosts: ["Sliced cucumber", "A drizzle of olive oil", "Cracked black pepper"],
    steps: [
      { instruction: "Cut the watermelon into cubes and remove any seeds you see", measure: "3 cups", visual: "Cubes are bite-size and evenly shaped" },
      { instruction: "Crumble feta over the top and add torn mint leaves", measure: "1/3 cup feta + a small handful of mint", visual: "White feta and green mint are scattered all over, not in one pile" },
      { instruction: "Squeeze lime over just before serving", measure: "Juice of 1/2 lime", visual: "Watermelon looks fresh and juicy, not sitting in liquid" },
    ],
  },
  {
    id: "honey-baked-pears",
    name: "Honey Baked Pears",
    emoji: "🍐",
    color: ["#EEF2D2", "#C9D38A"],
    time: "35 min",
    categories: ["fruit", "vegetarian", "beginner-friendly", "high-fiber"],
    cuisine: "french",
    mealTime: ["snack"],
    equipment: ["oven"],
    ingredients: ["pears", "honey", "cinnamon", "walnuts"],
    macros: { calories: 230, protein: 3, carbs: 38, fat: 9 },
    flavorBoosts: ["A spoon of Greek yogurt", "A splash of vanilla in the honey", "Crumbled goat cheese"],
    steps: [
      { instruction: "Heat the oven, halve the pears and scoop out the cores with a spoon", measure: "375°F (190°C), 2 pears", visual: "Each half has a small hollow in the middle" },
      { instruction: "Set pears cut-side up, fill with chopped walnuts, drizzle with honey and dust with cinnamon", measure: "2 tbsp walnuts + 2 tbsp honey", visual: "Honey pools in the hollows and runs down the sides" },
      { instruction: "Bake until tender", measure: "25–30 min", visual: "A knife slides into the pear easily and the edges are lightly golden" },
    ],
  },
  {
    id: "tropical-smoothie",
    name: "Tropical Smoothie",
    emoji: "🍹",
    color: ["#FFF0C9", "#FFC36B"],
    time: "5 min",
    categories: ["fruit", "vegan", "vegetarian", "quick-easy", "beginner-friendly"],
    cuisine: "caribbean",
    mealTime: ["breakfast", "snack"],
    equipment: [],
    ingredients: ["pineapple", "mango", "banana", "orange juice"],
    macros: { calories: 240, protein: 3, carbs: 60, fat: 1 },
    flavorBoosts: ["A splash of coconut milk", "Fresh ginger", "A squeeze of lime"],
    steps: [
      { instruction: "Add the fruit and orange juice to a blender, using frozen fruit if you have it", measure: "1/2 cup each fruit + 3/4 cup juice", visual: "Liquid comes about halfway up the fruit" },
      { instruction: "Blend until completely smooth", measure: "45–60 sec", visual: "No fruit chunks remain and the smoothie swirls freely" },
    ],
  },
  {
    id: "kelewele",
    name: "Kelewele (Spicy Fried Plantains)",
    emoji: "🍌",
    color: ["#FFE6B3", "#E69B3C"],
    time: "25 min",
    categories: ["fruit", "vegan", "vegetarian", "budget-friendly"],
    cuisine: "ghanaian",
    mealTime: ["snack"],
    equipment: ["stove", "pot"],
    ingredients: ["plantain", "ginger", "chili powder", "oil"],
    macros: { calories: 330, protein: 2, carbs: 48, fat: 15 },
    flavorBoosts: ["A pinch of grated nutmeg", "Roasted peanuts on the side", "Chopped onion in the spice mix"],
    steps: [
      { instruction: "Peel ripe plantains and cut into small cubes", measure: "2 plantains, 3/4-inch cubes", visual: "Plantains are yellow with black spots and the cubes are even" },
      { instruction: "Toss with grated ginger, chili powder and a pinch of salt", measure: "1 tbsp ginger + 1 tsp chili powder", visual: "Every cube is coated in spice, no bare yellow sides" },
      { instruction: "Fry in hot oil in batches until browned", measure: "1 inch of oil, 4–5 min per batch", visual: "Cubes are deep golden brown with dark caramelized edges" },
    ],
  },
  {
    id: "acai-bowl",
    name: "Açaí Bowl",
    emoji: "🫐",
    color: ["#E3D3EE", "#8E5FAE"],
    time: "10 min",
    categories: ["fruit", "vegetarian", "quick-easy", "healthy-balanced"],
    cuisine: "brazilian",
    mealTime: ["breakfast", "snack"],
    equipment: [],
    ingredients: ["acai", "banana", "granola", "honey"],
    macros: { calories: 380, protein: 6, carbs: 64, fat: 12 },
    flavorBoosts: ["Sliced strawberries", "Coconut flakes", "A spoon of peanut butter"],
    steps: [
      { instruction: "Blend frozen açaí with half the banana and a splash of water", measure: "1 açaí pack + 1/2 banana + 2 tbsp water", visual: "Mix is thick and scoopable like sorbet, not drinkable" },
      { instruction: "Spoon into a bowl and top with granola, sliced banana and honey", measure: "1/4 cup granola + 1 tsp honey", visual: "Toppings sit in neat rows on top" },
    ],
  },
  {
    id: "strawberry-shortcake-cups",
    name: "Strawberry Shortcake Cups",
    emoji: "🍰",
    color: ["#FFE1E4", "#F2A5AF"],
    time: "15 min",
    categories: ["fruit", "vegetarian", "quick-easy", "beginner-friendly"],
    cuisine: "american",
    mealTime: ["snack"],
    equipment: [],
    ingredients: ["strawberries", "sugar", "whipped cream", "pound cake"],
    macros: { calories: 360, protein: 4, carbs: 46, fat: 18 },
    flavorBoosts: ["Lemon zest on the berries", "A splash of vanilla in the cream", "Fresh mint"],
    steps: [
      { instruction: "Slice strawberries, toss with sugar and let them sit", measure: "1 cup berries + 1 tsp sugar, 10 min", visual: "Berries release a shiny red syrup" },
      { instruction: "Cube the pound cake and layer it in a cup with berries and whipped cream", measure: "2 layers each", visual: "Cake soaks up some syrup and the layers stay visible" },
    ],
  },
  {
    id: "lemon-blueberry-muffins",
    name: "Lemon Blueberry Muffins",
    emoji: "🧁",
    color: ["#FFF6CF", "#A7B8E8"],
    time: "35 min",
    categories: ["fruit", "vegetarian", "meal-prep"],
    cuisine: "american",
    mealTime: ["breakfast", "snack"],
    equipment: ["oven"],
    ingredients: ["flour", "blueberries", "lemon", "sugar", "eggs", "milk", "butter", "baking powder"],
    macros: { calories: 250, protein: 5, carbs: 36, fat: 9 },
    flavorBoosts: ["Sugar sprinkled on top before baking", "A simple lemon glaze", "Swap half the flour for oats"],
    steps: [
      { instruction: "Heat the oven and line a muffin tin", measure: "375°F (190°C), 12 cups", visual: "Liners are set in every cup" },
      { instruction: "Mix the dry ingredients in one bowl and the wet ones (eggs, milk, melted butter, lemon zest and juice) in another", measure: "2 cups flour + 3/4 cup sugar + 2 tsp baking powder; 2 eggs + 3/4 cup milk + 1/3 cup butter", visual: "Wet mix is smooth and the butter hasn't clumped" },
      { instruction: "Fold wet into dry until just combined, then fold in the blueberries", measure: "1 cup blueberries, about 10 strokes", visual: "A few streaks of flour are fine; the batter is lumpy, not smooth" },
      { instruction: "Fill cups three-quarters full and bake", measure: "20–22 min", visual: "Tops are domed and golden and a toothpick comes out clean" },
    ],
  },
  {
    id: "berry-french-toast",
    name: "Berry French Toast",
    emoji: "🍞",
    color: ["#FCE8D2", "#E7B07D"],
    time: "15 min",
    categories: ["fruit", "vegetarian", "beginner-friendly", "budget-friendly", "high-carb"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["stove", "pan"],
    ingredients: ["bread", "eggs", "milk", "berries", "cinnamon", "butter"],
    macros: { calories: 420, protein: 16, carbs: 52, fat: 16 },
    flavorBoosts: ["Maple syrup", "Powdered sugar dusted on top", "A splash of vanilla in the egg mix"],
    steps: [
      { instruction: "Whisk eggs, milk and cinnamon in a shallow dish", measure: "2 eggs + 1/3 cup milk + 1/2 tsp cinnamon", visual: "No streaks of egg white left" },
      { instruction: "Dip each slice of bread on both sides", measure: "About 5 sec per side", visual: "Bread is soaked through but not falling apart" },
      { instruction: "Cook in a buttered pan over medium heat, then top with berries", measure: "2–3 min per side", visual: "Both sides are golden brown and the center is no longer wet" },
    ],
  },
  {
    id: "strawberry-banana-crepes",
    name: "Strawberry Banana Crêpes",
    emoji: "🥞",
    color: ["#FFE8E0", "#F3B49E"],
    time: "25 min",
    categories: ["fruit", "vegetarian", "budget-friendly"],
    cuisine: "french",
    mealTime: ["breakfast", "snack"],
    equipment: ["stove", "pan"],
    ingredients: ["flour", "eggs", "milk", "strawberries", "banana", "butter"],
    macros: { calories: 380, protein: 13, carbs: 54, fat: 12 },
    flavorBoosts: ["Chocolate hazelnut spread", "A squeeze of lemon and a little sugar", "Whipped cream"],
    steps: [
      { instruction: "Whisk flour, eggs and milk into a thin batter and let it rest", measure: "1 cup flour + 2 eggs + 1 1/4 cups milk, 10 min", visual: "Batter is smooth and as thin as heavy cream" },
      { instruction: "Swirl a ladle of batter around a lightly buttered hot pan", measure: "1/4 cup per crêpe, medium heat", visual: "Batter covers the pan in one thin even layer" },
      { instruction: "Flip when the edges lift, cook briefly, then fill with sliced fruit and fold", measure: "1 min + 30 sec", visual: "Crêpe has light brown spots and folds without cracking" },
    ],
  },
  {
    id: "fruta-con-chile",
    name: "Fruta con Chile",
    emoji: "🥒",
    color: ["#FFE5CC", "#F28B66"],
    time: "10 min",
    categories: ["fruit", "vegan", "vegetarian", "low-calorie", "quick-easy", "beginner-friendly"],
    cuisine: "mexican",
    mealTime: ["snack"],
    equipment: [],
    ingredients: ["mango", "pineapple", "cucumber", "lime", "chili powder"],
    macros: { calories: 130, protein: 2, carbs: 32, fat: 0 },
    flavorBoosts: ["Watermelon or jícama spears", "A pinch of salt", "Tajín if you have it"],
    steps: [
      { instruction: "Cut the mango, pineapple and cucumber into long spears", measure: "About 1 cup each", visual: "Spears are similar length so they stand up in a cup" },
      { instruction: "Squeeze lime over everything and sprinkle with chili powder and a pinch of salt", measure: "Juice of 1 lime + 1 tsp chili powder", visual: "Every spear has a red dusting of chili" },
    ],
  },
  {
    id: "fruit-sando",
    name: "Japanese Fruit Sando",
    emoji: "🥪",
    color: ["#FFF4EC", "#F4B6A4"],
    time: "45 min",
    categories: ["fruit", "vegetarian", "beginner-friendly"],
    cuisine: "japanese",
    mealTime: ["snack"],
    equipment: ["fridge"],
    ingredients: ["bread", "whipped cream", "strawberries", "kiwi"],
    macros: { calories: 390, protein: 7, carbs: 44, fat: 21 },
    flavorBoosts: ["Mandarin orange segments", "A little sugar in the cream", "Mango slices"],
    steps: [
      { instruction: "Spread a thick layer of whipped cream on two slices of soft white bread", measure: "3 tbsp per slice", visual: "Cream reaches all four edges" },
      { instruction: "Arrange whole strawberries and kiwi slices in a line across the middle, then cover with more cream and the second slice", measure: "3 strawberries + 1 kiwi", visual: "Fruit is fully buried in cream with no air gaps" },
      { instruction: "Wrap tightly and chill, then trim the crusts and cut through the fruit line", measure: "30 min", visual: "Cut face shows clean fruit cross-sections in white cream" },
    ],
  },
  {
    id: "avocado-smoothie",
    name: "Vietnamese Avocado Smoothie",
    emoji: "🥑",
    color: ["#E6F2D5", "#A9CF7E"],
    time: "5 min",
    categories: ["fruit", "vegetarian", "quick-easy", "beginner-friendly"],
    cuisine: "vietnamese",
    mealTime: ["snack"],
    equipment: [],
    ingredients: ["avocado", "condensed milk", "milk"],
    macros: { calories: 390, protein: 8, carbs: 38, fat: 24 },
    flavorBoosts: ["A handful of ice", "A drizzle of condensed milk on top", "A splash of coconut milk"],
    steps: [
      { instruction: "Scoop out a ripe avocado", measure: "1 avocado", visual: "Flesh is soft and bright green, no brown spots" },
      { instruction: "Blend with milk and condensed milk until thick and smooth", measure: "1 cup milk + 2 tbsp condensed milk, 30–45 sec", visual: "Smoothie is pale green and thick enough to need a spoon at first" },
    ],
  },
  {
    id: "pineapple-teriyaki-chicken",
    name: "Pineapple Teriyaki Chicken",
    emoji: "🍍",
    color: ["#FFF0C7", "#C98A4B"],
    time: "25 min",
    categories: ["fruit", "high-protein"],
    cuisine: "asian",
    mealTime: ["dinner"],
    equipment: ["stove", "pan"],
    ingredients: ["chicken thighs", "pineapple", "soy sauce", "brown sugar", "garlic", "oil"],
    macros: { calories: 450, protein: 34, carbs: 32, fat: 20 },
    flavorBoosts: ["Sesame seeds and green onion", "Grated fresh ginger in the sauce", "Serve over rice"],
    steps: [
      { instruction: "Cut chicken into chunks and brown in a hot oiled pan", measure: "1 lb chicken, 6–7 min", visual: "Chicken is golden on most sides" },
      { instruction: "Add pineapple chunks and minced garlic", measure: "1 cup pineapple + 2 cloves, 2 min", visual: "Pineapple edges begin to caramelize" },
      { instruction: "Stir in soy sauce and brown sugar and simmer until sticky", measure: "3 tbsp soy + 2 tbsp sugar, 3–4 min", visual: "Sauce thickens and coats everything in a shiny glaze; chicken is cooked through" },
    ],
  },
  {
    id: "apple-cinnamon-oatmeal",
    name: "Apple Cinnamon Oatmeal",
    emoji: "🥣",
    color: ["#F5E6D3", "#D4A574"],
    time: "10 min",
    categories: ["fruit", "vegetarian", "beginner-friendly", "budget-friendly", "high-fiber", "healthy-balanced"],
    cuisine: "american",
    mealTime: ["breakfast"],
    equipment: ["stove", "pot"],
    ingredients: ["oats", "apple", "milk", "cinnamon", "maple syrup"],
    macros: { calories: 330, protein: 10, carbs: 58, fat: 7 },
    flavorBoosts: ["Chopped walnuts", "A spoon of peanut butter stirred in", "A pinch of salt to bring out the sweetness"],
    steps: [
      { instruction: "Dice the apple and simmer it in the milk with the cinnamon", measure: "1/2 apple + 1 cup milk + 1/2 tsp cinnamon, 2 min", visual: "Milk is steaming with small bubbles at the edges" },
      { instruction: "Stir in the oats and cook, stirring often", measure: "1/2 cup oats, 4–5 min", visual: "Oats are soft and the mix is creamy, not watery" },
      { instruction: "Sweeten with maple syrup and top with the rest of the apple", measure: "1 tbsp maple syrup", visual: "Oatmeal falls off the spoon slowly in thick ribbons" },
    ],
  },
  ...WORLD.recipes,
];

const PL = {
  recipeReady: {
    one: { en: "recipe ready to cook", es: "receta lista para cocinar", fr: "recette prête à cuisiner", pt: "receita pronta para cozinhar", hi: "पकाने के लिए तैयार रेसिपी", zh: "道菜谱可以做了", ar: "وصفة جاهزة للطهي" },
    other: { en: "recipes ready to cook", es: "recetas listas para cocinar", fr: "recettes prêtes à cuisiner", pt: "receitas prontas para cozinhar", hi: "पकाने के लिए तैयार रेसिपीज़", zh: "道菜谱可以做了", ar: "وصفات جاهزة للطهي" },
  },
  ingredient: {
    one: { en: "ingredient", es: "ingrediente", fr: "ingrédient", pt: "ingrediente", hi: "सामग्री", zh: "种食材", ar: "مكوّن" },
    other: { en: "ingredients", es: "ingredientes", fr: "ingrédients", pt: "ingredientes", hi: "सामग्री", zh: "种食材", ar: "مكوّنات" },
  },
  savedRecipe: {
    one: { en: "saved recipe", es: "receta guardada", fr: "recette enregistrée", pt: "receita salva", hi: "सहेजी गई रेसिपी", zh: "个已收藏菜谱", ar: "وصفة محفوظة" },
    other: { en: "saved recipes", es: "recetas guardadas", fr: "recettes enregistrées", pt: "receitas salvas", hi: "सहेजी गई रेसिपीज़", zh: "个已收藏菜谱", ar: "وصفات محفوظة" },
  },
  listItem: {
    one: { en: "item on your list", es: "artículo en tu lista", fr: "article sur votre liste", pt: "item na sua lista", hi: "आपकी सूची में आइटम", zh: "项清单物品", ar: "عنصر في قائمتك" },
    other: { en: "items on your list", es: "artículos en tu lista", fr: "articles sur votre liste", pt: "itens na sua lista", hi: "आपकी सूची में आइटम", zh: "项清单物品", ar: "عناصر في قائمتك" },
  },
};

const NUTRITION_FACTS = {
  egg: { qty: "1 large egg", calories: 70, protein: 6, carbs: 0.5, fat: 5 },
  eggs: { qty: "1 large egg", calories: 70, protein: 6, carbs: 0.5, fat: 5 },
  "chicken breast": { qty: "100g cooked chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "chicken thigh": { qty: "100g cooked chicken thigh", calories: 209, protein: 26, carbs: 0, fat: 11 },
  "chicken thighs": { qty: "100g cooked chicken thigh", calories: 209, protein: 26, carbs: 0, fat: 11 },
  banana: { qty: "1 medium banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  rice: { qty: "1 cup cooked white rice", calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  "brown rice": { qty: "1 cup cooked brown rice", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  pasta: { qty: "1 cup cooked pasta", calories: 220, protein: 8, carbs: 43, fat: 1.3 },
  avocado: { qty: "1 medium avocado", calories: 240, protein: 3, carbs: 12, fat: 22 },
  milk: { qty: "1 cup whole milk", calories: 150, protein: 8, carbs: 12, fat: 8 },
  "greek yogurt": { qty: "1 cup plain greek yogurt", calories: 220, protein: 20, carbs: 9, fat: 11 },
  yogurt: { qty: "1 cup plain yogurt", calories: 150, protein: 8, carbs: 17, fat: 8 },
  bread: { qty: "1 slice white bread", calories: 80, protein: 3, carbs: 15, fat: 1 },
  "whole wheat bread": { qty: "1 slice whole wheat bread", calories: 80, protein: 4, carbs: 14, fat: 1 },
  cheese: { qty: "1 oz cheddar cheese", calories: 115, protein: 7, carbs: 0.4, fat: 9 },
  mozzarella: { qty: "1 oz mozzarella", calories: 85, protein: 6, carbs: 0.6, fat: 6.3 },
  "cottage cheese": { qty: "1 cup cottage cheese", calories: 220, protein: 25, carbs: 8, fat: 9.5 },
  butter: { qty: "1 tbsp butter", calories: 100, protein: 0, carbs: 0, fat: 11 },
  "olive oil": { qty: "1 tbsp olive oil", calories: 120, protein: 0, carbs: 0, fat: 14 },
  "peanut butter": { qty: "2 tbsp peanut butter", calories: 190, protein: 8, carbs: 6, fat: 16 },
  salmon: { qty: "100g cooked salmon", calories: 208, protein: 20, carbs: 0, fat: 13 },
  tuna: { qty: "100g canned tuna in water", calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  "canned tuna": { qty: "100g canned tuna in water", calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  shrimp: { qty: "100g cooked shrimp", calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  cod: { qty: "100g cooked cod", calories: 105, protein: 23, carbs: 0, fat: 0.9 },
  "ground beef": { qty: "100g cooked 80/20 ground beef", calories: 254, protein: 17, carbs: 0, fat: 20 },
  beef: { qty: "100g cooked lean beef", calories: 217, protein: 26, carbs: 0, fat: 12 },
  steak: { qty: "100g cooked sirloin steak", calories: 206, protein: 29, carbs: 0, fat: 9 },
  "ground turkey": { qty: "100g cooked ground turkey", calories: 189, protein: 27, carbs: 0, fat: 8 },
  turkey: { qty: "100g cooked turkey breast", calories: 135, protein: 30, carbs: 0, fat: 1 },
  bacon: { qty: "2 slices cooked bacon", calories: 90, protein: 6, carbs: 0.3, fat: 7 },
  ham: { qty: "100g sliced ham", calories: 145, protein: 21, carbs: 1.5, fat: 6 },
  sausage: { qty: "1 cooked pork sausage link", calories: 165, protein: 9, carbs: 1, fat: 14 },
  tofu: { qty: "100g tofu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  "black beans": { qty: "1 cup cooked black beans", calories: 227, protein: 15, carbs: 41, fat: 0.9 },
  "kidney beans": { qty: "1 cup cooked kidney beans", calories: 225, protein: 15, carbs: 40, fat: 0.9 },
  chickpeas: { qty: "1 cup cooked chickpeas", calories: 269, protein: 14.5, carbs: 45, fat: 4.25 },
  lentils: { qty: "1 cup cooked lentils", calories: 230, protein: 18, carbs: 40, fat: 0.8 },
  "red lentils": { qty: "1 cup cooked red lentils", calories: 230, protein: 18, carbs: 40, fat: 0.8 },
  oats: { qty: "1 cup cooked oats", calories: 166, protein: 6, carbs: 28, fat: 3.6 },
  quinoa: { qty: "1 cup cooked quinoa", calories: 222, protein: 8, carbs: 39, fat: 3.6 },
  "sweet potato": { qty: "1 medium baked sweet potato", calories: 103, protein: 2.3, carbs: 24, fat: 0.2 },
  potato: { qty: "1 medium baked potato", calories: 161, protein: 4.3, carbs: 37, fat: 0.2 },
  broccoli: { qty: "1 cup cooked broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  spinach: { qty: "1 cup cooked spinach", calories: 41, protein: 5.3, carbs: 6.8, fat: 0.5 },
  carrot: { qty: "1 medium carrot", calories: 25, protein: 0.6, carbs: 6, fat: 0.1 },
  cucumber: { qty: "1 cup sliced cucumber", calories: 16, protein: 0.7, carbs: 3.8, fat: 0.1 },
  tomato: { qty: "1 medium tomato", calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2 },
  "bell pepper": { qty: "1 medium bell pepper", calories: 24, protein: 1, carbs: 6, fat: 0.2 },
  corn: { qty: "1 cup corn kernels", calories: 132, protein: 5, carbs: 29, fat: 1.8 },
  mushrooms: { qty: "1 cup sliced mushrooms", calories: 15, protein: 2.2, carbs: 2.3, fat: 0.2 },
  zucchini: { qty: "1 cup sliced zucchini", calories: 20, protein: 1.5, carbs: 3.9, fat: 0.2 },
  cauliflower: { qty: "1 cup cauliflower", calories: 27, protein: 2, carbs: 5, fat: 0.3 },
  onion: { qty: "1 medium onion", calories: 44, protein: 1.2, carbs: 10, fat: 0.1 },
  garlic: { qty: "1 clove garlic", calories: 4, protein: 0.2, carbs: 1, fat: 0 },
  almonds: { qty: "1 oz almonds (about 23)", calories: 164, protein: 6, carbs: 6, fat: 14 },
  walnuts: { qty: "1 oz walnuts", calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5 },
  cashews: { qty: "1 oz cashews", calories: 157, protein: 5.2, carbs: 8.6, fat: 12.4 },
  peanuts: { qty: "1 oz peanuts", calories: 161, protein: 7, carbs: 4.5, fat: 14 },
  "chia seeds": { qty: "1 tbsp chia seeds", calories: 60, protein: 2, carbs: 5, fat: 3 },
  honey: { qty: "1 tbsp honey", calories: 64, protein: 0, carbs: 17, fat: 0 },
  "maple syrup": { qty: "1 tbsp maple syrup", calories: 52, protein: 0, carbs: 13, fat: 0 },
  sugar: { qty: "1 tbsp sugar", calories: 48, protein: 0, carbs: 12, fat: 0 },
  apple: { qty: "1 medium apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  orange: { qty: "1 medium orange", calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  strawberries: { qty: "1 cup strawberries", calories: 49, protein: 1, carbs: 12, fat: 0.5 },
  blueberries: { qty: "1 cup blueberries", calories: 84, protein: 1.1, carbs: 21, fat: 0.5 },
  mango: { qty: "1 cup mango", calories: 99, protein: 1.4, carbs: 25, fat: 0.6 },
  tortilla: { qty: "1 flour tortilla (8in)", calories: 140, protein: 4, carbs: 24, fat: 3.5 },
  hummus: { qty: "2 tbsp hummus", calories: 70, protein: 2, carbs: 6, fat: 5 },
  "coconut milk": { qty: "1/2 cup canned coconut milk", calories: 223, protein: 2.3, carbs: 3.2, fat: 24 },
  "soy sauce": { qty: "1 tbsp soy sauce", calories: 9, protein: 1, carbs: 0.8, fat: 0 },
  mayo: { qty: "1 tbsp mayonnaise", calories: 94, protein: 0.1, carbs: 0.1, fat: 10 },
};

// Cooking terms explained in plain language when someone asks "what is X" or "what does X mean".
function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={styles.tabButton}>
      <Icon size={20} color={active ? COLORS.primary : COLORS.inkMuted} strokeWidth={active ? 2.4 : 2} />
      <span style={{ ...styles.tabLabel, color: active ? COLORS.primaryText : COLORS.inkMuted, fontWeight: active ? 600 : 500 }}>{label}</span>
    </button>
  );
}

// Catches a crash in any screen and shows a way back instead of a blank page.
class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const { t, onHome } = this.props;
    return (
      <div style={styles.screenPad}>
        <h1 style={styles.h1}>{t("errorTitle")}</h1>
        <p style={styles.subtext}>{t("errorBody")}</p>
        <button onClick={() => { this.setState({ failed: false }); onHome(); }} style={styles.primaryButton}>{t("errorGoHome")}</button>
      </div>
    );
  }
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [profile, setProfile] = useState({ name: "", age: "", height: "", weight: "", weightGoal: "", cookingGoal: "", activityLevel: "" });
  const [language, setLanguage] = useState(() => {
    const supported = LANGUAGES.map((l) => l.id);
    let picked = null;
    try { picked = window.localStorage.getItem("mysous:lang"); } catch { /* storage blocked */ }
    if (supported.includes(picked)) return picked;
    const nav = (typeof navigator !== "undefined" && (navigator.language || "")).slice(0, 2).toLowerCase();
    return supported.includes(nav) ? nav : "en";
  });
  useEffect(() => { try { window.localStorage.setItem("mysous:lang", language); } catch { /* storage blocked */ } }, [language]);
  function t(key) {
    return TRANSLATIONS[key]?.[language] ?? TRANSLATIONS[key]?.en ?? key;
  }
  function changeLanguage(lang) {
    setLanguage(lang);
    setProfile((prev) => ({ ...prev, language: lang }));
  }
  const [screen, setScreen] = useState("kitchen");
  const [prevScreen, setPrevScreen] = useState("kitchen");
  const [ingredients, setIngredients] = useState([
    { name: "eggs", quantity: "", expiration: "" },
    { name: "pasta", quantity: "", expiration: "" },
    { name: "garlic", quantity: "", expiration: "" },
    { name: "bread", quantity: "", expiration: "" },
    { name: "cheese", quantity: "", expiration: "" },
  ]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [expirationInput, setExpirationInput] = useState("");
  const [equipment, setEquipment] = useState({ stove: true, pan: true, pot: true, microwave: true, oven: false, fridge: true });
  const [equipmentList, setEquipmentList] = useState(EQUIPMENT);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [basics, setBasics] = useState({ salt: true, pepper: true, oil: true, butter: true });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMealTimes, setSelectedMealTimes] = useState([]);
  const [cuisines, setCuisines] = useState(CUISINES);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [filterMatch, setFilterMatch] = useState({ categories: "any", cuisines: "any" });
  const [cuisineInput, setCuisineInput] = useState("");
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [servings, setServings] = useState(2);
  const [userRecipes, setUserRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingInput, setShoppingInput] = useState("");
  const community = useCommunity();
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);

  // Load everything persisted from a previous session. Each key bundles
  // together data that's naturally updated at the same time, per the
  // storage API's own guidance, rather than one key per field. A failed
  // read just means "nothing saved yet" (or storage is unavailable) — the
  // app falls back to its normal in-memory defaults either way.
  useEffect(() => {
    let cancelled = false;
    async function loadPersisted() {
      const safeGet = async (key, shared) => {
        try {
          const res = await window.storage.get(key, shared);
          return res?.value ? JSON.parse(res.value) : null;
        } catch {
          return null;
        }
      };
      const [profileData, kitchenData, recipeData, shoppingData] = await Promise.all([
        safeGet("sous_profile"),
        safeGet("sous_kitchen"),
        safeGet("sous_recipes"),
        safeGet("sous_shopping"),
      ]);
      if (cancelled) return;
      if (profileData) {
        if (profileData.onboarded !== undefined) setOnboarded(profileData.onboarded);
        if (profileData.profile) setProfile(profileData.profile);
        if (profileData.language) setLanguage(LANGUAGES.some((l) => l.id === profileData.language) ? profileData.language : "en");
      }
      if (kitchenData) {
        if (kitchenData.ingredients) setIngredients(kitchenData.ingredients);
        if (kitchenData.equipment) setEquipment(kitchenData.equipment);
        if (kitchenData.equipmentList) setEquipmentList(kitchenData.equipmentList);
        if (kitchenData.basics) setBasics(kitchenData.basics);
      }
      if (recipeData) {
        if (recipeData.userRecipes) setUserRecipes(recipeData.userRecipes);
        if (recipeData.favorites) setFavorites(recipeData.favorites);
        if (recipeData.history) {
          // Drop the old built-in sample entry and give older entries a unique id.
          const isOldSample = (h) => h.id === "grilled-cheese" && h.when === "3 days ago" && h.rating === 5 && !h.note && !h.uid;
          setHistory(recipeData.history.filter((h) => !isOldSample(h)).map((h, i) => (h.uid ? h : { ...h, uid: `${h.id}-legacy-${i}` })));
        }
        if (recipeData.selectedCategories) setSelectedCategories(recipeData.selectedCategories);
        if (recipeData.filterMatch) setFilterMatch((f) => ({ ...f, ...recipeData.filterMatch }));
      }
      if (shoppingData?.shoppingList) setShoppingList(shoppingData.shoppingList);
      setStorageLoaded(true);
    }
    loadPersisted().catch(() => {
      if (!cancelled) {
        setStorageError(true);
        setStorageLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Save on every change, once the initial load has finished — guarding on
  // storageLoaded stops the very first render (still holding default state)
  // from overwriting a real saved session before it's even been read.
  useEffect(() => {
    if (!storageLoaded) return;
    window.storage.set("sous_profile", JSON.stringify({ onboarded, profile, language })).catch(() => {});
  }, [storageLoaded, onboarded, profile, language]);

  useEffect(() => {
    if (!storageLoaded) return;
    window.storage.set("sous_kitchen", JSON.stringify({ ingredients, equipment, equipmentList, basics })).catch(() => {});
  }, [storageLoaded, ingredients, equipment, equipmentList, basics]);

  useEffect(() => {
    if (!storageLoaded) return;
    window.storage.set("sous_recipes", JSON.stringify({ userRecipes, favorites, history, selectedCategories, filterMatch })).catch(() => {});
  }, [storageLoaded, userRecipes, favorites, history, selectedCategories, filterMatch]);

  useEffect(() => {
    if (!storageLoaded) return;
    window.storage.set("sous_shopping", JSON.stringify({ shoppingList })).catch(() => {});
  }, [storageLoaded, shoppingList]);


  function addIngredient() {
    const typed = ingredientInput.trim().toLowerCase();
    const val = resolveIngredientCanonical(typed) || typed;
    const alreadyHave = ingredients.some((i) => normalizeIngredient(i.name) === normalizeIngredient(val));
    if (val && !alreadyHave) {
      setIngredients([...ingredients, { name: val, quantity: quantityInput.trim(), expiration: expirationInput, brand: brandInput.trim() }]);
    }
    setIngredientInput("");
    setQuantityInput("");
    setExpirationInput("");
    setBrandInput("");
  }

  function removeIngredient(name) {
    setIngredients(ingredients.filter((i) => i.name !== name));
  }

  function toggleEquipment(id) {
    setEquipment({ ...equipment, [id]: !equipment[id] });
  }

  function addCustomEquipment() {
    const label = equipmentInput.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "-");
    if (!equipmentList.some((e) => e.id === id)) {
      setEquipmentList((prev) => [...prev, { id, label }]);
    }
    setEquipment((prev) => ({ ...prev, [id]: true }));
    setEquipmentInput("");
  }

  function toggleBasic(id) {
    setBasics({ ...basics, [id]: !basics[id] });
  }

  function toggleCategory(id) {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  function toggleMealTime(id) {
    setSelectedMealTimes((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  function toggleCuisine(id) {
    setSelectedCuisines((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  function addCuisine() {
    const label = cuisineInput.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "-");
    if (!cuisines.some((c) => c.id === id)) setCuisines([...cuisines, { id, label }]);
    setSelectedCuisines((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCuisineInput("");
  }

  function matchInfo(recipe) {
    const haveEquip = recipe.equipment.every((e) => equipment[e]);
    const missingEquipment = recipe.equipment.filter((e) => !equipment[e]);
    const ownedNormalized = new Set(ingredients.map((i) => normalizeIngredient(i.name)));
    const hasAnyOil = !!basics.oil || ingredients.some((i) => isOil(i.name));
    const missingIngredients = recipe.ingredients.filter((i) =>
      isOil(i) ? !hasAnyOil : BASIC_IDS.includes(i) ? !basics[i] : !ownedNormalized.has(normalizeIngredient(i))
    );
    return { haveEquip, missingEquipment, missingIngredients, makeable: haveEquip && missingIngredients.length === 0 };
  }

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { note: "" };
      return next;
    });
  }

  function setFavoriteNote(id, note) {
    setFavorites((prev) => ({ ...prev, [id]: { ...prev[id], note } }));
  }

  function addShoppingItem(name) {
    const typed = name.trim().toLowerCase();
    const val = resolveIngredientCanonical(typed) || typed;
    if (!val || shoppingList.some((s) => normalizeIngredient(s.name) === normalizeIngredient(val))) return;
    setShoppingList((prev) => [...prev, { id: `${val}-${Date.now()}`, name: val, checked: false }]);
    setShoppingInput("");
  }

  function toggleShoppingItem(id) {
    setShoppingList((prev) => prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)));
  }

  function removeShoppingItem(id) {
    setShoppingList((prev) => prev.filter((s) => s.id !== id));
  }

  function addCheckedToKitchen() {
    const checked = shoppingList.filter((s) => s.checked);
    if (checked.length === 0) return;
    const newOnes = checked
      .filter((c) => !ingredients.some((i) => normalizeIngredient(i.name) === normalizeIngredient(c.name)))
      .map((c) => ({ name: c.name, quantity: "", expiration: "" }));
    setIngredients((prev) => [...prev, ...newOnes]);
    setShoppingList((prev) => prev.filter((s) => !s.checked));
    setToast(t("toastAddedKitchen"));
    setTimeout(() => setToast(null), 1800);
  }

  function saveSharedRecipe(shared) {
    const clean = {
      name: String(shared.name || "").slice(0, 120) || "Recipe",
      emoji: String(shared.emoji || "🍽️").slice(0, 8),
      time: String(shared.time || "").slice(0, 40),
      cuisine: String(shared.cuisine || "american"),
      categories: Array.isArray(shared.categories) ? shared.categories.map(String).slice(0, 12) : [],
      mealTime: Array.isArray(shared.mealTime) ? shared.mealTime.map(String).slice(0, 6) : [],
      equipment: Array.isArray(shared.equipment) ? shared.equipment.map(String).slice(0, 12) : [],
      ingredients: Array.isArray(shared.ingredients) ? shared.ingredients.map(String).slice(0, 40) : [],
      steps: Array.isArray(shared.steps) ? shared.steps.slice(0, 40).map((st) => ({ instruction: String(st?.instruction || ""), measure: String(st?.measure || ""), visual: String(st?.visual || "") })) : [],
      flavorBoosts: Array.isArray(shared.flavorBoosts) ? shared.flavorBoosts.map(String).slice(0, 12) : [],
      macros: { calories: Number(shared.macros?.calories) || 0, protein: Number(shared.macros?.protein) || 0, carbs: Number(shared.macros?.carbs) || 0, fat: Number(shared.macros?.fat) || 0 },
      color: DEFAULT_RECIPE_COLOR,
    };
    setUserRecipes((prev) => [...prev, { ...clean, id: `shared-${Date.now()}`, isUserRecipe: true }]);
    setToast(t("toastSavedCookbook"));
    setTimeout(() => setToast(null), 2000);
  }

  function rateRecipe(recipeId, stars) {
    community.rate(recipeId, stars);
  }

  function updateHistoryNote(uid, note) {
    setHistory((prev) => prev.map((h) => (h.uid === uid ? { ...h, note } : h)));
  }

  function startGuided(recipe) {
    setActiveRecipe(recipe);
    setStepIndex(0);
    setServings(2);
    setScreen("guided");
  }

  const allRecipes = [...RECIPES, ...userRecipes];

  function openCreateRecipe() {
    setEditingRecipe(null);
    setPrevScreen(screen);
    setScreen("createRecipe");
  }

  function openEditRecipe(recipe) {
    setEditingRecipe(recipe);
    setPrevScreen(screen);
    setScreen("createRecipe");
  }

  function saveUserRecipe(data) {
    if (editingRecipe && editingRecipe.isUserRecipe) {
      // Editing a recipe the user already created themselves — update it in place.
      setUserRecipes((prev) => prev.map((r) => (r.id === editingRecipe.id ? { ...data, id: editingRecipe.id, isUserRecipe: true } : r)));
    } else if (editingRecipe) {
      // Editing a built-in My Sous recipe — never mutate the original, save a personal twist instead.
      const newId = `remix-${editingRecipe.id}-${Date.now()}`;
      setUserRecipes((prev) => [...prev, { ...data, id: newId, isUserRecipe: true, remixOf: editingRecipe.id, remixOfName: editingRecipe.name }]);
    } else {
      const newId = `user-${Date.now()}`;
      setUserRecipes((prev) => [...prev, { ...data, id: newId, isUserRecipe: true }]);
    }
    setEditingRecipe(null);
    setToast(t("toastSavedCookbook"));
    setTimeout(() => setToast(null), 2000);
    setScreen("cookbook");
  }

  function deleteUserRecipe(id) {
    setUserRecipes((prev) => prev.filter((r) => r.id !== id));
    setFavorites((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function shareRecipeToCommunity(recipe) {
    if (!community.canWrite) { setToast(t(community.canSignIn ? "communitySignIn" : "communityReadOnlyShort")); setTimeout(() => setToast(null), 2600); return; }
    const { name, emoji, time, cuisine, categories, mealTime, equipment, ingredients, steps, flavorBoosts, macros } = recipe;
    const ok = await community.addPost({ kind: "recipe", text: recipe.authorNote ? String(recipe.authorNote).slice(0, 2000) : "", recipe: { name: recipeName(recipe, language) || name, emoji, time, cuisine, categories, mealTime, equipment, ingredients, steps, flavorBoosts, macros } });
    setToast(t(ok ? "toastSharedCommunity" : "saveFailed"));
    setTimeout(() => setToast(null), 1800);
  }

  function nextStep() {
    if (stepIndex < activeRecipe.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setScreen("complete");
    }
  }

  function prevStep() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function finishMeal(rating = 0) {
    const at = Date.now();
    setHistory([{ uid: `${activeRecipe.id}-${at}`, id: activeRecipe.id, name: activeRecipe.name, rating, at, note: "" }, ...history]);
    if (rating) rateRecipe(activeRecipe.id, rating);
    setToast(`${recipeName(activeRecipe, language)} ${t("toastAddedHistory")}`);
    setTimeout(() => setToast(null), 2200);
    setPrevScreen("cook"); // Back from History returns to Cook after a meal
    setScreen("history");
    setActiveRecipe(null);
  }

  function rateHistory(uid, rating) {
    const entry = history.find((h) => h.uid === uid);
    setHistory((prev) => prev.map((h) => (h.uid === uid ? { ...h, rating } : h)));
    if (entry && rating) rateRecipe(entry.id, rating);
  }

  function finishOnboarding(data) {
    setProfile(data);
    const presets = { "cant-cook": ["beginner-friendly"], "just-ideas": ["quick-easy"] };
    setSelectedCategories(presets[data.cookingGoal] || []);
    setOnboarded(true);
  }

  function updateProfile(data) {
    setProfile(data);
    setToast(t("toastProfileUpdated"));
    setTimeout(() => setToast(null), 1800);
    setScreen(prevScreen);
  }

  function resetKitchen() {
    setIngredients([]);
    setToast(t("toastKitchenCleared"));
    setTimeout(() => setToast(null), 1800);
  }

  function openSettings() {
    setPrevScreen(screen);
    setScreen("settings");
  }

  function openSub(name) {
    setPrevScreen("more");
    setScreen(name);
  }

  // Phone frame vs. full-width desktop layout. Remembered per browser.
  const [appearance, setAppearanceState] = useState(loadAppearance);
  const appearanceRef = useRef(appearance);
  appearanceRef.current = appearance;
  useEffect(() => { injectAppearanceCss(); applyAppearance(appearanceRef.current); return watchSystemTheme(() => appearanceRef.current); }, []);
  function updateAppearance(patch) {
    setAppearanceState((a) => { const next = { ...a, ...patch }; saveAppearance(next); return next; });
  }
  const isDark = resolvedTheme(appearance) === "dark";
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = window.localStorage.getItem("mysous:view");
      if (saved === "phone" || saved === "desktop") return saved;
    } catch {}
    return typeof window !== "undefined" && window.innerWidth >= 900 ? "desktop" : "phone";
  });
  function changeViewMode(mode) {
    setViewMode(mode);
    try { window.localStorage.setItem("mysous:view", mode); } catch {}
  }
  const isDesktop = viewMode === "desktop";
  const outerStyle = isDesktop ? { ...styles.outer, padding: "20px 20px" } : styles.outer;
  const frameStyle = isDesktop ? { ...styles.phone, ...styles.desktopFrame } : styles.phone;
  const viewToggle = (
    <div style={styles.viewToggle} role="group" aria-label="View">
      <button onClick={() => changeViewMode("phone")} aria-pressed={!isDesktop} title={t("viewPhone")} style={{ ...styles.viewToggleBtn, ...(!isDesktop ? styles.viewToggleBtnActive : {}) }}>
        <Smartphone size={14} color={!isDesktop ? COLORS.ink : COLORS.inkMuted} />
        <span style={styles.viewToggleLabel}>{t("viewPhone")}</span>
      </button>
      <button onClick={() => changeViewMode("desktop")} aria-pressed={isDesktop} title={t("viewDesktop")} style={{ ...styles.viewToggleBtn, ...(isDesktop ? styles.viewToggleBtnActive : {}) }}>
        <Monitor size={14} color={isDesktop ? COLORS.ink : COLORS.inkMuted} />
        <span style={styles.viewToggleLabel}>{t("viewDesktop")}</span>
      </button>
    </div>
  );

  if (!storageLoaded) {
    return (
      <LanguageContext.Provider value={{ language, t }}>
      <div style={outerStyle} className={isDesktop ? "ms-root ms-desktop" : "ms-root ms-phone"} dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
        <style>{FONT_IMPORT}</style>
        <div style={frameStyle}>
          <div className="ms-header" style={styles.statusRow}>
            <span style={styles.brand}>My&nbsp;Sous</span>
            <span style={styles.brandSub}>prototype</span>
          </div>
          <div style={{ ...styles.screenArea, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: COLORS.inkMuted, fontSize: 13 }}>{t("loadingKitchen")}</span>
          </div>
        </div>
      </div>
      </LanguageContext.Provider>
    );
  }

  if (!onboarded) {
    return (
      <LanguageContext.Provider value={{ language, t }}>
      <div style={outerStyle} className={isDesktop ? "ms-root ms-desktop" : "ms-root ms-phone"} dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
        <style>{FONT_IMPORT}</style>
        <div style={frameStyle}>
          <div className="ms-header" style={styles.statusRow}>
            <span style={styles.brand}>My&nbsp;Sous</span>
            <span style={styles.brandSub}>prototype</span>
            {viewToggle}
          </div>
          <div style={styles.screenArea}>
            <OnboardingScreen onComplete={finishOnboarding} onChangeLanguage={setLanguage} />
          </div>
        </div>
      </div>
      </LanguageContext.Provider>
    );
  }

  const MAIN_TABS = ["home", "kitchen", "cook", "more"];
  const hideChrome = screen === "guided" || screen === "complete";
  const showTabBar = !hideChrome && MAIN_TABS.includes(screen);
  const showGear = !hideChrome && MAIN_TABS.includes(screen) && screen !== "settings";

  return (
    <LanguageContext.Provider value={{ language, t }}>
    <CommunityContext.Provider value={{ ratingFor: community.ratingFor, myRating: community.myRating, rate: community.rate }}>
    <div style={outerStyle} className={isDesktop ? "ms-root ms-desktop" : "ms-root ms-phone"} dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <style>{FONT_IMPORT}</style>
      <a href="#ms-main" className="ms-skip" onClick={(e) => { e.preventDefault(); const m = document.getElementById("ms-main"); if (m) { m.setAttribute("tabindex", "-1"); m.focus(); } }}>{t("skipToContent")}</a>
      <div style={frameStyle}>
        <div className="ms-header" style={styles.statusRow}>
          <span style={styles.brand}>My&nbsp;Sous</span>
          <span style={styles.brandSub}>prototype</span>
          {viewToggle}
          <button onClick={() => updateAppearance({ theme: isDark ? "light" : "dark" })} aria-label={t(isDark ? "themeLight" : "themeDark")} title={t(isDark ? "themeLight" : "themeDark")} style={styles.settingsButton}>
            {isDark ? <Sun size={17} color={COLORS.inkMuted} /> : <Moon size={17} color={COLORS.inkMuted} />}
          </button>
          {showGear && (
            <button onClick={openSettings} style={styles.settingsButton}>
              <SettingsIcon size={18} color={COLORS.inkMuted} />
            </button>
          )}
        </div>

        <div style={styles.screenArea} className="ms-screen" id="ms-main" role="main">
          <ScreenErrorBoundary t={t} resetKey={screen} onHome={() => { setActiveRecipe(null); setScreen("home"); }}>
          {screen === "home" && (
            <HomeScreen
              profile={profile}
              ingredients={ingredients}
              equipment={equipment}
              recipes={allRecipes}
              matchInfo={matchInfo}
              history={history}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onOpenRecipe={startGuided}
              onGoCook={() => setScreen("cook")}
              onGoKitchen={() => setScreen("kitchen")}
            />
          )}
          {screen === "kitchen" && (
            <KitchenScreen
              profile={profile}
              ingredients={ingredients}
              ingredientInput={ingredientInput}
              setIngredientInput={setIngredientInput}
              quantityInput={quantityInput}
              setQuantityInput={setQuantityInput}
              expirationInput={expirationInput}
              setExpirationInput={setExpirationInput}
              brandInput={brandInput}
              setBrandInput={setBrandInput}
              addIngredient={addIngredient}
              removeIngredient={removeIngredient}
              equipment={equipment}
              toggleEquipment={toggleEquipment}
              equipmentList={equipmentList}
              equipmentInput={equipmentInput}
              setEquipmentInput={setEquipmentInput}
              addCustomEquipment={addCustomEquipment}
              basics={basics}
              toggleBasic={toggleBasic}
              readyCount={allRecipes.filter((r) => matchInfo(r).makeable).length}
              onGoCook={() => setScreen("cook")}
            />
          )}
          {screen === "cook" && (
            <CookScreen
              recipes={allRecipes}
              kitchenIngredients={ingredients}
              matchInfo={matchInfo}
              onOpen={startGuided}
              onEdit={openEditRecipe}
              selectedMealTimes={selectedMealTimes}
              toggleMealTime={toggleMealTime}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              cuisines={cuisines}
              selectedCuisines={selectedCuisines}
              toggleCuisine={toggleCuisine}
              filterMatch={filterMatch}
              setFilterMatch={setFilterMatch}
              clearFilters={() => { setSelectedMealTimes([]); setSelectedCategories([]); setSelectedCuisines([]); }}
              cuisineInput={cuisineInput}
              setCuisineInput={setCuisineInput}
              addCuisine={addCuisine}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          )}
          {screen === "guided" && activeRecipe && (
            <GuidedScreen
              recipe={activeRecipe}
              stepIndex={stepIndex}
              onNext={nextStep}
              onPrev={prevStep}
              servings={servings}
              setServings={setServings}
              onBack={() => { setScreen("cook"); setActiveRecipe(null); }}
            />
          )}
          {screen === "complete" && activeRecipe && <CompleteScreen recipe={activeRecipe} servings={servings} onDone={finishMeal} />}
          {screen === "more" && (
            <MoreScreen
              onOpen={openSub}
              onOpenSettings={openSettings}
              favoritesCount={Object.keys(favorites).length}
              shoppingCount={shoppingList.length}
              recipes={allRecipes}
              onOpenRecipe={(r) => { setPrevScreen("more"); startGuided(r); }}
            />
          )}
          {screen === "history" && (
            <HistoryScreen recipes={allRecipes} history={history} onRate={rateHistory} onNote={updateHistoryNote} onBack={() => setScreen(prevScreen)} />
          )}
          {screen === "cookbook" && (
            <CookbookScreen
              recipes={RECIPES}
              userRecipes={userRecipes}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              setFavoriteNote={setFavoriteNote}
              onOpen={startGuided}
              onEdit={openEditRecipe}
              onDelete={deleteUserRecipe}
              onShare={shareRecipeToCommunity}
              onCreateNew={openCreateRecipe}
              onBack={() => setScreen(["cookbook", "createRecipe"].includes(prevScreen) ? "more" : prevScreen)}
            />
          )}
          {screen === "createRecipe" && (
            <CreateRecipeScreen
              editingRecipe={editingRecipe}
              cuisines={cuisines}
              equipmentList={equipmentList}
              onSave={saveUserRecipe}
              onBack={() => setScreen(prevScreen)}
            />
          )}
          {screen === "community" && (
            <CommunityScreen
              community={community}
              recipes={allRecipes}
              onOpenRecipe={(r) => { setPrevScreen("community"); startGuided(r); }}
              onSaveSharedRecipe={saveSharedRecipe}
              onBack={() => setScreen(prevScreen === "community" ? "more" : prevScreen)}
            />
          )}
          {screen === "shopping" && (
            <ShoppingScreen
              recipes={allRecipes}
              matchInfo={matchInfo}
              shoppingList={shoppingList}
              input={shoppingInput}
              setInput={setShoppingInput}
              onAdd={addShoppingItem}
              onToggle={toggleShoppingItem}
              onRemove={removeShoppingItem}
              onAddToKitchen={addCheckedToKitchen}
              equipment={equipment}
              equipmentList={equipmentList}
              onBack={() => setScreen(prevScreen)}
            />
          )}
          {screen === "glossary" && (
            <NutritionGlossaryScreen onBack={() => setScreen(prevScreen)} />
          )}
          {screen === "settings" && (
            <SettingsScreen
              profile={profile}
              onSave={updateProfile}
              onChangeLanguage={changeLanguage}
              onBack={() => setScreen(prevScreen)}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              onResetKitchen={resetKitchen}
              appearance={appearance}
              onAppearance={updateAppearance}
            />
          )}
          </ScreenErrorBoundary>
        </div>

        {toast && <div style={styles.toast}>{toast}</div>}

        {showTabBar && (
          <div className="ms-tabbar" style={isDesktop ? { ...styles.tabBar, ...styles.tabBarDesktop } : styles.tabBar}>
            <TabButton active={screen === "home"} onClick={() => setScreen("home")} icon={HomeIcon} label={t("home")} />
            <TabButton active={screen === "kitchen"} onClick={() => setScreen("kitchen")} icon={Refrigerator} label={t("kitchen")} />
            <TabButton active={screen === "cook"} onClick={() => setScreen("cook")} icon={ChefHat} label={t("cook")} />
            <TabButton active={screen === "more"} onClick={() => setScreen("more")} icon={Users} label={t("more")} />
          </div>
        )}
      </div>
    </div>
    </CommunityContext.Provider>
    </LanguageContext.Provider>
  );
}

function UnitToggle({ options, value, onChange }) {
  return (
    <div style={styles.unitToggle}>
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} style={{ ...styles.unitToggleBtn, ...(value === opt ? styles.unitToggleBtnActive : {}) }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProfileFields({
  name, setName, age, setAge,
  heightUnit, setHeightUnit, height, setHeight, heightFt, setHeightFt, heightIn, setHeightIn,
  weightUnit, setWeightUnit, weight, setWeight,
  cookingGoal, setCookingGoal,
}) {
  const { t, language } = useContext(LanguageContext);
  return (
    <>
      <div style={styles.sectionLabel}>{t("nameLabel")}</div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} style={styles.textInput} />

      <div style={styles.rowPair}>
        <div style={{ flex: 1 }}>
          <div style={styles.sectionLabel}>{t("ageLabel")} ({t("optionalTag")})</div>
          <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="20" inputMode="numeric" style={styles.textInput} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
        <div style={styles.sectionLabel}>{t("heightLabel")} ({t("optionalTag")})</div>
        <UnitToggle options={["cm", "ft"]} value={heightUnit} onChange={setHeightUnit} />
      </div>
      {heightUnit === "cm" ? (
        <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" inputMode="numeric" style={styles.textInput} />
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" inputMode="numeric" style={{ ...styles.textInput, flex: 1 }} />
          <span style={{ alignSelf: "center", color: COLORS.inkMuted, fontSize: 13 }}>ft</span>
          <input value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="7" inputMode="numeric" style={{ ...styles.textInput, flex: 1 }} />
          <span style={{ alignSelf: "center", color: COLORS.inkMuted, fontSize: 13 }}>in</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
        <div style={styles.sectionLabel}>{t("weightLabel")} ({t("optionalTag")})</div>
        <UnitToggle options={["kg", "lb"]} value={weightUnit} onChange={setWeightUnit} />
      </div>
      <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={weightUnit === "kg" ? "65" : "143"} inputMode="numeric" style={styles.textInput} />

      <p style={{ ...styles.basicsHint, marginTop: 14 }}>{t("calorieDisclaimer")}</p>
      <div style={{ ...styles.communityNote, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span aria-hidden="true">🔒</span>
        <span>{t("privacyBodyNote")}</span>
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("cookingGoalLabel")} ({t("optionalTag")})</div>
      <div style={styles.chipWrap}>
        {COOKING_GOALS.map((g) => {
          const active = cookingGoal === g.id;
          return (
            <button key={g.id} onClick={() => setCookingGoal(active ? "" : g.id)} style={{ ...styles.equipChip, ...(active ? styles.equipChipActive : {}) }}>
              {g.emoji} {labelFor(COOKING_GOALS_TR, g.id, language)}
            </button>
          );
        })}
      </div>
    </>
  );
}

function OnboardingScreen({ onComplete, onChangeLanguage }) {
  const { t, language } = useContext(LanguageContext);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [weight, setWeight] = useState("");
  const [cookingGoal, setCookingGoal] = useState("");

  const profileData = { name, age, heightUnit, height, heightFt, heightIn, weightUnit, weight, cookingGoal };

  return (
    <div style={styles.screenPad}>
      <div style={styles.sectionLabel}>{t("chooseLanguage")}</div>
      <div style={styles.chipWrap}>
        {LANGUAGES.map((l) => (
          <button key={l.id} onClick={() => onChangeLanguage(l.id)} aria-pressed={language === l.id} style={{ ...styles.equipChip, ...(language === l.id ? styles.equipChipActive : {}) }}>{l.label}</button>
        ))}
      </div>
      <h1 style={{ ...styles.h1, marginTop: 22 }}>{t("welcomeTitle")}</h1>
      <p style={styles.subtext}>{t("welcomeSub")}</p>
      <ProfileFields
        name={name} setName={setName}
        age={age} setAge={setAge}
        heightUnit={heightUnit} setHeightUnit={setHeightUnit} height={height} setHeight={setHeight} heightFt={heightFt} setHeightFt={setHeightFt} heightIn={heightIn} setHeightIn={setHeightIn}
        weightUnit={weightUnit} setWeightUnit={setWeightUnit} weight={weight} setWeight={setWeight}
        cookingGoal={cookingGoal} setCookingGoal={setCookingGoal}
      />
      <button onClick={() => onComplete({ ...profileData, language })} style={styles.primaryButton}>
        {t("letsCook")}
      </button>
    </div>
  );
}

function SwitchRow({ label, sub, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: `1px solid ${COLORS.line}`, cursor: "pointer" }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ ...styles.recipeName, display: "block" }}>{label}</span>
        <span style={{ ...styles.recipeMeta, whiteSpace: "normal", display: "block", marginTop: 2 }}>{sub}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
      <span aria-hidden="true" style={{ width: 42, height: 24, borderRadius: 12, background: checked ? COLORS.primary : COLORS.line, position: "relative", flexShrink: 0, transition: "background .15s" }}>
        <span style={{ position: "absolute", top: 3, insetInlineStart: checked ? 21 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.25)", transition: "inset-inline-start .15s" }} />
      </span>
    </label>
  );
}

function SegmentRow({ label, options, value, onChange }) {
  return (
    <div style={{ padding: "12px 0", borderTop: `1px solid ${COLORS.line}` }}>
      <div style={{ ...styles.recipeName, marginBottom: 8 }}>{label}</div>
      <div role="radiogroup" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map((o) => (
          <button key={o.id} role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
            style={{ ...styles.equipChip, ...(value === o.id ? styles.equipChipActive : {}), gap: 6, ...(o.style || {}) }}>
            {o.icon}{o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AppearanceCard({ appearance: a, onChange }) {
  const { t } = useContext(LanguageContext);
  return (
    <>
      <div style={{ ...styles.sectionLabel, marginTop: 24 }}>{t("appearanceLabel")}</div>
      <div style={{ ...styles.historyCard, paddingTop: 2, paddingBottom: 2 }}>
        <SegmentRow label={t("themeLabel")} value={a.theme} onChange={(v) => onChange({ theme: v })} options={[
          { id: "light", label: t("themeLight"), icon: <Sun size={14} color={COLORS.inkMuted} /> },
          { id: "dark", label: t("themeDark"), icon: <Moon size={14} color={COLORS.inkMuted} /> },
          { id: "system", label: t("themeSystem"), icon: <Monitor size={14} color={COLORS.inkMuted} /> },
        ]} />
        <SegmentRow label={t("textSizeLabel")} value={a.textSize} onChange={(v) => onChange({ textSize: v })} options={[
          { id: "small", label: t("textSmall"), style: { fontSize: 12 } },
          { id: "default", label: t("textDefault"), style: { fontSize: 13 } },
          { id: "large", label: t("textLarge"), style: { fontSize: 15 } },
          { id: "xl", label: t("textXL"), style: { fontSize: 17 } },
        ]} />
        <SwitchRow label={t("readableFontLabel")} sub={t("readableFontSub")} checked={a.readableFont} onChange={(v) => onChange({ readableFont: v })} />
        <SwitchRow label={t("contrastLabel")} sub={t("contrastSub")} checked={a.highContrast} onChange={(v) => onChange({ highContrast: v })} />
        <SwitchRow label={t("reduceMotionLabel")} sub={t("reduceMotionSub")} checked={a.reduceMotion} onChange={(v) => onChange({ reduceMotion: v })} />
      </div>
    </>
  );
}

function PrivacyCard() {
  const { t } = useContext(LanguageContext);
  const cloud = typeof window !== "undefined" ? window.mysousCloud : null;
  const [step, setStep] = useState("idle"); // idle | confirm | deleting | error
  return (
    <>
      <div style={{ ...styles.sectionLabel, marginTop: 24 }}>{t("privacyLabel")}</div>
      <div style={styles.historyCard}>
        <ul style={{ margin: 0, paddingInlineStart: 18, color: COLORS.ink, fontSize: 13.5, lineHeight: 1.55 }}>
          <li>{t("privacyPoint1")}</li>
          <li>{t("privacyPoint2")}</li>
          <li>{t("privacyPoint3")}</li>
          <li>{t(cloud && cloud.signedIn ? "privacyPoint4Account" : "privacyPoint4Guest")}</li>
        </ul>
        {cloud && cloud.signedIn && (
          <div style={{ marginTop: 12 }}>
            {step === "confirm" ? (
              <div style={{ ...styles.communityNote, background: COLORS.accentSofter, color: COLORS.accentText, marginTop: 0 }}>
                <div>{t("deleteAccountConfirm")}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={async () => { setStep("deleting"); const ok = await cloud.deleteAccount(); if (!ok) setStep("error"); }}
                    style={{ ...styles.resetButton, marginTop: 0, background: COLORS.accentText, color: "#fff", borderColor: COLORS.accentText }}
                  >
                    {t("deleteAccountYes")}
                  </button>
                  <button onClick={() => setStep("idle")} style={{ ...styles.resetButton, marginTop: 0 }}>{t("cancelLabel")}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setStep("confirm")} disabled={step === "deleting"} style={{ ...styles.linkButton, color: COLORS.accentText, fontWeight: 600 }}>
                {step === "deleting" ? t("deletingLabel") : t("deleteAccountLabel")}
              </button>
            )}
            {step === "error" && <div style={{ ...styles.recipeMeta, color: COLORS.accentText, marginTop: 6 }}>{t("deleteAccountFailed")}</div>}
          </div>
        )}
      </div>
    </>
  );
}

function AccountCard() {
  const { t } = useContext(LanguageContext);
  const cloud = typeof window !== "undefined" ? window.mysousCloud : null;
  if (!cloud) return null;
  return (
    <>
      <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("accountLabel")}</div>
      <div style={{ ...styles.historyCard, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 180px", minWidth: 0 }}>
          <div style={{ ...styles.recipeName, overflowWrap: "anywhere" }} dir="ltr">{cloud.signedIn ? cloud.email : t("guestLabel")}</div>
          <div style={{ ...styles.recipeMeta, marginTop: 2 }}>{t(cloud.signedIn ? "accountSavedNote" : "guestSavedNote")}</div>
        </div>
        <button onClick={() => (cloud.signedIn ? cloud.signOut() : cloud.signIn())} style={{ ...styles.resetButton, marginTop: 0 }}>
          {t(cloud.signedIn ? "signOutLabel" : "signInLabel")}
        </button>
      </div>
    </>
  );
}

function SettingsScreen({ profile, onSave, onChangeLanguage, onBack, selectedCategories, toggleCategory, onResetKitchen, appearance, onAppearance }) {
  const { t: tr, language } = useContext(LanguageContext);
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [heightUnit, setHeightUnit] = useState(profile.heightUnit || "cm");
  const [height, setHeight] = useState(profile.height || "");
  const [heightFt, setHeightFt] = useState(profile.heightFt || "");
  const [heightIn, setHeightIn] = useState(profile.heightIn || "");
  const [weightUnit, setWeightUnit] = useState(profile.weightUnit || "kg");
  const [weight, setWeight] = useState(profile.weight || "");
  const [cookingGoal, setCookingGoal] = useState(profile.cookingGoal);
  const [formLanguage, setFormLanguage] = useState(profile.language || "en");
  const [cookingLevel, setCookingLevel] = useState(profile.cookingLevel || "beginner");

  function handleSaveProfile() {
    onSave({ name, age, heightUnit, height, heightFt, heightIn, weightUnit, weight, cookingGoal, language: formLanguage, cookingLevel });
  }

  function handleLanguageChange(lang) {
    setFormLanguage(lang);
    onChangeLanguage(lang);
  }

  return (
    <div style={styles.screenPad}>
      <button onClick={onBack} style={styles.backRow}>
        <ArrowLeft className="ms-flip" size={16} color={COLORS.inkMuted} />
        <span style={{ marginInlineStart: 6, color: COLORS.inkMuted, fontSize: 13 }}>{tr("backLabel")}</span>
      </button>
      <h1 style={{ ...styles.h1, marginTop: 6 }}>{tr("settingsTitle")}</h1>
      <AccountCard />

      <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{tr("profileLabel")}</div>
      <ProfileFields
        name={name} setName={setName}
        age={age} setAge={setAge}
        heightUnit={heightUnit} setHeightUnit={setHeightUnit} height={height} setHeight={setHeight} heightFt={heightFt} setHeightFt={setHeightFt} heightIn={heightIn} setHeightIn={setHeightIn}
        weightUnit={weightUnit} setWeightUnit={setWeightUnit} weight={weight} setWeight={setWeight}
        cookingGoal={cookingGoal} setCookingGoal={setCookingGoal}
      />

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{tr("accessibilityLabel")}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: COLORS.inkMuted, display: "flex", alignItems: "center" }}><Globe size={13} style={{ marginInlineEnd: 5 }} /> {tr("languageLabel")}</span>
      </div>
      <select value={formLanguage} onChange={(e) => handleLanguageChange(e.target.value)} style={{ ...styles.selectInput, marginTop: 8 }}>
        {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
      </select>

      <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{tr("cookingLevelLabel")}</div>
      <div style={styles.chipWrap}>
        {COOKING_LEVELS.map((c) => (
          <button key={c.id} onClick={() => setCookingLevel(c.id)} style={{ ...styles.equipChip, ...(cookingLevel === c.id ? styles.equipChipActive : {}) }}>
            {labelFor(COOKING_LEVELS_TR, c.id, language)}
          </button>
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{tr("dietaryPreference")}</div>
      <p style={styles.basicsHint}>{tr("dietaryHint")}</p>
      <div style={styles.chipWrap}>
        {DIETARY_QUICK.map((id) => {
          const cat = CATEGORIES.find((c) => c.id === id);
          if (!cat) return null;
          const active = selectedCategories.includes(id);
          return (
            <button key={id} onClick={() => toggleCategory(id)} style={{ ...styles.equipChip, ...(active ? styles.equipChipActive : {}) }}>
              {cat.emoji} {labelFor(CATEGORIES_TR, id, language)}
            </button>
          );
        })}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{tr("kitchenDataLabel")}</div>
      <button onClick={onResetKitchen} style={styles.resetButton}>
        <RotateCcw size={14} color={COLORS.inkMuted} style={{ marginInlineEnd: 6 }} />
        {tr("clearAllIngredients")}
      </button>

      <button onClick={handleSaveProfile} style={styles.primaryButton}>{tr("saveProfile")}</button>
      {appearance && <AppearanceCard appearance={appearance} onChange={onAppearance} />}
      <PrivacyCard />
    </div>
  );
}

function KitchenScreen({
  profile, ingredients, ingredientInput, setIngredientInput,
  quantityInput, setQuantityInput, expirationInput, setExpirationInput,
  brandInput, setBrandInput,
  addIngredient, removeIngredient, equipment, toggleEquipment,
  equipmentList, equipmentInput, setEquipmentInput, addCustomEquipment,
  basics, toggleBasic,
  readyCount, onGoCook,
}) {
  const { t, language } = useContext(LanguageContext);
  return (
    <div style={styles.screenPad}>
      <h1 style={styles.h1}>{profile?.name ? `Hey, ${profile.name}` : t("kitchenTitleFallback")}</h1>
      <p style={styles.subtext}>{t("kitchenSubtitle")}</p>

      <div style={{ ...styles.sectionLabel, marginTop: 14 }}>{t("equipmentLabel")}</div>
      <div style={styles.chipWrap}>
        {equipmentList.map((eq) => {
          const active = equipment[eq.id];
          return (
            <button key={eq.id} onClick={() => toggleEquipment(eq.id)} style={{ ...styles.equipChip, ...(active ? styles.equipChipActive : {}) }}>
              {active && <Flame size={13} color={COLORS.accent} style={{ marginInlineEnd: 5 }} />}
              {EQUIPMENT_TR[eq.id] ? labelFor(EQUIPMENT_TR, eq.id, language) : eq.label}
            </button>
          );
        })}
      </div>
      <div style={{ ...styles.inputRow, marginTop: 8 }}>
        <input
          value={equipmentInput}
          onChange={(e) => setEquipmentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomEquipment()}
          placeholder={t("addEquipmentPlaceholder")}
          style={styles.textInput}
        />
        <button onClick={addCustomEquipment} style={styles.addButton}><Plus size={18} color="#fff" /></button>
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{t("basicsLabel")}</div>
      <p style={styles.basicsHint}>{t("basicsHintText")}</p>
      <div style={styles.chipWrap}>
        {BASICS.map((b) => {
          const have = basics[b.id];
          return (
            <button key={b.id} onClick={() => toggleBasic(b.id)} style={{ ...styles.equipChip, ...(have ? styles.equipChipActive : styles.basicChipOff) }}>
              {have ? <Check size={13} color={COLORS.primary} style={{ marginInlineEnd: 5 }} /> : <X size={13} color={COLORS.inkMuted} style={{ marginInlineEnd: 5 }} />}
              <span style={!have ? { textDecoration: "line-through" } : {}}>{labelFor(BASICS_TR, b.id, language)}</span>
            </button>
          );
        })}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{t("ingredientsSectionLabel")}</div>
      <div style={styles.inputRow}>
        <input
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addIngredient()}
          placeholder={t("addIngredientPlaceholder")}
          style={styles.textInput}
        />
        <button onClick={addIngredient} style={styles.addButton}><Plus size={18} color="#fff" /></button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: -2 }}>
        <span style={{ flex: 1, fontSize: 10.5, color: COLORS.inkMuted }}>{t("quantityLabel")} ({t("optionalTag")})</span>
        <span style={{ flex: 1, fontSize: 10.5, color: COLORS.inkMuted }}>{t("expiresOnLabel")} ({t("optionalTag")})</span>
        <span style={{ flex: 1, fontSize: 10.5, color: COLORS.inkMuted }}>{t("brandLabel")} ({t("optionalTag")})</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, marginTop: 4 }}>
        <input value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} placeholder={t("qtyExamplePlaceholder")} style={{ ...styles.textInput, fontSize: 12.5 }} />
        <input
          type="date"
          value={expirationInput}
          onChange={(e) => setExpirationInput(e.target.value)}
          style={{ ...styles.textInput, fontSize: 12.5, color: expirationInput ? COLORS.ink : COLORS.inkMuted }}
        />
        <input value={brandInput} onChange={(e) => setBrandInput(e.target.value)} placeholder={t("brandPlaceholder")} style={{ ...styles.textInput, fontSize: 12.5 }} />
      </div>
      <p style={{ ...styles.basicsHint, marginTop: -10 }}>{t("quantityHint")}</p>

      <div style={styles.chipWrap}>
        {ingredients.map((item) => (
          <div key={item.name} style={styles.ingredientChip}>
            <div>
              <span style={{ textTransform: "capitalize" }}>{item.brand ? `${item.brand} ` : ""}{ingredientLabel(item.name, language)}</span>
              {item.quantity && <span style={styles.ingredientMeta}> · {item.quantity}</span>}
              {item.expiration && <span style={styles.ingredientMeta}> · {t("expAbbrevLabel")} {item.expiration}</span>}
            </div>
            <button onClick={() => removeIngredient(item.name)} style={styles.chipX}><X size={12} color={COLORS.inkMuted} /></button>
          </div>
        ))}
        {ingredients.length === 0 && <span style={styles.emptyText}>{t("nothingAddedYet")}</span>}
      </div>

      {ingredients.length > 0 && (
        <button onClick={onGoCook} style={styles.goCookButton}>
          <span>
            {readyCount > 0
              ? `${readyCount} ${pl(readyCount, PL.recipeReady, language)}`
              : t("seeWhatYouCanMake")}
          </span>
          <ChevronRight className="ms-flip" size={16} color="#fff" />
        </button>
      )}
    </div>
  );
}

function RecipeImage({ recipe, height }) {
  const photo = RECIPE_IMAGES[recipe.remixOf || recipe.id];
  if (photo) {
    return (
      <div
        role="img"
        aria-label={recipe.name}
        style={{ ...styles.recipeImage, height, width: height > 100 ? height : styles.recipeImage.width, backgroundColor: recipe.color?.[0] || DEFAULT_RECIPE_COLOR[0], backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
    );
  }
  return (
    <div style={{ ...styles.recipeImage, height, background: `linear-gradient(135deg, ${recipe.color[0]}, ${recipe.color[1]})` }}>
      <span style={{ fontSize: height > 100 ? 44 : 30 }}>{recipe.emoji}</span>
    </div>
  );
}

function RecipeCard({ recipe, info, onOpen, showIngredientCount, favorites, toggleFavorite, onEdit }) {
  const { t, language } = useContext(LanguageContext);
  const cuisineLabel = labelFor(CUISINES_TR, recipe.cuisine, language);
  const isFav = favorites && favorites[recipe.id];
  return (
    <div className="ms-recipe-card" style={styles.recipeCard} onClick={() => onOpen(recipe)}>
      <div style={{ display: "flex", gap: 12 }}>
        <RecipeImage recipe={recipe} height={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.recipeCardTop}>
            <span style={{ ...styles.recipeName, minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.3 }}>{recipeName(recipe, language)}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(recipe); }} style={styles.favButton}>
                  <Pencil size={14} color={COLORS.inkMuted} />
                </button>
              )}
              {toggleFavorite && (
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }} style={styles.favButton}>
                  <Heart size={15} color={isFav ? COLORS.accent : COLORS.inkMuted} fill={isFav ? COLORS.accent : "none"} />
                </button>
              )}
              {info.makeable ? (
                <span style={styles.readyBadge}><Check size={11} style={{ marginInlineEnd: 3 }} /> {t("readyBadgeLabel")}</span>
              ) : (
                <span style={styles.missingBadge}>{t("missingBadgeLabel")} {info.missingIngredients.length + (info.haveEquip ? 0 : 1)}</span>
              )}
            </div>
          </div>
          <div style={styles.recipeMetaRow}>
            <RatingBadge recipeId={recipe.id} compact />
            {recipe.isUserRecipe && (
              <span style={{ ...styles.mealTimeBadge, background: COLORS.paper, color: COLORS.inkMuted }}>
                {recipe.remixOf ? `✎ ${t("yourTwistOnLabel")}` : "✎ " + t("myRecipesLabel")}
              </span>
            )}
            {recipe.mealTime && recipe.mealTime[0] && (
              <span style={styles.mealTimeBadge}>
                {MEAL_TIMES.find((m) => m.id === recipe.mealTime[0])?.emoji} {labelFor(MEAL_TIMES_TR, recipe.mealTime[0], language)}
              </span>
            )}
            <span style={styles.recipeMeta}>{recipeTime(recipe, language)}</span>
            {cuisineLabel && <span style={styles.recipeMeta}>{cuisineLabel}</span>}
            {showIngredientCount && <span style={styles.recipeMeta}>{recipe.ingredients.length} {pl(recipe.ingredients.length, PL.ingredient, language)}</span>}
          </div>
        </div>
      </div>
      <div style={{ ...styles.chipWrap, marginTop: 10, gap: 5 }}>
        {recipe.categories.map((c) => (
          <span key={c} style={styles.dietPill}>{CATEGORIES.find((cat) => cat.id === c)?.emoji} {labelFor(CATEGORIES_TR, c, language)}</span>
        ))}
      </div>
      {!info.makeable && (
        <div style={styles.missingText}>
          {!info.haveEquip && `${t("missingEquipmentPrefix")}: ${info.missingEquipment.map((e) => labelFor(EQUIPMENT_TR, e, language)).join(", ")}. `}
          {info.missingIngredients.length > 0 && `${t("missingPrefixLabel")}: ${info.missingIngredients.map((i) => ingredientLabel(i, language)).join(", ")}`}
        </div>
      )}
    </div>
  );
}

// "any" = a recipe needs at least one of the picked options (union);
// "all" = it needs every picked option (intersection).
function matchesPicked(values, picked, how) {
  if (!picked.length) return true;
  return how === "all" ? picked.every((x) => values.includes(x)) : picked.some((x) => values.includes(x));
}

function MatchToggle({ value, onChange, count }) {
  const { t } = useContext(LanguageContext);
  if (count < 2) return null;
  return (
    <div role="radiogroup" aria-label={t("matchLabel")} style={{ display: "inline-flex", border: `1px solid ${COLORS.line}`, borderRadius: 20, overflow: "hidden", marginInlineStart: 8 }}>
      {["any", "all"].map((k) => (
        <button key={k} role="radio" aria-checked={value === k} onClick={() => onChange(k)}
          style={{ border: "none", padding: "4px 11px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif", background: value === k ? COLORS.sage : COLORS.card, color: value === k ? COLORS.primaryText : COLORS.inkMuted, fontWeight: value === k ? 700 : 500 }}>
          {t(k === "any" ? "matchAny" : "matchAll")}
        </button>
      ))}
    </div>
  );
}

function CookScreen({ recipes, kitchenIngredients = [], matchInfo, onOpen, onEdit, selectedMealTimes, toggleMealTime, selectedCategories, toggleCategory, cuisines, selectedCuisines, toggleCuisine, filterMatch = { categories: "any", cuisines: "any" }, setFilterMatch = () => {}, clearFilters = () => {}, cuisineInput, setCuisineInput, addCuisine, favorites, toggleFavorite }) {
  const { t, language } = useContext(LanguageContext);
  const [mode, setMode] = useState("kitchen");
  const [query, setQuery] = useState("");
  const [ingredientQuery, setIngredientQuery] = useState("");
  // Filters start open on "From my kitchen" and folded away in the two search modes.
  const [filtersOpenByMode, setFiltersOpenByMode] = useState({ kitchen: true, search: false, ingredient: false });
  const filtersOpen = filtersOpenByMode[mode];
  const setFiltersOpen = (fn) => setFiltersOpenByMode((m) => ({ ...m, [mode]: fn(m[mode]) }));

  // The same filters apply in all three modes (kitchen, search, by ingredient).
  const passesFilters = (r) =>
    matchesPicked(r.mealTime || [], selectedMealTimes, "any") &&
    matchesPicked(r.categories || [], selectedCategories, filterMatch.categories) &&
    matchesPicked([].concat(r.cuisine || []), selectedCuisines, filterMatch.cuisines);
  const filtered = recipes.filter(passesFilters);
  const setMatch = (group, how) => setFilterMatch((f) => ({ ...f, [group]: how }));

  const withInfo = filtered.map((r) => ({ recipe: r, info: matchInfo(r) }));
  const ready = withInfo.filter((x) => x.info.makeable);
  const almost = withInfo.filter((x) => !x.info.makeable).sort((a, b) => a.info.missingIngredients.length - b.info.missingIngredients.length);
  const anyFilterActive = selectedMealTimes.length > 0 || selectedCategories.length > 0 || selectedCuisines.length > 0;

  const searchResults = recipes
    .filter(passesFilters)
    .filter((r) => {
      const q = query.trim().toLowerCase();
      return r.name.toLowerCase().includes(q) || recipeName(r, language).toLowerCase().includes(q);
    })
    .map((r) => ({ recipe: r, info: matchInfo(r) }))
    .sort((a, b) => a.recipe.ingredients.length - b.recipe.ingredients.length);

  // Ready-to-cook recipes first, then the ones you're closest to making.
  const ingredientResults = ingredientQuery.trim()
    ? recipes
        .filter(passesFilters)
        .filter((r) => r.ingredients.some((i) => ingredientMatchesQuery(i, ingredientQuery)))
        .map((r) => ({ recipe: r, info: matchInfo(r) }))
        .sort((a, b) =>
          (b.info.makeable - a.info.makeable) ||
          (a.info.missingIngredients.length - b.info.missingIngredients.length) ||
          (a.recipe.ingredients.length - b.recipe.ingredients.length))
    : [];
  const kitchenChips = Array.from(new Set(kitchenIngredients.map((i) => (i.name || "").trim()).filter(Boolean))).slice(0, 16);

  return (
    <div style={styles.screenPad}>
      <h1 style={styles.h1}>{t("cookTitle")}</h1>

      <div style={styles.mealTimeRow}>
        {MEAL_TIMES.map((m) => {
          const active = selectedMealTimes.includes(m.id);
          return (
            <button key={m.id} onClick={() => toggleMealTime(m.id)} style={{ ...styles.mealTimeChip, ...(active ? styles.mealTimeChipActive : {}) }}>
              <span style={{ fontSize: 17 }}>{m.emoji}</span>
              <span style={{ fontSize: 11, marginTop: 3 }}>{labelFor(MEAL_TIMES_TR, m.id, language)}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.modeRow}>
        <button onClick={() => setMode("kitchen")} style={{ ...styles.modeButton, ...(mode === "kitchen" ? styles.modeButtonActive : {}) }}>{t("fromMyKitchen")}</button>
        <button onClick={() => setMode("search")} style={{ ...styles.modeButton, ...(mode === "search" ? styles.modeButtonActive : {}) }}>{t("searchAMeal")}</button>
        <button onClick={() => setMode("ingredient")} style={{ ...styles.modeButton, ...(mode === "ingredient" ? styles.modeButtonActive : {}) }}>{t("byIngredient")}</button>
      </div>

      <button onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} style={{ ...styles.linkButton, fontWeight: 700, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
        {t("filtersLabel")}{anyFilterActive ? ` (${selectedMealTimes.length + selectedCategories.length + selectedCuisines.length})` : ""}
        <span aria-hidden="true" className={filtersOpen ? undefined : "ms-flip"}>{filtersOpen ? "▾" : "▸"}</span>
      </button>
      {filtersOpen && (
        <div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 18, marginBottom: 8 }}>
            <div style={{ ...styles.sectionLabel, margin: 0 }}>{t("mealType")}</div>
            <MatchToggle value={filterMatch.categories} onChange={(v) => setMatch("categories", v)} count={selectedCategories.length} />
          </div>
          <div style={styles.chipWrap}>
            {CATEGORIES.map((c) => {
              const active = selectedCategories.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggleCategory(c.id)} style={{ ...styles.equipChip, ...(active ? styles.equipChipActive : {}) }}>
                  {c.emoji} {labelFor(CATEGORIES_TR, c.id, language)}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 16, marginBottom: 8 }}>
            <div style={{ ...styles.sectionLabel, margin: 0 }}>{t("cuisineLabel")}</div>
            <MatchToggle value={filterMatch.cuisines} onChange={(v) => setMatch("cuisines", v)} count={selectedCuisines.length} />
          </div>
          <div style={styles.chipWrap}>
            {cuisines.map((c) => {
              const active = selectedCuisines.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggleCuisine(c.id)} style={{ ...styles.equipChip, ...(active ? styles.equipChipActive : {}) }}>
                  {CUISINES_TR[c.id]?.[language] ?? c.label}
                </button>
              );
            })}
          </div>
          {filterMatch.cuisines === "all" && selectedCuisines.length > 1 && (
            <p style={{ ...styles.basicsHint, marginTop: 6 }}>{t("cuisineAllHint")}</p>
          )}
          <div style={{ ...styles.inputRow, marginTop: 8 }}>
            <input
              value={cuisineInput}
              onChange={(e) => setCuisineInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCuisine()}
              placeholder={t("addCuisinePlaceholder")}
              style={styles.textInput}
            />
            <button onClick={addCuisine} style={styles.addButton}><Plus size={18} color="#fff" /></button>
          </div>

          {anyFilterActive && (
            <button onClick={clearFilters} style={{ ...styles.linkButton, marginTop: 10, fontWeight: 600 }}>✕ {t("clearFilters")} · {filtered.length} {t("recipesWord")}</button>
          )}
        </div>
      )}

      {mode === "kitchen" && (
        <>
          <p style={styles.subtext}>{t("cookSubtitleKitchen")}</p>

          <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("readyToCookSection")} ({ready.length})</div>
          {ready.length === 0 && (
            <span style={styles.emptyText}>
              {anyFilterActive ? t("noFilterMatch") : t("noKitchenMatch")}
            </span>
          )}
          <div>{ready.map(({ recipe, info }) => <RecipeCard key={recipe.id} recipe={recipe} info={info} onOpen={onOpen} onEdit={onEdit} favorites={favorites} toggleFavorite={toggleFavorite} />)}</div>

          {almost.length > 0 && (
            <>
              <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("almostThere")}</div>
              <div>{almost.map(({ recipe, info }) => <RecipeCard key={recipe.id} recipe={recipe} info={info} onOpen={onOpen} onEdit={onEdit} favorites={favorites} toggleFavorite={toggleFavorite} />)}</div>
            </>
          )}
        </>
      )}

      {mode === "search" && (
        <>
          <p style={styles.subtext}>{t("cookSubtitleSearch")}</p>
          <div style={{ position: "relative", marginTop: 14 }}>
            <Search size={16} color={COLORS.inkMuted} style={styles.searchIcon} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchAMeal")} style={{ ...styles.textInput, paddingInlineStart: 34 }} />
          </div>

          <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{query ? `${t("resultsLabel")} (${searchResults.length})` : t("allMealsFewestFirst")}</div>
          {searchResults.length === 0 && <span style={styles.emptyText}>{t("noSearchMatch")}</span>}
          <div>{searchResults.map(({ recipe, info }) => <RecipeCard key={recipe.id} recipe={recipe} info={info} onOpen={onOpen} onEdit={onEdit} showIngredientCount favorites={favorites} toggleFavorite={toggleFavorite} />)}</div>
        </>
      )}

      {mode === "ingredient" && (
        <>
          <p style={styles.subtext}>{t("ingredientSearchSubtitle")}</p>
          <div style={{ position: "relative", marginTop: 14 }}>
            <Search size={16} color={COLORS.inkMuted} style={styles.searchIcon} />
            <input value={ingredientQuery} onChange={(e) => setIngredientQuery(e.target.value)} placeholder={t("ingredientSearchPlaceholder")} style={{ ...styles.textInput, paddingInlineStart: 34, paddingInlineEnd: ingredientQuery ? 34 : undefined }} />
            {ingredientQuery && (
              <button onClick={() => setIngredientQuery("")} aria-label="Clear" style={{ position: "absolute", insetInlineEnd: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                <X size={15} color={COLORS.inkMuted} />
              </button>
            )}
          </div>

          {!ingredientQuery.trim() && kitchenChips.length > 0 && (
            <>
              <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("fromYourKitchenTap")}</div>
              <div style={styles.chipWrap}>
                {kitchenChips.map((name) => (
                  <button key={name} onClick={() => setIngredientQuery(name)} style={styles.equipChip}>{ingredientLabel(name, language)}</button>
                ))}
              </div>
            </>
          )}

          {ingredientQuery.trim() && (
            <>
              <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("recipesWithLabel")} “{ingredientQuery.trim()}” ({ingredientResults.length})</div>
              {ingredientResults.length === 0 && <span style={styles.emptyText}>{t("noIngredientMatch")}</span>}
              <div>{ingredientResults.map(({ recipe, info }) => <RecipeCard key={recipe.id} recipe={recipe} info={info} onOpen={onOpen} onEdit={onEdit} showIngredientCount favorites={favorites} toggleFavorite={toggleFavorite} />)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}


// Minutes or seconds mentioned in a step's English amount ("~15 min", "10–12 min",
// "45 sec, stir, then 30 sec more", "1 hr"). The first (shortest) time is used,
// so the cook checks the visual cue before going longer.
function stepTimerSeconds(measure) {
  const m = String(measure || "").match(/(\d+(?:\.\d+)?)\s*(?:[–-]\s*\d+(?:\.\d+)?\s*)?(sec|secs|second|seconds|min|mins|minute|minutes|hr|hrs|hour|hours)\b/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  const secs = unit.startsWith("s") ? n : unit.startsWith("h") ? n * 3600 : n * 60;
  return secs >= 10 && secs <= 6 * 3600 ? Math.round(secs) : 0;
}
const fmtClock = (secs) => {
  const s = Math.max(0, Math.ceil(secs));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
};

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((at) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.25);
      o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.3);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch { /* no audio */ }
  try { navigator.vibrate && navigator.vibrate([200, 120, 200]); } catch { /* no vibration */ }
}

// Keeps the screen from dimming while a recipe is open (where supported).
function useWakeLock(active) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.wakeLock) return;
    let lock = null; let cancelled = false;
    const get = async () => { try { lock = await navigator.wakeLock.request("screen"); if (!cancelled) setOn(true); lock.addEventListener("release", () => !cancelled && setOn(false)); } catch { setOn(false); } };
    get();
    const onVis = () => { if (document.visibilityState === "visible") get(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", onVis); if (lock) lock.release().catch(() => {}); };
  }, [active]);
  return on;
}

function StepTimer({ seconds, label, timer, setTimer }) {
  const { t } = useContext(LanguageContext);
  if (!seconds) return null;
  const mine = timer && timer.label === label;
  const mins = seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds} s`;
  if (!mine) {
    return (
      <button onClick={() => setTimer({ label, total: seconds, endsAt: Date.now() + seconds * 1000, paused: null, done: false })} style={styles.cookToolButton}>
        <Clock size={15} color={COLORS.primaryText} /> {t("timerStart").replace("{t}", mins)}
      </button>
    );
  }
  return null;
}

function TimerBar({ timer, setTimer }) {
  const { t } = useContext(LanguageContext);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!timer || timer.paused != null || timer.done) return;
    const id = setInterval(() => {
      tick((n) => n + 1);
      if (Date.now() >= timer.endsAt) { beep(); setTimer((tm) => (tm ? { ...tm, done: true } : tm)); }
    }, 250);
    return () => clearInterval(id);
  }, [timer, setTimer]);
  if (!timer) return null;
  const left = timer.done ? 0 : timer.paused != null ? timer.paused : (timer.endsAt - Date.now()) / 1000;
  return (
    <div role="timer" aria-live={timer.done ? "assertive" : "off"} style={{ ...styles.timerBar, ...(timer.done ? styles.timerBarDone : {}) }}>
      <Clock size={16} color={timer.done ? COLORS.onInk : COLORS.primaryText} />
      <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", fontSize: 18 }}>{timer.done ? t("timerDone") : fmtClock(left)}</span>
      <span style={{ flex: 1 }} />
      {!timer.done && (timer.paused != null ? (
        <button onClick={() => setTimer({ ...timer, endsAt: Date.now() + timer.paused * 1000, paused: null })} style={styles.timerBtn}>{t("timerResume")}</button>
      ) : (
        <button onClick={() => setTimer({ ...timer, paused: Math.max(0, (timer.endsAt - Date.now()) / 1000) })} style={styles.timerBtn}>{t("timerPause")}</button>
      ))}
      <button onClick={() => setTimer(null)} style={styles.timerBtn}>{timer.done ? t("dismissLabel") : t("timerStop")}</button>
    </div>
  );
}

function GuidedScreen({ recipe, stepIndex, onNext, onPrev, servings, setServings, onBack }) {
  const { t, language } = useContext(LanguageContext);
  const steps = recipeSteps(recipe, language);
  const step = steps[stepIndex];
  const [timer, setTimer] = useState(null);
  const [showIngredients, setShowIngredients] = useState(true);
  const [gotIt, setGotIt] = useState({});
  const screenOn = useWakeLock(true);
  if (!step) {
    return (
      <div style={styles.screenPad}>
        <button onClick={onBack} style={styles.exitButton}>
          <ArrowLeft className="ms-flip" size={20} color={COLORS.ink} />
          <span>{t("exitLabel")}</span>
        </button>
        <h1 style={{ ...styles.h1, marginTop: 10 }}>{recipeName(recipe, language)}</h1>
        <p style={styles.subtext}>{t("noStepsYet")}</p>
      </div>
    );
  }
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;
  const ratio = servings / 2;
  const scale = (v) => Math.round(v * ratio);
  const measureText = scaleTranslatedMeasure(step.measure, recipe.steps[stepIndex]?.measure, ratio);
  const timerSecs = stepTimerSeconds(recipe.steps[stepIndex]?.measure || step.measure);

  return (
    <div style={styles.screenPad}>
      <TimerBar timer={timer} setTimer={setTimer} />
      <button onClick={onBack} style={styles.exitButton}>
        <ArrowLeft className="ms-flip" size={20} color={COLORS.ink} />
        <span>{t("exitLabel")}</span>
      </button>

      <RecipeImage recipe={recipe} height={130} />
      {recipe.mealTime && recipe.mealTime[0] && (
        <span style={{ ...styles.mealTimeBadge, marginTop: 12 }}>
          {MEAL_TIMES.find((m) => m.id === recipe.mealTime[0])?.emoji} {labelFor(MEAL_TIMES_TR, recipe.mealTime[0], language)}
        </span>
      )}
      <h1 style={{ ...styles.h1, fontSize: 20, marginTop: 8 }}>{recipeName(recipe, language)}</h1>
      <div style={{ marginTop: 4 }}><RatingBadge recipeId={recipe.id} /></div>

      <div style={styles.servingsRow}>
        <span style={styles.targetLabel}>{t("servingsLabel")}</span>
        <div style={styles.stepperRow}>
          <button onClick={() => setServings((s) => Math.max(1, s - 1))} style={styles.stepperButton}>−</button>
          <span style={styles.targetValue}>{servings}</span>
          <button onClick={() => setServings((s) => Math.min(12, s + 1))} style={styles.stepperButton}>+</button>
        </div>
      </div>

      <div style={styles.macroRow}>
        <span style={styles.macroChip}>{scale(recipe.macros.calories)} kcal</span>
        <span style={styles.macroChip}>{scale(recipe.macros.protein)}g {t("proteinWord").toLowerCase()}</span>
        <span style={styles.macroChip}>{scale(recipe.macros.carbs)}g {t("carbsWord").toLowerCase()}</span>
        <span style={styles.macroChip}>{scale(recipe.macros.fat)}g {t("fatWord").toLowerCase()}</span>
      </div>
      <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
      <div style={styles.stepCounter}>{t("stepOfLabel")} {stepIndex + 1} / {steps.length}</div>

      <button onClick={() => setShowIngredients((v) => !v)} aria-expanded={showIngredients} style={{ ...styles.linkButton, fontWeight: 600, marginTop: 10 }}>
        {showIngredients ? "▾" : "▸"} {t("ingredientsSectionLabel")} ({recipe.ingredients.length})
      </button>
      {showIngredients && (
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "grid", gap: 6 }}>
          {recipe.ingredients.map((ing) => (
            <li key={ing}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", color: gotIt[ing] ? COLORS.inkMuted : COLORS.ink, textDecoration: gotIt[ing] ? "line-through" : "none" }}>
                <input type="checkbox" checked={!!gotIt[ing]} onChange={() => setGotIt((g) => ({ ...g, [ing]: !g[ing] }))} style={{ width: 18, height: 18, accentColor: "var(--ms-primary)" }} />
                {ingredientLabel(ing, language)}
              </label>
            </li>
          ))}
        </ul>
      )}

      <div style={styles.stepInstruction}>{step.instruction}</div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <StepTimer seconds={timerSecs} label={`${recipe.id}:${stepIndex}`} timer={timer} setTimer={setTimer} />
      </div>

      <div style={styles.milestoneCard}>
        <div style={styles.milestoneRow}>
          <Clock size={16} color={COLORS.accent} />
          <div style={{ marginInlineStart: 10 }}>
            <div style={styles.milestoneLabel}>{t("timeMeasureLabel")}</div>
            <div style={styles.milestoneValue}>{measureText}</div>
          </div>
        </div>
        <div style={styles.milestoneDivider} />
        <div style={styles.milestoneRow}>
          <Utensils size={16} color={COLORS.accent} />
          <div style={{ marginInlineStart: 10 }}>
            <div style={styles.milestoneLabel}>{t("visualCueLabel")}</div>
            <div style={styles.milestoneValue}>{step.visual}</div>
          </div>
        </div>
        {secondarySignal(recipe, stepIndex, language) && (
          <>
            <div style={styles.milestoneDivider} />
            <div style={styles.milestoneRow}>
              <Eye size={16} color={COLORS.accent} />
              <div style={{ marginInlineStart: 10 }}>
                <div style={styles.milestoneLabel}>{t("alsoCheckLabel")}</div>
                <div style={styles.milestoneValue}>{secondarySignal(recipe, stepIndex, language)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
        {!isFirst && (
          <button onClick={onPrev} style={styles.prevStepButton}>{t("previousStepLabel")}</button>
        )}
        <button onClick={onNext} style={{ ...styles.primaryButton, marginTop: 0, flex: 1 }}>{isLast ? t("finishCookingLabel") : t("nextStepLabel")}</button>
      </div>
      {screenOn && <p style={{ ...styles.basicsHint, textAlign: "center", marginTop: 12 }}>☀ {t("screenOnNote")}</p>}
    </div>
  );
}

function CompleteScreen({ recipe, servings, onDone }) {
  const { t, language } = useContext(LanguageContext);
  const { myRating } = useContext(CommunityContext);
  const [stars, setStars] = useState(() => myRating(recipe.id));
  const ratio = servings / 2;
  const scale = (v) => Math.round(v * ratio);
  return (
    <div style={styles.screenPad}>
      <h1 style={styles.h1}>{t("niceWorkTitle")}</h1>
      <p style={styles.subtext}>{t("youJustMade")} {recipeName(recipe, language)}.</p>

      <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("nutritionPerServing")} · {servings} {t("servingsLabel").toLowerCase()}</div>
      <div style={styles.macroGrid}>
        <div style={styles.macroCell}><div style={styles.macroCellValue}>{scale(recipe.macros.calories)}</div><div style={styles.macroCellLabel}>{t("caloriesWord")}</div></div>
        <div style={styles.macroCell}><div style={styles.macroCellValue}>{scale(recipe.macros.protein)}g</div><div style={styles.macroCellLabel}>{t("proteinWord")}</div></div>
        <div style={styles.macroCell}><div style={styles.macroCellValue}>{scale(recipe.macros.carbs)}g</div><div style={styles.macroCellLabel}>{t("carbsWord")}</div></div>
        <div style={styles.macroCell}><div style={styles.macroCellValue}>{scale(recipe.macros.fat)}g</div><div style={styles.macroCellLabel}>{t("fatWord")}</div></div>
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("wantMoreFlavor")}</div>
      <div style={styles.milestoneCard}>
        {recipeFlavorBoosts(recipe, language).map((f, i) => (
          <div key={f} style={{ display: "flex", alignItems: "center", marginTop: i === 0 ? 0 : 10 }}>
            <span style={{ color: COLORS.accentText, marginInlineEnd: 8 }}>+</span>
            <span style={styles.milestoneValue}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("rateForCommunity")}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StarPicker value={stars} onChange={setStars} size={26} label={t("rateForCommunity")} />
        <RatingBadge recipeId={recipe.id} />
      </div>

      <button onClick={() => onDone(stars)} style={styles.primaryButton}>{t("saveToHistory")}</button>
    </div>
  );
}

const DEFAULT_RECIPE_COLOR = ["#F3E9D8", "#E3C79A"];

function CreateRecipeScreen({ editingRecipe, cuisines, equipmentList, onSave, onBack }) {
  const { t, language } = useContext(LanguageContext);
  const isBuiltInEdit = editingRecipe && !editingRecipe.isUserRecipe;

  const [name, setName] = useState(editingRecipe?.name || "");
  const [emoji, setEmoji] = useState(editingRecipe?.emoji || "🍽️");
  const [time, setTime] = useState(editingRecipe?.time || "");
  const [cuisine, setCuisine] = useState(editingRecipe?.cuisine || "american");
  const [mealTimeSel, setMealTimeSel] = useState(editingRecipe?.mealTime || []);
  const [categoriesSel, setCategoriesSel] = useState(editingRecipe?.categories || []);
  const [equipmentSel, setEquipmentSel] = useState(editingRecipe?.equipment || []);
  const [ingredientsList, setIngredientsList] = useState(editingRecipe?.ingredients || []);
  const [ingredientDraft, setIngredientDraft] = useState("");
  const [calories, setCalories] = useState(editingRecipe?.macros?.calories ?? "");
  const [protein, setProtein] = useState(editingRecipe?.macros?.protein ?? "");
  const [carbs, setCarbs] = useState(editingRecipe?.macros?.carbs ?? "");
  const [fat, setFat] = useState(editingRecipe?.macros?.fat ?? "");
  const [stepsList, setStepsList] = useState(editingRecipe?.steps?.length ? editingRecipe.steps : [{ instruction: "", measure: "", visual: "" }]);
  const [flavorBoostsList, setFlavorBoostsList] = useState(editingRecipe?.flavorBoosts || []);
  const [flavorDraft, setFlavorDraft] = useState("");
  const [personalNote, setPersonalNote] = useState(editingRecipe?.authorNote || "");

  function toggleIn(list, setList, id) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function addIngredientDraft() {
    const typed = ingredientDraft.trim().toLowerCase();
    const val = resolveIngredientCanonical(typed) || typed;
    if (val && !ingredientsList.includes(val)) setIngredientsList([...ingredientsList, val]);
    setIngredientDraft("");
  }

  function updateStep(i, field, value) {
    setStepsList((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function addStepRow() {
    setStepsList((prev) => [...prev, { instruction: "", measure: "", visual: "" }]);
  }

  function removeStepRow(i) {
    setStepsList((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  function addFlavorDraft() {
    const val = flavorDraft.trim();
    if (val) setFlavorBoostsList([...flavorBoostsList, val]);
    setFlavorDraft("");
  }

  const hasStep = stepsList.some((s) => s.instruction.trim());
  const canSave = !!name.trim() && ingredientsList.length > 0 && hasStep;
  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      emoji: emoji || "🍽️",
      color: editingRecipe?.color || DEFAULT_RECIPE_COLOR,
      time: time.trim() || "20 min",
      categories: categoriesSel,
      cuisine,
      mealTime: mealTimeSel,
      equipment: equipmentSel,
      ingredients: ingredientsList,
      macros: { calories: Number(calories) || 0, protein: Number(protein) || 0, carbs: Number(carbs) || 0, fat: Number(fat) || 0 },
      flavorBoosts: flavorBoostsList,
      steps: stepsList.filter((s) => s.instruction.trim()),
      authorNote: personalNote.trim(),
    });
  }

  return (
    <div style={styles.screenPad}>
      <button onClick={onBack} style={styles.backRow}>
        <ArrowLeft className="ms-flip" size={16} color={COLORS.inkMuted} />
        <span style={{ marginInlineStart: 6, color: COLORS.inkMuted, fontSize: 13 }}>{t("backLabel")}</span>
      </button>
      <h1 style={{ ...styles.h1, marginTop: 6 }}>{editingRecipe ? t("editRecipeTitle") : t("createRecipeTitle")}</h1>

      {isBuiltInEdit && (
        <div style={styles.tipCard}>
          <div style={styles.milestoneValue}>{t("remixNoticeText")}</div>
        </div>
      )}

      <div style={{ ...styles.sectionLabel, marginTop: 18 }}>{t("recipeNameLabel")}</div>
      <input value={name} onChange={(e) => setName(e.target.value)} style={styles.textInput} />

      <div style={styles.rowPair}>
        <div style={{ flex: 1 }}>
          <div style={styles.sectionLabel}>{t("emojiLabel")}</div>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} style={styles.textInput} />
        </div>
        <div style={{ flex: 2 }}>
          <div style={styles.sectionLabel}>{t("timeLabel")}</div>
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="20 min" style={styles.textInput} />
        </div>
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("cuisineLabel")}</div>
      <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={styles.selectInput}>
        {cuisines.map((c) => <option key={c.id} value={c.id}>{CUISINES_TR[c.id]?.[language] ?? c.label}</option>)}
      </select>

      <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("mealType")}</div>
      <div style={styles.chipWrap}>
        {MEAL_TIMES.map((m) => (
          <button key={m.id} onClick={() => toggleIn(mealTimeSel, setMealTimeSel, m.id)} style={{ ...styles.equipChip, ...(mealTimeSel.includes(m.id) ? styles.equipChipActive : {}) }}>
            {m.emoji} {labelFor(MEAL_TIMES_TR, m.id, language)}
          </button>
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("dietaryPreference")}</div>
      <div style={styles.chipWrap}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => toggleIn(categoriesSel, setCategoriesSel, c.id)} style={{ ...styles.equipChip, ...(categoriesSel.includes(c.id) ? styles.equipChipActive : {}) }}>
            {c.emoji} {labelFor(CATEGORIES_TR, c.id, language)}
          </button>
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("equipmentLabel")}</div>
      <div style={styles.chipWrap}>
        {equipmentList.map((eq) => (
          <button key={eq.id} onClick={() => toggleIn(equipmentSel, setEquipmentSel, eq.id)} style={{ ...styles.equipChip, ...(equipmentSel.includes(eq.id) ? styles.equipChipActive : {}) }}>
            {EQUIPMENT_TR[eq.id] ? labelFor(EQUIPMENT_TR, eq.id, language) : eq.label}
          </button>
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("ingredientsSectionLabel")}</div>
      <div style={styles.inputRow}>
        <input value={ingredientDraft} onChange={(e) => setIngredientDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addIngredientDraft()} placeholder={t("addIngredientPlaceholder")} style={styles.textInput} />
        <button onClick={addIngredientDraft} style={styles.addButton}><Plus size={18} color="#fff" /></button>
      </div>
      <div style={styles.chipWrap}>
        {ingredientsList.map((ing) => (
          <div key={ing} style={styles.ingredientChip}>
            <span style={{ textTransform: "capitalize" }}>{ing}</span>
            <button onClick={() => setIngredientsList(ingredientsList.filter((i) => i !== ing))} style={styles.chipX}><X size={12} color={COLORS.inkMuted} /></button>
          </div>
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 18 }}>{t("macrosLabel")}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" placeholder={t("caloriesWord")} style={{ ...styles.textInput, fontSize: 12.5 }} />
        <input value={protein} onChange={(e) => setProtein(e.target.value)} type="number" placeholder={t("proteinWord")} style={{ ...styles.textInput, fontSize: 12.5 }} />
        <input value={carbs} onChange={(e) => setCarbs(e.target.value)} type="number" placeholder={t("carbsWord")} style={{ ...styles.textInput, fontSize: 12.5 }} />
        <input value={fat} onChange={(e) => setFat(e.target.value)} type="number" placeholder={t("fatWord")} style={{ ...styles.textInput, fontSize: 12.5 }} />
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 18 }}>{t("stepsLabel")}</div>
      {stepsList.map((s, i) => (
        <div key={i} style={{ ...styles.milestoneCard, marginTop: i === 0 ? 8 : 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={styles.milestoneLabel}>{t("stepOfLabel")} {i + 1}</span>
            {stepsList.length > 1 && (
              <button onClick={() => removeStepRow(i)} style={styles.chipX}><X size={13} color={COLORS.inkMuted} /></button>
            )}
          </div>
          <input value={s.instruction} onChange={(e) => updateStep(i, "instruction", e.target.value)} placeholder={t("instructionPlaceholder")} style={{ ...styles.textInput, marginBottom: 6 }} />
          <input value={s.measure} onChange={(e) => updateStep(i, "measure", e.target.value)} placeholder={t("measurePlaceholder")} style={{ ...styles.textInput, fontSize: 12.5, marginBottom: 6 }} />
          <input value={s.visual} onChange={(e) => updateStep(i, "visual", e.target.value)} placeholder={t("visualPlaceholder")} style={{ ...styles.textInput, fontSize: 12.5 }} />
        </div>
      ))}
      <button onClick={addStepRow} style={{ ...styles.resetButton, marginTop: 10 }}>{t("addStepLabel")}</button>

      <div style={{ ...styles.sectionLabel, marginTop: 18 }}>{t("flavorBoostsLabel")}</div>
      <div style={styles.inputRow}>
        <input value={flavorDraft} onChange={(e) => setFlavorDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFlavorDraft()} placeholder={t("addFlavorPlaceholder")} style={styles.textInput} />
        <button onClick={addFlavorDraft} style={styles.addButton}><Plus size={18} color="#fff" /></button>
      </div>
      <div style={styles.chipWrap}>
        {flavorBoostsList.map((f, i) => (
          <div key={i} style={styles.ingredientChip}>
            <span>{f}</span>
            <button onClick={() => setFlavorBoostsList(flavorBoostsList.filter((_, idx) => idx !== i))} style={styles.chipX}><X size={12} color={COLORS.inkMuted} /></button>
          </div>
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 18 }}>{t("personalNoteLabel")}</div>
      <input value={personalNote} onChange={(e) => setPersonalNote(e.target.value)} style={styles.textInput} />

      {!canSave && <p style={{ ...styles.emptyText, marginTop: 18, display: "block" }}>{t("saveNeedsHint")}</p>}
      <button onClick={handleSave} disabled={!canSave} style={{ ...styles.primaryButton, opacity: canSave ? 1 : 0.4 }}>
        {t("saveRecipeLabel")}
      </button>
    </div>
  );
}

const ACHIEVEMENTS = [
  { threshold: 1, key: "achievementFirstMeal", emoji: "🎉" },
  { threshold: 5, key: "achievement5Meals", emoji: "🍳" },
  { threshold: 10, key: "achievement10Meals", emoji: "🔥" },
  { threshold: 25, key: "achievementKitchenPro", emoji: "🏆" },
];

function HistoryScreen({ recipes, history, onRate, onNote, onBack }) {
  const { t, language } = useContext(LanguageContext);
  return (
    <div style={styles.screenPad}>
      <button onClick={onBack} style={styles.backRow}>
        <ArrowLeft className="ms-flip" size={16} color={COLORS.inkMuted} />
        <span style={{ marginInlineStart: 6, color: COLORS.inkMuted, fontSize: 13 }}>{t("backLabel")}</span>
      </button>
      <h1 style={{ ...styles.h1, marginTop: 6 }}>{t("historyTitle")}</h1>
      <p style={styles.subtext}>{t("mealsCookedSoFar")} — {history.length} {t("soFarSuffix")}</p>

      <div style={styles.chipWrap}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = history.length >= a.threshold;
          return (
            <span key={a.key} style={{ ...styles.achievementBadge, ...(unlocked ? {} : styles.achievementBadgeLocked) }}>
              {a.emoji} {t(a.key)}
            </span>
          );
        })}
      </div>

      {history.length === 0 && <span style={{ ...styles.emptyText, marginTop: 14, display: "block" }}>{t("nothingCookedYet")}</span>}

      {history.map((h, i) => {
        const recipe = recipes.find((r) => r.id === h.id);
        return (
          <div key={h.uid || i} style={{ ...styles.historyCard, marginTop: 14 }}>
            <div style={{ display: "flex", gap: 12 }}>
              {recipe && <RecipeImage recipe={recipe} height={54} />}
              <div style={{ flex: 1 }}>
                <div style={styles.recipeName}>{recipe ? recipeName(recipe, language) : h.name}</div>
                <div style={styles.recipeMeta}>{whenLabel(h, language)}</div>
                <div style={{ display: "flex", marginTop: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => onRate(h.uid, n)} style={styles.starButton}>
                      <Star size={17} color={n <= h.rating ? COLORS.accent : COLORS.line} fill={n <= h.rating ? COLORS.accent : "none"} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <input
              value={h.note || ""}
              onChange={(e) => onNote(h.uid, e.target.value)}
              placeholder={t("addNotePlaceholder")}
              style={{ ...styles.textInput, marginTop: 10, fontSize: 12.5 }}
            />
          </div>
        );
      })}
    </div>
  );
}

function HomeScreen({ profile, ingredients, equipment, recipes, matchInfo, history, favorites, toggleFavorite, onOpenRecipe, onGoCook, onGoKitchen }) {
  const { t, language } = useContext(LanguageContext);
  const [tip] = useState(() => BEGINNER_TIPS[Math.floor(Math.random() * BEGINNER_TIPS.length)]);
  const ready = recipes.map((r) => ({ recipe: r, info: matchInfo(r) })).filter((x) => x.info.makeable).slice(0, 3);
  const equipCount = Object.values(equipment).filter(Boolean).length;

  return (
    <div style={styles.screenPad}>
      <h1 style={styles.h1}>{profile?.name ? `Hey, ${profile.name}` : t("homeGreetingFallback")}</h1>
      <p style={styles.subtext}>{t("homeSubtitle")}</p>

      <div style={styles.homeSnapshotRow}>
        <button onClick={onGoKitchen} style={styles.homeSnapshotCard}>
          <div style={styles.homeSnapshotValue}>{ingredients.length}</div>
          <div style={styles.homeSnapshotLabel}>{pl(ingredients.length, PL.ingredient, language)}</div>
        </button>
        <button onClick={onGoKitchen} style={styles.homeSnapshotCard}>
          <div style={styles.homeSnapshotValue}>{equipCount}</div>
          <div style={styles.homeSnapshotLabel}>{t("toolsReady")}</div>
        </button>
        <button onClick={onGoCook} style={styles.homeSnapshotCard}>
          <div style={styles.homeSnapshotValue}>{ready.length > 0 ? `${recipes.filter((r) => matchInfo(r).makeable).length}` : "0"}</div>
          <div style={styles.homeSnapshotLabel}>{t("readyToCookLabel")}</div>
        </button>
      </div>

      <div style={styles.tipCard}>
        <div style={styles.milestoneLabel}>{t("beginnerTipLabel")}</div>
        <div style={{ ...styles.milestoneValue, marginTop: 4 }}>{tip}</div>
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{t("recommendedForYou")}</div>
      {ready.length === 0 && <span style={styles.emptyText}>Add a bit more to My Kitchen and recommendations will show up here.</span>}
      <div>{ready.map(({ recipe, info }) => <RecipeCard key={recipe.id} recipe={recipe} info={info} onOpen={onOpenRecipe} favorites={favorites} toggleFavorite={toggleFavorite} />)}</div>

      {history.length > 0 && (
        <>
          <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("recentlyCooked")}</div>
          {history.slice(0, 2).map((h, i) => (
            <div key={h.uid || i} style={styles.historyCard}>
              <div style={styles.recipeName}>{(recipes.find((r) => r.id === h.id) && recipeName(recipes.find((r) => r.id === h.id), language)) || h.name}</div>
              <div style={styles.recipeMeta}>{whenLabel(h, language)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function MoreScreen({ onOpen, onOpenSettings, favoritesCount, shoppingCount, recipes = [], onOpenRecipe }) {
  const { t, language } = useContext(LanguageContext);
  const [inspireIds, setInspireIds] = useState(() => pickRecipeIds(8));
  const inspire = inspireIds.map((id) => recipes.find((r) => r.id === id)).filter(Boolean);
  const rows = [
    { icon: Clock, label: t("historyLabel"), sub: t("historySub"), action: () => onOpen("history") },
    { icon: BookOpen, label: t("cookbookLabel"), sub: favoritesCount > 0 ? `${favoritesCount} ${pl(favoritesCount, PL.savedRecipe, language)}` : t("cookbookSub"), action: () => onOpen("cookbook") },
    { icon: Users, label: t("communityLabel"), sub: t("communitySub"), action: () => onOpen("community") },
    { icon: ShoppingCart, label: t("shoppingLabel"), sub: shoppingCount > 0 ? `${shoppingCount} ${pl(shoppingCount, PL.listItem, language)}` : t("shoppingSub"), action: () => onOpen("shopping") },
    { icon: BookOpen, label: t("glossaryLabel"), sub: t("glossarySub"), action: () => onOpen("glossary") },
    { icon: SettingsIcon, label: t("settingsTitle"), sub: t("settingsSub"), action: onOpenSettings },
  ];
  return (
    <div style={styles.screenPad}>
      <h1 style={styles.h1}>{t("moreTitle")}</h1>
      <p style={styles.subtext}>{t("moreSubtitle")}</p>
      <div className="ms-more-grid" style={{ marginTop: 16 }}>
        {rows.map((r) => (
          <button key={r.label} onClick={r.action} style={styles.moreRow}>
            <div style={styles.moreRowIcon}><r.icon size={17} color={COLORS.primaryText} /></div>
            <div style={{ flex: 1, minWidth: 0, textAlign: "start" }}>
              <div style={styles.recipeName}>{r.label}</div>
              <div style={{ ...styles.recipeMeta, whiteSpace: "normal" }}>{r.sub}</div>
            </div>
            <ChevronRight className="ms-flip" size={16} color={COLORS.inkMuted} />
          </button>
        ))}
      </div>

      {onOpenRecipe && inspire.length > 0 && (
        <section style={{ marginTop: 26 }} aria-labelledby="ms-inspire">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div>
              <h2 id="ms-inspire" style={{ ...styles.h1, fontSize: 20, margin: 0 }}>{t("getInspired")}</h2>
              <p style={{ ...styles.subtext, marginTop: 2 }}>{t("getInspiredSub")}</p>
            </div>
            <button onClick={() => setInspireIds(pickRecipeIds(8))} style={{ ...styles.linkButton, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <RotateCcw size={13} color={COLORS.primaryText} /> {t("shuffleLabel")}
            </button>
          </div>
          <div className="ms-inspire-grid">
            {inspire.map((r) => (
              <button key={r.id} onClick={() => onOpenRecipe(r)} className="ms-inspire-tile" aria-label={recipeName(r, language)}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65)), url(${RECIPE_IMAGES[r.remixOf || r.id]})` }}>
                <span>{recipeName(r, language)}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CookbookScreen({ recipes, userRecipes, favorites, toggleFavorite, setFavoriteNote, onOpen, onEdit, onDelete, onShare, onCreateNew, onBack }) {
  const { t, language } = useContext(LanguageContext);
  const allForFavorites = [...recipes, ...userRecipes];
  const saved = allForFavorites.filter((r) => favorites[r.id]);
  return (
    <div style={styles.screenPad}>
      <button onClick={onBack} style={styles.backRow}>
        <ArrowLeft className="ms-flip" size={16} color={COLORS.inkMuted} />
        <span style={{ marginInlineStart: 6, color: COLORS.inkMuted, fontSize: 13 }}>{t("backLabel")}</span>
      </button>
      <h1 style={{ ...styles.h1, marginTop: 6 }}>{t("cookbookLabel")}</h1>
      <p style={styles.subtext}>{t("cookbookHeaderSub")}</p>

      <button onClick={onCreateNew} style={{ ...styles.primaryButton, marginTop: 16 }}>{t("createNewRecipeLabel")}</button>

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{t("myRecipesLabel")}</div>
      {userRecipes.length === 0 && <span style={{ ...styles.emptyText, marginTop: 6, display: "block" }}>{t("noPersonalRecipesYet")}</span>}
      {userRecipes.map((recipe) => (
        <div key={recipe.id} style={{ ...styles.historyCard, marginTop: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <RecipeImage recipe={recipe} height={56} />
            <div style={{ flex: 1 }}>
              <div style={styles.recipeCardTop}>
                <span style={styles.recipeName}>{recipeName(recipe, language)}</span>
                <button onClick={() => toggleFavorite(recipe.id)} style={styles.favButton}>
                  <Heart size={16} color={favorites[recipe.id] ? COLORS.accent : COLORS.inkMuted} fill={favorites[recipe.id] ? COLORS.accent : "none"} />
                </button>
              </div>
              <div style={styles.recipeMeta}>{recipe.remixOf ? `${t("yourTwistOnLabel")} ${recipe.remixOfName}` : recipeTime(recipe, language)}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => onOpen(recipe)} style={{ ...styles.primaryButton, marginTop: 0, flex: 1, padding: "10px 0", fontSize: 13 }}>{t("cookThisLabel")}</button>
            <button onClick={() => onEdit(recipe)} style={{ ...styles.resetButton, marginTop: 0 }}><Pencil size={14} color={COLORS.inkMuted} /></button>
            <button onClick={() => onShare(recipe)} style={{ ...styles.resetButton, marginTop: 0 }}><Users size={14} color={COLORS.inkMuted} /></button>
            <button onClick={() => onDelete(recipe.id)} style={{ ...styles.resetButton, marginTop: 0 }}><X size={14} color={COLORS.inkMuted} /></button>
          </div>
        </div>
      ))}

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>{t("savedRecipesLabel")}</div>
      {saved.length === 0 && <span style={{ ...styles.emptyText, marginTop: 6, display: "block" }}>{t("cookbookEmpty")}</span>}

      {saved.map((recipe) => (
        <div key={recipe.id} style={{ ...styles.historyCard, marginTop: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <RecipeImage recipe={recipe} height={56} />
            <div style={{ flex: 1 }}>
              <div style={styles.recipeCardTop}>
                <span style={styles.recipeName}>{recipeName(recipe, language)}</span>
                <button onClick={() => toggleFavorite(recipe.id)} style={styles.favButton}>
                  <Heart size={16} color={COLORS.accent} fill={COLORS.accent} />
                </button>
              </div>
              <div style={styles.recipeMeta}>{recipeTime(recipe, language)}</div>
            </div>
          </div>
          <input
            value={favorites[recipe.id]?.note || ""}
            onChange={(e) => setFavoriteNote(recipe.id, e.target.value)}
            placeholder={t("personalNotePlaceholder")}
            style={{ ...styles.textInput, marginTop: 10, fontSize: 12.5 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => onOpen(recipe)} style={{ ...styles.primaryButton, marginTop: 0, flex: 1, padding: "10px 0", fontSize: 13 }}>{t("cookThisLabel")}</button>
            <button onClick={() => onEdit(recipe)} style={{ ...styles.resetButton, marginTop: 0 }}>
              <Pencil size={14} color={COLORS.inkMuted} style={{ marginInlineEnd: 5 }} />
              {recipe.isUserRecipe ? t("editButtonLabel") : t("remixButtonLabel")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// "Where to buy" tip from Claude. Uses the published page's sample
// capability, which runs on the viewer's own Claude account. It has no web
// access, so the answer is Claude's general knowledge of which stores carry
// an item, labelled as such. Hidden wherever Claude isn't available.
const LANGUAGE_NAMES_EN = { en: "English", es: "Spanish", fr: "French", pt: "Portuguese", hi: "Hindi", zh: "Simplified Chinese", ar: "Arabic" };
let samplePromise = null;
function getSample() {
  if (!samplePromise) {
    samplePromise = typeof window !== "undefined" && window.claude && typeof window.claude.use === "function"
      ? window.claude.use("sample").catch(() => null)
      : Promise.resolve(null);
  }
  return samplePromise;
}
const SAMPLE_HIDE_CODES = new Set(["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"]);

function StoreTip({ term, countryLabel }) {
  const { t, language } = useContext(LanguageContext);
  const [sample, setSample] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error | busy | hidden
  const [result, setResult] = useState("");

  useEffect(() => {
    let alive = true;
    getSample().then((fn) => { if (alive) setSample(() => fn); });
    return () => { alive = false; };
  }, []);

  async function ask() {
    if (!sample) return;
    setStatus("loading");
    setResult("");
    const prompt = [
      `Which grocery or retail store chains in ${countryLabel} usually sell "${term}"?`,
      "Answer in 2-3 short sentences for a student shopping on a budget.",
      "Name real, well-known chains plainly, and mention the cheaper option if one is obvious.",
      "Do not give prices, URLs, store addresses or claims about current stock.",
      `Write the answer in ${LANGUAGE_NAMES_EN[language] || "English"}.`,
    ].join(" ");
    try {
      const { text } = await sample(prompt, {
        modelTier: "quick",
        cache: { gcTime: 24 * 60 * 60 * 1000 },
        onText: ({ text }) => setResult(text),
      });
      setResult(text || t("liveCheckEmpty"));
      setStatus("done");
    } catch (e) {
      if (SAMPLE_HIDE_CODES.has(e && e.code)) { setStatus("hidden"); return; }
      setResult((e && e.text) || "");
      setStatus(e && e.code === "rate_limited" ? "busy" : "error");
    }
  }

  if (!sample || status === "hidden") return null;
  if (status === "idle") {
    return <button onClick={ask} style={styles.liveCheckButton}>✨ {t("liveCheckLabel")}</button>;
  }
  if (status === "loading" && !result) {
    return <div style={styles.liveCheckResult}>{t("liveCheckLoading")}</div>;
  }
  if (status === "error" || status === "busy") {
    return (
      <div style={styles.liveCheckResult}>
        {result ? <div style={{ marginBottom: 4 }}>{result}</div> : null}
        {t(status === "busy" ? "liveCheckBusy" : "liveCheckError")}{" "}
        {status === "error" && <button onClick={ask} style={styles.liveCheckRetry}>{t("retryLabel")}</button>}
      </div>
    );
  }
  return (
    <div style={styles.liveCheckResult}>
      {result}
      <div style={{ fontSize: 11, color: COLORS.inkMuted, marginTop: 6 }}>{t("liveCheckNote")}</div>
    </div>
  );
}

function ShoppingScreen({ recipes, matchInfo, shoppingList, input, setInput, onAdd, onToggle, onRemove, onAddToKitchen, equipment, equipmentList, onBack }) {
  const { t, language } = useContext(LanguageContext);
  const [ingredientCountry, setIngredientCountry] = useState("ca");
  const tally = {};
  recipes.forEach((r) => {
    const info = matchInfo(r);
    if (!info.makeable) info.missingIngredients.forEach((ing) => { tally[ing] = (tally[ing] || 0) + 1; });
  });
  const suggestions = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const checkedCount = shoppingList.filter((s) => s.checked).length;
  const missingEquipment = equipmentList.filter((eq) => !equipment[eq.id]);
  const ingredientStores = STORES_INGREDIENTS_BY_COUNTRY[ingredientCountry] ?? STORES_INGREDIENTS_BY_COUNTRY.ca;
  const countryLabel = (COUNTRY_OPTIONS.find((c) => c.id === ingredientCountry)?.label || "").replace(/^\S+\s/, "");

  const StoreLinks = ({ term, stores }) => (
    <div style={{ ...styles.chipWrap, marginTop: 6 }}>
      {stores.map((store) => (
        <a key={store.name} href={store.search(term)} target="_blank" rel="noopener noreferrer" style={styles.buyStoreLink}>
          {store.name}
        </a>
      ))}
    </div>
  );


  return (
    <div style={styles.screenPad}>
      <button onClick={onBack} style={styles.backRow}>
        <ArrowLeft className="ms-flip" size={16} color={COLORS.inkMuted} />
        <span style={{ marginInlineStart: 6, color: COLORS.inkMuted, fontSize: 13 }}>{t("backLabel")}</span>
      </button>
      <h1 style={{ ...styles.h1, marginTop: 6 }}>{t("shoppingLabel")}</h1>
      <p style={styles.subtext}>{t("shoppingHeaderSub")}</p>
      <p style={{ ...styles.basicsHint, marginTop: 6 }}>{t("storeListDisclaimer")}</p>

      {missingEquipment.length > 0 && (
        <>
          <div style={{ ...styles.sectionLabel, marginTop: 18 }}>{t("equipmentSectionTitle")}</div>
          <div style={{ marginTop: 8 }}>
            {missingEquipment.map((eq) => {
              const label = EQUIPMENT_TR[eq.id] ? labelFor(EQUIPMENT_TR, eq.id, language) : eq.label;
              return (
                <div key={eq.id} style={styles.buyRow}>
                  <span style={styles.recipeName}>{label}</span>
                  <StoreLinks term={buildSearchTerm(eq.label)} stores={STORES_EQUIPMENT} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
        <div style={styles.sectionLabel}>{t("ingredientCountryLabel")}</div>
        <div style={{ display: "flex", gap: 6 }}>
          {COUNTRY_OPTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setIngredientCountry(c.id)}
              style={{ ...styles.unitToggleBtn, ...(ingredientCountry === c.id ? styles.unitToggleBtnActive : {}) }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {suggestions.length > 0 && (
        <>
          <div style={{ ...styles.sectionLabel, marginTop: 16 }}>{t("suggestedUnlocks")}</div>
          <div style={{ marginTop: 8 }}>
            {suggestions.map(([name, count]) => (
              <div key={name} style={styles.buyRow}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ ...styles.recipeName, textTransform: "capitalize" }}>
                    {ingredientLabel(name, language)} <span style={{ color: COLORS.inkMuted, fontWeight: 400 }}>({count})</span>
                  </span>
                  <button onClick={() => onAdd(name)} style={styles.resetButton}>+ {t("addLabel")}</button>
                </div>
                <StoreLinks term={buildSearchTerm(name)} stores={ingredientStores} />
                <StoreTip term={buildSearchTerm(name)} countryLabel={countryLabel} />
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ ...styles.sectionLabel, marginTop: 20 }}>{t("yourListLabel")}</div>
      <div style={styles.inputRow}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAdd(input)} placeholder={t("addItemPlaceholder")} style={styles.textInput} />
        <button onClick={() => onAdd(input)} style={styles.addButton}><Plus size={18} color="#fff" /></button>
      </div>

      {shoppingList.length === 0 && <span style={styles.emptyText}>{t("emptyListText")}</span>}
      {shoppingList.map((item) => (
        <div key={item.id} style={styles.buyRow}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => onToggle(item.id)} style={{ ...styles.shoppingCheck, ...(item.checked ? { background: COLORS.primary, border: `1px solid ${COLORS.primary}` } : {}) }}>
              {item.checked ? <Check size={13} color="#fff" /> : null}
            </button>
            <span style={{ flex: 1, textTransform: "capitalize", textDecoration: item.checked ? "line-through" : "none", color: item.checked ? COLORS.inkMuted : COLORS.ink }}>{item.name}</span>
            <button onClick={() => onRemove(item.id)} style={styles.chipX}><X size={14} color={COLORS.inkMuted} /></button>
          </div>
          {!item.checked && (
            <>
              <StoreLinks term={buildSearchTerm(item.name)} stores={ingredientStores} />
              <StoreTip term={buildSearchTerm(item.name)} countryLabel={countryLabel} />
            </>
          )}
        </div>
      ))}

      {checkedCount > 0 && (
        <button onClick={onAddToKitchen} style={styles.primaryButton}>{t("addLabel")} {checkedCount} {t("checkedToKitchenLabel")}</button>
      )}
    </div>
  );
}

function NutritionGlossaryScreen({ onBack }) {
  const { t, language } = useContext(LanguageContext);
  const [query, setQuery] = useState("");
  const entries = Object.entries(NUTRITION_FACTS)
    .filter(([key]) => !["eggs"].includes(key)) // avoid showing the egg/eggs duplicate twice
    .filter(([key]) => ingredientLabel(key, language).toLowerCase().includes(query.trim().toLowerCase()) || key.includes(query.trim().toLowerCase()))
    .sort((a, b) => ingredientLabel(a[0], language).localeCompare(ingredientLabel(b[0], language)));

  return (
    <div style={styles.screenPad}>
      <button onClick={onBack} style={styles.backRow}>
        <ArrowLeft className="ms-flip" size={16} color={COLORS.inkMuted} />
        <span style={{ marginInlineStart: 6, color: COLORS.inkMuted, fontSize: 13 }}>{t("backLabel")}</span>
      </button>
      <h1 style={{ ...styles.h1, marginTop: 6 }}>{t("glossaryLabel")}</h1>
      <p style={styles.subtext}>{t("glossarySub")}</p>

      <div style={{ position: "relative", marginTop: 14 }}>
        <Search size={16} color={COLORS.inkMuted} style={styles.searchIcon} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("glossarySearchPlaceholder")} style={{ ...styles.textInput, paddingInlineStart: 34 }} />
      </div>

      {entries.length === 0 && <span style={{ ...styles.emptyText, marginTop: 14, display: "block" }}>{t("glossaryEmpty")}</span>}

      <div style={{ marginTop: 14 }}>
        {entries.map(([key, f]) => (
          <div key={key} style={styles.glossaryRow}>
            <div>
              <div style={{ ...styles.recipeName, textTransform: "capitalize" }}>{ingredientLabel(key, language)}</div>
              <div style={styles.recipeMeta}>{f.qty}</div>
            </div>
            <div style={styles.glossaryMacros}>
              <span style={styles.macroChip}>{f.calories} kcal</span>
              <span style={styles.macroChip}>{f.protein}g {t("proteinWord").toLowerCase()}</span>
              <span style={styles.macroChip}>{f.carbs}g {t("carbsWord").toLowerCase()}</span>
              <span style={styles.macroChip}>{f.fat}g {t("fatWord").toLowerCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Community: tips, recipe feedback, improvement suggestions, short tutorials,
// shared recipes and star ratings, shared between everyone on the published
// page through the artifact's `db` store. Each cook writes one document,
// community/<their id>, holding their posts, their ratings and the posts they
// found helpful; the feed is everyone's documents put together. Outside the
// published page (local preview, tests) the same code runs against a store
// kept in this browser.
// ---------------------------------------------------------------------------
const COMMUNITY_KINDS = ["tip", "feedback", "suggestion", "tutorial", "recipe"];
const COMMUNITY_KIND_EMOJI = { tip: "💡", feedback: "⭐", suggestion: "🛠️", tutorial: "🎬", recipe: "📖" };
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const MAX_POSTS_PER_COOK = 200;
const EMPTY_COOK_DOC = { posts: [], ratings: {}, helpful: {} };

function localCommunityStore() {
  const KEY = "mysous:community_local";
  const listeners = new Set();
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
  const snap = () => {
    const all = read();
    return { docs: Object.keys(all).map((id) => ({ id, exists: true, data: () => all[id] })), metadata: { fromCache: false, hasPendingWrites: false } };
  };
  return {
    collection: () => ({
      onSnapshot(next) { listeners.add(next); next(snap()); return () => listeners.delete(next); },
      doc: (id) => ({
        async set(data) {
          const all = read();
          all[id] = data;
          try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full or blocked */ }
          listeners.forEach((fn) => fn(snap()));
        },
      }),
    }),
  };
}

async function getCapability(name) {
  try {
    const c = typeof window !== "undefined" ? window.claude : null;
    return c && typeof c.use === "function" ? await c.use(name) : null;
  } catch {
    return null;
  }
}

const CommunityContext = createContext({ ratingFor: () => ({ avg: 0, count: 0 }), myRating: () => 0, rate: () => {} });

function useCommunity() {
  const [state, setState] = useState({ ready: false, mode: "local", myId: "me", canWrite: true, isAdmin: true, canUpload: false, docs: {}, stale: false, notice: null });
  const [names, setNames] = useState({});
  const api = useRef({ store: null, user: null, assets: null });
  const docsRef = useRef({});
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let unsub = null;
    let cancelled = false;
    let timer = null;
    (async () => {
      const cloud = typeof window !== "undefined" ? window.mysousCloud : null;
      const [db, user, assets] = cloud ? [cloud.db, cloud.user, cloud.assets] : await Promise.all([getCapability("db"), getCapability("user"), getCapability("assets")]);
      if (cancelled) return;
      let store = localCommunityStore();
      let patch = { mode: "local", myId: "me", canWrite: true, isAdmin: true, canUpload: false };
      if (db) {
        store = db;
        const me = user ? await user.me() : { id: null, canEdit: false };
        const can = user ? await user.can("data.write") : null;
        patch = { mode: cloud ? "cloud" : "shared", myId: me.id, canWrite: !!me.id && can !== false, isAdmin: !!me.canEdit, canUpload: !!assets && !!me.id && can !== false };
      }
      if (cancelled) return;
      api.current = { store, user, assets };
      setState((s) => ({ ...s, ...patch }));
      if (cloud && patch.isAdmin) cloud.reports().then((list) => setState((s) => ({ ...s, reports: list }))).catch(() => {});
      timer = setTimeout(() => setState((s) => (s.ready ? s : { ...s, stale: true, ready: true })), 10000);
      unsub = store.collection("community").onSnapshot(
        (snap) => {
          const docs = {};
          snap.docs.forEach((d) => { docs[d.id] = { ...EMPTY_COOK_DOC, ...(d.data() || {}) }; });
          docsRef.current = docs;
          const live = !snap.metadata || !snap.metadata.fromCache;
          if (live) clearTimeout(timer);
          setState((s) => ({ ...s, docs, ready: true, stale: live ? false : s.stale }));
        },
        () => { clearTimeout(timer); setState((s) => ({ ...s, ready: true, stale: true })); },
      );
    })();
    return () => { cancelled = true; clearTimeout(timer); if (unsub) unsub(); };
  }, []);

  // Resolve display names for everyone in the feed, every time the set of
  // cooks changes (profiles() is cached and cheap by contract).
  const authorKey = Object.keys(state.docs).sort().join(",");
  useEffect(() => {
    const user = api.current.user;
    if (!user || !authorKey) return;
    let live = true;
    user.profiles(authorKey.split(",")).then((ps) => { if (live) setNames(ps || {}); }).catch(() => {});
    return () => { live = false; };
  }, [authorKey]);

  async function writeDoc(ownerId, mutate) {
    const { store } = api.current;
    const s = stateRef.current;
    if (!store || !ownerId) return false;
    const current = docsRef.current[ownerId] || EMPTY_COOK_DOC;
    const next = mutate({ posts: [...(current.posts || [])], ratings: { ...(current.ratings || {}) }, helpful: { ...(current.helpful || {}) } });
    next.posts = next.posts.slice(0, MAX_POSTS_PER_COOK);
    try {
      await store.collection("community").doc(ownerId).set(next);
      return true;
    } catch (e) {
      const code = e && e.code;
      if (code === "invalid_argument" && ownerId === s.myId) setState((p) => ({ ...p, canWrite: false, canUpload: false, notice: "saveFailed" }));
      else setState((p) => ({ ...p, notice: code === "quota_exceeded" || code === "resource_exhausted" ? "communityFull" : "saveFailed" }));
      return false;
    }
  }

  const mine = (fn) => (stateRef.current.canWrite ? writeDoc(stateRef.current.myId, fn) : Promise.resolve(false));

  function addPost(post) {
    const full = { ...post, id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now() };
    return mine((d) => {
      d.posts = [full, ...d.posts];
      if (full.kind === "feedback" && full.recipeId && full.rating) d.ratings[full.recipeId] = full.rating;
      return d;
    });
  }

  function removePost(authorId, postId) {
    const s = stateRef.current;
    const post = (docsRef.current[authorId]?.posts || []).find((p) => p.id === postId);
    if (post && post.videoId && authorId === s.myId && api.current.assets) api.current.assets.delete(post.videoId).catch(() => {});
    if (authorId === s.myId) return mine((d) => { d.posts = d.posts.filter((p) => p.id !== postId); return d; });
    if (s.isAdmin) {
      if (typeof window !== "undefined" && window.mysousCloud) window.mysousCloud.clearReports(authorId, postId).catch(() => {});
      return writeDoc(authorId, (d) => { d.posts = d.posts.filter((p) => p.id !== postId); return d; });
    }
    return Promise.resolve(false);
  }

  function toggleHelpful(authorId, postId) {
    const key = `${authorId}:${postId}`;
    return mine((d) => { if (d.helpful[key]) delete d.helpful[key]; else d.helpful[key] = true; return d; });
  }

  function rate(recipeId, stars) {
    if (!recipeId || String(recipeId).startsWith("user-") || String(recipeId).startsWith("shared-")) return Promise.resolve(false);
    return mine((d) => { d.ratings[recipeId] = stars; return d; });
  }

  async function uploadVideo(file) {
    const { assets } = api.current;
    if (!assets) throw new Error("no_assets");
    const res = await assets.upload(file, { name: file.name });
    return res.id;
  }

  // Derived views
  const posts = [];
  const helpfulCount = {};
  for (const [uid, d] of Object.entries(state.docs)) {
    for (const key of Object.keys(d.helpful || {})) helpfulCount[key] = (helpfulCount[key] || 0) + 1;
    for (const p of d.posts || []) if (p && p.id && COMMUNITY_KINDS.includes(p.kind)) posts.push({ ...p, authorId: uid });
  }
  posts.forEach((p) => { p.helpful = helpfulCount[`${p.authorId}:${p.id}`] || 0; });

  const ratingFor = (recipeId) => {
    let sum = 0;
    let count = 0;
    for (const d of Object.values(state.docs)) {
      const v = Number(d.ratings && d.ratings[recipeId]);
      if (v >= 1 && v <= 5) { sum += v; count += 1; }
    }
    return { avg: count ? sum / count : 0, count };
  };
  const myDoc = state.docs[state.myId] || EMPTY_COOK_DOC;
  const myRating = (recipeId) => Number(myDoc.ratings && myDoc.ratings[recipeId]) || 0;
  const isHelpfulByMe = (authorId, postId) => !!(myDoc.helpful && myDoc.helpful[`${authorId}:${postId}`]);
  const nameOf = (uid) => (uid === state.myId ? null : (names[uid] && names[uid].name) || "");
  const avatarOf = (uid) => (names[uid] && names[uid].avatarUrl) || null;

  const cloud = typeof window !== "undefined" ? window.mysousCloud : null;
  const reportCount = (authorId, postId) => (state.reports || []).filter((r) => r.author_id === authorId && r.post_id === postId).length;
  async function reportPost(authorId, postId) { return cloud ? cloud.report(authorId, postId) : false; }
  const videoSrc = (id) => (cloud ? cloud.videoSrc(id) : /^[0-9a-f]{32}$/i.test(String(id)) ? "/_blob/" + id : null);

  return {
    ...state, posts, ratingFor, reportCount, reportPost, videoSrc, canSignIn: !!(cloud && cloud.isGuest), signIn: () => cloud && cloud.signIn(), myRating, isHelpfulByMe, nameOf, avatarOf,
    addPost, removePost, toggleHelpful, rate, uploadVideo,
    clearNotice: () => setState((s) => ({ ...s, notice: null })),
  };
}

function RatingBadge({ recipeId, compact }) {
  const { t } = useContext(LanguageContext);
  const { ratingFor } = useContext(CommunityContext);
  const { avg, count } = ratingFor(recipeId);
  if (!count) return null;
  return (
    <span style={{ ...styles.mealTimeBadge, marginInlineEnd: 6, background: COLORS.accentSofter, color: COLORS.accentText }} title={t("communityRatingLabel")}>
      ★ {avg.toFixed(1)}{compact ? "" : ` · ${count} ${t("ratingsWord")}`}
    </span>
  );
}

function StarPicker({ value, onChange, size = 20, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }} role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n}`} onClick={() => onChange(n === value ? 0 : n)} style={styles.starButton}>
          <Star size={size} color={n <= value ? COLORS.accent : COLORS.line} fill={n <= value ? COLORS.accent : "none"} />
        </button>
      ))}
    </div>
  );
}

const safeLink = (url) => {
  try {
    const u = new URL(String(url || "").trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
};

function CommunityVideo({ src }) {
  const { t } = useContext(LanguageContext);
  const [failed, setFailed] = useState(false);
  if (!src) return null;
  if (failed) return <div style={{ ...styles.recipeMeta, marginTop: 8 }}>{t("videoUnavailable")}</div>;
  return <video controls preload="metadata" playsInline src={src} onError={() => setFailed(true)} style={{ width: "100%", maxHeight: 360, borderRadius: 12, marginTop: 10, background: "#000" }} />;
}

function CommunityScreen({ community, recipes, onOpenRecipe, onSaveSharedRecipe, onBack }) {
  const { t, language } = useContext(LanguageContext);
  const c = community;
  const [kind, setKind] = useState("tip");
  const [text, setText] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [rating, setRating] = useState(0);
  const [link, setLink] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | error | tooBig
  const [hint, setHint] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [savedIds, setSavedIds] = useState({});
  const [reported, setReported] = useState({});
  const fileRef = useRef(null);

  const recipeOptions = recipes
    .filter((r) => !r.isUserRecipe)
    .map((r) => ({ id: r.id, label: recipeName(r, language) }))
    .sort((a, b) => a.label.localeCompare(b.label, language));
  const recipeById = (id) => recipes.find((r) => r.id === id);
  const needsRecipe = kind === "feedback" || kind === "suggestion";

  function resetComposer() {
    setText(""); setRating(0); setLink(""); setVideoId(null); setUploadState("idle"); setHint(null);
  }

  async function onPickVideo(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) { setUploadState("tooBig"); return; }
    setUploadState("uploading");
    try {
      setVideoId(await c.uploadVideo(file));
      setUploadState("idle");
    } catch {
      setUploadState("error");
    }
  }

  async function submit() {
    const body = text.trim();
    const url = safeLink(link);
    if (needsRecipe && !recipeId) { setHint("needRecipe"); return; }
    if (link.trim() && !url) { setHint("badLink"); return; }
    if (kind === "tutorial" && !url && !videoId) { setHint("needLinkOrVideo"); return; }
    if (!body && !(kind === "feedback" && rating)) { setHint("needText"); return; }
    const post = { kind, text: body.slice(0, 2000) };
    if (recipeId) post.recipeId = recipeId;
    if (kind === "feedback" && rating) post.rating = rating;
    if (url) post.link = url;
    if (videoId) post.videoId = videoId;
    const ok = await c.addPost(post);
    if (ok) resetComposer();
  }

  let feed = c.posts.filter((p) => filter === "all" || p.kind === filter);
  feed = feed.sort((a, b) => (sort === "helpful" ? b.helpful - a.helpful || b.createdAt - a.createdAt : b.createdAt - a.createdAt));

  const placeholders = { tip: "placeholderTip", feedback: "placeholderFeedback", suggestion: "placeholderSuggestion", tutorial: "placeholderTutorial" };
  const kindLabel = (k) => t("kind_" + k);

  return (
    <div style={styles.screenPad}>
      <button onClick={onBack} style={styles.backRow}>
        <ArrowLeft className="ms-flip" size={16} color={COLORS.inkMuted} />
        <span style={{ marginInlineStart: 6, color: COLORS.inkMuted, fontSize: 13 }}>{t("backLabel")}</span>
      </button>
      <h1 style={{ ...styles.h1, marginTop: 6 }}>{t("communityLabel")}</h1>
      <p style={styles.subtext}>{t("communityHeaderSub")}</p>

      {c.mode === "local" && !c.canSignIn && <div style={styles.communityNote}>{t("communityLocalNote")}</div>}
      {c.stale && <div style={styles.communityNote}>{t("communityStaleNote")}</div>}
      {c.notice && (
        <div style={{ ...styles.communityNote, background: COLORS.accentSofter, color: COLORS.accentText }}>
          {t(c.notice)} <button onClick={c.clearNotice} style={styles.linkButton}>{t("dismissLabel")}</button>
        </div>
      )}

      {c.canWrite ? (
        <div style={{ ...styles.historyCard, marginTop: 14 }}>
          <div style={styles.sectionLabelTight}>{t("composeTitle")}</div>
          <div style={styles.chipWrap}>
            {["tip", "feedback", "suggestion", "tutorial"].map((k) => (
              <button key={k} onClick={() => { setKind(k); setHint(null); }} aria-pressed={kind === k} style={{ ...styles.equipChip, ...(kind === k ? styles.equipChipActive : {}) }}>
                {COMMUNITY_KIND_EMOJI[k]} {kindLabel(k)}
              </button>
            ))}
          </div>

          <select value={recipeId} onChange={(e) => { setRecipeId(e.target.value); setHint(null); }} style={{ ...styles.textInput, marginTop: 10 }} aria-label={needsRecipe ? t("pickRecipe") : t("recipeOptional")}>
            <option value="">{needsRecipe ? t("pickRecipe") : t("recipeOptional")}</option>
            {recipeOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>

          {kind === "feedback" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <span style={styles.recipeMeta}>{t("yourRating")}</span>
              <StarPicker value={rating} onChange={setRating} label={t("yourRating")} />
            </div>
          )}

          <textarea value={text} onChange={(e) => { setText(e.target.value); setHint(null); }} placeholder={t(placeholders[kind])} rows={3} maxLength={2000} style={{ ...styles.textInput, marginTop: 10, resize: "vertical", minHeight: 74 }} />

          {kind === "tutorial" && (
            <>
              <input value={link} onChange={(e) => { setLink(e.target.value); setHint(null); }} placeholder={t("tutorialLink")} inputMode="url" dir="ltr" style={{ ...styles.textInput, marginTop: 10 }} />
              {c.canUpload && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <input ref={fileRef} type="file" accept="video/*" onChange={onPickVideo} style={{ display: "none" }} />
                  {videoId ? (
                    <>
                      <span style={styles.readyBadge}><Check size={11} style={{ marginInlineEnd: 3 }} /> {t("videoAttached")}</span>
                      <button onClick={() => setVideoId(null)} style={styles.linkButton}>{t("removeLabel")}</button>
                    </>
                  ) : (
                    <button onClick={() => fileRef.current && fileRef.current.click()} disabled={uploadState === "uploading"} style={{ ...styles.resetButton, marginTop: 0 }}>
                      🎬 {uploadState === "uploading" ? t("uploadingLabel") : t("uploadVideo")}
                    </button>
                  )}
                  {uploadState === "tooBig" && <span style={styles.recipeMeta}>{t("videoTooBig")}</span>}
                  {uploadState === "error" && <span style={styles.recipeMeta}>{t("uploadFailed")}</span>}
                </div>
              )}
            </>
          )}

          {hint && <div style={{ ...styles.recipeMeta, color: COLORS.accentText, marginTop: 8 }}>{t(hint)}</div>}
          <button onClick={submit} disabled={uploadState === "uploading"} style={{ ...styles.primaryButton, marginTop: 12 }}>{t("postButton")}</button>
        </div>
      ) : c.canSignIn ? (
        <div style={styles.communityNote}>
          {t("communitySignIn")}{" "}
          <button onClick={c.signIn} style={{ ...styles.linkButton, fontWeight: 700, textDecoration: "underline" }}>{t("signInLabel")}</button>
        </div>
      ) : (
        <div style={styles.communityNote}>{t("communityReadOnly")}</div>
      )}

      <div style={{ ...styles.chipWrap, marginTop: 18 }}>
        {["all", ...COMMUNITY_KINDS].map((k) => (
          <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} style={{ ...styles.equipChip, ...(filter === k ? styles.equipChipActive : {}), padding: "6px 11px", fontSize: 12.5 }}>
            {k === "all" ? t("filterAll") : `${COMMUNITY_KIND_EMOJI[k]} ${kindLabel(k)}`}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
        {["newest", "helpful"].map((k) => (
          <button key={k} onClick={() => setSort(k)} style={{ ...styles.linkButton, fontWeight: sort === k ? 700 : 400, color: sort === k ? COLORS.primaryText : COLORS.inkMuted }}>
            {t(k === "newest" ? "sortNewest" : "sortHelpful")}
          </button>
        ))}
      </div>

      {!c.ready && <span style={{ ...styles.emptyText, marginTop: 14, display: "block" }}>{t("liveCheckLoading")}</span>}
      {c.ready && feed.length === 0 && <span style={{ ...styles.emptyText, marginTop: 14, display: "block" }}>{t("communityEmpty")}</span>}

      {feed.map((p) => {
        const mineP = p.authorId === c.myId;
        const author = mineP ? t("youLabel") : c.nameOf(p.authorId) || t("someoneLabel");
        const avatar = mineP ? null : c.avatarOf(p.authorId);
        const recipe = p.recipeId ? recipeById(p.recipeId) : null;
        const helpfulMine = c.isHelpfulByMe(p.authorId, p.id);
        const shared = p.kind === "recipe" && p.recipe && typeof p.recipe === "object" ? p.recipe : null;
        const sharedKey = `${p.authorId}:${p.id}`;
        return (
          <div key={sharedKey} style={{ ...styles.historyCard, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {avatar ? <img src={avatar} alt="" width={26} height={26} style={{ borderRadius: 13 }} /> : <span style={styles.avatarDot}>{author.slice(0, 1).toUpperCase()}</span>}
              <span style={styles.recipeName}>{author}</span>
              <span style={{ ...styles.mealTimeBadge, marginInlineStart: "auto" }}>{COMMUNITY_KIND_EMOJI[p.kind]} {kindLabel(p.kind)}</span>
            </div>
            <div style={{ ...styles.recipeMeta, marginTop: 4 }}>{whenLabel({ at: p.createdAt }, language)}</div>

            {recipe && (
              <button onClick={() => onOpenRecipe(recipe)} style={{ ...styles.linkButton, display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <RecipeImage recipe={recipe} height={34} />
                <span style={{ color: COLORS.primaryText, fontWeight: 600 }}>{recipeName(recipe, language)}</span>
                <ChevronRight className="ms-flip" size={14} color={COLORS.inkMuted} />
              </button>
            )}
            {p.rating ? <div style={{ color: COLORS.accent, marginTop: 6, letterSpacing: 1 }} aria-label={`${p.rating}/5`}>{"★".repeat(p.rating)}<span style={{ color: COLORS.line }}>{"★".repeat(5 - p.rating)}</span></div> : null}
            {p.text ? <div style={{ ...styles.milestoneValue, marginTop: 6, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{p.text}</div> : null}

            {shared && (
              <div style={{ ...styles.milestoneCard, marginTop: 8 }}>
                <div style={styles.recipeName}>{shared.emoji || "🍽️"} {String(shared.name || "")}</div>
                {Array.isArray(shared.ingredients) && <div style={{ ...styles.recipeMeta, marginTop: 4 }}>{shared.ingredients.slice(0, 12).join(", ")}</div>}
                <button
                  onClick={() => { onSaveSharedRecipe(shared, p.authorId); setSavedIds((s) => ({ ...s, [sharedKey]: true })); }}
                  disabled={!!savedIds[sharedKey]}
                  style={{ ...styles.resetButton, marginTop: 8 }}
                >
                  {savedIds[sharedKey] ? `✓ ${t("savedLabel")}` : t("saveToCookbook")}
                </button>
              </div>
            )}

            {safeLink(p.link) && (
              <a href={safeLink(p.link)} target="_blank" rel="noopener noreferrer nofollow" dir="ltr" style={{ display: "inline-block", marginTop: 8, color: COLORS.primaryText, fontSize: 13, overflowWrap: "anywhere" }}>
                ▶ {safeLink(p.link)}
              </a>
            )}
            {p.videoId && <CommunityVideo src={c.videoSrc(p.videoId)} />}

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
              <button onClick={() => c.toggleHelpful(p.authorId, p.id)} disabled={!c.canWrite || mineP} style={{ ...styles.likeButton, marginTop: 0, opacity: !c.canWrite || mineP ? 0.7 : 1 }} aria-pressed={helpfulMine}>
                <ThumbsUp size={13} color={helpfulMine ? COLORS.primary : COLORS.inkMuted} fill={helpfulMine ? COLORS.sage : "none"} style={{ marginInlineEnd: 5 }} />
                <span style={styles.recipeMeta}>{t("helpfulLabel")} · {p.helpful}</span>
              </button>
              {(mineP || c.isAdmin) && c.canWrite && (
                <button onClick={() => c.removePost(p.authorId, p.id)} style={{ ...styles.linkButton, color: COLORS.inkMuted, fontSize: 12 }}>{t("deleteLabel")}</button>
              )}
              {c.mode === "cloud" && c.canWrite && !mineP && !c.isAdmin && (
                <button onClick={async () => { if (await c.reportPost(p.authorId, p.id)) setReported((r) => ({ ...r, [sharedKey]: true })); }} disabled={!!reported[sharedKey]} style={{ ...styles.linkButton, color: COLORS.inkMuted, fontSize: 12 }}>
                  {reported[sharedKey] ? t("reportedThanks") : t("reportLabel")}
                </button>
              )}
              {c.isAdmin && c.reportCount(p.authorId, p.id) > 0 && (
                <span style={{ ...styles.mealTimeBadge, background: COLORS.accentSoft, color: COLORS.accentText }}>⚑ {t("reportedLabel")} · {c.reportCount(p.authorId, p.id)}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  outer: { position: "relative", width: "100%", minHeight: "100vh", background: COLORS.paper, color: COLORS.ink, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "28px 12px", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" },
  phone: { width: 390, maxWidth: "100%", height: 780, background: COLORS.card, borderRadius: 28, boxShadow: "0 1px 2px rgba(51,53,47,0.04), 0 20px 40px var(--ms-shadow)", zIndex: 1, border: `1px solid ${COLORS.line}`, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" },
  statusRow: { padding: "18px 20px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${COLORS.line}`, background: COLORS.card, position: "relative", zIndex: 1 },
  desktopFrame: { width: "100%", maxWidth: 1280, height: "calc(100vh - 40px)", minHeight: 560, borderRadius: 18 },
  tabBarDesktop: { padding: "10px max(24px, calc(50% - 300px)) 14px" },
  desktopNav: { display: "flex", gap: 4, marginInlineEnd: 12 },
  desktopNavBtn: { display: "flex", alignItems: "center", gap: 7, border: "none", background: "transparent", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13.5, fontWeight: 500, color: COLORS.inkMuted, fontFamily: "'Inter', sans-serif" },
  desktopNavBtnActive: { background: COLORS.sage, color: COLORS.primaryText, fontWeight: 600 },
  viewToggle: { display: "flex", background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 2, flexShrink: 0 },
  viewToggleBtn: { display: "flex", alignItems: "center", gap: 5, border: "none", background: "transparent", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 11.5, color: COLORS.inkMuted, fontFamily: "'Inter', sans-serif" },
  viewToggleBtnActive: { background: COLORS.card, color: COLORS.ink, fontWeight: 600, boxShadow: "0 1px 2px rgba(51,53,47,0.08)" },
  viewToggleLabel: { lineHeight: 1 },
  brand: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: COLORS.ink },
  brandSub: { marginInlineStart: 8, fontSize: 11, color: COLORS.inkMuted, letterSpacing: "0.03em", flex: 1 },
  settingsButton: { background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  screenArea: { flex: 1, overflowY: "auto", position: "relative", zIndex: 1 },
  screenPad: { padding: "20px 20px 24px", height: "100%", boxSizing: "border-box" },
  h1: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 26, color: COLORS.ink, margin: 0 },
  subtext: { fontSize: 13, color: COLORS.inkMuted, marginTop: 4, marginBottom: 0 },
  sectionLabel: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.inkMuted, marginBottom: 10, marginTop: 18 },
  basicsHint: { fontSize: 12, color: COLORS.inkMuted, marginTop: -4, marginBottom: 10 },
  rowPair: { display: "flex", gap: 8, marginTop: 12 },
  unitToggle: { display: "flex", background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 2 },
  unitToggleBtn: { padding: "3px 9px", border: "none", background: "transparent", borderRadius: 6, fontSize: 11, fontWeight: 500, color: COLORS.inkMuted, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  unitToggleBtnActive: { background: COLORS.card, color: COLORS.ink, fontWeight: 600, boxShadow: "0 1px 2px rgba(51,53,47,0.08)" },
  targetCard: { marginTop: 16, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 },
  targetRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  targetLabel: { fontSize: 13, color: COLORS.inkMuted },
  targetValue: { fontSize: 16, fontWeight: 600, color: COLORS.ink, minWidth: 30, textAlign: "center" },
  stepperRow: { display: "flex", alignItems: "center", gap: 12 },
  servingsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "10px 14px" },
  stepperButton: { width: 28, height: 28, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.card, fontSize: 16, color: COLORS.ink, cursor: "pointer", lineHeight: 1 },
  macroNumberInput: { width: 90, textAlign: "end", padding: "6px 10px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 15, fontWeight: 600, color: COLORS.ink, background: COLORS.card, fontFamily: "'Inter', sans-serif" },
  macroSlider: { width: "100%", marginTop: 8, accentColor: COLORS.primary },
  macroRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 },
  macroChip: { fontSize: 11.5, color: COLORS.inkMuted, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 20, padding: "3px 10px" },
  macroGrid: { display: "flex", gap: 8, marginTop: 8 },
  macroCell: { flex: 1, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "10px 4px", textAlign: "center" },
  macroCellValue: { fontSize: 15, fontWeight: 600, color: COLORS.ink },
  macroCellLabel: { fontSize: 10, color: COLORS.inkMuted, marginTop: 2 },
  chipWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  equipChip: { display: "flex", alignItems: "center", padding: "7px 13px", borderRadius: 20, border: `1px solid ${COLORS.line}`, background: COLORS.card, fontSize: 13, color: COLORS.inkMuted, cursor: "pointer" },
  equipChipActive: { background: COLORS.sage, border: `1px solid ${COLORS.primary}`, color: COLORS.ink, fontWeight: 500 },
  basicChipOff: { background: COLORS.paper, color: COLORS.inkMuted },
  ingredientChip: { display: "flex", alignItems: "center", padding: "6px 6px 6px 12px", borderRadius: 20, background: COLORS.paper, border: `1px solid ${COLORS.line}`, fontSize: 13, color: COLORS.ink },
  ingredientMeta: { fontSize: 11, color: COLORS.inkMuted },
  favButton: { background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" },
  chipX: { background: "none", border: "none", cursor: "pointer", marginInlineStart: 6, padding: 4, display: "flex" },
  inputRow: { display: "flex", gap: 8, marginBottom: 12 },
  textInput: { flex: 1, width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: `1px solid ${COLORS.line}`, fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", color: COLORS.ink, background: COLORS.paper },
  selectInput: { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: `1px solid ${COLORS.line}`, fontSize: 13.5, fontFamily: "'Inter', sans-serif", outline: "none", color: COLORS.ink, background: COLORS.paper, appearance: "auto", cursor: "pointer" },
  addButton: { width: 40, height: 40, borderRadius: 12, background: COLORS.primary, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  resetButton: { display: "flex", alignItems: "center", padding: "10px 14px", borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.paper, color: COLORS.inkMuted, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  goCookButton: { marginTop: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 12, border: "none", background: COLORS.primary, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  prevStepButton: { padding: "0 20px", borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.card, color: COLORS.ink, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  emptyText: { fontSize: 13, color: COLORS.inkMuted, fontStyle: "italic" },
  recipeImage: { width: 64, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  recipeCard: { background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer" },
  recipeCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  recipeName: { fontSize: 15, fontWeight: 600, color: COLORS.ink },
  recipeMetaRow: { marginTop: 5, display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 4, columnGap: 10 },
  recipeMeta: { fontSize: 12, color: COLORS.inkMuted, whiteSpace: "nowrap" },
  recipeDot: { margin: "0 6px", color: COLORS.line },
  dietPill: { fontSize: 10.5, color: COLORS.inkMuted, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 20, padding: "2px 8px" },
  mealTimeRow: { display: "flex", gap: 8, marginTop: 14 },
  mealTimeChip: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 4px", borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.card, cursor: "pointer", color: COLORS.inkMuted, fontFamily: "'Inter', sans-serif" },
  mealTimeChipActive: { background: COLORS.sage, border: `1px solid ${COLORS.primary}`, color: COLORS.ink, fontWeight: 600 },
  mealTimeBadge: { fontSize: 10.5, fontWeight: 600, color: COLORS.accentText, background: COLORS.accentSofter, borderRadius: 20, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" },
  modeRow: { display: "flex", background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 3, marginTop: 14 },
  modeButton: { flex: 1, padding: "8px 0", border: "none", background: "transparent", borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.inkMuted, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  modeButtonActive: { background: COLORS.card, color: COLORS.ink, fontWeight: 600, boxShadow: "0 1px 2px rgba(51,53,47,0.08)" },
  searchIcon: { position: "absolute", insetInlineStart: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  readyBadge: { display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: COLORS.primaryText, background: COLORS.sage, padding: "3px 9px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" },
  missingBadge: { fontSize: 11, fontWeight: 600, color: COLORS.accentText, background: COLORS.accentSofter, padding: "3px 9px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" },
  missingText: { marginTop: 8, fontSize: 12, color: COLORS.inkMuted },
  backRow: { display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 4 },
  progressTrack: { height: 4, background: COLORS.line, borderRadius: 2, marginTop: 16, overflow: "hidden" },
  progressFill: { height: "100%", background: COLORS.primary, transition: "width 0.3s ease" },
  stepCounter: { fontSize: 11, color: COLORS.inkMuted, marginTop: 8, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" },
  stepInstruction: { fontSize: 19, lineHeight: 1.4, color: COLORS.ink, marginTop: 18, fontWeight: 500 },
  milestoneCard: { marginTop: 22, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 },
  milestoneRow: { display: "flex", alignItems: "flex-start" },
  milestoneDivider: { height: 1, background: COLORS.line, margin: "12px 0" },
  milestoneLabel: { fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.inkMuted, marginBottom: 3 },
  milestoneValue: { fontSize: 14, color: COLORS.ink, lineHeight: 1.4 },
  primaryButton: { marginTop: 26, width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: COLORS.primary, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  chatArea: { flex: 1, overflowY: "auto", marginTop: 14, display: "flex", flexDirection: "column", gap: 10, paddingBottom: 10 },
  chatBubbleRow: { display: "flex" },
  chatBubble: { maxWidth: "78%", padding: "10px 14px", borderRadius: 16, fontSize: 13.5, lineHeight: 1.45 },
  chatBubbleAi: { background: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink, borderBottomLeftRadius: 4 },
  chatBubbleUser: { background: COLORS.primary, color: "#fff", borderBottomRightRadius: 4 },
  typingBubble: { display: "flex", gap: 4, alignItems: "center", padding: "13px 16px" },
  typingDot: { width: 6, height: 6, borderRadius: "50%", background: COLORS.inkMuted, display: "inline-block", animation: "sousTypingBounce 1.1s infinite ease-in-out" },
  quickRow: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10 },
  quickChip: { flexShrink: 0, padding: "7px 12px", borderRadius: 20, border: `1px solid ${COLORS.line}`, background: COLORS.paper, fontSize: 12, color: COLORS.ink, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" },
  historyCard: { background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 },
  starButton: { background: "none", border: "none", cursor: "pointer", padding: 2 },
  tabBar: { display: "flex", borderTop: `1px solid ${COLORS.line}`, padding: "10px 6px 14px", background: COLORS.card, position: "relative", zIndex: 1 },
  tabButton: { flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 0" },
  tabLabel: { fontSize: 10.5 },
  exitButton: { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px 9px 12px", marginBottom: 10, borderRadius: 22, border: `1px solid ${COLORS.line}`, background: COLORS.card, color: COLORS.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", minHeight: 44 },
  cookToolButton: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 20, border: `1px solid ${COLORS.line}`, background: COLORS.sageSofter, color: COLORS.primaryText, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  timerBar: { position: "sticky", top: 0, zIndex: 3, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 12, borderRadius: 14, background: COLORS.sage, color: COLORS.primaryText, boxShadow: "0 2px 10px var(--ms-shadow)" },
  timerBarDone: { background: COLORS.accent, color: COLORS.onInk },
  timerBtn: { border: "none", background: "rgba(255,255,255,0.55)", color: "inherit", borderRadius: 16, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  toast: { position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)", background: COLORS.ink, color: COLORS.onInk, padding: "10px 16px", borderRadius: 10, fontSize: 12.5, whiteSpace: "nowrap", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" },
  homeSnapshotRow: { display: "flex", gap: 8, marginTop: 16 },
  homeSnapshotCard: { flex: 1, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "10px 4px", textAlign: "center", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  homeSnapshotValue: { fontSize: 18, fontWeight: 600, color: COLORS.ink },
  homeSnapshotLabel: { fontSize: 10.5, color: COLORS.inkMuted, marginTop: 2 },
  homeAiButton: { marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 12, border: "none", background: COLORS.primary, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  tipCard: { marginTop: 16, background: COLORS.sageSofter, border: `1px solid ${COLORS.sage}`, borderRadius: 14, padding: 14 },
  moreRow: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 4px", border: "none", borderBottom: `1px solid ${COLORS.line}`, background: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  moreRowIcon: { width: 34, height: 34, borderRadius: 10, background: COLORS.sage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  achievementBadge: { fontSize: 11, fontWeight: 600, color: COLORS.ink, background: COLORS.accentSofter, border: `1px solid ${COLORS.accentSoft}`, borderRadius: 20, padding: "5px 10px" },
  achievementBadgeLocked: { color: COLORS.inkMuted, background: COLORS.paper, border: `1px solid ${COLORS.line}`, opacity: 0.6 },
  communityNote: { marginTop: 12, padding: "10px 12px", borderRadius: 12, background: COLORS.sageSofter, color: COLORS.primaryText, fontSize: 13, lineHeight: 1.45 },
  linkButton: { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", color: COLORS.primaryText, textAlign: "start" },
  sectionLabelTight: { fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: COLORS.inkMuted, marginBottom: 8 },
  avatarDot: { width: 26, height: 26, borderRadius: 13, background: COLORS.sage, color: COLORS.primaryText, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  likeButton: { display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", marginTop: 8, padding: 0 },
  shoppingRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 2px", borderBottom: `1px solid ${COLORS.line}` },
  glossaryRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "12px 2px", borderBottom: `1px solid ${COLORS.line}` },
  buyRow: { padding: "10px 2px", borderBottom: `1px solid ${COLORS.line}` },
  buyStatusBadge: { fontSize: 10.5, fontWeight: 600, borderRadius: 20, padding: "2px 8px", marginInlineStart: 4 },
  buyStatusOwned: { background: COLORS.sage, color: COLORS.primaryText },
  buyStatusMissing: { background: COLORS.paper, color: COLORS.inkMuted },
  buyStoreLink: { fontSize: 12, fontWeight: 600, color: COLORS.accentText, background: COLORS.accentSofter, border: `1px solid ${COLORS.accentSoft}`, borderRadius: 20, padding: "6px 12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 },
  liveCheckButton: { fontSize: 12, fontWeight: 600, color: COLORS.inkMuted, background: "transparent", border: `1px dashed ${COLORS.line}`, borderRadius: 20, padding: "6px 12px", marginTop: 6, cursor: "pointer" },
  liveCheckResult: { fontSize: 12.5, color: COLORS.ink, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "8px 10px", marginTop: 6, lineHeight: 1.4 },
  liveCheckRetry: { fontSize: 12, fontWeight: 600, color: COLORS.accentText, background: "none", border: "none", padding: 0, marginInlineStart: 4, cursor: "pointer", textDecoration: "underline" },
  glossaryMacros: { display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end", maxWidth: 160 },
  shoppingCheck: { width: 20, height: 20, borderRadius: 6, border: `1px solid ${COLORS.line}`, background: COLORS.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
};