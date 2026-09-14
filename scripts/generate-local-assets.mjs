import { mkdir, readFile, writeFile } from 'node:fs/promises';

/** 起動時に共通ファイルから生成し、ローカル専用の設定を二重管理しない。 */
const projectRoot = new URL('../', import.meta.url);
const outputDirectory = new URL('.generated/local/', projectRoot);
const localName = 'CubeReps-local';
const sourceIndex = await readFile(new URL('src/index.html', projectRoot), 'utf8');
const manifest = JSON.parse(
  await readFile(new URL('public/manifest.webmanifest', projectRoot), 'utf8'),
);

/** 名前の置換対象が変わった場合は、本番名のまま生成せず設定の見直しを促す。 */
function replaceExactlyOnce(source, pattern, replacement) {
  if ([...source.matchAll(pattern)].length !== 1) {
    throw new Error(`Expected exactly one local app name target: ${pattern}`);
  }
  return source.replace(pattern, replacement);
}

let index = replaceExactlyOnce(
  sourceIndex,
  /<title>[^<]*<\/title>/g,
  `<title>${localName}</title>`,
);
index = replaceExactlyOnce(
  index,
  /(<meta\b[^>]*\bname="apple-mobile-web-app-title"[^>]*\bcontent=")[^"]*(")/g,
  `$1${localName}$2`,
);
manifest.name = localName;
manifest.short_name = localName;

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(new URL('index.html', outputDirectory), index),
  writeFile(
    new URL('manifest.webmanifest', outputDirectory),
    `${JSON.stringify(manifest, null, 2)}\n`,
  ),
]);
