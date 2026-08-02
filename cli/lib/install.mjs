import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import {
  PROVIDERS,
  PROVIDER_ORDER,
  detectProviders,
  resolveProviderKeys,
} from './providers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..', '..');
const SKILLS_SRC = join(PKG_ROOT, 'skills');
const AGENTS_SRC = join(PKG_ROOT, 'agents');

function optionValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith('-')) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function csv(value) {
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function parseArgs(args) {
  const opts = {
    yes: false,
    force: false,
    agents: false,
    scope: null,
    providers: null,
    skills: null,
    source: null,
  };
  for (let index = 0; index < args.length; index++) {
    const a = args[index];
    if (a === '-y' || a === '--yes') opts.yes = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--agents') opts.agents = true;
    else if (a === '--scope') opts.scope = optionValue(args, ++index, '--scope');
    else if (a.startsWith('--scope=')) opts.scope = a.slice('--scope='.length);
    else if (a === '--providers') opts.providers = csv(optionValue(args, ++index, '--providers'));
    else if (a.startsWith('--providers=')) opts.providers = csv(a.slice('--providers='.length));
    else if (a === '--skills') opts.skills = csv(optionValue(args, ++index, '--skills'));
    else if (a.startsWith('--skills=')) opts.skills = csv(a.slice('--skills='.length));
    else if (a === '--source') opts.source = optionValue(args, ++index, '--source');
    else if (a.startsWith('--source=')) opts.source = a.slice('--source='.length);
    else if (a === '--help' || a === '-h') opts.help = true;
    else throw new Error(`Unknown option: ${a}. Run: npx ux-skills --help`);
  }
  return opts;
}

function ask(question) {
  if (!process.stdin.isTTY) return Promise.resolve('');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, ans => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function listSkillNames(srcRoot = SKILLS_SRC) {
  if (!existsSync(srcRoot)) return [];
  return readdirSync(srcRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(srcRoot, d.name, 'SKILL.md')))
    .map(d => d.name)
    .sort();
}

function copyDir(src, dest, { force, link }) {
  if (existsSync(dest)) {
    const st = lstatSync(dest);
    if (!force && !st.isSymbolicLink()) {
      return 'skip';
    }
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(dirname(dest), { recursive: true });
  if (link) {
    symlinkSync(src, dest, 'dir');
    return 'link';
  }
  cpSync(src, dest, { recursive: true });
  return 'copy';
}

function skillsDirFor(providerKey, scope, root) {
  const p = PROVIDERS[providerKey];
  return scope === 'global' ? p.globalSkills : join(root, p.projectSkills);
}

function agentsDirFor(providerKey, scope, root) {
  const p = PROVIDERS[providerKey];
  if (!p.projectAgents) return null;
  return scope === 'global' ? p.globalAgents : join(root, p.projectAgents);
}

function writeInstallManifest(destRoot, meta) {
  const path = join(destRoot, '.ux-skills-install.json');
  writeFileSync(
    path,
    JSON.stringify(
      {
        package: 'ux-skills',
        version: meta.version,
        installedAt: new Date().toISOString(),
        skills: meta.skills,
        scope: meta.scope,
        provider: meta.provider,
      },
      null,
      2
    ) + '\n'
  );
}

function readPkgVersion() {
  try {
    return JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version;
  } catch {
    return '0.0.0';
  }
}

async function resolveInstallOptions(args, { mode }) {
  const opts = parseArgs(args);
  if (opts.help) {
    console.log('See: npx ux-skills --help');
    process.exit(0);
  }

  const root = process.cwd();
  const version = readPkgVersion();
  const allSkills = listSkillNames();
  if (allSkills.length === 0) {
    throw new Error(`No skills found in package at ${SKILLS_SRC}`);
  }

  let providers = opts.providers
    ? resolveProviderKeys(opts.providers)
    : detectProviders(root);

  if (providers.length === 0) {
    providers = ['claude', 'agents'];
  }

  if (!opts.yes && process.stdin.isTTY) {
    console.log('');
    console.log('  UX Skills installer');
    console.log(`  version ${version}  ·  ${allSkills.length} skills`);
    console.log('');
    const detected = detectProviders(root);
    console.log(
      `  Detected harnesses: ${
        detected.length ? detected.map(k => PROVIDERS[k].name).join(', ') : '(none)'
      }`
    );
    console.log(`  Default targets:   ${providers.map(k => PROVIDERS[k].name).join(', ')}`);
    console.log('');
    const custom = await ask(
      '  Providers [enter=keep, or e.g. claude,cursor,codex]: '
    );
    if (custom) providers = resolveProviderKeys(custom.split(/[,\s]+/).filter(Boolean));

    let scope = opts.scope || 'project';
    const scopeAns = await ask(
      `  Scope — project (./) or global (~/) [${scope}]: `
    );
    if (scopeAns === 'global' || scopeAns === 'g') scope = 'global';
    if (scopeAns === 'project' || scopeAns === 'p') scope = 'project';
    opts.scope = scope;

    const forceAns = await ask('  Overwrite existing skills? [y/N]: ');
    opts.force = forceAns === 'y' || forceAns === 'yes';

    const agentsAns = await ask('  Install agents (Claude subagents)? [Y/n]: ');
    opts.agents = agentsAns !== 'n' && agentsAns !== 'no';
  } else {
    opts.scope = opts.scope || 'project';
    if (opts.scope !== 'project' && opts.scope !== 'global') {
      throw new Error('--scope must be project or global');
    }
    // non-interactive defaults: agents for claude
    if (mode === 'update') opts.force = true;
    if (opts.agents === false && providers.includes('claude')) {
      // keep default false unless --agents; update keeps previous behavior force
    }
  }

  const skillNames = opts.skills
    ? opts.skills.filter(n => {
        if (!allSkills.includes(n)) {
          throw new Error(`Unknown skill "${n}". Run: npx ux-skills help`);
        }
        return true;
      })
    : allSkills;

  return { root, providers, skillNames, opts, version, mode };
}

function installToProvider({
  providerKey,
  skillNames,
  scope,
  root,
  force,
  installAgents,
  link,
  skillsSrc,
  agentsSrc,
  version,
}) {
  const skillsDir = skillsDirFor(providerKey, scope, root);
  mkdirSync(skillsDir, { recursive: true });

  let copied = 0;
  let skipped = 0;
  let linked = 0;

  for (const name of skillNames) {
    const src = join(skillsSrc, name);
    const dest = join(skillsDir, name);
    const result = copyDir(src, dest, { force, link });
    if (result === 'skip') skipped++;
    else if (result === 'link') linked++;
    else copied++;
  }

  let agentsCopied = 0;
  if (installAgents) {
    const agentsDir = agentsDirFor(providerKey, scope, root);
    if (agentsDir && existsSync(agentsSrc)) {
      mkdirSync(agentsDir, { recursive: true });
      for (const file of readdirSync(agentsSrc).filter(f => f.endsWith('.md'))) {
        const src = join(agentsSrc, file);
        const dest = join(agentsDir, file);
        if (existsSync(dest) && !force) continue;
        cpSync(src, dest);
        agentsCopied++;
      }
    }
  }

  writeInstallManifest(skillsDir, {
    version,
    skills: skillNames,
    scope,
    provider: providerKey,
  });

  return { skillsDir, copied, skipped, linked, agentsCopied };
}

export async function runInstall(args, { mode = 'install' } = {}) {
  const { root, providers, skillNames, opts, version } =
    await resolveInstallOptions(args, { mode });

  console.log('');
  console.log(
    `  ${mode === 'update' ? 'Updating' : 'Installing'} UX Skills v${version}`
  );
  console.log(
    `  scope=${opts.scope}  providers=${providers.join(',')}  skills=${skillNames.length}`
  );
  console.log('');

  const force = opts.force || mode === 'update';

  for (const key of providers) {
    const result = installToProvider({
      providerKey: key,
      skillNames,
      scope: opts.scope,
      root,
      force,
      installAgents: Boolean(opts.agents && key === 'claude'),
      link: false,
      skillsSrc: SKILLS_SRC,
      agentsSrc: AGENTS_SRC,
      version,
    });

    const label = PROVIDERS[key].name;
    console.log(
      `  ✓ ${label.padEnd(18)} → ${result.skillsDir}` +
        `  (${result.copied} new, ${result.linked} linked, ${result.skipped} skipped)`
    );
    if (result.agentsCopied) {
      console.log(`  ✓ Claude agents     → ${result.agentsCopied} agent files`);
    }
  }

  console.log('');
  console.log('  Next:');
  console.log('    1. Reload your AI harness (restart / new session)');
  console.log('    2. Run  /ux-skills init   to write project UX context');
  console.log('    3. Try  /ux-skills intent   or   /ux-skills journey <flow>   or   /ux-skills ai-governors');
  console.log('');
  console.log('  List skills:  npx ux-skills help');
  console.log('');
}

export async function runLink(args) {
  const opts = parseArgs(args);
  const root = process.cwd();
  const source = resolve(root, opts.source || '.');
  const skillsSrc = join(source, 'skills');
  const agentsSrc = join(source, 'agents');

  if (!existsSync(skillsSrc)) {
    throw new Error(`No skills/ under --source=${source}`);
  }

  let providers = opts.providers
    ? resolveProviderKeys(opts.providers)
    : detectProviders(root);
  if (providers.length === 0) providers = ['claude', 'agents'];

  const scope = opts.scope || 'project';
  if (scope !== 'project' && scope !== 'global') {
    throw new Error('--scope must be project or global');
  }
  const skillNames = listSkillNames(skillsSrc);
  const version = readPkgVersion();

  console.log(`  Linking ${skillNames.length} skills from ${skillsSrc}`);
  console.log(`  providers=${providers.join(',')}  scope=${scope}`);
  console.log('');

  for (const key of providers) {
    const result = installToProvider({
      providerKey: key,
      skillNames,
      scope,
      root,
      force: true,
      installAgents: opts.agents,
      link: true,
      skillsSrc,
      agentsSrc,
      version,
    });
    console.log(`  ✓ ${PROVIDERS[key].name.padEnd(18)} → ${result.skillsDir}`);
  }
  console.log('');
  console.log('  Linked. Commit harness skill dirs if you want them shared.');
  console.log('');
}
