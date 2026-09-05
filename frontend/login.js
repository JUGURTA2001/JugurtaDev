/**
 * login.js — Login Page for Jugurta Touati
 * Handles: Theme toggle, password visibility, form validation, demo login
 */

(function () {
  'use strict';

  // ============================================================
  // 1. DOM refs
  // ============================================================
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const eyeIcon = document.getElementById('eye-icon');

  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  const signinBtn = document.getElementById('signin-btn');
  const createAccountBtn = document.getElementById('create-account-btn');
  const demoHint = document.getElementById('demo-hint');

  // ============================================================
  // 2. Theme
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
      themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      `;
    } else {
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
      `;
    }
  }

  // ============================================================
  // 3. Password visibility toggle
  // ============================================================
  let passwordVisible = false;

  function togglePasswordVisibility() {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? 'text' : 'password';
    // Update eye icon
    if (eyeIcon) {
      if (passwordVisible) {
        // Eye with slash (hidden)
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <path d="M1 1l22 22"/>
        `;
      } else {
        // Eye open
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        `;
      }
    }
  }

  // ============================================================
  // 4. Form validation
  // ============================================================
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(input, errorEl) {
    input.closest('.form-group').classList.add('error');
    errorEl.classList.add('visible');
  }

  function hideError(input, errorEl) {
    input.closest('.form-group').classList.remove('error');
    errorEl.classList.remove('visible');
  }

  function validateForm() {
    let isValid = true;

    // Email
    const email = emailInput.value.trim();
    if (!email || !validateEmail(email)) {
      showError(emailInput, emailError);
      isValid = false;
    } else {
      hideError(emailInput, emailError);
    }

    // Password
    const password = passwordInput.value;
    if (!password || password.length < 6) {
      showError(passwordInput, passwordError);
      isValid = false;
    } else {
      hideError(passwordInput, passwordError);
    }

    return isValid;
  }

  // ============================================================
  // 5. Form submission (demo)
  // ============================================================
// Dans login.js, après les références DOM

async function handleSubmit(e) {
  e.preventDefault();

  // Validation (comme avant)
  if (!validateForm()) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    // Afficher un message de chargement (optionnel)
    demoHint.innerHTML = `<span style="color: var(--color-primary);">⏳ Connexion en cours...</span>`;

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user)); // stocke le nom, email, etc.
  demoHint.innerHTML = `<span style="color: green; font-weight: 600;">✅ ${data.message}</span>`;
  // Rediriger vers index.html après un court délai (ou immédiatement)
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}else {
      // Erreur (401, 400, etc.)
      demoHint.innerHTML = `<span style="color: var(--color-error); font-weight: 600;">❌ ${data.message}</span>`;
    }
  } catch (error) {
    console.error('Erreur réseau :', error);
    demoHint.innerHTML = `<span style="color: var(--color-error); font-weight: 600;">❌ Impossible de contacter le serveur</span>`;
  }
}

// N'oubliez pas de lier cette fonction au formulaire
form.addEventListener('submit', handleSubmit);

  // ============================================================
  // 6. "Create account" button
  // ============================================================
  function handleCreateAccount() {
    demoHint.innerHTML = `
      <span style="color: var(--color-primary); font-weight: 600;">
        📝 Redirection vers la page d'inscription...
      </span>
    `;
    setTimeout(() => {
      demoHint.innerHTML = `
        <span data-i18n="demoHint">🔑 Démo : cliquez sur "Se connecter" pour simuler la connexion</span>
      `;
    }, 2500);
    console.log('📝 Create account clicked');
  }

  // ============================================================
  // 7. Real-time validation (on blur & input)
  // ============================================================
  function setupRealtimeValidation() {
    emailInput.addEventListener('blur', function () {
      const val = this.value.trim();
      if (val && !validateEmail(val)) {
        showError(this, emailError);
      } else if (val) {
        hideError(this, emailError);
      }
    });

    emailInput.addEventListener('input', function () {
      const val = this.value.trim();
      if (val && !validateEmail(val)) {
        showError(this, emailError);
      } else if (val) {
        hideError(this, emailError);
      } else {
        hideError(this, emailError);
      }
    });

    passwordInput.addEventListener('blur', function () {
      const val = this.value;
      if (val && val.length < 6) {
        showError(this, passwordError);
      } else if (val) {
        hideError(this, passwordError);
      }
    });

    passwordInput.addEventListener('input', function () {
      const val = this.value;
      if (val && val.length < 6) {
        showError(this, passwordError);
      } else if (val) {
        hideError(this, passwordError);
      } else {
        hideError(this, passwordError);
      }
    });
  }

  // ============================================================
  // 8. Init
  // ============================================================
  function init() {
    // Theme
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);

    // Theme toggle
    themeToggle?.addEventListener('click', toggleTheme);

    // Password toggle
    togglePasswordBtn?.addEventListener('click', togglePasswordVisibility);

    // Form submit
    form?.addEventListener('submit', handleSubmit);

    // Create account
    createAccountBtn?.addEventListener('click', handleCreateAccount);

    // Real-time validation
    setupRealtimeValidation();

    // Keyboard shortcut: Escape to clear errors? Not needed.

    console.log('✅ Login page initialized');
  }

  // ============================================================
  // 9. Run
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();