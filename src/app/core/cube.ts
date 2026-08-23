import { Injectable, Signal, computed, effect, signal } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { Penalty, RecordGroup, Solve, SolveCategory } from './cube.models';
import { average, mean } from './cube-statistics';

/** ユーザーデータとは分離して常に先頭へ表示する既定の記録グループ。 */
const DEFAULT_GROUPS: readonly RecordGroup[] = [
  {
    id: 'unclassified',
    name: 'Unclassified',
    nameKey: 'history.unclassified',
    createdAt: new Date(0).toISOString(),
  },
];

/** 記録先が存在しない場合に使用する既定グループ。 */
const DEFAULT_GROUP = DEFAULT_GROUPS[0];

/** 計測記録、グループ、スクランブル生成を管理するアプリケーションサービス。 */
@Injectable({ providedIn: 'root' })
export class CubeService {
  /** アプリ定義グループIDに対応する、ロード完了後の翻訳済み表示名。 */
  private readonly defaultGroupNames = new Map<string, Signal<string>>(
    DEFAULT_GROUPS.flatMap((group) =>
      group.nameKey ? [[group.id, translateSignal(group.nameKey)] as const] : [],
    ),
  );
  /** 新しい順に保持する全計測記録。 */
  readonly solves = signal<Solve[]>(this.loadSolves());
  /** 作成順に保持し、localStorageへ保存するユーザー作成グループ。 */
  private readonly userGroups = signal<RecordGroup[]>(this.loadUserGroups());
  /** 既定グループの後ろへユーザー作成グループを連結した表示用一覧。 */
  readonly groups = computed<RecordGroup[]>(() => [...DEFAULT_GROUPS, ...this.userGroups()]);
  /** 現在の記録先グループID。 */
  readonly activeGroupId = signal(this.loadActiveGroupId());
  /** タイマーで現在選択しているsolveカテゴリー。 */
  readonly activeSolveCategory = signal<SolveCategory>('full');
  /** 現在の記録先グループ。 */
  readonly activeGroup = computed(
    () => this.groups().find((group) => group.id === this.activeGroupId()) ?? this.groups()[0],
  );
  /** 現在のグループに属する計測記録。 */
  readonly activeSolves = computed(() =>
    this.solves().filter(
      (solve) =>
        solve.groupId === this.activeGroupId() && solve.category === this.activeSolveCategory(),
    ),
  );
  /** 現在のグループに属するDNF以外の記録。 */
  readonly validActiveSolves = computed(() =>
    this.activeSolves().filter((solve) => solve.penalty !== 'DNF'),
  );
  /** 現在のグループ内のベストタイム。記録がない場合は`Infinity`。 */
  readonly best = computed(() =>
    Math.min(...this.validActiveSolves().map((solve) => this.finalTime(solve)), Infinity),
  );
  /** 現在のグループにある全記録のMean。 */
  readonly mean = computed(() =>
    mean(this.validActiveSolves().map((solve) => this.finalTime(solve))),
  );
  /** 現在のグループにある直近5件のAverage。 */
  readonly ao5 = computed(() => this.averageOf(this.activeSolves(), 5));
  /** 現在のグループにある直近12件のAverage。 */
  readonly ao12 = computed(() => this.averageOf(this.activeSolves(), 12));
  /** 現在のグループにある直近50件のAverage。 */
  readonly ao50 = computed(() => this.averageOf(this.activeSolves(), 50));
  /** 現在のグループにある直近100件のAverage。 */
  readonly ao100 = computed(() => this.averageOf(this.activeSolves(), 100));

  /** 保存済みデータを初期化し、以後の変更をlocalStorageへ同期する。 */
  constructor() {
    if (!this.groups().some((group) => group.id === this.activeGroupId()))
      this.activeGroupId.set(DEFAULT_GROUP.id);
    effect(() => localStorage.setItem('cube-stride.solves', JSON.stringify(this.solves())));
    effect(() => localStorage.setItem('cube-stride.groups', JSON.stringify(this.userGroups())));
    effect(() => localStorage.setItem('cube-stride.active-group', this.activeGroupId()));
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
      id: crypto.randomUUID(),
      name: trimmedName,
      createdAt: new Date().toISOString(),
    };
    this.userGroups.update((groups) => [...groups, group]);
    this.activeGroupId.set(group.id);
    return group;
  }

  /**
   * ユーザー作成グループの名前を変更する。既定グループは変更しない。
   *
   * @param id 名前を変更するグループID
   * @param name 新しいグループ名
   * @returns 名前を変更できた場合は`true`
   */
  renameGroup(id: string, name: string): boolean {
    const trimmedName = name.trim();
    if (!trimmedName || DEFAULT_GROUPS.some((group) => group.id === id)) return false;
    if (!this.userGroups().some((group) => group.id === id)) return false;
    this.userGroups.update((groups) =>
      groups.map((group) => (group.id === id ? { ...group, name: trimmedName } : group)),
    );
    return true;
  }

  /**
   * 指定したユーザー作成グループを削除する。既定グループは削除しない。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(id: string): void {
    if (DEFAULT_GROUPS.some((group) => group.id === id)) return;
    this.userGroups.update((groups) => groups.filter((group) => group.id !== id));
    if (this.activeGroupId() === id) this.activeGroupId.set(DEFAULT_GROUP.id);
  }

  /**
   * グループIDに対応する表示名を返す。
   *
   * @param groupId 検索するグループID
   * @returns グループ名。見つからない場合は既定グループ名
   */
  groupName(groupId?: string): string {
    const group = this.groups().find(({ id }) => id === groupId) ?? DEFAULT_GROUP;
    return this.defaultGroupNames.get(group.id)?.() ?? group.name;
  }

  /**
   * 現在のグループへ計測記録を追加する。
   *
   * @param time 計測時間（ミリ秒）
   * @param scramble 計測に使用したスクランブル
   * @param category 集計カテゴリーID
   * @param caseName PLL練習時のケース名
   * @returns 保存した計測記録
   */
  addSolve(time: number, scramble: string, category: SolveCategory, caseName?: string): Solve {
    const solve: Solve = {
      id: crypto.randomUUID(),
      time,
      scramble,
      date: new Date().toISOString(),
      category,
      caseName,
      groupId: this.activeGroupId(),
      penalty: 'none',
    };
    this.solves.update((solves) => [solve, ...solves]);
    return solve;
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(id: string, penalty: Exclude<Penalty, 'none'>): void {
    this.solves.update((solves) =>
      solves.map((solve) =>
        solve.id === id
          ? { ...solve, penalty: solve.penalty === penalty ? 'none' : penalty }
          : solve,
      ),
    );
  }

  /** @param id 削除する計測記録ID */
  removeSolve(id: string): void {
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
   * 集計用にDNFを最悪値へ変換したタイムを返す。
   *
   * @param solve 対象の計測記録
   * @returns +2反映後のタイム。DNFの場合は`Infinity`
   */
  statTime(solve: Solve): number {
    return solve.penalty === 'DNF' ? Infinity : this.finalTime(solve);
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

  /** @returns 3×3の合法状態を均等に選んだrandom-state scramble */
  async createScramble(): Promise<string> {
    const [{ randomScrambleForEvent }, { setSearchDebug }] = await Promise.all([
      import('cubing/scramble'),
      import('cubing/search'),
    ]);
    setSearchDebug({ logPerf: false });
    return (await randomScrambleForEvent('333')).toString();
  }

  /** 指定件数が揃っている場合に、最新記録からAverageを計算する。 */
  private averageOf(solves: readonly Solve[], count: number): number | undefined {
    if (solves.length < count) return undefined;
    return average(solves.slice(0, count).map((solve) => this.statTime(solve)));
  }

  /** @returns 保存データを現行グループ形式へ移行した計測記録 */
  private loadSolves(): Solve[] {
    return this.load<Solve[]>('cube-stride.solves', []).map((solve) => ({
      ...solve,
      groupId: solve.groupId || DEFAULT_GROUP.id,
    }));
  }

  /** @returns 保存済みデータから既定グループを除外したユーザー作成グループ */
  private loadUserGroups(): RecordGroup[] {
    return this.load<RecordGroup[]>('cube-stride.groups', [])
      .filter((group) => !DEFAULT_GROUPS.some(({ id }) => id === group.id))
      .map((group) => ({ id: group.id, name: group.name, createdAt: group.createdAt }));
  }

  /** @returns 保存済みの記録先ID。未設定時は既定グループID */
  private loadActiveGroupId(): string {
    const stored = localStorage.getItem('cube-stride.active-group');
    return stored || DEFAULT_GROUP.id;
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
