import { build } from 'esbuild';
import { injectManifest } from 'workbox-build';
import { createHash } from 'node:crypto';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

/** 配信ディレクトリに、外部スクリプト取得が不要なWorkbox SWを生成する。 */
export async function buildWorker(directory) {
  const source = join(directory, 'worker-source.js');
  await build({
    entryPoints: ['service-worker/worker.js'],
    outfile: source,
    bundle: true,
    format: 'iife',
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  try {
    const { warnings } = await injectManifest({
      swSrc: source,
      swDest: join(directory, 'ngsw-worker.js'),
      globDirectory: directory,
      globPatterns: ['**/*.{js,css,html,json,svg,png,ico,webmanifest,woff2}'],
      globIgnores: ['worker-source.js', 'ngsw-worker.js', 'ngsw.json', '404.html'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      manifestTransforms: [
        async (entries) => {
          // 旧Angular SWに404を返すと全キャッシュが削除されるため、移行用だけに生成する。
          const html = await readFile(join(directory, 'index.html'), 'utf8');
          const base = new URL(
            html.match(/<base href="([^"]+)"/)?.[1] ?? '/',
            'https://build.invalid/',
          ).pathname;
          const hashTable = {};
          for (const entry of entries) {
            hashTable[`${base}${entry.url}`] = createHash('sha1')
              .update(await readFile(join(directory, entry.url)))
              .digest('hex');
          }
          await writeFile(
            join(directory, 'ngsw.json'),
            JSON.stringify({
              configVersion: 1,
              timestamp: Date.now(),
              index: `${base}index.html`,
              assetGroups: [
                {
                  name: 'workbox-migration',
                  installMode: 'prefetch',
                  updateMode: 'prefetch',
                  urls: Object.keys(hashTable),
                  patterns: [],
                  cacheQueryOptions: { ignoreVary: true },
                },
              ],
              dataGroups: [],
              hashTable,
              navigationUrls: [],
              navigationRequestStrategy: 'performance',
            }),
          );
          return { manifest: entries, warnings: [] };
        },
      ],
    });
    if (warnings.length) throw new Error(warnings.join('\n'));
  } finally {
    await rm(source, { force: true });
  }
}
