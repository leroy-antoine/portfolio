# Graph Report - portfolio  (2026-10-23)

## Corpus Check
- 66 files · ~91,883 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 222 nodes · 416 edges · 21 communities (15 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20

## God Nodes (most connected - your core abstractions)
1. `lookup()` - 18 edges
2. `GameMinesweeper` - 15 edges
3. `getInput()` - 14 edges
4. `GameSnake` - 13 edges
5. `GameMenu` - 10 edges
6. `execOperator()` - 10 edges
7. `parseOpts()` - 10 edges
8. `sort()` - 10 edges
9. `readLine()` - 8 edges
10. `formatScripting()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Creative North Star: La telemetrie` --semantically_similar_to--> `Product principles (the work is the proof)`  [INFERRED] [semantically similar]
  DESIGN.md → PRODUCT.md
- `Critique 18:39 (score 23/32)` --references--> `Creative North Star: La telemetrie`  [EXTRACTED]
  .impeccable/critique/2026-10-22T18-39-50Z__index-html.md → DESIGN.md
- `Critique 18:39 (score 23/32)` --references--> `Hero section`  [EXTRACTED]
  .impeccable/critique/2026-10-22T18-39-50Z__index-html.md → index.html
- `Critique 18:39 (score 23/32)` --references--> `Arcade project`  [EXTRACTED]
  .impeccable/critique/2026-10-22T18-39-50Z__index-html.md → index.html
- `Accessibility: WCAG 2.2 AA, no-JS, reduced motion` --conceptually_related_to--> `Components (buttons, chips, cards, tabs, readout)`  [INFERRED]
  PRODUCT.md → DESIGN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Design system core** — design_signal_violet, design_readout_yellow, design_two_voices_rule, design_typography, design_flat_elevation [INFERRED 0.85]
- **Portfolio project showcases** — index_lunar_lander, index_zappy, index_raytracer, index_doctor_cvrie, index_arcade, index_my_shell [INFERRED 0.85]

## Communities (21 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (3): cd(), changeOrCreate(), setenv()

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (18): appendCsv(), BackToMenu(), boot(), close(), frame(), loadAssets(), LoadDisplay(), loadDisplayModule() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (20): Components (buttons, chips, cards, tabs, readout), Creative North Star: La telemetrie, Readout signature component, Readout Yellow #ecd24a, Signal Violet #a597ff, Rule of two voices (violet acts, yellow measures), Typography (Schibsted Grotesk + JetBrains Mono), Critique 17:39 (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (15): animateTo(), anims, clamp01(), easeInOut(), easeOut(), initCarousel(), goTo(), select() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (17): addToHistory(), checkAlias(), checkChange(), checkPare(), formatCmd(), formatScripting(), getInput(), glob() (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (13): cmpNb(), columns(), execProperFunction(), foreach(), getCondition(), if(), isIntFloat(), makeTree() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.26
Nodes (3): formatLen(), GameMenu, readCsv()

### Community 9 - "Community 9"
Cohesion: 0.23
Nodes (12): cat(), grep(), input2(), mkdir(), parseOpts(), readAll(), readFiles(), rev() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (10): command(), execCommand(), execCommandNoFork(), execPipe(), fg(), inChild(), Segfault, where() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (8): deliver(), doTab(), echoLine(), pump(), readLine(), renderParts(), showPrompt(), write()

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (8): endShell(), execOperator(), initializeSystem(), lookup(), mysh(), openWrite(), rmdir(), touch()

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (5): Layout (three breakpoints, fluid gutters), Doctor Cvrie project, my_shell 42sh terminal emulation, Portfolio README, Static stack: HTML, native CSS, native JS

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (5): alias(), ls(), modeString(), set(), sort()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (3): copyMove(), cp(), mv()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (3): head(), headTail(), tail()

## Knowledge Gaps
- **18 isolated node(s):** `Violet-tinted neutrals (void, surface, line)`, `Typography (Schibsted Grotesk + JetBrains Mono)`, `Flat elevation rule (no shadows)`, `Layout (three breakpoints, fluid gutters)`, `Users: recruiters and engineers` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 58 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `frame()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `Violet-tinted neutrals (void, surface, line)`, `Typography (Schibsted Grotesk + JetBrains Mono)`, `Flat elevation rule (no shadows)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08307692307692308 - nodes in this community are weakly interconnected._
- **Why does `GameSnake` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11052631578947368 - nodes in this community are weakly interconnected._
- **Why does `GameMinesweeper` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._