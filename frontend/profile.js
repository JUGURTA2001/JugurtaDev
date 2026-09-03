// ===========================================================
// profile.js — Page portfolio personnelle (Jugurta Touati)
// - Bascule mode clair / sombre (mémorisée dans localStorage)
// - Sélecteur de langue EN / FR (icône + menu déroulant)
// ===========================================================

const translations = {
  en: {
    navHome: "Home",
    navSkills: "Skills",
    navContact: "Contact",
    signInBtn: "Sign in",
    role: "Full Stack Web Developer & Freelancer",
    bio: "I'm Jugurta, a Master 1 Software Engineering (Génie Logiciel) student at the University of Béjaïa. I build secure, well-structured web applications (HTML, CSS, JavaScript, Express.js, MySQL) and I'm available for freelance web and mobile development work.",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
    emailLabel: "Email",
    skillsTitle: "Skills",
    skillsSubtitle: "What a GL student and web freelancer needs to master:",
    footerText: "Jugurta Touati — Software Engineering student, University of Béjaïa",
  },
  fr: {
    navHome: "Accueil",
    navSkills: "Compétences",
    navContact: "Contact",
    signInBtn: "Se connecter",
    role: "Développeur Web Full Stack & Freelance",
    bio: "Je suis Jugurta, étudiant en Master 1 Génie Logiciel à l'université de Béjaïa. Je construis des applications web sécurisées et bien structurées (HTML, CSS, JavaScript, Express.js, MySQL) et je suis disponible pour des missions freelance en développement web et mobile.",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
    emailLabel: "E-mail",
    skillsTitle: "Compétences",
    skillsSubtitle: "Ce qu'il faut maîtriser pour un étudiant GL et freelance web :",
    footerText: "Jugurta Touati — Étudiant en Génie Logiciel, Université de Béjaïa",
  }
};

// ---------- Langue ----------
// Priorité à ?lang=xx dans l'URL (transmis depuis index.html après la
// connexion), sinon on retombe sur la langue mémorisée, sinon anglais.
const urlParams = new URLSearchParams(window.location.search);
const urlLang = urlParams.get("lang");
let currentLang = (urlLang && translations[urlLang]) ? urlLang : (localStorage.getItem("lang") || "en");

function applyLang(lang){
  currentLang = lang;
  const dict = translations[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.innerHTML = dict[key];
  });
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang-menu button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  localStorage.setItem("lang", lang);
  applyAuthState(); // réaffiche le nom d'utilisateur (ou "Sign in") dans la bonne langue
}

const langToggle = document.getElementById("lang-toggle");
const langMenu = document.getElementById("lang-menu");

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
  });
});

// ---------- Mode sombre ----------
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const htmlEl = document.documentElement;

function applyTheme(theme){
  htmlEl.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  if (theme === "dark"){
    // icône lune
    themeIcon.innerHTML = `<path d="M21 12.5A9 9 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5z"/>`;
  } else {
    // icône soleil
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
    `;
  }
}

themeToggle.addEventListener("click", () => {
  const current = htmlEl.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// ---------- Menu mobile (hamburger) ----------
const hamburgerToggle = document.getElementById("hamburger-toggle");
const topbarNav = document.getElementById("topbar-nav");
const hamburgerIcon = document.getElementById("hamburger-icon");

function setMenuOpen(isOpen){
  topbarNav.classList.toggle("open", isOpen);
  hamburgerToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  hamburgerIcon.innerHTML = isOpen
    ? `<path d="M6 6l12 12M18 6L6 18"/>`               // icône croix (fermer)
    : `<path d="M3 6h18M3 12h18M3 18h18"/>`;           // icône burger (ouvrir)
}

hamburgerToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenuOpen(!topbarNav.classList.contains("open"));
});

// Ferme le menu quand on clique sur un lien à l'intérieur
topbarNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => setMenuOpen(false));
});

// Ferme le menu si on clique ailleurs sur la page
document.addEventListener("click", (e) => {
  if (!topbarNav.contains(e.target) && !hamburgerToggle.contains(e.target)){
    setMenuOpen(false);
  }
});

// ---------- Nom d'utilisateur (remplace "Sign in" si connecté) ----------
const signinBtn = document.querySelector(".signin-btn");
const navSigninMobile = document.querySelector(".nav-signin-mobile");

function applyAuthState(){
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (token && userRaw) {
    let user;
    try { user = JSON.parse(userRaw); } catch { user = null; }
    const displayName = (user && (user.prenom || user.nom || user.email)) || "Account";
    const logoutLabel = currentLang === "fr" ? "Déconnexion" : "Logout";

    if (signinBtn){
      signinBtn.textContent = `👤 ${displayName}`;
      signinBtn.removeAttribute("href");
      signinBtn.title = logoutLabel;
      signinBtn.onclick = handleLogoutClick;
    }
    if (navSigninMobile){
      navSigninMobile.textContent = `${logoutLabel} (${displayName})`;
      navSigninMobile.removeAttribute("href");
      navSigninMobile.onclick = handleLogoutClick;
    }
  } else {
    const label = translations[currentLang].signInBtn;

    if (signinBtn){
      signinBtn.textContent = label;
      signinBtn.setAttribute("href", "index.html");
      signinBtn.onclick = null;
    }
    if (navSigninMobile){
      navSigninMobile.textContent = label;
      navSigninMobile.setAttribute("href", "index.html");
      navSigninMobile.onclick = null;
    }
  }
}

function handleLogoutClick(e){
  e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// ---------- État initial ----------
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);
applyLang(currentLang);