---
name: Portfolio Antoine Leroy
description: Un tableau de bord de vol sombre où les mesures réelles (vidéos, courbes, chiffres, projets jouables) portent la démonstration.
colors:
  void: "#09080f"
  void-deep: "#06050b"
  surface: "#100e1b"
  surface-raised: "#181527"
  surface-core: "#14112a"
  line: "#1c1a2c"
  line-strong: "#25223a"
  line-tag: "#38345a"
  control-edge: "#6f69ad"
  text: "#ece9f6"
  text-muted: "#aaa6c0"
  text-soft: "#cfcbe0"
  signal-violet: "#a597ff"
  signal-violet-bright: "#cbc3ff"
  readout-yellow: "#ecd24a"
  available-green: "#6ee7a8"
  data-blue: "#4da3ff"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(38px, calc(38px + 22 * (100vw - 390px) / 890), 60px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.02em"
  contact:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(38px, min(11vw, 11svh), 120px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(32px, calc(32px + 12 * (100vw - 390px) / 890), 44px)"
    fontWeight: 600
  title:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(30px, calc(30px + 18 * (100vw - 390px) / 890), 48px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  readout:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(24px, 2.1vw, 30px)"
    fontWeight: 500
    lineHeight: 1.2
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
rounded:
  chip: "7px"
  item: "10px"
  control: "12px"
  card: "16px"
spacing:
  gutter: "clamp(16px, calc(16px + 56 * (100vw - 390px) / 634), 72px)"
  section: "clamp(56px, calc(56px + 56 * (100vw - 390px) / 634), 112px)"
  max-width: "1680px"
motion:
  ease-out: "cubic-bezier(0.16, 1, 0.3, 1)"
  ease-in-out: "cubic-bezier(0.65, 0, 0.35, 1)"
  duration-short: "180ms"
  duration-medium: "420ms"
  duration-long: "800ms"
  duration-graph: "2400ms"
  move-sm: "12px"
  move-md: "24px"
  move-lg: "80px"
components:
  button-primary:
    backgroundColor: "{colors.signal-violet}"
    textColor: "{colors.void}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.signal-violet-bright}"
    textColor: "{colors.void}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.text-soft}"
    rounded: "{rounded.chip}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "24px"
  popover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "8px"
---

# Design System: Portfolio Antoine Leroy

## Overview

**Creative North Star: "La télémétrie"**

Une page sombre comme un tableau de bord de vol. La vidéo du module lunaire qui apprend à se poser ouvre la page, puis rejoint sa place parmi les instruments du projet : tout le reste se lit comme des mesures autour d'elle. Des chiffres en mono, des surfaces calmes, une seule couleur pour agir. L'interface s'efface devant les preuves (vidéos d'entraînement, courbes réelles, chiffres mesurés, projets jouables dans le navigateur) au lieu de les décorer.

La palette vient de la vidéo : le violet du lander pour tout ce qui est interactif, le jaune des drapeaux pour tout ce qui est mesuré. Aucune couleur ne sert deux rôles.

**Key Characteristics:**
- Fond quasi noir teinté de violet, surfaces par paliers tonals ; ombres réservées aux calques flottants.
- Violet réservé à l'action et à la navigation, jaune réservé aux valeurs mesurées, bleu aux courbes de données et aux distinctions.
- Mono (JetBrains Mono) pour la donnée et les libellés, sans-serif (Schibsted Grotesk) pour la lecture.
- Une page en scènes : sur bureau, chaque projet tient dans un écran et la molette avance d'une scène par cran.
- Un langage de mouvement unique (une famille de courbes, trois durées, trois distances), jamais indispensable à la compréhension.
- Contenu en français, WCAG 2.2 AA, fonctionne sans JavaScript.

## Colors

Un espace sombre, un signal violet, une lecture jaune.

### Primary
- **Signal Violet** (#a597ff) : boutons principaux, liens, focus, lien de navigation actif, puces sélectionnées, repère de l'épisode sur les graphiques. Reste rare à l'écran, c'est lui qui dit « ici, on peut agir ».
- **Signal Violet Bright** (#cbc3ff) : survol des boutons principaux et des liens.

### Secondary
- **Readout Yellow** (#ecd24a) : valeurs mesurées uniquement (chiffres clés d'« À propos », `.metrics`, `.stat`, paquets du schéma Zappy). Jamais pour un lien, un bouton ou une étiquette. Exception assumée : le cadre en pointillés du « Stage » à venir sur la frise.

### Tertiary
- **Data Blue** (#4da3ff) : courbes des graphiques d'entraînement (générés avec cette couleur), points des distinctions dans le parcours et sur la frise.
- **Available Green** (#6ee7a8) : le point de disponibilité dans le badge, le repère « aujourd'hui » de la frise.

### Neutral
- **Void** (#09080f) : fond de page, et texte sur boutons violets.
- **Void Deep** (#06050b) : fond des visualisations (graphiques, schéma Arcade, terminal 42sh).
- **Surface** (#100e1b) et **Surface Raised** (#181527) : panneaux et menu flottant, puis blocs imbriqués (métriques, survol des entrées de menu). **Surface Core** (#14112a) : cœur du schéma Arcade.
- **Line** (#1c1a2c), **Line Strong** (#25223a), **Line Tag** (#38345a) : séparateurs, bordures de médias, bordures de pastilles et de puces.
- **Control Edge** (#6f69ad) : bordure des contrôles (bouton fantôme, flèches du carrousel, menu burger) ; 3,66:1 minimum sur les surfaces, au-dessus du seuil de 3:1.
- **Text** (#ece9f6), **Text Soft** (#cfcbe0), **Text Muted** (#aaa6c0) : de 16,67:1 à 8,47:1 sur le fond.

### Reproductions
Les couleurs du prompt de 42sh (rose, cyan, rouge d'erreur) et la barre de fenêtre grise d'Arcade reproduisent les vrais programmes. Elles restent confinées à ces émulations et n'entrent pas dans l'interface.

### Named Rules
**La règle des deux voix.** Violet = j'agis, jaune = j'ai mesuré. Un élément n'emprunte jamais l'autre voix.
**La règle de la teinte.** Les neutres sont tous teintés de violet ; pas de gris pur, sauf dans les reproductions.

## Typography

**Display Font:** Schibsted Grotesk (avec Helvetica Neue, Arial)
**Body Font:** Schibsted Grotesk
**Label/Mono Font:** JetBrains Mono (avec ui-monospace)

**Character:** un sans-serif net pour parler, un mono pour mesurer. Le contraste entre les deux est le seul effet typographique.

### Hierarchy
- **Display** (600, 38–60 px fluide, 1,07) : titre du hero, seul `h1`.
- **Contact** (600, jusqu'à 120 px, suit la largeur et la hauteur de l'écran, 1,04) : titre du contact, qui remplit l'écran.
- **Title** (600, 30–48 px fluide) : titres de projet.
- **Headline** (600, 32–44 px fluide) : titres de section.
- **Body** (400, 15–18 px, 1,5–1,6) : texte courant, légendes en 15 px, mesure autour de 65 caractères.
- **Readout** (mono 500, 24–30 px) : chiffres clés d'« À propos », en jaune ; jusqu'à 72 px pour les statistiques des projets.
- **Label** (mono, 14 px) : lignes de spécification au-dessus des titres de projet, étiquettes de métriques, dates, technologies. Plancher à 14 px, 13 px toléré dans les schémas et les touches d'Arcade où la place manque.

### Named Rules
**La règle du mono.** Le mono sert à la donnée, au code et aux libellés techniques, jamais à la décoration.
**La règle de l'insécable.** Une espace insécable précède « ? », « : » et « % », y compris dans les titres découpés en mots.

## Layout

Une page unique, mobile d'abord, en trois paliers : moins de 720 px, 720 à 1023 px (grilles à deux colonnes), 1024 px et plus. Conteneur de 1680 px, gouttières (16 à 72 px) et rythme vertical fluides.

- **En-tête** fixe : transparent au-dessus du hero, puis verre dépoli (fond Void à 80 %, flou de 16 px) une fois le hero passé.
- **Projets** en scènes : sur bureau, chaque scène est dimensionnée pour tenir dans un écran (titre, médias, schémas, technologies et lien du code). Les médias principaux calculent leur taille depuis la hauteur de l'écran (`100svh` moins le reste de la scène).
- **À propos** et **Stack** forment une seule étape ; **Parcours** et **Contact** occupent chacun au moins un écran.
- Les colonnes gardent leur hauteur propre : pas d'étirement pour égaliser.

## Elevation & Depth

La profondeur vient de l'empilement tonal (void, surface, surface raised) et de bordures d'un pixel. Le survol change une couleur de bordure ou de fond, jamais une ombre.

### Named Rules
**La règle du plat.** Pas d'ombre portée ni de lueur sur la page. Seuls les calques qui flottent au-dessus du contenu en ont une : la visionneuse d'images et le menu du nom.

## Shapes

Des rectangles à coins arrondis modérés : 16 px pour les médias, cartes et panneaux, 12 à 14 px pour les boutons et blocs internes, 10 px pour les puces et les entrées de menu, 7 px pour les pastilles de technologie. Cercles pour la photo de profil, les boutons de carrousel et les points de la frise. Pilule complète pour le badge de disponibilité. Pas de formes géométriques décoratives.

## Components

Sobres et précis : bordures visibles, une seule couleur d'action, pas de décoration.

### Buttons
- **Shape:** 12 px de rayon, 52 px de haut (56 px pour les grands boutons du contact sur bureau).
- **Primary:** fond Signal Violet, texte Void, 16 px à 600 ; survol vers Signal Violet Bright.
- **Ghost:** bordure Control Edge, texte Text ; survol : bordure Signal Violet.
- **Focus:** contour de 3 px Signal Violet, décalé de 3 px.

### Chips (technologies)
- **Style:** transparent, bordure Line Tag, texte Text Soft, mono, rayon 7 px, remplissage 6 × 12 px.

### Navigation
- Texte simple, lien actif marqué en Signal Violet (`aria-current`), bouton « Me contacter » en violet plein. Menu burger sous 1024 px.
- Les liens internes s'arrêtent au même endroit que la molette. Les liens externes et le CV s'ouvrent dans un nouvel onglet, annoncé aux lecteurs d'écran.

### Menu du nom
La photo et le nom, en haut à gauche, forment un bouton avec un chevron. Il ouvre un panneau Surface (bordure Line Tag, rayon 16 px, ombre de calque) : « Mon GitHub » et « Glance », avec leur logo sur une pastille claire (#f4f3fa, logos sombres), puis « Retour en haut » avec une flèche violette. Entrées de 48 px. Le panneau se déploie depuis le nom et ses entrées arrivent en cascade. Il se ferme avec Échap, un clic à côté ou la sortie du focus.

### Carrousel
Flèches rondes de 44 px (bordure Control Edge), points de 44 px de cible (le point actif s'allonge en violet), bouton pause. Quand les points ne tiennent pas, un compteur « 3 / 5 » les remplace. Les vidéos tournent en boucle, sans son, seulement quand elles sont à l'écran.

### Graphiques
Courbes réelles en Data Blue sur Void Deep. La partie déjà parcourue est nette, le reste estompé, avec un repère violet à l'épisode montré par la vidéo.

### Readout (composant signature)
Un chiffre ou un mot mono jaune avec une ligne de contexte en Text Muted dessous : « 1re place », « Vainqueur », « Finaliste », « 80+ projets » dans « À propos », et les métriques des projets.

### Émulations jouables
- **Terminal 42sh :** fenêtre Void Deep, flouté sous un bouton « Essayez par vous-même » tant que le visiteur ne l'a pas lancé.
- **Arcade :** sur ordinateur, la vidéo est floutée sous « Jouer à Arcade » et le jeu prend sa place dans la même boîte. Sur téléphone et tablette, la vidéo reste seule. Le schéma (puces jeu × affichage) pilote l'émulation.

### Parcours
Trois colonnes à points : cercles violets pour l'expérience et la formation, points Data Blue pleins pour les distinctions. Dessous, la frise 2023 → 2027 : couloirs Formation, Expériences et Distinctions, stage à venir en pointillés jaunes, repère « aujourd'hui » vert placé à la date du jour.

## Motion

Une famille de courbes (`ease-out` pour les entrées, `ease-in-out` pour les tracés), trois durées (180, 420 et 800 ms), trois distances (12, 24 et 80 px, 32 px sur mobile). Chaque scène varie la direction ou la matière (glissement, fondu, `clip-path`, flou, tracé), jamais ces valeurs.

- **Entrées de partie :** jouées dans le temps à l'arrivée à l'écran, rejouées à chaque passage, inversées quand on remonte.
- **Liés au défilement**, deux exceptions assumées : la séquence du hero (la vidéo se pose à sa place dans le carrousel) et le contact, qui arrive flou et devient net quand il remplit l'écran.
- **Molette :** sur bureau, un cran amène en douceur à la partie suivante. Les zones qui défilent elles-mêmes, Ctrl + molette et le mouvement réduit gardent le défilement natif.
- **Mouvement réduit :** tout est affiché d'emblée, sans déplacement ni tracé ; les vidéos ne démarrent pas seules.

### Named Rules
**La règle du sens.** Aucune animation n'est nécessaire pour comprendre un contenu : sans elle, la page dit la même chose.

## Do's and Don'ts

### Do:
- **Do** réserver le violet (#a597ff) à l'action et le jaune (#ecd24a) à la mesure.
- **Do** laisser les vidéos, les courbes réelles et les projets jouables porter chaque projet.
- **Do** faire tenir chaque scène de projet dans un écran de bureau, médias dimensionnés sur la hauteur.
- **Do** garder un contraste d'au moins 4,5:1 pour le texte et 3:1 pour les bordures de contrôle, et des cibles de 44 px.
- **Do** respecter `prefers-reduced-motion` partout.
- **Do** teinter tous les neutres de violet.

### Don't:
- **Don't** ajouter d'ombre portée ou de lueur en dehors des calques flottants.
- **Don't** utiliser un kicker ou un numéro de section au-dessus d'un titre.
- **Don't** utiliser le mono en décoration ou sous 14 px (hors schémas et touches d'Arcade).
- **Don't** imbriquer des cartes dans des cartes au-delà des blocs de métriques déjà présents.
- **Don't** inventer de chiffres, de témoignages ou de projets : le contenu reste factuel.
