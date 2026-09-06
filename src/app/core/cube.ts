import { Injectable, Signal, computed, effect, inject, signal, untracked } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { AuthService } from './auth/auth.service';
import { average, mean } from './cube-statistics';
import {
  DisplayRecordGroup,
  LocalAccount,
  Penalty,
  RecordGroup,
  Solve,
  SolveCategory,
} from './cube.models';
import { USER_DATA_SCHEMA_VERSION, UserDataRepository } from './user-data-repository';

export interface DocumentMutation<D> {
  /** 通常更新またはtombstone削除。 */
  readonly kind: 'put' | 'delete';
  /** 保存するデータ */
  readonly data: D;
}

/** Firestoreへ転送するローカルSolve操作。 */
export type SolveMutation = DocumentMutation<Solve>;

/** 同期サービスへ引き渡すグループの変更。 */
export type GroupMutation = DocumentMutation<RecordGroup>;

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
  /** 新規Solveの所有者と表示対象アカウントを決める認証状態。 */
  private readonly auth = inject(AuthService);
  /** IndexedDB初期化後の変更だけを保存するフラグ。 */
  private readonly storageReady = signal(false);
  /** アプリ定義グループIDに対応する、ロード完了後の翻訳済み表示名。 */
  private readonly defaultGroupNames = new Map<string, Signal<string>>(
    DEFAULT_GROUPS.flatMap((group) =>
      'nameKey' in group ? [[group.id, translateSignal(group.nameKey)] as const] : [],
    ),
  );
  /** tombstoneを含む、ブラウザ内の全所有者のSolve。 */
  readonly storedSolves = signal<readonly Solve[]>([]);
  /** 同期サービスが一度ずつ処理するローカルSolve操作キュー。 */
  readonly solveMutations = signal<readonly SolveMutation[]>([]);
  /** 保存済みグループ変更の同期キュー。 */
  readonly groupMutations = signal<readonly GroupMutation[]>([]);
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
  /** 認証状態に関係なく公開する、新しい順のブラウザ内履歴。 */
  readonly solves = computed(() =>
    this.storedSolves()
      .filter((solve) => !solve.deletedAt)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
  );
  /** UIDで参照する、このブラウザのアカウント表示台帳。 */
  readonly accounts = signal<readonly LocalAccount[]>([]);
  /** 永続化中の移行対象を編集から保護するID集合。 */
  private readonly transferringIds = signal<ReadonlySet<string>>(new Set());
  /** アカウント表示情報だけを保存し、認証方式の差を台帳へ閉じ込める。 */
  private readonly rememberAccount = effect(() => {
    const user = this.auth.user();
    if (!user) return;
    const { uid, displayName, email, photoURL, providerIds } = user;
    const account = { uid, displayName, email, photoURL, providerIds };
    untracked(() => {
      this.accounts.update((accounts) => [...accounts.filter((item) => item.uid !== uid), account]);
      void this.userDataRepository.putAccount(account);
    });
  });
  /** 旧データ移行とIndexedDBからの復元が完了したときに解決するPromise。 */
  readonly ready = this.initializeStorage();
  /** 作成順に保持し、IndexedDBへ保存するユーザー作成グループ。 */
  private readonly userGroups = signal<RecordGroup[]>([]);
  /** 別端末から取得した、台帳にないグループの表示名。 */
  private readonly savedGroupLabel = translateSignal('ownership.savedGroup');
  /** 台帳のない記録先も選べるようにし、別端末の記録が一覧から消えないようにする。 */
  readonly groups = computed<DisplayRecordGroup[]>(() => {
    const groups: DisplayRecordGroup[] = [
      ...DEFAULT_GROUPS,
      ...this.userGroups().filter((group) => !group.deletedAt),
    ];
    const known = new Set([...groups, ...this.userGroups()].map((group) => group.id));
    for (const solve of this.solves()) {
      if (!solve.groupId || known.has(solve.groupId)) continue;
      known.add(solve.groupId);
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
        (solve.groupId || DEFAULT_GROUP.id) === this.activeGroupId() &&
        solve.category === this.activeSolveCategory(),
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
      ownerType: this.auth.user() ? 'account' : 'guest',
      ...(this.auth.user() ? { ownerId: this.auth.user()!.uid, pendingSync: true } : {}),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    this.userGroups.update((groups) => [...groups, group]);
    this.activeGroupId.set(group.id);
    if (this.storageReady()) void this.userDataRepository.putRecordGroup(group);
    this.queueGroup(group);
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
    // デフォルトグループだった場合は名前を変更しない
    const trimmedName = name.trim();
    if (!trimmedName || DEFAULT_GROUPS.some((group) => group.id === id)) return false;

    // ほかアカウントのデータが混ざっている場合は変更しない(Guestデータは変更可能)
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

    // IndexDBのGroupを更新
    if (this.storageReady()) void this.userDataRepository.putRecordGroup(updated);

    // アカウントデータの場合は、DBと同期する
    this.queueGroup(updated);
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
    if (!this.canManageGroup(id)) return;
    const updatedAt = new Date().toISOString();
    const affectedSolves = this.solves()
      .filter((solve) => solve.groupId === id)
      .map((solve) => ({
        ...solve,
        groupId: DEFAULT_GROUP.id,
        updatedAt,
        pendingSync: solve.ownerType === 'account',
      }));
    const affectedById = new Map(affectedSolves.map((solve) => [solve.id, solve]));
    this.storedSolves.update((solves) =>
      solves.map((solve) => affectedById.get(solve.id) ?? solve),
    );
    const group = this.userGroups().find((group) => group.id === id)!;
    const deleted = {
      ...group,
      updatedAt,
      deletedAt: updatedAt,
      pendingSync: group.ownerType === 'account',
    };
    this.userGroups.update((groups) => groups.map((item) => (item.id === id ? deleted : item)));
    this.queueGroup(deleted);
    if (this.storageReady()) {
      for (const solve of affectedSolves) {
        void this.userDataRepository.putSolve(solve);
        if (solve.ownerType === 'account')
          this.solveMutations.update((items) => [...items, { kind: 'put', data: solve }]);
      }
      void this.userDataRepository.putRecordGroup(deleted);
    }
    if (this.activeGroupId() === id) this.activeGroupId.set(DEFAULT_GROUP.id);
  }

  /** アカウント所有の変更だけを転送する。 */
  private queueGroup(group: RecordGroup): void {
    if (group.ownerType === 'account')
      this.groupMutations.update((items) => [
        ...items,
        { kind: group.deletedAt ? 'delete' : 'put', data: group },
      ]);
  }

  /** 最新版の転送確認だけで永続再送フラグを解除する。 */
  async acknowledgeGroupSync(uploaded: RecordGroup): Promise<void> {
    const current = this.userGroups().find((group) => group.id === uploaded.id);
    if (
      !current?.pendingSync ||
      current.ownerId !== uploaded.ownerId ||
      current.updatedAt !== uploaded.updatedAt
    )
      return;
    const { pendingSync: _pending, ...saved } = current;
    this.userGroups.update((groups) =>
      groups.map((group) => (group.id === saved.id ? saved : group)),
    );
    await this.userDataRepository.putRecordGroup(saved);
  }

  /** グループ名と削除通知を統合し、削除済みグループの記録を未分類へ移す。 */
  async mergeAccountGroups(accountId: string, remoteGroups: readonly RecordGroup[]): Promise<void> {
    for (const remote of remoteGroups) {
      if (remote.ownerType !== 'account' || remote.ownerId !== accountId) continue;
      const local = this.userGroups().find((group) => group.id === remote.id);
      if (
        local &&
        (local.ownerType !== remote.ownerType ||
          local.ownerId !== accountId ||
          (local.deletedAt && !remote.deletedAt) ||
          (!(remote.deletedAt && !local.deletedAt) &&
            (local.pendingSync || remote.updatedAt <= local.updatedAt)))
      )
        continue;
      const merged = {
        ...remote,
        ...(local?.copiedFromId ? { copiedFromId: local.copiedFromId } : {}),
      };
      this.userGroups.update((groups) => [
        ...groups.filter((group) => group.id !== remote.id),
        merged,
      ]);
      await this.userDataRepository.putRecordGroup(merged);
    }
    await this.reconcileDeletedGroups();
  }

  /** 取得順によらず削除済みグループを履歴の記録先として復活させない。 */
  private async reconcileDeletedGroups(): Promise<void> {
    const deleted = new Set(
      this.userGroups()
        .filter((group) => group.deletedAt)
        .map((group) => group.id),
    );
    const changed = this.storedSolves()
      .filter((solve) => solve.groupId && deleted.has(solve.groupId))
      .map((solve) => ({ ...solve, groupId: DEFAULT_GROUP.id }));
    const byId = new Map(changed.map((solve) => [solve.id, solve]));
    this.storedSolves.update((solves) => solves.map((solve) => byId.get(solve.id) ?? solve));
    await Promise.all(changed.map((solve) => this.userDataRepository.putSolve(solve)));
    if (deleted.has(this.activeGroupId())) this.activeGroupId.set(DEFAULT_GROUP.id);
  }

  /** 取り込み先のグループを再利用または作成し、元の所有者の分類を維持する。 */
  private accountGroupId(groupId: string | undefined, accountId: string, persist = true): string {
    const source = this.userGroups().find((group) => group.id === groupId && !group.deletedAt);
    if (!source) return groupId ?? DEFAULT_GROUP.id;
    if (source.ownerType === 'account' && source.ownerId === accountId) return source.id;
    const existing = this.userGroups().find(
      (group) =>
        group.copiedFromId === source.id && group.ownerId === accountId && !group.deletedAt,
    );
    if (existing) return existing.id;
    const group: RecordGroup = {
      ...source,
      id: crypto.randomUUID(),
      copiedFromId: source.id,
      ownerType: 'account',
      ownerId: accountId,
      pendingSync: true,
      updatedAt: new Date().toISOString(),
    };
    this.userGroups.update((groups) => [...groups, group]);
    if (persist) {
      void this.userDataRepository.putRecordGroup(group);
      this.queueGroup(group);
    }
    return group.id;
  }

  /** 旧版で既にアカウントへ移行した記録にも、同期可能なグループを関連付ける。 */
  async prepareAccountGroups(accountId: string): Promise<void> {
    if (this.auth.user()?.uid !== accountId) return;
    for (const solve of this.accountSolves()) {
      const source = this.userGroups().find(
        (group) => group.id === solve.groupId && !group.deletedAt,
      );
      if (!source || (source.ownerType === 'account' && source.ownerId === accountId)) continue;
      const groupId = this.accountGroupId(source.id, accountId, false);
      const group = this.userGroups().find((group) => group.id === groupId)!;
      await this.userDataRepository.putRecordGroup(group);
      this.queueGroup(group);
      if (this.auth.user()?.uid !== accountId) return;
      const current = this.solves().find((item) => item.id === solve.id);
      if (!current || current.groupId !== source.id) continue;
      const updated = {
        ...current,
        groupId,
        updatedAt: new Date().toISOString(),
        pendingSync: true,
      };
      await this.userDataRepository.putSolve(updated);
      this.storedSolves.update((solves) =>
        solves.map((item) => (item.id === updated.id ? updated : item)),
      );
      this.solveMutations.update((items) => [...items, { kind: 'put', data: updated }]);
    }
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
      groupId: accountId
        ? this.accountGroupId(this.activeGroupId(), accountId)
        : this.activeGroupId(),
      penalty: 'none',
      ...(accountId ? { pendingSync: true } : {}),
    };
    this.activeGroupId.set(solve.groupId ?? DEFAULT_GROUP.id);
    this.storedSolves.update((solves) => [solve, ...solves]);
    if (this.storageReady()) void this.userDataRepository.putSolve(solve);
    if (accountId) {
      this.solveMutations.update((mutations) => [...mutations, { kind: 'put', data: solve }]);
    }
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
    if (!current || !this.canEditSolve(current)) return;
    const updated: Solve = {
      ...current,
      pendingSync: current.ownerType === 'account',
      penalty: current.penalty === penalty ? 'none' : penalty,
      updatedAt: new Date().toISOString(),
    };
    this.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === id ? updated : solve)),
    );
    if (this.storageReady()) void this.userDataRepository.putSolve(updated);
    if (updated.ownerType === 'account' && updated.ownerId === this.auth.user()?.uid) {
      this.solveMutations.update((mutations) => [...mutations, { kind: 'put', data: updated }]);
    }
  }

  /** 転送した版が今も最新の場合だけ再送フラグを解除する。 */
  async acknowledgeSync(uploaded: Solve): Promise<void> {
    const current = this.storedSolves().find((solve) => solve.id === uploaded.id);
    if (
      !current?.pendingSync ||
      current.ownerId !== uploaded.ownerId ||
      current.updatedAt !== uploaded.updatedAt
    )
      return;
    const { pendingSync: _pending, ...saved } = current;
    this.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === saved.id ? saved : solve)),
    );
    await this.userDataRepository.putSolve(saved);
  }

  /** 未紐づけ、または現在のアカウントの記録だけに編集を許可する。 */
  canEditSolve(solve: Solve): boolean {
    return (
      !solve.deletedAt &&
      !this.transferringIds().has(solve.id) &&
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
      this.solves()
        .filter((solve) => solve.groupId === id)
        .every((solve) => this.canEditSolve(solve)),
    );
  }

  /** 指定一覧で、同じ内容の未紐づけ記録がまだ存在するか確認する。 */
  isCurrentGuestSolveIn(solves: readonly Solve[], migratedSolve: Solve): boolean {
    return solves.some(
      (current) =>
        current.id === migratedSolve.id &&
        current.ownerType === 'guest' &&
        !current.deletedAt &&
        current.updatedAt === migratedSolve.updatedAt,
    );
  }

  /** 移行確認後に元記録が変更されていないか確認する。 */
  isCurrentGuestSolve(solve: Solve): boolean {
    return this.isCurrentGuestSolveIn(this.solves(), solve);
  }

  /** 選択した未紐づけ記録を現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  async assignSolveToAccount(solve: Solve, accountId: string): Promise<void> {
    if (!this.isCurrentGuestSolve(solve)) throw new Error('Solve changed during migration');
    await this.transferSolve(solve, accountId, false);
  }

  /** 別アカウントの記録を新しいIDでコピーする。元のローカル・クラウド記録は変更しない。 */
  async copySolveToAccount(solve: Solve, accountId: string): Promise<void> {
    if (solve.ownerType !== 'account' || solve.ownerId === accountId)
      throw new Error('Invalid copy source');
    await this.transferSolve(solve, accountId, true);
  }

  /** 確認したアカウントと記録を再検証し、移行中の編集による上書きを防ぐ。 */
  private async transferSolve(solve: Solve, accountId: string, copy: boolean): Promise<void> {
    await this.ready;
    const current = this.solves().find((item) => item.id === solve.id);
    if (
      this.auth.user()?.uid !== accountId ||
      !current ||
      this.transferringIds().has(solve.id) ||
      current.updatedAt !== solve.updatedAt ||
      current.ownerType !== solve.ownerType ||
      current.ownerId !== solve.ownerId
    ) {
      throw new Error('Transfer source or account changed');
    }
    this.transferringIds.update((ids) => new Set([...ids, solve.id]));
    try {
      const owned: Solve = {
        ...current,
        id: copy ? crypto.randomUUID() : current.id,
        ...(copy ? { copiedFromId: current.id } : {}),
        groupId: this.accountGroupId(current.groupId, accountId, false),
        ownerType: 'account',
        ownerId: accountId,
        pendingSync: true,
        updatedAt: new Date().toISOString(),
        schemaVersion: USER_DATA_SCHEMA_VERSION,
      };
      const group = this.userGroups().find((group) => group.id === owned.groupId);
      if (group?.pendingSync) {
        await this.userDataRepository.putRecordGroup(group);
        if (!this.groupMutations().some((item) => item.data.id === group.id))
          this.queueGroup(group);
      }
      if (this.auth.user()?.uid !== accountId) throw new Error('Transfer account changed');
      await this.userDataRepository.putSolve(owned);
      this.storedSolves.update((solves) =>
        copy ? [owned, ...solves] : solves.map((item) => (item.id === owned.id ? owned : item)),
      );
      this.solveMutations.update((items) => [...items, { kind: 'put', data: owned }]);
    } finally {
      this.transferringIds.update((ids) => new Set([...ids].filter((id) => id !== solve.id)));
    }
  }

  /** @param id 削除する計測記録ID */
  removeSolve(id: string): void {
    const current = this.solves().find((solve) => solve.id === id);
    if (!current || !this.canEditSolve(current)) return;
    if (current.ownerType === 'account' && current.ownerId === this.auth.user()?.uid) {
      const deletedAt = new Date().toISOString();
      const tombstone = { ...current, pendingSync: true, updatedAt: deletedAt, deletedAt };
      this.storedSolves.update((solves) =>
        solves.map((solve) => (solve.id === id ? tombstone : solve)),
      );
      if (this.storageReady()) void this.userDataRepository.putSolve(tombstone);
      this.solveMutations.update((mutations) => [
        ...mutations,
        { kind: 'delete', data: tombstone },
      ]);
    } else if (this.storageReady()) {
      this.storedSolves.update((solves) => solves.filter((solve) => solve.id !== id));
      void this.userDataRepository.deleteSolve(id);
    } else {
      this.storedSolves.update((solves) => solves.filter((solve) => solve.id !== id));
    }
  }

  /**
   * Firestoreのアカウントスナップショットをローカルキャッシュへ冪等に反映する。
   * tombstoneは通常更新より常に優先し、削除済みSolveを再表示しない。
   *
   * @param accountId 購読中のFirebase UID
   * @param remoteSolves Firestoreから受信した全Solve
   */
  async mergeAccountSolves(accountId: string, remoteSolves: readonly Solve[]): Promise<void> {
    const currentSolves = this.storedSolves();
    const mergedById = new Map(currentSolves.map((solve) => [solve.id, solve]));
    const changedSolves: Solve[] = [];
    for (const remote of remoteSolves) {
      if (remote.ownerType !== 'account' || remote.ownerId !== accountId) continue;
      const local = mergedById.get(remote.id);
      if (!this.remoteSolveWins(local, remote)) continue;
      const merged = local?.copiedFromId ? { ...remote, copiedFromId: local.copiedFromId } : remote;
      mergedById.set(remote.id, merged);
      changedSolves.push(merged);
    }
    if (changedSolves.length === 0) return;

    const currentIds = new Set(currentSolves.map(({ id }) => id));
    this.storedSolves.set(
      [
        ...currentSolves.map((solve) => mergedById.get(solve.id) as Solve),
        ...changedSolves.filter(({ id }) => !currentIds.has(id)),
      ].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
    await Promise.all(changedSolves.map((solve) => this.userDataRepository.putSolve(solve)));
    await this.reconcileDeletedGroups();
  }

  /**
   * ローカルの削除を古い通常更新から守りつつ、リモートを採用すべきか判定する。
   * tombstone同士は更新日時で比較し、同一削除を通知のたびに再適用しない。
   *
   * @param local 同じIDで端末に保存されているSolve
   * @param remote Firestoreから受信したSolve
   * @returns リモートをマージ候補にする場合はtrue
   */
  private remoteSolveWins(local: Solve | undefined, remote: Solve): boolean {
    if (!local) return !remote.deletedAt;
    if (local.ownerType !== remote.ownerType || local.ownerId !== remote.ownerId) return false;
    if (local.deletedAt && !remote.deletedAt) return false;
    if (remote.deletedAt && !local.deletedAt) return true;
    if (local.pendingSync) return false;
    return Date.parse(remote.updatedAt) > Date.parse(local.updatedAt);
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
    this.accounts.update((current) => [
      ...stored.accounts.filter((account) => !current.some((item) => item.uid === account.uid)),
      ...current,
    ]);
    const current = this.storedSolves();
    const currentIds = new Set(current.map(({ id }) => id));
    this.storedSolves.set([...current, ...stored.solves.filter(({ id }) => !currentIds.has(id))]);
    const currentGroups = this.userGroups();
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
    this.solveMutations.update((items) => [
      ...items,
      ...this.storedSolves()
        .filter((solve) => solve.ownerType === 'account' && solve.pendingSync)
        .map((solve) => ({
          kind: solve.deletedAt ? ('delete' as const) : ('put' as const),
          data: solve,
        })),
    ]);
    for (const group of this.userGroups().filter((group) => group.pendingSync))
      this.queueGroup(group);
    await this.reconcileDeletedGroups();
    this.storageReady.set(true);
  }

  /** @returns 保存済みの記録先ID。未設定時は既定グループID */
  private loadActiveGroupId(): string {
    const stored = localStorage.getItem('cube-reps.active-group');
    return stored || DEFAULT_GROUP.id;
  }
}
