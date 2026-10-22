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
   2. Carrousel réutilisable : [data-carousel] (voir le commentaire dans index.html)
   Défilement natif (scroll-snap, balayage tactile), boutons précédent / suivant,
   points, flèches du clavier. Seule la vidéo de la diapositive visible peut jouer.
   Émet « carousel:change » (detail : index, slide) à chaque changement.
   ========================================================================== */
function initCarousel(root) {
  const track = root.querySelector('.carousel__track');
  const slides = [...track.querySelectorAll(':scope > .slide')];
  const controls = root.querySelector('.carousel__controls');
  if (slides.length < 2 || !controls) return;
  const prev = root.querySelector('.carousel__prev');
  const next = root.querySelector('.carousel__next');
  const dotsEl = root.querySelector('.carousel__dots');
  const status = root.querySelector('.carousel__status');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = slides.length;
  const name = (slide) => (slide.dataset.label ? ` : ${slide.dataset.label}` : '');
  let current = -1;

  root.setAttribute('role', 'region');
  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositive');
    slide.setAttribute('aria-label', `${i + 1} sur ${total}${name(slide)}`);
  });
  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Afficher la vidéo ${i + 1} sur ${total}${name(slide)}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
    return dot;
  });
  controls.hidden = false;
  root.classList.add('is-ready');

  const step = () => (slides[1].offsetLeft - slides[0].offsetLeft) || track.clientWidth;

  function select(index, announce) {
    if (index === current) return;
    current = index;
    dots.forEach((dot, i) => dot.toggleAttribute('aria-current', i === index));
    slides.forEach((slide, i) => slide.querySelectorAll('video').forEach((video) => {
      if (i === index) delete video.dataset.inactive;
      else video.dataset.inactive = '';
    }));
    if (window.videoManager) window.videoManager.refresh();
    if (announce && status) status.textContent = `Vidéo ${index + 1} sur ${total}${name(slides[index])}`;
    root.dispatchEvent(new CustomEvent('carousel:change', { detail: { index, slide: slides[index], announce } }));
  }

  // Déplacement demandé (bouton, point, clavier) : on ignore les positions intermédiaires du
  // défilement doux, sinon la sélection repasserait par les diapositives traversées.
  let target = null;
  let targetTimer = 0;
  const releaseTarget = () => { target = null; clearTimeout(targetTimer); };

  // Circulaire : après la dernière vidéo vient la première, et inversement.
  const wrap = (index) => ((index % total) + total) % total;

  function goTo(index) {
    const i = wrap(index);
    target = i;
    clearTimeout(targetTimer);
    targetTimer = setTimeout(releaseTarget, 1200);
    track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' });
    select(i, true);
  }

  // Balayage ou défilement libre : la diapositive courante suit la position de la piste.
  let queued = false;
  const indexFromScroll = () => Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / step())));
  track.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (target !== null) {
        if (indexFromScroll() === target && Math.abs(track.scrollLeft - (slides[target].offsetLeft - slides[0].offsetLeft)) < 2) releaseTarget();
        return;
      }
      select(indexFromScroll(), true);
    });
  }, { passive: true });
  track.addEventListener('scrollend', () => {
    if (target !== null) releaseTarget();
    select(indexFromScroll(), true);
  });

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  root.addEventListener('keydown', (event) => {
    const keys = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: total - 1 };
    if (!(event.key in keys) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    goTo(keys[event.key]);
    // Le focus reste sur un point, aligné sur la diapositive affichée.
    if (event.target.classList.contains('carousel__dot')) dots[wrap(keys[event.key])].focus();
  });

  select(0, false);
}

/* Lunar Lander : la colonne de droite (graphique et chiffres) suit le carrousel.
   Les contenus de toutes les diapositives sont superposés dans la même cellule : la colonne
   garde la hauteur du plus grand et ne pousse jamais la suite de la page (pas de CLS).
   Deux diapositives qui montrent le même graphique partagent un calque : sur les diapositives PPO,
   la limite « tracé jusqu'à l'épisode » glisse de 250 à 700 au lieu de changer d'image. */
(function initLunarLander() {
  const carousel = document.querySelector('#rl-panel [data-carousel]');
  const side = document.getElementById('rl-side');
  if (!carousel || !side) return;

  const layers = new Map(); // clé du graphique -> calque
  const perSlide = [];      // pour chaque diapositive : { layer, fragment }
  side.replaceChildren();
  side.classList.add('rl-side--layers');
  carousel.querySelectorAll(':scope .slide').forEach((slide) => {
    const template = slide.querySelector('template.slide__side');
    const fragment = template ? template.content.cloneNode(true) : document.createDocumentFragment();
    const graph = fragment.querySelector('.thumb--graph');
    const key = graph ? graph.getAttribute('href') : `vide-${perSlide.length}`;
    if (!layers.has(key)) {
      const layer = document.createElement('div');
      layer.className = 'rl-side__layer';
      layer.append(fragment.cloneNode(true));
      side.append(layer);
      layers.set(key, layer);
    }
    perSlide.push({ layer: layers.get(key), fragment });
  });

  carousel.addEventListener('carousel:change', ({ detail }) => {
    const { layer, fragment } = perSlide[detail.index];
    // Texte et chiffres propres à la diapositive (le graphique, lui, reste en place).
    const upto = fragment.querySelector('.graph-upto');
    if (upto) layer.querySelector('.graph-upto').style.setProperty('--upto', upto.style.getPropertyValue('--upto'));
    const caption = fragment.querySelector('.rl-graph figcaption');
    if (caption) layer.querySelector('.rl-graph figcaption').textContent = caption.textContent;
    const metrics = fragment.querySelector('.metrics');
    if (metrics) layer.querySelector('.metrics').replaceWith(metrics.cloneNode(true));
    const changed = layer.getAttribute('aria-hidden') !== 'false';
    layers.forEach((other) => {
      const current = other === layer;
      other.toggleAttribute('inert', !current);
      other.setAttribute('aria-hidden', String(!current));
    });
    if (changed && window.graphReveal) window.graphReveal.replay(layer.querySelector('.thumb--graph'));
  });

  initCarousel(carousel);
})();

/* ==========================================================================
   3. Séquences au scroll
   Une section [data-seq] contient une piste haute et une scène collante. La progression
   p (0 → 1) se calcule sur la piste ; chaque séquence la traduit en variables CSS.
   Désactivé (affichage statique) en mouvement réduit, en économie de données
   ou sous 360 px de large.
   ========================================================================== */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
/** Progression locale de p entre a et b, ramenée à 0 → 1. */
const range = (p, a, b) => clamp01((p - a) / (b - a));
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const motion = (() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 359px)');
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const listeners = new Set();
  const allowed = () => !reduce.matches && !narrow.matches && !saveData;
  /** Lecture automatique des vidéos : seulement sans mouvement réduit ni économie de données. */
  const autoplay = () => !reduce.matches && !saveData;
  const notify = () => {
    document.documentElement.classList.toggle('seq-on', allowed());
    listeners.forEach((fn) => fn(allowed()));
  };
  reduce.addEventListener('change', notify);
  narrow.addEventListener('change', notify);
  document.documentElement.classList.toggle('seq-on', allowed());
  return { allowed, autoplay, onChange: (fn) => listeners.add(fn) };
})();

const sequences = (() => {
  const items = [];
  let queued = false;
  let viewport = window.innerHeight;

  function update() {
    queued = false;
    items.forEach((item) => {
      const rect = item.track.getBoundingClientRect();
      // scene : p va de 0 (haut de la scène au bas de l'écran) à 1 (bas de la scène au bas de l'écran) ;
      // sur bureau la scène est épinglée pendant une partie de ce trajet.
      // Sinon : piste épinglée du héro (0 = début de l'épinglage, 1 = fin).
      const p = item.scene
        ? (viewport - rect.top) / Math.max(1, rect.height)
        : -rect.top / Math.max(1, item.track.offsetHeight - viewport);
      item.render(clamp01(p), rect);
    });
  }
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => {
    viewport = window.innerHeight;
    items.forEach((item) => item.resize && item.resize());
    queue();
  });
  motion.onChange(() => {
    items.forEach((item) => item.resize && item.resize());
    queue();
  });

  return {
    add(item) {
      items.push(item);
      if (item.resize) item.resize();
      queue();
    },
    refresh: queue,
  };
})();

/* ==========================================================================
   Vidéos : un seul gestionnaire pour toute la page
   - video[data-autoplay] : vidéo d'ambiance, muette, en boucle.
   - [data-video-group] : groupe de vidéos qui partagent un bouton .video-toggle.
     Avec data-video-observe, la visibilité se mesure sur le groupe (héro épinglé)
     plutôt que sur chaque vidéo.
   Une vidéo joue si au moins 50 % de sa zone est visible, si son groupe n'est pas
   en pause et si elle est active (pas data-inactive, utile au carrousel).
   Deux vidéos au plus jouent en même temps : les plus visibles.
   Mouvement réduit ou économie de données : rien ne démarre seul, le bouton lance la lecture.
   ========================================================================== */
const videoManager = (() => {
  const MAX_PLAYING = 2;
  const entries = new Map(); // video -> { group, target, ratio, expected }
  const groups = new Map();  // élément -> { videos, toggle, userPaused }
  const supported = 'IntersectionObserver' in window;
  let queued = false;

  const visibility = supported && new IntersectionObserver((list) => {
    list.forEach((e) => entries.forEach((entry) => {
      if (entry.target === e.target) entry.ratio = e.intersectionRatio;
    }));
    refresh();
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

  // Préchargement complet seulement à l'approche de l'écran.
  const nearby = supported && new IntersectionObserver((list) => {
    list.forEach((e) => {
      if (!e.isIntersecting || !motion.autoplay()) return; // économie de données : on reste sur « metadata »
      entries.forEach((entry, video) => {
        if (entry.target === e.target && video.preload !== 'auto') video.preload = 'auto';
      });
      nearby.unobserve(e.target);
    });
  }, { rootMargin: '100% 0px' });

  function syncToggle(group) {
    if (!group.toggle) return;
    const paused = group.videos.every((v) => v.paused);
    const many = group.videos.length > 1;
    group.toggle.classList.toggle('is-paused', paused);
    group.toggle.setAttribute('aria-label', paused
      ? (many ? 'Lire les vidéos' : 'Lire la vidéo')
      : (many ? 'Mettre les vidéos en pause' : 'Mettre la vidéo en pause'));
  }

  function setPlaying(video, entry, play) {
    if (play && video.paused) {
      entry.expected = 'play';
      const promise = video.play();
      if (promise && promise.catch) promise.catch(() => { entry.expected = 'pause'; syncToggle(entry.group); });
    } else if (!play && !video.paused) {
      entry.expected = 'pause';
      video.pause();
    }
  }

  function update() {
    queued = false;
    const candidates = [];
    entries.forEach((entry, video) => {
      const active = video.dataset.inactive === undefined && video.isConnected;
      if (active && !entry.group.userPaused && entry.ratio >= 0.5) candidates.push([video, entry]);
    });
    candidates.sort((a, b) => b[1].ratio - a[1].ratio);
    const chosen = new Set(candidates.slice(0, MAX_PLAYING).map(([v]) => v));
    entries.forEach((entry, video) => setPlaying(video, entry, chosen.has(video)));
  }
  function refresh() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }

  function groupFor(video) {
    const el = video.closest('[data-video-group]') || video;
    if (!groups.has(el)) {
      const toggle = el.querySelector ? el.querySelector('.video-toggle') : null;
      const group = { el, videos: [], toggle, userPaused: !motion.autoplay() };
      if (toggle) {
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
          group.userPaused = group.videos.some((v) => !v.paused);
          // Lecture demandée hors écran (mouvement réduit) : on lance quand même la vidéo visible.
          if (!group.userPaused) group.videos.forEach((v) => { const e = entries.get(v); if (e && e.ratio < 0.5) e.ratio = 0.5; });
          refresh();
        });
      }
      groups.set(el, group);
    }
    return groups.get(el);
  }

  function add(video) {
    if (entries.has(video)) return;
    const group = groupFor(video);
    group.videos.push(video);
    const target = group.el.hasAttribute && group.el.hasAttribute('data-video-observe') ? group.el : video;
    const entry = { group, target, ratio: supported ? 0 : 1, expected: 'pause' };
    entries.set(video, entry);
    // Pause ou lecture faites par l'utilisateur avec les contrôles natifs : on respecte son choix.
    video.addEventListener('pause', () => {
      if (entry.expected !== 'pause') group.userPaused = true;
      entry.expected = 'pause';
      syncToggle(group);
    });
    video.addEventListener('play', () => {
      if (entry.expected !== 'play') group.userPaused = false;
      entry.expected = 'play';
      syncToggle(group);
    });
    if (supported) {
      visibility.observe(target);
      nearby.observe(target);
    }
    syncToggle(group);
  }

  function scan(root = document) {
    root.querySelectorAll('video[data-autoplay]').forEach(add);
    // Vidéos retirées du DOM (panneau recréé) : on les oublie.
    entries.forEach((entry, video) => {
      if (video.isConnected) return;
      entries.delete(video);
      entry.group.videos = entry.group.videos.filter((v) => v !== video);
      if (!entry.group.videos.length) groups.delete(entry.group.el);
    });
    refresh();
  }

  motion.onChange(() => {
    if (!motion.autoplay()) groups.forEach((g) => { g.userPaused = true; });
    refresh();
  });

  scan();
  return { scan, refresh };
})();
window.videoManager = videoManager;

/* ==========================================================================
   4. Héro : mise au point du titre vers la vidéo
   0 → 0,1     titre net sur la vidéo floutée
   0,1 → 0,55  le titre se floute et s'efface, la vidéo devient nette
   0,55 → 0,85 la vidéo se pose dans son cadre, la légende apparaît
   0,85 → 1    tenue, puis la scène se libère
   ========================================================================== */
(function initHero() {
  const section = document.querySelector('[data-seq="hero"]');
  if (!section) return;
  const track = section.querySelector('.hero-seq__track');
  const stage = section.querySelector('.hero-seq__stage');
  const caption = section.querySelector('.hero-seq__caption');
  const toggle = section.querySelector('.hero-seq__toggle');
  const header = document.querySelector('.site-header');

  /* Cadre final : la vidéo en 3:2, la plus grande possible entre l'en-tête et la légende.
     Départ : la même boîte agrandie pour couvrir l'écran, calée sur le sol (le ciel déborde en haut). */
  const RATIO = 1.5;
  const RADIUS = 20; // rayon du cadre (styles.css)
  const GAP = 16;    // écart entre le cadre et la légende
  const CAP_BOTTOM = 20;   // marge basse de la légende et du bouton (styles.css)
  const TOGGLE_INSET = 12; // retrait du bouton dans le coin du cadre
  let geo = { start: 1, end: 1, yStart: 0, yEnd: 0, capShift: 0, capX: 0, toggleX: 0, toggleY: 0 };
  function frameFor(vw, vh, top, gutter, capH) {
    const h = Math.min((vw - 2 * gutter) / RATIO, vh - top - CAP_BOTTOM - capH - GAP);
    return { w: h * RATIO, h };
  }
  function resize() {
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const top = (header ? header.offsetHeight : 64) + 12;
    const gutter = parseFloat(getComputedStyle(caption).left) || 16;
    // La légende prend la largeur du cadre, et sa hauteur dépend de cette largeur : deux passes suffisent.
    let frame = frameFor(vw, vh, top, gutter, caption.offsetHeight);
    for (let i = 0; i < 2; i++) {
      stage.style.setProperty('--cap-w', `${frame.w.toFixed(1)}px`);
      frame = frameFor(vw, vh, top, gutter, caption.offsetHeight);
    }
    const { w, h } = frame;
    const capH = caption.offsetHeight;
    stage.style.setProperty('--cap-w', `${w.toFixed(1)}px`);
    // Échelles relatives à la boîte CSS (toute la largeur, 3:2).
    const baseW = vw;
    const baseH = vw / RATIO;
    const end = w / baseW;
    // Départ : couvre l'écran avec une marge, pour que les coins arrondis restent hors champ.
    const radiusAtStart = (RADIUS / end) * Math.max(1, vh / baseH); // rayon à l'écran au départ
    const margin = radiusAtStart * 1.2 + 4;
    const start = Math.max((vw + 2 * margin) / baseW, (vh + 2 * margin) / baseH);
    // Fin : cadre et légende centrés ensemble entre l'en-tête et le bas de l'écran.
    const group = h + GAP + capH;
    const free = vh - top - CAP_BOTTOM - group;
    const frameTop = top + Math.max(0, free / 2);
    const frameLeft = (vw - w) / 2;
    const tb = toggle.getBoundingClientRect();
    geo = {
      start,
      end,
      yStart: vh + margin - (start * baseH) / 2 - vh / 2, // bas de la vidéo agrandie sous le bas de l'écran
      yEnd: frameTop + h / 2 - vh / 2,
      capShift: -Math.max(0, free / 2),                  // la légende remonte sous le cadre
      capX: Math.max(0, frameLeft - gutter),             // et s'aligne sur son bord gauche
      // Le bouton pause rejoint le coin inférieur droit du cadre, comme une commande de lecteur.
      toggleX: frameLeft + w - TOGGLE_INSET - (vw - gutter),
      toggleY: frameTop + h - TOGGLE_INSET - (vh - CAP_BOTTOM),
    };
    if (!tb.width) geo.toggleX = geo.toggleY = 0;
    written.clear();
    // Rayon dans le repère de la boîte : il apparaît à RADIUS px une fois réduite à l'échelle finale.
    stage.style.setProperty('--media-r', `${(RADIUS / end).toFixed(2)}px`);
    sequences.refresh();
  }

  // N'écrit une variable que si sa valeur change : pas de recalcul de style inutile.
  const written = new Map();
  const set = (name, value) => {
    if (written.get(name) === value) return;
    written.set(name, value);
    stage.style.setProperty(name, value);
  };

  function render(p, rect) {
    if (header) header.classList.toggle('is-solid', rect.bottom <= header.offsetHeight + 1);
    if (!motion.allowed()) {
      if (written.size) {
        stage.removeAttribute('style');
        written.clear();
      }
      return;
    }

    const out = easeInOut(range(p, 0.04, 0.32));  // le titre sort
    const focus = easeOut(range(p, 0.12, 0.56));   // la vidéo devient nette
    const land = easeInOut(range(p, 0.54, 0.8));   // la vidéo se pose
    const cap = easeOut(range(p, 0.76, 0.92));

    set('--cue-o', (1 - range(p, 0, 0.05)).toFixed(3));
    set('--title-o', (1 - out).toFixed(3));
    set('--title-y', `${(-40 * out).toFixed(1)}px`);
    set('--title-s', (1 + 0.06 * out).toFixed(4));
    set('--title-blur', `${(8 * out).toFixed(2)}px`);

    const blur = 1 - focus;
    set('--blur', `${(28 * blur).toFixed(2)}px`);
    set('--video-s', (1 + 0.06 * blur).toFixed(4));   // cache le liseré sombre du flou sur les bords
    set('--veil', (1 - 0.8 * focus).toFixed(3));

    set('--media-s', (geo.start + (geo.end - geo.start) * land).toFixed(4));
    set('--media-y', `${(geo.yStart + (geo.yEnd - geo.yStart) * land).toFixed(1)}px`);

    set('--cap-o', cap.toFixed(3));
    set('--cap-shift', `${geo.capShift.toFixed(1)}px`);
    set('--cap-x', `${geo.capX.toFixed(1)}px`);
    set('--cap-y', `${(16 * (1 - cap)).toFixed(1)}px`);
    caption.classList.toggle('is-hidden', cap < 0.05);
    set('--toggle-x', `${(geo.toggleX * land).toFixed(1)}px`);
    set('--toggle-y', `${(geo.toggleY * land).toFixed(1)}px`);
  }

  sequences.add({ track, render, resize });
})();

/* ==========================================================================
   Navigation : section visible marquée avec aria-current
   ========================================================================== */
(function initScrollSpy() {
  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      map.get(entry.target.id).setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => observer.observe(s));
})();

/* ==========================================================================
   Animations d'apparition : [data-anim] (voir styles.css)
   Chaque partie reçoit .is-in à son arrivée à l'écran et le perd quand elle en sort entièrement :
   l'animation se rejoue à chaque passage. --dir indique le sens du défilement (1 en descendant,
   -1 en remontant) pour que l'entrée se fasse à l'envers quand on remonte.
   Les animations sont jouées dans le temps, jamais pilotées par la position du scroll.
   ========================================================================== */
const anims = (() => {
  const enabled = motion.allowed() && 'IntersectionObserver' in window;
  let dir = 1;
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
  }, { passive: true });

  /** Observe un élément : onIn à l'arrivée (assez visible), onOut quand il a entièrement quitté l'écran. */
  function watch(el, onIn, onOut, enterMargin = '0px 0px -12% 0px') {
    if (!enabled) return;
    let inside = false;
    const enter = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !inside) { inside = true; onIn(dir); }
    }, { rootMargin: enterMargin, threshold: 0.12 });
    const leave = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && inside) { inside = false; onOut(dir); }
    }, { threshold: 0 });
    enter.observe(el);
    leave.observe(el);
  }

  if (enabled) {
    document.documentElement.classList.add('anim-ready');
    document.querySelectorAll('[data-anim]').forEach((el) => watch(el,
      (d) => { el.style.setProperty('--dir', d); el.classList.add('is-in'); },
      (d) => { el.style.setProperty('--dir', d); el.classList.remove('is-in'); }));
  }
  return { enabled, watch };
})();

/* Graphiques : tracés de gauche à droite (2,4 s) à l'arrivée, rejoués à chaque passage et quand
   un graphique redevient visible (diapositives Lunar Lander). Les graphiques « jusqu'à l'épisode »
   (.graph-upto) repartent de l'épisode 0. */
window.graphReveal = (() => {
  const reset = (el) => {
    if (el.classList.contains('graph-upto')) el.classList.add('is-waiting');
    else { el.classList.add('reveal-graph'); el.classList.remove('is-in'); }
  };
  const play = (el) => {
    if (el.classList.contains('graph-upto')) el.classList.remove('is-waiting');
    else el.classList.add('is-in');
  };
  const shown = new WeakSet();
  if (anims.enabled) {
    document.querySelectorAll('.thumb--graph').forEach((el) => {
      reset(el);
      anims.watch(el, () => { shown.add(el); requestAnimationFrame(() => play(el)); }, () => { shown.delete(el); reset(el); }, '0px 0px -20% 0px');
    });
  }
  return {
    replay(el) {
      if (!anims.enabled || !el || !shown.has(el)) return; // hors de l'écran : il se tracera à l'arrivée
      reset(el);
      void el.offsetWidth;
      play(el);
    },
  };
})();

/* Chiffres : incrémentés de 0 à leur valeur à chaque arrivée, indépendamment du scroll
   (valeur finale déjà dans le HTML, lue telle quelle par les lecteurs d'écran). */
(function initCounters() {
  const fmt = new Intl.NumberFormat('fr-FR');
  document.querySelectorAll('[data-count]').forEach((el) => {
    const finalText = el.textContent;
    const copy = document.createElement('span');
    copy.className = 'sr-only';
    copy.textContent = finalText;
    el.after(copy);
    el.setAttribute('aria-hidden', 'true');
    const to = Number(el.dataset.count);
    const suffix = (el.dataset.suffix || '').replace('&nbsp;', ' ');
    const show = (v) => { el.textContent = `${el.dataset.format === 'fr' ? fmt.format(v) : v}${suffix}`; };
    let frame = 0;
    anims.watch(el, () => {
      const start = performance.now();
      const DURATION = to > 1000 ? 1800 : 1200;
      cancelAnimationFrame(frame);
      const tick = (now) => {
        const t = Math.min(1, (now - start) / DURATION);
        show(Math.round(to * easeOut(t)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, () => { cancelAnimationFrame(frame); show(0); });
    if (anims.enabled) show(0);
  });
})();

/* Arcade : un clic sur un jeu ou une bibliothèque d'affichage les « charge » dans le cœur, à chaud. */
(function initArcade() {
  const arch = document.querySelector('.arch--live');
  if (!arch) return;
  const load = { game: arch.querySelector('[data-load="game"]'), display: arch.querySelector('[data-load="display"]') };
  arch.addEventListener('click', (event) => {
    const chip = event.target.closest('button.chip');
    if (!chip) return;
    const kind = chip.dataset.chip;
    arch.querySelectorAll(`button[data-chip="${kind}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', String(b === chip));
      b.classList.toggle('just-loaded', b === chip);
    });
    load[kind].textContent = chip.textContent;
    arch.classList.remove('is-swapping');
    void arch.offsetWidth;
    arch.classList.add('is-swapping');
  });
})();

/* Contact : le titre est découpé en mots, qui montent un à un (le texte reste lisible tel quel). */
(function initContactTitle() {
  const title = document.querySelector('[data-anim="contact"] h2');
  if (!title || !anims.enabled) return;
  const words = title.textContent.trim().split(/\s+/);
  title.setAttribute('aria-label', title.textContent.trim());
  title.innerHTML = words.map((w, i) => `<span class="word" aria-hidden="true"><span style="--w:${i}">${w.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span></span>`).join(' ');
})();

/* Carrousels sans colonne liée (Doctor Cvrie) */
document.querySelectorAll('[data-carousel]').forEach((root) => {
  if (!root.closest('#rl-panel')) initCarousel(root);
});

/* ==========================================================================
   Visionneuse : un clic sur une image l'affiche en plein écran, le site flouté derrière.
   Fermeture : croix, Échap ou clic à côté de l'image. Le focus revient au lien d'origine.
   Sans JavaScript, le lien ouvre simplement l'image.
   ========================================================================== */
(function initLightbox() {
  const links = document.querySelectorAll('a.zoomable, a.thumb');
  if (!links.length || typeof HTMLDialogElement !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Image agrandie');
  dialog.innerHTML =
    '<button class="lightbox__close" type="button" aria-label="Fermer l\'image">' +
    '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
    '</button><figure class="lightbox__figure"><figcaption class="lightbox__caption"></figcaption></figure>';
  document.body.append(dialog);
  const caption = dialog.querySelector('.lightbox__caption');
  // L'image n'est créée qu'à la première ouverture, directement avec sa source.
  let img = null;
  let opener = null;

  links.forEach((link) => link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    const inner = link.querySelector('img');
    const text = (inner && inner.alt) || link.getAttribute('aria-label') || link.textContent.trim();
    if (!img) {
      img = new Image();
      img.className = 'lightbox__img';
      caption.before(img);
    }
    img.src = link.getAttribute('href');
    img.alt = text;
    caption.textContent = text;
    document.documentElement.classList.add('has-lightbox');
    dialog.showModal();
  }));
  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('lightbox__figure')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-lightbox');
    if (opener) opener.focus();
  });
})();
