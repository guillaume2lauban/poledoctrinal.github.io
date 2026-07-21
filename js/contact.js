/**
 * CONTACT – Gestion des formulaires de contact
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

(function() {
    'use strict';

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

                // Simuler l'envoi (affichage de succès)
                afficherSucces(form);

                // Réinitialiser le formulaire
                form.reset();
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
     * Affiche un message de succès dans le formulaire
     */
    function afficherSucces(form) {
        // Supprimer les anciens messages
        const ancienMsg = form.querySelector('.message-succes');
        if (ancienMsg) {
            ancienMsg.remove();
        }

        const msg = document.createElement('div');
        msg.className = 'message-succes';
        msg.style.cssText = 'padding:12px 16px;background:#1E438C;color:#fff;border-radius:8px;margin-top:12px;font-weight:500;text-align:center;';
        msg.textContent = '✅ Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.';

        form.appendChild(msg);

        // Faire disparaître après 5 secondes
        setTimeout(function() {
            if (msg.parentNode) {
                msg.style.opacity = '0';
                msg.style.transition = 'opacity 0.5s ease';
                setTimeout(function() {
                    if (msg.parentNode) {
                        msg.remove();
                    }
                }, 600);
            }
        }, 6000);
    }

    // Initialisation au chargement du DOM
    document.addEventListener('DOMContentLoaded', initialiserFormulairesContact);

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialiserFormulairesContact();
    }

})();