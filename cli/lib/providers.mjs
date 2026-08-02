import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Provider key → project-local skills directory (relative to project root). */
export const PROVIDERS = {
  claude: {
    name: 'Claude Code',
    projectSkills: join('.claude', 'skills'),
    globalSkills: join(homedir(), '.claude', 'skills'),
    projectAgents: join('.claude', 'agents'),
    globalAgents: join(homedir(), '.claude', 'agents'),
    // Project-scoped only — a harness folder in $HOME means it's installed on
    // the machine, not that this project uses it. See providers detection.
    detect: root => existsSync(join(root, '.claude')),
  },
  cursor: {
    name: 'Cursor',
    projectSkills: join('.cursor', 'skills'),
    globalSkills: join(homedir(), '.cursor', 'skills'),
    detect: root => existsSync(join(root, '.cursor')),
  },
  codex: {
    name: 'Codex CLI',
    // Codex reads project skills from .agents/skills
    projectSkills: join('.agents', 'skills'),
    globalSkills: join(homedir(), '.agents', 'skills'),
    detect: root => existsSync(join(root, '.agents')),
  },
  agents: {
    name: 'Universal (.agents)',
    projectSkills: join('.agents', 'skills'),
    globalSkills: join(homedir(), '.agents', 'skills'),
    detect: root => existsSync(join(root, '.agents')),
  },
  gemini: {
    name: 'Gemini CLI',
    projectSkills: join('.gemini', 'skills'),
    globalSkills: join(homedir(), '.gemini', 'skills'),
    detect: root => existsSync(join(root, '.gemini')),
  },
  github: {
    name: 'GitHub Copilot',
    projectSkills: join('.github', 'skills'),
    globalSkills: join(homedir(), '.github', 'skills'),
    detect: root => existsSync(join(root, '.github')),
  },
  opencode: {
    name: 'OpenCode',
    projectSkills: join('.opencode', 'skills'),
    globalSkills: join(homedir(), '.opencode', 'skills'),
    detect: root => existsSync(join(root, '.opencode')),
  },
};

export const PROVIDER_ORDER = [
  'claude',
  'cursor',
  'codex',
  'gemini',
  'github',
  'opencode',
  'agents',
];

export function detectProviders(root = process.cwd()) {
  return PROVIDER_ORDER.filter(key => PROVIDERS[key].detect(root));
}

export function resolveProviderKeys(list) {
  if (!list || list.length === 0) return [];
  const aliases = {
    'claude-code': 'claude',
    copilot: 'github',
    'github-copilot': 'github',
    'gemini-cli': 'gemini',
    'codex-cli': 'codex',
  };
  const out = [];
  for (const raw of list) {
    const key = aliases[raw] || raw;
    if (!PROVIDERS[key]) {
      throw new Error(
        `Unknown provider "${raw}". Use: ${PROVIDER_ORDER.join(', ')}`
      );
    }
    if (!out.includes(key)) out.push(key);
  }
  return out;
}
