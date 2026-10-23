'use strict';

/* ==========================================================================
   Arcade : portage dans le navigateur du vrai projet (dossier Arcade/ du dépôt).
   Même boucle que src/Core.cpp : à chaque image, getEvent → simulate → drawGame → builtins
   → commandes du jeu. Mêmes jeux (lib/games : menu, Snake, Minesweeper, règles et constantes
   identiques), mêmes affichages (lib/graphicals : SDL2 et SFML dessinent les sprites PNG du projet
   dans une fenêtre 960 × 540, NCURSES écrit les caractères des fichiers .txt dans le terminal).
   Touches du Core : F1 menu, F2 recommencer, F3 jeu suivant, = affichage suivant, F4 quitter.
   Améliorations du portage : pause quand la fenêtre perd le focus (horloge des jeux gelée),
   commandes tactiles, plein écran, scores conservés dans le navigateur (score.csv d'origine inclus).
   ========================================================================== */
(function initArcadeEmu() {
  const media = document.querySelector('[data-arcade]');
  if (!media || !HTMLCanvasElement.prototype.getContext) return;
  const stage = media.querySelector('.arcade-stage');
  const videoWrap = stage && stage.querySelector('.video-wrap');
  const caption = media.querySelector('figcaption');
  const arch = document.querySelector('.arch--live');
  if (!stage) return;

  /* ---------- include/Shared/Arcade.hpp, Entity.hpp, Utils.hpp ---------- */
  const WINX = 960;
  const WINY = 540;
  const WHITE = [255, 255, 255, 255];
  const RED = [255, 0, 0, 255];
  const BLUE = [0, 0, 255, 255];
  const GREEN = [0, 255, 0, 255];
  // Ordre de lecture du dossier lib/ sur la machine du projet (visible dans le menu de la démo).
  const DISPLAYS = ['lib/arcade_sdl2.so', 'lib/arcade_ncurses.so', 'lib/arcade_sfml.so'];
  const GAMES = ['lib/arcade_minesweeper.so', 'lib/arcade_menu.so', 'lib/arcade_snake.so'];
  const MENU = 'lib/arcade_menu.so';
  const libName = (path) => path.replace('lib/arcade_', '').replace('.so', '');
  const NAMES = { sdl2: 'SDL2', ncurses: 'NCURSES', sfml: 'SFML', menu: 'Menu', snake: 'Snake', minesweeper: 'Minesweeper' };

  // Horloge des jeux (std::chrono::steady_clock) : arrêtée pendant les pauses.
  let pausedAt = performance.now();
  let pausedTotal = 0;
  const now = () => ((pausedAt ?? performance.now()) - pausedTotal) / 1000;
  const rand = (n) => Math.floor(Math.random() * n);
  const entity = (idx, pos, size, extra = {}) => ({ idx, pos, size, rotation: 0, color: WHITE, str: null, ...extra });

  /* ---------- score/score.csv : celui du dépôt, plus les parties jouées ici ---------- */
  const SCORE_SEED = 'name,game,score\nARI,lib/arcade_snake.so,40\nETO,lib/arcade_snake.so,330\nETO,lib/arcade_snake.so,10\nPIE,lib/arcade_minesweeper.so,431932\nPIE,lib/arcade_minesweeper.so,371791\n';
  const STORE = 'arcade-score-csv';
  function readCsv() {
    let extra = '';
    try { extra = localStorage.getItem(STORE) || ''; } catch (e) { /* stockage indisponible */ }
    return SCORE_SEED + extra;
  }
  function appendCsv(line) {
    try { localStorage.setItem(STORE, (localStorage.getItem(STORE) || '') + line); } catch (e) { /* stockage indisponible */ }
  }

  /* ---------- lib/games/arcade_menu (GameMenu.cpp, Score.cpp) ---------- */
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  function formatLen(str, len) {
    let s = str;
    if (s.length >= len) return s;
    const add = Math.floor((len - s.length) / 2);
    for (let i = 0; i < add; i++) s = ` ${s} `;
    return s;
  }
  class GameMenu {
    constructor() {
      this.commands = [];
      this.selectLibType = 0; // Display, Game, Name
      this.name = '___';
      this.idxs = [0, 0];
      this.csv = [];
      readCsv().split('\n').forEach((line) => {
        const m = /^([^,]*),([^,]*),\s*(\d+)/.exec(line);
        if (m) this.csv.push([m[1], m[2], Number(m[3])]);
      });
      this.userScore = [];
    }
    get assets() { return { images: [], txt: [] }; }
    getScores(name, game) {
      return [...new Set(this.csv.filter(([n, g]) => n === name && g === game).map(([, , s]) => s))].sort((a, b) => b - a);
    }
    simulate([action]) {
      if (action === 'Enter') {
        this.commands.push(['LoadUser', [this.name]], ['LoadDisplay', [DISPLAYS[this.idxs[0]]]], ['LoadGame', [GAMES[this.idxs[1]]]]);
        return;
      }
      if (action === 'Right') this.selectLibType = this.selectLibType === 2 ? 0 : this.selectLibType + 1;
      if (action === 'Left') this.selectLibType = this.selectLibType === 0 ? 2 : this.selectLibType - 1;
      if (this.selectLibType === 0) this.changeSelectLib(action, DISPLAYS.length, 0);
      else if (this.selectLibType === 1) {
        this.changeSelectLib(action, GAMES.length, 1);
        this.userScore = this.getScores(this.name, GAMES[this.idxs[1]]);
      } else this.changeName(action);
    }
    changeSelectLib(action, size, k) {
      if (action === 'Down') this.idxs[k] = this.idxs[k] === size - 1 ? 0 : this.idxs[k] + 1;
      if (action === 'Up') this.idxs[k] = this.idxs[k] === 0 ? size - 1 : this.idxs[k] - 1;
    }
    changeName(action) {
      let change = false;
      if (LETTERS.includes(action)) {
        const pos = this.name.indexOf('_');
        if (pos !== -1) { this.name = this.name.slice(0, pos) + action + this.name.slice(pos + 1); change = true; }
      }
      if (action === 'Backspace') {
        const pos = this.name.indexOf('_');
        if (pos !== -1 && pos !== 0) this.name = `${this.name.slice(0, pos - 1)}_${this.name.slice(pos)}`;
        if (pos === -1) { this.name = `${this.name.slice(0, -1)}_`; change = true; }
      }
      if (change) this.userScore = this.getScores(this.name, GAMES[this.idxs[1]]);
    }
    showNLibs(list, posx, n, idx, out) {
      let start = idx;
      if (list.length < n) { n = list.length; start = 0; }
      if (list.length - idx < n) start = list.length - n;
      for (let i = start; i < n + start; i++) {
        out.push(entity(-1, [posx, 0.3 + 0.075 * (i - start)], [0.25, 0.05], { str: formatLen(libName(list[i]), 25), color: idx === i ? BLUE : WHITE }));
      }
    }
    getElements() {
      const out = [];
      const col = (i) => (i === this.selectLibType ? RED : WHITE);
      out.push(entity(-1, [0.4, 0.05], [0.2, 0.1], { str: 'Arcade' }));
      out.push(entity(-1, [0.05, 0.2], [0.25, 0.075], { str: formatLen('Display', 15), color: col(0) }));
      this.showNLibs(DISPLAYS, 0.05, 4, this.idxs[0], out);
      out.push(entity(-1, [0.375, 0.2], [0.25, 0.075], { str: formatLen('Game', 15), color: col(1) }));
      this.showNLibs(GAMES, 0.375, 4, this.idxs[1], out);
      out.push(entity(-1, [0.7, 0.2], [0.25, 0.075], { str: formatLen('Name', 15), color: col(2) }));
      out.push(entity(-1, [0.7, 0.3], [0.25, 0.075], { str: formatLen(this.name, 15) }));
      out.push(entity(-1, [0.375, 0.625], [0.25, 0.075], { str: formatLen('Score', 15) }));
      for (let i = 0; i < 9; i++) {
        const score = this.userScore[i] !== undefined ? String(this.userScore[i]) : 'N/A';
        out.push(entity(-1, [0.05 + Math.floor(i / 3) * 0.325, 0.725 + (i % 3) * 0.1], [0.25, 0.04], { str: formatLen(`##${i + 1}: ${score}`, 25) }));
      }
      return out;
    }
    loadCommand() { return this.commands.splice(0); }
  }

  /* ---------- lib/games/arcade_snake (GameSnake.cpp) ---------- */
  const S = { GRIDX: 16, GRIDY: 9, SIZE: 144, GAIN: 10, MOVETIME: 0.15, START: 3 };
  const ANGLE = { Top: 0, Right: 90, Bottom: 180, Left: 270 };
  class GameSnake {
    constructor() {
      this.rotation = ANGLE.Right;
      this.events = [];
      this.commands = [];
      this.score = 0;
      this.lastTime = 0;
      this.totalTime = 0;
      let head = rand(S.SIZE);
      if (head % S.GRIDX <= S.START) head += S.START;
      this.snake = [];
      for (let i = head; i >= head - S.START; i--) this.snake.push(i);
      this.spawnApple();
    }
    get assets() {
      return { images: ['snake-snakeHead', 'snake-snakeTail', 'snake-snakeBody', 'snake-snakeTurn', 'snake-apple'], txt: ['S', 'T', 'o', 'O', 'A'] };
    }
    exit(signal) {
      if (this.score !== 0) this.commands.push(['LoadScore', [String(this.score)]]);
      this.commands.push([signal, []]);
    }
    simulate(event) {
      if (this.prevCheck(event)) return;
      let head = this.snake[0];
      const moves = [
        [ANGLE.Top, head >= S.GRIDX, -S.GRIDX],
        [ANGLE.Right, head % S.GRIDX !== S.GRIDX - 1, 1],
        [ANGLE.Bottom, head < S.SIZE - S.GRIDX, S.GRIDX],
        [ANGLE.Left, head % S.GRIDX !== 0, -1],
      ];
      for (const [angle, ok, delta] of moves) {
        if (this.rotation !== angle) continue;
        if (!ok) { this.exit('RestartGame'); return; }
        head += delta;
      }
      this.moveSnake(head);
    }
    prevCheck(event) {
      this.events.push(event);
      const t = now();
      this.totalTime += t - this.lastTime;
      this.lastTime = t;
      if (this.totalTime >= S.MOVETIME) {
        this.totalTime = 0;
        this.changeDir();
        return false;
      }
      return true;
    }
    changeDir() {
      const prev = this.rotation;
      this.events.forEach(([action]) => {
        if ((action === 'Z' || action === 'Up') && this.rotation !== ANGLE.Bottom) this.rotation = ANGLE.Top;
        if ((action === 'S' || action === 'Down') && this.rotation !== ANGLE.Top) this.rotation = ANGLE.Bottom;
        if ((action === 'Q' || action === 'Left') && this.rotation !== ANGLE.Right) this.rotation = ANGLE.Left;
        if ((action === 'D' || action === 'Right') && this.rotation !== ANGLE.Left) this.rotation = ANGLE.Right;
      });
      if (prev !== this.rotation && Math.trunc(prev / 90) % 2 === Math.trunc(this.rotation / 90) % 2) this.rotation = prev;
      this.events = [];
    }
    moveSnake(head) {
      const tail = this.snake[this.snake.length - 1];
      for (let i = this.snake.length - 1; i > 0; i--) this.snake[i] = this.snake[i - 1];
      this.snake[0] = head;
      if (head === this.apple) {
        this.score += S.GAIN;
        this.snake.push(tail);
        this.spawnApple();
      }
      for (let i = 1; i < this.snake.length; i++) {
        if (this.snake[0] === this.snake[i]) { this.exit('RestartGame'); break; }
      }
    }
    spawnApple() {
      if (this.snake.length === S.SIZE) { this.exit('RestartGame'); return; }
      for (;;) {
        const nb = rand(S.SIZE);
        if (this.snake.includes(nb)) continue;
        this.apple = nb;
        break;
      }
    }
    pos(part) { return [(part % S.GRIDX) / S.GRIDX, (part - (part % S.GRIDX)) / S.GRIDX / S.GRIDY]; }
    part(asset, idx, rotation) { return entity(asset, this.pos(idx), [1 / S.GRIDX, 1 / S.GRIDY], { rotation }); }
    getElements() {
      const out = [];
      const sn = this.snake;
      sn.forEach((cell, i) => {
        if (i === 0) { out.push(this.part(0, cell, this.rotation)); return; }
        const before = sn[i - 1];
        if (i === sn.length - 1) {
          let r = 0;
          if (before === cell - 1) r = ANGLE.Left;
          if (before > cell) r = ANGLE.Bottom;
          if (before === cell + 1) r = ANGLE.Right;
          out.push(this.part(1, cell, r));
          return;
        }
        const after = sn[i + 1];
        const gap = Math.abs(before - after);
        if (gap !== 2 && gap !== S.GRIDX * 2) {
          let r = 0;
          const same = (a) => a % S.GRIDX === cell % S.GRIDX;
          if ((same(before) && before > cell && after + 1 === cell) || (same(after) && after > cell && before + 1 === cell)) r = ANGLE.Right;
          if ((same(before) && before < cell && after + 1 === cell) || (same(after) && after < cell && before + 1 === cell)) r = ANGLE.Bottom;
          if ((same(before) && before < cell && after - 1 === cell) || (same(after) && after < cell && before - 1 === cell)) r = ANGLE.Left;
          out.push(this.part(3, cell, r));
          return;
        }
        let r = 0;
        if (before === cell - 1) r = ANGLE.Left;
        if (before === cell + 1) r = ANGLE.Right;
        out.push(this.part(2, cell, r));
      });
      out.push(this.part(4, this.apple, 0));
      return out;
    }
    loadCommand() { return this.commands.splice(0); }
  }

  /* ---------- lib/games/arcade_minesweeper (GameMinesweeper.cpp) ---------- */
  const M = { GRIDX: 16, GRIDY: 16, TOTAL: 256, DISPLAYY: 16, DISPLAYX: 28, OFFSETX: 6, BOMBS: 40, MAXTIME: 300, TILE: 10, FLAG: 100 };
  M.MAXSCORE = M.TILE * (M.TOTAL - M.BOMBS) + M.FLAG * M.BOMBS;
  const T = { Empty: 0, Height: 8, Cover: 9, Flag: 10, Bomb: 11, None: 12 };
  class GameMinesweeper {
    constructor() {
      this.commands = [];
      this.show = new Array(M.TOTAL).fill(T.Cover);
      this.actual = new Array(M.TOTAL).fill(T.Empty);
      this.start = false;
      this.lost = false;
      this.win = false;
      this.score = 0;
      this.flag = M.BOMBS;
      this.lastTime = now();
      this.totalTime = M.MAXTIME;
      this.bombClock = 0;
    }
    get assets() {
      return {
        images: ['empty', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'height', 'cover', 'flag', 'bomb'].map((n) => `minesweeper-${n}`),
        txt: ['O', '1', '2', '3', '4', '5', '6', '7', '8', 'X', 'F', 'B'],
      };
    }
    simulate(event) {
      const t = now();
      const diff = t - this.lastTime;
      if (this.lost) this.bombClock += diff;
      else if (!this.win && this.start) this.totalTime -= diff;
      this.lastTime = t;
      if (this.preCheck(event)) return;
      if (!this.win && this.score >= M.MAXSCORE) {
        this.win = true;
        this.score = Math.trunc(this.score * (M.MAXTIME - this.totalTime));
        this.commands.push(['LoadScore', [String(this.score)]]);
        return;
      }
      const idx = this.tileClick(event[1]);
      if (idx === null) return;
      if (event[0] === 'LeftMouse') this.revealTile(idx);
      else if (event[0] === 'RightMouse' && this.start) this.placeFlag(idx);
    }
    preCheck([action]) {
      if (action === 'Enter') { this.commands.push(['RestartGame', []]); return true; }
      if (this.totalTime <= 0) this.lost = true;
      if (this.win) return true;
      if (this.lost) { this.bombDiscovery(); return true; }
      return false;
    }
    tilePos(i) { return [((i % M.GRIDX) + M.OFFSETX) / M.DISPLAYX, (i - (i % M.GRIDX)) / M.GRIDX / M.DISPLAYY]; }
    tileClick([x, y]) {
      if (x >= M.OFFSETX / M.DISPLAYX && x <= (M.OFFSETX + M.GRIDX) / M.DISPLAYX && y >= 0 && y <= M.GRIDY / M.DISPLAYY) {
        const idx = Math.trunc(y * M.DISPLAYY) * M.GRIDX + Math.trunc(x * M.DISPLAYX - M.OFFSETX);
        return idx < M.TOTAL ? idx : null;
      }
      return null;
    }
    count(idx) {
      const x = idx % M.GRIDX;
      const y = Math.trunc(idx / M.GRIDX);
      let c = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < M.GRIDX && ny >= 0 && ny < M.GRIDY && this.actual[ny * M.GRIDX + nx] === T.Bomb) c++;
        }
      }
      return c;
    }
    initGrid(start) {
      let i = 0;
      while (i < M.BOMBS) {
        const nb = rand(M.TOTAL);
        if (this.actual[nb] === T.Bomb) continue;
        this.actual[nb] = T.Bomb;
        if (this.count(start) !== T.Empty) { this.actual[nb] = T.Empty; continue; }
        i++;
      }
      for (let k = 0; k < M.TOTAL; k++) if (this.actual[k] !== T.Bomb) this.actual[k] = this.count(k);
    }
    discover(nx, ny) {
      const idx = ny * M.GRIDX + nx;
      if (nx < 0 || nx >= M.GRIDX || ny < 0 || ny >= M.GRIDY || this.show[idx] === this.actual[idx] || this.show[idx] === T.Flag) return T.None;
      this.show[idx] = this.actual[idx];
      this.score += M.TILE;
      if (this.show[idx] === T.Empty) {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) this.discover(nx + dx, ny + dy);
      }
      return this.show[idx];
    }
    revealTile(idx) {
      if (!this.start) { this.start = true; this.initGrid(idx); }
      const tile = this.discover(idx % M.GRIDX, Math.trunc(idx / M.GRIDX));
      if (tile === T.Bomb) { this.lost = true; this.bombClock = 0; this.score = 0; }
    }
    placeFlag(idx) {
      if (this.show[idx] === T.Cover) {
        if (this.flag === 0) return;
        this.show[idx] = T.Flag;
        this.score += M.FLAG;
        this.flag--;
      } else if (this.show[idx] === T.Flag) {
        this.show[idx] = T.Cover;
        this.flag++;
        this.score -= M.FLAG;
      }
    }
    bombDiscovery() {
      if (this.bombClock < 0.4) return;
      this.bombClock = 0;
      for (let i = 0; i < M.TOTAL; i++) {
        if (this.actual[i] === T.Bomb && this.show[i] !== T.Bomb && this.show[i] !== T.Flag) { this.show[i] = T.Bomb; break; }
        if (this.actual[i] !== T.Bomb && this.show[i] === T.Flag) { this.show[i] = T.Cover; break; }
      }
    }
    getElements() {
      const pad = (n, len) => String(Math.max(0, Math.trunc(n))).padStart(len, '0');
      const out = [
        entity(-1, [0.05, 0.15], [0.1, 0.05], { str: 'Timer:' }),
        entity(-1, [0.0775, 0.25], [0.05, 0.05], { str: pad(this.totalTime, 3) }),
        entity(-1, [0.05, 0.45], [0.1, 0.05], { str: 'Flags:' }),
        entity(-1, [0.08, 0.55], [0.04, 0.05], { str: pad(this.flag, 2) }),
        entity(-1, [0.05, 0.7], [0.1, 0.05], { str: 'Score:' }),
        entity(-1, [0.05, 0.8], [0.1, 0.05], { str: pad(this.score, 6) }),
      ];
      for (let i = 0; i < M.TOTAL; i++) out.push(entity(this.show[i], this.tilePos(i), [1 / M.DISPLAYX, 1 / M.DISPLAYY]));
      return out;
    }
    loadCommand() { return this.commands.splice(0); }
  }
  const GAME_CLASSES = { 'lib/arcade_menu.so': GameMenu, 'lib/arcade_snake.so': GameSnake, 'lib/arcade_minesweeper.so': GameMinesweeper };

  /* ---------- Police : la police « Arcade Normal » du projet n'est pas redistribuée ;
     ses lettres capitales pixelisées sont rendues par une police 5 × 7 en points. ---------- */
  const GLYPHS = {
    A: '7e1111117e', B: '7f49494936', C: '3e41414122', D: '7f4141221c', E: '7f49494941', F: '7f09090901', G: '3e4149497a',
    H: '7f0808087f', I: '00417f4100', J: '2040413f01', K: '7f08142241', L: '7f40404040', M: '7f020c027f', N: '7f0408107f',
    O: '3e4141413e', P: '7f09090906', Q: '3e4151215e', R: '7f09192946', S: '4649494931', T: '01017f0101', U: '3f4040403f',
    V: '1f2040201f', W: '3f4038403f', X: '6314081463', Y: '0708700807', Z: '6151494543',
    0: '3e5149453e', 1: '00427f4000', 2: '4261514946', 3: '2141454b31', 4: '1814127f10', 5: '2745454539', 6: '3c4a494930',
    7: '0171090503', 8: '3649494936', 9: '064949291e', ':': '0036360000', '#': '147f147f14', '/': '2010080402',
    _: '4040404040', '-': '0808080808', '.': '0060600000', ' ': '0000000000',
  };
  const textCache = new Map();
  function textBitmap(str, color) {
    const key = `${str}|${color.join(',')}`;
    if (textCache.has(key)) return textCache.get(key);
    const chars = [...str.toUpperCase()];
    const c = document.createElement('canvas');
    c.width = Math.max(1, chars.length * 6 - 1);
    c.height = 7;
    const g = c.getContext('2d');
    g.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`;
    chars.forEach((ch, i) => {
      const hex = GLYPHS[ch] || GLYPHS[' '];
      for (let col = 0; col < 5; col++) {
        const bits = parseInt(hex.slice(col * 2, col * 2 + 2), 16);
        for (let row = 0; row < 7; row++) if (bits & (1 << row)) g.fillRect(i * 6 + col, row, 1, 1);
      }
    });
    if (textCache.size > 400) textCache.clear();
    textCache.set(key, c);
    return c;
  }

  /* ---------- lib/graphicals : trois affichages ---------- */
  const images = new Map();
  const loadImage = (name) => {
    if (!images.has(name)) {
      const img = new Image();
      img.src = `assets/arcade/${name}.png`;
      images.set(name, img);
    }
    return images.get(name);
  };
  const css = (c) => `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
  // SDL2 et SFML : fond noir, sprites étirés au rectangle et tournés autour de leur centre,
  // texte étiré au rectangle (TTF_RenderText_Solid sans lissage pour SDL2, sf::Text lissé pour SFML).
  function windowDisplay(kind) {
    let sprites = [];
    return {
      kind,
      title: kind === 'sdl2' ? 'SDL2 graphical library' : 'SFML graphical library',
      fps: 60,
      setAssets(assets) { sprites = assets.images.map(loadImage); },
      draw(ctx, entities) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, WINX, WINY);
        entities.forEach((e) => {
          const x = Math.trunc(e.pos[0] * WINX);
          const y = Math.trunc(e.pos[1] * WINY);
          const w = Math.trunc(e.size[0] * WINX);
          const h = Math.trunc(e.size[1] * WINY);
          if (e.idx >= 0 && e.idx < sprites.length) {
            const img = sprites[e.idx];
            if (!img.complete || !img.naturalWidth) return;
            ctx.save();
            ctx.imageSmoothingEnabled = kind === 'sfml';
            ctx.translate(x + w / 2, y + h / 2);
            ctx.rotate((e.rotation * Math.PI) / 180);
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
          } else if (e.str !== null) {
            ctx.imageSmoothingEnabled = kind === 'sfml';
            ctx.drawImage(textBitmap(e.str, e.color), x, y + (kind === 'sfml' ? Math.round(h * 0.12) : 0), w, h);
          } else {
            ctx.fillStyle = css(e.color);
            ctx.fillRect(x, y, w, h);
          }
        });
      },
      pointer(px, py) { return [px / WINX, py / WINY]; },
    };
  }
  // NCURSES : terminal de 96 × 27 caractères, chaque entité écrit le caractère de son fichier .txt
  // (ou sa chaîne) à la position mise à l'échelle ; couleurs des paires 1 à 4, rouge par défaut.
  const COLS = 96;
  const ROWS = 27;
  const CELLW = WINX / COLS;
  const CELLH = WINY / ROWS;
  const TERM_COLORS = { white: '#e6e3f2', red: '#ff5f6d', green: '#5fd38a', blue: '#4f7cff' };
  function ncursesDisplay() {
    let chars = [];
    return {
      kind: 'ncurses',
      title: 'Terminal · ./arcade lib/arcade_sdl2.so',
      fps: 30,
      setAssets(assets) { chars = assets.txt; },
      draw(ctx, entities) {
        const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
        const put = (row, col, text, color) => {
          if (row < 0 || row >= ROWS) return;
          for (let i = 0; i < text.length && col + i < COLS; i++) if (col + i >= 0) grid[row][col + i] = [text[i], color];
        };
        entities.forEach((e) => {
          const c = e.color.join();
          const color = c === WHITE.join() ? 'white' : c === GREEN.join() ? 'green' : c === BLUE.join() ? 'blue' : 'red';
          const row = Math.trunc(e.pos[1] * ROWS);
          const col = Math.trunc(e.pos[0] * COLS);
          if (e.idx >= 0 && e.idx < chars.length) put(row, col, chars[e.idx], color);
          if (e.str !== null) put(row, col, e.str, color);
        });
        ctx.fillStyle = '#14131c';
        ctx.fillRect(0, 0, WINX, WINY);
        ctx.font = `500 ${Math.round(CELLH * 0.8)}px "JetBrains Mono", ui-monospace, monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        grid.forEach((line, row) => line.forEach((cell, col) => {
          if (!cell || cell[0] === ' ') return;
          ctx.fillStyle = TERM_COLORS[cell[1]];
          ctx.fillText(cell[0], col * CELLW + CELLW / 2, row * CELLH + CELLH / 2 + 1);
        }));
      },
      // getEvent : position de la souris en cellules, divisée par (taille - PRINT_OFFSET)
      pointer(px, py) { return [Math.floor(px / CELLW) / (COLS - 1), Math.floor(py / CELLH) / (ROWS - 1)]; },
    };
  }
  const DISPLAY_FACTORY = { 'lib/arcade_sdl2.so': () => windowDisplay('sdl2'), 'lib/arcade_sfml.so': () => windowDisplay('sfml'), 'lib/arcade_ncurses.so': ncursesDisplay };

  /* ---------- Interface ---------- */
  const emu = document.createElement('div');
  emu.className = 'arcade-emu';
  emu.hidden = true;
  emu.innerHTML = `
    <div class="arcade-emu__bar"><span class="arcade-emu__title"></span><span class="arcade-emu__buttons" aria-hidden="true"><i></i><i></i></span></div>
    <div class="arcade-emu__screen">
      <canvas class="arcade-emu__canvas" width="960" height="540" tabindex="0" role="application" aria-roledescription="jeu"></canvas>
      <div class="arcade-emu__veil" hidden>
        <p class="arcade-emu__veil-text"></p>
        <button class="arcade-emu__resume" type="button"></button>
      </div>
    </div>`;
  stage.append(emu);
  const canvas = emu.querySelector('canvas');
  const screenEl = emu.querySelector('.arcade-emu__screen');
  const ctx = canvas.getContext('2d');
  const titleEl = emu.querySelector('.arcade-emu__title');
  const bar = emu.querySelector('.arcade-emu__bar');
  const veil = emu.querySelector('.arcade-emu__veil');
  const veilText = emu.querySelector('.arcade-emu__veil-text');
  const resume = emu.querySelector('.arcade-emu__resume');

  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'arcade-play';
  play.innerHTML = '<span class="arcade-play__label">Jouer à Arcade</span><span class="arcade-play__hint">Le vrai projet, porté en JavaScript</span>';
  stage.append(play);
  // Le jeu se joue au clavier et à la souris : sur téléphone et tablette, la vidéo reste seule
  // (le schéma change quand même de jeu et d'affichage). Sur ordinateur, elle est floutée sous le bouton.
  const desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
  const lock = () => {
    if (started) return;
    play.hidden = !desktop.matches;
    stage.classList.toggle('is-locked', desktop.matches);
  };
  desktop.addEventListener('change', lock);

  const controls = document.createElement('div');
  controls.className = 'arcade-controls';
  controls.hidden = true;
  controls.innerHTML = `
    <div class="arcade-controls__keys" role="group" aria-label="Touches du Core d'Arcade">
      <button type="button" data-builtin="F1"><kbd>F1</kbd> Menu</button>
      <button type="button" data-builtin="F2"><kbd>F2</kbd> Recommencer</button>
      <button type="button" data-builtin="F3"><kbd>F3</kbd> Jeu suivant</button>
      <button type="button" data-builtin="Equal"><kbd>=</kbd> Affichage suivant</button>
      <button type="button" data-builtin="F4"><kbd>F4</kbd> Quitter</button>
      <button type="button" data-fullscreen>Plein écran</button>
    </div>
    <div class="arcade-pad" role="group" aria-label="Commandes tactiles">
      <button type="button" data-key="Up" aria-label="Haut">↑</button>
      <button type="button" data-key="Left" aria-label="Gauche">←</button>
      <button type="button" data-key="Down" aria-label="Bas">↓</button>
      <button type="button" data-key="Right" aria-label="Droite">→</button>
      <button type="button" data-key="Enter">Entrée</button>
      <button type="button" data-key="Backspace" aria-label="Effacer">⌫</button>
      <button type="button" data-flag aria-pressed="false">Drapeau</button>
    </div>
    <p class="arcade-controls__help" aria-live="polite"></p>`;
  media.insertBefore(controls, caption);
  const help = controls.querySelector('.arcade-controls__help');
  const flagBtn = controls.querySelector('[data-flag]');

  /* ---------- Core (src/Core.cpp) ---------- */
  let display;
  let displayPath;
  let game;
  let gamePath;
  let user = '___';
  let alive = false;
  let started = false;
  let paused = true;
  let raf = 0;
  let lastFrame = 0;
  let pending = null;
  let mouse = [0, 0];

  function loadAssets() { display.setAssets(game.assets); }
  function loadGameModule(path) { gamePath = path; game = new GAME_CLASSES[path](); }
  function loadDisplayModule(path) { displayPath = path; display = DISPLAY_FACTORY[path](); }
  const COMMANDS = {
    LoadDisplay([path]) { if (path && path !== displayPath) { loadDisplayModule(path); loadAssets(); } },
    LoadGame([path]) { if (path) { loadGameModule(path); loadAssets(); } },
    RestartGame() { loadGameModule(gamePath); loadAssets(); },
    BackToMenu() { loadGameModule(MENU); loadAssets(); },
    LoadUser([name]) { if (name) user = name; },
    LoadScore([score]) {
      if (score !== undefined && !user.includes('_') && /^\d+/.test(score)) appendCsv(`${user},${gamePath},${parseInt(score, 10)}\n`);
    },
  };
  const BUILTINS = {
    F1: () => COMMANDS.BackToMenu(),
    F2: () => COMMANDS.RestartGame(),
    F3: () => COMMANDS.LoadGame([GAMES[(GAMES.indexOf(gamePath) + 1) % GAMES.length]]),
    Equal: () => COMMANDS.LoadDisplay([DISPLAYS[(DISPLAYS.indexOf(displayPath) + 1) % DISPLAYS.length]]),
  };
  function boot() {
    loadDisplayModule('lib/arcade_sdl2.so');
    loadGameModule(MENU);
    loadAssets();
    user = '___';
    alive = true;
  }
  function step() {
    const event = pending || ['None', mouse];
    pending = null;
    const before = `${gamePath}|${displayPath}`;
    game.simulate(event);
    display.draw(ctx, game.getElements());
    if (event[0] === 'F4' || event[0] === 'Close') { close(); return; }
    if (BUILTINS[event[0]]) BUILTINS[event[0]]();
    game.loadCommand().forEach(([signal, args]) => COMMANDS[signal](args));
    if (`${gamePath}|${displayPath}` !== before) sync(true);
  }
  function frame(t) {
    raf = 0;
    if (paused || !alive) return;
    if (t - lastFrame >= 1000 / display.fps - 2) {
      lastFrame = t;
      step();
    }
    raf = requestAnimationFrame(frame);
  }
  function setPaused(value, reason) {
    if (!alive) return;
    if (value === paused) return;
    paused = value;
    if (paused) {
      pausedAt = performance.now();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      showVeil(reason || 'En pause', 'Reprendre');
    } else {
      pausedTotal += performance.now() - pausedAt;
      pausedAt = null;
      veil.hidden = true;
      raf = requestAnimationFrame(frame);
    }
  }
  function showVeil(text, action) {
    veilText.textContent = text;
    resume.textContent = action;
    veil.hidden = false;
  }
  function close() {
    alive = false;
    paused = true;
    pausedAt = performance.now();
    showVeil('Arcade s\'est fermé (F4).', 'Relancer Arcade');
    sync(false);
  }

  /* ---------- Synchronisation avec le schéma (jeu × affichage) et l'aide ---------- */
  const HELP = {
    menu: 'Menu : ← → choisit la colonne, ↑ ↓ la bibliothèque, lettres et ⌫ pour le nom, Entrée pour lancer.',
    snake: 'Snake : flèches ou Z Q S D. Chaque pomme vaut 10 points ; un mur ou la queue relance la partie.',
    minesweeper: 'Minesweeper : clic gauche pour creuser, clic droit (ou « Drapeau » sur écran tactile) pour un drapeau. Entrée recommence.',
  };
  function sync(animate) {
    const g = libName(gamePath);
    const d = libName(displayPath);
    titleEl.textContent = display.title;
    bar.classList.toggle('arcade-emu__bar--term', d === 'ncurses');
    canvas.setAttribute('aria-label', `Arcade : ${NAMES[g]} avec ${NAMES[d]}. ${HELP[g]} Échap pour sortir du jeu.`);
    help.textContent = HELP[g];
    controls.dataset.game = g;
    if (!arch) return;
    arch.querySelectorAll('button.chip').forEach((chip) => {
      const on = chip.textContent.trim().toLowerCase() === (chip.dataset.chip === 'game' ? g : d);
      if (on !== (chip.getAttribute('aria-pressed') === 'true')) chip.classList.toggle('just-loaded', on && animate);
      chip.setAttribute('aria-pressed', String(on));
    });
    const load = arch.querySelector('[data-load="game"]');
    const loadD = arch.querySelector('[data-load="display"]');
    if (load) load.textContent = NAMES[g];
    if (loadD) loadD.textContent = NAMES[d];
    if (animate) {
      arch.classList.remove('is-swapping');
      void arch.offsetWidth;
      arch.classList.add('is-swapping');
    }
  }

  /* ---------- Démarrage, pause, plein écran ---------- */
  // La fenêtre 960 × 540 garde son format dans l'écran (plein écran compris) ; la définition du canevas
  // suit sa taille affichée et la densité de pixels de l'écran.
  function resize() {
    const box = screenEl.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const cssW = Math.min(box.width, (box.height * WINX) / WINY);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${(cssW * WINY) / WINX}px`;
    const scale = Math.min(3, Math.max(1, (cssW * (window.devicePixelRatio || 1)) / WINX));
    const w = Math.round(WINX * scale);
    if (canvas.width !== w) {
      canvas.width = w;
      canvas.height = Math.round(WINY * scale);
    }
    ctx.setTransform(canvas.width / WINX, 0, 0, canvas.height / WINY, 0, 0);
    if (alive && display) display.draw(ctx, game.getElements());
  }
  function start() {
    if (!started) {
      started = true;
      if (videoWrap) {
        videoWrap.querySelectorAll('video').forEach((v) => { v.dataset.inactive = ''; v.pause(); });
        if (window.videoManager) window.videoManager.refresh();
        videoWrap.hidden = true;
      }
      play.hidden = true;
      stage.classList.remove('is-locked');
      emu.hidden = false;
      controls.hidden = false;
      media.classList.add('is-playing');
      if (caption) caption.textContent = 'Arcade porté en JavaScript : le même menu, les mêmes jeux et les trois affichages du projet, interchangeables à chaud.';
    }
    if (!alive) boot();
    resize();
    sync(false);
    canvas.focus({ preventScroll: true });
    setPaused(false);
  }
  play.addEventListener('click', start);
  resume.addEventListener('click', start);
  canvas.addEventListener('focus', () => { if (alive && started) setPaused(false); });
  canvas.addEventListener('blur', () => {
    if (document.fullscreenElement === emu && document.hasFocus()) return;
    setPaused(true, 'En pause : la fenêtre du jeu n\'a plus le focus.');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) setPaused(true); }).observe(emu);
  }
  window.addEventListener('resize', () => { if (started) resize(); });
  controls.querySelector('[data-fullscreen]').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (emu.requestFullscreen) emu.requestFullscreen().then(() => canvas.focus({ preventScroll: true })).catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => { setTimeout(resize, 50); });

  /* ---------- Entrées : clavier, souris, tactile ---------- */
  const KEYS = { ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Enter: 'Enter', Backspace: 'Backspace', ' ': 'Space', '=': 'Equal', F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4' };
  function actionOf(event) {
    if (KEYS[event.key]) return KEYS[event.key];
    if (/^[a-z]$/i.test(event.key)) return event.key.toUpperCase();
    if (/^[0-9]$/.test(event.key)) return `Num${event.key}`;
    return null;
  }
  const send = (action, pos = mouse) => { pending = [action, pos]; };
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { canvas.blur(); return; }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const action = actionOf(event);
    if (!action) return;
    event.preventDefault();
    if (alive && !paused) send(action);
  });
  const pointerPos = (event) => {
    const rect = canvas.getBoundingClientRect();
    return display.pointer(((event.clientX - rect.left) / rect.width) * WINX, ((event.clientY - rect.top) / rect.height) * WINY);
  };
  canvas.addEventListener('pointermove', (event) => { if (display) mouse = pointerPos(event); });
  canvas.addEventListener('pointerdown', (event) => {
    if (!alive || paused) return;
    mouse = pointerPos(event);
    const flag = flagBtn.getAttribute('aria-pressed') === 'true';
    const action = event.button === 2 || (flag && event.pointerType !== 'mouse') ? 'RightMouse' : event.button === 1 ? 'MiddleMouse' : 'LeftMouse';
    send(action);
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  controls.addEventListener('click', (event) => {
    const b = event.target.closest('button');
    if (!b) return;
    if (b.dataset.flag !== undefined) {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    const action = b.dataset.builtin || b.dataset.key;
    if (!action) return;
    if (!alive) { start(); return; }
    if (paused) start();
    send(action);
  });
  if (arch) {
    arch.addEventListener('click', (event) => {
      const chip = event.target.closest('button.chip');
      if (!chip) return;
      const name = chip.textContent.trim().toLowerCase();
      const playing = desktop.matches || started;
      if (playing && (!started || !alive)) start();
      if (chip.dataset.chip === 'game') COMMANDS.LoadGame([`lib/arcade_${name}.so`]);
      else COMMANDS.LoadDisplay([`lib/arcade_${name}.so`]);
      sync(true);
      if (playing) canvas.focus({ preventScroll: true });
    });
    // État affiché avant le lancement : le Core démarre sur le menu avec SDL2 (./arcade lib/arcade_sdl2.so).
    boot();
    alive = false;
    sync(false);
  }
  lock();
})();
