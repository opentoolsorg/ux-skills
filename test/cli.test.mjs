import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const cli = join(root, 'cli', 'bin', 'cli.js');
const tempDirs = [];

function tempProject() {
  const dir = mkdtempSync(join(tmpdir(), 'ux-skills-'));
  tempDirs.push(dir);
  return dir;
}

function run(args, cwd = root) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

afterEach(() => {
  while (tempDirs.length) rmSync(tempDirs.pop(), { recursive: true, force: true });
});

test('prints version and command help', () => {
  assert.match(run(['version']), /^2\.0\.0\n$/);
  assert.match(run(['help']), /UX Skills — commands for AI harnesses/);
  assert.match(run(['help']), /\/ux-skills init/);
});

test('installs selected skills and records install metadata', () => {
  const project = tempProject();
  const out = run(['install', '-y', '--providers=agents', '--scope=project', '--skills=ux-skills'], project);

  const manifestPath = join(project, '.agents', 'skills', '.ux-skills-install.json');
  assert.ok(existsSync(manifestPath), 'manifest was written');

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.package, 'ux-skills');
  assert.deepEqual(manifest.skills, ['ux-skills']);
});

test('provider detection is scoped to the project, not the machine', () => {
  // A dev machine with every harness installed globally (~/.cursor, ~/.gemini, ...)
  // must not make every project look like it uses every harness.
  const fakeHome = tempProject();
  mkdirSync(join(fakeHome, '.cursor'), { recursive: true });
  mkdirSync(join(fakeHome, '.gemini'), { recursive: true });

  const project = tempProject();
  mkdirSync(join(project, '.claude'), { recursive: true });

  const output = execFileSync(process.execPath, [cli, 'install', '-y', '--scope=project'], {
    cwd: project,
    env: { ...process.env, HOME: fakeHome },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  assert.match(output, /providers=claude/);
  assert.ok(!existsSync(join(project, '.cursor', 'skills')));
  assert.ok(!existsSync(join(project, '.gemini', 'skills')));
});

test('rejects invalid command options', () => {
  assert.throws(
    () => run(['install', '-y', '--providers=agents', '--bogus']),
    /Unknown option: --bogus/
  );
  assert.throws(() => run(['link', '--scope=invalid']), /--scope must be project or global/);
});

test('skills.sh display configuration covers every source skill once', () => {
  const config = JSON.parse(readFileSync(join(root, 'skills.sh.json'), 'utf8'));
  const listed = config.groupings.flatMap(group => group.skills).sort();
  const source = readdirSync(join(root, 'skills'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
  assert.deepEqual(listed, source);
});

test('uses block-scalar descriptions accepted by the skills CLI YAML parser', () => {
  for (const entry of readdirSync(join(root, 'skills'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const frontmatter = readFileSync(join(root, 'skills', entry.name, 'SKILL.md'), 'utf8')
      .split('---\n', 2)[1];
    assert.match(frontmatter, /^description: >$/m, entry.name);
  }
});
