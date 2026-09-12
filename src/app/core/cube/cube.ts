import { GroupService } from './group.service';
import { SolveService } from './solve.service';
import { DEFAULT_GROUP, DEFAULT_GROUPS } from './default-groups';
import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { AccountStore } from '../account.store';
import { AuthService } from '../auth/auth.service';
import { average, mean } from './cube-statistics';
import { DisplayRecordGroup, Penalty, RecordGroup, Solve, SolveCategory } from './cube.models';
import {
  USER_DATA_SCHEMA_VERSION,
  UserDataRepository,
} from '../local-storage/user-data-repository';

/** 計測記録とグループの状態、派生値、初期復元を管理するストア。 */
@Injectable({ providedIn: 'root' })
export class CubeService {
  /** グループ操作を担当するサービス。 */
  private readonly groups = inject(GroupService);
  /** 計測記録操作を担当するサービス。 */
  private readonly solves = inject(SolveService);

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
   * クラウドから受信したグループを端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   */
  async mergeGroups(remoteGroups: readonly RecordGroup[]): Promise<void> {
    return this.groups.mergeGroups(this, remoteGroups);
  }

  /**
   * この端末からクラウドへのグループ送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param group クラウドへの送信が成功したグループの版
   */
  async groupSyncFinished(group: RecordGroup): Promise<void> {
    return this.groups.groupSyncFinished(this, group);
  }

  /** 選択した未紐づけ記録グループを現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignGroupToAccount(group: RecordGroup, accountId: string): void {
    return this.groups.assignGroupToAccount(this, group, accountId);
  }

  /**
   * 記録グループを作成して記録先に設定する。
   *
   * @param name 作成するグループ名
   * @returns 作成したグループ。空白名の場合は`undefined`
   */
  addGroup(name: string): RecordGroup | undefined {
    return this.groups.addGroup(this, name);
  }

  /**
   * ユーザー作成グループの名前を変更する。既定グループは変更しない。
   *
   * @param id 名前を変更するグループID
   * @param name 新しいグループ名
   * @returns 名前を変更できた場合は`true`
   */
  renameGroup(id: string, name: string): boolean {
    return this.groups.renameGroup(this, id, name);
  }

  /**
   * 指定したユーザー作成グループを削除し、所属する記録を未分類へ移動する。既定グループは削除しない。
   * グループ整理で計測記録を失わず、削除後も履歴と集計から参照できる状態を守る。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(id: string): void {
    return this.groups.removeGroup(this, id);
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
   * クラウドから受信した計測記録を端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   */
  async mergeSolves(remoteSolves: readonly Solve[]): Promise<void> {
    return this.solves.mergeSolves(this, remoteSolves);
  }

  /**
   * この端末からクラウドへの送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param solve クラウドへの送信が成功した計測記録の版
   */
  async solveSyncFinished(solve: Solve): Promise<void> {
    return this.solves.solveSyncFinished(this, solve);
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
    return this.solves.addSolve(this, time, scramble, category, caseName);
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(id: string, penalty: Exclude<Penalty, 'none'>): void {
    return this.solves.togglePenalty(this, id, penalty);
  }

  /**
   * 指定した計測記録を削除する。
   * 削除した計測記録は、クラウド同期が完了するまでtombstoneとして保持される。
   *
   * @param id 削除する計測記録ID
   */
  removeSolve(id: string): void {
    return this.solves.removeSolve(this, id);
  }

  /** 選択した未紐づけ記録を現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignSolveToAccount(solve: Solve, accountId: string): void {
    return this.solves.assignSolveToAccount(this, solve, accountId);
  }

  /** 別アカウントの記録を新しいIDでコピーする。元のローカル・クラウド記録は変更しない。 */
  copySolveToAccount(solve: Solve, accountId: string): void {
    return this.solves.copySolveToAccount(this, solve, accountId);
  }

  /** 未紐づけ、または現在のアカウントの記録だけに編集を許可する。 */
  canManageSolve(solve: Solve): boolean {
    return this.solves.canManageSolve(solve);
  }

  /** 別アカウントの記録を間接的にも変更しないグループ操作だけを許可する。 */
  canManageGroup(id: string): boolean {
    return this.groups.canManageGroup(this, id);
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
    return this.solves.finalTime(solve);
  }

  /**
   * 集計用にDNFを最悪値へ変換したタイムを返す。
   *
   * @param solve 対象の計測記録
   * @returns +2反映後のタイム。DNFの場合は`Infinity`
   */
  statTime(solve: Solve): number {
    return this.solves.statTime(solve);
  }

  /**
   * ミリ秒をタイマー表示用文字列へ整形する。
   *
   * @param milliseconds 整形する時間
   * @returns `m:ss.cc`または`s.cc`形式。有限値でない場合は`—`
   */
  formatTime(milliseconds: number): string {
    return this.solves.formatTime(milliseconds);
  }

  /**
   * ペナルティを含む記録の表示文字列を返す。
   *
   * @param solve 表示する計測記録
   * @returns DNFまたは整形済みタイム
   */
  displayTime(solve: Solve): string {
    return this.solves.displayTime(solve);
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

    // 旧版が保持した送信済みtombstoneを除去し、未送信の削除だけを再送用に残す。
    const deletedSolves = this.storedSolves().filter(
      (solve) => solve.deletedAt && !solve.pendingSync,
    );
    const deletedGroups = this.userGroups().filter(
      (group) => group.deletedAt && !group.pendingSync,
    );
    this.storedSolves.update((solves) =>
      solves.filter((solve) => !solve.deletedAt || solve.pendingSync),
    );
    this.userGroups.update((groups) =>
      groups.filter((group) => !group.deletedAt || group.pendingSync),
    );
    await Promise.all([
      ...deletedSolves.map((solve) => this.userDataRepository.deleteSolve(solve.id)),
      ...deletedGroups.map((group) => this.userDataRepository.deleteRecordGroup(group.id)),
    ]);

    // データのロードが完了し、データが更新可能な状態になったことを通知する
    this.storageReady.set(true);
  }

  /** GroupとSolveの取得成功後、現在のアカウントの存在しない所属先を整理する。
   * 同一アカウントで複数端末から同時に追加・削除する操作は保証対象外とする。
   * @param ownerId 今回の一覧取得が完了したアカウント
   */
  async reconcileMissingGroups(ownerId: string): Promise<void> {
    return this.groups.reconcileMissingGroups(this, ownerId);
  }

  /** 削除を確認できたグループの所属を整理する。起動時には未取得を削除と判断しない。
   * @param deletedGroup 削除状態を確認するグループ台帳
   */
  private async reconcileDeletedGroups(
    deletedGroup: readonly RecordGroup[] = this.userGroups(),
  ): Promise<void> {
    return this.groups.reconcileDeletedGroups(this, deletedGroup);
  }
}
