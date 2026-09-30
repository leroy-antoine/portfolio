# Portfolio - Antoine Leroy

Étudiant en informatique à EPITECH (GPA 3.04, plus de 80 projets réalisés), **je recherche un stage d'ingénieur logiciel et de développeur IA, de début avril à fin juillet.**

Ce dépôt contient mon portfolio : mes projets (Lunar Lander en apprentissage par renforcement, Zappy, Arcade, Raytracer, Doctor Cvrie, my_shell), ma stack, mon parcours et mes coordonnées.

- Contact : etudes.leroy.antoine@gmail.com
- GitHub : <https://github.com/leroy-antoine>
- CV : [`assets/CV_LEROY_ANTOINE.pdf`](assets/CV_LEROY_ANTOINE.pdf)

## Stack du projet

Site statique d'une seule page, sans framework ni étape de build : le dossier est publié tel quel.

| Élément | Choix | Pourquoi |
|---|---|---|
| Structure | HTML5 sémantique (`header`, `nav`, `main`, `section`, `article`, `footer`) | Accessibilité (WCAG 2.2 AA) et référencement sans outil supplémentaire |
| Style | CSS natif : variables CSS (design tokens), Grid, Flexbox, `clamp()` pour les tailles fluides, container queries pour les schémas | Pas de dépendance, un thème modifiable en un seul endroit (`:root`) |
| Interactions | JavaScript natif (aucune bibliothèque) : menu burger et onglets Lunar Lander | Quelques dizaines de lignes suffisent, le site reste fonctionnel sans JavaScript |
| Polices | Schibsted Grotesk et JetBrains Mono via Google Fonts | Seule ressource externe |
| Médias | Images PNG/JPG, vidéos MP4 sans son avec affiche, favicon SVG | Chargement différé (`loading="lazy"`, `preload="metadata"`) |
| Hébergement | Tout hébergeur de fichiers statiques : GitHub Pages, Netlify, Vercel | Aucun serveur, aucune commande de build |

Organisation des fichiers :

```
index.html   structure et contenu
styles.css   design tokens (variables CSS), mise en page responsive
script.js    menu burger, onglets Lunar Lander
assets/      images, vidéos, affiches, CV, favicon
```

La mise en page est responsive en trois étapes : mobile (moins de 720 px), intermédiaire (720 à 1023 px, grilles à deux colonnes) et bureau (1024 px et plus, en-tête collant).

## Prévisualiser en local

Depuis ce dossier, n'importe quel serveur de fichiers statiques convient :

```bash
python3 -m http.server 8000
# ou : npx serve .
```

Puis ouvrir <http://localhost:8000>. Ouvrir `index.html` directement (`file://`) fonctionne aussi, mais un serveur reproduit mieux le comportement des vidéos une fois en ligne.

## Déployer sur GitHub Pages

Le site est à la racine du dépôt : il suffit de le publier depuis la branche `main`.

1. Commiter et pousser : `git add . && git commit -m "Portfolio statique" && git push origin main`.
2. Sur GitHub : *Settings → Pages → Build and deployment → Source : Deploy from a branch → Branch : `main` / `(root)` → Save*.
3. Après une à deux minutes, le site est en ligne sur `https://<user>.github.io/<dépôt>/`.

Tous les chemins sont relatifs : le site fonctionne à la racine d'un domaine comme dans un sous-dossier (`https://<user>.github.io/<dépôt>/`). Netlify et Vercel fonctionnent sans configuration : dossier publié = ce dossier, pas de commande de build.

Après le premier déploiement, remplacer dans `index.html` la valeur relative de `og:image` (`assets/raytracer-spheres.png`) par l'URL absolue, par exemple `https://<user>.github.io/<dépôt>/assets/raytracer-spheres.png`. Les aperçus de liens (LinkedIn, Slack, etc.) exigent une URL absolue.

## Modifier le contenu

- **Textes, liens, projets** : directement dans `index.html`.
- **Couleurs, tailles** : variables CSS en haut de `styles.css` (`:root`).
- **Onglets Lunar Lander** : le tableau `algos` dans `script.js` (vidéos, graphique, légendes, chiffres). L'onglet PPO est aussi écrit en dur dans `index.html` : il s'affiche sans JavaScript. Si vous le modifiez, mettre à jour les deux endroits.

## À compléter

- **Lien GitHub de Zappy** : aucun dépôt n'est indiqué. Ajouter un lien « Code source » dans la carte Zappy (repère `TODO` dans `index.html`).
- **Année du stage** : le texte actuel est « avril → fin juillet » (badge du héro, titre de la section Contact, balises meta).
- **Affiches des vidéos Q-Learning et Deep Q-Learning** : ces deux vidéos n'ont pas d'image `poster`. Les navigateurs de bureau affichent leur première image, pas toujours Safari sur iOS. Ajouter un `poster` dans `script.js` si besoin.

## Accessibilité et performance

- Lien d'évitement, repères `header` / `nav` / `main` / `footer`, hiérarchie de titres `h1` → `h2` → `h3`, `lang="fr"`.
- Focus visible (contour 3 px `#7cb8ff`), cibles d'au moins 44 px.
- Vidéos : `controls`, `preload="metadata"`, `poster` quand il existe, pas de lecture automatique.
- Menu burger : `aria-expanded`, `aria-controls`, fermeture avec Échap. Onglets : boutons avec `aria-pressed`, annonce du changement dans une zone `role="status"`.
- `prefers-reduced-motion` respecté.
- `loading="lazy"` sur les images sous la ligne de flottaison, `width` / `height` renseignés.
- Sans JavaScript : la navigation reste visible et seul l'onglet PPO est affiché.
