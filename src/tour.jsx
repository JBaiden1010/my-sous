// First-run tutorial: walks through the real screens of the app with a card at the bottom.
// Shown once after setup, and any time from More → App tour.
import React, { useEffect, useRef } from "react";

export const TOUR_UI = {
  label: { en: "App tour", es: "Recorrido por la app", fr: "Visite de l'app", pt: "Tour pelo app", hi: "ऐप टूर", zh: "应用导览", ar: "جولة في التطبيق" },
  sub: { en: "A step-by-step walkthrough of everything My Sous can do", es: "Un recorrido paso a paso por todo lo que hace My Sous", fr: "Une visite pas à pas de tout ce que fait My Sous", pt: "Um passo a passo de tudo o que o My Sous faz", hi: "My Sous की हर सुविधा का कदम-दर-कदम परिचय", zh: "逐步了解 My Sous 的全部功能", ar: "جولة خطوة بخطوة في كل ما يقدمه My Sous" },
  step: { en: "Step {n} of {total}", es: "Paso {n} de {total}", fr: "Étape {n} sur {total}", pt: "Passo {n} de {total}", hi: "चरण {n} / {total}", zh: "第 {n} 步，共 {total} 步", ar: "الخطوة {n} من {total}" },
  next: { en: "Next", es: "Siguiente", fr: "Suivant", pt: "Próximo", hi: "आगे", zh: "下一步", ar: "التالي" },
  back: { en: "Back", es: "Atrás", fr: "Retour", pt: "Voltar", hi: "पीछे", zh: "上一步", ar: "رجوع" },
  skip: { en: "Skip tour", es: "Saltar recorrido", fr: "Passer la visite", pt: "Pular tour", hi: "टूर छोड़ें", zh: "跳过导览", ar: "تخطي الجولة" },
  finish: { en: "Start cooking", es: "Empezar a cocinar", fr: "Commencer à cuisiner", pt: "Começar a cozinhar", hi: "खाना बनाना शुरू करें", zh: "开始做饭", ar: "ابدأ الطبخ" },
};

const S = (en, es, fr, pt, hi, zh, ar) => ({ en, es, fr, pt, hi, zh, ar });

export const TOUR_STEPS = [
  {
    id: "welcome", screen: "home", emoji: "👋",
    title: S("Welcome to My Sous", "Bienvenido a My Sous", "Bienvenue sur My Sous", "Bem-vindo ao My Sous", "My Sous में आपका स्वागत है", "欢迎使用 My Sous", "مرحبًا بك في My Sous"),
    body: S(
      "Here's how it works in three steps: tell My Sous what's in your kitchen, pick a meal you can make, then follow along step by step. This quick tour shows you each part. It takes about two minutes.",
      "Así funciona en tres pasos: dile a My Sous qué hay en tu cocina, elige una comida que puedas hacer y síguela paso a paso. Este recorrido te enseña cada parte. Tarda unos dos minutos.",
      "Voici le principe en trois étapes : dites à My Sous ce qu'il y a dans votre cuisine, choisissez un plat réalisable, puis suivez-le pas à pas. Cette visite vous montre chaque partie. Elle dure environ deux minutes.",
      "Funciona em três passos: diga ao My Sous o que tem na sua cozinha, escolha uma refeição que dá para fazer e siga passo a passo. Este tour mostra cada parte. Leva uns dois minutos.",
      "यह तीन कदमों में काम करता है: My Sous को बताएं कि आपकी रसोई में क्या है, ऐसा खाना चुनें जो आप बना सकते हैं, फिर कदम-दर-कदम बनाएं। यह टूर हर हिस्सा दिखाता है। इसमें लगभग दो मिनट लगते हैं।",
      "只需三步：告诉 My Sous 你厨房里有什么，挑一道能做的菜，然后一步步跟着做。这个导览会带你看每个部分，大约两分钟。",
      "إليك الطريقة في ثلاث خطوات: أخبر My Sous بما في مطبخك، واختر وجبة يمكنك تحضيرها، ثم اتبعها خطوة بخطوة. تعرّفك هذه الجولة على كل جزء، وتستغرق دقيقتين تقريبًا."),
  },
  {
    id: "home", screen: "home", emoji: "🏠",
    title: S("Home: what can I make today?", "Inicio: ¿qué puedo hacer hoy?", "Accueil : que puis-je cuisiner aujourd'hui ?", "Início: o que posso fazer hoje?", "होम: आज मैं क्या बना सकता हूं?", "首页：今天能做什么？", "الرئيسية: ماذا يمكنني أن أطبخ اليوم؟"),
    body: S(
      "Home is your starting point. It shows how many meals you can cook right now, suggestions picked for you, and what you cooked recently. Use the tabs at the bottom to move between Home, Kitchen, Cook and More.",
      "Inicio es tu punto de partida. Muestra cuántas comidas puedes hacer ahora, sugerencias para ti y lo que cocinaste hace poco. Usa las pestañas de abajo para ir a Inicio, Cocina, Cocinar y Más.",
      "L'accueil est votre point de départ. Il indique combien de plats vous pouvez faire tout de suite, des suggestions pour vous et ce que vous avez cuisiné récemment. Les onglets en bas mènent à Accueil, Cuisine, Cuisiner et Plus.",
      "O Início é seu ponto de partida. Mostra quantas refeições você pode fazer agora, sugestões para você e o que cozinhou recentemente. Use as abas embaixo para ir a Início, Cozinha, Cozinhar e Mais.",
      "होम आपकी शुरुआत की जगह है। यहां दिखता है कि आप अभी कितने खाने बना सकते हैं, आपके लिए सुझाव, और हाल में क्या बनाया। नीचे के टैब से होम, किचन, कुक और More के बीच जाएं।",
      "首页是你的起点。这里显示你现在能做几道菜、为你推荐的菜，以及最近做过的菜。用底部的标签在首页、厨房、做饭和更多之间切换。",
      "الرئيسية هي نقطة البداية. تعرض عدد الوجبات التي يمكنك تحضيرها الآن، واقتراحات لك، وما طبخته مؤخرًا. استخدم الأزرار في الأسفل للتنقل بين الرئيسية والمطبخ والطبخ والمزيد."),
  },
  {
    id: "kitchen", screen: "kitchen", emoji: "🥕",
    title: S("My Kitchen: what do I have?", "Mi cocina: ¿qué tengo?", "Ma cuisine : qu'est-ce que j'ai ?", "Minha cozinha: o que eu tenho?", "मेरी रसोई: मेरे पास क्या है?", "我的厨房：我有什么？", "مطبخي: ماذا لدي؟"),
    body: S(
      "Type an ingredient and press Enter to add it. You can add several at once with commas, like \"rice, eggs, spinach\". Tick the kitchen tools you own (pan, oven, air fryer…) so you only see recipes you can actually make. Basics like salt and oil are assumed, and you can untick any you're out of.",
      "Escribe un ingrediente y pulsa Enter para añadirlo. Puedes añadir varios con comas, como \"arroz, huevos, espinaca\". Marca los utensilios que tienes (sartén, horno, freidora de aire…) para ver solo recetas que puedes hacer. Lo básico como sal y aceite se da por hecho; desmarca lo que se te haya acabado.",
      "Tapez un ingrédient puis Entrée pour l'ajouter. Vous pouvez en ajouter plusieurs avec des virgules, comme « riz, œufs, épinards ». Cochez les ustensiles que vous avez (poêle, four, friteuse à air…) pour ne voir que les recettes faisables. Les basiques comme le sel et l'huile sont supposés présents ; décochez ceux qui manquent.",
      "Digite um ingrediente e aperte Enter para adicionar. Dá para adicionar vários com vírgulas, como \"arroz, ovos, espinafre\". Marque os utensílios que você tem (frigideira, forno, air fryer…) para ver só receitas possíveis. Básicos como sal e óleo já contam; desmarque o que acabou.",
      "कोई सामग्री लिखें और Enter दबाएं। कॉमा से कई एक साथ जोड़ सकते हैं, जैसे \"rice, eggs, spinach\"। अपने बर्तन चुनें (पैन, ओवन, एयर फ्रायर…) ताकि सिर्फ़ वही रेसिपी दिखें जो आप बना सकते हैं। नमक और तेल जैसी बेसिक चीज़ें मानी जाती हैं; जो खत्म हो गई हों उन्हें हटा दें।",
      "输入食材并按回车即可添加，也可以用逗号一次添加多个，比如“rice, eggs, spinach”。勾选你有的厨具（平底锅、烤箱、空气炸锅……），这样只会看到真正能做的菜。盐和油等基础调料默认都有，用完了可以取消勾选。",
      "اكتب مكوّنًا واضغط Enter لإضافته. يمكنك إضافة عدة مكونات معًا بفواصل مثل \"rice, eggs, spinach\". حدّد أدوات المطبخ التي تملكها (مقلاة، فرن، قلاية هوائية…) لترى فقط الوصفات التي يمكنك تحضيرها. الأساسيات مثل الملح والزيت محسوبة، ويمكنك إلغاء ما نفد منها."),
  },
  {
    id: "cook", screen: "cook", emoji: "🍳",
    title: S("Cook: what can I make with it?", "Cocinar: ¿qué puedo hacer con eso?", "Cuisiner : que faire avec ça ?", "Cozinhar: o que faço com isso?", "कुक: इससे क्या बना सकता हूं?", "做饭：用这些能做什么？", "الطبخ: ماذا أحضّر بها؟"),
    body: S(
      "Cook matches recipes to your kitchen. \"Ready\" means you have everything. \"Missing 1\" or \"Missing 2\" means you're only an item or two away. Browse sections like Quick Meals, Budget Friendly, Beginner Friendly and High Protein, or use Filters for meal type and cuisine.",
      "Cocinar empareja recetas con tu cocina. \"Lista\" significa que tienes todo. \"Falta 1\" o \"Faltan 2\" significa que te falta muy poco. Explora secciones como Rápidas, Económicas, Para principiantes y Altas en proteína, o usa Filtros por tipo de comida y cocina.",
      "Cuisiner associe les recettes à votre cuisine. « Prêt » veut dire que vous avez tout. « Manque 1 » ou « Manque 2 » : il ne vous manque presque rien. Parcourez Repas rapides, Petit budget, Pour débutants et Riche en protéines, ou utilisez les Filtres par type de repas et cuisine.",
      "Cozinhar combina receitas com a sua cozinha. \"Pronta\" quer dizer que você tem tudo. \"Falta 1\" ou \"Faltam 2\" quer dizer que falta pouco. Veja seções como Rápidas, Econômicas, Para iniciantes e Ricas em proteína, ou use os Filtros de tipo de refeição e culinária.",
      "कुक आपकी रसोई से रेसिपी मिलाता है। \"Ready\" का मतलब सब कुछ है। \"Missing 1\" या \"Missing 2\" का मतलब बस एक-दो चीज़ें कम हैं। क्विक मील, बजट, बिगिनर और हाई प्रोटीन जैसे सेक्शन देखें, या खाने के प्रकार और व्यंजन के फ़िल्टर लगाएं।",
      "做饭页会根据你的厨房匹配食谱。“可做”表示材料齐全，“缺 1”或“缺 2”表示只差一两样。可以浏览快手菜、省钱、新手友好、高蛋白等分类，或用筛选按餐类和菜系查找。",
      "يطابق قسم الطبخ الوصفات مع مطبخك. \"جاهزة\" تعني أن لديك كل شيء، و\"ينقص 1\" أو \"ينقص 2\" تعني أنك قريب جدًا. تصفح أقسامًا مثل الوجبات السريعة والاقتصادية والمناسبة للمبتدئين والغنية بالبروتين، أو استخدم الفلاتر لنوع الوجبة والمطبخ."),
  },
  {
    id: "search", screen: "cook", emoji: "🔎",
    title: S("Search and filters", "Búsqueda y filtros", "Recherche et filtres", "Busca e filtros", "खोज और फ़िल्टर", "搜索和筛选", "البحث والفلاتر"),
    body: S(
      "Know what you want? Tap Search a meal to look by name, or search by ingredients you want to use up (add as many as you like). When you pick several meal types or cuisines, choose \"Any of these\" or \"All of these\". Recipes with your allergies are hidden, and the list shows meals with the fewest ingredients first.",
      "¿Sabes lo que quieres? Toca Buscar una comida para buscar por nombre, o busca por los ingredientes que quieras usar (todos los que quieras). Si eliges varios tipos de comida o cocinas, elige \"Cualquiera\" o \"Todos\". Las recetas con tus alergias se ocultan, y primero salen las de menos ingredientes.",
      "Vous savez ce que vous voulez ? Touchez Chercher un plat pour chercher par nom, ou par ingrédients à utiliser (autant que vous voulez). Avec plusieurs types de repas ou cuisines, choisissez « N'importe lequel » ou « Tous ». Les recettes avec vos allergies sont masquées, et celles avec le moins d'ingrédients viennent en premier.",
      "Sabe o que quer? Toque em Buscar uma refeição para procurar pelo nome, ou pelos ingredientes que quer usar (quantos quiser). Ao escolher vários tipos ou culinárias, escolha \"Qualquer um\" ou \"Todos\". Receitas com suas alergias ficam ocultas, e as com menos ingredientes aparecem primeiro.",
      "पता है क्या चाहिए? नाम से खोजने के लिए Search a meal दबाएं, या उन सामग्रियों से खोजें जिन्हें इस्तेमाल करना है (जितनी चाहें)। कई प्रकार या व्यंजन चुनें तो \"इनमें से कोई\" या \"ये सभी\" चुनें। आपकी एलर्जी वाली रेसिपी छिपी रहती हैं, और सबसे कम सामग्री वाले खाने पहले दिखते हैं।",
      "想好吃什么了？点“搜索菜品”按名称查找，或按想用掉的食材搜索（数量不限）。选了多个餐类或菜系时，可选择“任一”或“全部”。含你过敏原的食谱会被隐藏，食材最少的菜排在最前面。",
      "تعرف ما تريد؟ اضغط ابحث عن وجبة للبحث بالاسم، أو ابحث بالمكونات التي تريد استخدامها (بقدر ما تشاء). عند اختيار عدة أنواع أو مطابخ، اختر \"أيٌّ منها\" أو \"جميعها\". تُخفى الوصفات التي تحتوي على ما تتحسس منه، وتظهر الوجبات الأقل مكونات أولًا."),
  },
  {
    id: "guided", screen: "cook", emoji: "👨‍🍳",
    title: S("Guided cooking: how do I actually make it?", "Cocina guiada: ¿cómo lo hago?", "Cuisine guidée : comment je fais ?", "Cozinha guiada: como eu faço?", "गाइडेड कुकिंग: इसे असल में कैसे बनाऊं?", "跟做模式：到底怎么做？", "الطبخ الموجّه: كيف أحضّرها فعليًا؟"),
    body: S(
      "Tap Cook this on any recipe. Set the servings and every amount updates. Tick off ingredients as you gather them. Each step tells you how much and how long, what it should look like when it's done, and what else to check. Tap Start timer when a step needs one; it keeps running if you move on. Your screen stays on while you cook.",
      "Toca Cocinar esto en cualquier receta. Ajusta las porciones y todas las cantidades cambian. Marca los ingredientes al reunirlos. Cada paso te dice cuánto y cuánto tiempo, cómo debe verse al terminar y qué más revisar. Toca Iniciar temporizador cuando haga falta; sigue corriendo si avanzas. La pantalla se queda encendida mientras cocinas.",
      "Touchez Cuisiner ceci sur une recette. Réglez les portions et toutes les quantités s'ajustent. Cochez les ingrédients en les rassemblant. Chaque étape indique combien et combien de temps, à quoi ça doit ressembler et quoi vérifier. Touchez Lancer la minuterie si besoin ; elle continue si vous avancez. L'écran reste allumé pendant que vous cuisinez.",
      "Toque em Cozinhar esta em qualquer receita. Ajuste as porções e todas as quantidades mudam. Marque os ingredientes ao separar. Cada passo diz quanto e por quanto tempo, como deve ficar e o que mais conferir. Toque em Iniciar timer quando precisar; ele continua se você avançar. A tela fica ligada enquanto você cozinha.",
      "किसी भी रेसिपी पर Cook this दबाएं। सर्विंग बदलें तो हर मात्रा बदल जाती है। सामग्री जुटाते हुए टिक करें। हर कदम बताता है कितना और कितनी देर, पूरा होने पर कैसा दिखे, और और क्या जांचें। जहां ज़रूरत हो Start timer दबाएं; आगे बढ़ने पर भी चलता रहता है। खाना बनाते समय स्क्रीन चालू रहती है।",
      "在任意食谱上点“做这道”。调整份数，所有用量会自动换算。备料时逐项勾选食材。每一步都会告诉你用量和时间、做好时应是什么样子，以及还要注意什么。需要计时就点“开始计时”，切到下一步也会继续。做饭时屏幕会保持常亮。",
      "اضغط اطبخ هذه في أي وصفة. غيّر عدد الحصص فتتغير كل المقادير. علّم على المكونات وأنت تجمعها. كل خطوة تخبرك بالكمية والمدة، وكيف يجب أن تبدو عند انتهائها، وماذا تتحقق أيضًا. اضغط ابدأ المؤقت عند الحاجة؛ ويستمر حتى لو انتقلت. تبقى الشاشة مضاءة أثناء الطبخ."),
  },
  {
    id: "history", screen: "history", emoji: "📈",
    title: S("History & progress", "Historial y progreso", "Historique et progrès", "Histórico e progresso", "हिस्ट्री और प्रगति", "历史与进步", "السجل والتقدم"),
    body: S(
      "When you finish a meal, rate it and add a note for next time (\"less salt\", \"double the garlic\"). Everything you cook is kept here, with badges as you grow from beginner to confident cook.",
      "Al terminar una comida, califícala y añade una nota para la próxima vez (\"menos sal\", \"doble de ajo\"). Todo lo que cocinas se guarda aquí, con insignias a medida que pasas de principiante a cocinero con confianza.",
      "Quand vous terminez un plat, notez-le et ajoutez une note pour la prochaine fois (« moins de sel », « double ail »). Tout ce que vous cuisinez est gardé ici, avec des badges à mesure que vous progressez.",
      "Ao terminar uma refeição, avalie e adicione uma nota para a próxima vez (\"menos sal\", \"dobro de alho\"). Tudo o que você cozinha fica aqui, com conquistas conforme você evolui de iniciante a cozinheiro confiante.",
      "खाना पूरा होने पर उसे रेटिंग दें और अगली बार के लिए नोट लिखें (\"कम नमक\", \"दोगुना लहसुन\")। आपने जो भी बनाया, वह यहां रहता है, और जैसे-जैसे आप सीखते हैं, बैज मिलते हैं।",
      "做完一道菜后可以打分，并为下次记个笔记（比如“少放盐”“蒜加倍”）。你做过的每道菜都会记录在这里，随着你从新手成长为自信的厨师，还会获得徽章。",
      "عند الانتهاء من وجبة، قيّمها وأضف ملاحظة للمرة القادمة (\"ملح أقل\"، \"ضعف الثوم\"). يُحفظ هنا كل ما تطبخه، مع شارات كلما تقدمت من مبتدئ إلى طاهٍ واثق."),
  },
  {
    id: "cookbook", screen: "cookbook", emoji: "📖",
    title: S("Cookbook: recipes to keep", "Recetario: recetas para guardar", "Livre de recettes : à garder", "Livro de receitas: para guardar", "कुकबुक: सहेजने वाली रेसिपी", "菜谱本：想保留的食谱", "كتاب الوصفات: وصفات للاحتفاظ بها"),
    body: S(
      "Tap the heart on any recipe to save it here. You can also create your own: add a photo, ingredients and steps. Each step uses the same layout as guided cooking, with a timer, the amount, what it should look like and what to check.",
      "Toca el corazón en cualquier receta para guardarla aquí. También puedes crear las tuyas: añade foto, ingredientes y pasos. Cada paso usa el mismo formato que la cocina guiada, con temporizador, cantidad, cómo debe verse y qué revisar.",
      "Touchez le cœur sur une recette pour la garder ici. Vous pouvez aussi créer les vôtres : photo, ingrédients et étapes. Chaque étape a la même mise en page que la cuisine guidée, avec minuterie, quantité, aspect attendu et points à vérifier.",
      "Toque no coração de qualquer receita para salvar aqui. Você também pode criar as suas: foto, ingredientes e passos. Cada passo usa o mesmo formato da cozinha guiada, com timer, quantidade, como deve ficar e o que conferir.",
      "किसी भी रेसिपी पर दिल दबाकर उसे यहां सहेजें। आप अपनी रेसिपी भी बना सकते हैं: फ़ोटो, सामग्री और कदम जोड़ें। हर कदम गाइडेड कुकिंग जैसा ही होता है, टाइमर, मात्रा, कैसा दिखे और क्या जांचें के साथ।",
      "点任意食谱上的爱心即可保存到这里。你也可以创建自己的食谱：添加照片、食材和步骤。每一步都和跟做模式的格式一样，包括计时器、用量、应有的样子和注意事项。",
      "اضغط القلب على أي وصفة لحفظها هنا. يمكنك أيضًا إنشاء وصفاتك: أضف صورة ومكونات وخطوات. كل خطوة بنفس شكل الطبخ الموجّه، مع مؤقت والكمية وكيف يجب أن تبدو وما يجب التحقق منه."),
  },
  {
    id: "shopping", screen: "shopping", emoji: "🛒",
    title: S("Smart Shopping: what should I buy next?", "Compra inteligente: ¿qué compro ahora?", "Courses malines : quoi acheter ensuite ?", "Compras inteligentes: o que compro agora?", "स्मार्ट शॉपिंग: आगे क्या खरीदूं?", "智能购物：接下来买什么？", "التسوق الذكي: ماذا أشتري بعد ذلك؟"),
    body: S(
      "After you've used what you have, Smart Shopping shows which items unlock the most new recipes. Add them to your list, then search for them at the top grocery stores in your country, or add your own favourite stores. There are also handy tools for a starter kitchen.",
      "Cuando hayas usado lo que tienes, Compra inteligente muestra qué productos desbloquean más recetas nuevas. Añádelos a tu lista y búscalos en los principales supermercados de tu país, o añade tus tiendas favoritas. También hay utensilios útiles para una cocina inicial.",
      "Quand vous avez utilisé ce que vous avez, Courses malines montre les articles qui débloquent le plus de recettes. Ajoutez-les à votre liste, puis cherchez-les dans les grandes épiceries de votre pays ou vos magasins préférés. Il y a aussi des ustensiles utiles pour débuter.",
      "Depois de usar o que você tem, Compras inteligentes mostra quais itens liberam mais receitas novas. Adicione à sua lista e procure nos principais mercados do seu país, ou adicione suas lojas favoritas. Também há utensílios úteis para uma cozinha inicial.",
      "जो है उसे इस्तेमाल करने के बाद, स्मार्ट शॉपिंग दिखाता है कि कौन-सी चीज़ें सबसे ज़्यादा नई रेसिपी खोलती हैं। उन्हें अपनी सूची में जोड़ें, फिर अपने देश के बड़े ग्रोसरी स्टोर्स या अपने पसंदीदा स्टोर में खोजें। शुरुआती रसोई के लिए काम के बर्तन भी हैं।",
      "用完现有食材后，智能购物会告诉你买哪些东西能解锁最多的新食谱。把它们加入清单，然后在你所在国家的主要超市或你常去的店里搜索。这里还有新手厨房常用的厨具推荐。",
      "بعد أن تستخدم ما لديك، يعرض التسوق الذكي المنتجات التي تفتح أكبر عدد من الوصفات الجديدة. أضفها إلى قائمتك، ثم ابحث عنها في أكبر متاجر البقالة في بلدك أو في متاجرك المفضلة. وهناك أيضًا أدوات مفيدة لمطبخ المبتدئين."),
  },
  {
    id: "community", screen: "community", emoji: "⭐",
    title: S("Community: learn from other cooks", "Comunidad: aprende de otros cocineros", "Communauté : apprenez des autres", "Comunidade: aprenda com outros cozinheiros", "कम्युनिटी: दूसरे रसोइयों से सीखें", "社区：向其他厨师学习", "المجتمع: تعلّم من الطهاة الآخرين"),
    body: S(
      "Read tips, star ratings, improvement ideas and short video tutorials from other cooks. Sign in to post your own, rate recipes or share a recipe you made. Only what you post here is public; your kitchen and profile stay private.",
      "Lee consejos, calificaciones, ideas de mejora y tutoriales cortos de otros cocineros. Inicia sesión para publicar, calificar recetas o compartir una receta tuya. Solo lo que publicas aquí es público; tu cocina y perfil son privados.",
      "Lisez des astuces, des notes, des idées d'amélioration et de courts tutoriels vidéo. Connectez-vous pour publier, noter des recettes ou partager la vôtre. Seul ce que vous publiez ici est public ; votre cuisine et votre profil restent privés.",
      "Leia dicas, avaliações, ideias de melhoria e tutoriais curtos de outros cozinheiros. Entre na conta para postar, avaliar receitas ou compartilhar uma sua. Só o que você posta aqui é público; sua cozinha e perfil ficam privados.",
      "दूसरे रसोइयों के टिप्स, स्टार रेटिंग, सुधार के सुझाव और छोटे वीडियो ट्यूटोरियल देखें। पोस्ट करने, रेटिंग देने या अपनी रेसिपी शेयर करने के लिए साइन इन करें। सिर्फ़ यहां पोस्ट की गई चीज़ें सार्वजनिक होती हैं; आपकी रसोई और प्रोफ़ाइल निजी रहती है।",
      "这里可以看到其他厨师的技巧、星级评分、改进建议和短视频教程。登录后可以发帖、给食谱打分或分享自己的食谱。只有你在这里发布的内容是公开的，你的厨房和个人资料都是私密的。",
      "اقرأ نصائح وتقييمات وأفكار تحسين ودروس فيديو قصيرة من طهاة آخرين. سجّل الدخول لتنشر أو تقيّم الوصفات أو تشارك وصفة حضّرتها. ما تنشره هنا فقط يكون عامًا؛ ويبقى مطبخك وملفك الشخصي خاصّين."),
  },
  {
    id: "nutrition", screen: "nutrition", emoji: "🥗",
    title: S("Nutrition (optional)", "Nutrición (opcional)", "Nutrition (facultatif)", "Nutrição (opcional)", "पोषण (वैकल्पिक)", "营养（可选）", "التغذية (اختياري)"),
    body: S(
      "Every recipe shows calories, protein, carbs and fat per serving. If you're curious, Nutrition goals gives a rough daily estimate, and recipes then show what share of your day they cover. The glossary explains what's in common ingredients. All of this is optional.",
      "Cada receta muestra calorías, proteína, carbohidratos y grasa por porción. Si te interesa, Metas de nutrición da una estimación diaria aproximada y las recetas muestran qué parte de tu día cubren. El glosario explica qué tienen los ingredientes comunes. Todo es opcional.",
      "Chaque recette indique calories, protéines, glucides et lipides par portion. Si ça vous intéresse, Objectifs nutritionnels donne une estimation quotidienne, et les recettes montrent la part de votre journée couverte. Le glossaire explique les ingrédients courants. Tout est facultatif.",
      "Cada receita mostra calorias, proteína, carboidratos e gordura por porção. Se tiver curiosidade, Metas de nutrição dá uma estimativa diária e as receitas mostram quanto do seu dia cobrem. O glossário explica ingredientes comuns. Tudo é opcional.",
      "हर रेसिपी प्रति सर्विंग कैलोरी, प्रोटीन, कार्ब्स और फैट दिखाती है। चाहें तो पोषण लक्ष्य रोज़ का मोटा अनुमान देता है, और फिर रेसिपी बताती हैं कि वे आपके दिन का कितना हिस्सा हैं। शब्दकोश आम सामग्रियों के बारे में बताता है। यह सब वैकल्पिक है।",
      "每道食谱都会显示每份的热量、蛋白质、碳水和脂肪。如果感兴趣，“营养目标”可以给出每日的粗略估算，食谱也会显示占你每日所需的比例。词汇表会介绍常见食材的营养。这些全部都是可选的。",
      "تعرض كل وصفة السعرات والبروتين والكربوهيدرات والدهون لكل حصة. إن رغبت، تعطيك الأهداف الغذائية تقديرًا يوميًا تقريبيًا، وتعرض الوصفات نسبة ما تغطيه من يومك. ويشرح المسرد محتوى المكونات الشائعة. كل هذا اختياري."),
  },
  {
    id: "settings", screen: "settings", emoji: "⚙️",
    title: S("Make My Sous work for you", "Haz que My Sous se adapte a ti", "Adaptez My Sous à vous", "Deixe o My Sous do seu jeito", "My Sous को अपने हिसाब से बनाएं", "让 My Sous 更适合你", "اجعل My Sous مناسبًا لك"),
    body: S(
      "Tap the gear at the top for Settings: your name, cooking level, allergies, language (7 options), cups or metric, light or dark mode, text size, a readable font, high contrast and reduced motion. You can also manage your privacy and account here.",
      "Toca el engranaje de arriba para Ajustes: tu nombre, nivel, alergias, idioma (7 opciones), tazas o métrico, modo claro u oscuro, tamaño de texto, fuente legible, alto contraste y menos movimiento. También gestionas tu privacidad y cuenta.",
      "Touchez l'engrenage en haut pour les Réglages : nom, niveau, allergies, langue (7 au choix), tasses ou métrique, mode clair ou sombre, taille du texte, police lisible, contraste élevé et animations réduites. Vous y gérez aussi confidentialité et compte.",
      "Toque na engrenagem no topo para Configurações: seu nome, nível, alergias, idioma (7 opções), xícaras ou métrico, modo claro ou escuro, tamanho do texto, fonte legível, alto contraste e menos movimento. Também dá para cuidar da privacidade e da conta.",
      "सेटिंग्स के लिए ऊपर गियर दबाएं: आपका नाम, कुकिंग लेवल, एलर्जी, भाषा (7 विकल्प), कप या मीट्रिक, लाइट या डार्क मोड, टेक्स्ट का आकार, पढ़ने में आसान फ़ॉन्ट, हाई कॉन्ट्रास्ट और कम एनिमेशन। प्राइवेसी और अकाउंट भी यहीं संभालें।",
      "点顶部的齿轮打开设置：姓名、烹饪水平、过敏原、语言（7 种）、杯量或公制、浅色或深色模式、文字大小、易读字体、高对比度和减少动画。隐私和账户也在这里管理。",
      "اضغط الترس في الأعلى للإعدادات: اسمك، مستواك، الحساسية، اللغة (7 خيارات)، الأكواب أو النظام المتري، الوضع الفاتح أو الداكن، حجم النص، خط سهل القراءة، تباين عالٍ وتقليل الحركة. ويمكنك أيضًا إدارة الخصوصية والحساب."),
  },
  {
    id: "done", screen: "kitchen", emoji: "🎉",
    title: S("You're ready!", "¡Listo!", "C'est parti !", "Tudo pronto!", "आप तैयार हैं!", "准备好了！", "أنت جاهز!"),
    body: S(
      "Start by adding a few things from your fridge and cupboard to My Kitchen. Then head to Cook to see what you can make. You can replay this tour anytime from More → App tour, and use More → Feedback to tell us what to fix or add.",
      "Empieza añadiendo algunas cosas de tu nevera y despensa a Mi cocina. Luego ve a Cocinar para ver qué puedes hacer. Puedes repetir este recorrido desde Más → Recorrido por la app, y usar Más → Comentarios para decirnos qué mejorar.",
      "Commencez par ajouter quelques produits de votre frigo et de vos placards dans Ma cuisine. Puis allez dans Cuisiner pour voir ce que vous pouvez faire. Revoyez cette visite depuis Plus → Visite de l'app, et dites-nous quoi améliorer via Plus → Commentaires.",
      "Comece adicionando algumas coisas da geladeira e do armário em Minha cozinha. Depois vá em Cozinhar para ver o que dá para fazer. Você pode rever este tour em Mais → Tour pelo app e usar Mais → Feedback para dizer o que melhorar.",
      "शुरुआत में अपने फ्रिज और अलमारी की कुछ चीज़ें मेरी रसोई में जोड़ें। फिर कुक में जाकर देखें कि आप क्या बना सकते हैं। यह टूर कभी भी More → ऐप टूर से दोबारा देखें, और More → फ़ीडबैक से हमें बताएं कि क्या सुधारें।",
      "先把冰箱和柜子里的一些东西加到“我的厨房”，再去“做饭”看看能做什么。随时可以在“更多 → 应用导览”重看本导览，也可以在“更多 → 反馈”告诉我们需要改进什么。",
      "ابدأ بإضافة بعض ما في ثلاجتك وخزانتك إلى مطبخي، ثم انتقل إلى الطبخ لترى ما يمكنك تحضيره. يمكنك إعادة هذه الجولة في أي وقت من المزيد ← جولة في التطبيق، واستخدام المزيد ← الملاحظات لتخبرنا بما يجب إصلاحه أو إضافته."),
  },
];

const pick = (map, lang) => (map && (map[lang] || map.en)) || "";

export function TourCard({ step, total, data, lang, colors, onNext, onBack, onSkip }) {
  const ui = (k) => pick(TOUR_UI[k], lang);
  const nextRef = useRef(null);
  useEffect(() => { nextRef.current && nextRef.current.focus({ preventScroll: true }); }, [step]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onSkip();
      else if (e.key === "ArrowRight" && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || "")) onNext();
      else if (e.key === "ArrowLeft" && step > 0 && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || "")) onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, onNext, onBack, onSkip]);
  const last = step === total - 1;
  const C = colors;
  return (
    <div className="ms-tour" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "16px 16px 24px", background: "rgba(20, 28, 14, 0.38)" }}>
      <div role="dialog" aria-modal="true" aria-labelledby="ms-tour-title" aria-describedby="ms-tour-body" className="ms-tour-card"
        style={{ width: "100%", maxWidth: 560, background: C.card, color: C.ink, borderRadius: 20, boxShadow: "0 18px 50px rgba(0,0,0,0.28)", border: `1px solid ${C.line}`, padding: "18px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.inkMuted }}>{ui("step").replace("{n}", step + 1).replace("{total}", total)}</span>
          <button onClick={onSkip} style={{ background: "none", border: "none", color: C.inkMuted, fontSize: 13, cursor: "pointer", padding: 6, fontFamily: "inherit", textDecoration: "underline" }}>{ui("skip")}</button>
        </div>
        <div style={{ height: 4, background: C.line, borderRadius: 4, marginTop: 6, overflow: "hidden" }} aria-hidden="true">
          <div style={{ width: `${((step + 1) / total) * 100}%`, height: "100%", background: C.primary, borderRadius: 4, transition: "width .25s" }} />
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 14 }}>
          <div aria-hidden="true" style={{ fontSize: 34, lineHeight: 1, flexShrink: 0, width: 52, height: 52, borderRadius: 14, background: C.sageSofter, display: "flex", alignItems: "center", justifyContent: "center" }}>{data.emoji}</div>
          <div style={{ minWidth: 0 }}>
            <h2 id="ms-tour-title" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 21, fontWeight: 700, margin: "2px 0 6px", lineHeight: 1.25 }}>{pick(data.title, lang)}</h2>
            <p id="ms-tour-body" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: C.inkSoft || C.ink }}>{pick(data.body, lang)}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {step > 0 && (
            <button onClick={onBack} style={{ flex: "0 0 auto", padding: "12px 18px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{ui("back")}</button>
          )}
          <button ref={nextRef} onClick={onNext} style={{ flex: 1, padding: "12px 18px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>{last ? ui("finish") : ui("next")}</button>
        </div>
      </div>
    </div>
  );
}
