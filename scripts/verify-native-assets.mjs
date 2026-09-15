import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// 初回オフライン起動に必要なアセットと、ストア更新との分離をビルド時に確認する。
const root = resolve('dist/cube-reps-native/browser');
const index = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(index, /<base href="\/"/);
assert.ok(
  !existsSync(join(root, 'ngsw.json')),
  'Native builds must not include a Service Worker manifest.',
);
assert.ok(
  !existsSync(join(root, 'ngsw-worker.js')),
  'Native builds must not include a Service Worker.',
);
for (const file of readdirSync(root).filter((file) => file.endsWith('.css'))) {
  const css = readFileSync(join(root, file), 'utf8');
  assert.doesNotMatch(css, /https?:\/\//, `${file} must not depend on remote fonts or styles.`);
  for (const [, resource] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (resource.startsWith('data:')) continue;
    assert.ok(existsSync(join(root, resource)), `Missing bundled resource: ${resource}`);
  }
}
for (const lang of ['en', 'ja']) {
  assert.ok(existsSync(join(root, 'assets/i18n', `${lang}.json`)));
}
for (const font of ['dm-mono', 'outfit', 'roboto', 'material-symbols-outlined']) {
  assert.ok(existsSync(join(root, 'licenses', font, 'LICENSE')), `Missing font license: ${font}`);
}
console.log('Native assets verified: local fonts, translations, licenses, and no Service Worker.');
