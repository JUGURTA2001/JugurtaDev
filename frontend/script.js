// ===========================================================
// script.js – Login JugurtaDev (frontend)
// - Traductions EN/FR/AR
// - Menu langue
// - Validation formulaire
// - Envoi au backend /api/auth/login
// - Redirection selon rôle + transmission de la langue
// - Toggle affichage mot de passe (œil)
// ===========================================================

// ---------- TRADUCTIONS ----------
const translations = {
  en: {
    title: "JugurtaDev",
    subtitle: "Sign in to your account",
    emailLabel: "Email address",
    emailError: "Enter a valid email address.",
    passwordLabel: "Password",
    passwordError: "Password must be at least 6 characters.",
    loginBtn: "Sign in",
    orDivider: "or",
    accountBtn: "Create / manage account",
    successMsg: "Login successful. Redirecting...",
    errorMsg: "Incorrect email or password.",
  },
  fr: {
    title: "JugurtaDev",
    subtitle: "Connectez-vous à votre espace",
    emailLabel: "Adresse e-mail",
    emailError: "Entrez une adresse e-mail valide.",
    passwordLabel: "Mot de passe",
    passwordError: "Le mot de passe doit contenir au moins 6 caractères.",
    loginBtn: "Se connecter",
    orDivider: "ou",
    accountBtn: "Créer / gérer mon compte",
    successMsg: "Connexion réussie. Redirection...",
    errorMsg: "E-mail ou mot de passe incorrect.",
  },
  ar: {
    title: "جوغرطة ديف",
    subtitle: "سجّل الدخول إلى حسابك",
    emailLabel: "البريد الإلكتروني",
    emailError: "أدخل بريدًا إلكترونيًا صالحًا.",
    passwordLabel: "كلمة المرور",
    passwordError: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.",
    loginBtn: "تسجيل الدخول",
    orDivider: "أو",
    accountBtn: "إنشاء / إدارة الحساب",
    successMsg: "تم تسجيل الدخول بنجاح. جارٍ التحويل...",
    errorMsg: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  }
};

// ---------- ÉTAT ----------
let currentLang = "en";

// ---------- RÉFÉRENCES DOM ----------
const langToggle = document.getElementById("lang-toggle");
const langMenu = document.getElementById("lang-menu");
const form = document.getElementById("login-form");
const emailField = document.getElementById("field-email");
const passwordField = document.getElementById("field-password");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusMsg = document.getElementById("status-msg");
const toggleBtn = document.querySelector(".toggle-password");

// ---------- FONCTIONS ----------
function applyLang(lang) {
  currentLang = lang;
  const dict = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

  document.querySelectorAll(".lang-menu button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showStatus(text, isError) {
  statusMsg.textContent = text;
  statusMsg.style.color = isError ? "#B3432E" : "#12403F";
  statusMsg.style.display = "block";
}

// ---------- GESTION LANGUE ----------
langToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = langMenu.classList.toggle("open");
  langToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

document.addEventListener("click", () => {
  langMenu.classList.remove("open");
  langToggle.setAttribute("aria-expanded", "false");
});

document.querySelectorAll(".lang-menu button").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    applyLang(btn.dataset.lang);
    langMenu.classList.remove("open");
    langToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- TOGGLE MOT DE PASSE (ŒIL) ----------
toggleBtn.addEventListener("click", function () {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  const svg = this.querySelector("svg");
  if (type === "text") {
    // Œil barré (masquer)
    svg.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
    this.setAttribute("aria-label", "Hide password");
  } else {
    // Œil ouvert (afficher)
    svg.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    `;
    this.setAttribute("aria-label", "Show password");
  }
});

// ---------- SOUMISSION DU FORMULAIRE ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  let valid = true;

  // Validation
  if (!isValidEmail(email)) {
    emailField.classList.add("invalid");
    valid = false;
  } else {
    emailField.classList.remove("invalid");
  }

  if (password.length < 6) {
    passwordField.classList.add("invalid");
    valid = false;
  } else {
    passwordField.classList.remove("invalid");
  }

  if (!valid) return;

  const lang = currentLang;

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, lang })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || translations[currentLang].errorMsg;
      showStatus(errorMsg, true);
      return;
    }

    const { token, user } = data;

    // Stockage des informations (côté navigateur)
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("lang", lang);

    // Définir la redirection selon le rôle
    const dashboardMap = {
      admin: "admin-dashboard.html",
      client: "client-dashboard.html",
      freelance: "freelance-dashboard.html"
    };
    // Chemin absolu (commence par /) pour éviter les problèmes de sous-répertoires
    let destination = "/" + (dashboardMap[user.role] || "client-dashboard.html");
    destination += "?lang=" + encodeURIComponent(lang);

    showStatus(translations[currentLang].successMsg, false);

    setTimeout(() => {
      window.location.href = destination;
    }, 1500);

  } catch (error) {
    console.error("Erreur réseau :", error);
    showStatus(translations[currentLang].errorMsg, true);
  }
});

// ---------- BOUTON COMPTE ----------
document.getElementById("account-btn").addEventListener("click", () => {
  window.location.href = "account.html";
});

// ---------- INIT ----------
applyLang("en");