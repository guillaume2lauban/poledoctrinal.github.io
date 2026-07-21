/**
 * COOKIES – Bannière de consentement
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

(function() {
    'use strict';

    const COOKIE_NOM = 'consentement_cookies_pole_doctrinal';
    const DUREE_JOURS = 395; // 13 mois

    const banniere = document.getElementById('banniere-cookies');
    const btnAccepter = document.getElementById('cookies-accepter');
    const btnRefuser = document.getElementById('cookies-refuser');

    /**
     * Définit un cookie
     */
    function definirCookie(nom, valeur, jours) {
        const date = new Date();
        date.setTime(date.getTime() + jours * 24 * 60 * 60 * 1000);
        document.cookie = nom + '=' + encodeURIComponent(valeur) + ';expires=' + date.toUTCString() + ';path=/;SameSite=Lax';
    }

    /**
     * Récupère un cookie
     */
    function obtenirCookie(nom) {
        const nomEq = nom + '=';
        const morceaux = document.cookie.split(';');
        for (let i = 0; i < morceaux.length; i++) {
            let m = morceaux[i].trim();
            if (m.indexOf(nomEq) === 0) {
                return decodeURIComponent(m.substring(nomEq.length));
            }
        }
        return null;
    }

    /**
     * Vérifie si le consentement a déjà été donné
     */
    function consentementDejaDonne() {
        const valeur = obtenirCookie(COOKIE_NOM);
        return valeur === 'accepte' || valeur === 'refuse';
    }

    /**
     * Accepte les cookies
     */
    function accepterCookies() {
        definirCookie(COOKIE_NOM, 'accepte', DUREE_JOURS);
        masquerBanniere();
    }

    /**
     * Refuse les cookies
     */
    function refuserCookies() {
        definirCookie(COOKIE_NOM, 'refuse', DUREE_JOURS);
        masquerBanniere();
    }

    /**
     * Masque la bannière
     */
    function masquerBanniere() {
        if (banniere) {
            banniere.hidden = true;
        }
    }

    /**
     * Affiche la bannière si nécessaire
     */
    function afficherBanniereSiNecessaire() {
        if (!consentementDejaDonne()) {
            if (banniere) {
                banniere.hidden = false;
            }
        } else {
            masquerBanniere();
        }
    }

    // Écouteurs d'événements
    if (btnAccepter) {
        btnAccepter.addEventListener('click', accepterCookies);
    }
    if (btnRefuser) {
        btnRefuser.addEventListener('click', refuserCookies);
    }

    // Initialisation
    document.addEventListener('DOMContentLoaded', afficherBanniereSiNecessaire);

    // Si le DOM est déjà chargé
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        afficherBanniereSiNecessaire();
    }

})();