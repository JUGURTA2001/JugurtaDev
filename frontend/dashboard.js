// ===========================================================
// dashboard.js – Exemple de récupération + affichage des données
// À inclure dans client-dashboard.html / freelance-dashboard.html /
// admin-dashboard.html (adapter les IDs HTML selon ta page).
// ===========================================================

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  // Si pas de token -> retour à la page de login
  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  try {
    const response = await fetch('/api/user/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.status === 401) {
      // Token invalide ou expiré -> on nettoie et on renvoie au login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/index.html';
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur:', data.message);
      return;
    }

    afficherDonnees(data.user);

  } catch (error) {
    console.error('Erreur réseau :', error);
  }
});

function afficherDonnees(user) {
  // Adapte ces sélecteurs aux vrais IDs de ta page HTML.
  const nomEl = document.getElementById('user-nom');
  const emailEl = document.getElementById('user-email');
  const roleEl = document.getElementById('user-role');

  if (nomEl) nomEl.textContent = `${user.prenom} ${user.nom}`;
  if (emailEl) emailEl.textContent = user.email;
  if (roleEl) roleEl.textContent = user.role;

  console.log('✅ Données utilisateur chargées :', user);
}

// ---------- DÉCONNEXION ----------
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('lang');
  window.location.href = '/index.html';
}