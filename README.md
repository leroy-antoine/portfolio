# Portfolio - Antoine Leroy

Étudiant en informatique à EPITECH (GPA 3.04, plus de 80 projets réalisés), **je recherche un stage d'ingénieur logiciel et de développeur IA, de début avril à fin juillet 2027.**

Ce dépôt contient mon portfolio : mes projets (Lunar Lander en apprentissage par renforcement, Zappy, Raytracer, Doctor Cvrie, Arcade, my_shell), mes distinctions, ma stack, mon parcours et mes coordonnées.

- Contact : etudes.leroy.antoine@gmail.com
- GitHub : <https://github.com/leroy-antoine>
- CV : [`assets/CV - Antoine Leroy.pdf`](assets/CV%20-%20Antoine%20Leroy.pdf)

## Ce que contient la page

| Partie | Contenu |
|---|---|
| Hero | Vidéo d'un atterrissage Lunar Lander qui, au défilement, rejoint sa place dans le carrousel du projet |
| Projets | Une scène plein écran par projet : Lunar Lander (carrousel de vidéos, graphiques réels tracés jusqu'à l'épisode montré), Zappy, Raytracer, Doctor Cvrie, Arcade, my_shell |
| Arcade jouable | Portage JavaScript du vrai projet : menu, Snake, Démineur, affichages SDL2, SFML et NCURSES interchangeables à chaud. Sur ordinateur seulement ; sur téléphone et tablette, la vidéo de démonstration reste seule |
| 42sh dans le navigateur | Émulation fidèle de mon shell (portage du C, comparé au vrai binaire sur environ 250 commandes), avec un système de fichiers simulé |
| À propos, Stack | Quatre distinctions et chiffres clés, stack principale, compétences complémentaires, langues |
| Parcours | Expériences, formation, distinctions, et une frise 2023 → 2027 avec un repère « aujourd'hui » |
| Contact | Plein écran : e-mail, GitHub, CV |

Le nom en haut à gauche ouvre un petit menu : mon GitHub, Glance (<https://glance-dashboard.fr/>) et retour en haut. Les liens externes et le CV s'ouvrent dans un nouvel onglet.

## Stack du projet

Site statique d'une seule page, sans framework, sans dépendance et sans étape de build : le dossier est publié tel quel.

| Élément | Choix | Pourquoi |
|---|---|---|
| Structure | HTML5 sémantique (`header`, `nav`, `main`, `section`, `article`, `footer`) | Accessibilité (WCAG 2.2 AA) et référencement sans outil supplémentaire |
| Style | CSS natif : variables CSS (design tokens), Grid, Flexbox, `clamp()` pour les tailles fluides, container queries pour les schémas | Un thème modifiable en un seul endroit (`:root`) |
| Interactions | JavaScript natif, aucune bibliothèque | Le site reste lisible et utilisable sans JavaScript |
| Polices | Schibsted Grotesk et JetBrains Mono, hébergées dans `assets/fonts/` (WOFF2 variables, licence OFL) | Aucune requête vers un autre site (RGPD) |
| Médias | PNG/JPG, vidéos MP4/WebM sans son avec affiche, favicon SVG | Chargement différé (`loading="lazy"`, `preload="metadata"`), lecture seulement à l'écran |
| Hébergement | GitHub Pages | Aucun serveur, aucune commande de build |

Organisation des fichiers :

```
index.html     structure et contenu
mentions-legales.html  mentions légales et confidentialité (lien en pied de page)
_config.yml    GitHub Pages : fichiers du dépôt non publiés (documentation, originaux)
styles.css     design tokens, mise en page responsive, animations
script.js      menus (nom, burger), séquence du hero, carrousels, animations d'apparition,
               défilement section par section à la molette, liens internes, frise, contact
shell.js       émulation de 42sh (my_shell)
arcade.js      Arcade jouable (Core, jeux, affichages)
assets/        images, vidéos, affiches, CV, logos, polices (assets/fonts/), sprites d'Arcade (assets/arcade/)
DESIGN.md      système de design
PRODUCT.md     contexte produit (public, objectifs, contraintes)
```

## Comportements à connaître

- **Responsive** en trois paliers : mobile (moins de 720 px), intermédiaire (720 à 1023 px) et bureau (1024 px et plus). Sur bureau, chaque scène de projet est dimensionnée pour tenir dans un écran.
- **Molette** : sur bureau, un cran amène à la partie suivante (une scène de projet, « À propos » avec la Stack, le parcours, le contact). Les liens du menu s'arrêtent au même endroit. Le hero, les zones qui défilent elles-mêmes (terminal, carrousels), Ctrl + molette et le mouvement réduit gardent le défilement natif.
- **Animations** : courtes et jouées à l'arrivée de chaque partie. Deux effets suivent la position du défilement : la séquence du hero et le défloutage du contact. Avec `prefers-reduced-motion`, tout est affiché d'emblée, sans mouvement.
- **Accessibilité** : lien d'évitement, navigation complète au clavier, focus visible, cibles d'au moins 44 px, contraste AA, un seul `h1`, vidéos avec bouton pause.

## Avant la mise en ligne

- Dans les réglages GitHub Pages du dépôt, cocher « Enforce HTTPS ».
- Publier depuis une branche (Jekyll) : c'est ce qui applique `_config.yml` et laisse la documentation et les originaux hors du site. Avec un déploiement par GitHub Actions, ces fichiers seraient publiés.
- La politique de sécurité (CSP) est posée par une balise `<meta>` dans `index.html`. Si le script inline du `<head>` change, recalculer son empreinte sha256 dans cette balise. GitHub Pages ne permet pas d'ajouter d'en-têtes HTTP : la protection contre l'intégration dans un cadre (`frame-ancestors`) n'est donc pas disponible.

L'image de partage (`og:image`, dans `index.html`) pointe vers `assets/raytracer-spheres.png` en URL relative : la remplacer par l'URL absolue du site déployé (par exemple `https://mon-domaine.fr/assets/raytracer-spheres.png`), sinon les aperçus de lien (LinkedIn, Slack, Discord) n'afficheront pas d'image.

## Prévisualiser en local

Depuis ce dossier, n'importe quel serveur de fichiers statiques convient :

```bash
python3 -m http.server 8000
# ou : npx serve .
```

Puis ouvrir <http://localhost:8000>. Ouvrir `index.html` directement (`file://`) fonctionne aussi, mais un serveur reproduit mieux le comportement des vidéos une fois en ligne.
