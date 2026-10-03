import { Solve } from './cube.models';

/**
 * +2ペナルティを反映した計測時間を返す。
 *
 * @param solve 対象の計測記録
 * @returns 補正後の時間（ミリ秒）
 */
export function finalTime(solve: Solve): number {
  return solve.time + (solve.penalty === '+2' ? 2000 : 0);
}

/**
 * 集計用にDNFを最悪値へ変換したタイムを返す。
 *
 * @param solve 対象の計測記録
 * @returns +2反映後のタイム。DNFの場合は`Infinity`
 */
export function statTime(solve: Solve): number {
  return solve.penalty === 'DNF' ? Infinity : finalTime(solve);
}

/**
 * ミリ秒をタイマー表示用文字列へ整形する。
 *
 * @param milliseconds 整形する時間
 * @returns `m:ss.cc`または`s.cc`形式。有限値でない場合は`—`
 */
export function formatTime(milliseconds: number): string {
  if (!Number.isFinite(milliseconds)) return '—';
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const centiseconds = Math.floor((milliseconds % 1000) / 10);
  return `${minutes ? `${minutes}:` : ''}${minutes ? String(seconds).padStart(2, '0') : seconds}.${String(centiseconds).padStart(2, '0')}`;
}

/**
 * ペナルティを含む記録の表示文字列を返す。
 *
 * @param solve 表示する計測記録
 * @returns DNFまたは整形済みタイム
 */
export function displayTime(solve: Solve): string {
  return solve.penalty === 'DNF'
    ? 'DNF'
    : `${formatTime(finalTime(solve))}${solve.penalty === '+2' ? '+' : ''}`;
}
