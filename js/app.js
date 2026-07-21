/**
 * APP – Point d'entrée principal de l'application
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

(function() {
    'use strict';

    /**
     * Initialise l'ensemble de l'application
     */
    async function initialiserApplication() {
        // Charger les configurations nécessaires
        try {
            // Charger les catégories (utilisées partout)
            await window.chargerCategories();

            // Charger les publications (cache)
            await window.chargerPublications();

            // Afficher les catégories sur la page d'accueil
            if (document.getElementById('grille-categories')) {
                await window.afficherCategoriesGrille('grille-categories');
            }

            // Afficher les dernières publications sur la page d'accueil
            if (document.getElementById('grille-publications')) {
                const pubs = await window.chargerPublications();
                const recentes = window.obtenirPublicationsRecentes(6);
                window.afficherPublications(recentes, 'grille-publications', null, 1);
            }

            // Initialiser les animations AOS
            initialiserAnimations();

            // Gérer le header au scroll
            gererHeaderScroll();

            // Mettre à jour l'année dans le footer
            mettreAJourAnnee();

            // Initialiser les formulaires de contact (déjà fait dans contact.js)

        } catch (erreur) {
            console.warn('Application :', erreur.message);
        }
    }

    /**
     * Initialise les animations au scroll (AOS simplifié)
     */
    function initialiserAnimations() {
        const elements = document.querySelectorAll('[data-aos]');

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-anime');
                    // On peut arrêter d'observer une fois animé
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.10,
            rootMargin: '0px 0px -40px 0px'
        });

        elements.forEach(function(el) {
            observer.observe(el);
        });

        // Pour les éléments déjà visibles, les animer immédiatement
        elements.forEach(function(el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                el.classList.add('aos-anime');
                observer.unobserve(el);
            }
        });
    }

    /**
     * Gère l'effet de scroll sur le header
     */
    function gererHeaderScroll() {
        const header = document.getElementById('site-header');
        if (!header) return;

        let dernierScroll = 0;

        window.addEventListener('scroll', function() {
            const y = window.scrollY;
            if (y > 20) {
                header.classList.add('scrolle');
            } else {
                header.classList.remove('scrolle');
            }
            dernierScroll = y;
        }, { passive: true });
    }

    /**
     * Met à jour l'année dans le footer
     */
    function mettreAJourAnnee() {
        const anneeEl = document.getElementById('footer-annee');
        if (anneeEl) {
            anneeEl.textContent = new Date().getFullYear();
        }
    }

    // Lancer l'application une fois le DOM chargé
    document.addEventListener('DOMContentLoaded', initialiserApplication);

    // Si le DOM est déjà chargé
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialiserApplication();
    }

})();