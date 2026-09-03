// ===========================================================
// script.js – Login JugurtaDev (frontend)
// - Traductions EN/FR (arabe retiré)
// - Menu langue
// - Validation formulaire
// - Envoi au backend /api/auth/login
// - Redirection selon rôle + transmission de la langue
// - Toggle affichage mot de passe (œil)
// - Lien "mot de passe oublié"
// - Bouton "Continuer avec Google" (placeholder à connecter)
// ===========================================================

// URL du backend Express. En développement, on force ce port
// explicitement pour que la redirection fonctionne même si la
// page de login est ouverte via Live Server (port 5500) au lieu
// d'être servie directement par Express (port 5000).
const BACKEND_URL = "http://localhost:5000";

// ---------- TRADUCTIONS ----------
const translations = {
  en: {
    title: "JugurtaDev",
    subtitle: "Sign in to your account",
    emailLabel: "Email address",
    emailError: "Enter a valid email address.",
    passwordLabel: "Password",
    passwordError: "Password must be at least 6 characters.",
    forgotLink: "Forgot password?",
    loginBtn: "Sign in",
    googleBtn: "Continue with Google",
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
    forgotLink: "Mot de passe oublié ?",
    loginBtn: "Se connecter",
    googleBtn: "Continuer avec Google",
    orDivider: "ou",
    accountBtn: "Créer / gérer mon compte",
    successMsg: "Connexion réussie. Redirection...",
    errorMsg: "E-mail ou mot de passe incorrect.",
  }
};

// ---------- ÉTAT ----------
let currentLang = localStorage.getItem("lang") || "en";

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
const googleBtn = document.getElementById("google-btn");

// ---------- FONCTIONS ----------
function applyLang(lang) {
  currentLang = lang;
  const dict = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);

  document.querySelectorAll(".lang-menu button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showStatus(text, isError) {
  statusMsg.textContent = text;
  statusMsg.style.color = isError ? "#dc3545" : "#0b1a33";
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
if (toggleBtn) {
  toggleBtn.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const svg = this.querySelector("svg");
    if (type === "text") {
      svg.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      `;
      this.setAttribute("aria-label", "Hide password");
    } else {
      svg.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      `;
      this.setAttribute("aria-label", "Show password");
    }
  });
}

// ---------- SOUMISSION DU FORMULAIRE ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  let valid = true;

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
    const response = await fetch(BACKEND_URL + "/api/auth/login", {
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

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("lang", lang);

    const dashboardMap = {
      admin: "admin-dashboard.html",
      client: "profile.html"
    };

    let destination = BACKEND_URL + "/" + (dashboardMap[user.role] || "profile.html");
    destination += "?lang=" + encodeURIComponent(lang);

    console.log("🔀 Redirection vers :", destination);

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

// ---------- CONTINUER AVEC GOOGLE ----------
// ⚠️ Ce bouton est prêt côté interface, mais l'authentification Google
// (OAuth 2.0) nécessite une configuration côté Google Cloud Console
// (créer un Client ID OAuth) ET une route backend dédiée pour échanger
// le jeton Google contre ta propre session/JWT. Pour l'instant, ce
// clic redirige vers une route backend que tu devras créer :
// GET /api/auth/google → qui initie le flux OAuth avec Passport.js
// ou la librairie officielle "google-auth-library".
googleBtn.addEventListener("click", () => {
  window.location.href = BACKEND_URL + "/api/auth/google";
});

// ---------- INIT ----------
applyLang(currentLang);