import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextVersion } from './prepare-release.mjs';

test('release kinds increment the correct segment and reset lower segments', () => {
  assert.equal(nextVersion('1.2.3', 'patch'), '1.2.4');
  assert.equal(nextVersion('1.2.3', 'minor'), '1.3.0');
  assert.equal(nextVersion('1.2.3', 'major'), '2.0.0');
  assert.equal(nextVersion('0.0.0', 'patch'), '0.0.1');
});
test('unsupported inputs cannot become release versions', () => {
  assert.throws(() => nextVersion('1.0.0', 'prerelease'));
  assert.throws(() => nextVersion('1.0.0', undefined));
  assert.throws(() => nextVersion('1.0.0-beta.1', 'patch'));
});

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve('scripts/prepare-release.mjs');

test('creates only a version branch and a develop PR from the latest remote version', () => {
  const directory = mkdtempSync(join(tmpdir(), 'release-test-'));
  const repo = join(directory, 'repo');
  const remote = join(directory, 'remote.git');
  const bin = join(directory, 'bin');
  mkdirSync(repo);
  mkdirSync(bin);
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: repo,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  try {
    git('init', '--bare', remote);
    git('init', '-b', 'develop');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Release Test');
    git('config', 'commit.gpgsign', 'false');
    git('config', 'core.hooksPath', join(directory, 'no-hooks'));
    writeFileSync(
      join(repo, 'package.json'),
      JSON.stringify({ name: 'release-fixture', version: '1.2.3' }),
    );
    writeFileSync(
      join(repo, 'package-lock.json'),
      JSON.stringify({
        name: 'release-fixture',
        version: '1.2.3',
        lockfileVersion: 3,
        packages: { '': { name: 'release-fixture', version: '1.2.3' } },
      }),
    );
    mkdirSync(join(repo, '.github/PULL_REQUEST_TEMPLATE'), { recursive: true });
    writeFileSync(
      join(repo, '.github/PULL_REQUEST_TEMPLATE/version.md'),
      'Release {{VERSION}} ({{BUMP}})',
    );
    git('add', '.');
    git('commit', '-m', 'fixture');
    git('remote', 'add', 'origin', remote);
    git('push', 'origin', 'develop');
    const base = git('rev-parse', 'HEAD');
    // ghだけを置換し、実際のGitHubへの投稿なしでPRの引数と本文を記録する。
    writeFileSync(
      join(bin, 'gh'),
      `#!/usr/bin/env node\nconst fs = require('node:fs');\nconst args = process.argv.slice(2);\nif(args[0] === 'pr') { fs.writeFileSync(process.env.RELEASE_TEST_RESULT, JSON.stringify({args, body: fs.readFileSync(args[args.indexOf('--body-file')+1], 'utf8')})); console.log('https://example.test/pr/1'); }\n`,
      { mode: 0o755 },
    );
    const options = {
      cwd: repo,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        RELEASE_TEST_RESULT: join(directory, 'pr.json'),
      },
    };
    const result = spawnSync(process.execPath, [script, 'minor'], options);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(git('branch', '--show-current'), 'version/1.3.0');
    assert.equal(git('rev-parse', 'origin/develop'), base);
    assert.equal(git('rev-parse', 'HEAD^'), base);
    assert.equal(git('status', '--porcelain'), '');
    const pkg = JSON.parse(readFileSync(join(repo, 'package.json')));
    const lock = JSON.parse(readFileSync(join(repo, 'package-lock.json')));
    assert.equal(pkg.version, '1.3.0');
    assert.equal(lock.version, pkg.version);
    assert.equal(lock.packages[''].version, pkg.version);
    const pr = JSON.parse(readFileSync(join(directory, 'pr.json')));
    assert.equal(pr.args[pr.args.indexOf('--base') + 1], 'develop');
    assert.equal(pr.args[pr.args.indexOf('--head') + 1], 'version/1.3.0');
    assert.equal(pr.body, 'Release 1.3.0 (minor)');
    assert.notEqual(spawnSync(process.execPath, [script, 'minor'], options).status, 0);
    writeFileSync(join(repo, 'uncommitted.txt'), 'preserve me');
    const dirty = spawnSync(process.execPath, [script, 'patch'], options);
    assert.notEqual(dirty.status, 0);
    assert.match(dirty.stderr, /Commit or stash/);
    assert.equal(readFileSync(join(repo, 'uncommitted.txt'), 'utf8'), 'preserve me');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
