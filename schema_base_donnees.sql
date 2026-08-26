-- ============================================================
-- SCHEMA DE BASE DE DONNEES
-- Plateforme de gestion de demandes de developpement Web/Mobile
-- avec profils freelances (type "mini Upwork")
-- SGBD : MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS plateforme_freelance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE plateforme_freelance;

-- ------------------------------------------------------------
-- 1. UTILISATEURS (clients, freelances, admin)
-- ------------------------------------------------------------
CREATE TABLE utilisateurs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe    VARCHAR(255) NOT NULL,          -- hash bcrypt
    role            ENUM('client', 'freelance', 'admin') NOT NULL DEFAULT 'client',
    telephone       VARCHAR(20),
    statut          ENUM('actif', 'suspendu', 'supprime') NOT NULL DEFAULT 'actif',
    date_inscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. PROFILS FREELANCE (CV, liens externes, tarifs)
-- ------------------------------------------------------------
CREATE TABLE profils_freelance (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id      INT NOT NULL UNIQUE,
    titre_professionnel VARCHAR(150),               -- ex: "Developpeur Full Stack"
    bio                 TEXT,
    photo_url           VARCHAR(255),
    cv_url              VARCHAR(255),                -- fichier CV stocke (pdf)
    tarif_horaire       DECIMAL(8,2),
    lien_github         VARCHAR(255),
    lien_linkedin       VARCHAR(255),
    lien_upwork         VARCHAR(255),
    note_moyenne        DECIMAL(3,2) DEFAULT 0.00,
    disponibilite       ENUM('disponible', 'occupe', 'indisponible') DEFAULT 'disponible',
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. COMPETENCES (referentiel) + liaison N-N avec profils
-- ------------------------------------------------------------
CREATE TABLE competences (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nom     VARCHAR(100) NOT NULL UNIQUE             -- ex: "Node.js", "MySQL", "Flutter"
) ENGINE=InnoDB;

CREATE TABLE profil_competences (
    profil_id       INT NOT NULL,
    competence_id   INT NOT NULL,
    niveau          ENUM('debutant', 'intermediaire', 'avance', 'expert') DEFAULT 'intermediaire',
    PRIMARY KEY (profil_id, competence_id),
    FOREIGN KEY (profil_id) REFERENCES profils_freelance(id) ON DELETE CASCADE,
    FOREIGN KEY (competence_id) REFERENCES competences(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. PORTFOLIO (projets deja realises par le freelance)
-- ------------------------------------------------------------
CREATE TABLE portfolio (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    profil_id       INT NOT NULL,
    titre           VARCHAR(150) NOT NULL,
    description     TEXT,
    image_url       VARCHAR(255),
    lien_projet     VARCHAR(255),
    date_ajout      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profil_id) REFERENCES profils_freelance(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. DEMANDES (projets postes par les clients)
-- ------------------------------------------------------------
CREATE TABLE demandes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    client_id       INT NOT NULL,
    titre           VARCHAR(150) NOT NULL,
    description     TEXT NOT NULL,
    type_projet     ENUM('site_web', 'application_mobile', 'application_web', 'autre') NOT NULL,
    budget_estime   DECIMAL(10,2),
    delai_souhaite  INT,                             -- en jours
    statut          ENUM('en_attente', 'en_cours', 'termine', 'annule') NOT NULL DEFAULT 'en_attente',
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_statut (statut),
    INDEX idx_type (type_projet)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. PROPOSITIONS (offres des freelances sur une demande)
-- ------------------------------------------------------------
CREATE TABLE propositions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    demande_id      INT NOT NULL,
    freelance_id    INT NOT NULL,
    prix_propose    DECIMAL(10,2) NOT NULL,
    delai_propose   INT NOT NULL,                    -- en jours
    message         TEXT,
    statut          ENUM('en_attente', 'acceptee', 'refusee') NOT NULL DEFAULT 'en_attente',
    date_proposition DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
    FOREIGN KEY (freelance_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_offre (demande_id, freelance_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. MESSAGES (echanges client <-> freelance autour d'une demande)
-- ------------------------------------------------------------
CREATE TABLE messages (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    demande_id      INT NOT NULL,
    expediteur_id   INT NOT NULL,
    destinataire_id INT NOT NULL,
    contenu         TEXT NOT NULL,
    lu              BOOLEAN NOT NULL DEFAULT FALSE,
    date_envoi      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
    FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. AVIS (evaluations apres un projet termine)
-- ------------------------------------------------------------
CREATE TABLE avis (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    demande_id      INT NOT NULL,
    client_id       INT NOT NULL,
    freelance_id    INT NOT NULL,
    note            TINYINT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire     TEXT,
    date_avis       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (freelance_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. PAIEMENTS
-- ------------------------------------------------------------
CREATE TABLE paiements (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    demande_id      INT NOT NULL,
    montant         DECIMAL(10,2) NOT NULL,
    methode         ENUM('carte', 'virement', 'mobile_money', 'paypal') NOT NULL,
    statut          ENUM('en_attente', 'valide', 'echoue', 'rembourse') NOT NULL DEFAULT 'en_attente',
    date_paiement   DATETIME,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. SUGGESTIONS IA (resultats du module de matching intelligent)
-- ------------------------------------------------------------
CREATE TABLE suggestions_ia (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    demande_id              INT NOT NULL,
    competences_detectees   TEXT,                    -- JSON : competences extraites de la description
    budget_estime_ia        DECIMAL(10,2),
    freelances_recommandes  TEXT,                     -- JSON : liste d'IDs classes par pertinence
    date_generation         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;
