import { Penalty, Solve, SolveCategory } from '../cube.models';
import { USER_DATA_SCHEMA_VERSION } from '../user-data-repository';

/** Firestoreへ保存する計測記録の現行形式。 */
export interface FirestoreSolveDocument {
  /** ドキュメントIDと一致する固定UUID。 */
  readonly id: string;
  /** ペナルティ適用前の計測時間（ミリ秒）。 */
  readonly time: number;
  /** 計測時に使用したスクランブル。 */
  readonly scramble: string;
  /** Firestoreで並べ替え可能な計測日時。 */
  readonly date: Date;
  /** Firestoreで競合判定に利用できる更新日時。 */
  readonly updatedAt: Date;
  /** Firebase Authenticationの所有者UID。 */
  readonly ownerId: string;
  /** クラウド上では常にアカウント所有とする種別。 */
  readonly ownerType: 'account';
  /** 保存形式を識別するバージョン。 */
  readonly schemaVersion: number;
  /** 計測記録のカテゴリー。 */
  readonly category: SolveCategory;
  /** PLL練習時のケース名。 */
  readonly caseName?: string;
  /** 記録が属するグループID。 */
  readonly groupId?: string;
  /** 記録へ適用されたペナルティ。 */
  readonly penalty: Penalty;
  /** 削除済みSolveを表すサーバー確定日時。 */
  readonly deletedAt?: Date;
}

/**
 * 現行SolveをFirestoreの保存形式へ変換する。
 * クラウド上の所有者は呼び出し元の認証UIDで上書きし、端末のゲスト所有情報を送信しない。
 *
 * @param solve 保存する計測記録
 * @param userId Firebase AuthenticationのUID
 * @returns Firestoreがtimestampとして保存するDateを使用したドキュメント
 */
export function toFirestoreSolve(solve: Solve, userId: string): FirestoreSolveDocument {
  return omitUndefined({
    ...solve,
    date: new Date(solve.date),
    updatedAt: new Date(solve.updatedAt),
    deletedAt: solve.deletedAt ? new Date(solve.deletedAt) : undefined,
    ownerId: userId,
    ownerType: 'account' as const,
    schemaVersion: USER_DATA_SCHEMA_VERSION,
  });
}

/**
 * Firestoreの現行・旧形式をアプリの現行Solveへ正規化する。
 * 追加フィールドや省略可能項目の欠落を許容し、将来の段階的な移行でも読み込みを継続できるようにする。
 *
 * @param id FirestoreドキュメントID
 * @param value Firestoreから取得したデータ
 * @param userId 読み込み対象ユーザーのUID
 * @returns 必須項目を読み取れた場合の現行Solve
 */
export function fromFirestoreSolve(id: string, value: unknown, userId: string): Solve | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value['time'] !== 'number' || !Number.isFinite(value['time'])) return undefined;
  if (typeof value['scramble'] !== 'string') return undefined;
  const date = readDate(value['date']);
  if (!date) return undefined;
  const updatedAt = readDate(value['updatedAt']) ?? date;
  const category = readCategory(value['category']);
  const penalty = readPenalty(value['penalty']);
  return omitUndefined({
    id,
    time: value['time'],
    scramble: value['scramble'],
    date,
    updatedAt,
    ownerType: 'account' as const,
    ownerId: userId,
    schemaVersion: typeof value['schemaVersion'] === 'number' ? value['schemaVersion'] : 0,
    category,
    caseName: typeof value['caseName'] === 'string' ? value['caseName'] : undefined,
    groupId: typeof value['groupId'] === 'string' ? value['groupId'] : undefined,
    penalty,
    deletedAt: readDate(value['deletedAt']),
  });
}

/** 値がキー参照可能なオブジェクトか判定する。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Firestore Timestampまたは旧ISO文字列をISO 8601文字列へ変換する。 */
function readDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString();
  if (isRecord(value) && typeof value['toDate'] === 'function') {
    const date = (value['toDate'] as () => unknown)();
    if (date instanceof Date && !Number.isNaN(date.valueOf())) return date.toISOString();
  }
  if (typeof value !== 'string') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

/** 未知の旧カテゴリーをフルソルブへ寄せる。 */
function readCategory(value: unknown): SolveCategory {
  return value === 'oll' || value === 'pll' ? value : 'full';
}

/** 未知または欠落した旧ペナルティを未適用へ寄せる。 */
function readPenalty(value: unknown): Penalty {
  return value === '+2' || value === 'DNF' ? value : 'none';
}

/** Firestoreが拒否するundefinedフィールドだけを取り除く。 */
function omitUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}
