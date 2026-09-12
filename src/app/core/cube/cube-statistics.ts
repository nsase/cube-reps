/**
 * 指定された全成績の算術平均を返す。
 *
 * @param values 集計するタイム。DNFは`Infinity`で表す
 * @returns 算術平均。空配列の場合は`undefined`
 */
export function mean(values: readonly number[]): number | undefined {
  if (!values.length) return undefined;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * 上位・下位からそれぞれ5%（端数切り上げ）を除外した平均を返す。
 *
 * @param values 集計するタイム。DNFは`Infinity`で表す
 * @returns トリム後の算術平均。空配列の場合は`undefined`
 */
export function average(values: readonly number[]): number | undefined {
  if (!values.length) return undefined;
  const trimCount = Math.ceil(values.length * 0.05);
  const trimmed = [...values].sort((left, right) => left - right).slice(trimCount, -trimCount);
  return mean(trimmed);
}
