import { F2lSlot, Penalty, Solve, SolveCategory } from '../cube/cube.models';
import { USER_DATA_SCHEMA_VERSION } from '../local-storage/user-data-repository';
import { isRecord, omitUndefined, readDate } from './utils';

/** Firestoreへ保存する計測記録の現行形式。 */
export interface FirestoreSolveDocument {
  /** ドキュメントIDと一致する固定UUID。 */
  readonly id: string;
  /** ペナルティ適用前の計測時間（ミリ秒）。 */
  readonly time: number;
  /** 計測時に使用したスクランブル。 */
  readonly scramble: string;
  /** Firestoreで並べ替え可能な計測日時。 */
  readonly createdAt: Date;
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
  /** ケース練習時の表示番号またはケース名。 */
  readonly caseName?: string;
  /** F2Lの表示番号から独立した固定識別子。 */
  readonly f2lCaseId?: string;
  /** F2Lで解いた対象位置。 */
  readonly f2lSlot?: F2lSlot;
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
  const { pendingSync: _localPending, ...document } = solve;
  return omitUndefined({
    ...document,
    createdAt: new Date(solve.createdAt),
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
 * F2Lのケース・スロットが不正な記録は、別の条件で再計測されることを防ぐため読み込まない。
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
  const createdAt = readDate(value['createdAt']) ?? readDate(value['date']);
  if (!createdAt) return undefined;
  const updatedAt = readDate(value['updatedAt']) ?? createdAt;
  const category = readCategory(value['category']);
  if (
    category === 'f2l' &&
    (typeof value['f2lCaseId'] !== 'string' ||
      !/^F2L-(0[1-9]|[1-3][0-9]|4[01])$/.test(value['f2lCaseId']) ||
      typeof value['f2lSlot'] !== 'string' ||
      !['FR', 'FL', 'BL', 'BR'].includes(value['f2lSlot']) ||
      typeof value['caseName'] !== 'string')
  )
    return undefined;
  const penalty = readPenalty(value['penalty']);
  return omitUndefined({
    id,
    time: value['time'],
    scramble: value['scramble'],
    createdAt,
    updatedAt,
    ownerType: 'account' as const,
    ownerId: userId,
    schemaVersion: typeof value['schemaVersion'] === 'number' ? value['schemaVersion'] : 0,
    category,
    caseName: typeof value['caseName'] === 'string' ? value['caseName'] : undefined,
    ...(category === 'f2l'
      ? { f2lCaseId: value['f2lCaseId'] as string, f2lSlot: value['f2lSlot'] as F2lSlot }
      : {}),
    groupId: typeof value['groupId'] === 'string' ? value['groupId'] : undefined,
    penalty,
    deletedAt: readDate(value['deletedAt']),
  });
}

/** 未知の旧カテゴリーをフルソルブへ寄せる。 */
function readCategory(value: unknown): SolveCategory {
  return value === 'f2l' || value === 'oll' || value === 'pll' ? value : 'full';
}

/** 未知または欠落した旧ペナルティを未適用へ寄せる。 */
function readPenalty(value: unknown): Penalty {
  return value === '+2' || value === 'DNF' ? value : 'none';
}
