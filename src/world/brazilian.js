import { R } from "./build.js";

export const BRAZILIAN = [
  R("picanha", "brazilian", "🥩", ["#EFC9B4", "#8A3B2A"], "35 min", ["high-protein", "low-carb"], ["dinner"], ["oven"],
    ["steak", "salt", "garlic"], [520, 44, 1, 38], {
    en: ["Picanha (Grilled Beef)", [
      ["Cut the picanha into thick steaks with the fat cap on and coat with coarse salt", "2 lb picanha, 1 1/2-inch slices", "Salt sticks to every side and the fat cap is intact"],
      ["Grill or roast hot, fat side first", "450°F (230°C), 15–20 min", "Fat is crisp and golden; meat is browned outside"],
      ["Rest, then slice thinly against the grain", "5 min rest", "Slices are pink in the middle with a juicy shine"]],
      ["Chimichurri or vinaigrette salsa", "Garlic butter brushed on at the end", "Farofa on the side"]],
    es: ["Picanha (carne asada)", [
      ["Corta la picaña en filetes gruesos con la capa de grasa y cúbrelos de sal gruesa", "900 g de picaña, rodajas de 4 cm", "La sal se pega por todos lados y la grasa está intacta"],
      ["Asa a fuego fuerte, primero por el lado de la grasa", "230°C, 15–20 min", "La grasa está crujiente y dorada; la carne dorada por fuera"],
      ["Deja reposar y corta fino en contra de la fibra", "5 min de reposo", "Las lonchas están rosadas en el centro y jugosas"]],
      ["Chimichurri o vinagreta", "Mantequilla de ajo al final", "Farofa al lado"]],
    fr: ["Picanha (bœuf grillé)", [
      ["Coupez la picanha en steaks épais avec le gras et couvrez de gros sel", "900 g de picanha, tranches de 4 cm", "Le sel adhère partout et le gras est intact"],
      ["Grillez à feu vif, côté gras d'abord", "230°C, 15–20 min", "Le gras est croustillant et doré ; la viande est saisie"],
      ["Laissez reposer puis tranchez finement contre le grain", "5 min de repos", "Les tranches sont rosées au centre et juteuses"]],
      ["Chimichurri ou vinaigrette", "Beurre à l'ail à la fin", "Farofa à côté"]],
    pt: ["Picanha", [
      ["Corte a picanha em bifes grossos com a capa de gordura e cubra com sal grosso", "900 g de picanha, fatias de 4 cm", "O sal gruda em todos os lados e a gordura está inteira"],
      ["Grelhe em fogo alto, primeiro pelo lado da gordura", "230°C, 15–20 min", "A gordura está crocante e dourada; a carne selada por fora"],
      ["Deixe descansar e fatie fino contra a fibra", "5 min de descanso", "As fatias estão rosadas no meio e suculentas"]],
      ["Chimichurri ou vinagrete", "Manteiga de alho no final", "Farofa ao lado"]],
    tw: ["Picanha (Nantwi Nam a Wɔatoto)", [
      ["Twitwa picanha no akɛseɛ a ne srade wɔ so, na fa nkyene kɛseɛ kata so", "Picanha 900g, 4cm", "Nkyene no tare afa nyinaa na srade no da so"],
      ["Toto no wɔ ogya kɛseɛ so, srade afa no kane", "230°C, simma 15–20", "Srade no ayɛ krakra na ɛyɛ akokɔsradeɛ"],
      ["Ma ɛnhome, afei twitwa no nketenkete", "Home simma 5", "Mfinimfini yɛ kɔkɔɔ kakra na nsuo wɔ mu"]],
      ["Chimichurri anaa vinaigrette", "Galik bota wɔ awieeɛ", "Farofa ka ho"]],
    hi: ["पिकान्हा (ग्रिल्ड बीफ़)", [
      ["पिकान्हा को चर्बी की परत समेत मोटे टुकड़ों में काटें और मोटा नमक लगाएँ", "900 ग्राम पिकान्हा, 4 सेमी टुकड़े", "नमक हर तरफ़ चिपका है और चर्बी की परत बरकरार है"],
      ["तेज़ आँच पर ग्रिल करें, पहले चर्बी वाली तरफ़", "230°C, 15–20 मिनट", "चर्बी कुरकुरी और सुनहरी है; मांस बाहर से भूरा है"],
      ["आराम दें, फिर रेशों के विपरीत पतला काटें", "5 मिनट आराम", "टुकड़े बीच से गुलाबी और रसीले हैं"]],
      ["चिमिचुर्री या विनेग्रेट", "अंत में लहसुन मक्खन", "साथ में फ़ारोफ़ा"]],
    zh: ["巴西烤牛臀盖", [
      ["牛臀盖带脂肪层切厚块，裹上粗盐", "900克，4厘米厚片", "每面都沾满盐，脂肪层完整"],
      ["大火烤，先烤脂肪面", "230°C，15–20分钟", "脂肪酥脆金黄，肉外层焦褐"],
      ["静置后逆纹切薄片", "静置5分钟", "肉片中心粉嫩多汁"]],
      ["阿根廷青酱或油醋汁", "最后刷蒜香黄油", "配木薯粉法罗法"]],
    ar: ["بيكانيا (لحم مشوي)", [
      ["قطّع البيكانيا شرائح سميكة مع طبقة الدهن وغطّها بالملح الخشن", "900 غ، شرائح 4 سم", "الملح ملتصق بكل الجوانب وطبقة الدهن سليمة"],
      ["اشوِ على نار عالية بدءًا بجهة الدهن", "230°م، 15–20 دقيقة", "الدهن مقرمش ذهبي واللحم محمر من الخارج"],
      ["اتركه يرتاح ثم قطّعه رقيقًا عكس الألياف", "5 دقائق راحة", "الشرائح وردية من الداخل وعصيرية"]],
      ["تشيميتشوري أو صلصة الخل", "زبدة بالثوم في النهاية", "فاروفا بجانبه"]],
  }),

  R("brigadeiro", "brazilian", "🍫", ["#E8D3C4", "#5A3426"], "25 min", ["vegetarian", "beginner-friendly", "quick-easy"], ["snack"], ["stove", "pot"],
    ["condensed milk", "cocoa powder", "butter", "chocolate sprinkles"], [110, 2, 17, 4], {
    en: ["Brigadeiro (Chocolate Truffle)", [
      ["Stir condensed milk, cocoa and butter in a pot over low heat without stopping", "1 can + 2 tbsp cocoa + 1 tbsp butter, 10–12 min", "Mixture pulls away from the bottom and slides as one mass when you tilt the pot"],
      ["Spread on a buttered plate and let it cool", "30 min", "Mixture is cool and firm enough to shape"],
      ["Butter your hands, roll small balls and coat in sprinkles", "About 20 balls", "Balls are round and fully covered in sprinkles"]],
      ["A pinch of salt", "Roll in cocoa or chopped nuts instead", "Serve in small paper cups"]],
    es: ["Brigadeiro (trufa de chocolate)", [
      ["Remueve leche condensada, cacao y mantequilla en una olla a fuego bajo sin parar", "1 lata + 2 cdas de cacao + 1 cda de mantequilla, 10–12 min", "La mezcla se despega del fondo y se mueve en un solo bloque al inclinar la olla"],
      ["Extiende en un plato con mantequilla y deja enfriar", "30 min", "La mezcla está fría y firme para formar"],
      ["Úntate las manos con mantequilla, forma bolitas y cúbrelas de fideos de chocolate", "Unas 20 bolitas", "Bolitas redondas y bien cubiertas"]],
      ["Una pizca de sal", "Rebózalas en cacao o frutos secos picados", "Sírvelas en capsulitas de papel"]],
    fr: ["Brigadeiro (truffe au chocolat)", [
      ["Remuez lait concentré, cacao et beurre à feu doux sans arrêter", "1 boîte + 2 c. à s. de cacao + 1 c. à s. de beurre, 10–12 min", "Le mélange se détache du fond et glisse d'un bloc quand on penche la casserole"],
      ["Étalez sur une assiette beurrée et laissez refroidir", "30 min", "Le mélange est froid et assez ferme pour être façonné"],
      ["Beurrez-vous les mains, roulez de petites boules et enrobez de vermicelles", "Environ 20 boules", "Boules rondes entièrement enrobées"]],
      ["Une pincée de sel", "Roulez-les dans le cacao ou des noix hachées", "Servez dans des caissettes en papier"]],
    pt: ["Brigadeiro", [
      ["Mexa leite condensado, cacau e manteiga em fogo baixo sem parar", "1 lata + 2 colheres de cacau + 1 colher de manteiga, 10–12 min", "A massa desgruda do fundo e desliza inteira ao inclinar a panela"],
      ["Espalhe num prato untado e deixe esfriar", "30 min", "A massa está fria e firme para enrolar"],
      ["Unte as mãos, enrole bolinhas e passe no granulado", "Cerca de 20 bolinhas", "Bolinhas redondas e todas cobertas"]],
      ["Uma pitada de sal", "Passe no cacau ou em castanhas picadas", "Sirva em forminhas de papel"]],
    tw: ["Brigadeiro (Chocolate Aduane)", [
      ["Kyinkyin nufosuo a ɛyɛ duru, cocoa ne bota wɔ ogya kakra so a wonnyae", "Kankyee 1 + atere kɛseɛ 2 cocoa + atere kɛseɛ 1 bota, simma 10–12", "Ɛtwe fi kuku ase na ɛtene sɛ biako bere a wobutuw kuku no"],
      ["Trɛw no wɔ prɛte a wɔasra bota so na ma ɛnnwo", "Simma 30", "Ayɛ nwini na ɛyɛ den sɛ wobɛtumi abɔ"],
      ["Sra bota wɔ wo nsa ho, bɔ no kurukuruwa nketewa na kata chocolate sprinkles so", "Bɛyɛ 20", "Ɛyɛ kurukuruwa na sprinkles akata so nyinaa"]],
      ["Nkyene kakra", "Fa cocoa anaa nkateɛ kata so", "Fa gu krataa kuruwa nketewa mu"]],
    hi: ["ब्रिगादेइरो (चॉकलेट ट्रफ़ल)", [
      ["गाढ़ा दूध, कोको और मक्खन को धीमी आँच पर लगातार चलाते हुए पकाएँ", "1 डिब्बा + 2 बड़े चम्मच कोको + 1 बड़ा चम्मच मक्खन, 10–12 मिनट", "मिश्रण तले से छूटता है और बर्तन झुकाने पर एक साथ खिसकता है"],
      ["मक्खन लगी प्लेट पर फैलाकर ठंडा करें", "30 मिनट", "मिश्रण ठंडा और आकार देने लायक सख़्त है"],
      ["हाथों पर मक्खन लगाकर छोटी गोलियाँ बनाएँ और स्प्रिंकल्स में लपेटें", "लगभग 20 गोलियाँ", "गोलियाँ गोल और पूरी तरह ढकी हैं"]],
      ["चुटकी भर नमक", "कोको या कटे मेवों में लपेटें", "छोटे पेपर कप में परोसें"]],
    zh: ["巴西巧克力球", [
      ["炼乳、可可粉和黄油小火不停搅拌", "1罐 + 2汤匙可可粉 + 1汤匙黄油，10–12分钟", "混合物离开锅底，倾斜锅时整团滑动"],
      ["倒在抹了黄油的盘子上放凉", "30分钟", "混合物冷却变硬，可以塑形"],
      ["手上抹黄油，搓成小球，滚满巧克力碎", "约20个", "小球圆润，完全裹满巧克力碎"]],
      ["加少许盐", "改滚可可粉或坚果碎", "放在小纸托里"]],
    ar: ["بريغاديرو (ترفل الشوكولاتة)", [
      ["حرّك الحليب المكثف والكاكاو والزبدة على نار هادئة دون توقف", "علبة + ملعقتان كاكاو + ملعقة زبدة، 10–12 دقيقة", "ينفصل الخليط عن القاع وينزلق ككتلة واحدة عند إمالة القدر"],
      ["افرده على طبق مدهون بالزبدة واتركه يبرد", "30 دقيقة", "الخليط بارد ومتماسك بما يكفي للتشكيل"],
      ["ادهن يديك بالزبدة وشكّل كرات صغيرة وغلّفها بحبيبات الشوكولاتة", "حوالي 20 كرة", "كرات مستديرة مغطاة بالكامل"]],
      ["رشة ملح", "غلّفها بالكاكاو أو المكسرات بدلًا من ذلك", "تُقدَّم في أكواب ورقية صغيرة"]],
  }),

  R("beijinho", "brazilian", "🥥", ["#F7F2E8", "#D9C9A8"], "25 min", ["vegetarian", "beginner-friendly", "quick-easy"], ["snack"], ["stove", "pot"],
    ["condensed milk", "coconut flakes", "butter"], [115, 1, 16, 5], {
    en: ["Beijinho (Coconut Truffle)", [
      ["Stir condensed milk, butter and most of the coconut over low heat without stopping", "1 can + 1 tbsp butter + 3/4 cup coconut, 10 min", "Mixture thickens and pulls away from the pot"],
      ["Spread on a buttered plate and let it cool", "30 min", "Firm enough to roll without sticking"],
      ["Roll into small balls and coat in the rest of the coconut", "About 20 balls", "Balls are white and evenly coated"]],
      ["Press a whole clove on top, the classic way", "A little lime zest", "Toast the coating coconut for color"]],
    es: ["Beijinho (trufa de coco)", [
      ["Remueve leche condensada, mantequilla y casi todo el coco a fuego bajo sin parar", "1 lata + 1 cda de mantequilla + 3/4 taza de coco, 10 min", "La mezcla espesa y se despega de la olla"],
      ["Extiende en un plato con mantequilla y deja enfriar", "30 min", "Firme para formar sin pegarse"],
      ["Forma bolitas y rebózalas en el resto del coco", "Unas 20 bolitas", "Bolitas blancas y bien cubiertas"]],
      ["Un clavo de olor encima, al estilo clásico", "Un poco de ralladura de lima", "Tuesta el coco del rebozado"]],
    fr: ["Beijinho (truffe à la noix de coco)", [
      ["Remuez lait concentré, beurre et presque toute la noix de coco à feu doux sans arrêter", "1 boîte + 1 c. à s. de beurre + 3/4 tasse de coco, 10 min", "Le mélange épaissit et se détache de la casserole"],
      ["Étalez sur une assiette beurrée et laissez refroidir", "30 min", "Assez ferme pour rouler sans coller"],
      ["Roulez en petites boules et enrobez du reste de coco", "Environ 20 boules", "Boules blanches uniformément enrobées"]],
      ["Un clou de girofle piqué dessus, à la façon classique", "Un peu de zeste de citron vert", "Faites griller la noix de coco d'enrobage"]],
    pt: ["Beijinho", [
      ["Mexa leite condensado, manteiga e quase todo o coco em fogo baixo sem parar", "1 lata + 1 colher de manteiga + 3/4 xícara de coco, 10 min", "A massa engrossa e desgruda da panela"],
      ["Espalhe num prato untado e deixe esfriar", "30 min", "Firme para enrolar sem grudar"],
      ["Enrole bolinhas e passe no resto do coco", "Cerca de 20 bolinhas", "Bolinhas brancas e bem cobertas"]],
      ["Um cravo-da-índia por cima, do jeito clássico", "Um pouco de raspas de limão", "Toste o coco da cobertura"]],
    tw: ["Beijinho (Kube Aduane)", [
      ["Kyinkyin nufosuo a ɛyɛ duru, bota ne kube no fa kɛseɛ wɔ ogya kakra so a wonnyae", "Kankyee 1 + atere kɛseɛ 1 bota + kuruwa 3/4 kube, simma 10", "Ɛpim na ɛtwe fi kuku no ho"],
      ["Trɛw no wɔ prɛte a wɔasra bota so na ma ɛnnwo", "Simma 30", "Ayɛ den sɛ wobɛbɔ a ɛrentare"],
      ["Bɔ no kurukuruwa nketewa na fa kube a aka no kata so", "Bɛyɛ 20", "Ɛyɛ fitaa na kube akata so pɛpɛɛpɛ"]],
      ["Fa pɛprɛ (clove) si soro", "Ankaa ho kakra", "Hyew kube no kakra"]],
    hi: ["बेजिन्यो (नारियल ट्रफ़ल)", [
      ["गाढ़ा दूध, मक्खन और ज़्यादातर नारियल को धीमी आँच पर लगातार चलाएँ", "1 डिब्बा + 1 बड़ा चम्मच मक्खन + 3/4 कप नारियल, 10 मिनट", "मिश्रण गाढ़ा होकर बर्तन छोड़ता है"],
      ["मक्खन लगी प्लेट पर फैलाकर ठंडा करें", "30 मिनट", "बिना चिपके गोली बनाने लायक सख़्त"],
      ["छोटी गोलियाँ बनाकर बचे नारियल में लपेटें", "लगभग 20 गोलियाँ", "गोलियाँ सफ़ेद और बराबर ढकी हैं"]],
      ["ऊपर एक लौंग लगाएँ, पारंपरिक तरीका", "थोड़ा नींबू का छिलका", "लपेटने वाला नारियल हल्का भून लें"]],
    zh: ["巴西椰子球", [
      ["炼乳、黄油和大部分椰丝小火不停搅拌", "1罐 + 1汤匙黄油 + 3/4杯椰丝，10分钟", "混合物变稠并离开锅壁"],
      ["倒在抹了黄油的盘子上放凉", "30分钟", "硬到可以搓圆而不粘手"],
      ["搓成小球，滚上剩下的椰丝", "约20个", "小球雪白，椰丝均匀"]],
      ["顶上插一颗丁香，传统做法", "加少许青柠皮屑", "把外层椰丝烤一下更香"]],
    ar: ["بيجينيو (ترفل جوز الهند)", [
      ["حرّك الحليب المكثف والزبدة ومعظم جوز الهند على نار هادئة دون توقف", "علبة + ملعقة زبدة + ثلاثة أرباع كوب جوز هند، 10 دقائق", "يتكاثف الخليط وينفصل عن القدر"],
      ["افرده على طبق مدهون بالزبدة واتركه يبرد", "30 دقيقة", "متماسك بما يكفي للتشكيل دون التصاق"],
      ["شكّل كرات صغيرة وغلّفها بباقي جوز الهند", "حوالي 20 كرة", "كرات بيضاء مغطاة بالتساوي"]],
      ["حبة قرنفل فوقها على الطريقة التقليدية", "قليل من بشر الليمون الأخضر", "حمّص جوز الهند الخارجي"]],
  }),

  R("vaca-atolada", "brazilian", "🍲", ["#F1DCC0", "#93502E"], "120 min", ["high-protein", "budget-friendly", "meal-prep"], ["dinner"], ["stove", "pot"],
    ["beef", "cassava", "onion", "tomato", "garlic"], [580, 38, 52, 22], {
    en: ["Vaca Atolada (Beef & Cassava Stew)", [
      ["Brown the beef ribs or chunks in a hot pot, then add onion, garlic and tomato", "2 lb beef, 10 min", "Meat is browned and the onion is soft"],
      ["Cover with water and simmer until the meat is nearly tender", "75 min", "Meat gives easily when pierced"],
      ["Add peeled cassava chunks and cook until they break down at the edges", "30 min", "Cassava is soft and the stew has turned thick and creamy"]],
      ["Chopped parsley and green onion", "A splash of hot sauce", "Serve with white rice"]],
    es: ["Vaca atolada (guiso de res y yuca)", [
      ["Dora la costilla o trozos de res en una olla caliente y añade cebolla, ajo y tomate", "900 g de res, 10 min", "La carne está dorada y la cebolla blanda"],
      ["Cubre con agua y cocina a fuego lento hasta que esté casi tierna", "75 min", "La carne cede fácilmente al pincharla"],
      ["Añade la yuca pelada en trozos y cocina hasta que se deshaga por los bordes", "30 min", "La yuca está blanda y el guiso espeso y cremoso"]],
      ["Perejil y cebolleta picados", "Un chorrito de salsa picante", "Sírvelo con arroz blanco"]],
    fr: ["Vaca atolada (ragoût bœuf-manioc)", [
      ["Faites dorer les côtes ou morceaux de bœuf dans une cocotte chaude, ajoutez oignon, ail et tomate", "900 g de bœuf, 10 min", "La viande est dorée et l'oignon fondu"],
      ["Couvrez d'eau et laissez mijoter jusqu'à ce que la viande soit presque tendre", "75 min", "La viande cède facilement"],
      ["Ajoutez le manioc épluché en morceaux et cuisez jusqu'à ce qu'il se défasse sur les bords", "30 min", "Le manioc est tendre et le ragoût épais et onctueux"]],
      ["Persil et oignon vert hachés", "Un trait de sauce piquante", "Servez avec du riz blanc"]],
    pt: ["Vaca atolada", [
      ["Doure a costela ou pedaços de carne numa panela quente, junte cebola, alho e tomate", "900 g de carne, 10 min", "A carne está dourada e a cebola macia"],
      ["Cubra com água e cozinhe em fogo baixo até a carne quase amaciar", "75 min", "A carne cede fácil ao furar"],
      ["Junte a mandioca descascada em pedaços e cozinhe até desmanchar nas bordas", "30 min", "A mandioca está macia e o ensopado grosso e cremoso"]],
      ["Cheiro-verde picado", "Um pouco de pimenta", "Sirva com arroz branco"]],
    tw: ["Vaca Atolada (Nantwi ne Bankye Abomu)", [
      ["Kye nantwi nam no wɔ kuku a ɛyɛ hyew mu, afei fa onion, galik ne ntoosi ka ho", "Nantwi 900g, simma 10", "Nam no ayɛ tuntum kakra na onion no ayɛ mmerɛw"],
      ["Fa nsuo kata so na noa brɛoo kɔsi sɛ nam no bɛyɛ mmerɛw kakra", "Simma 75", "Nam no gye ntɛm bere a wowɔ mu"],
      ["Fa bankye a woayi ho ka ho na noa kɔsi sɛ ano bɛbubu", "Simma 30", "Bankye no ayɛ mmerɛw na abomu no apim"]],
      ["Parsley ne onion ahabammono", "Mako nsuo kakra", "Fa di ɛmo fitaa"]],
    hi: ["वाका अतोलादा (बीफ़ और कसावा स्टू)", [
      ["गर्म बर्तन में बीफ़ भूरा करें, फिर प्याज़, लहसुन और टमाटर डालें", "900 ग्राम बीफ़, 10 मिनट", "मांस भूरा है और प्याज़ नरम है"],
      ["पानी डालकर ढकें और मांस लगभग नरम होने तक धीमी आँच पर पकाएँ", "75 मिनट", "चुभाने पर मांस आसानी से कटता है"],
      ["छिला कसावा डालें और किनारों से गलने तक पकाएँ", "30 मिनट", "कसावा नरम है और स्टू गाढ़ा व मलाईदार है"]],
      ["कटा पार्सले और हरा प्याज़", "थोड़ी हॉट सॉस", "सफ़ेद चावल के साथ परोसें"]],
    zh: ["巴西牛肉木薯炖", [
      ["热锅煎牛肋或牛肉块至上色，加入洋葱、蒜和番茄", "900克牛肉，10分钟", "牛肉上色，洋葱变软"],
      ["加水没过，小火炖至牛肉快软", "75分钟", "牛肉一戳就进"],
      ["加入去皮木薯块，炖到边缘化开", "30分钟", "木薯软烂，炖菜浓稠绵滑"]],
      ["欧芹和葱花", "少许辣酱", "配白米饭"]],
    ar: ["فاكا أتولادا (يخنة اللحم والكسافا)", [
      ["حمّر ضلوع أو قطع اللحم في قدر ساخن ثم أضف البصل والثوم والطماطم", "900 غ لحم، 10 دقائق", "اللحم محمر والبصل طري"],
      ["غطّه بالماء واتركه على نار هادئة حتى يقارب النضج", "75 دقيقة", "يلين اللحم بسهولة عند غرزه"],
      ["أضف قطع الكسافا المقشرة واطهها حتى تتفتت أطرافها", "30 دقيقة", "الكسافا طرية واليخنة كثيفة وكريمية"]],
      ["بقدونس وبصل أخضر مفروم", "قليل من الصلصة الحارة", "تُقدَّم مع الأرز الأبيض"]],
  }),

  R("farofa", "brazilian", "🥣", ["#F3E3C0", "#C8963E"], "15 min", ["quick-easy", "budget-friendly"], ["dinner"], ["stove", "pan"],
    ["cassava flour", "butter", "bacon", "onion"], [290, 6, 34, 15], {
    en: ["Farofa (Toasted Cassava Flour)", [
      ["Fry chopped bacon until crisp, then add butter and chopped onion", "3 slices bacon + 2 tbsp butter, 5 min", "Bacon is crisp and the onion is golden"],
      ["Add the cassava flour and stir constantly over medium heat", "1 cup flour, 5–6 min", "Flour turns light golden and smells nutty"],
      ["Season with salt and take off the heat", "Pinch of salt", "Farofa looks like dry, golden crumbs"]],
      ["Chopped parsley", "A scrambled egg stirred in", "Sprinkle over beans or grilled meat"]],
    es: ["Farofa (harina de yuca tostada)", [
      ["Fríe tocino picado hasta que esté crujiente, añade mantequilla y cebolla picada", "3 lonchas + 2 cdas de mantequilla, 5 min", "El tocino está crujiente y la cebolla dorada"],
      ["Añade la harina de yuca y remueve sin parar a fuego medio", "1 taza de harina, 5–6 min", "La harina se dora un poco y huele a tostado"],
      ["Sazona con sal y retira del fuego", "Una pizca de sal", "La farofa parece migas secas y doradas"]],
      ["Perejil picado", "Un huevo revuelto mezclado", "Espolvoréala sobre frijoles o carne asada"]],
    fr: ["Farofa (farine de manioc grillée)", [
      ["Faites frire le lard haché jusqu'à ce qu'il croustille, ajoutez beurre et oignon haché", "3 tranches + 2 c. à s. de beurre, 5 min", "Le lard est croustillant et l'oignon doré"],
      ["Ajoutez la farine de manioc et remuez sans arrêt à feu moyen", "1 tasse de farine, 5–6 min", "La farine dore légèrement et sent la noisette"],
      ["Salez et retirez du feu", "Une pincée de sel", "La farofa ressemble à des miettes dorées et sèches"]],
      ["Persil haché", "Un œuf brouillé mélangé", "Saupoudrez sur des haricots ou de la viande grillée"]],
    pt: ["Farofa", [
      ["Frite o bacon picado até ficar crocante, junte manteiga e cebola picada", "3 fatias + 2 colheres de manteiga, 5 min", "O bacon está crocante e a cebola dourada"],
      ["Junte a farinha de mandioca e mexa sem parar em fogo médio", "1 xícara de farinha, 5–6 min", "A farinha doura levemente e cheira a tostado"],
      ["Tempere com sal e tire do fogo", "Uma pitada de sal", "A farofa parece migalhas secas e douradas"]],
      ["Salsinha picada", "Um ovo mexido misturado", "Polvilhe sobre feijão ou carne grelhada"]],
    tw: ["Farofa (Gari a Wɔakye)", [
      ["Kye bacon a woatwitwa kɔsi sɛ ɛbɛyɛ krakra, afei fa bota ne onion ka ho", "Bacon 3 + atere kɛseɛ 2 bota, simma 5", "Bacon no ayɛ krakra na onion no ayɛ akokɔsradeɛ"],
      ["Fa bankye esam no ka ho na kyinkyin daa wɔ ogya ntam so", "Kuruwa 1 esam, simma 5–6", "Esam no ayɛ akokɔsradeɛ kakra na ɛhwa dɛ"],
      ["Fa nkyene gu mu na yi fi ogya so", "Nkyene kakra", "Ɛyɛ sɛ mmorosoɔ a ɛyɛ akokɔsradeɛ"]],
      ["Parsley a woatwitwa", "Kosua a woakye afra mu", "Pete no adua anaa nam a wɔatoto so"]],
    hi: ["फ़ारोफ़ा (भुना कसावा आटा)", [
      ["कटे बेकन को कुरकुरा होने तक तलें, फिर मक्खन और कटा प्याज़ डालें", "3 स्लाइस बेकन + 2 बड़े चम्मच मक्खन, 5 मिनट", "बेकन कुरकुरा और प्याज़ सुनहरा है"],
      ["कसावा आटा डालें और मध्यम आँच पर लगातार चलाएँ", "1 कप आटा, 5–6 मिनट", "आटा हल्का सुनहरा होकर सोंधी खुशबू देता है"],
      ["नमक डालें और आँच से उतारें", "चुटकी भर नमक", "फ़ारोफ़ा सूखे सुनहरे चूरे जैसा दिखता है"]],
      ["कटा पार्सले", "एक भुरजी अंडा मिलाएँ", "बीन्स या ग्रिल्ड मांस पर छिड़कें"]],
    zh: ["法罗法木薯粉", [
      ["培根丁煎脆，加黄油和洋葱碎", "3片培根 + 2汤匙黄油，5分钟", "培根酥脆，洋葱金黄"],
      ["加入木薯粉，中火不停翻炒", "1杯木薯粉，5–6分钟", "木薯粉微黄，散发坚果香"],
      ["加盐调味后离火", "少许盐", "看起来像干燥的金黄碎屑"]],
      ["欧芹碎", "拌入炒蛋", "撒在豆子或烤肉上"]],
    ar: ["فاروفا (دقيق الكسافا المحمص)", [
      ["اقلِ البيكون المفروم حتى يقرمش ثم أضف الزبدة والبصل المفروم", "3 شرائح + ملعقتان زبدة، 5 دقائق", "البيكون مقرمش والبصل ذهبي"],
      ["أضف دقيق الكسافا وحرّك باستمرار على نار متوسطة", "كوب دقيق، 5–6 دقائق", "يصبح الدقيق ذهبيًا فاتحًا برائحة محمصة"],
      ["تبّل بالملح وارفعه عن النار", "رشة ملح", "تبدو الفاروفا كفتات جاف ذهبي"]],
      ["بقدونس مفروم", "بيضة مخفوقة مقلبة فيها", "رشها على الفاصوليا أو اللحم المشوي"]],
  }),

  R("mandioca-frita", "brazilian", "🍟", ["#F7EBC3", "#D9A441"], "40 min", ["vegan", "vegetarian", "budget-friendly", "high-carb"], ["snack"], ["stove", "pot"],
    ["cassava", "oil", "salt"], [330, 2, 52, 14], {
    en: ["Mandioca Frita (Fried Cassava)", [
      ["Peel the cassava, cut into sticks and boil in salted water until just tender", "1 1/2 lb cassava, 15–20 min", "Sticks are soft at the edges but hold their shape"],
      ["Drain, remove the woody core and let them steam dry", "10 min", "Surface looks dry and slightly fluffy"],
      ["Fry in hot oil until crisp, then salt", "350°F (175°C), 5–6 min", "Sticks are golden and crunchy outside, creamy inside"]],
      ["Garlic mayo for dipping", "A squeeze of lime", "Grated parmesan on top"]],
    es: ["Yuca frita", [
      ["Pela la yuca, córtala en bastones y hiérvela en agua con sal hasta que esté tierna", "700 g de yuca, 15–20 min", "Los bastones están blandos en los bordes pero mantienen la forma"],
      ["Escurre, quita la fibra central y deja que se seque con el vapor", "10 min", "La superficie se ve seca y algo esponjosa"],
      ["Fríe en aceite caliente hasta que esté crujiente y sala", "175°C, 5–6 min", "Bastones dorados y crujientes por fuera, cremosos por dentro"]],
      ["Mayonesa de ajo para mojar", "Un chorrito de lima", "Parmesano rallado encima"]],
    fr: ["Manioc frit", [
      ["Épluchez le manioc, coupez en bâtonnets et faites-les bouillir dans l'eau salée jusqu'à tendreté", "700 g de manioc, 15–20 min", "Les bâtonnets sont tendres sur les bords mais gardent leur forme"],
      ["Égouttez, retirez le cœur fibreux et laissez sécher à la vapeur", "10 min", "La surface paraît sèche et légèrement farineuse"],
      ["Faites frire dans l'huile chaude jusqu'à ce qu'ils croustillent, salez", "175°C, 5–6 min", "Dorés et croquants dehors, fondants dedans"]],
      ["Mayonnaise à l'ail pour tremper", "Un filet de citron vert", "Parmesan râpé dessus"]],
    pt: ["Mandioca frita", [
      ["Descasque a mandioca, corte em palitos e cozinhe em água com sal até ficar macia", "700 g de mandioca, 15–20 min", "Os palitos estão macios nas bordas mas mantêm a forma"],
      ["Escorra, tire o fio central e deixe secar no vapor", "10 min", "A superfície parece seca e levemente farinhenta"],
      ["Frite em óleo quente até ficar crocante e salgue", "175°C, 5–6 min", "Dourada e crocante por fora, cremosa por dentro"]],
      ["Maionese de alho para mergulhar", "Um pouco de limão", "Parmesão ralado por cima"]],
    tw: ["Bankye a Wɔakye", [
      ["Yi bankye no ho, twitwa no tenten, na noa wɔ nsuo a nkyene wɔ mu kɔsi sɛ ɛbɛyɛ mmerɛw", "Bankye 700g, simma 15–20", "Ano ayɛ mmerɛw nanso ɛgyina ne nsɛsoɔ"],
      ["Hwie nsuo no gu, yi ne mfinimfini hama no na ma ɛnwo", "Simma 10", "Ne ho ayɛ hyew na ɛwo"],
      ["Kye no wɔ ngo a ɛyɛ hyew mu kɔsi sɛ ɛbɛyɛ krakra, afei fa nkyene gu so", "175°C, simma 5–6", "Ɛyɛ akokɔsradeɛ na ɛyɛ krakra, ne mu yɛ mmerɛw"]],
      ["Galik mayo", "Ankaa kakra", "Parmesan wɔ soro"]],
    hi: ["मंडिओका फ़्रिटा (तला कसावा)", [
      ["कसावा छीलें, लंबे टुकड़े काटें और नमकीन पानी में नरम होने तक उबालें", "700 ग्राम कसावा, 15–20 मिनट", "टुकड़े किनारों से नरम हैं पर आकार बना है"],
      ["पानी निकालें, बीच का रेशा हटाएँ और भाप से सूखने दें", "10 मिनट", "सतह सूखी और हल्की भुरभुरी दिखती है"],
      ["गर्म तेल में कुरकुरा होने तक तलें, फिर नमक डालें", "175°C, 5–6 मिनट", "बाहर से सुनहरे कुरकुरे, अंदर से मलाईदार"]],
      ["डुबोने के लिए लहसुन मेयो", "थोड़ा नींबू", "ऊपर कसा पार्मेज़ान"]],
    zh: ["炸木薯条", [
      ["木薯去皮切条，用盐水煮至刚软", "700克木薯，15–20分钟", "木薯条边缘变软但不散"],
      ["沥干，去掉木质芯，让蒸汽散干", "10分钟", "表面干爽，略显粉糯"],
      ["热油炸至酥脆，撒盐", "175°C，5–6分钟", "外层金黄酥脆，内里绵软"]],
      ["蒜香蛋黄酱蘸着吃", "挤点青柠汁", "撒帕玛森芝士"]],
    ar: ["كسافا مقلية", [
      ["قشّر الكسافا وقطّعها أصابع واسلقها في ماء مملح حتى تطرى", "700 غ كسافا، 15–20 دقيقة", "الأصابع طرية عند الأطراف ومحافظة على شكلها"],
      ["صفّها وأزل اللب الخشبي واتركها تجف بالبخار", "10 دقائق", "السطح جاف وهش قليلًا"],
      ["اقلها في زيت ساخن حتى تقرمش ثم رش الملح", "175°م، 5–6 دقائق", "ذهبية مقرمشة من الخارج وكريمية من الداخل"]],
      ["مايونيز بالثوم للغمس", "عصرة ليمون أخضر", "بارميزان مبشور فوقها"]],
  }),

  R("arroz-brasileira", "brazilian", "🍚", ["#F5F0E2", "#C9B98A"], "25 min", ["vegan", "vegetarian", "budget-friendly", "high-carb", "beginner-friendly"], ["lunch", "dinner"], ["stove", "pot"],
    ["rice", "onion", "garlic", "oil", "salt"], [250, 4, 50, 4], {
    en: ["Arroz à Brasileira (Brazilian Rice)", [
      ["Fry chopped onion and garlic in oil until soft", "1/2 onion + 2 cloves, 3 min", "Onion is translucent and the garlic smells fragrant"],
      ["Add washed rice and toast, stirring", "1 cup rice, 2 min", "Grains look slightly see-through at the edges"],
      ["Add boiling water and salt, then cover and cook on low", "2 cups water, 15 min", "Water is absorbed and the grains are separate and fluffy"]],
      ["Diced carrot and peas cooked with the rice", "A bay leaf in the pot", "Chopped parsley on top"]],
    es: ["Arroz a la brasileña", [
      ["Sofríe cebolla y ajo picados en aceite hasta que estén blandos", "1/2 cebolla + 2 dientes, 3 min", "La cebolla está translúcida y el ajo huele"],
      ["Añade el arroz lavado y tuéstalo removiendo", "1 taza de arroz, 2 min", "Los granos se ven algo translúcidos en los bordes"],
      ["Añade agua hirviendo y sal, tapa y cocina a fuego bajo", "2 tazas de agua, 15 min", "Se absorbió el agua y los granos están sueltos"]],
      ["Zanahoria en cubos y guisantes con el arroz", "Una hoja de laurel", "Perejil picado encima"]],
    fr: ["Riz à la brésilienne", [
      ["Faites revenir oignon et ail hachés dans l'huile jusqu'à ce qu'ils soient tendres", "1/2 oignon + 2 gousses, 3 min", "L'oignon est translucide et l'ail parfumé"],
      ["Ajoutez le riz lavé et faites-le nacrer en remuant", "1 tasse de riz, 2 min", "Les grains sont un peu translucides sur les bords"],
      ["Ajoutez l'eau bouillante et le sel, couvrez et cuisez à feu doux", "2 tasses d'eau, 15 min", "L'eau est absorbée et les grains bien détachés"]],
      ["Carotte en dés et petits pois cuits avec le riz", "Une feuille de laurier", "Persil haché dessus"]],
    pt: ["Arroz à brasileira", [
      ["Refogue cebola e alho picados no óleo até amaciar", "1/2 cebola + 2 dentes, 3 min", "A cebola está transparente e o alho cheiroso"],
      ["Junte o arroz lavado e frite mexendo", "1 xícara de arroz, 2 min", "Os grãos ficam um pouco transparentes nas bordas"],
      ["Junte água fervente e sal, tampe e cozinhe em fogo baixo", "2 xícaras de água, 15 min", "A água secou e os grãos estão soltinhos"]],
      ["Cenoura em cubos e ervilha junto com o arroz", "Uma folha de louro", "Salsinha picada por cima"]],
    tw: ["Arroz à Brasileira (Brazil Ɛmo)", [
      ["Kye onion ne galik wɔ ngo mu kɔsi sɛ ɛbɛyɛ mmerɛw", "Onion fa + galik 2, simma 3", "Onion no ayɛ hann na galik no hwa dɛ"],
      ["Fa ɛmo a woahohoro ka ho na kye kakra, kyinkyin", "Kuruwa 1 ɛmo, simma 2", "Ɛmo no ano ayɛ hann kakra"],
      ["Fa nsuo a ɛrehuru ne nkyene ka ho, kata so na noa wɔ ogya kakra so", "Kuruwa 2 nsuo, simma 15", "Nsuo no asa na ɛmo no mfam"]],
      ["Karɔt ne peas ka ɛmo no ho", "Bay leaf baako", "Parsley wɔ soro"]],
    hi: ["आरोज़ आ ब्राज़ीलेइरा (ब्राज़ीलियन चावल)", [
      ["कटा प्याज़ और लहसुन तेल में नरम होने तक भूनें", "1/2 प्याज़ + 2 कलियाँ, 3 मिनट", "प्याज़ पारदर्शी है और लहसुन की खुशबू आती है"],
      ["धुले चावल डालकर चलाते हुए भूनें", "1 कप चावल, 2 मिनट", "दाने किनारों से हल्के पारदर्शी दिखते हैं"],
      ["उबलता पानी और नमक डालें, ढककर धीमी आँच पर पकाएँ", "2 कप पानी, 15 मिनट", "पानी सूख गया है और दाने खिले-खिले हैं"]],
      ["चावल के साथ गाजर और मटर", "एक तेज़पत्ता", "ऊपर कटा पार्सले"]],
    zh: ["巴西风味米饭", [
      ["洋葱和蒜切碎用油炒软", "半个洋葱 + 2瓣蒜，3分钟", "洋葱透明，蒜香扑鼻"],
      ["加入洗好的米翻炒", "1杯米，2分钟", "米粒边缘略透明"],
      ["加沸水和盐，盖上锅盖小火煮", "2杯水，15分钟", "水分吸干，米粒粒分明"]],
      ["和米饭一起煮胡萝卜丁和豌豆", "放一片月桂叶", "撒欧芹碎"]],
    ar: ["أرز على الطريقة البرازيلية", [
      ["اقلِ البصل والثوم المفرومين في الزيت حتى يطريا", "نصف بصلة + فصّان، 3 دقائق", "البصل شفاف والثوم فواح"],
      ["أضف الأرز المغسول وحمّصه مع التقليب", "كوب أرز، دقيقتان", "حبات الأرز شفافة قليلًا عند الأطراف"],
      ["أضف ماءً مغليًا وملحًا وغطِّه واطهه على نار هادئة", "كوبا ماء، 15 دقيقة", "امتص الماء والحبات مفلفلة"]],
      ["جزر مكعب وبازلاء مع الأرز", "ورقة غار", "بقدونس مفروم فوقه"]],
  }),

  R("salada-palmito", "brazilian", "🥗", ["#EEF3E2", "#9DBA7A"], "10 min", ["vegan", "vegetarian", "low-calorie", "quick-easy", "low-carb", "healthy-balanced"], ["lunch"], [],
    ["hearts of palm", "cherry tomatoes", "red onion", "olive oil", "lime"], [160, 4, 12, 11], {
    en: ["Salada de Palmito (Hearts of Palm Salad)", [
      ["Drain and slice the hearts of palm into rounds", "1 can", "Rounds are even, about 1/2 inch thick"],
      ["Halve the cherry tomatoes and thinly slice the red onion", "1 cup tomatoes + 1/4 onion", "Onion slices are paper-thin"],
      ["Toss with olive oil, lime juice, salt and pepper", "2 tbsp oil + juice of 1 lime", "Everything looks glossy and lightly dressed"]],
      ["Chopped parsley or cilantro", "Green olives", "Sliced avocado"]],
    es: ["Ensalada de palmito", [
      ["Escurre y corta el palmito en rodajas", "1 lata", "Rodajas parejas de 1 cm"],
      ["Corta los tomates cherry por la mitad y la cebolla morada muy fina", "1 taza de tomates + 1/4 cebolla", "La cebolla está en láminas finísimas"],
      ["Mezcla con aceite de oliva, jugo de lima, sal y pimienta", "2 cdas de aceite + jugo de 1 lima", "Todo se ve brillante y ligeramente aliñado"]],
      ["Perejil o cilantro picado", "Aceitunas verdes", "Aguacate en láminas"]],
    fr: ["Salade de cœurs de palmier", [
      ["Égouttez et coupez les cœurs de palmier en rondelles", "1 boîte", "Rondelles régulières d'environ 1 cm"],
      ["Coupez les tomates cerises en deux et émincez finement l'oignon rouge", "1 tasse de tomates + 1/4 oignon", "L'oignon est très finement émincé"],
      ["Mélangez avec huile d'olive, jus de citron vert, sel et poivre", "2 c. à s. d'huile + jus d'1 citron vert", "Tout est brillant et légèrement assaisonné"]],
      ["Persil ou coriandre hachés", "Olives vertes", "Avocat en tranches"]],
    pt: ["Salada de palmito", [
      ["Escorra e corte o palmito em rodelas", "1 vidro", "Rodelas iguais de cerca de 1 cm"],
      ["Corte os tomates-cereja ao meio e fatie a cebola roxa bem fina", "1 xícara de tomates + 1/4 cebola", "A cebola está em fatias finíssimas"],
      ["Misture com azeite, suco de limão, sal e pimenta", "2 colheres de azeite + suco de 1 limão", "Tudo brilhante e levemente temperado"]],
      ["Salsinha ou coentro picado", "Azeitonas verdes", "Abacate fatiado"]],
    tw: ["Palmito Saladi", [
      ["Hwie nsuo no gu na twitwa palmito no kurukuruwa", "Kankyee 1", "Ne nyinaa yɛ pɛ, bɛyɛ 1cm"],
      ["Pae ntoosi nketewa no mu abien na twitwa onion kɔkɔɔ no nketenkete", "Kuruwa 1 ntoosi + onion 1/4", "Onion no yɛ hare sɛ krataa"],
      ["Fa ngo, ankaa nsuo, nkyene ne mako fra", "Atere kɛseɛ 2 ngo + ankaa 1 nsuo", "Ne nyinaa hyerɛn na aduru no ka ho kakra"]],
      ["Parsley anaa cilantro", "Ngo aba ahabammono", "Paya a woatwitwa"]],
    hi: ["पाल्मितो सलाद", [
      ["हार्ट्स ऑफ़ पाम का पानी निकालकर गोल टुकड़े काटें", "1 डिब्बा", "टुकड़े बराबर, लगभग 1 सेमी"],
      ["चेरी टमाटर आधे करें और लाल प्याज़ पतला काटें", "1 कप टमाटर + 1/4 प्याज़", "प्याज़ कागज़ जैसा पतला है"],
      ["जैतून तेल, नींबू रस, नमक और काली मिर्च के साथ मिलाएँ", "2 बड़े चम्मच तेल + 1 नींबू का रस", "सब चमकदार और हल्का सना हुआ है"]],
      ["कटा पार्सले या धनिया", "हरे जैतून", "कटा एवोकाडो"]],
    zh: ["棕榈心沙拉", [
      ["棕榈心沥干切圆片", "1罐", "圆片厚度均匀，约1厘米"],
      ["樱桃番茄对半切，红洋葱切极薄片", "1杯番茄 + 1/4个洋葱", "洋葱薄如纸"],
      ["加橄榄油、青柠汁、盐和胡椒拌匀", "2汤匙油 + 1个青柠的汁", "整体油亮，调味清淡"]],
      ["欧芹或香菜碎", "青橄榄", "牛油果片"]],
    ar: ["سلطة قلب النخيل", [
      ["صفِّ قلب النخيل وقطّعه حلقات", "علبة واحدة", "حلقات متساوية بسمك 1 سم تقريبًا"],
      ["قطّع الطماطم الكرزية نصفين وشرّح البصل الأحمر رقيقًا", "كوب طماطم + ربع بصلة", "البصل رقيق كالورق"],
      ["اخلطها مع زيت الزيتون وعصير الليمون الأخضر والملح والفلفل", "ملعقتان زيت + عصير ليمونة", "كل شيء لامع ومتبل بخفة"]],
      ["بقدونس أو كزبرة مفرومة", "زيتون أخضر", "شرائح أفوكادو"]],
  }),

  R("bolo-cenoura", "brazilian", "🍰", ["#FBE2C2", "#E07A2E"], "55 min", ["vegetarian", "meal-prep"], ["snack", "breakfast"], ["oven"],
    ["carrot", "eggs", "sugar", "flour", "oil", "baking powder", "cocoa powder"], [340, 5, 46, 16], {
    en: ["Bolo de Cenoura (Carrot Cake)", [
      ["Blend chopped carrots, eggs, sugar and oil until completely smooth", "3 carrots + 3 eggs + 1 1/2 cups sugar + 3/4 cup oil", "Batter is bright orange with no carrot bits"],
      ["Fold into the flour and baking powder and pour into a greased pan", "2 cups flour + 1 tbsp baking powder", "Batter is smooth and pourable"],
      ["Bake, then pour over a quick chocolate glaze of cocoa, sugar, butter and milk", "350°F (180°C), 35–40 min", "Cake springs back and a toothpick comes out clean; glaze sets glossy"]],
      ["Chocolate sprinkles on the glaze", "A little orange zest in the batter", "Serve with coffee"]],
    es: ["Bolo de cenoura (pastel de zanahoria)", [
      ["Tritura zanahoria picada, huevos, azúcar y aceite hasta que esté muy liso", "3 zanahorias + 3 huevos + 1 1/2 tazas de azúcar + 3/4 taza de aceite", "Masa naranja intensa, sin trozos de zanahoria"],
      ["Incorpora la harina y el polvo de hornear y vierte en un molde engrasado", "2 tazas de harina + 1 cda de polvo de hornear", "La masa es lisa y fluida"],
      ["Hornea y cubre con un glaseado rápido de cacao, azúcar, mantequilla y leche", "180°C, 35–40 min", "El bizcocho rebota y el palillo sale limpio; el glaseado queda brillante"]],
      ["Fideos de chocolate sobre el glaseado", "Ralladura de naranja en la masa", "Sírvelo con café"]],
    fr: ["Bolo de cenoura (gâteau à la carotte)", [
      ["Mixez carottes, œufs, sucre et huile jusqu'à obtenir un mélange lisse", "3 carottes + 3 œufs + 1 1/2 tasse de sucre + 3/4 tasse d'huile", "Pâte orange vif sans morceaux de carotte"],
      ["Incorporez à la farine et à la levure, versez dans un moule graissé", "2 tasses de farine + 1 c. à s. de levure", "La pâte est lisse et coulante"],
      ["Enfournez, puis nappez d'un glaçage rapide cacao, sucre, beurre et lait", "180°C, 35–40 min", "Le gâteau reprend sa forme, la pique ressort propre ; glaçage brillant"]],
      ["Vermicelles chocolat sur le glaçage", "Zeste d'orange dans la pâte", "Servez avec un café"]],
    pt: ["Bolo de cenoura", [
      ["Bata cenoura picada, ovos, açúcar e óleo até ficar bem liso", "3 cenouras + 3 ovos + 1 1/2 xícara de açúcar + 3/4 xícara de óleo", "Massa laranja-viva sem pedaços de cenoura"],
      ["Misture à farinha e ao fermento e despeje numa forma untada", "2 xícaras de farinha + 1 colher de fermento", "A massa é lisa e escorre fácil"],
      ["Asse e cubra com uma calda rápida de cacau, açúcar, manteiga e leite", "180°C, 35–40 min", "O bolo volta ao apertar e o palito sai limpo; calda brilhante"]],
      ["Granulado por cima da calda", "Raspas de laranja na massa", "Sirva com café"]],
    tw: ["Karɔt Keeki", [
      ["Yam karɔt, nkosua, sukre ne ngo kɔsi sɛ ɛbɛyɛ toro koraa", "Karɔt 3 + kosua 3 + kuruwa 1 1/2 sukre + kuruwa 3/4 ngo", "Ɛyɛ akokɔsradeɛ kɔkɔɔ na karɔt mmɔfra biara nni mu"],
      ["Fa esam ne baking powder fra na hwie gu kuku a wɔasra ngo mu", "Kuruwa 2 esam + atere kɛseɛ 1 baking powder", "Ɛyɛ toro na ɛsene yie"],
      ["Toto no, afei hwie chocolate nsuo (cocoa, sukre, bota, nufosuo) gu so", "180°C, simma 35–40", "Keeki no san ba bere a womia so na ɛhyerɛn"]],
      ["Chocolate sprinkles wɔ soro", "Ankaa ho kakra wɔ mu", "Fa nom kɔfe"]],
    hi: ["बोलो दे सेनौरा (गाजर केक)", [
      ["कटी गाजर, अंडे, चीनी और तेल को पूरी तरह चिकना होने तक पीसें", "3 गाजर + 3 अंडे + 1 1/2 कप चीनी + 3/4 कप तेल", "घोल चमकीला नारंगी है, गाजर के टुकड़े नहीं"],
      ["मैदे और बेकिंग पाउडर में मिलाकर चिकने साँचे में डालें", "2 कप मैदा + 1 बड़ा चम्मच बेकिंग पाउडर", "घोल चिकना और बहने लायक है"],
      ["बेक करें, फिर कोको, चीनी, मक्खन और दूध का झटपट ग्लेज़ डालें", "180°C, 35–40 मिनट", "केक दबाने पर वापस उठता है और ग्लेज़ चमकदार जमता है"]],
      ["ग्लेज़ पर चॉकलेट स्प्रिंकल्स", "घोल में संतरे का छिलका", "कॉफ़ी के साथ परोसें"]],
    zh: ["巴西胡萝卜蛋糕", [
      ["胡萝卜块、鸡蛋、糖和油打至完全顺滑", "3根胡萝卜 + 3个蛋 + 1.5杯糖 + 3/4杯油", "面糊鲜橙色，没有胡萝卜颗粒"],
      ["拌入面粉和泡打粉，倒入抹油的模具", "2杯面粉 + 1汤匙泡打粉", "面糊顺滑可流动"],
      ["烘烤后淋上可可、糖、黄油和牛奶做的快手巧克力酱", "180°C，35–40分钟", "蛋糕按压回弹，牙签无黏附；巧克力酱凝固发亮"]],
      ["巧克力酱上撒巧克力碎", "面糊里加橙皮屑", "配咖啡"]],
    ar: ["بولو دي سينورا (كيك الجزر)", [
      ["اخلط الجزر المقطع والبيض والسكر والزيت حتى ينعم تمامًا", "3 جزرات + 3 بيضات + كوب ونصف سكر + ثلاثة أرباع كوب زيت", "الخليط برتقالي زاهٍ بلا قطع جزر"],
      ["أضفه إلى الدقيق والبيكنج باودر واسكبه في قالب مدهون", "كوبا دقيق + ملعقة كبيرة بيكنج باودر", "الخليط ناعم وسهل السكب"],
      ["اخبزه ثم اسكب صوص شوكولاتة سريع من الكاكاو والسكر والزبدة والحليب", "180°م، 35–40 دقيقة", "يرتد الكيك والعود يخرج نظيفًا والصوص لامع"]],
      ["حبيبات شوكولاتة فوق الصوص", "بشر برتقال في الخليط", "يُقدَّم مع القهوة"]],
  }),

  R("quindim", "brazilian", "🍮", ["#FFF0B8", "#F2B530"], "55 min", ["vegetarian"], ["snack"], ["oven"],
    ["eggs", "sugar", "coconut flakes", "butter"], [230, 4, 30, 11], {
    en: ["Quindim (Coconut Custard)", [
      ["Whisk egg yolks, sugar, melted butter and coconut together without beating in air", "8 yolks + 1 cup sugar + 1 tbsp butter + 1/2 cup coconut", "Mixture is bright yellow and smooth"],
      ["Pour into buttered, sugared molds set in a water bath", "Small molds, 3/4 full", "Coconut settles to the bottom"],
      ["Bake, cool completely, then turn out", "350°F (180°C), 35–40 min", "Tops are glossy and set; the coconut forms a golden base"]],
      ["Lime zest in the mix", "Serve chilled", "A spoon of coconut milk for extra flavor"]],
    es: ["Quindim (flan de coco)", [
      ["Mezcla yemas, azúcar, mantequilla derretida y coco sin batir para no meter aire", "8 yemas + 1 taza de azúcar + 1 cda de mantequilla + 1/2 taza de coco", "La mezcla es amarilla intensa y lisa"],
      ["Vierte en moldes con mantequilla y azúcar, al baño maría", "Moldes pequeños, a 3/4", "El coco se asienta al fondo"],
      ["Hornea, deja enfriar del todo y desmolda", "180°C, 35–40 min", "Superficie brillante y cuajada; el coco forma una base dorada"]],
      ["Ralladura de lima en la mezcla", "Sírvelo frío", "Una cucharada de leche de coco para más sabor"]],
    fr: ["Quindim (flan à la noix de coco)", [
      ["Mélangez jaunes d'œufs, sucre, beurre fondu et coco sans incorporer d'air", "8 jaunes + 1 tasse de sucre + 1 c. à s. de beurre + 1/2 tasse de coco", "Le mélange est jaune vif et lisse"],
      ["Versez dans des moules beurrés et sucrés, au bain-marie", "Petits moules, remplis aux 3/4", "La noix de coco se dépose au fond"],
      ["Enfournez, laissez refroidir complètement puis démoulez", "180°C, 35–40 min", "Dessus brillant et pris ; la coco forme une base dorée"]],
      ["Zeste de citron vert dans le mélange", "Servez bien frais", "Une cuillère de lait de coco pour plus de goût"]],
    pt: ["Quindim", [
      ["Misture gemas, açúcar, manteiga derretida e coco sem bater para não incorporar ar", "8 gemas + 1 xícara de açúcar + 1 colher de manteiga + 1/2 xícara de coco", "A mistura é amarela viva e lisa"],
      ["Despeje em forminhas untadas e açucaradas, em banho-maria", "Forminhas pequenas, 3/4 cheias", "O coco assenta no fundo"],
      ["Asse, deixe esfriar totalmente e desenforme", "180°C, 35–40 min", "Topo brilhante e firme; o coco forma uma base dourada"]],
      ["Raspas de limão na mistura", "Sirva gelado", "Uma colher de leite de coco para mais sabor"]],
    tw: ["Quindim (Kube Custard)", [
      ["Fa kosua mu akokɔsradeɛ, sukre, bota a anane ne kube fra brɛoo a wommɔ mframa nnka ho", "Kosua mu 8 + kuruwa 1 sukre + atere kɛseɛ 1 bota + kuruwa 1/2 kube", "Ɛyɛ akokɔsradeɛ kɛseɛ na ɛyɛ toro"],
      ["Hwie gu nkuku nketewa a wɔasra bota ne sukre mu, si nsuo mu", "Nkuku nketewa, 3/4", "Kube no kɔtena ase"],
      ["Toto no, ma ɛnnwo koraa, afei dane no", "180°C, simma 35–40", "Soro hyerɛn na agyina; kube no ayɛ ase akokɔsradeɛ"]],
      ["Ankaa ho wɔ mu", "Di no nwini", "Kube nufosuo atere 1"]],
    hi: ["किंडिम (नारियल कस्टर्ड)", [
      ["अंडे की ज़र्दी, चीनी, पिघला मक्खन और नारियल को बिना हवा भरे मिलाएँ", "8 ज़र्दी + 1 कप चीनी + 1 बड़ा चम्मच मक्खन + 1/2 कप नारियल", "मिश्रण चमकीला पीला और चिकना है"],
      ["मक्खन-चीनी लगे साँचों में डालें और पानी के बाथ में रखें", "छोटे साँचे, 3/4 भरें", "नारियल नीचे बैठ जाता है"],
      ["बेक करें, पूरी तरह ठंडा करें, फिर पलटें", "180°C, 35–40 मिनट", "ऊपर चमकदार और जमा; नारियल सुनहरा आधार बनाता है"]],
      ["मिश्रण में नींबू का छिलका", "ठंडा परोसें", "ज़्यादा स्वाद के लिए एक चम्मच नारियल दूध"]],
    zh: ["巴西椰子蛋黄布丁", [
      ["蛋黄、糖、融化黄油和椰丝轻轻拌匀，不要打入空气", "8个蛋黄 + 1杯糖 + 1汤匙黄油 + 1/2杯椰丝", "混合物鲜黄顺滑"],
      ["倒入抹黄油撒糖的小模具，隔水放置", "小模具，装3/4满", "椰丝沉到底部"],
      ["烘烤后完全放凉再脱模", "180°C，35–40分钟", "表面光亮凝固，椰丝形成金黄底层"]],
      ["加青柠皮屑", "冷藏后食用", "加一勺椰奶更香"]],
    ar: ["كينديم (كاسترد جوز الهند)", [
      ["اخلط صفار البيض والسكر والزبدة المذابة وجوز الهند دون إدخال هواء", "8 صفار + كوب سكر + ملعقة زبدة + نصف كوب جوز هند", "الخليط أصفر زاهٍ وناعم"],
      ["اسكبه في قوالب مدهونة بالزبدة والسكر داخل حمام مائي", "قوالب صغيرة، ثلاثة أرباعها", "يستقر جوز الهند في القاع"],
      ["اخبزه ثم اتركه يبرد تمامًا واقلبه", "180°م، 35–40 دقيقة", "السطح لامع ومتماسك وجوز الهند يشكّل قاعدة ذهبية"]],
      ["بشر ليمون أخضر في الخليط", "يُقدَّم باردًا", "ملعقة حليب جوز هند لنكهة أقوى"]],
  }),
];
