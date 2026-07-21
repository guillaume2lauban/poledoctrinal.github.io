/**
 * BLOCS – Rendu des blocs de contenu
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

(function() {
    'use strict';

    /**
     * Rend un bloc individuel en HTML
     */
    function rendreBloc(bloc) {
        if (!bloc || !bloc.type) return '';

        switch (bloc.type) {
            case 'titre':
                return '<h2>' + echapperHTML(bloc.texte || '') + '</h2>';

            case 'sous-titre':
                return '<h3>' + echapperHTML(bloc.texte || '') + '</h3>';

            case 'paragraphe':
                return '<p>' + echapperHTML(bloc.texte || '') + '</p>';

            case 'citation':
                const auteur = bloc.auteur ? '<footer>— ' + echapperHTML(bloc.auteur) + '</footer>' : '';
                return '<blockquote><p>' + echapperHTML(bloc.texte || '') + '</p>' + auteur + '</blockquote>';

            case 'liste':
                if (!bloc.elements || !Array.isArray(bloc.elements)) return '';
                const typeListe = bloc.ordonnee ? 'ol' : 'ul';
                const items = bloc.elements.map(function(el) {
                    return '<li>' + echapperHTML(el) + '</li>';
                }).join('');
                return '<' + typeListe + '>' + items + '</' + typeListe + '>';

            case 'image':
                const legende = bloc.legende ? '<div class="legende">' + echapperHTML(bloc.legende) + '</div>' : '';
                return '<div class="bloc-image"><img src="' + echapperHTML(bloc.src || '') + '" alt="' + echapperHTML(bloc.legende || '') + '" loading="lazy" />' + legende + '</div>';

            case 'galerie':
                if (!bloc.images || !Array.isArray(bloc.images) || bloc.images.length === 0) return '';
                const imagesGal = bloc.images.map(function(img) {
                    return '<img src="' + echapperHTML(img.src || '') + '" alt="' + echapperHTML(img.legende || '') + '" loading="lazy" />';
                }).join('');
                return '<div class="bloc-galerie">' + imagesGal + '</div>';

            case 'youtube':
                if (!bloc.url) return '';
                const id = extraireYoutubeId(bloc.url);
                if (!id) return '<p>Vidéo YouTube non disponible.</p>';
                return '<div class="bloc-youtube"><iframe src="https://www.youtube.com/embed/' + id + '" allowfullscreen loading="lazy" title="Vidéo YouTube"></iframe></div>';

            case 'video':
                if (!bloc.src) return '';
                return '<div class="bloc-video"><video controls src="' + echapperHTML(bloc.src) + '" style="width:100%;border-radius:var(--rayon-bordure);"></video></div>';

            case 'audio':
                if (!bloc.src) return '';
                return '<div class="bloc-audio"><audio controls src="' + echapperHTML(bloc.src) + '" style="width:100%;"></audio></div>';

            case 'pdf':
                if (!bloc.src) return '';
                return '<div class="bloc-pdf"><embed src="' + echapperHTML(bloc.src) + '" type="application/pdf" style="width:100%;min-height:400px;border-radius:var(--rayon-bordure);border:1px solid var(--gris-moyen);" /></div>';

            case 'bouton':
                const btnTexte = bloc.texte || 'En savoir plus';
                const btnUrl = bloc.url || '#';
                const btnClasse = bloc.classe || 'bouton-primaire';
                return '<a href="' + echapperHTML(btnUrl) + '" class="bouton ' + echapperHTML(btnClasse) + '">' + echapperHTML(btnTexte) + '</a>';

            case 'lien-externe':
                const lienTexte = bloc.texte || 'Lien externe';
                const lienUrl = bloc.url || '#';
                return '<a href="' + echapperHTML(lienUrl) + '" target="_blank" rel="noopener noreferrer" class="bloc-lien-externe">' + echapperHTML(lienTexte) + ' ↗</a>';

            case 'separateur':
                return '<hr class="bloc-separateur" />';

            case 'encadre':
                const encadreTitre = bloc.titre ? '<strong>' + echapperHTML(bloc.titre) + '</strong>' : '';
                return '<div class="bloc-encadre">' + encadreTitre + '<p>' + echapperHTML(bloc.texte || '') + '</p></div>';

            case 'tableau':
                if (!bloc.lignes || !Array.isArray(bloc.lignes)) return '';
                let tableHtml = '<table>';
                if (bloc.enTete && Array.isArray(bloc.enTete)) {
                    tableHtml += '<thead><tr>';
                    bloc.enTete.forEach(function(th) {
                        tableHtml += '<th>' + echapperHTML(th) + '</th>';
                    });
                    tableHtml += '</tr></thead>';
                }
                tableHtml += '<tbody>';
                bloc.lignes.forEach(function(ligne) {
                    tableHtml += '<tr>';
                    ligne.forEach(function(cell) {
                        tableHtml += '<td>' + echapperHTML(cell) + '</td>';
                    });
                    tableHtml += '</tr>';
                });
                tableHtml += '</tbody></table>';
                return '<div class="bloc-tableau">' + tableHtml + '</div>';

            case 'chronologie':
                if (!bloc.evenements || !Array.isArray(bloc.evenements)) return '';
                const chronoItems = bloc.evenements.map(function(evt) {
                    return '<div class="chrono-item"><span class="chrono-date">' + echapperHTML(evt.date || '') + '</span><span class="chrono-texte">' + echapperHTML(evt.texte || '') + '</span></div>';
                }).join('');
                return '<div class="bloc-chronologie">' + chronoItems + '</div>';

            case 'accordion':
                if (!bloc.questions || !Array.isArray(bloc.questions)) return '';
                const accordionItems = bloc.questions.map(function(q, index) {
                    const id = 'accordion-' + index + '-' + Date.now();
                    return '<div class="bloc-accordion"><details><summary>' + echapperHTML(q.question || '') + '</summary><div class="accordion-contenu">' + echapperHTML(q.reponse || '') + '</div></details></div>';
                }).join('');
                return accordionItems;

            case 'grille-cartes':
                if (!bloc.cartes || !Array.isArray(bloc.cartes)) return '';
                const cartesHtml = bloc.cartes.map(function(carte) {
                    const img = carte.image ? '<img src="' + echapperHTML(carte.image) + '" alt="' + echapperHTML(carte.titre || '') + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;" />' : '';
                    return '<div style="background:var(--blanc);border-radius:var(--rayon-bordure);border:1px solid var(--gris-moyen);overflow:hidden;box-shadow:var(--ombre-legere);">' + img + '<div style="padding:16px;"><h4>' + echapperHTML(carte.titre || '') + '</h4><p style="font-size:0.9rem;color:var(--gris-texte);">' + echapperHTML(carte.texte || '') + '</p></div></div>';
                }).join('');
                return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;margin:1.5rem 0;">' + cartesHtml + '</div>';

            default:
                return '';
        }
    }

    /**
     * Rend un tableau complet de blocs
     */
    function rendreBlocs(blocs) {
        if (!blocs || !Array.isArray(blocs) || blocs.length === 0) {
            return '<p>Aucun contenu disponible.</p>';
        }
        return blocs.map(function(bloc) {
            return rendreBloc(bloc);
        }).join('');
    }

    /**
     * Échappe les caractères HTML pour éviter les injections XSS
     */
    function echapperHTML(texte) {
        if (!texte) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(texte).replace(/[&<>"']/g, function(c) {
            return map[c];
        });
    }

    /**
     * Extrait l'ID d'une vidéo YouTube depuis une URL
     */
    function extraireYoutubeId(url) {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Exposer les fonctions globalement
    window.rendreBloc = rendreBloc;
    window.rendreBlocs = rendreBlocs;
    window.echapperHTML = echapperHTML;
    window.extraireYoutubeId = extraireYoutubeId;

})();