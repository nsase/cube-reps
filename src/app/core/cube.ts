import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { Penalty, DisplayRecordGroup, RecordGroup, Solve, SolveCategory } from './cube.models';
import { average, mean } from './cube-statistics';
import { USER_DATA_SCHEMA_VERSION, UserDataRepository } from './user-data-repository';

/** ユーザーデータとは分離して常に先頭へ表示する既定の記録グループ。 */
const DEFAULT_GROUPS: readonly DisplayRecordGroup[] = [
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
  /** 同期対象ユーザーデータの永続化を画面とドメイン処理から分離するRepository。 */
  private readonly userDataRepository = inject(UserDataRepository);
  /** Repository初期化前に作成する記録でも使用できる一時ゲストUUID。 */
  private readonly initialGuestOwnerId = crypto.randomUUID();
  /** 現在のゲスト所有者UUID。 */
  private readonly guestOwnerId = signal<string>(this.initialGuestOwnerId);
  /** IndexedDB初期化後の変更だけを保存するフラグ。 */
  private readonly storageReady = signal(false);
  /** アプリ定義グループIDに対応する、ロード完了後の翻訳済み表示名。 */
  private readonly defaultGroupNames = new Map<string, Signal<string>>(
    DEFAULT_GROUPS.flatMap((group) =>
      'nameKey' in group ? [[group.id, translateSignal(group.nameKey)] as const] : [],
    ),
  );
  /** 新しい順に保持する全計測記録。 */
  readonly solves = signal<Solve[]>([]);
  /** 現在の端末ゲストが所有し、初回移行の対象になり得る計測記録。 */
  readonly guestSolves = computed(() =>
    this.solves().filter(
      (solve) => solve.ownerType === 'guest' && solve.ownerId === this.guestOwnerId(),
    ),
  );
  /** 旧データ移行とIndexedDBからの復元が完了したときに解決するPromise。 */
  readonly ready = this.initializeStorage();
  /** 作成順に保持し、IndexedDBへ保存するユーザー作成グループ。 */
  private readonly userGroups = signal<RecordGroup[]>([]);
  /** 既定グループの後ろへユーザー作成グループを連結した表示用一覧。 */
  readonly groups = computed<DisplayRecordGroup[]>(() => [...DEFAULT_GROUPS, ...this.userGroups()]);
  /** 現在の記録先グループID。 */
  readonly activeGroupId = signal(this.loadActiveGroupId());
  /** タイマーで現在選択しているsolveカテゴリー。 */
  readonly activeSolveCategory = signal<SolveCategory>('full');
  /** 履歴からタイマーへ一度だけ引き渡すリトライ対象。 */
  private readonly retrySolve = signal<Solve | undefined>(undefined);
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

  /** 端末固有の選択グループだけをlocalStorageへ保存する。 */
  constructor() {
    effect(() => localStorage.setItem('cube-reps.active-group', this.activeGroupId()));
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
    const now = new Date().toISOString();
    const group: RecordGroup = {
      id: crypto.randomUUID(),
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      ownerType: 'guest',
      ownerId: this.guestOwnerId(),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    this.userGroups.update((groups) => [...groups, group]);
    this.activeGroupId.set(group.id);
    if (this.storageReady()) void this.userDataRepository.putRecordGroup(group);
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
    const current = this.userGroups().find((group) => group.id === id);
    if (!current) return false;
    const updated = { ...current, name: trimmedName, updatedAt: new Date().toISOString() };
    this.userGroups.update((groups) => groups.map((group) => (group.id === id ? updated : group)));
    if (this.storageReady()) void this.userDataRepository.putRecordGroup(updated);
    return true;
  }

  /**
   * 指定したユーザー作成グループを削除し、所属する記録を未分類へ移動する。既定グループは削除しない。
   * グループ整理で計測記録を失わず、削除後も履歴と集計から参照できる状態を守る。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(id: string): void {
    if (DEFAULT_GROUPS.some((group) => group.id === id)) return;
    if (!this.userGroups().some((group) => group.id === id)) return;
    const updatedAt = new Date().toISOString();
    const affectedSolves = this.solves()
      .filter((solve) => solve.groupId === id)
      .map((solve) => ({ ...solve, groupId: DEFAULT_GROUP.id, updatedAt }));
    const affectedById = new Map(affectedSolves.map((solve) => [solve.id, solve]));
    this.solves.update((solves) => solves.map((solve) => affectedById.get(solve.id) ?? solve));
    this.userGroups.update((groups) => groups.filter((group) => group.id !== id));
    if (this.storageReady()) {
      for (const solve of affectedSolves) void this.userDataRepository.putSolve(solve);
      void this.userDataRepository.deleteRecordGroup(id);
    }
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
    const now = new Date().toISOString();
    const solve: Solve = {
      id: crypto.randomUUID(),
      time,
      scramble,
      date: now,
      updatedAt: now,
      ownerType: 'guest',
      ownerId: this.guestOwnerId(),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
      category,
      caseName,
      groupId: this.activeGroupId(),
      penalty: 'none',
    };
    this.solves.update((solves) => [solve, ...solves]);
    if (this.storageReady()) void this.userDataRepository.putSolve(solve);
    return solve;
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(id: string, penalty: Exclude<Penalty, 'none'>): void {
    const current = this.solves().find((solve) => solve.id === id);
    if (!current) return;
    const updated: Solve = {
      ...current,
      penalty: current.penalty === penalty ? 'none' : penalty,
      updatedAt: new Date().toISOString(),
    };
    this.solves.update((solves) => solves.map((solve) => (solve.id === id ? updated : solve)));
    if (this.storageReady()) void this.userDataRepository.putSolve(updated);
  }

  /**
   * 指定Solve一覧に、現在の端末ゲストが所有する未変更の移行対象があるか判定する。
   *
   * @param solves 判定対象のSolve一覧
   * @param migratedSolve クラウドとの比較に使用したSolve
   * @returns 同じ内容を現在のゲストデータとして移行できる場合はtrue
   */
  isCurrentGuestSolveIn(solves: readonly Solve[], migratedSolve: Solve): boolean {
    const current = solves.find(({ id }) => id === migratedSolve.id);
    return Boolean(
      current &&
      current.ownerType === 'guest' &&
      current.ownerId === this.guestOwnerId() &&
      current.updatedAt === migratedSolve.updatedAt,
    );
  }

  /**
   * 指定Solveが現在もこの端末のゲスト所有で、移行時から更新されていないか判定する。
   *
   * @param migratedSolve クラウドとの比較に使用したSolve
   * @returns 同じ内容を現在のゲストデータとして移行できる場合はtrue
   */
  isCurrentGuestSolve(migratedSolve: Solve): boolean {
    return this.isCurrentGuestSolveIn(this.solves(), migratedSolve);
  }

  /**
   * Firestoreへの保存を確認したSolveを、内容を変えずアカウント所有として永続化する。
   * 移行中に同じSolveが編集された場合は所有者を変えず、最新内容を再試行できる状態に保つ。
   *
   * @param migratedSolve クラウドとの比較と保存に使用したSolve
   * @param accountId 保存先FirebaseアカウントのUID
   */
  async assignSolveToAccount(migratedSolve: Solve, accountId: string): Promise<void> {
    if (!this.isCurrentGuestSolve(migratedSolve)) {
      throw new Error('Solve changed during migration');
    }
    const current = this.solves().find(({ id }) => id === migratedSolve.id) as Solve;
    const owned: Solve = { ...current, ownerType: 'account', ownerId: accountId };
    await this.userDataRepository.putSolve(owned);
    this.solves.update((solves) => solves.map((solve) => (solve.id === owned.id ? owned : solve)));
  }

  /** @param id 削除する計測記録ID */
  removeSolve(id: string): void {
    if (!this.solves().some((solve) => solve.id === id)) return;
    this.solves.update((solves) => solves.filter((solve) => solve.id !== id));
    if (this.storageReady()) void this.userDataRepository.deleteSolve(id);
  }

  /**
   * 履歴の記録を次回のタイマー表示でリトライできる状態にする。
   * リトライ結果を元記録と同じ条件で保存できるように、カテゴリーと存在する記録グループも引き継ぐ。
   *
   * @param solve リトライする計測記録
   */
  prepareRetry(solve: Solve): void {
    this.retrySolve.set(solve);
    this.activeSolveCategory.set(solve.category);
    if (solve.groupId && this.groups().some(({ id }) => id === solve.groupId)) {
      this.activeGroupId.set(solve.groupId);
    }
  }

  /**
   * 履歴から指定されたリトライ対象を一度だけ取得する。
   * 通常のタイマー再表示で古いスクランブルを再利用しないように、取得と同時に指定を消費する。
   *
   * @returns リトライ対象。指定されていない場合は`undefined`
   */
  takeRetrySolve(): Solve | undefined {
    const solve = this.retrySolve();
    this.retrySolve.set(undefined);
    return solve;
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

  /** IndexedDBの復元値と起動直後に作成された記録をID単位で統合する。 */
  private async initializeStorage(): Promise<void> {
    const stored = await this.userDataRepository.load();
    this.guestOwnerId.set(stored.guestOwnerId);
    const current = this.solves().map((solve) =>
      solve.ownerId === this.initialGuestOwnerId
        ? { ...solve, ownerId: stored.guestOwnerId }
        : solve,
    );
    const currentIds = new Set(current.map(({ id }) => id));
    this.solves.set([...current, ...stored.solves.filter(({ id }) => !currentIds.has(id))]);
    const currentGroups = this.userGroups().map((group) =>
      group.ownerId === this.initialGuestOwnerId
        ? { ...group, ownerId: stored.guestOwnerId }
        : group,
    );
    const currentGroupIds = new Set(currentGroups.map(({ id }) => id));
    this.userGroups.set([
      ...currentGroups,
      ...stored.groups.filter(({ id }) => !currentGroupIds.has(id)),
    ]);
    if (!this.groups().some(({ id }) => id === this.activeGroupId())) {
      this.activeGroupId.set(DEFAULT_GROUP.id);
    }
    await Promise.all([
      ...current.map((solve) => this.userDataRepository.putSolve(solve)),
      ...currentGroups.map((group) => this.userDataRepository.putRecordGroup(group)),
    ]);
    this.storageReady.set(true);
  }

  /** @returns 保存済みの記録先ID。未設定時は既定グループID */
  private loadActiveGroupId(): string {
    const stored = localStorage.getItem('cube-reps.active-group');
    return stored || DEFAULT_GROUP.id;
  }
}
