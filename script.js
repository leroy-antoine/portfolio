'use strict';

/* ==========================================================================
   0. Menu du nom (en haut à gauche) : GitHub, Glance, retour en haut.
   Le lien « retour en haut » devient un bouton qui ouvre un petit panneau animé (styles.css).
   Fermeture : Échap (focus rendu au bouton), clic à côté, sortie du focus, choix d'une entrée.
   ========================================================================== */
(function initBrandMenu() {
  const link = document.querySelector('.brand-wrap > .brand');
  const pop = document.getElementById('brand-pop');
  if (!link || !pop) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'brand';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'brand-pop');
  button.setAttribute('aria-label', 'Antoine Leroy : ouvrir le menu (GitHub, Glance, retour en haut)');
  button.append(...link.childNodes);
  button.insertAdjacentHTML('beforeend', '<svg class="brand__chev" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
  link.replaceWith(button);
  pop.hidden = false; // l'état fermé passe par la classe (visibility), pour que l'ouverture s'anime

  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    pop.classList.toggle('is-open', open);
  }
  button.addEventListener('click', () => setOpen(!isOpen()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) { setOpen(false); button.focus(); }
  });
  document.addEventListener('pointerdown', (event) => {
    if (isOpen() && !event.target.closest('.brand-wrap')) setOpen(false);
  });
  pop.parentElement.addEventListener('focusout', (event) => {
    if (isOpen() && !pop.parentElement.contains(event.relatedTarget)) setOpen(false);
  });
  pop.addEventListener('click', (event) => {
    if (!event.target.closest('a, button')) return;
    setOpen(false);
    if (event.target.closest('[data-top]')) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      button.focus({ preventScroll: true });
    }
  });
})();

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
  // Les diapositives restent des éléments de liste (<ol>) : la liste annonce déjà « 1 sur 5 ».
  slides.forEach((slide, i) => slide.setAttribute('aria-label', `${i + 1} sur ${total}${name(slide)}`));
  // La piste défile au clavier (flèches) : sans lien dedans (vidéos), elle reçoit elle-même le focus.
  if (!track.querySelector('a, button') && !track.hasAttribute('tabindex')) track.tabIndex = 0;
  // Carrousel de vidéos ou d'images : le libellé des points et l'annonce suivent le contenu.
  const kind = track.querySelector('video') ? ['la vidéo', 'Vidéo'] : ["l'image", 'Image'];
  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Afficher ${kind[0]} ${i + 1} sur ${total}${name(slide)}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
    return dot;
  });
  // Trop de points pour la largeur (9 vidéos sur téléphone) : un compteur « 3 / 9 » les remplace,
  // les flèches restent. Le compteur est muet : l'annonce passe déjà par .carousel__status.
  const count = document.createElement('span');
  count.className = 'carousel__count';
  count.setAttribute('aria-hidden', 'true');
  dotsEl.after(count);
  controls.hidden = false;
  root.classList.add('is-ready');
  const fit = () => {
    controls.classList.remove('is-compact');
    controls.classList.toggle('is-compact', controls.scrollWidth > controls.clientWidth + 1);
  };
  new ResizeObserver(fit).observe(controls);

  const step = () => (slides[1].offsetLeft - slides[0].offsetLeft) || track.clientWidth;

  function select(index, announce) {
    if (index === current) return;
    current = index;
    dots.forEach((dot, i) => dot.toggleAttribute('aria-current', i === index));
    // Diapositives hors écran : hors de la tabulation et des lecteurs d'écran.
    slides.forEach((slide, i) => slide.toggleAttribute('inert', i !== index));
    count.textContent = `${index + 1} / ${total}`;
    slides.forEach((slide, i) => slide.querySelectorAll('video').forEach((video) => {
      if (i === index) delete video.dataset.inactive;
      else video.dataset.inactive = '';
    }));
    if (window.videoManager) window.videoManager.refresh();
    if (announce && status) status.textContent = `${kind[1]} ${index + 1} sur ${total}${name(slides[index])}`;
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

  // Réalignement demandé par le héro : immédiat, même si la diapositive est déjà la courante
  // (un défilement doux ou un geste peut avoir laissé la piste entre deux diapositives).
  root.addEventListener('carousel:goto', ({ detail }) => {
    const i = slides.indexOf(detail);
    if (i < 0) return;
    releaseTarget();
    track.scrollLeft = slides[i].offsetLeft - slides[0].offsetLeft;
    select(i, false);
  });

  // data-start="hero" : le carrousel s'ouvre sur la diapositive où se pose la vidéo du héro (data-hero-slide).
  const first = root.dataset.start === 'hero' ? Math.max(0, slides.findIndex((slide) => slide.hasAttribute('data-hero-slide'))) : 0;
  if (first) track.scrollLeft = slides[first].offsetLeft - slides[0].offsetLeft;
  select(first, false);
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
   4. Héro : mise au point du titre vers la vidéo, puis zoom arrière jusqu'à Lunar Lander
   0 → 0,1     titre net sur la vidéo floutée
   0,1 → 0,55  le titre se floute et s'efface, la vidéo devient nette
   0,5 → 0,9   zoom arrière : la vidéo se pose exactement à la place de celle du carrousel
               Lunar Lander (même fichier), qui glisse sous la scène ; ensuite elle la suit
   0,82 → 0,97 le fond du héro s'efface : la case Lunar Lander apparaît autour de la vidéo
   ≥ 0,985     relais : la vidéo du carrousel prend la suite, au même instant de lecture
   ========================================================================== */
(function initHero() {
  const section = document.querySelector('[data-seq="hero"]');
  if (!section) return;
  const track = section.querySelector('.hero-seq__track');
  const stage = section.querySelector('.hero-seq__stage');
  const heroVideo = section.querySelector('.hero-seq__video');
  const header = document.querySelector('.site-header');
  const lunar = document.querySelector('.scene--lunar');
  const lunarAnim = lunar && lunar.querySelector('[data-anim="lunar"]');
  const carousel = lunar && lunar.querySelector('[data-carousel]');
  const heroSlide = carousel && carousel.querySelector('.slide[data-hero-slide]');
  const target = heroSlide && heroSlide.querySelector('video');

  const RATIO = 1.5;
  const RADIUS = 12; // rayon des vidéos du carrousel (styles.css, 0.75rem : suit la taille de base)
  let geo = { start: 1, yStart: 0 };
  function resize() {
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const baseH = vw / RATIO;
    // Départ : la boîte (toute la largeur, 3:2) agrandie pour couvrir l'écran, coins hors champ.
    const endScale = target ? Math.max(0.05, target.getBoundingClientRect().width / vw) : 0.5;
    const margin = ((RADIUS * parseFloat(getComputedStyle(document.documentElement).fontSize)) / 16 / endScale) * Math.max(1, vh / baseH) * 1.2 + 4;
    const start = Math.max((vw + 2 * margin) / vw, (vh + 2 * margin) / baseH);
    geo = { start, yStart: vh + margin - (start * baseH) / 2 - vh / 2 };
    written.clear();
    sequences.refresh();
  }

  // N'écrit une variable que si sa valeur change : pas de recalcul de style inutile.
  const written = new Map();
  const set = (name, value) => {
    if (written.get(name) === value) return;
    written.set(name, value);
    stage.style.setProperty(name, value);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const DOCK = 0.9;
  let handedOff = false;
  let synced = false;
  // Cale la vidéo du carrousel sur celle du héro. Une recherche prend du temps (décodage depuis
  // l'image clé) : on vise un peu en avance, de l'écart mesuré à la recherche précédente.
  let lead = 0;
  function sync(done) {
    let tries = 0;
    // Filet de sécurité : si « seeked » n'arrive jamais (même instant, vidéo pas prête), on conclut quand même.
    let called = false;
    const end = done && (() => { if (!called) { called = true; done(); } });
    if (end) setTimeout(end, 400);
    done = end;
    const seek = () => {
      try { target.currentTime = heroVideo.currentTime + lead; } catch (e) { if (done) done(); return; } // métadonnées pas encore chargées
      target.addEventListener('seeked', () => {
        const drift = heroVideo.currentTime - target.currentTime;
        if (Math.abs(drift) > 0.05 && Math.abs(drift) < 2 && ++tries < 3) { lead += drift; seek(); }
        else if (done) done();
      }, { once: true });
    };
    seek();
  }
  // Échange en une seule image : la vidéo du carrousel apparaît au moment précis où celle du héro
  // disparaît (jamais les deux à la fois), une fois sa nouvelle image décodée.
  const finish = () => {
    if (!handedOff) return;
    let swapped = false;
    const swap = () => {
      if (!handedOff || swapped) return;
      swapped = true;
      lunar.classList.remove('is-receiving');
      stage.classList.add('is-handed-off');
      heroVideo.dataset.inactive = '';
      if (window.videoManager) window.videoManager.refresh();
    };
    if (typeof target.requestVideoFrameCallback === 'function' && !target.paused) target.requestVideoFrameCallback(() => requestAnimationFrame(swap));
    else requestAnimationFrame(swap);
    setTimeout(swap, 300); // la vidéo du carrousel peut se mettre en pause avant sa prochaine image
  };
  // Carrousel déplacé pendant la fin de la séquence (Lunar Lander déjà visible) : la vidéo du héro ne doit pas
  // suivre sa diapositive hors du cadre (elle apparaîtrait à la place du graphique) ; le relais est fait tout de suite.
  // Plus haut dans la séquence, c'est le carrousel qui revient sur la diapositive du héro.
  const trackEl = carousel && carousel.querySelector('.carousel__track');
  let detached = false;
  function detach(on) {
    if (on === detached) return;
    detached = on;
    stage.classList.toggle('is-handed-off', on);
    lunar.classList.toggle('is-receiving', !on);
    if (on) heroVideo.dataset.inactive = '';
    else delete heroVideo.dataset.inactive;
    if (window.videoManager) window.videoManager.refresh();
  }
  if (carousel) carousel.addEventListener('carousel:change', () => sequences.refresh());
  if (trackEl) trackEl.addEventListener('scroll', () => sequences.refresh(), { passive: true });

  function render(p, rect) {
    if (!motion.allowed() || !target) {
      if (header) header.classList.toggle('is-solid', rect.bottom <= header.offsetHeight + 1);
      if (written.size) { stage.removeAttribute('style'); written.clear(); }
      if (lunarAnim) lunarAnim.classList.remove('is-held');
      return;
    }
    // Lectures avant toute écriture : une seule mise en page par image.
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const t = target.getBoundingClientRect();
    const offSlide = trackEl ? Math.abs(t.left - trackEl.getBoundingClientRect().left) > 2 : false;
    // Position réelle de la scène : collée en haut pendant la séquence, elle remonte avec la page ensuite.
    const s = stage.getBoundingClientRect();
    const out = easeInOut(range(p, 0.04, 0.32));   // le titre sort
    const focus = easeOut(range(p, 0.12, 0.56));    // la vidéo devient nette
    const land = easeInOut(range(p, 0.5, DOCK));    // zoom arrière vers le carrousel
    const fade = easeInOut(range(p, 0.82, 0.97));   // le fond du héro s'efface

    if (header) header.classList.toggle('is-solid', p >= 0.82 || rect.bottom <= header.offsetHeight + 1);

    set('--cue-o', (1 - range(p, 0, 0.05)).toFixed(3));
    set('--title-o', (1 - out).toFixed(3));
    set('--title-y', `${(-40 * out).toFixed(1)}px`);
    set('--title-s', (1 + 0.06 * out).toFixed(4));
    set('--title-blur', `${(8 * out).toFixed(2)}px`);

    const blur = 1 - focus;
    set('--blur', `${(28 * blur).toFixed(2)}px`);
    set('--video-s', (1 + 0.06 * blur).toFixed(4));
    set('--veil', ((1 - 0.8 * focus) * (1 - fade)).toFixed(3));

    // Cible du zoom : la vidéo du carrousel telle qu'elle sera à p = DOCK (sa position actuelle,
    // remontée du défilement qui reste d'ici là). Au-delà, la vidéo suit le carrousel en direct :
    // elle défile avec la page et le relais tombe pile, où que l'on s'arrête.
    const ahead = Math.max(0, DOCK - p) * Math.max(1, track.offsetHeight - vh);
    const endScale = t.width / vw;
    const cx = t.left + t.width / 2 - (s.left + vw / 2);
    const cy = t.top - ahead + t.height / 2 - (s.top + vh / 2);
    set('--media-s', lerp(geo.start, endScale, land).toFixed(4));
    set('--media-x', `${lerp(0, cx, land).toFixed(1)}px`);
    set('--media-y', `${lerp(geo.yStart, cy, land).toFixed(1)}px`);
    set('--media-r', `${((RADIUS * parseFloat(getComputedStyle(document.documentElement).fontSize)) / 16 / endScale).toFixed(2)}px`);
    set('--stage-a', (1 - fade).toFixed(3));
    // Le bouton pause du héro s'efface avant que celui du carrousel n'apparaisse au même endroit.
    set('--toggle-o', (1 - easeInOut(range(p, 0.74, 0.84))).toFixed(3));
    stage.classList.toggle('is-passing', fade > 0.5);

    // La case Lunar Lander ne s'anime (titre depuis la gauche, instruments depuis la droite)
    // qu'au moment où le fond du héro s'efface.
    if (lunarAnim) lunarAnim.classList.toggle('is-held', p < 0.84);

    // Calage discret, tant que la vidéo du carrousel est encore invisible : au relais, les deux
    // vidéos (même fichier) en sont au même instant et aucune recherche n'est visible.
    if (p >= 0.8 && !synced) { synced = true; sync(); }
    else if (p < 0.7) synced = false;

    if (!handedOff) {
      if (offSlide && p < 0.82) carousel.dispatchEvent(new CustomEvent('carousel:goto', { detail: heroSlide }));
      else detach(offSlide);
    }

    // Relais : la vidéo du carrousel apparaît sous celle du héro (même cadre), puis celle du héro
    // s'efface dès que les deux en sont au même instant.
    const done = p >= 0.985;
    if (done !== handedOff) {
      handedOff = done;
      if (done) {
        if (Math.abs(heroVideo.currentTime - target.currentTime) > 0.08) sync(finish);
        else finish();
      } else {
        detached = false;
        lunar.classList.add('is-receiving');
        delete heroVideo.dataset.inactive;
        stage.classList.remove('is-handed-off');
        // En remontant, le carrousel revient sur la vidéo du héro pour que le relais reste continu.
        if (carousel) carousel.dispatchEvent(new CustomEvent('carousel:goto', { detail: heroSlide }));
        if (window.videoManager) window.videoManager.refresh();
      }
    }
  }

  if (lunar) lunar.classList.add('is-receiving');
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
  function watch(el, onIn, onOut, enterMargin = '0px 0px -8% 0px') {
    if (!enabled) return;
    let inside = false;
    const enter = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !inside) { inside = true; onIn(dir); }
    }, { rootMargin: enterMargin, threshold: 0 });
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

/* Arcade : le schéma (jeu × affichage) pilote l'émulation jouable, voir arcade.js. */

/* Contact : le titre est découpé en mots, qui montent un à un (le texte reste lisible tel quel). */
(function initContactTitle() {
  const title = document.querySelector('[data-anim="contact"] h2');
  if (!title || !anims.enabled) return;
  const words = title.textContent.trim().split(/[ \t\n\r]+/); // l'espace insécable de « 2027 ? » reste dans le mot
  title.setAttribute('aria-label', title.textContent.trim());
  title.innerHTML = words.map((w, i) => `<span class="word" aria-hidden="true"><span style="--w:${i}">${w.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span></span>`).join(' ');
})();

/* Contact : en descendant, la section arrive floue et devient nette à mesure qu'elle remplit l'écran
   (en plus de l'entrée des mots). Exception assumée à la règle ci-dessus : le flou suit la position
   du scroll. Rien avec le mouvement réduit. */
(function initContactFocus() {
  const section = document.getElementById('contact');
  const inner = section && section.querySelector('.container--contact');
  if (!inner) return;
  let queued = false;
  const update = () => {
    queued = false;
    // 1 quand le haut de la section touche le bas de l'écran, 0 quand elle le remplit (à 24 px près :
    // sur téléphone, l'arrivée par lien ou molette s'arrête quelques pixels plus bas, sous l'en-tête).
    const t = motion.allowed() ? Math.min(1, Math.max(0, (section.getBoundingClientRect().top - 24) / (window.innerHeight * 0.85))) : 0;
    inner.classList.toggle('is-focusing', t > 0);
    inner.style.setProperty('--focus-blur', `${(18 * t).toFixed(2)}px`);
    inner.style.setProperty('--focus-o', (1 - 0.7 * t).toFixed(3));
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
})();

/* Autres carrousels (Doctor Cvrie). Avec data-side="#id", la colonne indiquée affiche
   le contenu <template class="slide__side"> de la diapositive visible ; les contenus sont superposés
   dans une même cellule pour que la colonne ne change pas de hauteur. */
document.querySelectorAll('[data-carousel]').forEach((root) => {
  if (root.closest('#rl-panel')) return;
  const side = root.dataset.side ? document.querySelector(root.dataset.side) : null;
  if (side) {
    const layers = [...root.querySelectorAll(':scope .slide')].map((slide) => {
      const layer = document.createElement('div');
      layer.className = 'carousel-side__layer';
      const template = slide.querySelector('template.slide__side');
      if (template) layer.append(template.content.cloneNode(true));
      return layer;
    });
    side.removeAttribute('aria-live');
    side.replaceChildren(...layers);
    side.classList.add('carousel-side');
    root.addEventListener('carousel:change', ({ detail }) => layers.forEach((layer, i) => {
      layer.toggleAttribute('inert', i !== detail.index);
      layer.setAttribute('aria-hidden', String(i !== detail.index));
    }));
  }
  initCarousel(root);
});

/* ==========================================================================
   Visionneuse : un clic sur une image l'affiche en plein écran, le site flouté derrière.
   Les vidéos de Lunar Lander jouent dans la page comme des GIF (muettes, en boucle, sans lecteur) ;
   un clic les ouvre en grand avec un lecteur (lecture, avancée, plein écran natif).
   Fermeture : croix, Échap ou clic à côté. Le focus revient à l'élément d'origine.
   Sans JavaScript, le lien ouvre simplement l'image ; les vidéos restent des vidéos d'ambiance.
   ========================================================================== */
(function initLightbox() {
  const links = document.querySelectorAll('a.zoomable, a.thumb');
  const videos = document.querySelectorAll('.scene--lunar .slide__figure > video');
  if ((!links.length && !videos.length) || typeof HTMLDialogElement !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.innerHTML =
    '<button class="lightbox__close" type="button" aria-label="Fermer">' +
    '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
    '</button><figure class="lightbox__figure"><figcaption class="lightbox__caption"></figcaption></figure>';
  document.body.append(dialog);
  const caption = dialog.querySelector('.lightbox__caption');
  // L'image et le lecteur ne sont créés qu'à leur première ouverture.
  let img = null;
  let player = null;
  let opener = null;

  function show(media, label, text) {
    [img, player].forEach((el) => { if (el) el.hidden = el !== media; });
    dialog.setAttribute('aria-label', label);
    caption.textContent = text;
    document.documentElement.classList.add('has-lightbox');
    dialog.showModal();
  }

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
    show(img, 'Image agrandie', text);
  }));

  // Vidéos : un bouton transparent recouvre chaque vidéo (même boîte 3:2) ; l'icône d'agrandissement
  // est dans le coin. Le lecteur reprend la vidéo au même instant.
  videos.forEach((video) => {
    const figure = video.parentElement;
    const labelEl = figure.querySelector('.slide__label');
    const label = labelEl ? labelEl.textContent.trim() : 'Lunar Lander';
    const cap = figure.querySelector('figcaption');
    const rest = cap ? cap.textContent.replace(label, '').trim() : '';
    const text = rest ? `${label} · ${rest}` : label;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'video-zoom';
    button.setAttribute('aria-label', `Agrandir la vidéo « ${label} » avec un lecteur`);
    button.innerHTML = '<span class="video-zoom__icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>';
    video.after(button);
    button.addEventListener('click', () => {
      opener = button;
      if (!player) {
        player = document.createElement('video');
        player.className = 'lightbox__video';
        player.controls = true;
        player.loop = true;
        player.muted = true; // les vidéos sont sans son ; la lecture automatique reste permise
        player.playsInline = true;
        caption.before(player);
      }
      player.replaceChildren(...[...video.querySelectorAll('source')].map((source) => source.cloneNode()));
      if (video.getAttribute('src')) player.src = video.getAttribute('src');
      else player.removeAttribute('src');
      player.poster = video.poster;
      player.setAttribute('aria-label', video.getAttribute('aria-label') || label);
      player.load();
      const start = video.currentTime;
      player.addEventListener('loadedmetadata', () => { try { player.currentTime = start; } catch (e) { /* début de la vidéo */ } }, { once: true });
      show(player, 'Vidéo agrandie', text);
      const playing = player.play();
      if (playing && playing.catch) playing.catch(() => {});
      player.focus();
    });
  });

  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('lightbox__figure')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-lightbox');
    if (player) {
      player.pause();
      player.removeAttribute('src');
      player.replaceChildren();
      player.load(); // arrête le téléchargement
    }
    if (opener) opener.focus();
  });
})();

/* ==========================================================================
   Molette : un cran amène en douceur à la sous-partie suivante (ou précédente).
   Pas dans le héro, dont la séquence suit le défilement, ni pour y revenir ; à la fin de la séquence,
   un cran pose Lunar Lander en entier.
   Une sous-partie plus haute que l'écran se parcourt aussi par crans animés, jusqu'au bas de son contenu
   (la marge basse n'impose pas de cran de plus).
   « À propos » et « Stack » forment une seule sous-partie quand les deux tiennent dans l'écran ;
   sinon chacune a son arrêt et occupe tout l'écran (styles.css), pour qu'aucune n'apparaisse à moitié.
   Les zones qui défilent elles-mêmes (terminal, carrousels) gardent la molette.
   Mouvement réduit : défilement natif.
   ========================================================================== */
(function initWheelSnap() {
  const parts = [...document.querySelectorAll('.projects > .scene, main > .section:not(.hero-seq)')];
  if (parts.length < 2) return;
  const about = document.getElementById('a-propos');
  const stack = document.getElementById('stack');
  const header = document.querySelector('.site-header');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const INERTIA = 100; // ms sans événement avant d'accepter un nouveau cran (inertie des pavés tactiles)
  const END = 24; // marge gardée sous le contenu d'une sous-partie
  let anim = null;
  let lastWheel = 0;

  // Haut de la sous-partie, moins ce que l'en-tête en masquerait (les scènes ont déjà la marge voulue).
  function snapTop(el) {
    const box = el.querySelector(':scope > .scene__stage') || el;
    const pad = parseFloat(getComputedStyle(box).paddingTop) || 0;
    const head = header && getComputedStyle(header).position !== 'static' ? header.getBoundingClientRect().height : 0;
    return Math.round(el.getBoundingClientRect().top + window.scrollY - Math.max(0, head + 8 - pad));
  }
  // Bas du contenu (et non de la section, dont la marge basse peut dépasser de l'écran sans rien cacher).
  function contentEnd(el) {
    if (el === parts[parts.length - 1]) return document.documentElement.scrollHeight; // dernier arrêt : jusqu'au pied de page
    const inner = el.querySelector(':scope > .scene__stage > .scene__inner, :scope > .container') || el;
    const end = inner.getBoundingClientRect().bottom + window.scrollY + END;
    return Math.round(Math.min(end, el.getBoundingClientRect().bottom + window.scrollY));
  }
  // Arrêts de la molette : [haut, bas du contenu] de chaque sous-partie, « À propos » et « Stack » fusionnées si elles tiennent ensemble.
  function stops() {
    const list = parts.map((el) => ({ el, top: snapTop(el), end: contentEnd(el) }));
    const a = list.findIndex((s) => s.el === about);
    if (a >= 0 && list[a + 1] && list[a + 1].el === stack && list[a + 1].end - list[a].top <= window.innerHeight) {
      list[a].end = list[a + 1].end;
      list.splice(a + 1, 1);
    }
    return list;
  }
  function scrollsItself(el, dir) {
    for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      if (!/(auto|scroll)/.test(getComputedStyle(el).overflowY) || el.scrollHeight <= el.clientHeight + 1) continue;
      if (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
    }
    return false;
  }
  function animateTo(y) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const to = Math.max(0, Math.min(max, y));
    const from = window.scrollY;
    if (Math.abs(to - from) < 2) return;
    anim = { from, to, t0: performance.now(), dur: Math.min(900, Math.max(480, Math.abs(to - from) * 0.6)), done: false };
    const tick = (t) => {
      if (!anim || anim.done) return;
      const k = Math.min(1, (t - anim.t0) / anim.dur);
      window.scrollTo({ top: anim.from + (anim.to - anim.from) * easeInOut(k), behavior: 'instant' });
      if (k < 1) requestAnimationFrame(tick);
      else anim.done = true;
    };
    requestAnimationFrame(tick);
  }
  window.addEventListener('wheel', (event) => {
    if (reduce.matches || event.ctrlKey || event.defaultPrevented) return;
    if (event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const now = performance.now();
    const quiet = now - lastWheel;
    lastWheel = now;
    if (anim) {
      if (!anim.done || quiet < INERTIA) { event.preventDefault(); return; }
      anim = null;
    }
    const dir = Math.sign(event.deltaY);
    if (document.querySelector('dialog[open]') || scrollsItself(event.target, dir)) return;
    const list = stops();
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (dir < 0 && y <= list[0].top + 2) return; // remontée vers le héro : défilement natif
    if (y < list[0].top - 2) {
      // Fin de la séquence du héro : dès que Lunar Lander commence à apparaître (le fond du héro
      // s'efface sur le dernier tiers d'écran), un cran pose la scène entière, technologies comprises.
      if (dir > 0 && y >= list[0].top - vh * 0.45) { event.preventDefault(); animateTo(list[0].top); }
      return;
    }
    let i = 0;
    while (i + 1 < list.length && list[i + 1].top <= y + 2) i++;
    const cur = list[i];
    const page = Math.round(vh * 0.85);
    let target = null;
    if (dir > 0) {
      if (y + vh < cur.end - END) target = Math.min(cur.end - vh, y + page); // au-delà de la marge : il reste du contenu à montrer
      else if (i + 1 < list.length) target = list[i + 1].top;
      else return;
    } else if (y > cur.top + END) target = Math.max(cur.top, y - page);
    else if (i > 0) {
      // La sous-partie précédente, par son bas si elle ne tient pas (même tolérance qu'en descendant).
      const prev = list[i - 1];
      const fromEnd = prev.end - vh;
      target = fromEnd - prev.top <= END ? prev.top : fromEnd;
    }
    if (target === null) return;
    event.preventDefault();
    animateTo(target);
  }, { passive: false });
  // Liens internes (menu, « Me contacter », « Voir le projet »…) : même arrivée que la molette, au lieu
  // du décalage de scroll-padding. Projets → première scène ; un titre de projet → sa scène ;
  // Stack → son arrêt, ou celui d'« À propos » quand les deux sont fusionnées. Mouvement réduit : saut direct.
  function linkTop(el) {
    if (el.id === 'projets') return snapTop(parts[0]);
    const part = parts.find((p) => p === el || p.contains(el));
    if (part === stack) return stops().find((s) => s.el === stack) ? snapTop(stack) : snapTop(about); // même arrêt que la molette
    if (part) return snapTop(part);
    return null;
  }
  document.addEventListener('click', (event) => {
    const a = event.target.closest('a[href^="#"]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const el = a.hash.length > 1 && document.getElementById(decodeURIComponent(a.hash.slice(1)));
    const y = el ? linkTop(el) : null;
    if (y === null) return;
    event.preventDefault();
    history.pushState(null, '', a.hash);
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true }); // la suite de la tabulation part de la section atteinte
    if (reduce.matches) window.scrollTo({ top: y, behavior: 'instant' });
    else animateTo(y);
  });
  // Une autre action de défilement (clavier, lien, barre) interrompt l'animation.
  ['keydown', 'pointerdown', 'touchstart'].forEach((type) => window.addEventListener(type, () => { if (anim && !anim.done) anim = null; }, { passive: true }));
})();

/* Frise du parcours : sur petit écran elle défile en largeur ; elle devient alors atteignable au
   clavier (flèches) et nommée, comme une région. Sur grand écran, pas d'arrêt de tabulation inutile. */
(function initFriseScroll() {
  const scroller = document.querySelector('.frise__scroll');
  if (!scroller || !('ResizeObserver' in window)) return;
  new ResizeObserver(() => {
    const scrolls = scroller.scrollWidth > scroller.clientWidth + 1;
    if (scrolls) {
      scroller.tabIndex = 0;
      scroller.setAttribute('role', 'region');
      scroller.setAttribute('aria-label', 'Frise 2023 → 2027, défilement horizontal');
    } else {
      ['tabindex', 'role', 'aria-label'].forEach((a) => scroller.removeAttribute(a));
    }
  }).observe(scroller);
})();

/* Frise du parcours : repère « aujourd'hui », en mois depuis janvier 2023 (échelle de la frise : 8 à 57). */
(function initFriseNow() {
  const now = document.querySelector('.frise__now');
  if (!now) return;
  const d = new Date();
  const at = (d.getFullYear() - 2023) * 12 + d.getMonth() + d.getDate() / 31;
  if (at < 8 || at > 57) return;
  now.style.setProperty('--at', at.toFixed(2));
  now.hidden = false;
})();
