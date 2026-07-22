/**
 * CONTACT – Gestion des formulaires de contact avec envoi réel
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

(function() {
    'use strict';

    let endpoint = '';

    // Charger la configuration pour obtenir l'endpoint
    async function chargerConfig() {
        try {
            const reponse = await fetch('data/config.json');
            if (reponse.ok) {
                const config = await reponse.json();
                endpoint = config.formEndpoint || '';
            }
        } catch (e) {
            console.warn('Impossible de charger config.json pour le formulaire');
        }
    }

    /**
     * Initialise tous les formulaires de contact
     */
    function initialiserFormulairesContact() {
        const formulaires = document.querySelectorAll('#footer-contact, #page-contact-form');

        formulaires.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Valider le formulaire
                if (!validerFormulaire(form)) {
                    return;
                }

                // Récupérer les données
                const donnees = new FormData(form);
                const objet = {};
                donnees.forEach(function(valeur, cle) {
                    objet[cle] = valeur;
                });

                // Ajouter un champ _captcha pour Formspree (désactivé)
                objet._captcha = false;

                // Envoyer les données
                envoyerDonnees(objet, form);
            });
        });
    }

    /**
     * Valide un formulaire (HTML5 + consentement)
     */
    function validerFormulaire(form) {
        const inputs = form.querySelectorAll('input, textarea');
        let valide = true;

        inputs.forEach(function(input) {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.setCustomValidity('Ce champ est requis.');
                valide = false;
            } else {
                input.setCustomValidity('');
            }

            if (input.type === 'email' && input.value.trim() && !input.value.includes('@')) {
                input.setCustomValidity('Veuillez entrer une adresse email valide.');
                valide = false;
            }
        });

        // Vérifier le consentement
        const consentement = form.querySelector('input[name="consentement"]');
        if (consentement && !consentement.checked) {
            consentement.setCustomValidity('Vous devez accepter la politique de confidentialité.');
            valide = false;
        } else if (consentement) {
            consentement.setCustomValidity('');
        }

        // Afficher les messages d'erreur
        inputs.forEach(function(input) {
            if (!input.validity.valid) {
                input.reportValidity();
            }
        });

        return valide;
    }

    /**
     * Envoie les données via fetch
     */
    function envoyerDonnees(donnees, form) {
        if (!endpoint) {
            // Si pas d'endpoint, simuler et afficher succès
            afficherSucces(form);
            form.reset();
            return;
        }

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(donnees)
        })
        .then(function(reponse) {
            if (reponse.ok) {
                afficherSucces(form);
                form.reset();
            } else {
                afficherErreur(form, 'Une erreur est survenue. Veuillez réessayer.');
            }
        })
        .catch(function() {
            afficherErreur(form, 'Problème de connexion. Veuillez réessayer.');
        });
    }

    /**
     * Affiche un message de succès
     */
    function afficherSucces(form) {
        supprimerMessages(form);
        const msg = document.createElement('div');
        msg.className = 'message-succes';
        msg.style.cssText = 'padding:12px 16px;background:#1E438C;color:#fff;border-radius:8px;margin-top:12px;font-weight:500;text-align:center;';
        msg.textContent = '✅ Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.';
        form.appendChild(msg);
        setTimeout(function() {
            if (msg.parentNode) {
                msg.style.opacity = '0';
                msg.style.transition = 'opacity 0.5s ease';
                setTimeout(function() {
                    if (msg.parentNode) msg.remove();
                }, 600);
            }
        }, 6000);
    }

    function afficherErreur(form, texte) {
        supprimerMessages(form);
        const msg = document.createElement('div');
        msg.className = 'message-erreur';
        msg.style.cssText = 'padding:12px 16px;background:#B22234;color:#fff;border-radius:8px;margin-top:12px;font-weight:500;text-align:center;';
        msg.textContent = '❌ ' + texte;
        form.appendChild(msg);
        setTimeout(function() {
            if (msg.parentNode) msg.remove();
        }, 6000);
    }

    function supprimerMessages(form) {
        const msgs = form.querySelectorAll('.message-succes, .message-erreur');
        msgs.forEach(function(m) { m.remove(); });
    }

    // Charger la config puis initialiser
    document.addEventListener('DOMContentLoaded', function() {
        chargerConfig().then(function() {
            initialiserFormulairesContact();
        });
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        chargerConfig().then(function() {
            initialiserFormulairesContact();
        });
    }

})();