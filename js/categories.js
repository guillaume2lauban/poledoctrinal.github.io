/**
 * CATÉGORIES – Gestion des catégories depuis categories.json
 * Pôle doctrinal du Cercle d'Action Légitimiste
 */

let categoriesCache = null;
let categoriesMap = {};

/**
 * Charge le fichier categories.json
 */
async function chargerCategories() {
    try {
        const reponse = await fetch('data/categories.json');
        if (!reponse.ok) {
            throw new Error('Impossible de charger categories.json');
        }
        const donnees = await reponse.json();
        categoriesCache = donnees.categories || [];
        // Construire un index par identifiant
        categoriesCache.forEach(function(cat) {
            categoriesMap[cat.id] = cat;
        });
        return categoriesCache;
    } catch (erreur) {
        console.warn('Catégories :', erreur.message);
        return [];
    }
}

/**
 * Récupère une catégorie par son identifiant
 */
function obtenirCategorie(id) {
    return categoriesMap[id] || null;
}

/**
 * Récupère plusieurs catégories par leurs identifiants
 */
function obtenirCategories(ids) {
    if (!ids || !Array.isArray(ids)) return [];
    return ids.map(function(id) {
        return categoriesMap[id] || { id: id, nom: id, description: '' };
    });
}

/**
 * Génère les badges HTML pour les catégories d'une publication
 */
function genererBadgesCategories(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return '';
    return ids.map(function(id) {
        const cat = categoriesMap[id] || { id: id, nom: id };
        const couleur = cat.couleur || 'var(--gris-texte)';
        return '<span class="pub-categorie" style="border-color:' + couleur + ';color:' + couleur + ';">' + cat.nom + '</span>';
    }).join('');
}

/**
 * Affiche les catégories dans la grille de la page d'accueil
 */
async function afficherCategoriesGrille(conteneurId) {
    const conteneur = document.getElementById(conteneurId);
    if (!conteneur) return;

    const categories = await chargerCategories();
    if (!categories || categories.length === 0) {
        conteneur.innerHTML = '<p>Aucune catégorie disponible.</p>';
        return;
    }

    // Limiter à 6 catégories pour l'accueil
    const afficher = categories;

    let html = '';
    afficher.forEach(function(cat) {
        const icone = cat.icone || '📚';
        const couleur = cat.couleur || 'var(--bleu-principal)';
        html += `
            <div class="carte-categorie" style="border-top: 4px solid ${couleur};">
                <a href="${cat.lien || '#'}">
                    <div class="cat-icone">${icone}</div>
                    <div class="cat-nom">${cat.nom}</div>
                    <div class="cat-description">${cat.description || ''}</div>
                </a>
            </div>
        `;
    });

    conteneur.innerHTML = html;
}

// Exposer les fonctions globalement
window.chargerCategories = chargerCategories;
window.obtenirCategorie = obtenirCategorie;
window.obtenirCategories = obtenirCategories;
window.genererBadgesCategories = genererBadgesCategories;
window.afficherCategoriesGrille = afficherCategoriesGrille;