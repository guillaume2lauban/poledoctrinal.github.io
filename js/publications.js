/**
 * PUBLICATIONS – Gestion des publications depuis publications.json
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

let publicationsCache = [];
let publicationsParSlug = {};
let PUBLICATIONS_PAR_PAGE = 9;

/**
 * Charge le fichier publications.json
 */
async function chargerPublications() {
    try {
        const reponse = await fetch('data/publications.json');
        if (!reponse.ok) {
            throw new Error('Impossible de charger publications.json');
        }
        const donnees = await reponse.json();
        publicationsCache = donnees.publications || [];
        // Trier par date (plus récent en premier)
        publicationsCache.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        // Index par slug
        publicationsCache.forEach(function(pub) {
            publicationsParSlug[pub.slug] = pub;
        });
        return publicationsCache;
    } catch (erreur) {
        console.warn('Publications :', erreur.message);
        return [];
    }
}

/**
 * Récupère une publication par son slug
 */
function obtenirPublicationParSlug(slug) {
    return publicationsParSlug[slug] || null;
}

/**
 * Récupère les publications les plus récentes
 */
function obtenirPublicationsRecentes(limite) {
    return publicationsCache.slice(0, limite || 10);
}

/**
 * Récupère les publications d'une catégorie
 */
function obtenirPublicationsParCategorie(categorieId, limite) {
    const filtrees = publicationsCache.filter(function(pub) {
        return pub.categories && pub.categories.includes(categorieId);
    });
    return limite ? filtrees.slice(0, limite) : filtrees;
}

/**
 * Récupère les publications par type
 */
function obtenirPublicationsParType(type, limite) {
    const filtrees = publicationsCache.filter(function(pub) {
        return pub.type === type;
    });
    return limite ? filtrees.slice(0, limite) : filtrees;
}

/**
 * Pagine une liste de publications
 */
function paginerPublications(liste, page) {
    const debut = (page - 1) * PUBLICATIONS_PAR_PAGE;
    const fin = debut + PUBLICATIONS_PAR_PAGE;
    return liste.slice(debut, fin);
}

/**
 * Calcule le nombre total de pages
 */
function calculerPages(liste) {
    return Math.ceil(liste.length / PUBLICATIONS_PAR_PAGE);
}

/**
 * Génère une carte HTML pour une publication
 */
function genererCartePublication(pub) {
    const dateObj = new Date(pub.date);
    const dateFormatee = dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const badgeCats = window.genererBadgesCategories ? window.genererBadgesCategories(pub.categories) : '';

    const imageHtml = pub.imageCouverture
        ? '<img src="' + pub.imageCouverture + '" alt="' + pub.titre + '" class="pub-image" loading="lazy" />'
        : '<div class="pub-image" style="background:var(--gris-clair);display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--gris-texte);">📄</div>';

    const typeLabels = {
        'article': 'Article',
        'video': 'Vidéo',
        'editorial': 'Éditorial',
        'communique': 'Communiqué',
        'podcast': 'Podcast'
    };
    const typeLabel = typeLabels[pub.type] || pub.type || 'Publication';

    return `
        <div class="carte-publication">
            ${imageHtml}
            <div class="pub-contenu">
                <div class="pub-categories">${badgeCats}</div>
                <h3 class="pub-titre"><a href="publication.html?slug=${pub.slug}">${pub.titre}</a></h3>
                <p class="pub-description">${pub.descriptionCourte || ''}</p>
                <div class="pub-metadonnees">
                    <span>${dateFormatee}</span>
                    <span class="pub-type">${typeLabel}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche les publications dans un conteneur
 */
function afficherPublications(liste, conteneurId, paginationId, pageCourante) {
    const conteneur = document.getElementById(conteneurId);
    if (!conteneur) return;

    pageCourante = pageCourante || 1;
    const pageItems = paginerPublications(liste, pageCourante);

    if (pageItems.length === 0) {
        conteneur.innerHTML = '<p>Aucune publication trouvée.</p>';
        if (paginationId) {
            document.getElementById(paginationId).innerHTML = '';
        }
        return;
    }

    let html = '';
    pageItems.forEach(function(pub) {
        html += genererCartePublication(pub);
    });
    conteneur.innerHTML = html;

    // Pagination
    if (paginationId) {
        const totalPages = calculerPages(liste);
        const paginationEl = document.getElementById(paginationId);
        if (paginationEl && totalPages > 1) {
            let pagHtml = '';
            // Précédent
            pagHtml += '<button class="pagination-prev" data-page="' + (pageCourante - 1) + '" ' + (pageCourante <= 1 ? 'disabled' : '') + '>‹</button>';

            for (let i = 1; i <= totalPages; i++) {
                pagHtml += '<button class="pagination-num" data-page="' + i + '" ' + (i === pageCourante ? 'class="actif"' : '') + '>' + i + '</button>';
            }

            // Suivant
            pagHtml += '<button class="pagination-next" data-page="' + (pageCourante + 1) + '" ' + (pageCourante >= totalPages ? 'disabled' : '') + '>›</button>';

            paginationEl.innerHTML = pagHtml;

            // Événements de pagination
            paginationEl.querySelectorAll('button[data-page]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const page = parseInt(this.dataset.page, 10);
                    if (page > 0 && page <= totalPages) {
                        afficherPublications(liste, conteneurId, paginationId, page);
                        // Scroll en haut des résultats
                        conteneur.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Marquer la page active
            paginationEl.querySelectorAll('.pagination-num').forEach(function(btn) {
                btn.classList.remove('actif');
                if (parseInt(btn.dataset.page, 10) === pageCourante) {
                    btn.classList.add('actif');
                }
            });
        } else if (paginationEl) {
            paginationEl.innerHTML = '';
        }
    }
}

/**
 * Charge et affiche les publications d'une catégorie
 */
async function chargerPublicationsParCategorie(categorieId, conteneurId, paginationId) {
    await chargerCategories();
    const publications = await chargerPublications();
    const filtrees = obtenirPublicationsParCategorie(categorieId);
    afficherPublications(filtrees, conteneurId, paginationId, 1);
}

/**
 * Charge et affiche toutes les publications
 */
async function chargerToutesPublications(conteneurId, paginationId) {
    await chargerCategories();
    const publications = await chargerPublications();
    afficherPublications(publications, conteneurId, paginationId, 1);
}

/**
 * Charge et affiche une publication par son slug
 */
async function chargerPublicationParSlug(slug, conteneurId) {
    const conteneur = document.getElementById(conteneurId);
    if (!conteneur) return;

    await chargerCategories();
    const publications = await chargerPublications();

    let pub = null;
    if (slug === 'dernier') {
        pub = publications.length > 0 ? publications[0] : null;
    } else {
        pub = obtenirPublicationParSlug(slug);
    }

    if (!pub) {
        conteneur.innerHTML = '<p class="erreur">Publication introuvable.</p>';
        return;
    }

    // Remplir le héros
    const heroContainer = document.getElementById('contenu-hero-publication');
    const heroDiv = document.getElementById('hero-publication');
    if (heroDiv && pub.imageCouverture) {
        heroDiv.style.backgroundImage = `linear-gradient(rgba(10,26,46,0.7), rgba(10,26,46,0.85)), url('${pub.imageCouverture}')`;
    }

    const dateObj = new Date(pub.date);
    const dateFormatee = dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const auteur = pub.auteur || 'Pôle doctrinal';

    const badgesCats = window.genererBadgesCategories ? window.genererBadgesCategories(pub.categories) : '';

    // Type avec majuscule et accent
    const typeLabels = {
        'article': 'Article',
        'video': 'Vidéo',
        'editorial': 'Éditorial',
        'communique': 'Communiqué',
        'podcast': 'Podcast'
    };
    const typeLabel = typeLabels[pub.type] || pub.type || 'Publication';

    if (heroContainer) {
        heroContainer.innerHTML = `
            <div class="pub-categories">${badgesCats}</div>
            <h1 class="hero-titre">${pub.titre}</h1>
            <div class="pub-metadonnees" style="color:rgba(255,255,255,0.8);display:flex;flex-wrap:wrap;gap:16px;justify-content:center;font-size:1rem;">
                <span>Par ${auteur}</span>
                <span>${dateFormatee}</span>
                <span style="font-weight:500;color:var(--ocre-clair);">${typeLabel}</span>
            </div>
        `;
    }

    // Générer le contenu (sans l'image de couverture)
    const blocksHtml = window.rendreBlocs ? window.rendreBlocs(pub.contenu) : '<p>Contenu indisponible.</p>';
    conteneur.innerHTML = `<div class="pub-corps">${blocksHtml}</div>`;

    // Ajouter les boutons "Similaire" et "Toutes les publications"
    const footerButtons = document.createElement('div');
    footerButtons.className = 'publication-footer-buttons';
    footerButtons.style.cssText = 'display:flex;flex-wrap:wrap;gap:16px;margin-top:2rem;justify-content:center;';

    // Bouton "Similaire"
    const similaireBtn = document.createElement('a');
    similaireBtn.className = 'bouton bouton-secondaire';
    similaireBtn.textContent = 'Lire une publication similaire';
    const similaireSlug = trouverPublicationSimilaire(pub, publications);
    similaireBtn.href = similaireSlug ? `publication.html?slug=${similaireSlug}` : '#';
    if (!similaireSlug) similaireBtn.style.opacity = '0.5';
    footerButtons.appendChild(similaireBtn);

    // Bouton "Toutes les publications"
    const toutesBtn = document.createElement('a');
    toutesBtn.className = 'bouton bouton-primaire';
    toutesBtn.textContent = 'Voir toutes les publications';
    toutesBtn.href = 'catalogue.html';
    footerButtons.appendChild(toutesBtn);

    conteneur.appendChild(footerButtons);

    // Mettre à jour le titre de la page
    document.title = pub.titre + ' – Pôle doctrinal du Cercle d\'Action Légitimiste';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && pub.descriptionCourte) {
        metaDesc.setAttribute('content', pub.descriptionCourte);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', pub.titre + ' – Pôle doctrinal du Cercle d\'Action Légitimiste');
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && pub.descriptionCourte) {
        ogDesc.setAttribute('content', pub.descriptionCourte);
    }
    const canonique = document.querySelector('link[rel="canonical"]');
    if (canonique) {
        canonique.setAttribute('href', window.location.origin + '/publication.html?slug=' + pub.slug);
    }
}

function trouverPublicationSimilaire(pub, toutes) {
    if (!pub || !toutes || toutes.length < 2) return null;

    // Exclure la publication elle-même
    const autres = toutes.filter(p => p.id !== pub.id);
    if (autres.length === 0) return null;

    // Score basé sur les catégories partagées
    let meilleur = null;
    let meilleurScore = -1;

    autres.forEach(function(autre) {
        let score = 0;
        // Catégories communes
        if (pub.categories && autre.categories) {
            const intersection = pub.categories.filter(cat => autre.categories.includes(cat));
            score += intersection.length * 3;
        }
        // Mots-clés communs
        if (pub.motsCles && autre.motsCles) {
            const interMots = pub.motsCles.filter(mot => autre.motsCles.includes(mot));
            score += interMots.length;
        }
        // Même type
        if (pub.type === autre.type) score += 2;

        if (score > meilleurScore) {
            meilleurScore = score;
            meilleur = autre;
        }
    });

    // Si aucun score positif, prendre un au hasard
    if (meilleurScore <= 0) {
        const randomIndex = Math.floor(Math.random() * autres.length);
        meilleur = autres[randomIndex];
    }

    return meilleur ? meilleur.slug : null;
}

// Exposer les fonctions globalement
window.chargerPublications = chargerPublications;
window.obtenirPublicationParSlug = obtenirPublicationParSlug;
window.obtenirPublicationsRecentes = obtenirPublicationsRecentes;
window.obtenirPublicationsParCategorie = obtenirPublicationsParCategorie;
window.obtenirPublicationsParType = obtenirPublicationsParType;
window.paginerPublications = paginerPublications;
window.calculerPages = calculerPages;
window.genererCartePublication = genererCartePublication;
window.afficherPublications = afficherPublications;
window.chargerPublicationsParCategorie = chargerPublicationsParCategorie;
window.chargerToutesPublications = chargerToutesPublications;
window.chargerPublicationParSlug = chargerPublicationParSlug;