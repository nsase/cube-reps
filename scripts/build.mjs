import { spawnSync } from 'node:child_process';
import { buildWorker } from './build-worker.mjs';

const args = process.argv.slice(2);
const result = spawnSync(
  process.execPath,
  ['node_modules/@angular/cli/bin/ng.js', 'build', ...args],
  {
    stdio: 'inherit',
  },
);
if (result.status !== 0) process.exit(result.status ?? 1);
const outputIndex = args.indexOf('--output-path');
const output = outputIndex >= 0 ? args[outputIndex + 1] : 'dist/cube-reps';
await buildWorker(`${output}/browser`);
