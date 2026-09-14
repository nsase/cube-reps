import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildWorker } from './build-worker.mjs';

for (const base of ['/', '/cube-reps/']) {
  test(`Workboxと移行用マニフェストを生成する: ${base}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cube-worker-'));
    try {
      await mkdir(join(directory, 'assets'));
      const html = `<base href="${base}"><title>CubeReps</title>`;
      await writeFile(join(directory, 'index.html'), html);
      await writeFile(join(directory, 'main-ABC.js'), 'console.log("app")');
      await writeFile(join(directory, 'assets/ja.json'), '{"title":"設定"}');
      await buildWorker(directory);
      const worker = await readFile(join(directory, 'ngsw-worker.js'), 'utf8');
      assert.ok(worker.includes('main-ABC.js'));
      assert.ok(worker.includes('assets/ja.json'));
      assert.ok(!worker.includes('__WB_MANIFEST'));
      assert.ok(!worker.includes('importScripts('));
      assert.ok(!worker.includes('ngsw.json'));
      const legacy = JSON.parse(await readFile(join(directory, 'ngsw.json'), 'utf8'));
      assert.equal(legacy.configVersion, 1);
      assert.equal(legacy.index, `${base}index.html`);
      assert.equal(legacy.hashTable[legacy.index], createHash('sha1').update(html).digest('hex'));
      assert.deepEqual(
        legacy.assetGroups[0].urls.sort(),
        [`${base}assets/ja.json`, `${base}index.html`, `${base}main-ABC.js`].sort(),
      );
      await buildWorker(directory);
      assert.equal(await readFile(join(directory, 'ngsw-worker.js'), 'utf8'), worker);
      await writeFile(join(directory, 'index.html'), html + '<p>Updated</p>');
      await buildWorker(directory);
      assert.notEqual(await readFile(join(directory, 'ngsw-worker.js'), 'utf8'), worker);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
