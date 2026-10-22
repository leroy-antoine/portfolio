---
name: Portfolio Antoine Leroy
description: Un tableau de bord de vol sombre où les mesures réelles (vidéos, courbes, chiffres) portent la démonstration.
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
typography:
  display:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(38px, calc(38px + 22 * (100vw - 390px) / 890), 60px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(32px, calc(32px + 12 * (100vw - 390px) / 890), 44px)"
    fontWeight: 600
  body:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  readout:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.2
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
rounded:
  chip: "7px"
  control: "12px"
  card: "18px"
  card-large: "24px"
spacing:
  gutter: "clamp(16px, calc(16px + 104 * (100vw - 390px) / 634), 120px)"
  section: "clamp(56px, calc(56px + 56 * (100vw - 390px) / 634), 112px)"
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
    padding: "5px 10px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "20px"
---

# Design System: Portfolio Antoine Leroy

## Overview

**Creative North Star: "La télémétrie"**

Une page sombre comme un tableau de bord de vol. La vidéo du module lunaire qui apprend à se poser est l'objet central, et tout le reste se lit comme des instruments autour d'elle : des mesures en mono, des surfaces calmes, une seule couleur pour agir. L'interface s'efface devant les preuves (vidéos d'entraînement, courbes de crash, chiffres) au lieu de les décorer.

La palette vient de la vidéo : le violet du lander pour tout ce qui est interactif, le jaune des drapeaux pour tout ce qui est mesuré. Aucune couleur ne sert deux rôles.

**Key Characteristics:**
- Fond quasi noir teinté de violet, surfaces par paliers tonals, sans ombres.
- Violet réservé à l'action et à la navigation, jaune réservé aux valeurs mesurées.
- Mono (JetBrains Mono) pour la donnée et les libellés, sans-serif (Schibsted Grotesk) pour la lecture.
- Un seul geste de mouvement : le graphique de crash qui se révèle de gauche à droite.
- Contenu en français, WCAG 2.2 AA, fonctionne sans JavaScript.

## Colors

Un espace sombre, un signal violet, une lecture jaune.

### Primary
- **Signal Violet** (#a597ff) : boutons principaux, liens, focus, onglet actif, lien de navigation actif. Reste rare à l'écran, c'est lui qui dit « ici, on peut agir ».
- **Signal Violet Bright** (#cbc3ff) : survol des boutons principaux et des liens.

### Secondary
- **Readout Yellow** (#ecd24a) : valeurs mesurées uniquement (chiffres clés du hero, `.metrics`, `.stat`). Jamais pour un lien, un bouton ou une étiquette.

### Tertiary
- **Available Green** (#6ee7a8) : le point de disponibilité dans le badge.

### Neutral
- **Void** (#09080f) : fond de page, et texte sur boutons violets.
- **Void Deep** (#06050b) : fond des visualisations (schéma Arcade, terminal 42sh).
- **Surface** (#100e1b) et **Surface Raised** (#181527) : cartes, puis blocs imbriqués (métriques, parties de Zappy). **Surface Core** (#14112a) : cœur du schéma Arcade.
- **Line** (#1c1a2c), **Line Strong** (#25223a), **Line Tag** (#38345a) : séparateurs et bordures de pastilles.
- **Control Edge** (#6f69ad) : bordure des contrôles (bouton fantôme, onglets, menu) ; 3,66:1 minimum sur les surfaces, au-dessus du seuil de 3:1.
- **Text** (#ece9f6), **Text Soft** (#cfcbe0), **Text Muted** (#aaa6c0) : de 16,67:1 à 8,47:1 sur le fond.

### Named Rules
**La règle des deux voix.** Violet = j'agis, jaune = j'ai mesuré. Un élément n'emprunte jamais l'autre voix.
**La règle de la teinte.** Les neutres sont tous teintés de violet ; pas de gris pur.

## Typography

**Display Font:** Schibsted Grotesk (avec Helvetica Neue, Arial)
**Body Font:** Schibsted Grotesk
**Label/Mono Font:** JetBrains Mono (avec ui-monospace)

**Character:** un sans-serif net pour parler, un mono pour mesurer. Le contraste entre les deux est le seul effet typographique.

### Hierarchy
- **Display** (600, 38–60 px fluide, 1,07) : titre du hero.
- **Headline** (600, 32–44 px fluide) : titres de section.
- **Title** (600, 19–24 px) : titres de projet.
- **Body** (400, 16–20 px, 1,6) : texte courant, mesure autour de 65 caractères.
- **Readout** (mono 500, 28 px mobile, 36 px bureau) : chiffres clés du hero, en jaune.
- **Label** (mono, 14 px) : lignes de spécification sous les titres de projet, étiquettes de métriques, dates. Plancher à 14 px, 12 px toléré dans le schéma Arcade où la place manque.

### Named Rules
**La règle du mono.** Le mono sert à la donnée, au code et aux libellés techniques, jamais à la décoration.

## Layout

Une page unique, mobile d'abord, en trois paliers : moins de 720 px, 720 à 1023 px (grilles à deux colonnes), 1024 px et plus (en-tête collant). Conteneur de 1200 px, gouttières et rythme vertical fluides entre 390 px et environ 1024 px. Le hero est une grille de deux colonnes (texte, vidéo) sur bureau, suivie d'une bande de trois chiffres clés séparée par des filets. Les petites cartes de projet se placent sur deux colonnes et gardent leur hauteur propre : pas d'étirement pour égaliser.

## Elevation & Depth

Aucune ombre. La profondeur vient de l'empilement tonal (void, surface, surface raised) et de bordures d'un pixel. Un seul état de relief existe : le changement de couleur de bordure ou de fond au survol.

### Named Rules
**La règle du plat.** Pas d'ombre portée, pas de lueur. Un nouvel élément gagne sa place par un palier de surface ou un filet.

## Shapes

Des rectangles à coins arrondis modérés : 18 à 24 px pour les cartes, 12 px pour les boutons et onglets, 7 px pour les pastilles de technologie, pilule complète pour le badge de disponibilité. Les médias gardent les mêmes rayons que leur carte moins le remplissage (10 à 20 px). Pas de formes géométriques décoratives.

## Components

Sobres et précis : bordures visibles, une seule couleur d'action, pas de décoration.

### Buttons
- **Shape:** 12 px de rayon, 52 px de haut (48 px en petit).
- **Primary:** fond Signal Violet, texte Void, 16 px à 600 ; survol vers Signal Violet Bright.
- **Ghost:** bordure Control Edge, texte Text ; survol : bordure Signal Violet.
- **Focus:** contour de 3 px Signal Violet, décalé de 3 px.

### Chips
- **Style:** transparent, bordure Line Tag, texte Text Soft, mono 14 px, rayon 7 px, remplissage 5 × 10 px.

### Cards / Containers
- **Corner Style:** 18 px, 24 px pour les cartes phares.
- **Background:** Surface ; blocs imbriqués en Surface Raised.
- **Border:** 1 px Line Strong.
- **Internal Padding:** 20 px mobile, jusqu'à 40 px pour les cartes phares.

### Navigation
Texte simple, lien actif marqué en Signal Violet (`aria-current`), bouton « Me contacter » en violet plein. Menu burger sous 1024 px, en-tête collant au-dessus.

### Onglets Lunar Lander
Boutons à bordure Control Edge, 44 px de haut ; l'onglet actif prend le fond Signal Violet. Le changement de panneau se fait par un fondu de 0,35 s.

### Readout (composant signature)
Un chiffre mono jaune avec une ligne de contexte en Text Muted dessous : « 1re place », « Vainqueur », « 80+ projets » dans le hero, et les métriques de la carte Lunar Lander.

## Do's and Don'ts

### Do:
- **Do** réserver le violet (#a597ff) à l'action et le jaune (#ecd24a) à la mesure.
- **Do** laisser les vidéos et les courbes réelles porter chaque projet.
- **Do** garder un contraste d'au moins 4,5:1 pour le texte et 3:1 pour les bordures de contrôle.
- **Do** respecter `prefers-reduced-motion` : le graphique est alors entièrement visible, sans tracé.
- **Do** teinter tous les neutres de violet.

### Don't:
- **Don't** ajouter d'ombre portée ou de lueur.
- **Don't** utiliser un kicker ou un numéro de section au-dessus d'un titre.
- **Don't** utiliser le mono en décoration ou sous 14 px (hors schéma Arcade).
- **Don't** imbriquer des cartes dans des cartes au-delà des blocs de métriques et de parties déjà présents.
- **Don't** inventer de chiffres, de témoignages ou de projets : le contenu reste factuel.
