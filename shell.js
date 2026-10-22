'use strict';

/* ==========================================================================
   my_shell (42sh) : émulation dans le navigateur
   Reproduit le comportement du vrai 42sh (dossier PROJECTS/42sh) : prompt « %P %U %N[%R] %T %H %G> »,
   séparateurs ; && ||, pipes, redirections < > >> <<, variables ($VAR, $?), ~, globbing * et ?,
   builtins (cd, env, setenv, unsetenv, exit, alias, unalias, history, which, where, repeat, set, unset)
   et leurs messages d'erreur. Les programmes externes (ls, cat, grep…) sont simulés sur un petit
   système de fichiers en mémoire : rien n'est exécuté sur une vraie machine.
   ========================================================================== */
(function initShell() {
  const root = document.querySelector('[data-shell]');
  if (!root) return;
  const screen = root.querySelector('.term__screen');
  const form = root.querySelector('.term__form');
  const input = root.querySelector('.term__input');
  const ps = root.querySelector('.term__ps');
  const tryBox = root.querySelector('.term__try');
  if (!screen || !form || !input || !ps) return;

  /* ---------- Messages : ceux de include/formatsh.h ---------- */
  const MSG = {
    notFound: (c) => `${c}: Command not found.`,
    noFile: (p) => `${p}: No such file or directory.`,
    notDir: (p) => `${p}: Not a directory.`,
    cdTooMany: 'cd: Too many arguments.',
    setenvLetter: 'setenv: Variable name must begin with a letter.',
    setenvAlnum: 'setenv: Variable name must contain alphanumeric characters.',
    setenvTooMany: 'setenv: Too many arguments.',
    unsetenvTooFew: 'unsetenv: Too few arguments.',
    exitSyntax: 'exit: Expression Syntax.',
    ambiIn: 'Ambiguous input redirect.',
    ambiOut: 'Ambiguous output redirect.',
    missName: 'Missing name for redirect.',
    nullCom: 'Invalid null command.',
    unalias: 'unalias: Too few arguments.',
    historyBad: 'history: Badly formed number.',
    historyTooMany: 'history: Too many arguments.',
    whichTooFew: 'which: Too few arguments.',
    whichBuiltin: (c) => `${c}: shell built-in command.`,
    whereTooFew: 'where: Too few arguments.',
    whereBuiltin: (c) => `${c} is a shell built-in`,
    repeatBad: 'repeat: Badly formed number.',
    repeatTooFew: 'repeat: Too few arguments.',
    noMatch: (c) => `${c}: No match.`,
    setLetter: 'set: Variable name must begin with a letter.',
    setAlnum: 'set: Variable name must contain alphanumeric characters.',
    unsetTooFew: 'unset: Too few arguments.',
    undVar: (v) => `${v}: Undefined variable.`,
    unmatched: (c) => `Unmatched '${c}'.`,
  };

  /* ---------- Système de fichiers en mémoire ---------- */
  const HOME = '/home/visiteur';
  const dir = (children = {}) => ({ type: 'dir', children });
  const file = (content) => ({ type: 'file', content });
  const fsRoot = dir({
    bin: dir(), usr: dir({ bin: dir() }), tmp: dir(),
    home: dir({
      visiteur: dir({
        'README.md': file('my_shell\n\nmy_shell is a simple TCSH-like shell implementation.\nFeatures : pipes, semicolon and redirections (< << > ; |),\nenvironment, aliases, history, variables, scripting.\n'),
        'notes.txt': file('Lunar Lander\nZappy\nRaytracer\nDoctor Cvrie\nArcade\nmy_shell\n'),
        my_shell: dir({
          '.git': dir({ HEAD: file('ref: refs/heads/main\n') }),
          Makefile: file('NAME = 42sh\n\nall: $(NAME)\n'),
          src: dir({
            'main.c': file('#include <stdio.h>\n#include <unistd.h>\n\n#include "mysh.h"\n#include "my.h"\n\nint main(int const argc,\n    char const __attribute_maybe_unused__ **argv, char **env)\n{\n    system_t *system = initialize_system(env);\n\n    if (argc != 1 || system == NULL)\n        return EPI_ERROR;\n    return mysh(system);\n}\n'),
            'mysh.c': file('/* boucle principale : prompt, lecture, arbre de commandes, exécution */\n'),
          }),
        }),
      }),
    }),
  });

  const EXTERNAL = ['ls', 'cat', 'echo', 'pwd', 'grep', 'wc', 'head', 'tail', 'mkdir', 'touch', 'rm', 'clear', 'date', 'whoami', 'sort', 'true', 'false', 'help'];
  const BUILTINS = ['cd', 'env', 'setenv', 'unsetenv', 'exit', 'alias', 'unalias', 'history', 'which', 'where', 'repeat', 'foreach', 'jkill', 'set', 'unset', 'if', 'ai-setup', 'fg', 'jobs'];

  let env;
  let vars;
  let aliases;
  let history;
  let cwd;
  let status;
  let alive;

  function reset() {
    env = new Map([['USER', 'visiteur'], ['HOME', HOME], ['PATH', '/usr/bin:/bin'], ['PWD', HOME], ['SHELL', '/bin/42sh']]);
    vars = new Map();
    aliases = new Map();
    history = [];
    cwd = HOME;
    status = 0;
    alive = true;
  }

  const normalize = (path) => {
    const parts = [];
    path.split('/').forEach((part) => {
      if (!part || part === '.') return;
      if (part === '..') parts.pop();
      else parts.push(part);
    });
    return `/${parts.join('/')}`;
  };
  const resolve = (path) => normalize(path.startsWith('/') ? path : `${cwd}/${path}`);
  const lookup = (abs) => {
    let node = fsRoot;
    for (const part of abs.split('/').filter(Boolean)) {
      if (node.type !== 'dir' || !node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  };
  const parentOf = (abs) => ({ parent: lookup(normalize(`${abs}/..`)), name: abs.split('/').filter(Boolean).pop() });
  const writeFile = (path, content, append) => {
    const abs = resolve(path);
    const { parent, name } = parentOf(abs);
    if (!parent || parent.type !== 'dir' || !name) return MSG.noFile(path);
    const existing = parent.children[name];
    if (existing && existing.type === 'dir') return `${path}: Is a directory.`;
    parent.children[name] = file(append && existing ? existing.content + content : content);
    return null;
  };
  const display = (abs) => (abs === HOME || abs.startsWith(`${HOME}/`) ? `~${abs.slice(HOME.length)}` : abs);

  /* ---------- Prompt : « %P %U %C%N[%R] %T %H %G> » (src/parsing/prompt.c) ---------- */
  function promptHtml() {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const git = lookup(`${cwd}/.git`) ? ' <span class="term__ps-git">on main</span>' : '';
    const path = cwd.startsWith(HOME) ? cwd.slice(HOME.length) : cwd;
    return `<span class="term__ps-path">~${escape(path)}&gt;</span> <span class="term__ps-user">visiteur</span>\n` +
      `[<span class="${status === 0 ? 'term__ps-ok' : 'term__ps-ko'}">${status}</span>] ${time} portfolio${git}&gt; `;
  }
  const escape = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Affichage ---------- */
  function print(text, kind) {
    if (text === '' || text == null) return;
    const line = document.createElement('span');
    line.className = kind === 'err' ? 'term__err' : 'term__out';
    line.textContent = text.endsWith('\n') ? text.slice(0, -1) : text;
    screen.append(line);
  }
  function echoCommand(cmd) {
    const line = document.createElement('span');
    line.className = 'term__cmd';
    line.innerHTML = `${promptHtml()}${escape(cmd)}`;
    screen.append(line);
  }
  const scrollDown = () => { screen.scrollTop = screen.scrollHeight; };
  const refreshPrompt = () => {
    const [l1, l2] = promptHtml().split('\n');
    ps.innerHTML = `<span class="term__ps-l1">${l1}</span><span class="term__ps-l2">${l2}</span>`;
  };

  /* ---------- Analyse : mots, opérateurs, guillemets ---------- */
  function tokenize(line) {
    const tokens = [];
    let i = 0;
    let word = null;
    const push = () => { if (word !== null) { tokens.push(word); word = null; } };
    while (i < line.length) {
      const c = line[i];
      if (c === ' ' || c === '\t') { push(); i++; continue; }
      const two = line.slice(i, i + 2);
      if (['&&', '||', '>>', '<<'].includes(two)) { push(); tokens.push({ op: two }); i += 2; continue; }
      if ([';', '|', '>', '<'].includes(c)) { push(); tokens.push({ op: c }); i++; continue; }
      if (c === '"' || c === "'") {
        const end = line.indexOf(c, i + 1);
        if (end < 0) throw new Error(MSG.unmatched(c));
        if (word === null) word = { text: '', quoted: true, parts: [] };
        word.parts.push({ text: line.slice(i + 1, end), expand: c === '"' });
        word.quoted = true;
        i = end + 1;
        continue;
      }
      if (word === null) word = { text: '', quoted: false, parts: [] };
      const last = word.parts[word.parts.length - 1];
      if (last && last.raw) last.text += c; // caractères hors guillemets regroupés : « $NAME » reste entier
      else word.parts.push({ text: c, expand: true, raw: true });
      i++;
    }
    push();
    return tokens;
  }

  // Développe $VAR, $? et ~ ; lève une erreur pour une variable inconnue (comme tcsh).
  function expandWord(word) {
    let out = '';
    let glob = false;
    word.parts.forEach((part, index) => {
      let text = part.text;
      if (part.expand) {
        text = text.replace(/\$(\?|[A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => {
          if (name === '?') return String(status);
          if (vars.has(name)) return vars.get(name);
          if (env.has(name)) return env.get(name);
          throw new Error(MSG.undVar(name));
        });
      }
      if (part.raw && /[*?]/.test(part.text.replace(/\$\?/g, ''))) glob = true; // « $? » n'est pas un motif
      if (part.raw && index === 0 && (text === '~' || text.startsWith('~/'))) text = (env.get('HOME') || HOME) + text.slice(1);
      out += text;
    });
    return { text: out, glob };
  }
  // ~ en début de mot non entre guillemets
  const joinRaw = (word) => word.parts.map((p) => p.text).join('');

  function expandGlob(pattern, cmdName) {
    const abs = resolve(pattern.includes('/') ? pattern.slice(0, pattern.lastIndexOf('/') + 1) || '/' : '.');
    const node = lookup(abs);
    const base = pattern.includes('/') ? pattern.slice(pattern.lastIndexOf('/') + 1) : pattern;
    const prefix = pattern.includes('/') ? pattern.slice(0, pattern.lastIndexOf('/') + 1) : '';
    const re = new RegExp(`^${base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
    const matches = node && node.type === 'dir'
      ? Object.keys(node.children).filter((n) => !n.startsWith('.') && re.test(n)).sort().map((n) => prefix + n)
      : [];
    if (!matches.length) throw new Error(MSG.noMatch(cmdName));
    return matches;
  }

  // Découpe en séquences (;), chaînes (&& ||), pipelines (|) et commandes avec redirections.
  function parse(tokens) {
    const sequences = [[]];
    tokens.forEach((t) => {
      if (t.op === ';') sequences.push([]);
      else sequences[sequences.length - 1].push(t);
    });
    return sequences.filter((seq) => seq.length).map((seq) => {
      const chain = [];
      let current = [];
      let link = null;
      seq.forEach((t) => {
        if (t.op === '&&' || t.op === '||') {
          if (!current.length) throw new Error(MSG.nullCom);
          chain.push({ link, tokens: current });
          link = t.op;
          current = [];
        } else current.push(t);
      });
      if (!current.length) throw new Error(MSG.nullCom);
      chain.push({ link, tokens: current });
      return chain.map(({ link: l, tokens: toks }) => ({ link: l, pipeline: parsePipeline(toks) }));
    });
  }
  function parsePipeline(tokens) {
    const cmds = [[]];
    tokens.forEach((t) => {
      if (t.op === '|') cmds.push([]);
      else cmds[cmds.length - 1].push(t);
    });
    if (cmds.some((c) => !c.length)) throw new Error(MSG.nullCom);
    return cmds.map((toks, index) => {
      const cmd = { words: [], inFile: null, heredoc: null, outFile: null, append: false };
      for (let i = 0; i < toks.length; i++) {
        const t = toks[i];
        if (!t.op) { cmd.words.push(t); continue; }
        const target = toks[i + 1];
        if (!target || target.op) throw new Error(MSG.missName);
        i++;
        if (t.op === '>' || t.op === '>>') {
          if (cmd.outFile || index < cmds.length - 1) throw new Error(MSG.ambiOut);
          cmd.outFile = target;
          cmd.append = t.op === '>>';
        } else {
          if (cmd.inFile || cmd.heredoc !== null || index > 0) throw new Error(MSG.ambiIn);
          if (t.op === '<') cmd.inFile = target;
          else cmd.heredoc = joinRaw(target);
        }
      }
      if (!cmd.words.length) throw new Error(MSG.nullCom);
      return cmd;
    });
  }

  /* ---------- Programmes simulés ---------- */
  const readInput = (args, stdin, name) => {
    if (!args.length) return { text: stdin, err: '' };
    let text = '';
    let err = '';
    args.forEach((a) => {
      const node = lookup(resolve(a));
      if (!node) err += `${name}: ${MSG.noFile(a)}\n`;
      else if (node.type === 'dir') err += `${name}: ${a}: Is a directory\n`;
      else text += node.content;
    });
    return { text, err };
  };
  const lines = (text) => (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n');
  const programs = {
    echo(args) {
      const noNl = args[0] === '-n';
      const out = (noNl ? args.slice(1) : args).join(' ');
      return { out: noNl ? out : `${out}\n` };
    },
    pwd: () => ({ out: `${cwd}\n` }),
    whoami: () => ({ out: 'visiteur\n' }),
    date: () => ({ out: `${new Date().toString()}\n` }),
    true: () => ({ out: '' }),
    false: () => ({ out: '', status: 1 }),
    clear: () => ({ clear: true }),
    ls(args) {
      const flags = args.filter((a) => a.startsWith('-')).join('');
      const paths = args.filter((a) => !a.startsWith('-'));
      const all = flags.includes('a');
      const long = flags.includes('l');
      let out = '';
      let err = '';
      (paths.length ? paths : ['.']).forEach((p, i, list) => {
        const node = lookup(resolve(p));
        if (!node) { err += `ls: cannot access '${p}': No such file or directory\n`; return; }
        if (node.type === 'file') { out += `${p}\n`; return; }
        if (list.length > 1) out += `${i ? '\n' : ''}${p}:\n`;
        const names = Object.keys(node.children).filter((n) => all || !n.startsWith('.')).sort();
        if (long) {
          names.forEach((n) => {
            const child = node.children[n];
            const size = child.type === 'file' ? child.content.length : 4096;
            out += `${child.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'} 1 visiteur visiteur ${String(size).padStart(5)} ${n}\n`;
          });
        } else if (names.length) out += `${names.join('  ')}\n`;
      });
      return { out, err, status: err ? 2 : 0 };
    },
    cat(args, stdin) {
      const showEnds = args.includes('-e');
      const { text, err } = readInput(args.filter((a) => a !== '-e'), stdin, 'cat');
      const out = showEnds && text ? text.replace(/\n/g, '$\n') : text;
      return { out, err, status: err ? 1 : 0 };
    },
    grep(args, stdin) {
      if (!args.length) return { err: 'Usage: grep PATTERN [FILE]...\n', status: 2 };
      const [pattern, ...files] = args;
      const { text, err } = readInput(files, stdin, 'grep');
      const found = text ? lines(text).filter((l) => l.includes(pattern)) : [];
      return { out: found.length ? `${found.join('\n')}\n` : '', err, status: found.length ? 0 : 1 };
    },
    wc(args, stdin) {
      const flags = args.filter((a) => a.startsWith('-')).join('');
      const { text, err } = readInput(args.filter((a) => !a.startsWith('-')), stdin, 'wc');
      const counts = { l: (text.match(/\n/g) || []).length, w: text.split(/\s+/).filter(Boolean).length, c: text.length };
      const keys = flags ? ['l', 'w', 'c'].filter((k) => flags.includes(k)) : ['l', 'w', 'c'];
      return { out: `${keys.map((k) => String(counts[k]).padStart(keys.length > 1 ? 7 : 1)).join(' ')}\n`, err };
    },
    head(args, stdin) { return slice(args, stdin, 'head'); },
    tail(args, stdin) { return slice(args, stdin, 'tail'); },
    sort(args, stdin) {
      const { text, err } = readInput(args, stdin, 'sort');
      return { out: text ? `${lines(text).sort().join('\n')}\n` : '', err };
    },
    mkdir(args) {
      let err = '';
      args.forEach((a) => {
        const abs = resolve(a);
        const { parent, name } = parentOf(abs);
        if (!parent || parent.type !== 'dir') err += `mkdir: cannot create directory '${a}': No such file or directory\n`;
        else if (parent.children[name]) err += `mkdir: cannot create directory '${a}': File exists\n`;
        else parent.children[name] = dir();
      });
      return { err, status: err ? 1 : 0 };
    },
    touch(args) {
      let err = '';
      args.forEach((a) => {
        if (!lookup(resolve(a))) { const e = writeFile(a, '', false); if (e) err += `touch: ${e}\n`; }
      });
      return { err, status: err ? 1 : 0 };
    },
    rm(args) {
      const recursive = args.some((a) => /^-.*r/.test(a));
      let err = '';
      args.filter((a) => !a.startsWith('-')).forEach((a) => {
        const abs = resolve(a);
        const node = lookup(abs);
        const { parent, name } = parentOf(abs);
        if (!node) err += `rm: cannot remove '${a}': No such file or directory\n`;
        else if (node.type === 'dir' && !recursive) err += `rm: cannot remove '${a}': Is a directory\n`;
        else delete parent.children[name];
      });
      return { err, status: err ? 1 : 0 };
    },
    help: () => ({
      out: 'Émulation de 42sh dans le navigateur (aucune commande n\'est exécutée sur une vraie machine).\n' +
        `Builtins : ${BUILTINS.filter((b) => !['foreach', 'if', 'jkill', 'ai-setup', 'fg', 'jobs'].includes(b)).join(', ')}\n` +
        `Programmes simulés : ${EXTERNAL.filter((e) => e !== 'help').join(', ')}\n` +
        'Opérateurs : ; && || | > >> < <<   Variables : $VAR $?   Motifs : * ?\n',
    }),
  };
  function slice(args, stdin, name) {
    let n = 10;
    const rest = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n') n = Number(args[++i]);
      else if (/^-\d+$/.test(args[i])) n = Number(args[i].slice(1));
      else rest.push(args[i]);
    }
    const { text, err } = readInput(rest, stdin, name);
    if (!text) return { out: '', err };
    const all = lines(text);
    const part = name === 'head' ? all.slice(0, n) : all.slice(-n);
    return { out: `${part.join('\n')}\n`, err };
  }

  /* ---------- Builtins (src/built-in) ---------- */
  const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
  const builtins = {
    cd(args) {
      if (args.length > 1) return { err: MSG.cdTooMany, status: 1 };
      let target = args[0];
      if (!target || target === '~') target = env.get('HOME') || HOME;
      else if (target === '-') {
        target = env.get('OLDPWD');
        if (!target) return { err: MSG.noFile(''), status: 1 };
      }
      const abs = resolve(target);
      const node = lookup(abs);
      if (!node) return { err: MSG.noFile(args[0]), status: 1 };
      if (node.type !== 'dir') return { err: MSG.notDir(args[0]), status: 1 };
      env.set('OLDPWD', cwd);
      cwd = abs;
      env.set('PWD', abs);
      return {};
    },
    env: () => ({ out: [...env].map(([k, v]) => `${k}=${v}`).join('\n') + '\n' }),
    setenv(args) {
      if (!args.length) return builtins.env();
      if (args.length > 2) return { err: MSG.setenvTooMany, status: 1 };
      if (!/^[A-Za-z_]/.test(args[0])) return { err: MSG.setenvLetter, status: 1 };
      if (!NAME_RE.test(args[0])) return { err: MSG.setenvAlnum, status: 1 };
      env.set(args[0], args[1] || '');
      return {};
    },
    unsetenv(args) {
      if (!args.length) return { err: MSG.unsetenvTooFew, status: 1 };
      args.forEach((a) => env.delete(a));
      return {};
    },
    exit(args) {
      if (args.length > 1 || (args[0] && !/^-?\d+$/.test(args[0]))) return { err: MSG.exitSyntax, status: 1 };
      alive = false;
      return { out: 'exit\n', status: Number(args[0] || 0) };
    },
    alias(args) {
      if (!args.length) {
        return { out: [...aliases].map(([k, v]) => (v.includes(' ') ? `${k}\t(${v})` : `${k}\t${v}`)).join('\n') + (aliases.size ? '\n' : '') };
      }
      if (args.length === 1) return { out: aliases.has(args[0]) ? `${aliases.get(args[0])}\n` : '' };
      aliases.set(args[0], args.slice(1).join(' '));
      return {};
    },
    unalias(args) {
      if (!args.length) return { err: MSG.unalias, status: 1 };
      args.forEach((a) => aliases.delete(a));
      return {};
    },
    history(args) {
      if (args.length > 1) return { err: MSG.historyTooMany, status: 1 };
      if (args[0] && !/^\d+$/.test(args[0])) return { err: MSG.historyBad, status: 1 };
      const list = args[0] ? history.slice(-Number(args[0])) : history;
      return { out: list.map((h) => ` ${h.n} ${h.cmd}`).join('\n') + (list.length ? '\n' : '') };
    },
    which(args) {
      if (!args.length) return { err: MSG.whichTooFew, status: 1 };
      let out = '';
      let st = 0;
      args.forEach((a) => {
        if (aliases.has(a)) out += `${a}: \t aliased to ${aliases.get(a)}\n`;
        else if (BUILTINS.includes(a)) out += `${MSG.whichBuiltin(a)}\n`;
        else if (EXTERNAL.includes(a) && a !== 'help') out += `/usr/bin/${a}\n`;
        else { out += `${MSG.notFound(a)}\n`; st = 1; }
      });
      return { out, status: st };
    },
    where(args) {
      if (!args.length) return { err: MSG.whereTooFew, status: 1 };
      let out = '';
      let st = 0;
      args.forEach((a) => {
        if (a.includes('/')) { out += 'where: / in command makes no sense\n'; st = 1; return; }
        if (BUILTINS.includes(a)) out += `${MSG.whereBuiltin(a)}\n`;
        if (EXTERNAL.includes(a) && a !== 'help') out += `/usr/bin/${a}\n/bin/${a}\n`;
        if (!BUILTINS.includes(a) && !EXTERNAL.includes(a)) st = 1;
      });
      return { out, status: st };
    },
    set(args) {
      if (!args.length) return { out: [...vars].sort().map(([k, v]) => `${k}\t${v}`).join('\n') + (vars.size ? '\n' : '') };
      const joined = args.join(' ');
      const pairs = joined.split(/\s+/).reduce((acc, w, i, all) => {
        if (w === '=') return acc;
        if (all[i - 1] === '=') { acc[acc.length - 1][1] = w; return acc; }
        const eq = w.indexOf('=');
        acc.push(eq >= 0 ? [w.slice(0, eq), w.slice(eq + 1)] : [w, '']);
        return acc;
      }, []);
      for (const [name, value] of pairs) {
        if (!/^[A-Za-z_]/.test(name)) return { err: MSG.setLetter, status: 1 };
        if (!NAME_RE.test(name)) return { err: MSG.setAlnum, status: 1 };
        vars.set(name, value);
      }
      return {};
    },
    unset(args) {
      if (!args.length) return { err: MSG.unsetTooFew, status: 1 };
      args.forEach((a) => vars.delete(a));
      return {};
    },
  };
  const unsupported = (name) => ({ err: `${name} : non disponible dans cette émulation (voir le vrai 42sh sur GitHub).`, status: 1 });

  /* ---------- Exécution ---------- */
  function runSimple(cmd, stdin, depth = 0) {
    let words = cmd.words.map((w) => expandWord(w));
    let argv = [];
    words.forEach((w, i) => {
      if (w.glob) argv.push(...expandGlob(w.text, i === 0 ? w.text : argv[0] || w.text));
      else argv.push(w.text);
    });
    // Alias : remplace le nom de commande (une seule fois, pas de boucle).
    if (depth === 0 && aliases.has(argv[0])) {
      const tokens = tokenize(aliases.get(argv[0]));
      if (tokens.some((t) => t.op)) return runLine(`${aliases.get(argv[0])} ${argv.slice(1).join(' ')}`, true);
      argv = [...tokens.map((t) => expandWord(t).text), ...argv.slice(1)];
    }
    const [name, ...args] = argv;
    if (name === 'repeat') {
      if (args.length < 2) return { err: MSG.repeatTooFew, status: 1 };
      if (!/^\d+$/.test(args[0])) return { err: MSG.repeatBad, status: 1 };
      let out = '';
      let err = '';
      let st = 0;
      for (let i = 0; i < Number(args[0]); i++) {
        const r = runSimple({ ...cmd, words: tokenize(args.slice(1).join(' ')).filter((t) => !t.op) }, stdin, depth + 1);
        out += r.out || '';
        err += r.err ? `${r.err}\n` : '';
        st = r.status || 0;
      }
      return { out, err: err.trimEnd(), status: st };
    }
    if (builtins[name]) return builtins[name](args, stdin);
    if (['foreach', 'if', 'jkill', 'ai-setup', 'fg', 'jobs'].includes(name)) return unsupported(name);
    if (programs[name]) return programs[name](args, stdin);
    if (name.includes('/')) {
      const node = lookup(resolve(name));
      if (!node) return { err: MSG.noFile(name), status: 1 };
      return { err: `${name}: Permission denied.`, status: 1 };
    }
    return { err: MSG.notFound(name), status: 1 };
  }

  function runPipeline(pipeline) {
    let stdin = '';
    let result = { status: 0 };
    let errors = '';
    for (const cmd of pipeline) {
      if (cmd.inFile) {
        const path = expandWord(cmd.inFile).text;
        const node = lookup(resolve(path));
        if (!node || node.type !== 'file') return { err: MSG.noFile(path), status: 1 };
        stdin = node.content;
      }
      if (cmd.heredoc !== null) stdin = cmd.heredocText || '';
      result = runSimple(cmd, stdin);
      if (result.clear) return result;
      if (result.err) errors += `${result.err.replace(/\n$/, '')}\n`;
      stdin = result.out || '';
      if (cmd.outFile) {
        const err = writeFile(expandWord(cmd.outFile).text, stdin, cmd.append);
        if (err) errors += `${err}\n`;
        stdin = '';
      }
    }
    return { out: stdin, err: errors.replace(/\n$/, ''), status: result.status || 0 };
  }

  function runLine(line, nested) {
    let out = '';
    let err = '';
    let tree;
    try {
      tree = parse(tokenize(line));
    } catch (e) {
      // Erreur de syntaxe (« Invalid null command. », « Missing name for redirect. »…)
      status = 1;
      if (!nested) print(e.message, 'err');
      return { err: e.message, status: 1 };
    }
    for (const chain of tree) {
      for (const { link, pipeline } of chain) {
        if (link === '&&' && status !== 0) continue;
        if (link === '||' && status === 0) continue;
        let r;
        try {
          r = runPipeline(pipeline);
        } catch (e) {
          r = { err: e.message, status: 1 };
        }
        if (r.clear) { screen.replaceChildren(); out = ''; err = ''; status = 0; continue; }
        if (nested) { out += r.out || ''; err += r.err ? `${r.err}\n` : ''; }
        else { print(r.out); print(r.err, 'err'); }
        status = r.status || 0;
        if (!alive) return { status };
      }
    }
    return nested ? { out, err: err.replace(/\n$/, ''), status } : { status };
  }

  /* ---------- Saisie ---------- */
  let pendingHeredoc = null; // commande en attente de son texte « << MOT »
  let historyIndex = 0;

  function submit(raw) {
    const line = raw.replace(/\s+$/, '');
    if (pendingHeredoc) {
      const span = document.createElement('span');
      span.className = 'term__cmd';
      span.textContent = `? ${line}`;
      screen.append(span);
      if (line === pendingHeredoc.word) {
        const { cmdLine, body } = pendingHeredoc;
        pendingHeredoc = null;
        execute(cmdLine, body);
      } else pendingHeredoc.body += `${line}\n`;
      afterRun();
      return;
    }
    echoCommand(raw);
    if (!line.trim()) { afterRun(); return; }
    history.push({ n: history.length + 1, cmd: line });
    historyIndex = history.length;
    const heredoc = line.match(/<<\s*("?)([^\s;|&<>"]+)\1/);
    if (heredoc) {
      pendingHeredoc = { word: heredoc[2], cmdLine: line, body: '' };
      ps.innerHTML = '<span class="term__ps-l2">? </span>';
      scrollDown();
      return;
    }
    execute(line, null);
    afterRun();
  }
  function execute(line, heredocBody) {
    if (heredocBody !== null) {
      // Le texte saisi devient l'entrée de la commande qui porte « << ».
      try {
        const tree = parse(tokenize(line));
        tree.forEach((chain) => chain.forEach(({ pipeline }) => pipeline.forEach((c) => { if (c.heredoc !== null) c.heredocText = heredocBody; })));
        for (const chain of tree) {
          for (const { link, pipeline } of chain) {
            if (link === '&&' && status !== 0) continue;
            if (link === '||' && status === 0) continue;
            const r = runPipeline(pipeline);
            print(r.out);
            print(r.err, 'err');
            status = r.status || 0;
          }
        }
      } catch (e) {
        print(e.message, 'err');
        status = 1;
      }
      return;
    }
    runLine(line, false);
  }
  function afterRun() {
    if (!alive) {
      print('[42sh terminé : la prochaine commande relance une nouvelle session]', 'err');
      reset();
    }
    if (!pendingHeredoc) refreshPrompt();
    scrollDown();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    submit(value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = historyIndex < history.length ? history[historyIndex].cmd : '';
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      screen.replaceChildren();
    } else if (event.key === 'c' && event.ctrlKey && !input.selectionEnd) {
      event.preventDefault();
      echoCommand(`${input.value}^C`);
      input.value = '';
      pendingHeredoc = null;
      refreshPrompt();
      scrollDown();
    }
  });
  // Un clic dans l'écran donne le focus à la saisie (sauf sélection de texte).
  screen.addEventListener('mouseup', () => { if (!String(window.getSelection())) input.focus({ preventScroll: true }); });

  /* ---------- Suggestions ---------- */
  const EXAMPLES = [
    'echo "hello" | cat -e > out.txt ; cat out.txt',
    'ls -l | grep txt',
    'setenv NAME Antoine ; echo $NAME',
    'alias ll ls -l ; ll my_shell',
    'cat notes.txt | sort | head -3',
    'cd my_shell && ls src || echo raté',
    'which cd ls',
    'history',
    'help',
  ];
  EXAMPLES.forEach((cmd) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = cmd;
    b.addEventListener('click', () => {
      submit(cmd);
      input.focus({ preventScroll: true });
    });
    tryBox.append(b);
  });

  /* ---------- Démarrage ----------
     Derrière le bouton « Essayez par vous-même », le terminal flouté montre une courte session.
     Un clic défloute le terminal, active la saisie et y place le curseur. */
  const body = root.querySelector('.term__body');
  const start = root.querySelector('.term__start');
  reset();
  screen.replaceChildren();
  refreshPrompt();
  form.hidden = false;
  tryBox.hidden = false;
  ['ls', 'echo "hello" | cat -e', 'cd my_shell && ls src'].forEach((cmd) => submit(cmd));
  const welcome = document.createElement('span');
  welcome.className = 'term__welcome';
  welcome.textContent = 'À vous : tapez une commande ci-dessous (help affiche la liste), ou cliquez sur un exemple.';
  screen.append(welcome);
  scrollDown();
  if (body && start) {
    root.classList.add('is-locked');
    body.inert = true;
    start.hidden = false;
    start.addEventListener('click', () => {
      root.classList.remove('is-locked');
      body.inert = false;
      start.hidden = true;
      input.focus({ preventScroll: true });
    });
  }
})();
