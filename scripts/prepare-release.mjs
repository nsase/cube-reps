import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** リリース種別から次の正式バージョンを決める。 */
export function nextVersion(current, bump) {
  if (!['patch', 'minor', 'major'].includes(bump))
    throw new Error('Specify patch, minor, or major.');
  if (!/^\d+\.\d+\.\d+$/.test(current)) throw new Error('Expected a stable x.y.z version.');
  const [major, minor, patch] = current.split('.').map(Number);
  return bump === 'major'
    ? `${major + 1}.0.0`
    : bump === 'minor'
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;
}

/** 配列でコマンドを渡し、入力値をシェルとして評価しない。 */
function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim();
}

/** 最新developからバージョン更新PRを作成し、merge判断は利用者に残す。 */
function prepareRelease() {
  const [bump, ...extra] = process.argv.slice(2);
  nextVersion('0.0.0', bump);
  if (extra.length) throw new Error('Usage: npm run release:prepare -- patch|minor|major');
  if (run('git', ['status', '--porcelain']))
    throw new Error('Commit or stash local changes first.');
  run('gh', ['auth', 'status']);
  run('git', ['fetch', 'origin', 'develop']);
  const pkg = JSON.parse(run('git', ['show', 'origin/develop:package.json']));
  const lock = JSON.parse(run('git', ['show', 'origin/develop:package-lock.json']));
  if (pkg.version !== lock.version || pkg.version !== lock.packages[''].version)
    throw new Error('Package versions do not match.');
  const version = nextVersion(pkg.version, bump);
  const branch = `version/${version}`;
  if (
    run('git', ['branch', '--list', branch]) ||
    run('git', ['ls-remote', '--heads', 'origin', `refs/heads/${branch}`])
  )
    throw new Error(`Branch ${branch} already exists. Resume its existing PR manually.`);
  run('git', ['switch', '-c', branch, 'origin/develop']);
  run('npm', ['version', version, '--no-git-tag-version', '--ignore-scripts']);
  run('git', ['diff', '--check']);
  run('git', ['add', 'package.json', 'package-lock.json']);
  run('git', ['commit', '-m', `chore: prepare release ${version}`]);
  run('git', ['push', '-u', 'origin', branch]);
  const directory = mkdtempSync(join(tmpdir(), 'cube-reps-release-'));
  try {
    const template = readFileSync('.github/PULL_REQUEST_TEMPLATE/version.md', 'utf8');
    const body = template.replaceAll('{{VERSION}}', version).replaceAll('{{BUMP}}', bump);
    const path = join(directory, 'body.md');
    writeFileSync(path, body);
    console.log(
      run('gh', [
        'pr',
        'create',
        '--base',
        'develop',
        '--head',
        branch,
        '--title',
        `chore: prepare release ${version}`,
        '--body-file',
        path,
      ]),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    prepareRelease();
  } catch (error) {
    console.error(error.message);
    console.error(
      'Stopped without rollback. Check git status and any existing branch/PR before retrying.',
    );
    process.exitCode = 1;
  }
}
