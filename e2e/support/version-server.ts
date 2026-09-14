import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { promisify } from 'node:util';

/** テスト専用の新版をビルドし、同一originの配信内容を旧版から切り替える。
 * @param version 新版のpackage.jsonへ埋め込む表示番号
 */
export async function createVersionServer(version: string) {
  const root = resolve('.');
  const workspace = await mkdtemp(join(tmpdir(), 'cube-reps-version-'));
  const server = createServer((request, response) => {
    void serve(request.url ?? '/', response);
  });
  let directory = join(root, 'dist/cube-reps/browser');

  /** SW自身のリクエストにも実ファイルを返し、ブラウザのキャッシュによる更新判定を検証する。 */
  async function serve(url: string, response: import('node:http').ServerResponse) {
    try {
      const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
      const file = resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(`${directory}${sep}`)) {
        response.writeHead(403).end();
        return;
      }
      const content = await readFile(file);
      const types: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.webmanifest': 'application/manifest+json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2',
      };
      response.writeHead(200, {
        'Content-Type': types[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  }

  try {
    // 実リポジトリと既存のE2E配信物を変更せず、別バージョンの本番成果物を生成する。
    await Promise.all([
      ...[
        'src',
        'public',
        'angular.json',
        'ngsw-config.json',
        'tsconfig.json',
        'tsconfig.app.json',
      ].map((file) => cp(join(root, file), join(workspace, file), { recursive: true })),
      symlink(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir'),
    ]);
    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    await writeFile(join(workspace, 'package.json'), JSON.stringify({ ...pkg, version }));
    const build = await promisify(execFile)(
      process.execPath,
      [
        join(root, 'node_modules/@angular/cli/bin/ng.js'),
        'build',
        '--configuration',
        'production',
        '--output-path',
        'dist/next',
      ],
      { cwd: workspace, timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
    );
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server address');
    return {
      url: `http://127.0.0.1:${address.port}`,
      buildLog: build.stdout + build.stderr,
      /** 更新確認以降のネットワーク要求に、新版のmanifestと成果物を配信する。 */
      publishUpdate() {
        directory = join(workspace, 'dist/next/browser');
      },
      /** テスト終了時に接続と一時ビルドを破棄する。 */
      async close() {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
        await rm(workspace, { recursive: true, force: true });
      },
    };
  } catch (error) {
    server.close();
    await rm(workspace, { recursive: true, force: true });
    throw error;
  }
}
