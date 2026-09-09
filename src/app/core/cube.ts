import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { AccountStore } from './account.store';
import { AuthService } from './auth/auth.service';
import { average, mean } from './cube-statistics';
import {
  DisplayRecordGroup,
  Penalty,
  RecordGroup,
  Solve,
  SolveCategory,
  SyncMetadata,
} from './cube.models';
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
  /** 新規の計測記録の所有者と表示対象アカウントを決める認証状態。 */
  private readonly auth = inject(AuthService);

  /** アカウント情報を保存するストア */
  private readonly accountStore = inject(AccountStore);

  /** 同期対象ユーザーデータの永続化を画面とドメイン処理から分離するRepository。 */
  private readonly userDataRepository = inject(UserDataRepository);

  /** データのロードが完了し、データが更新可能な状態になった */
  readonly ready = this.initializeStorage();

  /** データのロードが完了し、データが更新可能な状態になった */
  readonly storageReady = signal(false);

  /** tombstoneを含む、ブラウザ内の全所有者の計測記録。 */
  readonly storedSolves = signal<readonly Solve[]>([]);
  /** 認証状態に関係なく公開する、新しい順のブラウザ内履歴。削除済みのものは含まない。 */
  readonly activeSolves = computed(() =>
    this.storedSolves()
      .filter((solve) => !solve.deletedAt)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
  );
  /** アカウント未紐づけで、選択移行の対象になる計測記録。 */
  readonly guestSolves = computed(() =>
    this.storedSolves().filter((solve) => solve.ownerType === 'guest' && !solve.deletedAt),
  );
  /** 現在ログイン中のアカウントが所有する、未削除の計測記録。 */
  readonly accountSolves = computed(() => {
    const accountId = this.auth.user()?.uid;
    if (!accountId) return [];
    return this.storedSolves().filter(
      (solve) => solve.ownerType === 'account' && solve.ownerId === accountId && !solve.deletedAt,
    );
  });
  /** 現在のグループに属する計測記録。 */
  readonly activeGroupSolves = computed(() =>
    this.activeSolves().filter(
      (solve) =>
        (solve.groupId || DEFAULT_GROUP.id) === this.activeGroupId() &&
        solve.category === this.activeSolveCategory(),
    ),
  );
  /** 現在のグループに属するDNF以外の記録。 */
  readonly validActiveGroupSolves = computed(() =>
    this.activeGroupSolves().filter((solve) => solve.penalty !== 'DNF'),
  );

  /** 作成順に保持し、IndexedDBへ保存するユーザー作成グループ。 */
  readonly userGroups = signal<RecordGroup[]>([]);
  /** 別端末から取得した、台帳にないグループの表示名。 */
  private readonly savedGroupLabel = translateSignal('ownership.savedGroup');
  /**
   *  有効なグループの一覧。
   * リモートの計測記録がIndexedDBにないグループを参照している場合、group.idをグループ名として表示する。
   */
  readonly activeGroups = computed<DisplayRecordGroup[]>(() => {
    const groups: DisplayRecordGroup[] = [
      ...DEFAULT_GROUPS,
      ...this.userGroups().filter((group) => !group.deletedAt),
    ];
    const knownGroupIds = new Set([...groups, ...this.userGroups()].map((group) => group.id));
    for (const solve of this.activeSolves()) {
      if (!solve.groupId || knownGroupIds.has(solve.groupId)) continue;
      knownGroupIds.add(solve.groupId);
      groups.push({
        id: solve.groupId,
        name: `${this.savedGroupLabel()} (${solve.groupId})`,
        createdAt: solve.createdAt,
        updatedAt: solve.updatedAt,
        ownerType: solve.ownerType,
        ...(solve.ownerId ? { ownerId: solve.ownerId } : {}),
        schemaVersion: USER_DATA_SCHEMA_VERSION,
      });
    }
    return groups;
  });
  /** 現在の記録先グループID。 */
  readonly activeGroupId = signal(this.loadActiveGroupId());
  /** 現在の記録先グループ。 */
  readonly activeGroup = computed(
    () =>
      this.activeGroups().find((group) => group.id === this.activeGroupId()) ??
      this.activeGroups()[0],
  );
  /** アプリ定義グループIDに対応する、ロード完了後の翻訳済み表示名。 */
  private readonly defaultGroupNames = new Map<string, Signal<string>>(
    DEFAULT_GROUPS.flatMap((group) =>
      'nameKey' in group ? [[group.id, translateSignal(group.nameKey)] as const] : [],
    ),
  );

  /** タイマーで現在選択しているsolveカテゴリー。 */
  readonly activeSolveCategory = signal<SolveCategory>('full');

  /** 履歴からタイマーへ一度だけ引き渡すリトライ対象。 */
  private readonly retrySolve = signal<Solve | undefined>(undefined);

  /** 現在のグループ内のベストタイム。記録がない場合は`Infinity`。 */
  readonly best = computed(() =>
    Math.min(...this.validActiveGroupSolves().map((solve) => this.finalTime(solve)), Infinity),
  );
  /** 現在のグループにある全記録のMean。 */
  readonly mean = computed(() =>
    mean(this.validActiveGroupSolves().map((solve) => this.finalTime(solve))),
  );
  /** 現在のグループにある直近5件のAverage。 */
  readonly ao5 = computed(() => this.averageOf(this.activeGroupSolves(), 5));
  /** 現在のグループにある直近12件のAverage。 */
  readonly ao12 = computed(() => this.averageOf(this.activeGroupSolves(), 12));
  /** 現在のグループにある直近50件のAverage。 */
  readonly ao50 = computed(() => this.averageOf(this.activeGroupSolves(), 50));
  /** 現在のグループにある直近100件のAverage。 */
  readonly ao100 = computed(() => this.averageOf(this.activeGroupSolves(), 100));

  /** 計測記録がアップデートされた再にイベントを通知する */
  readonly solveChange$ = new Subject<Solve | Solve[]>();
  /** 記録グループがアップデートされた際にイベントを通知する */
  readonly groupChange$ = new Subject<RecordGroup>();

  /** 端末固有の選択グループだけをlocalStorageへ保存する。 */
  constructor() {
    effect(() => localStorage.setItem('cube-reps.active-group', this.activeGroupId()));
  }

  /**
   * クラウドから取得した記録グループを、ローカルの計測記録と統合する。
   */
  async mergeGroups(remoteGroups: readonly RecordGroup[]): Promise<void> {
    const currentGroups = this.userGroups();
    const groupsById = new Map(currentGroups.map((group) => [group.id, group]));
    const changedGroups: RecordGroup[] = [];
    for (const remote of remoteGroups) {
      const local = groupsById.get(remote.id);
      if (local && !this.remoteWins(local, remote)) continue;
      groupsById.set(remote.id, remote);
      changedGroups.push(remote);
    }
    if (changedGroups.length === 0) return;

    // storeを更新
    this.userGroups.set(
      [...groupsById.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
    // IndexedDBを更新
    const updatedGroups = changedGroups.filter((group) => !group.deletedAt);
    const deletedGroups = changedGroups.filter((group) => group.deletedAt);
    await Promise.all([
      ...updatedGroups.map((group) => this.userDataRepository.putRecordGroup(group)),
      ...deletedGroups.map((group) => this.userDataRepository.deleteRecordGroup(group.id)),
    ]);

    // 削除済みグループに所属する計測記録を未分類グループへ移動する
    await this.reconcileDeletedGroups();
  }

  /**
   * クラウドとの同期の終えたグループの同期中のフラグを解除して、IndexedDBへ保存する。
   *
   * @param group クラウドとの同期を終えた記録グループ
   */
  async groupSyncFinished(group: RecordGroup): Promise<void> {
    const current = this.userGroups().find((g) => g.id === group.id);
    if (!current || !this.isLatestSyncData(current, group)) return;

    const { pendingSync: _pending, ...saved } = group;
    this.userGroups.update((groups) => groups.map((g) => (g.id === saved.id ? saved : g)));
    if (saved.deletedAt) await this.userDataRepository.deleteRecordGroup(saved.id);
    else await this.userDataRepository.putRecordGroup(saved);
  }

  /** 選択した未紐づけ記録グループを現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignGroupToAccount(group: RecordGroup, accountId: string): void {
    // ゲスト記録以外は移行できない。アカウント間の移行はコピーで行う。
    if (group.ownerType !== 'guest') throw new Error('Invalid transfer source');

    // 計測記録をアカウントに移行する
    const updated: RecordGroup = {
      ...group,
      updatedAt: new Date().toISOString(),
      ownerType: 'account',
      ownerId: accountId,
      pendingSync: true,
    };
    this.userGroups.update((groups) =>
      groups.map((item) => (item.id === group.id ? updated : item)),
    );

    // 記録グループの変更を通知（DBへの保存などを行う）
    this.groupChange$.next(updated);
  }

  /**
   * 記録グループを作成して記録先に設定する。
   *
   * @param name 作成するグループ名
   * @returns 作成したグループ。空白名の場合は`undefined`
   */
  addGroup(name: string): RecordGroup | undefined {
    // グループを追加
    const trimmedName = name.trim();
    if (!trimmedName) return undefined;
    const now = new Date().toISOString();
    const group: RecordGroup = {
      id: crypto.randomUUID(),
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      ownerType: this.auth.user() ? 'account' : 'guest',
      ...(this.auth.user() ? { ownerId: this.auth.user()!.uid, pendingSync: true } : {}),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    this.userGroups.update((groups) => [...groups, group]);

    // 作成したグループをアクティブな記録先に設定
    this.activeGroupId.set(group.id);

    // グループの変更を通知（DBへの保存などを行う）
    this.groupChange$.next(group);
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
    // 名前が空だった場合やデフォルトグループだった場合は名前を変更しない
    const trimmedName = name.trim();
    if (!trimmedName || DEFAULT_GROUPS.some((group) => group.id === id)) return false;

    // ほかアカウントのデータが混ざっている場合は変更しない(Guestデータの場合は変更可能)
    const current = this.userGroups().find((group) => group.id === id);
    if (!current || !this.canManageGroup(id)) return false;

    // グループ名を更新
    const updated = {
      ...current,
      pendingSync: current.ownerType === 'account',
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    };
    this.userGroups.update((groups) => groups.map((group) => (group.id === id ? updated : group)));

    // グループの変更を通知（DBへの保存などを行う）
    this.groupChange$.next(updated);
    return true;
  }

  /**
   * 指定したユーザー作成グループを削除し、所属する記録を未分類へ移動する。既定グループは削除しない。
   * グループ整理で計測記録を失わず、削除後も履歴と集計から参照できる状態を守る。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(id: string): void {
    // 既定グループは削除しない
    if (DEFAULT_GROUPS.some((group) => group.id === id)) return;

    // ほかアカウントのデータが混ざっている場合は削除しない(Guestデータの場合は削除可能)
    if (!this.canManageGroup(id)) return;

    // 削除対象グループを取得（取得できない場合は削除処理は中止）
    const group = this.userGroups().find((group) => group.id === id);
    if (!group) return;

    // 削除するグループに属する計測記録を「未分類」へ移動する
    const now = new Date().toISOString();
    const affectedSolves = this.storedSolves()
      .filter((solve) => solve.groupId === id)
      .map((solve) => ({
        ...solve,
        groupId: DEFAULT_GROUP.id,
        updatedAt: now,
        pendingSync: solve.ownerType === 'account',
      }));
    const affectedById = new Map(affectedSolves.map((solve) => [solve.id, solve]));
    this.storedSolves.update((solves) =>
      solves.map((solve) => affectedById.get(solve.id) ?? solve),
    );

    // グループを削除
    const deleted = {
      ...group,
      updatedAt: now,
      deletedAt: now,
      pendingSync: group.ownerType === 'account',
    };
    this.userGroups.update((groups) => groups.map((item) => (item.id === id ? deleted : item)));

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(affectedSolves);

    // グループの変更を通知（DBへの保存などを行う）
    this.groupChange$.next(deleted);

    // 削除したグループが現在のアクティブグループだった場合は、未分類を選択する
    if (this.activeGroupId() === id) this.activeGroupId.set(DEFAULT_GROUP.id);
  }

  /**
   * グループIDに対応する表示名を返す。
   *
   * @param groupId 検索するグループID
   * @returns グループ名。見つからない場合は既定グループ名
   */
  groupName(groupId?: string): string {
    const group = this.activeGroups().find(({ id }) => id === groupId) ?? DEFAULT_GROUP;
    return this.defaultGroupNames.get(group.id)?.() ?? group.name;
  }

  /**
   * クラウドから取得した計測記録を、ローカルの計測記録と統合する。
   */
  async mergeSolves(remoteSolves: readonly Solve[]): Promise<void> {
    const currentSolves = this.storedSolves();
    const solvesById = new Map(currentSolves.map((solve) => [solve.id, solve]));
    const changedSolves: Solve[] = [];
    for (const remote of remoteSolves) {
      const local = solvesById.get(remote.id);
      if (!this.remoteWins(local, remote)) continue;
      solvesById.set(remote.id, remote);
      changedSolves.push(remote);
    }
    if (changedSolves.length === 0) return;

    this.storedSolves.set(
      [...solvesById.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
    await Promise.all(changedSolves.map((solve) => this.userDataRepository.putSolve(solve)));

    // 削除済みグループに所属する計測記録を未分類グループへ移動する
    await this.reconcileDeletedGroups();
  }

  /**
   * クラウドとの同期の終えた計測記録の同期中のフラグを解除して、IndexedDBへ保存する。
   *
   * @param solve クラウドとの同期を終えた計測記録
   */
  async solveSyncFinished(solve: Solve): Promise<void> {
    const current = this.storedSolves().find((s) => s.id === solve.id);
    if (!current || !this.isLatestSyncData(current, solve)) return;

    const { pendingSync: _pending, ...saved } = solve;
    this.storedSolves.update((solves) => solves.map((s) => (s.id === saved.id ? saved : s)));
    await this.userDataRepository.putSolve(saved);
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
    // 計測記録を作成
    const now = new Date().toISOString();
    const accountId = this.auth.user()?.uid;
    const solve: Solve = {
      id: crypto.randomUUID(),
      time,
      scramble,
      createdAt: now,
      updatedAt: now,
      ownerType: accountId ? 'account' : 'guest',
      ...(accountId ? { ownerId: accountId } : {}),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
      category,
      caseName,
      groupId: this.activeGroupId(),
      penalty: 'none',
      pendingSync: !!accountId,
    };
    this.storedSolves.update((solves) => [solve, ...solves]);

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(solve);
    return solve;
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(id: string, penalty: Exclude<Penalty, 'none'>): void {
    // 計測記録がない（tombstone含む）、または別アカウントデータであれば、編集はできない
    const current = this.activeSolves().find((solve) => solve.id === id);
    if (!current || !this.canManageSolve(current)) return;

    // 計測記録のペナルティーを更新する
    const updated: Solve = {
      ...current,
      updatedAt: new Date().toISOString(),
      penalty: current.penalty === penalty ? 'none' : penalty,
      pendingSync: current.ownerType === 'account',
    };
    this.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === id ? updated : solve)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(updated);
  }

  /**
   * 指定した計測記録を削除する。
   * 削除した計測記録は、クラウド同期が完了するまでtombstoneとして保持される。
   *
   * @param id 削除する計測記録ID
   */
  removeSolve(id: string): void {
    // 計測記録がない（tombstone含む）、または別アカウントデータであれば、削除はできない
    const current = this.activeSolves().find((solve) => solve.id === id);
    if (!current || !this.canManageSolve(current)) return;

    // 計測記録を削除する
    const now = new Date().toISOString();
    const deleted = {
      ...current,
      updatedAt: now,
      deletedAt: now,
      pendingSync: current.ownerType === 'account',
    };
    this.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === id ? deleted : solve)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(deleted);
  }

  /** 選択した未紐づけ記録を現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignSolveToAccount(solve: Solve, accountId: string): void {
    // ゲスト記録以外は移行できない。アカウント間の移行はコピーで行う。
    if (solve.ownerType !== 'guest') throw new Error('Invalid transfer source');

    // 計測記録をアカウントに移行する
    const updated: Solve = {
      ...solve,
      updatedAt: new Date().toISOString(),
      ownerType: 'account',
      ownerId: accountId,
      pendingSync: true,
    };
    this.storedSolves.update((solves) =>
      solves.map((item) => (item.id === solve.id ? updated : item)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(updated);
  }

  /** 別アカウントの記録を新しいIDでコピーする。元のローカル・クラウド記録は変更しない。 */
  copySolveToAccount(solve: Solve, accountId: string): void {
    // アカウント所有の計測記録のみコピー可能。ゲスト所有の計測記録はassignSolveToAccountで移行する。
    if (solve.ownerType !== 'account') throw new Error('Invalid transfer source');

    // 計測記録をアカウントに移行する
    const now = new Date().toISOString();
    const updated: Solve = {
      ...solve,
      id: crypto.randomUUID(),
      updatedAt: now,
      ownerType: 'account',
      ownerId: accountId,
      pendingSync: true,
    };
    this.storedSolves.update((solves) => [...solves, updated]);

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(updated);
  }

  /** 未紐づけ、または現在のアカウントの記録だけに編集を許可する。 */
  canManageSolve(solve: Solve): boolean {
    return (
      !solve.deletedAt &&
      (solve.ownerType === 'guest' ||
        Boolean(solve.ownerId && solve.ownerId === this.auth.user()?.uid))
    );
  }

  /** 別アカウントの記録を間接的にも変更しないグループ操作だけを許可する。 */
  canManageGroup(id: string): boolean {
    const group = this.userGroups().find((group) => group.id === id);
    return Boolean(
      group &&
      !group.deletedAt &&
      (group.ownerType === 'guest' ||
        Boolean(group.ownerId && group.ownerId === this.auth.user()?.uid)) &&
      this.activeSolves()
        .filter((solve) => solve.groupId === id)
        .every((solve) => this.canManageSolve(solve)),
    );
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
    if (solve.groupId && this.activeGroups().some(({ id }) => id === solve.groupId)) {
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

  /** @returns 保存済みの記録先ID。未設定時は既定グループID */
  private loadActiveGroupId(): string {
    const stored = localStorage.getItem('cube-reps.active-group');
    return stored || DEFAULT_GROUP.id;
  }

  /**
   * IndexedDBから保存されているデータをロードする。
   * ロード完了前にデータが登録されている場合は、IndexedDBのデータとマージする。
   */
  private async initializeStorage(): Promise<void> {
    const stored = await this.userDataRepository.load();

    // IndexedDBから取得したアカウント情報をストアへセットし、セット前にブラウザ上で作成されたアカウントがあればマージする
    this.accountStore.load(stored.accounts);

    // IndexedDBから取得した計測記録をストアへセットし、セット前にブラウザ上で作成された計測記録がればマージする
    this.storedSolves.update((current) => {
      const currentIds = new Set(current.map(({ id }) => id));
      return [...current, ...stored.solves.filter(({ id }) => !currentIds.has(id))];
    });
    // IndexedDBから取得した記録グループをストアへセットし、セット前にブラウザ上で作成された記録グループがあればマージする
    this.userGroups.update((current) => {
      const currentGroupIds = new Set(current.map(({ id }) => id));
      return [...current, ...stored.groups.filter(({ id }) => !currentGroupIds.has(id))];
    });

    // アクティブなグループとして設定されているグループが存在しなかった場合は、既定グループを選択する
    if (!this.activeGroups().some(({ id }) => id === this.activeGroupId())) {
      this.activeGroupId.set(DEFAULT_GROUP.id);
    }

    // 削除済みグループに所属する計測記録を未分類グループへ移動する
    await this.reconcileDeletedGroups();

    // データのロードが完了し、データが更新可能な状態になったことを通知する
    this.storageReady.set(true);
  }

  /**
   * SolveとGroupの削除を通常更新より優先して、古い端末からの復活を防ぐ。
   * 通常版同士では未送信の変更を保持し、同期済みの版を更新日時で比較する。
   *
   * @param local 同じIDで端末に保持している同期メタデータ
   * @param remote Firestoreから受信した同期メタデータ
   * @returns リモートをマージ候補にする場合はtrue
   */
  private remoteWins(local: SyncMetadata | undefined, remote: SyncMetadata): boolean {
    // ローカルにない場合、リモートデータが削除されていなければリモートを優先する
    if (!local) return !remote.deletedAt;
    // 削除状態が異なる場合、更新日時や未送信の変更より削除を優先する
    if (Boolean(local.deletedAt) !== Boolean(remote.deletedAt)) return !!remote.deletedAt;
    // ローカルデータがアップロード待機中の場合はローカルを優先する
    if (local.pendingSync) return false;
    // 更新日時の新しい方を優先する
    return Date.parse(remote.updatedAt) > Date.parse(local.updatedAt);
  }

  /**
   * 現在の同期メタデータが最新かどうかを判定する。
   *
   * @param current ローカルの同期メタデータ
   * @param uploaded アップロード済みの同期メタデータ
   * @returns 最新であれば`true`
   */
  private isLatestSyncData(current: SyncMetadata, uploaded: SyncMetadata): boolean {
    return !!(
      current?.pendingSync &&
      current.ownerId === uploaded.ownerId &&
      current.updatedAt === uploaded.updatedAt
    );
  }

  /** 取得順によらず削除済みグループを履歴の記録先として復活させない。 */
  private async reconcileDeletedGroups(): Promise<void> {
    // 削除済みのグループのIDを取得
    const deletedGroupIds = new Set(
      this.userGroups()
        .filter((group) => group.deletedAt)
        .map((group) => group.id),
    );

    // 削除されたグループに所属する計測記録を、未分類グループへ移動する
    const changedSolves = this.storedSolves()
      .filter((solve) => solve.groupId && deletedGroupIds.has(solve.groupId))
      .map((solve) => ({ ...solve, groupId: DEFAULT_GROUP.id }));

    // ストアの計測記録を更新する
    const solvesById = new Map(changedSolves.map((solve) => [solve.id, solve]));
    this.storedSolves.update((solves) => solves.map((solve) => solvesById.get(solve.id) ?? solve));

    // グループを移動した計測記録をIndexedDBへ保存する
    await Promise.all(changedSolves.map((solve) => this.userDataRepository.putSolve(solve)));

    // 削除されたグループがアクティブだった場合、規定グループをアクチブにする
    if (deletedGroupIds.has(this.activeGroupId())) this.activeGroupId.set(DEFAULT_GROUP.id);
  }
}
