// Accounts and cloud saving through Supabase.
//
// When the Supabase client library is on the page (www/index.html loads it),
// people can sign in with an email link (or Google, once it is turned on) and
// their profile, kitchen, cookbook, history and shopping list are saved to
// their account. Guests keep using this browser's storage. The Community
// reads and writes the community_docs table, so everyone shares one feed.
//
// Without the library (the claude.ai version, tests) none of this runs and
// the app behaves exactly as before.
import React, { useState } from "react";
import { loadAppearance, saveAppearance, resolvedTheme } from "./appearance.js";

export const SUPABASE_URL = "https://kgfijzevpcbcbdrcmszo.supabase.co";
// Publishable (anon) key: safe to ship in the page; row-level security in the
// database decides what each person can read and write.
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZmlqemV2cGNiY2JkcmNtc3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMTE3MzksImV4cCI6MjEwOTU4NzczOX0.eiFVtscMWrpZ4w60J1rMiZbJlsDEwrOp5xJuHWvsEHY";

// Apple sign-in needs a paid Apple Developer account; switch on once it's set up in Supabase.
export const APPLE_SIGN_IN_ENABLED = false;

const GUEST_FLAG = "mysous:guest";
const APP_KEYS = ["sous_profile", "sous_kitchen", "sous_recipes", "sous_shopping"];
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* blocked */ } };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch { /* blocked */ } };

const AUTH_TR = {
  title: { en: "Save your kitchen", es: "Guarda tu cocina", fr: "Sauvegardez votre cuisine", pt: "Salve sua cozinha", hi: "अपनी रसोई सेव करें", zh: "保存你的厨房", ar: "احفظ مطبخك" },
  sub: { en: "Sign in to keep your kitchen, cookbook and history on every device, and to post in the Community.", es: "Inicia sesión para tener tu cocina, recetario e historial en todos tus dispositivos y publicar en la Comunidad.", fr: "Connectez-vous pour retrouver votre cuisine, vos recettes et votre historique sur tous vos appareils, et publier dans la Communauté.", pt: "Entre para ter sua cozinha, receitas e histórico em todos os dispositivos e publicar na Comunidade.", hi: "अपनी रसोई, कुकबुक और इतिहास हर डिवाइस पर रखने और कम्युनिटी में पोस्ट करने के लिए साइन इन करें।", zh: "登录后，你的厨房、食谱本和历史记录会在所有设备上同步，还能在社区发帖。", ar: "سجّل الدخول لتحتفظ بمطبخك ووصفاتك وسجلك على كل أجهزتك، وللنشر في المجتمع." },
  google: { en: "Continue with Google", es: "Continuar con Google", fr: "Continuer avec Google", pt: "Continuar com o Google", hi: "Google से जारी रखें", zh: "使用 Google 继续", ar: "المتابعة باستخدام Google" },
  email: { en: "Your email", es: "Tu correo", fr: "Votre e-mail", pt: "Seu e-mail", hi: "आपका ईमेल", zh: "你的邮箱", ar: "بريدك الإلكتروني" },
  send: { en: "Email me a sign-in link", es: "Envíame un enlace para entrar", fr: "M'envoyer un lien de connexion", pt: "Enviar link de acesso", hi: "मुझे साइन-इन लिंक भेजें", zh: "给我发送登录链接", ar: "أرسل لي رابط تسجيل الدخول" },
  sending: { en: "Sending…", es: "Enviando…", fr: "Envoi…", pt: "Enviando…", hi: "भेजा जा रहा है…", zh: "正在发送…", ar: "جارٍ الإرسال…" },
  sent: { en: "Check your email and tap the link to sign in. You can close this tab.", es: "Revisa tu correo y toca el enlace para entrar. Puedes cerrar esta pestaña.", fr: "Consultez vos e-mails et touchez le lien pour vous connecter. Vous pouvez fermer cet onglet.", pt: "Confira seu e-mail e toque no link para entrar. Pode fechar esta aba.", hi: "अपना ईमेल देखें और साइन इन करने के लिए लिंक पर टैप करें। आप यह टैब बंद कर सकते हैं।", zh: "请查看邮箱并点击链接登录。你可以关闭此页面。", ar: "تحقق من بريدك واضغط الرابط لتسجيل الدخول. يمكنك إغلاق هذه الصفحة." },
  badEmail: { en: "Enter a valid email.", es: "Escribe un correo válido.", fr: "Saisissez un e-mail valide.", pt: "Digite um e-mail válido.", hi: "सही ईमेल डालें।", zh: "请输入有效的邮箱。", ar: "أدخل بريدًا صحيحًا." },
  failed: { en: "Couldn't start sign-in. Check your connection and try again.", es: "No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.", fr: "Impossible de lancer la connexion. Vérifiez votre connexion et réessayez.", pt: "Não foi possível entrar. Verifique a conexão e tente de novo.", hi: "साइन-इन शुरू नहीं हो सका। अपना कनेक्शन जांचें और फिर कोशिश करें।", zh: "无法开始登录，请检查网络后重试。", ar: "تعذّر بدء تسجيل الدخول. تحقق من الاتصال وحاول مرة أخرى." },
  or: { en: "or", es: "o", fr: "ou", pt: "ou", hi: "या", zh: "或", ar: "أو" },
  guest: { en: "Continue as guest", es: "Continuar como invitado", fr: "Continuer en invité", pt: "Continuar como convidado", hi: "मेहमान के रूप में जारी रखें", zh: "以访客身份继续", ar: "المتابعة كضيف" },
  privacy: { en: "Your kitchen and personal details stay private. Only what you post in the Community is public. No ads, and your data is never sold.", es: "Tu cocina y tus datos personales son privados. Solo lo que publicas en la Comunidad es público. Sin anuncios y nunca vendemos tus datos.", fr: "Votre cuisine et vos informations personnelles restent privées. Seul ce que vous publiez dans la Communauté est public. Pas de pub, et vos données ne sont jamais vendues.", pt: "Sua cozinha e seus dados pessoais ficam privados. Só o que você publica na Comunidade é público. Sem anúncios, e seus dados nunca são vendidos.", hi: "आपकी रसोई और निजी जानकारी निजी रहती है। सिर्फ़ कम्युनिटी में की गई पोस्ट सार्वजनिक होती हैं। कोई विज्ञापन नहीं, और आपका डेटा कभी बेचा नहीं जाता।", zh: "你的厨房和个人信息保持私密，只有你在社区发布的内容是公开的。没有广告，数据绝不出售。", ar: "يبقى مطبخك وبياناتك الشخصية خاصة. فقط ما تنشره في المجتمع يكون علنيًا. لا إعلانات، ولا تُباع بياناتك أبدًا." },
  apple: { en: "Continue with Apple", es: "Continuar con Apple", fr: "Continuer avec Apple", pt: "Continuar com a Apple", hi: "Apple से जारी रखें", zh: "使用 Apple 继续", ar: "المتابعة باستخدام Apple" },
  opening: { en: "Opening…", es: "Abriendo…", fr: "Ouverture…", pt: "Abrindo…", hi: "खुल रहा है…", zh: "正在打开…", ar: "جارٍ الفتح…" },
  googleOff: { en: "Google sign-in isn't switched on yet. Continue as a guest for now. Your data will move to your account when you sign in later.", es: "El inicio con Google aún no está activado. Continúa como invitado por ahora; tus datos pasarán a tu cuenta cuando inicies sesión.", fr: "La connexion Google n'est pas encore activée. Continuez en invité pour l'instant ; vos données passeront dans votre compte quand vous vous connecterez.", pt: "O login com Google ainda não está ativado. Continue como convidado por enquanto; seus dados irão para sua conta quando você entrar.", hi: "Google साइन-इन अभी चालू नहीं है। अभी मेहमान के रूप में जारी रखें; बाद में साइन इन करने पर आपका डेटा खाते में चला जाएगा।", zh: "Google 登录尚未开启。请先以访客身份继续，之后登录时数据会转入你的账户。", ar: "تسجيل الدخول عبر Google غير مفعّل بعد. تابع كضيف الآن، وستنتقل بياناتك إلى حسابك عند تسجيل الدخول لاحقًا." },
  appleOff: { en: "Apple sign-in isn't switched on yet. Continue as a guest for now. Your data will move to your account when you sign in later.", es: "El inicio con Apple aún no está activado. Continúa como invitado por ahora; tus datos pasarán a tu cuenta cuando inicies sesión.", fr: "La connexion Apple n'est pas encore activée. Continuez en invité pour l'instant ; vos données passeront dans votre compte quand vous vous connecterez.", pt: "O login com Apple ainda não está ativado. Continue como convidado por enquanto; seus dados irão para sua conta quando você entrar.", hi: "Apple साइन-इन अभी चालू नहीं है। अभी मेहमान के रूप में जारी रखें; बाद में साइन इन करने पर आपका डेटा खाते में चला जाएगा।", zh: "Apple 登录尚未开启。请先以访客身份继续，之后登录时数据会转入你的账户。", ar: "تسجيل الدخول عبر Apple غير مفعّل بعد. تابع كضيف الآن، وستنتقل بياناتك إلى حسابك عند تسجيل الدخول لاحقًا." },
  guestNote: { en: "As a guest, everything stays on this device. You can sign in later from Settings.", es: "Como invitado, todo se queda en este dispositivo. Puedes iniciar sesión después en Ajustes.", fr: "En invité, tout reste sur cet appareil. Vous pourrez vous connecter plus tard dans les Paramètres.", pt: "Como convidado, tudo fica neste dispositivo. Você pode entrar depois em Configurações.", hi: "मेहमान के रूप में सब कुछ इसी डिवाइस पर रहता है। आप बाद में सेटिंग्स से साइन इन कर सकते हैं।", zh: "访客模式下，所有内容只保存在本设备上。之后可以在设置里登录。", ar: "كضيف، يبقى كل شيء على هذا الجهاز. يمكنك تسجيل الدخول لاحقًا من الإعدادات." },
};
const LANGS = ["en", "es", "fr", "pt", "hi", "zh", "ar"];

export function startingLanguage() {
  const picked = lsGet("mysous:lang");
  if (LANGS.includes(picked)) return picked;
  try {
    const p = JSON.parse(lsGet("mysous:sous_profile") || "{}");
    const saved = p.language || (p.profile && p.profile.language);
    if (LANGS.includes(saved)) return saved;
  } catch { /* ignore */ }
  const nav = ((typeof navigator !== "undefined" && navigator.language) || "").slice(0, 2).toLowerCase();
  return LANGS.includes(nav) ? nav : "en";
}

const LANG_LABELS = [["en", "English"], ["es", "Español"], ["fr", "Français"], ["pt", "Português"], ["hi", "हिन्दी"], ["zh", "中文"], ["ar", "العربية"]];

const INTRO = [
  {
    emoji: "🥕",
    title: { en: "Cook with what you have", es: "Cocina con lo que tienes", fr: "Cuisinez avec ce que vous avez", pt: "Cozinhe com o que você tem", hi: "जो है उसी से पकाएं", zh: "用现有食材做饭", ar: "اطبخ بما لديك" },
    body: { en: "Tell My Sous what's in your kitchen and it shows meals you can make right now, plus the ones you're one or two items away from.", es: "Dile a My Sous qué hay en tu cocina y te mostrará comidas que puedes hacer ahora, y las que te faltan uno o dos ingredientes.", fr: "Dites à My Sous ce qu'il y a dans votre cuisine : il vous montre les plats possibles tout de suite, et ceux à un ou deux ingrédients près.", pt: "Diga ao My Sous o que há na sua cozinha e ele mostra as refeições que você pode fazer agora, e as que faltam um ou dois itens.", hi: "My Sous को बताएं कि आपकी रसोई में क्या है, और यह दिखाएगा कि आप अभी क्या बना सकते हैं, और किनके लिए बस एक-दो चीज़ें कम हैं।", zh: "告诉 My Sous 你厨房里有什么，它会显示你现在就能做的菜，以及只差一两样食材的菜。", ar: "أخبر My Sous بما في مطبخك وسيعرض لك الوجبات التي يمكنك تحضيرها الآن، وتلك التي ينقصها مكوّن أو اثنان." },
  },
  {
    emoji: "👨‍🍳",
    title: { en: "Step by step, no guessing", es: "Paso a paso, sin adivinar", fr: "Étape par étape, sans deviner", pt: "Passo a passo, sem adivinhar", hi: "कदम-दर-कदम, बिना अंदाज़े के", zh: "一步一步，不用猜", ar: "خطوة بخطوة، بلا تخمين" },
    body: { en: "Every step tells you how much, how long, and what it should look like when it's done. Change the servings and the amounts update.", es: "Cada paso te dice cuánto, cuánto tiempo y cómo debe verse cuando está listo. Cambia las porciones y las cantidades se ajustan.", fr: "Chaque étape indique combien, combien de temps, et à quoi cela doit ressembler une fois prêt. Changez les portions, les quantités s'adaptent.", pt: "Cada passo diz quanto, por quanto tempo e como deve ficar quando estiver pronto. Mude as porções e as quantidades se ajustam.", hi: "हर कदम बताता है कितना, कितनी देर, और तैयार होने पर कैसा दिखना चाहिए। सर्विंग बदलें तो मात्रा अपने आप बदल जाती है।", zh: "每一步都告诉你用量、时间，以及做好时应该是什么样子。修改份数，用量会自动调整。", ar: "كل خطوة تخبرك بالكمية والمدة وكيف يجب أن يبدو الطبق عند اكتماله. غيّر عدد الحصص وتتغير الكميات." },
  },
  {
    emoji: "💬",
    title: { en: "Learn from other cooks", es: "Aprende de otros cocineros", fr: "Apprenez des autres cuisiniers", pt: "Aprenda com outros cozinheiros", hi: "दूसरे रसोइयों से सीखें", zh: "向其他厨师学习", ar: "تعلّم من طهاة آخرين" },
    body: { en: "Share tips, rate recipes, suggest improvements and post short tutorials in the Community.", es: "Comparte consejos, califica recetas, sugiere mejoras y publica tutoriales cortos en la Comunidad.", fr: "Partagez des astuces, notez des recettes, proposez des améliorations et publiez de courts tutoriels dans la Communauté.", pt: "Compartilhe dicas, avalie receitas, sugira melhorias e publique tutoriais curtos na Comunidade.", hi: "कम्युनिटी में टिप्स साझा करें, रेसिपी रेट करें, सुधार सुझाएं और छोटे ट्यूटोरियल पोस्ट करें।", zh: "在社区分享技巧、给食谱评分、提出改进建议、发布短教程。", ar: "شارك النصائح وقيّم الوصفات واقترح تحسينات وانشر دروسًا قصيرة في المجتمع." },
  },
];
const INTRO_UI = {
  next: { en: "Next", es: "Siguiente", fr: "Suivant", pt: "Próximo", hi: "आगे", zh: "下一步", ar: "التالي" },
  back: { en: "Back", es: "Atrás", fr: "Retour", pt: "Voltar", hi: "पीछे", zh: "返回", ar: "رجوع" },
  skip: { en: "Skip", es: "Omitir", fr: "Passer", pt: "Pular", hi: "छोड़ें", zh: "跳过", ar: "تخطي" },
  start: { en: "Get started", es: "Empezar", fr: "Commencer", pt: "Começar", hi: "शुरू करें", zh: "开始", ar: "ابدأ" },
  language: { en: "Language", es: "Idioma", fr: "Langue", pt: "Idioma", hi: "भाषा", zh: "语言", ar: "اللغة" },
};

const C = { paper: "var(--ms-paper)", card: "var(--ms-card)", ink: "var(--ms-ink)", muted: "var(--ms-ink-muted)", line: "var(--ms-line)", primary: "var(--ms-primary)", sage: "var(--ms-sage)", sageSofter: "var(--ms-sage-softer)", sageText: "var(--ms-primary-text)", accentText: "var(--ms-accent-text)" };

const VIEW_TR = {
  phone: { en: "Phone", es: "Teléfono", fr: "Téléphone", pt: "Celular", hi: "फ़ोन", zh: "手机", ar: "هاتف" },
  desktop: { en: "Desktop", es: "Escritorio", fr: "Ordinateur", pt: "Computador", hi: "डेस्कटॉप", zh: "桌面", ar: "سطح المكتب" },
};
const startingView = () => {
  const saved = lsGet("mysous:view");
  if (saved === "phone" || saved === "desktop") return saved;
  return typeof window !== "undefined" && window.innerWidth >= 900 ? "desktop" : "phone";
};

// Which sign-in providers are switched on in the Supabase dashboard.
async function enabledProviders() {
  try {
    const res = await fetch(SUPABASE_URL + "/auth/v1/settings", { headers: { apikey: SUPABASE_ANON_KEY } });
    const json = await res.json();
    return json.external || {};
  } catch {
    return null; // unknown: let the button try
  }
}

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></svg>
);
const MonitorIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>
);

export function AuthScreen({ sb, onGuest }) {
  const [lang, setLang] = useState(startingLanguage);
  const t = (k) => { const e = AUTH_TR[k] || VIEW_TR[k] || INTRO_UI[k]; return e[lang] || e.en; };
  // First visit: a short tour of the app, then the "Save your kitchen" choice.
  const [slide, setSlide] = useState(() => (lsGet("mysous:introSeen") === "1" ? INTRO.length : 0));
  const finishIntro = () => { lsSet("mysous:introSeen", "1"); setSlide(INTRO.length); };
  const pickLang = (l) => { setLang(l); lsSet("mysous:lang", l); };
  const [view, setView] = useState(startingView);
  const [providers, setProviders] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const redirectTo = window.location.origin + window.location.pathname;
  const desktop = view === "desktop";

  React.useEffect(() => { enabledProviders().then(setProviders); }, []);
  const [appearance, setAppearance] = useState(loadAppearance);
  const dark = resolvedTheme(appearance) === "dark";
  const toggleTheme = () => { const next = { ...appearance, theme: dark ? "light" : "dark" }; setAppearance(next); saveAppearance(next); };
  const changeView = (v) => { setView(v); lsSet("mysous:view", v); };

  async function signInWith(provider) {
    setNotice(null);
    if (providers && providers[provider] === false) { setNotice(provider === "google" ? "googleOff" : "appleOff"); return; }
    setBusy(provider);
    const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) { setBusy(null); setNotice("failed"); }
  }

  const button = { width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box" };
  const toggleBtn = (active) => ({ display: "flex", alignItems: "center", gap: 5, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 11.5, fontFamily: "inherit", background: active ? C.card : "transparent", color: active ? C.ink : C.muted, fontWeight: active ? 600 : 400, boxShadow: active ? "0 1px 2px rgba(51,53,47,0.08)" : "none" });

  const chip = (active) => ({ padding: "6px 11px", borderRadius: 20, border: `1px solid ${active ? C.primary : C.line}`, background: active ? C.sage : C.card, color: active ? C.sageText : C.muted, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 600 : 400 });
  const intro = slide < INTRO.length ? (
    <div style={{ width: "100%", maxWidth: 380, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {slide === 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>{t("language")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LANG_LABELS.map(([id, label]) => (
              <button key={id} onClick={() => pickLang(id)} aria-pressed={lang === id} style={chip(lang === id)}>{label}</button>
            ))}
          </div>
        </div>
      )}
      {!desktop && <div style={{ fontSize: 64, lineHeight: 1, margin: "18px 0 18px" }} aria-hidden="true">{INTRO[slide].emoji}</div>}
      {desktop && <div style={{ height: 14 }} />}
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 10px", lineHeight: 1.2 }}>{INTRO[slide].title[lang] || INTRO[slide].title.en}</h1>
      <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{INTRO[slide].body[lang] || INTRO[slide].body.en}</p>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "28px 0 18px" }} aria-label={`${slide + 1} / ${INTRO.length}`}>
        {INTRO.map((_, i) => <span key={i} style={{ width: i === slide ? 20 : 7, height: 7, borderRadius: 4, background: i === slide ? C.primary : C.line, transition: "width .2s" }} />)}
      </div>
      <button onClick={() => (slide === INTRO.length - 1 ? finishIntro() : setSlide(slide + 1))} style={{ ...button, background: C.primary, color: "#fff", border: "none" }}>
        {slide === INTRO.length - 1 ? t("start") : t("next")}
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <button onClick={() => setSlide(Math.max(0, slide - 1))} disabled={slide === 0} style={{ background: "none", border: "none", color: slide === 0 ? "transparent" : C.muted, fontSize: 13.5, cursor: slide === 0 ? "default" : "pointer", fontFamily: "inherit", padding: 6 }}>{t("back")}</button>
        <button onClick={finishIntro} style={{ background: "none", border: "none", color: C.muted, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", padding: 6 }}>{t("skip")}</button>
      </div>
    </div>
  ) : null;

  const content = intro || (
    <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "6px 0 8px", lineHeight: 1.2 }}>{t("title")}</h1>
      <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.5, margin: "0 0 22px" }}>{t("sub")}</p>

      <button onClick={() => signInWith("google")} disabled={!!busy} style={{ ...button, background: C.card, color: C.ink, border: `1px solid ${C.line}` }}>
        {busy === "google" ? t("opening") : t("google")}
      </button>
      {APPLE_SIGN_IN_ENABLED && (
        <button onClick={() => signInWith("apple")} disabled={!!busy} style={{ ...button, background: "#1F1F1F", color: "#fff", border: "1px solid #1F1F1F", marginTop: 10 }}>
          {busy === "apple" ? t("opening") : t("apple")}
        </button>
      )}
      {notice && <div role="status" style={{ color: C.accentText, fontSize: 13, marginTop: 10, lineHeight: 1.45 }}>{t(notice)}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, margin: "18px 0" }}>
        <span style={{ flex: 1, height: 1, background: C.line }} />{t("or")}<span style={{ flex: 1, height: 1, background: C.line }} />
      </div>

      <button onClick={onGuest} style={{ ...button, background: C.primary, color: "#fff", border: "none" }}>{t("guest")}</button>
      <p style={{ color: C.muted, fontSize: 12, textAlign: "center", margin: "8px 0 0", lineHeight: 1.45 }}>{t("guestNote")}</p>
      <p style={{ color: C.muted, fontSize: 12, textAlign: "center", margin: "18px 0 0", lineHeight: 1.45, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>🔒 {t("privacy")}</p>
    </div>
  );

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} className={desktop ? "ms-root ms-desktop" : "ms-root ms-phone"}
      style={{ position: "relative", minHeight: "100vh", background: C.paper, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: desktop ? 20 : "28px 12px", boxSizing: "border-box", fontFamily: "'Inter', system-ui, sans-serif", color: C.ink }}>
      <style>{"@media (max-width: 720px) { .ms-auth-split { grid-template-columns: 1fr !important; } .ms-auth-split > div:first-child { padding: 20px !important; } .ms-auth-split > div:first-child > div:first-child { font-size: 64px !important; } }"}</style>
      <div style={{
        position: "relative", zIndex: 1,
        width: desktop ? "100%" : 390, maxWidth: desktop ? 1040 : "100%", minHeight: desktop ? 600 : 780, marginTop: desktop ? "max(0px, calc((100vh - 680px) / 2))" : 0,
        background: C.card, borderRadius: desktop ? 18 : 28, border: `1px solid ${C.line}`,
        boxShadow: "0 1px 2px rgba(51,53,47,0.04), 0 20px 40px rgba(51,53,47,0.10)", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: desktop ? "14px 24px" : "16px 20px", borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700 }}>My Sous</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggleTheme} aria-label={dark ? "Light mode" : "Dark mode"} title={dark ? "Light mode" : "Dark mode"} style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${C.line}`, background: C.paper, color: C.muted, cursor: "pointer", fontSize: 15, lineHeight: 1 }}>{dark ? "☀" : "☾"}</button>
          <div role="group" aria-label="View" style={{ display: "flex", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: 2 }}>
            <button onClick={() => changeView("phone")} aria-pressed={!desktop} style={toggleBtn(!desktop)}><PhoneIcon />{t("phone")}</button>
            <button onClick={() => changeView("desktop")} aria-pressed={desktop} style={toggleBtn(desktop)}><MonitorIcon />{t("desktop")}</button>
          </div>
          </div>
        </div>
        {desktop ? (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }} className="ms-auth-split">
            <div aria-hidden="true" style={{ background: C.sageSofter, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, padding: 32 }}>
              <div style={{ fontSize: 120, lineHeight: 1 }}>{slide < INTRO.length ? INTRO[slide].emoji : "🍳"}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: C.sageText, textAlign: "center", maxWidth: 320, lineHeight: 1.35 }}>My Sous</div>
            </div>
            <div className="ms-auth-body" style={{ padding: "48px 40px", display: "flex", alignItems: "center" }}>{content}</div>
          </div>
        ) : (
          <div className="ms-auth-body" style={{ flex: 1, padding: "28px 22px", display: "flex", alignItems: "flex-start" }}>{content}</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cloud session: storage, community store, user and video helpers
// ---------------------------------------------------------------------------
const deny = (error) => {
  const e = new Error(error?.message || "denied");
  e.code = error?.code === "42501" || /row-level security|permission/i.test(error?.message || "") ? "invalid_argument" : error?.code === "23514" ? "resource_exhausted" : "unavailable";
  return e;
};

function communityStore(sb, myId) {
  return {
    collection: () => ({
      onSnapshot(next, onError) {
        let stopped = false;
        const load = async () => {
          const { data, error } = await sb.from("community_docs").select("user_id,data");
          if (stopped) return;
          if (error) { if (onError) onError(deny(error)); return; }
          next({ docs: (data || []).map((r) => ({ id: r.user_id, exists: true, data: () => r.data })), metadata: { fromCache: false } });
        };
        load();
        window.__mysousRefreshCommunity = load;
        const channel = sb.channel("community").on("postgres_changes", { event: "*", schema: "public", table: "community_docs" }, () => load()).subscribe();
        const poll = setInterval(load, 60000);
        const onVisible = () => { if (document.visibilityState === "visible") load(); };
        document.addEventListener("visibilitychange", onVisible);
        return () => { stopped = true; clearInterval(poll); document.removeEventListener("visibilitychange", onVisible); sb.removeChannel(channel); };
      },
      doc: (id) => ({
        async set(data) {
          // Your own document: create or replace. Someone else's (moderators only): update.
          const { error } = id === myId
            ? await sb.from("community_docs").upsert({ user_id: id, data })
            : await sb.from("community_docs").update({ data }).eq("user_id", id);
          if (error) throw deny(error);
          if (window.__mysousRefreshCommunity) window.__mysousRefreshCommunity();
        },
      }),
    }),
  };
}

export async function startCloud() {
  const lib = typeof window !== "undefined" && window.supabase;
  if (!lib || typeof lib.createClient !== "function") return null;
  const sb = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let session = null;
  try { session = (await sb.auth.getSession()).data.session; } catch { session = null; }
  const user = session ? session.user : null;
  const myId = user ? user.id : null;

  let isAdmin = false;
  if (myId) {
    try { const { data } = await sb.rpc("is_admin"); isAdmin = data === true; } catch { isAdmin = false; }
  }

  // Signed in: load this person's saved data, bringing over guest data the
  // first time they sign in on this device.
  let storage = null;
  if (myId) {
    const cache = {};
    const { data: rows, error } = await sb.from("user_store").select("key,value");
    if (!error) for (const r of rows || []) cache[r.key] = JSON.stringify(r.value);
    const toUpload = [];
    for (const k of APP_KEYS) {
      const local = lsGet("mysous:" + k);
      if (cache[k] == null && local != null) { cache[k] = local; try { toUpload.push({ user_id: myId, key: k, value: JSON.parse(local) }); } catch { /* skip bad data */ } }
    }
    if (!error && toUpload.length) {
      const { error: upErr } = await sb.from("user_store").upsert(toUpload);
      if (!upErr) for (const k of APP_KEYS) lsDel("mysous:" + k); // now saved to the account
    }
    const timers = {};
    let lastName = null;
    storage = {
      get: async (k) => { if (cache[k] == null) throw new Error("missing"); return { key: k, value: cache[k] }; },
      set: async (k, v) => {
        cache[k] = v;
        clearTimeout(timers[k]);
        timers[k] = setTimeout(async () => {
          try {
            const value = JSON.parse(v);
            await sb.from("user_store").upsert({ user_id: myId, key: k, value });
            // The name in your profile is the name other cooks see on your Community posts.
            const name = k === "sous_profile" && value && value.profile && String(value.profile.name || "").trim().slice(0, 60);
            if (name && name !== lastName) { lastName = name; await sb.from("profiles").update({ display_name: name }).eq("id", myId); }
          } catch { /* retried on next change */ }
        }, 600);
        return { key: k, value: v };
      },
      delete: async (k) => { delete cache[k]; await sb.from("user_store").delete().eq("key", k); return { key: k, deleted: true }; },
      list: async () => ({ keys: Object.keys(cache) }),
    };
  }

  const cloud = {
    sb,
    email: user ? user.email : null,
    signedIn: !!myId,
    isGuest: !myId,
    storage,
    signIn() { lsDel(GUEST_FLAG); window.location.reload(); },
    async signOut() { await sb.auth.signOut(); lsDel(GUEST_FLAG); window.location.reload(); },
    async deleteAccount() {
      if (!myId) return false;
      try {
        const { data: files } = await sb.storage.from("tutorials").list(myId, { limit: 1000 });
        if (files && files.length) await sb.storage.from("tutorials").remove(files.map((f) => `${myId}/${f.name}`));
        const { error } = await sb.rpc("delete_my_account");
        if (error) return false;
        await sb.auth.signOut();
        for (const k of APP_KEYS) lsDel("mysous:" + k);
        lsDel(GUEST_FLAG);
        window.location.reload();
        return true;
      } catch {
        return false;
      }
    },
    db: communityStore(sb, myId),
    user: {
      me: async () => ({ id: myId, name: "", canEdit: isAdmin, isOwner: isAdmin }),
      can: async () => !!myId,
      profiles: async (ids) => {
        const list = [].concat(ids).filter(Boolean);
        if (!list.length) return {};
        const { data } = await sb.from("profiles").select("id,display_name").in("id", list);
        const out = {};
        for (const p of data || []) out[p.id] = { id: p.id, name: p.display_name || "", avatarUrl: "" };
        return out;
      },
    },
    assets: myId
      ? {
          upload: async (file) => {
            const ext = (String(file.name || "").match(/\.(mp4|webm|mov|ogg)$/i) || [".mp4"])[0].toLowerCase();
            const path = `${myId}/${Date.now().toString(36)}${ext}`;
            const { error } = await sb.storage.from("tutorials").upload(path, file, { contentType: file.type || "video/mp4", upsert: false });
            if (error) throw deny(error);
            return { id: path };
          },
          delete: async (id) => { await sb.storage.from("tutorials").remove([id]); },
        }
      : null,
    videoSrc: (id) => (/^[0-9a-f-]{36}\/[0-9a-z]+\.(mp4|webm|mov|ogg)$/.test(String(id)) ? sb.storage.from("tutorials").getPublicUrl(id).data.publicUrl : null),
    report: async (authorId, postId) => {
      if (!myId) return false;
      const { error } = await sb.from("post_reports").insert({ author_id: authorId, post_id: postId });
      return !error || error.code === "23505";
    },
    reports: async () => {
      if (!isAdmin) return [];
      const { data } = await sb.from("post_reports").select("author_id,post_id");
      return data || [];
    },
    clearReports: async (authorId, postId) => { if (isAdmin) await sb.from("post_reports").delete().eq("author_id", authorId).eq("post_id", postId); },
  };
  return cloud;
}

export const isGuestChosen = () => lsGet(GUEST_FLAG) === "1";
export const chooseGuest = () => lsSet(GUEST_FLAG, "1");
