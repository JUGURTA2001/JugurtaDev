// ===========================================================
// forgot-password.js
// Envoie une demande de réinitialisation à /api/auth/forgot-password
// (route backend à créer : génère un token, envoie un e-mail avec un
// lien du type reset-password.html?token=...)
// ===========================================================

const BACKEND_URL = "http://localhost:5000";
const lang = localStorage.getItem("lang") || "en";

const texts = {
  en: {
    subtitle: "Reset your password",
    emailLabel: "Email address",
    emailError: "Enter a valid email address.",
    submitBtn: "Send reset link",
    backBtn: "Back to sign in",
    successMsg: "If an account exists for this email, a reset link has been sent.",
    errorMsg: "Something went wrong. Please try again.",
  },
  fr: {
    subtitle: "Réinitialisez votre mot de passe",
    emailLabel: "Adresse e-mail",
    emailError: "Entrez une adresse e-mail valide.",
    submitBtn: "Envoyer le lien",
    backBtn: "Retour à la connexion",
    successMsg: "Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.",
    errorMsg: "Une erreur est survenue. Réessaie.",
  }
};

const t = texts[lang] || texts.en;
document.getElementById("fp-subtitle").textContent = t.subtitle;
document.getElementById("fp-email-label").textContent = t.emailLabel;
document.getElementById("fp-email-error").textContent = t.emailError;
document.getElementById("fp-submit-btn").textContent = t.submitBtn;
document.getElementById("back-btn").textContent = t.backBtn;

const form = document.getElementById("forgot-form");
const emailField = document.getElementById("field-email");
const emailInput = document.getElementById("email");
const statusMsg = document.getElementById("status-msg");

function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showStatus(text, isError){
  statusMsg.textContent = text;
  statusMsg.style.color = isError ? "#dc3545" : "#0b1a33";
  statusMsg.style.display = "block";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isValidEmail(emailInput.value.trim())){
    emailField.classList.add("invalid");
    return;
  }
  emailField.classList.remove("invalid");

  try {
    // ⚠️ Route à créer côté backend : POST /api/auth/forgot-password
    // Doit toujours répondre 200 (même si l'email n'existe pas), pour
    // ne pas révéler quels e-mails sont enregistrés (sécurité).
    await fetch(BACKEND_URL + "/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput.value.trim() })
    });

    showStatus(t.successMsg, false);
  } catch (err) {
    showStatus(t.errorMsg, true);
  }
});

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "index.html";
});