# UX Skills

[![npm](https://img.shields.io/npm/v/ux-skills?label=npm)](https://www.npmjs.com/package/ux-skills)
[![license](https://img.shields.io/badge/license-CC0--1.0-blue)](LICENSE)

**33 portable skills for product UX:** problem framing, research, journeys, IA, UX writing, accessibility, ethical AI, resilience, visual craft, and engineering handoff.

Built for AI coding agents. Use one skill when needed or run the full workflow from project context to a build-ready spec.

## Install

### Skills.sh — all compatible agents

```bash
npx skills add princepal9120/ux-skills --all --full-depth
```

`--full-depth` is required: this repository has a root router plus individual skill folders. The command installs every skill, not only the router.

The repository is listed automatically after users install it; no marketplace submission is required. `skills.sh.json` controls its groupings and descriptions once indexed.

Install a single skill instead:

```bash
npx skills add princepal9120/ux-skills --skill journey --agent codex
```

Use `npx skills update` to refresh skills installed through skills.sh.

### UX Skills CLI — guided multi-harness install

```bash
npx ux-skills install
```

Supported targets: Claude Code, Cursor, Codex CLI, Gemini CLI, GitHub Copilot, OpenCode, and `.agents`-compatible tools.

```bash
# Deterministic CI/team setup
npx ux-skills install -y --providers=claude,cursor,codex --scope=project --agents

# Refresh an existing install
npx ux-skills update -y --providers=codex --scope=project
```

### Global install (no per-project folders)

Installs once into `~/.claude` (or the equivalent home dir for other providers) so every project on the machine gets the skills — nothing is added to individual repos.

```bash
npx ux-skills install -y --providers=claude --scope=global --agents
```

Use `npx ux-skills --help` for all options. Restart or open a new agent session after install.

### Claude Code plugin

```text
/plugin marketplace add princepal9120/ux-skills
/plugin install ux-skills@ux-skills
```

## Start a UX session

```text
/ux-skills init
```

This creates a small `UX-CONTEXT.md`: users, jobs, constraints, ethical stance, success signals, and the next best skill. Then use this path:

| Stage | Commands | Outcome |
| --- | --- | --- |
| Frame | `/strategize`, `/investigate`, `/double-diamond` | Evidence-backed problem and scope |
| Design | `/journey`, `/organize`, `/articulate` | Flow, IA, and interface language |
| Design AI | `/ai-governors`, `/ai-inputs`, `/ai-trust-builders` | Controllable, understandable AI UX |
| Review | `/evaluate`, `/audit`, `/include`, `/fortify` | Heuristics, accessibility, quality audit, real-world resilience |
| Craft | `/craft`, `/cognitive-load-conversion` | Clearer, lower-friction interfaces |
| Ship | `/specify` | Implementation-ready handoff |

Stuck? Use `/philosopher`. Planning metrics or experiments? Use `/measure`.

## Skill directory

### Start and strategy

`/ux-skills` · `/intent` · `/strategize` · `/investigate` · `/blueprint` · `/double-diamond` · `/empathy-mapping` · `/ux-personas` · `/feature-prioritization`

### Experience design

`/journey` · `/organize` · `/articulate` · `/ux-storyboard` · `/like-wish-what-if`

### AI product design

`/ai-governors` · `/ai-identifiers` · `/ai-inputs` · `/ai-trust-builders` · `/ai-tuners` · `/ai-wayfinders`

### Quality and craft

`/evaluate` · `/audit` · `/fortify` · `/include` · `/general-design-review` · `/craft` · `/cognitive-load-conversion` · `/persuasive-ux`

### Adapt, measure, handoff

`/transpose` · `/localize` · `/measure` · `/philosopher` · `/storytelling` · `/specify`

Run `npx ux-skills help` for descriptions and suggested session order.

## Agents

Claude Code plugin installs specialist agents alongside skills:

| Agent | Focus |
| --- | --- |
| `@noor` | Context, ethics, routing |
| `@ember` | Strategy and research |
| `@wren` | Journeys, IA, copy |
| `@vigil` | Quality, accessibility, resilience |
| `@rune` | Specs and engineering handoff |
| `@sage` | Reframing and exploration |
| `@atlas` | AI product design suite |

## Compatibility and packaging

- Every skill lives in `skills/<name>/SKILL.md` with portable Agent Skills frontmatter.
- `npx skills` discovers the repository directly from GitHub; no npm publish required for that install path.
- `npx ux-skills` is an npm package with a guided installer and local development linking.
- `./build.sh` generates committed Cursor rules and GitHub Copilot instructions from the source skills.
- No runtime dependencies. Node.js 18+ required for the installer.

For local development:

```bash
git clone https://github.com/princepal9120/ux-skills
cd ux-skills
npm test
npm run check
npx ux-skills link --source=. --providers=claude,cursor,codex
```

## Credits and license

Strategy foundation from [ghaida/intent](https://github.com/ghaida/intent) (CC0). AI product and craft extensions credit [tommyjepsen/awesome-ux-skills](https://github.com/tommyjepsen/awesome-ux-skills). See [CREDITS.md](CREDITS.md).

Released under [CC0 1.0](LICENSE).
