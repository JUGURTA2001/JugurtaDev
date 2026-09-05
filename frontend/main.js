/**
 * main.js — Fonctionnalités globales pour l'index
 * Thème, langue, menu mobile, affichage du nom, dropdown, déconnexion
 */

(function () {
  'use strict';

  // ============================================================
  // 1. Références DOM
  // ============================================================
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  const langButtons = langMenu?.querySelectorAll('button[data-lang]') || [];
  const hamburgerToggle = document.getElementById('hamburger-toggle');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const nav = document.getElementById('topbar-nav');
  const navLinks = nav?.querySelectorAll('a:not(.nav-signin-mobile)') || [];

  const userGreeting = document.getElementById('user-greeting');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutBtn = document.getElementById('logout-btn');
  const signinBtn = document.getElementById('signin-btn');
  const mobileSigninLink = document.getElementById('mobile-signin-link');

  // Éléments i18n
  const i18nElements = document.querySelectorAll('[data-i18n]');

  // ============================================================
  // 2. Traductions
  // ============================================================
  const translations = {
    en: {
      navHome: 'Home',
      navSkills: 'Skills',
      navContact: 'Contact',
      signInBtn: 'Sign in',
      role: 'Full Stack Web Developer & Freelancer',
      bio: "I'm Jugurta, a Master 1 Software Engineering (Génie Logiciel) student at the University of Béjaïa. I build secure, well-structured web applications (HTML, CSS, JavaScript, Express.js, MySQL) and I'm available for freelance web and mobile development work.",
      linkedinLabel: 'LinkedIn',
      githubLabel: 'GitHub',
      emailLabel: 'Email',
      skillsTitle: 'Skills',
      skillsSubtitle: 'What a GL student and web freelancer needs to master:',
      footerText: 'Jugurta Touati — Software Engineering student, University of Béjaïa',
    },
    fr: {
      navHome: 'Accueil',
      navSkills: 'Compétences',
      navContact: 'Contact',
      signInBtn: 'Se connecter',
      role: 'Développeur Full Stack Web & Freelance',
      bio: "Je suis Jugurta, étudiant en Master 1 Génie Logiciel à l'Université de Béjaïa. Je conçois des applications web sécurisées et bien structurées (HTML, CSS, JavaScript, Express.js, MySQL) et je suis disponible pour des missions de développement web et mobile en freelance.",
      linkedinLabel: 'LinkedIn',
      githubLabel: 'GitHub',
      emailLabel: 'E-mail',
      skillsTitle: 'Compétences',
      skillsSubtitle: 'Ce qu\'un étudiant en GL et un freelance web doit maîtriser :',
      footerText: 'Jugurta Touati — Étudiant en Génie Logiciel, Université de Béjaïa',
    },
  };
  let currentLang = 'en';

  // ============================================================
  // 3. Thème
  // ============================================================
  function getStoredTheme() {
    return localStorage.getItem('profile-theme') || 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('profile-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
      `;
    }
  }

  // ============================================================
  // 4. Langue
  // ============================================================
  function getStoredLang() {
    return localStorage.getItem('profile-lang') || 'en';
  }

  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('profile-lang', lang);
    applyTranslations(lang);
    updateLangMenuActive(lang);
    closeLangMenu();
  }

  function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;
    i18nElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });
  }

  function updateLangMenuActive(lang) {
    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function toggleLangMenu() {
    langMenu?.classList.toggle('open');
    langToggle?.setAttribute('aria-expanded', langMenu?.classList.contains('open') ? 'true' : 'false');
  }

  function closeLangMenu() {
    langMenu?.classList.remove('open');
    langToggle?.setAttribute('aria-expanded', 'false');
  }

  // ============================================================
  // 5. Menu mobile
  // ============================================================
  function toggleMobileNav() {
    nav?.classList.toggle('open');
    const isOpen = nav?.classList.contains('open');
    hamburgerToggle?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (hamburgerIcon) {
      hamburgerIcon.innerHTML = isOpen
        ? `<path d="M6 18L18 6M6 6l12 12"/>`
        : `<path d="M3 6h18M3 12h18M3 18h18"/>`;
    }
  }

  function closeMobileNav() {
    nav?.classList.remove('open');
    hamburgerToggle?.setAttribute('aria-expanded', 'false');
    if (hamburgerIcon) {
      hamburgerIcon.innerHTML = `<path d="M3 6h18M3 12h18M3 18h18"/>`;
    }
  }

  // ============================================================
  // 6. Gestion utilisateur (affichage du nom, dropdown, déconnexion)
  // ============================================================
  function displayUserInfo() {
    const user = localStorage.getItem('user');
    if (user && userGreeting) {
      try {
        const userData = JSON.parse(user);
        userGreeting.textContent = `👋 ${userData.name}`;
        userGreeting.style.display = 'inline';
        // Masquer les boutons "Se connecter"
        if (signinBtn) signinBtn.style.display = 'none';
        if (mobileSigninLink) mobileSigninLink.style.display = 'none';
      } catch (e) {
        console.error('Erreur parsing user:', e);
        userGreeting.style.display = 'none';
        showSigninButtons();
      }
    } else {
      // Pas d'utilisateur connecté
      if (userGreeting) userGreeting.style.display = 'none';
      showSigninButtons();
    }
  }

  function showSigninButtons() {
    if (signinBtn) signinBtn.style.display = 'inline-block';
    if (mobileSigninLink) mobileSigninLink.style.display = 'block';
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    userDropdown?.classList.toggle('open');
  }

  function closeDropdown() {
    userDropdown?.classList.remove('open');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    closeDropdown();
    // Recharger la page pour refléter la déconnexion
    window.location.reload();
  }

  // ============================================================
  // 7. Clic en dehors des menus
  // ============================================================
  function handleClickOutside(e) {
    // Langue
    if (langMenu && !langMenu.contains(e.target) && e.target !== langToggle && !langToggle?.contains(e.target)) {
      closeLangMenu();
    }
    // Mobile nav
    if (nav?.classList.contains('open')) {
      const isNavClick = nav.contains(e.target);
      const isHamburgerClick = hamburgerToggle?.contains(e.target);
      if (!isNavClick && !isHamburgerClick) {
        closeMobileNav();
      }
    }
    // Dropdown utilisateur
    if (userDropdown && !userDropdown.contains(e.target) && e.target !== userGreeting) {
      closeDropdown();
    }
  }

  // ============================================================
  // 8. Initialisation
  // ============================================================
  function init() {
    // Thème
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);

    // Langue
    const storedLang = getStoredLang();
    currentLang = storedLang;
    applyTranslations(storedLang);
    updateLangMenuActive(storedLang);

    // Utilisateur
    displayUserInfo();

    // --- Event listeners ---
    themeToggle?.addEventListener('click', toggleTheme);

    langToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLangMenu();
    });
    langButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (lang) setLang(lang);
      });
    });

    hamburgerToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 640) closeMobileNav();
      });
    });

    // Greeting click → dropdown
    userGreeting?.addEventListener('click', toggleDropdown);

    // Déconnexion
    logoutBtn?.addEventListener('click', logout);

    // Clic extérieur
    document.addEventListener('click', handleClickOutside);

    // Fermeture au redimensionnement
    window.addEventListener('resize', () => {
      if (window.innerWidth > 640 && nav?.classList.contains('open')) closeMobileNav();
    });

    // Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLangMenu();
        closeDropdown();
        if (nav?.classList.contains('open')) closeMobileNav();
      }
    });

    console.log('✅ Index initialisé');
  }

  // ============================================================
  // 9. Lancement
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();