'use strict';

/* ==========================================================================
   1. Menu burger (mobile / intermédiaire)
   ========================================================================== */
(function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  if (!toggle || !menu) return;

  const desktop = window.matchMedia('(min-width: 1024px)');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Échap ferme le menu et rend le focus au bouton.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Un clic sur un lien du menu referme le menu.
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Le passage en affichage bureau réinitialise l'état.
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
})();

/* ==========================================================================
   2. Onglets Lunar Lander
   ========================================================================== */
(function initAlgoTabs() {
  const tabsEl = document.getElementById('rl-tabs');
  const panel = document.getElementById('rl-panel');
  const status = document.getElementById('rl-status');
  if (!tabsEl || !panel) return;

  const VIDEO_SIZE = { width: 600, height: 400 };

  const algos = [
    {
      id: 'q',
      label: 'Q-Learning',
      episodes: '50\u00a0000+ épisodes',
      result: 'Récompense moy. +60 à +80',
      videos: [
        {
          src: 'assets/q-learning-best.mp4',
          aria: 'Vidéo sans son : meilleur épisode du Q-Learning discrétisé, l’agent approche de la zone d’atterrissage sans l’atteindre',
        },
      ],
      videoCaption: 'Q-Learning discrétisé : l’agent approche l’objectif (+200) sans l’atteindre, limite de la discrétisation.',
      graph: {
        src: 'assets/q-learning-training.png',
        width: 640,
        height: 480,
        title: 'performance d’entraînement Q-Learning',
        alt: 'Courbe de récompense moyenne sur les 100 derniers épisodes, sur 50 000 épisodes : elle oscille sans converger, le plus souvent entre 40 et 100, avec un creux à environ -30 vers l’épisode 21 000.',
      },
      graphCaption: 'Courbe d’entraînement étendue (50 000 épisodes).',
    },
    {
      id: 'dql',
      label: 'Deep Q-Learning',
      episodes: '14\u00a0000 épisodes',
      result: 'Résolu, moy. ~270',
      videos: [
        {
          src: 'assets/dql-ep9500.mp4',
          aria: 'Vidéo sans son : épisode 9 500 de l’évaluation du Deep Q-Learning sur Lunar Lander',
        },
      ],
      videoCaption: 'Deep Q-Learning : un réseau de neurones remplace la table Q et converge en une seule session.',
      graph: {
        src: 'assets/dql-training.png',
        width: 640,
        height: 480,
        title: 'performance d’entraînement DQL',
        alt: 'Courbe de récompense moyenne sur 14 000 épisodes : de -200 au départ, elle franchit 0 vers l’épisode 2 000, puis se stabilise entre 250 et 280 à partir de l’épisode 4 500.',
      },
      graphCaption: 'Récompense moyenne par épisode : le seuil de résolution (+200) est dépassé dès ~3 000 épisodes.',
    },
    {
      id: 'ppo',
      label: 'PPO + vent',
      episodes: '~950 épisodes',
      result: 'Crashs ~75\u00a0% → ~30\u00a0%',
      videos: [
        {
          src: 'assets/ppo-ep250.mp4',
          poster: 'assets/ppo-ep250-poster.jpg',
          label: 'Épisode 250',
          aria: 'Vidéo sans son : épisode 250, l’agent PPO encore hésitant descend vers la zone d’atterrissage',
        },
        {
          src: 'assets/ppo-ep700.mp4',
          poster: 'assets/ppo-ep700-poster.jpg',
          label: 'Épisode 700',
          aria: 'Vidéo sans son : épisode 700, l’agent PPO se stabilise et vise la zone entre les drapeaux',
        },
      ],
      videoCaption: 'PPO sur la variante avec vent : de l’épisode 250 à 700, la politique devient robuste aux perturbations.',
      graph: {
        src: 'assets/ppo-crash-rate.png',
        width: 960,
        height: 720,
        title: 'taux de crash PPO',
        alt: 'Courbe du taux de crash sur environ 950 épisodes : pic à 75 % au départ, chute vers 35 à 45 %, minimum de 18 % vers l’épisode 300, puis environ 32 % en fin d’entraînement.',
      },
      graphCaption: 'Taux de crash (moyenne glissante) au fil de l’entraînement PPO avec vent.',
    },
  ];

  const DEFAULT_ID = 'ppo';

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function videoHtml(video, pair) {
    const poster = video.poster ? ` poster="${escapeHtml(video.poster)}"` : '';
    const tag =
      `<video class="video${pair ? ' video--sm' : ''}" src="${escapeHtml(video.src)}"${poster}` +
      ` width="${VIDEO_SIZE.width}" height="${VIDEO_SIZE.height}" controls preload="metadata" playsinline` +
      ` aria-label="${escapeHtml(video.aria)}"></video>`;
    if (!pair) return tag;
    return `<div class="video-item">${tag}<span class="video-item__label">${escapeHtml(video.label)}</span></div>`;
  }

  function panelHtml(algo) {
    const pair = algo.videos.length > 1;
    const { graph } = algo;
    return `
      <figure class="rl-media">
        <div class="video-grid${pair ? '' : ' video-grid--single'}">${algo.videos.map((v) => videoHtml(v, pair)).join('')}</div>
        <figcaption>${escapeHtml(algo.videoCaption)}</figcaption>
      </figure>
      <div class="rl-side">
        <figure class="rl-graph">
          <a class="thumb thumb--graph" href="${escapeHtml(graph.src)}" aria-label="Agrandir le graphique : ${escapeHtml(graph.title)}">
            <img src="${escapeHtml(graph.src)}" width="${graph.width}" height="${graph.height}" loading="lazy" decoding="async" alt="${escapeHtml(graph.alt)}">
          </a>
          <figcaption>${escapeHtml(algo.graphCaption)}</figcaption>
        </figure>
        <dl class="metrics">
          <div><dt>Entraînement</dt><dd>${escapeHtml(algo.episodes)}</dd></div>
          <div><dt>Résultat</dt><dd>${escapeHtml(algo.result)}</dd></div>
        </dl>
      </div>`;
  }

  const buttons = new Map();

  function select(id, announce) {
    const algo = algos.find((a) => a.id === id);
    if (!algo) return;
    buttons.forEach((button, key) => button.setAttribute('aria-pressed', String(key === id)));
    panel.innerHTML = panelHtml(algo);
    if (announce && status) {
      status.textContent = `${algo.label} : vidéo, graphique et chiffres mis à jour.`;
    }
  }

  algos.forEach((algo) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab';
    button.textContent = algo.label;
    button.setAttribute('aria-pressed', String(algo.id === DEFAULT_ID));
    button.addEventListener('click', () => select(algo.id, true));
    buttons.set(algo.id, button);
    tabsEl.appendChild(button);
  });

  // Le HTML statique contient déjà l'onglet par défaut (PPO) : pas de nouveau rendu au chargement.
  tabsEl.hidden = false;
})();
