# Portfolio - Antoine Leroy

Étudiant en informatique à EPITECH (GPA 3.04, plus de 80 projets réalisés), **je recherche un stage d'ingénieur logiciel et de développeur IA, de début avril à fin juillet 2027.**

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

