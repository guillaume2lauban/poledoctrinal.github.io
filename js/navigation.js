/**
 * NAVIGATION – Génération du menu depuis navigation.json
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

(function() {
    'use strict';

    let donneesNavigation = null;
    let menuPrincipal = document.getElementById('menu-principal');
    let menuBurger = document.getElementById('menu-burger');

    /**
     * Charge le fichier navigation.json
     */
    async function chargerNavigation() {
        try {
            const reponse = await fetch('data/navigation.json');
            if (!reponse.ok) {
                throw new Error('Impossible de charger navigation.json');
            }
            donneesNavigation = await reponse.json();
            genererMenu();
            marquerPageActive();
        } catch (erreur) {
            console.warn('Navigation :', erreur.message);
            // Menu de secours statique
            menuPrincipal.innerHTML = `
                <li><a href="index.html">Accueil</a></li>
                <li><a href="doctrine.html">Doctrine</a></li>
                <li><a href="histoire.html">Histoire</a></li>
                <li><a href="philosophie.html">Philosophie</a></li>
                <li><a href="theologie.html">Théologie</a></li>
                <li><a href="royaute.html">Royauté</a></li>
                <li><a href="politique.html">Politique</a></li>
                <li><a href="societe.html">Société</a></li>
                <li><a href="editoriaux.html">Éditoriaux</a></li>
                <li><a href="videos.html">Vidéos</a></li>
                <li><a href="actualites.html">Actualités</a></li>
                <li><a href="contact.html">Contact</a></li>
            `;
            marquerPageActive();
        }
    }

    /**
     * Génère le menu HTML à partir des données
     */
    function genererMenu() {
        if (!donneesNavigation || !donneesNavigation.items) return;
        if (!menuPrincipal) return;

        let html = '';

        donneesNavigation.items.forEach(function(item) {
            if (item.sousMenu && item.sousMenu.length > 0) {
                // Item avec sous-menu
                html += '<li>';
                html += '<a href="' + (item.url || '#') + '">' + item.nom + '</a>';
                html += '<ul class="sous-menu">';
                item.sousMenu.forEach(function(sous) {
                    let externe = sous.externe ? ' target="_blank" rel="noopener noreferrer"' : '';
                    html += '<li><a href="' + (sous.url || '#') + '"' + externe + '>' + sous.nom + '</a></li>';
                });
                html += '</ul>';
                html += '</li>';
            } else {
                // Item simple
                let externe = item.externe ? ' target="_blank" rel="noopener noreferrer"' : '';
                let actif = item.actif ? ' class="actif"' : '';
                html += '<li><a href="' + (item.url || '#') + '"' + externe + actif + '>' + item.nom + '</a></li>';
            }
        });

        menuPrincipal.innerHTML = html;

        // Gérer les sous-menus sur mobile (clic)
        const itemsAvecSousMenu = menuPrincipal.querySelectorAll('li > a + .sous-menu');
        itemsAvecSousMenu.forEach(function(sousMenu) {
            const parentLi = sousMenu.closest('li');
            const lien = parentLi ? parentLi.querySelector('> a') : null;
            if (lien) {
                lien.addEventListener('click', function(e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        const estOuvert = sousMenu.classList.contains('ouvert');
                        // Fermer tous les autres sous-menus ouverts
                        document.querySelectorAll('.sous-menu.ouvert').forEach(function(autre) {
                            if (autre !== sousMenu) {
                                autre.classList.remove('ouvert');
                            }
                        });
                        if (estOuvert) {
                            sousMenu.classList.remove('ouvert');
                        } else {
                            sousMenu.classList.add('ouvert');
                        }
                    }
                });
            }
        });
    }

    /**
     * Marque la page active dans le menu
     */
    function marquerPageActive() {
        const chemin = window.location.pathname;
        const page = chemin.substring(chemin.lastIndexOf('/') + 1) || 'index.html';

        const liens = menuPrincipal.querySelectorAll('a');
        liens.forEach(function(lien) {
            const href = lien.getAttribute('href');
            if (href === page || (page === 'index.html' && href === 'index.html')) {
                lien.classList.add('actif');
            } else if (page !== 'index.html' && href && href.includes(page)) {
                // Pour les pages comme doctrine.html etc.
                lien.classList.add('actif');
            }
        });
    }

    /**
     * Gère le menu burger mobile
     */
    function gererMenuBurger() {
        if (!menuBurger) return;
        const nav = document.getElementById('navigation-principale');
        let overlay = document.getElementById('menu-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'menu-overlay';
            document.body.appendChild(overlay);
        }

        function ouvrirMenu() {
            nav.classList.add('ouvert');
            menuBurger.classList.add('actif');
            menuBurger.setAttribute('aria-expanded', 'true');
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }

        function fermerMenu() {
            nav.classList.remove('ouvert');
            menuBurger.classList.remove('actif');
            menuBurger.setAttribute('aria-expanded', 'false');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
            // Fermer les sous-menus ouverts
            document.querySelectorAll('.sous-menu.ouvert').forEach(function(s) {
                s.classList.remove('ouvert');
            });
        }

        // Bascule du burger
        menuBurger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (nav.classList.contains('ouvert')) {
                fermerMenu();
            } else {
                ouvrirMenu();
            }
        });

        // Fermer via l'overlay (UNIQUEMENT l'overlay)
        overlay.addEventListener('click', function(e) {
            e.stopPropagation();
            fermerMenu();
        });

        // Fermer avec Échap
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('ouvert')) {
                fermerMenu();
            }
        });

        // Fermer en redimensionnant au-dessus de 1024px
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1024 && nav.classList.contains('ouvert')) {
                fermerMenu();
            }
        });

        // CRUCIAL : laisser les clics sur les liens fonctionner normalement
        // On ne bloque PAS les événements sur le menu
        // On ne fait PAS e.preventDefault() sur les liens
        // On laisse la navigation se faire normalement

        // Lorsqu'on clique sur un lien dans le menu, on ferme le menu
        nav.querySelectorAll('a').forEach(function(lien) {
            lien.addEventListener('click', function() {
                // Fermer le menu après un petit délai pour laisser la navigation se faire
                setTimeout(function() {
                    fermerMenu();
                }, 150);
            });
        });
    }

    // Initialisation
    document.addEventListener('DOMContentLoaded', function() {
        chargerNavigation();
        gererMenuBurger();
    });

    // Si le DOM est déjà chargé
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        chargerNavigation();
        gererMenuBurger();
    }

})();