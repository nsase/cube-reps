import { Injectable, computed, effect, signal } from '@angular/core';
import { Penalty, RecordGroup, Solve, SolveMode } from './cube.models';

/** 削除できない既定の記録グループ。 */
const DEFAULT_GROUP: RecordGroup = {
  id: 'unclassified',
  name: '未分類',
  createdAt: new Date(0).toISOString(),
};

/** 計測記録、グループ、スクランブル生成を管理するアプリケーションサービス。 */
@Injectable({ providedIn: 'root' })
export class CubeService {
  /** 新しい順に保持する全計測記録。 */
  readonly solves = signal<Solve[]>(this.loadSolves());
  /** 作成順に保持する記録グループ。 */
  readonly groups = signal<RecordGroup[]>(this.loadGroups());
  /** 現在の記録先グループID。 */
  readonly activeGroupId = signal(this.loadActiveGroupId());
  /** 現在の記録先グループ。 */
  readonly activeGroup = computed(
    () => this.groups().find((group) => group.id === this.activeGroupId()) ?? this.groups()[0],
  );
  /** 現在のグループに属する計測記録。 */
  readonly activeSolves = computed(() =>
    this.solves().filter((solve) => solve.groupId === this.activeGroupId()),
  );
  /** 現在のグループに属するDNF以外の記録。 */
  readonly validActiveSolves = computed(() =>
    this.activeSolves().filter((solve) => solve.penalty !== 'DNF'),
  );
  /** 現在のグループ内のベストタイム。記録がない場合は`Infinity`。 */
  readonly best = computed(() =>
    Math.min(...this.validActiveSolves().map((solve) => this.finalTime(solve)), Infinity),
  );
  /** 現在のグループにある直近5件の有効記録の平均タイム。 */
  readonly average = computed(() => {
    const times = this.validActiveSolves()
      .slice(0, 5)
      .map((solve) => this.finalTime(solve));
    return times.length ? times.reduce((total, time) => total + time, 0) / times.length : Infinity;
  });

  /** 保存済みデータを初期化し、以後の変更をlocalStorageへ同期する。 */
  constructor() {
    if (!this.groups().length) this.groups.set([DEFAULT_GROUP]);
    if (!this.groups().some((group) => group.id === this.activeGroupId()))
      this.activeGroupId.set(this.groups()[0].id);
    effect(() => localStorage.setItem('cubeflow-solves', JSON.stringify(this.solves())));
    effect(() => localStorage.setItem('cubeflow-groups', JSON.stringify(this.groups())));
    effect(() => localStorage.setItem('cubeflow-active-group', this.activeGroupId()));
  }

  /**
   * 記録グループを作成して記録先に設定する。
   *
   * @param name 作成するグループ名
   * @returns 作成したグループ。空白名の場合は`undefined`
   */
  addGroup(name: string): RecordGroup | undefined {
    const trimmedName = name.trim();
    if (!trimmedName) return undefined;
    const group: RecordGroup = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      createdAt: new Date().toISOString(),
    };
    this.groups.update((groups) => [...groups, group]);
    this.activeGroupId.set(group.id);
    return group;
  }

  /**
   * 指定グループを削除する。既定グループと最後の1件は削除しない。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(id: string): void {
    if (id === DEFAULT_GROUP.id || this.groups().length === 1) return;
    this.groups.update((groups) => groups.filter((group) => group.id !== id));
    if (this.activeGroupId() === id) this.activeGroupId.set(this.groups()[0].id);
  }

  /**
   * グループIDに対応する表示名を返す。
   *
   * @param groupId 検索するグループID
   * @returns グループ名。見つからない場合は「未分類」
   */
  groupName(groupId?: string): string {
    return this.groups().find((group) => group.id === groupId)?.name ?? '未分類';
  }

  /**
   * 現在のグループへ計測記録を追加する。
   *
   * @param time 計測時間（ミリ秒）
   * @param scramble 計測に使用したスクランブル
   * @param mode 計測モード
   * @param caseName PLL練習時のケース名
   */
  addSolve(time: number, scramble: string, mode: SolveMode, caseName?: string): void {
    this.solves.update((solves) => [
      {
        id: Date.now(),
        time,
        scramble,
        date: new Date().toISOString(),
        mode,
        caseName,
        groupId: this.activeGroupId(),
        penalty: 'none',
      },
      ...solves,
    ]);
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(id: number, penalty: Exclude<Penalty, 'none'>): void {
    this.solves.update((solves) =>
      solves.map((solve) =>
        solve.id === id
          ? { ...solve, penalty: solve.penalty === penalty ? 'none' : penalty }
          : solve,
      ),
    );
  }

  /** @param id 削除する計測記録ID */
  removeSolve(id: number): void {
    this.solves.update((solves) => solves.filter((solve) => solve.id !== id));
  }

  /**
   * +2ペナルティを反映した計測時間を返す。
   *
   * @param solve 対象の計測記録
   * @returns 補正後の時間（ミリ秒）
   */
  finalTime(solve: Solve): number {
    return solve.time + (solve.penalty === '+2' ? 2000 : 0);
  }

  /**
   * ミリ秒をタイマー表示用文字列へ整形する。
   *
   * @param milliseconds 整形する時間
   * @returns `m:ss.cc`または`s.cc`形式。有限値でない場合は`—`
   */
  formatTime(milliseconds: number): string {
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
  displayTime(solve: Solve): string {
    return solve.penalty === 'DNF'
      ? 'DNF'
      : `${this.formatTime(this.finalTime(solve))}${solve.penalty === '+2' ? '+' : ''}`;
  }

  /** @returns 同じ面が連続しない20手のランダムスクランブル */
  createScramble(): string {
    const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
    const suffixes = ['', "'", '2'];
    const result: string[] = [];
    while (result.length < 20) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      if (result.at(-1)?.[0] !== move)
        result.push(move + suffixes[Math.floor(Math.random() * suffixes.length)]);
    }
    return result.join(' ');
  }

  /** @returns 保存データを現行グループ形式へ移行した計測記録 */
  private loadSolves(): Solve[] {
    return this.load<Solve[]>('cubeflow-solves', []).map((solve) => ({
      ...solve,
      groupId: !solve.groupId || solve.groupId === 'practice' ? DEFAULT_GROUP.id : solve.groupId,
    }));
  }

  /** @returns 既定グループを保証した保存済みグループ */
  private loadGroups(): RecordGroup[] {
    const groups = this.load<RecordGroup[]>('cubeflow-groups', [DEFAULT_GROUP]);
    const migrated = groups.map((group) =>
      group.id === 'practice'
        ? { ...DEFAULT_GROUP, createdAt: group.createdAt }
        : { id: group.id, name: group.name, createdAt: group.createdAt },
    );
    return migrated.some((group) => group.id === DEFAULT_GROUP.id)
      ? migrated
      : [DEFAULT_GROUP, ...migrated];
  }

  /** @returns 保存済みの記録先ID。旧IDと未設定時は既定グループID */
  private loadActiveGroupId(): string {
    const stored = localStorage.getItem('cubeflow-active-group');
    return !stored || stored === 'practice' ? DEFAULT_GROUP.id : stored;
  }

  /**
   * localStorageのJSON値を安全に読み込む。
   *
   * @param key 読み込むストレージキー
   * @param fallback 未保存または不正なJSONの場合の値
   * @returns 復元した値またはフォールバック
   */
  private load<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }
}
