/**
 * register.js — Gestion de l'inscription avec envoi de code
 */

(function () {
  'use strict';

  // ---- Références DOM ----
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  const form = document.getElementById('register-form');
  const lastname = document.getElementById('lastname');
  const firstname = document.getElementById('firstname');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');
  const togglePassword = document.getElementById('toggle-password');
  const eyeIcon = document.getElementById('eye-icon');

  const lastnameError = document.getElementById('lastname-error');
  const firstnameError = document.getElementById('firstname-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmError = document.getElementById('confirm-error');
  const codeError = document.getElementById('code-error');

  const sendCodeBtn = document.getElementById('send-code-btn');
  const verifyCodeBtn = document.getElementById('verify-code-btn');
  const codeSection = document.getElementById('code-section');
  const confirmationCodeInput = document.getElementById('confirmation-code');
  const statusMessage = document.getElementById('status-message');

  // ---- Thème ----
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
    setTheme(current === 'light' ? 'dark' : 'light');
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

  // ---- Password visibility toggle ----
  let passwordVisible = false;
  function togglePasswordVisibility() {
    passwordVisible = !passwordVisible;
    password.type = passwordVisible ? 'text' : 'password';
    confirmPassword.type = passwordVisible ? 'text' : 'password';
    if (eyeIcon) {
      eyeIcon.innerHTML = passwordVisible
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
  }
sendCodeBtn?.addEventListener('click', sendConfirmationCode);
verifyCodeBtn?.addEventListener('click', verifyCode);
  // ---- Validation helpers ----
  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function showError(input, errorEl) {
    input.closest('.form-group').classList.add('error');
    errorEl.classList.add('visible');
  }
  function hideError(input, errorEl) {
    input.closest('.form-group').classList.remove('error');
    errorEl.classList.remove('visible');
  }

  function setStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
  }

  // ---- Validation du formulaire (avant envoi du code) ----
  function validateForm() {
    let isValid = true;

    // Nom
    if (!lastname.value.trim()) {
      showError(lastname, lastnameError);
      isValid = false;
    } else {
      hideError(lastname, lastnameError);
    }

    // Prénom
    if (!firstname.value.trim()) {
      showError(firstname, firstnameError);
      isValid = false;
    } else {
      hideError(firstname, firstnameError);
    }

    // Email
    if (!validateEmail(email.value.trim())) {
      showError(email, emailError);
      isValid = false;
    } else {
      hideError(email, emailError);
    }

    // Mot de passe (min 6)
    if (password.value.length < 6) {
      showError(password, passwordError);
      isValid = false;
    } else {
      hideError(password, passwordError);
    }

    // Confirmation
    if (password.value !== confirmPassword.value) {
      showError(confirmPassword, confirmError);
      isValid = false;
    } else {
      hideError(confirmPassword, confirmError);
    }

    return isValid;
  }

  // ---- Simulation d'envoi du code ----
 // ---- Envoi du code vers le backend ----
async function sendConfirmationCode() {
  if (!validateForm()) {
    setStatus('Veuillez corriger les erreurs du formulaire.', 'error');
    return;
  }

  sendCodeBtn.disabled = true;
  setStatus('⏳ Envoi du code en cours...', 'info');

  try {
    const response = await fetch('http://localhost:5000/api/auth/register/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() })
    });

    const data = await response.json();

    if (response.ok) {
      codeSection.style.display = 'block';
      setStatus(`✅ ${data.message} (consultez votre boîte mail)`, 'success');
      // En test, le code est peut-être renvoyé dans data.code (si décommenté)
      // On le stocke pour la vérification (en développement)
      if (data.code) {
        confirmationCodeInput.dataset.expectedCode = data.code;
      }
    } else {
      setStatus('❌ ' + data.message, 'error');
    }
  } catch (error) {
    setStatus('❌ Erreur réseau : ' + error.message, 'error');
  } finally {
    sendCodeBtn.disabled = false;
  }
}

// ---- Vérification du code et création du compte ----
async function verifyCode() {
  const entered = confirmationCodeInput.value.trim();
  if (!entered) {
    setStatus('Veuillez entrer le code reçu par email.', 'error');
    return;
  }

  setStatus('⏳ Vérification en cours...', 'info');

  try {
    const response = await fetch('http://localhost:5000/api/auth/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        code: entered,
        lastname: lastname.value.trim(),
        firstname: firstname.value.trim(),
        password: password.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      setStatus('🎉 ' + data.message + ' Redirection vers la connexion...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
    } else {
      setStatus('❌ ' + data.message, 'error');
    }
  } catch (error) {
    setStatus('❌ Erreur réseau : ' + error.message, 'error');
  }
}

  // ---- Vérification du code ----
// ---- Envoi du code vers le backend ----
async function sendConfirmationCode() {
  if (!validateForm()) {
    setStatus('Veuillez corriger les erreurs du formulaire.', 'error');
    return;
  }

  sendCodeBtn.disabled = true;
  setStatus('⏳ Envoi du code en cours...', 'info');

  try {
    const response = await fetch('http://localhost:5000/api/auth/register/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() })
    });

    const data = await response.json();

    if (response.ok) {
      codeSection.style.display = 'block';
      setStatus(`✅ ${data.message} (consultez votre boîte mail)`, 'success');
      // En test, le code est peut-être renvoyé dans data.code (si décommenté)
      // On le stocke pour la vérification (en développement)
      if (data.code) {
        confirmationCodeInput.dataset.expectedCode = data.code;
      }
    } else {
      setStatus('❌ ' + data.message, 'error');
    }
  } catch (error) {
    setStatus('❌ Erreur réseau : ' + error.message, 'error');
  } finally {
    sendCodeBtn.disabled = false;
  }
}

// ---- Vérification du code et création du compte ----
async function verifyCode() {
  const entered = confirmationCodeInput.value.trim();
  if (!entered) {
    setStatus('Veuillez entrer le code reçu par email.', 'error');
    return;
  }

  setStatus('⏳ Vérification en cours...', 'info');

  try {
    const response = await fetch('http://localhost:5000/api/auth/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        code: entered,
        lastname: lastname.value.trim(),
        firstname: firstname.value.trim(),
        password: password.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      setStatus('🎉 ' + data.message + ' Redirection vers la connexion...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
    } else {
      setStatus('❌ ' + data.message, 'error');
    }
  } catch (error) {
    setStatus('❌ Erreur réseau : ' + error.message, 'error');
  }
}

  // ---- Gestion des événements en temps réel pour masquer les erreurs ----
  function setupRealtimeValidation() {
    const fields = [
      { input: lastname, error: lastnameError },
      { input: firstname, error: firstnameError },
      { input: email, error: emailError, validator: (v) => validateEmail(v) },
      { input: password, error: passwordError, validator: (v) => v.length >= 6 },
      { input: confirmPassword, error: confirmError, validator: (v) => v === password.value }
    ];

    fields.forEach(({ input, error, validator }) => {
      input.addEventListener('input', function () {
        const val = this.value;
        if (val && (!validator || validator(val))) {
          hideError(this, error);
        } else if (val) {
          showError(this, error);
        } else {
          hideError(this, error);
        }
      });
      input.addEventListener('blur', function () {
        const val = this.value;
        if (val && (!validator || validator(val))) {
          hideError(this, error);
        } else if (val) {
          showError(this, error);
        }
      });
    });
  }

  // ---- Init ----
  function init() {
    // Thème
    setTheme(getStoredTheme());
    themeToggle?.addEventListener('click', toggleTheme);

    // Password toggle
    togglePassword?.addEventListener('click', togglePasswordVisibility);

    // Bouton d'envoi du code
    sendCodeBtn?.addEventListener('click', sendConfirmationCode);

    // Bouton de vérification du code
    verifyCodeBtn?.addEventListener('click', verifyCode);

    // Validation en temps réel
    setupRealtimeValidation();

    // Empêcher la soumission du formulaire (on utilise le bouton)
    form?.addEventListener('submit', (e) => e.preventDefault());

    console.log('✅ Register page initialisée');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();