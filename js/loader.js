/**
 * LOADER – Gestion de l'écran de chargement
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

(function() {
    'use strict';

    const loader = document.getElementById('loader');

    // Masquer le loader dès que la page est complètement chargée
    window.addEventListener('load', function() {
        if (loader) {
            // Un petit délai pour laisser le temps aux animations de se mettre en place
            setTimeout(function() {
                loader.classList.add('charge');
                // Supprimer du DOM après la transition
                setTimeout(function() {
                    if (loader.parentNode) {
                        loader.style.display = 'none';
                    }
                }, 700);
            }, 300);
        }
    });

    // Fallback : si la page est déjà chargée (cas de cache)
    if (document.readyState === 'complete') {
        if (loader) {
            loader.classList.add('charge');
            setTimeout(function() {
                if (loader.parentNode) {
                    loader.style.display = 'none';
                }
            }, 400);
        }
    }

})();