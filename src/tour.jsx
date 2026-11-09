// First-run tutorial. Hands-on: on "try it" steps the cook does the real thing (adds an ingredient,
// opens a recipe, starts a timer…), the tour highlights where to tap and moves on once it's done.
// Shown once after setup, and any time from More → App tour.
import React, { useEffect, useRef, useState } from "react";

// Parts of the app call this when something happens that a tour step may be waiting for.
export const tourEmit = (type) => {
  try { window.dispatchEvent(new CustomEvent("ms-tour", { detail: type })); } catch {}
};

const S = (en, es, fr, pt, hi, zh, ar) => ({ en, es, fr, pt, hi, zh, ar });

export const TOUR_UI = {
  label: S("App tour", "Recorrido por la app", "Visite de l'app", "Tour pelo app", "ऐप टूर", "应用导览", "جولة في التطبيق"),
  sub: S("A hands-on, step-by-step walkthrough of My Sous", "Un recorrido práctico, paso a paso, por My Sous", "Une visite pratique, pas à pas, de My Sous", "Um passo a passo prático pelo My Sous", "My Sous का कदम-दर-कदम, करके सीखने वाला टूर", "边做边学，逐步了解 My Sous", "جولة عملية خطوة بخطوة في My Sous"),
  step: S("Step {n} of {total}", "Paso {n} de {total}", "Étape {n} sur {total}", "Passo {n} de {total}", "चरण {n} / {total}", "第 {n} 步，共 {total} 步", "الخطوة {n} من {total}"),
  next: S("Next", "Siguiente", "Suivant", "Próximo", "आगे", "下一步", "التالي"),
  back: S("Back", "Atrás", "Retour", "Voltar", "पीछे", "上一步", "رجوع"),
  skip: S("Skip tour", "Saltar recorrido", "Passer la visite", "Pular tour", "टूर छोड़ें", "跳过导览", "تخطي الجولة"),
  skipStep: S("Skip this step", "Saltar este paso", "Passer cette étape", "Pular este passo", "यह चरण छोड़ें", "跳过这一步", "تخطي هذه الخطوة"),
  tryIt: S("Try it", "Pruébalo", "Essayez", "Experimente", "करके देखें", "试一试", "جرّبها"),
  done: S("Nice, done!", "¡Bien hecho!", "Bravo, c'est fait !", "Boa, feito!", "बढ़िया, हो गया!", "很好，完成了！", "أحسنت، تم!"),
  waiting: S("Waiting for you to try it…", "Esperando a que lo pruebes…", "À vous d'essayer…", "Esperando você tentar…", "आपके करने का इंतज़ार है…", "等你来试试……", "بانتظار أن تجرّبها…"),
  missing: S("Not on this screen right now, so you can skip ahead.", "No aparece en esta pantalla ahora; puedes seguir.", "Pas sur cet écran pour l'instant, vous pouvez continuer.", "Não está nesta tela agora; pode seguir.", "अभी यह इस स्क्रीन पर नहीं है, आप आगे बढ़ सकते हैं।", "当前页面上没有这个，可以直接继续。", "غير موجود في هذه الشاشة الآن، يمكنك المتابعة."),
  finish: S("Start cooking", "Empezar a cocinar", "Commencer à cuisiner", "Começar a cozinhar", "खाना बनाना शुरू करें", "开始做饭", "ابدأ الطبخ"),
};

// task: the event that completes a "try it" step. target: what to highlight. screen: where to go first.
// optional: the step can be skipped if its target isn't on screen (e.g. a step without a timer).
export const TOUR_STEPS = [
  {
    id: "welcome", screen: "home", emoji: "👋",
    title: S("Welcome to My Sous", "Bienvenido a My Sous", "Bienvenue sur My Sous", "Bem-vindo ao My Sous", "My Sous में आपका स्वागत है", "欢迎使用 My Sous", "مرحبًا بك في My Sous"),
    body: S(
      "Let's cook your first meal together. You'll add what's in your kitchen, find a recipe and start cooking it, trying each part as you go. It takes about two minutes.",
      "Vamos a preparar tu primera comida juntos. Añadirás lo que hay en tu cocina, buscarás una receta y empezarás a cocinarla, probando cada parte. Tarda unos dos minutos.",
      "Cuisinons votre premier plat ensemble. Vous allez ajouter ce qu'il y a dans votre cuisine, trouver une recette et la commencer, en essayant chaque partie. Environ deux minutes.",
      "Vamos fazer sua primeira refeição juntos. Você vai adicionar o que tem na cozinha, achar uma receita e começar a cozinhar, testando cada parte. Leva uns dois minutos.",
      "चलिए साथ में आपका पहला खाना बनाते हैं। आप रसोई की चीज़ें जोड़ेंगे, रेसिपी ढूंढेंगे और बनाना शुरू करेंगे, हर हिस्सा खुद करके। इसमें लगभग दो मिनट लगते हैं।",
      "我们一起做第一道菜吧。你会添加厨房里的食材、找到食谱并开始做，每一步都亲手试一试。大约两分钟。",
      "لنحضّر وجبتك الأولى معًا. ستضيف ما في مطبخك، وتجد وصفة وتبدأ بطبخها، مجرّبًا كل جزء بنفسك. يستغرق ذلك دقيقتين تقريبًا."),
  },
  {
    id: "add-ingredient", screen: "kitchen", emoji: "🥕", task: "ingredient", target: '[data-tour="ingredient-input"]',
    title: S("Add what you have", "Añade lo que tienes", "Ajoutez ce que vous avez", "Adicione o que você tem", "जो है उसे जोड़ें", "添加你有的食材", "أضف ما لديك"),
    body: S(
      "Type a few things from your fridge or cupboard in the highlighted box, like \"rice, eggs, spinach\", then press Enter. Commas let you add several at once.",
      "Escribe algunas cosas de tu nevera o despensa en el cuadro resaltado, como \"arroz, huevos, espinaca\", y pulsa Enter. Con comas añades varias a la vez.",
      "Tapez quelques produits de votre frigo ou placard dans la case en surbrillance, comme « riz, œufs, épinards », puis Entrée. Les virgules permettent d'en ajouter plusieurs.",
      "Digite algumas coisas da geladeira ou do armário na caixa destacada, como \"arroz, ovos, espinafre\", e aperte Enter. Vírgulas adicionam vários de uma vez.",
      "हाइलाइट किए गए बॉक्स में फ्रिज या अलमारी की कुछ चीज़ें लिखें, जैसे \"rice, eggs, spinach\", फिर Enter दबाएं। कॉमा से कई एक साथ जुड़ जाती हैं।",
      "在高亮的输入框里输入冰箱或柜子里的几样东西，比如“rice, eggs, spinach”，然后按回车。用逗号可以一次添加多个。",
      "اكتب بعض ما في ثلاجتك أو خزانتك في المربع المميّز، مثل \"rice, eggs, spinach\"، ثم اضغط Enter. الفواصل تضيف عدة أشياء دفعة واحدة."),
  },
  {
    id: "tools", screen: "kitchen", emoji: "🍳", task: "tool", target: '[data-tour="tools"]',
    title: S("Pick your kitchen tools", "Elige tus utensilios", "Choisissez vos ustensiles", "Escolha seus utensílios", "अपने बर्तन चुनें", "选择你的厨具", "اختر أدوات مطبخك"),
    body: S(
      "Tap a tool to turn it on or off, like Oven or Air fryer. My Sous only suggests recipes you can make with the tools you have.",
      "Toca un utensilio para activarlo o desactivarlo, como Horno o Freidora de aire. My Sous solo sugiere recetas que puedes hacer con lo que tienes.",
      "Touchez un ustensile pour l'activer ou le désactiver, comme Four ou Friteuse à air. My Sous ne propose que des recettes faisables avec vos ustensiles.",
      "Toque num utensílio para ligar ou desligar, como Forno ou Air fryer. O My Sous só sugere receitas que dá para fazer com o que você tem.",
      "किसी बर्तन को चालू या बंद करने के लिए उस पर टैप करें, जैसे ओवन या एयर फ्रायर। My Sous सिर्फ़ वही रेसिपी सुझाता है जो आपके बर्तनों से बन सकें।",
      "点一下厨具即可开启或关闭，比如烤箱或空气炸锅。My Sous 只会推荐用你现有厨具能做的菜。",
      "اضغط على أداة لتفعيلها أو إيقافها، مثل الفرن أو القلاية الهوائية. يقترح My Sous فقط الوصفات التي يمكنك تحضيرها بأدواتك."),
  },
  {
    id: "go-cook", emoji: "👇", task: "screen:cook", target: '[data-tour="tab-cook"]',
    title: S("Head to Cook", "Ve a Cocinar", "Allez dans Cuisiner", "Vá para Cozinhar", "कुक पर जाएं", "前往“做饭”", "انتقل إلى الطبخ"),
    body: S("Now tap Cook in the menu. That's where your ingredients turn into meal ideas.", "Ahora toca Cocinar en el menú. Ahí tus ingredientes se convierten en ideas de comidas.", "Touchez maintenant Cuisiner dans le menu. C'est là que vos ingrédients deviennent des idées de repas.", "Agora toque em Cozinhar no menu. É ali que seus ingredientes viram ideias de refeição.", "अब मेन्यू में कुक पर टैप करें। वहीं आपकी सामग्री खाने के आइडिया बनती है।", "现在点菜单里的“做饭”，食材会在那里变成菜品灵感。", "اضغط الآن على الطبخ في القائمة، فهناك تتحول مكوناتك إلى أفكار وجبات."),
  },
  {
    id: "cook-explain", screen: "cook", emoji: "🔎",
    title: S("Meals you can make", "Comidas que puedes hacer", "Les plats que vous pouvez faire", "Refeições que você pode fazer", "जो खाना आप बना सकते हैं", "你能做的菜", "وجبات يمكنك تحضيرها"),
    body: S(
      "\"Ready\" means you have everything; \"Missing 1\" means you're one item away. Use the meal buttons, Filters (meal type, cuisine, Any or All), Search a meal or By ingredient. Recipes with your allergies are hidden.",
      "\"Lista\" significa que tienes todo; \"Falta 1\", que te falta un producto. Usa los botones de comida, Filtros (tipo, cocina, Cualquiera o Todos), Buscar una comida o Por ingrediente. Las recetas con tus alergias se ocultan.",
      "« Prêt » : vous avez tout ; « Manque 1 » : il manque un article. Utilisez les boutons de repas, les Filtres (type, cuisine, N'importe lequel ou Tous), Chercher un plat ou Par ingrédient. Les recettes avec vos allergies sont masquées.",
      "\"Pronta\" quer dizer que você tem tudo; \"Falta 1\", que falta um item. Use os botões de refeição, Filtros (tipo, culinária, Qualquer um ou Todos), Buscar uma refeição ou Por ingrediente. Receitas com suas alergias ficam ocultas.",
      "\"Ready\" का मतलब सब कुछ है; \"Missing 1\" का मतलब बस एक चीज़ कम है। खाने के बटन, फ़िल्टर (प्रकार, व्यंजन, कोई या सभी), Search a meal या By ingredient इस्तेमाल करें। आपकी एलर्जी वाली रेसिपी छिपी रहती हैं।",
      "“可做”表示材料齐全，“缺 1”表示只差一样。可以用餐类按钮、筛选（餐类、菜系、任一或全部）、搜索菜品或按食材查找。含你过敏原的食谱会被隐藏。",
      "\"جاهزة\" تعني أن لديك كل شيء، و\"ينقص 1\" تعني أنك بحاجة إلى شيء واحد. استخدم أزرار الوجبات أو الفلاتر (النوع، المطبخ، أيٌّ أو جميع) أو البحث عن وجبة أو حسب المكوّن. تُخفى الوصفات التي تحتوي على ما تتحسس منه."),
  },
  {
    id: "favorite", screen: "cook", emoji: "❤️", task: "favorite", target: '[data-tour="fav"]', optional: true,
    title: S("Save one for later", "Guarda una para después", "Gardez-en une pour plus tard", "Guarde uma para depois", "बाद के लिए सहेजें", "收藏一道以后做", "احفظ واحدة لاحقًا"),
    body: S("Tap the heart on any recipe. It goes into your Cookbook so you can find it again.", "Toca el corazón de cualquier receta. Irá a tu Recetario para encontrarla otra vez.", "Touchez le cœur d'une recette. Elle ira dans votre Livre de recettes.", "Toque no coração de qualquer receita. Ela vai para o seu Livro de receitas.", "किसी भी रेसिपी पर दिल पर टैप करें। वह आपकी कुकबुक में चली जाएगी।", "点任意食谱上的爱心，它会进入你的菜谱本，方便以后找到。", "اضغط القلب على أي وصفة، فتنتقل إلى كتاب وصفاتك لتجدها لاحقًا."),
  },
  {
    id: "open-recipe", screen: "cook", emoji: "👆", task: "recipe", target: ".ms-recipe-card", optional: true,
    title: S("Open a recipe", "Abre una receta", "Ouvrez une recette", "Abra uma receita", "एक रेसिपी खोलें", "打开一道食谱", "افتح وصفة"),
    body: S("Tap any recipe card to start cooking it. Don't worry, you can exit anytime.", "Toca cualquier receta para empezar a cocinarla. Puedes salir cuando quieras.", "Touchez une recette pour commencer à la cuisiner. Vous pouvez quitter à tout moment.", "Toque em qualquer receita para começar a cozinhar. Dá para sair quando quiser.", "किसी भी रेसिपी कार्ड पर टैप करके बनाना शुरू करें। आप कभी भी बाहर आ सकते हैं।", "点任意食谱卡片开始做菜，随时都可以退出。", "اضغط على أي بطاقة وصفة لتبدأ طبخها، ويمكنك الخروج في أي وقت."),
  },
  {
    id: "checklist", emoji: "✅", task: "check", target: '[data-tour="checklist"]', optional: true,
    title: S("Gather your ingredients", "Reúne los ingredientes", "Rassemblez les ingrédients", "Separe os ingredientes", "सामग्री जुटाएं", "备好食材", "اجمع مكوناتك"),
    body: S("Tick off an ingredient as you set it out. Change Servings above and every amount updates.", "Marca un ingrediente al sacarlo. Cambia las Porciones arriba y todas las cantidades se ajustan.", "Cochez un ingrédient en le sortant. Changez les Portions en haut et toutes les quantités s'ajustent.", "Marque um ingrediente ao separá-lo. Mude as Porções acima e todas as quantidades se ajustam.", "सामग्री निकालते हुए उस पर टिक करें। ऊपर सर्विंग बदलें तो हर मात्रा बदल जाती है।", "把食材拿出来时勾选它。改变上方的份数，所有用量都会跟着变。", "علّم على المكوّن عند تجهيزه. غيّر عدد الحصص في الأعلى فتتغير كل المقادير."),
  },
  {
    id: "step-card", emoji: "📋", task: "next", target: '[data-tour="next-step"]', optional: true,
    title: S("Follow each step", "Sigue cada paso", "Suivez chaque étape", "Siga cada passo", "हर कदम पर चलें", "按步骤来", "اتبع كل خطوة"),
    body: S(
      "Each step tells you how much and how long, what it should look like when it's done, and what else to check. When you're ready, tap Next step.",
      "Cada paso te dice cuánto y cuánto tiempo, cómo debe verse al terminar y qué más revisar. Cuando estés listo, toca Siguiente paso.",
      "Chaque étape indique combien et combien de temps, l'aspect attendu et quoi vérifier. Quand vous êtes prêt, touchez Étape suivante.",
      "Cada passo diz quanto e por quanto tempo, como deve ficar e o que mais conferir. Quando estiver pronto, toque em Próximo passo.",
      "हर कदम बताता है कितना और कितनी देर, पूरा होने पर कैसा दिखे और और क्या जांचें। तैयार हों तो Next step दबाएं।",
      "每一步都会告诉你用量和时间、做好时的样子以及还要注意什么。准备好了就点“下一步”。",
      "تخبرك كل خطوة بالكمية والمدة، وكيف يجب أن تبدو عند انتهائها، وماذا تتحقق أيضًا. عندما تكون جاهزًا اضغط الخطوة التالية."),
  },
  {
    id: "timer", emoji: "⏱️", task: "timer", target: '[data-tour="timer"]', optional: true,
    title: S("Start a timer", "Inicia un temporizador", "Lancez une minuterie", "Inicie um timer", "टाइमर चालू करें", "开始计时", "شغّل المؤقت"),
    body: S("When a step takes time, tap Start timer. It keeps running if you move on, and your screen stays on while you cook.", "Cuando un paso lleva tiempo, toca Iniciar temporizador. Sigue corriendo si avanzas, y la pantalla se queda encendida.", "Quand une étape prend du temps, touchez Lancer la minuterie. Elle continue si vous avancez, et l'écran reste allumé.", "Quando um passo leva tempo, toque em Iniciar timer. Ele continua se você avançar, e a tela fica ligada.", "जब किसी कदम में समय लगे, Start timer दबाएं। आगे बढ़ने पर भी चलता रहता है, और स्क्रीन चालू रहती है।", "某一步需要时间时，点“开始计时”。切到下一步也会继续，做饭时屏幕保持常亮。", "عندما تحتاج خطوة إلى وقت، اضغط ابدأ المؤقت. يستمر حتى لو انتقلت، وتبقى الشاشة مضاءة."),
  },
  {
    id: "exit", emoji: "🚪", task: "exit", target: '[data-tour="exit"]', optional: true,
    title: S("Exit for now", "Sal por ahora", "Quittez pour l'instant", "Saia por enquanto", "अभी के लिए बाहर आएं", "先退出", "اخرج الآن"),
    body: S("Tap Exit to leave the recipe. When you cook for real, finish all the steps to rate it and save it to your History.", "Toca Salir para dejar la receta. Cuando cocines de verdad, termina los pasos para calificarla y guardarla en tu Historial.", "Touchez Quitter pour sortir. Quand vous cuisinerez pour de vrai, terminez les étapes pour noter le plat et l'ajouter à votre Historique.", "Toque em Sair para deixar a receita. Quando cozinhar de verdade, termine os passos para avaliar e salvar no Histórico.", "रेसिपी से बाहर आने के लिए Exit दबाएं। असल में बनाते समय सारे कदम पूरे करें, फिर रेटिंग दें और हिस्ट्री में सहेजें।", "点“退出”离开食谱。真正做饭时，完成所有步骤后可以打分并保存到历史记录。", "اضغط خروج لترك الوصفة. عندما تطبخ فعليًا، أكمل الخطوات لتقيّمها وتحفظها في سجلك."),
  },
  {
    id: "cookbook", screen: "cookbook", emoji: "📖",
    title: S("Your Cookbook", "Tu recetario", "Votre livre de recettes", "Seu livro de receitas", "आपकी कुकबुक", "你的菜谱本", "كتاب وصفاتك"),
    body: S("Recipes you heart live here. You can also create your own with a photo, ingredients and steps that work just like guided cooking, timer included. Find it anytime under More.", "Las recetas con corazón están aquí. También puedes crear las tuyas con foto, ingredientes y pasos que funcionan como la cocina guiada, con temporizador. Está en Más.", "Les recettes aimées sont ici. Vous pouvez aussi créer les vôtres avec photo, ingrédients et étapes comme en cuisine guidée, minuterie comprise. C'est dans Plus.", "As receitas com coração ficam aqui. Você também pode criar as suas com foto, ingredientes e passos como na cozinha guiada, com timer. Fica em Mais.", "दिल वाली रेसिपी यहां रहती हैं। आप फ़ोटो, सामग्री और गाइडेड कुकिंग जैसे कदमों (टाइमर सहित) से अपनी रेसिपी भी बना सकते हैं। यह More में मिलती है।", "收藏的食谱都在这里。你也可以创建自己的食谱，添加照片、食材和步骤，用法和跟做模式一样，包括计时器。在“更多”里随时找到。", "الوصفات التي أحببتها هنا. ويمكنك إنشاء وصفاتك بصورة ومكونات وخطوات تعمل مثل الطبخ الموجّه، مع المؤقت. تجده دائمًا في المزيد."),
  },
  {
    id: "more", screen: "more", emoji: "🧭",
    title: S("Everything else is in More", "Todo lo demás está en Más", "Tout le reste est dans Plus", "O resto fica em Mais", "बाकी सब More में है", "其他功能都在“更多”里", "كل ما تبقى في المزيد"),
    body: S(
      "History & Progress keeps your ratings, notes and badges. Smart Shopping shows what to buy next and links to stores near you. Community has tips and tutorials from other cooks. Nutrition goals is optional. Settings (the gear at the top) has your allergies, language, units, dark mode and text size.",
      "Historial y progreso guarda tus calificaciones, notas e insignias. Compra inteligente muestra qué comprar y enlaza a tiendas cercanas. Comunidad tiene consejos y tutoriales. Metas de nutrición es opcional. Ajustes (el engranaje de arriba) tiene alergias, idioma, unidades, modo oscuro y tamaño de texto.",
      "Historique et progrès garde vos notes, commentaires et badges. Courses malines montre quoi acheter et renvoie vers des magasins proches. Communauté propose astuces et tutoriels. Objectifs nutritionnels est facultatif. Réglages (l'engrenage en haut) : allergies, langue, unités, mode sombre et taille du texte.",
      "Histórico e progresso guarda avaliações, notas e conquistas. Compras inteligentes mostra o que comprar e leva a lojas perto de você. Comunidade tem dicas e tutoriais. Metas de nutrição é opcional. Configurações (a engrenagem no topo) tem alergias, idioma, unidades, modo escuro e tamanho do texto.",
      "हिस्ट्री और प्रगति में आपकी रेटिंग, नोट्स और बैज रहते हैं। स्मार्ट शॉपिंग बताता है आगे क्या खरीदें और पास के स्टोर से जोड़ता है। कम्युनिटी में दूसरे रसोइयों के टिप्स और ट्यूटोरियल हैं। पोषण लक्ष्य वैकल्पिक है। सेटिंग्स (ऊपर गियर) में एलर्जी, भाषा, यूनिट, डार्क मोड और टेक्स्ट साइज़ हैं।",
      "“历史与进步”保存你的评分、笔记和徽章。“智能购物”告诉你接下来买什么，并链接到附近商店。“社区”有其他厨师的技巧和教程。“营养目标”是可选的。“设置”（顶部齿轮）里有过敏原、语言、单位、深色模式和文字大小。",
      "يحفظ السجل والتقدم تقييماتك وملاحظاتك وشاراتك. يعرض التسوق الذكي ما تشتريه لاحقًا ويربطك بمتاجر قريبة. في المجتمع نصائح ودروس من طهاة آخرين. الأهداف الغذائية اختيارية. وفي الإعدادات (الترس في الأعلى) الحساسية واللغة والوحدات والوضع الداكن وحجم النص."),
  },
  {
    id: "done", screen: "kitchen", emoji: "🎉",
    title: S("You're ready!", "¡Listo!", "C'est parti !", "Tudo pronto!", "आप तैयार हैं!", "准备好了！", "أنت جاهز!"),
    body: S("That's the whole loop: add what you have, pick a meal, cook it step by step. Replay this tour anytime from More → App tour, and use More → Feedback to tell us what to fix or add.", "Ese es todo el ciclo: añade lo que tienes, elige una comida y cocínala paso a paso. Repite este recorrido desde Más → Recorrido por la app, y usa Más → Comentarios para decirnos qué mejorar.", "Voilà le principe : ajoutez ce que vous avez, choisissez un plat, cuisinez-le pas à pas. Revoyez cette visite via Plus → Visite de l'app, et dites-nous quoi améliorer via Plus → Commentaires.", "Esse é o ciclo todo: adicione o que tem, escolha uma refeição e cozinhe passo a passo. Reveja este tour em Mais → Tour pelo app e use Mais → Feedback para dizer o que melhorar.", "यही पूरा तरीका है: जो है वह जोड़ें, खाना चुनें, कदम-दर-कदम बनाएं। यह टूर कभी भी More → ऐप टूर से दोबारा देखें, और More → फ़ीडबैक से बताएं क्या सुधारें।", "这就是完整流程：添加你有的，挑一道菜，一步步做出来。随时可在“更多 → 应用导览”重看，也可在“更多 → 反馈”告诉我们要改进什么。", "هذه هي الدورة كاملة: أضف ما لديك، اختر وجبة، واطبخها خطوة بخطوة. أعد الجولة في أي وقت من المزيد ← جولة في التطبيق، واستخدم المزيد ← الملاحظات لتخبرنا بما يجب تحسينه."),
  },
];

const pick = (map, lang) => (map && (map[lang] || map.en)) || "";
const matches = (task, type) => (task === "exit" ? /^screen:/.test(type) && type !== "screen:guided" : task === type);

export function TourCard({ step, total, data, lang, colors, onNext, onBack, onSkip }) {
  const ui = (k) => pick(TOUR_UI[k], lang);
  const C = colors;
  const last = step === total - 1;
  const isTask = !!data.task;
  const [done, setDone] = useState(false);
  const [missing, setMissing] = useState(false);
  const [atTop, setAtTop] = useState(false);
  const nextRef = useRef(null);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  // Reset for each step.
  useEffect(() => { setDone(false); setMissing(false); setAtTop(false); }, [step]);

  // Listen for the thing this step is waiting for.
  useEffect(() => {
    if (!isTask) return;
    const on = (e) => { if (matches(data.task, e.detail)) setDone(true); };
    window.addEventListener("ms-tour", on);
    return () => window.removeEventListener("ms-tour", on);
  }, [step, isTask, data.task]);

  // Once it's done, celebrate briefly and move on.
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => onNextRef.current(), 1300);
    return () => clearTimeout(id);
  }, [done]);

  // Highlight what to tap, keep it in view, and keep the card out of its way.
  useEffect(() => {
    if (!data.target) return;
    let el = null; let tries = 0; let scrolled = false;
    const tick = () => {
      const found = document.querySelector(data.target);
      if (found !== el) { if (el) el.classList.remove("ms-tour-target"); el = found; if (el) el.classList.add("ms-tour-target"); }
      if (el) {
        if (!scrolled) { el.scrollIntoView({ block: "center", behavior: "smooth" }); scrolled = true; }
        const r = el.getBoundingClientRect();
        setAtTop(r.top + r.height / 2 > window.innerHeight * 0.5);
        setMissing(false);
      } else if (++tries > 5 && data.optional) setMissing(true);
    };
    tick();
    const id = setInterval(tick, 400);
    return () => { clearInterval(id); if (el) el.classList.remove("ms-tour-target"); };
  }, [step, data.target, data.optional]);

  useEffect(() => { if (!isTask) nextRef.current && nextRef.current.focus({ preventScroll: true }); }, [step, isTask]);
  useEffect(() => {
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "");
      if (e.key === "Escape") onSkip();
      else if (!typing && e.key === "ArrowRight") onNext();
      else if (!typing && e.key === "ArrowLeft" && step > 0) onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, onNext, onBack, onSkip]);

  const pos = atTop ? { top: 16, bottom: "auto" } : { bottom: 16, top: "auto" };
  return (
    <div className="ms-tour" role="dialog" aria-modal="false" aria-labelledby="ms-tour-title" aria-describedby="ms-tour-body"
      style={{ position: "fixed", insetInline: 0, ...pos, zIndex: 60, display: "flex", justifyContent: "center", padding: "0 12px", pointerEvents: "none" }}>
      <div className="ms-tour-card" style={{ pointerEvents: "auto", width: "100%", maxWidth: 520, background: C.card, color: C.ink, borderRadius: 18, boxShadow: "0 16px 44px rgba(0,0,0,0.26)", border: `1px solid ${C.line}`, padding: "14px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.inkMuted }}>
            {ui("step").replace("{n}", step + 1).replace("{total}", total)}
            {isTask && <span style={{ marginInlineStart: 8, padding: "2px 8px", borderRadius: 10, background: C.accentSofter, color: C.accentText, letterSpacing: 0, textTransform: "none" }}>👆 {ui("tryIt")}</span>}
          </span>
          <button onClick={onSkip} style={{ background: "none", border: "none", color: C.inkMuted, fontSize: 13, cursor: "pointer", padding: 6, fontFamily: "inherit", textDecoration: "underline" }}>{ui("skip")}</button>
        </div>
        <div style={{ height: 4, background: C.line, borderRadius: 4, marginTop: 4, overflow: "hidden" }} aria-hidden="true">
          <div style={{ width: `${((step + (done ? 1 : 0.5)) / total) * 100}%`, height: "100%", background: C.primary, borderRadius: 4, transition: "width .3s" }} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 12 }}>
          <div aria-hidden="true" style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, width: 46, height: 46, borderRadius: 13, background: C.sageSofter, display: "flex", alignItems: "center", justifyContent: "center" }}>{done ? "✅" : data.emoji}</div>
          <div style={{ minWidth: 0 }}>
            <h2 id="ms-tour-title" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, fontWeight: 700, margin: "1px 0 5px", lineHeight: 1.25 }}>{pick(data.title, lang)}</h2>
            <p id="ms-tour-body" style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: C.ink }}>{pick(data.body, lang)}</p>
            {isTask && (
              <p role="status" aria-live="polite" style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600, color: done ? C.primaryText : C.inkMuted }}>
                {done ? `✓ ${ui("done")}` : missing ? ui("missing") : ui("waiting")}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          {step > 0 && (
            <button onClick={onBack} style={{ flex: "0 0 auto", padding: "10px 16px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{ui("back")}</button>
          )}
          {isTask && !done && !missing ? (
            <button onClick={onNext} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.paper, color: C.inkMuted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{ui("skipStep")}</button>
          ) : (
            <button ref={nextRef} onClick={onNext} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>{last ? ui("finish") : ui("next")}</button>
          )}
        </div>
      </div>
    </div>
  );
}
