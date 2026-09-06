/** 値がキー参照可能なオブジェクトか判定する。 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Firestore Timestampまたは旧ISO文字列をISO 8601文字列へ変換する。 */
export function readDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString();
  if (isRecord(value) && typeof value['toDate'] === 'function') {
    const date = (value['toDate'] as () => unknown)();
    if (date instanceof Date && !Number.isNaN(date.valueOf())) return date.toISOString();
  }
  if (typeof value !== 'string') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

/** Firestoreが拒否するundefinedフィールドだけを取り除く。 */
export function omitUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}
