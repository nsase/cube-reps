import { AuthService } from '../auth/auth.service';
import { Injectable, inject, signal } from '@angular/core';
import { AlgorithmCase, AlgorithmPreference, CaseAlgorithm } from '../cube/cube.models';
import {
  algorithmStorageKey,
  USER_DATA_SCHEMA_VERSION,
  UserDataRepository,
} from '../local-storage/user-data-repository';
export type { CaseAlgorithm } from '../cube/cube.models';

/** 同期の取得範囲を分けるアルゴリズムの種類。 */
export type AlgorithmKind = AlgorithmCase['kind'];

/** 保存データを変更せず、一覧へ手順の所有者を添える表示用モデル。 */
export interface DisplayedAlgorithm extends CaseAlgorithm {
  /** 組み込み手順には所有者を付けず、ユーザー手順には保存元を保持する。 */
  owner?: AlgorithmPreference;
}

/** 所有者とケースキーごとのユーザー設定。 */
type AlgorithmPreferences = Record<string, AlgorithmPreference>;

/** F2L・OLL・PLL手順のお気に入りとユーザー追加手順を管理するサービス。 */
@Injectable({ providedIn: 'root' })
export class AlgorithmLibraryService {
  /** ユーザー設定の永続化を画面から分離するRepository。 */
  private readonly repository = inject(UserDataRepository);
  /** 表示・編集する所有者を決定する認証状態。 */
  private readonly auth = inject(AuthService);
  /** 保存完了後に種類ごとの同期処理へ渡す更新。 */
  readonly mutations = {
    OLL: signal<readonly AlgorithmPreference[]>([]),
    PLL: signal<readonly AlgorithmPreference[]>([]),
    F2L: signal<readonly AlgorithmPreference[]>([]),
  };
  /** 所有者とケースキーごとの保存済みユーザー設定。 */
  private readonly preferences = signal<AlgorithmPreferences>({});
  /** IndexedDB初期化後の変更だけを保存するフラグ。 */
  private readonly storageReady = signal(false);
  /** IndexedDBからの復元が完了したときに解決するPromise。 */
  readonly ready = this.initializeStorage();

  /** @returns 共通の固定識別子に、F2Lでは対象スロットを加えたケース固有キー */
  caseKey<T extends AlgorithmCase>(item: T): string {
    const key = [item.caseId];
    if (item.kind === 'F2L') {
      if (!('slot' in item) || !['FL', 'FR', 'BL', 'BR'].includes(String(item.slot))) {
        throw new Error('F2L case requires a valid slot');
      }
      key.push(item.slot as string);
    }
    return key.join('-');
  }

  /** @returns 組み込み手順の後ろにユーザー手順を連結した一覧 */
  algorithmsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return [...item.algorithms, ...this.preferenceFor(item).custom];
  }

  /** ゲスト手順と現在のアカウントの手順を、所有者付きで同じ一覧へ表示する。 */
  displayedAlgorithmsFor(item: AlgorithmCase): DisplayedAlgorithm[] {
    const guest = this.preferences()[this.caseKey(item)];
    const account = this.auth.user() ? this.preferenceFor(item) : undefined;
    return [
      ...item.algorithms,
      ...[guest, account].flatMap((owner) =>
        owner ? owner.custom.map((algorithm) => ({ ...algorithm, owner })) : [],
      ),
    ];
  }

  /** お気に入り欄にも手順の出自を表示する。組み込み手順は全員共通として扱う。 */
  displayedFavoriteFor(item: AlgorithmCase): DisplayedAlgorithm | undefined {
    const favorite = this.favoriteFor(item);
    return favorite
      ? { ...favorite, ...(!favorite.builtIn ? { owner: this.preferenceFor(item) } : {}) }
      : undefined;
  }

  /** 手順の保存元ごとにお気に入りを判定し、ゲストとアカウントの設定を混同しない。 */
  isDisplayedFavorite(item: AlgorithmCase, algorithm: DisplayedAlgorithm): boolean {
    if (!algorithm.owner) return this.favoriteFor(item)?.id === algorithm.id;
    const owner =
      this.preferences()[algorithmStorageKey(this.caseKey(item), algorithm.owner.ownerId)];
    return owner?.favoriteId === algorithm.id;
  }

  /** 表示中の手順の所有者へお気に入りを保存する。ゲストの操作では自動移行しない。 */
  setDisplayedFavorite(item: AlgorithmCase, algorithm: DisplayedAlgorithm): void {
    if (!algorithm.owner) {
      this.setFavorite(item, algorithm.id);
      return;
    }
    const owner = this.editableOwner(item, algorithm);
    if (owner) void this.savePreference({ ...owner, favoriteId: algorithm.id });
  }

  /** 確認した手順の保存元だけから削除し、同じケースの別所有者には影響させない。 */
  removeDisplayed(item: AlgorithmCase, algorithm: DisplayedAlgorithm): void {
    const owner = this.editableOwner(item, algorithm);
    if (!owner) return;
    void this.savePreference({
      ...owner,
      custom: owner.custom.filter((entry) => entry.id !== algorithm.id),
      favoriteId: owner.favoriteId === algorithm.id ? undefined : owner.favoriteId,
    });
  }

  /** 確認中に移行・アカウント変更された手順を誤って編集しないため、現在の保存元を検証する。 */
  private editableOwner(
    item: AlgorithmCase,
    algorithm: DisplayedAlgorithm,
  ): AlgorithmPreference | undefined {
    if (algorithm.builtIn || !algorithm.owner) return undefined;
    if (
      algorithm.owner.ownerType === 'account' &&
      algorithm.owner.ownerId !== this.auth.user()?.uid
    )
      return undefined;
    const owner =
      this.preferences()[algorithmStorageKey(this.caseKey(item), algorithm.owner.ownerId)];
    return owner?.custom.some((entry) => entry.id === algorithm.id) ? owner : undefined;
  }

  /** @returns お気に入り手順。未設定または不明なIDの場合は先頭手順 */
  favoriteFor(item: AlgorithmCase): CaseAlgorithm | undefined {
    const algorithms = this.algorithmsFor(item);
    const favoriteId = this.preferenceFor(item).favoriteId;
    return algorithms.find((algorithm) => algorithm.id === favoriteId) ?? algorithms[0];
  }

  /** @returns 代表表示する手順。手順がない場合は案内文 */
  primaryNotation(item: AlgorithmCase): string {
    return this.favoriteFor(item)?.notation ?? '手順未登録';
  }

  /**
   * 存在する手順をお気に入りに設定する。
   *
   * @param item 対象ケース
   * @param id お気に入りにする手順ID
   */
  setFavorite(item: AlgorithmCase, id: string): void {
    if (!this.algorithmsFor(item).some((algorithm) => algorithm.id === id)) return;
    this.save(item, { ...this.preferenceFor(item), favoriteId: id });
  }

  /**
   * 重複していないユーザー手順を追加する。
   *
   * @param item 対象ケース
   * @param notation 追加する手順
   * @returns 追加できた場合は`true`
   */
  add(item: AlgorithmCase, notation: string): boolean {
    const value = notation.trim();
    if (!value) return false;
    if (this.algorithmsFor(item).some((algorithm) => algorithm.notation === value)) return false;
    const preference = this.preferenceFor(item);
    this.save(item, {
      ...preference,
      custom: [...preference.custom, { id: crypto.randomUUID(), notation: value, builtIn: false }],
    });
    return true;
  }

  /**
   * ユーザーが追加した手順だけを削除する。
   *
   * @param item 対象ケース
   * @param id 削除するユーザー手順ID
   */
  remove(item: AlgorithmCase, id: string): void {
    const preference = this.preferenceFor(item);
    if (!preference.custom.some((algorithm) => algorithm.id === id)) return;
    this.save(item, {
      ...preference,
      custom: preference.custom.filter((algorithm) => algorithm.id !== id),
      favoriteId: preference.favoriteId === id ? undefined : preference.favoriteId,
    });
  }

  /** @returns ケースの保存済み設定。未保存の場合は同期情報付きの空設定 */
  private preferenceFor(item: AlgorithmCase): AlgorithmPreference {
    const caseKey = this.caseKey(item);
    return (
      this.preferences()[algorithmStorageKey(caseKey, this.auth.user()?.uid)] ?? {
        caseKey,
        custom: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date(0).toISOString(),
        ownerType: this.auth.user() ? 'account' : 'guest',
        ownerId: this.auth.user()?.uid,
        schemaVersion: USER_DATA_SCHEMA_VERSION,
      }
    );
  }

  /** 指定ケースの設定を現在のアカウントへ保存する。ゲスト設定は明示的な移行まで分離する。 */
  private save(item: AlgorithmCase, preference: AlgorithmPreference): void {
    void this.savePreference({ ...preference, caseKey: this.caseKey(item) });
  }

  /** 空のアカウント設定も保存し、削除・お気に入り解除を別端末へ伝える。 */
  private savePreference(preference: AlgorithmPreference): Promise<void> {
    const previous =
      this.preferences()[algorithmStorageKey(preference.caseKey, preference.ownerId)];
    const updated: AlgorithmPreference = {
      ...preference,
      updatedAt: new Date(
        Math.max(Date.now(), Date.parse(previous?.updatedAt ?? '') + 1 || 0),
      ).toISOString(),
      pendingSync: preference.ownerType === 'account',
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    const key = algorithmStorageKey(updated.caseKey, updated.ownerId);
    this.preferences.update((preferences) => ({ ...preferences, [key]: updated }));
    return this.storageReady() ? this.persist(updated) : Promise.resolve();
  }

  /** ローカル保存に成功した版だけを送信待ちにする。空設定は削除通知として維持する。 */
  private async persist(preference: AlgorithmPreference): Promise<void> {
    if (preference.ownerType === 'guest' && !preference.custom.length && !preference.favoriteId) {
      await this.repository.deleteAlgorithmPreference(preference.caseKey);
      return;
    }
    await this.repository.putAlgorithmPreference(preference);
    if (preference.pendingSync && preference.ownerType === 'account') {
      const kind = preference.caseKey.split('-')[0] as AlgorithmKind;
      this.mutations[kind]?.update((items) => [...items, preference]);
    }
  }

  /** 対象種類の未移行ゲスト設定を取得する。 */
  guestPreferences(kind: AlgorithmKind): AlgorithmPreference[] {
    return Object.values(this.preferences()).filter(
      (entry) =>
        entry.ownerType === 'guest' &&
        entry.caseKey.startsWith(kind + '-') &&
        (entry.custom.length > 0 || !!entry.favoriteId),
    );
  }

  /** 確認済みゲスト設定を統合する。同一記法を重複させず、アカウントのお気に入りを優先する。 */
  async importGuests(kind: AlgorithmKind, userId: string): Promise<void> {
    await this.ready;
    if (this.auth.user()?.uid !== userId) return;
    for (const guest of this.guestPreferences(kind)) {
      if (this.auth.user()?.uid !== userId) return;
      const key = algorithmStorageKey(guest.caseKey, userId);
      const account = this.preferences()[key];
      const custom = [...(account?.custom ?? [])];
      const ids = new Map<string, string>();
      for (const algorithm of guest.custom) {
        const existing = custom.find((entry) => entry.notation === algorithm.notation);
        if (existing) ids.set(algorithm.id, existing.id);
        else {
          const added = {
            ...algorithm,
            id: custom.some((entry) => entry.id === algorithm.id)
              ? crypto.randomUUID()
              : algorithm.id,
          };
          custom.push(added);
          ids.set(algorithm.id, added.id);
        }
      }
      await this.savePreference({
        ...guest,
        ...account,
        caseKey: guest.caseKey,
        custom,
        favoriteId:
          account?.favoriteId ??
          (guest.favoriteId ? (ids.get(guest.favoriteId) ?? guest.favoriteId) : undefined),
        ownerType: 'account',
        ownerId: userId,
      });
      // 確認後に所有者や元設定が変わった場合は、新しいゲスト編集を除去しない。
      if (this.auth.user()?.uid !== userId || this.preferences()[guest.caseKey] !== guest) return;
      // 保存失敗時に元設定を失わないよう、統合先を永続化してからゲストを除去する。
      await this.repository.deleteAlgorithmPreference(guest.caseKey);
      this.preferences.update((entries) => {
        if (entries[guest.caseKey] !== guest) return entries;
        const remaining = { ...entries };
        delete remaining[guest.caseKey];
        return remaining;
      });
    }
  }

  /** 未送信版を優先し、それ以外は更新日時の新しい取得値へ更新する。空設定も保持して削除の復活を防ぐ。 */
  async merge(preferences: readonly AlgorithmPreference[]): Promise<void> {
    await this.ready;
    for (const remote of preferences) {
      const key = algorithmStorageKey(remote.caseKey, remote.ownerId);
      const local = this.preferences()[key];
      if (
        local?.pendingSync ||
        (local && Date.parse(local.updatedAt) > Date.parse(remote.updatedAt))
      )
        continue;
      this.preferences.update((entries) => ({ ...entries, [key]: remote }));
      await this.repository.putAlgorithmPreference(remote);
    }
  }

  /** 新しい版がある場合は古い失敗操作を再送しない。削除後の手順復活を防ぐ。 */
  needsUpload(preference: AlgorithmPreference): boolean {
    const current = this.preferences()[algorithmStorageKey(preference.caseKey, preference.ownerId)];
    return !!current?.pendingSync && current.updatedAt === preference.updatedAt;
  }

  /** 送信中に行われた新しい編集を残し、送信できた版の再送フラグだけを解除する。 */
  async acknowledge(uploaded: AlgorithmPreference): Promise<void> {
    const key = algorithmStorageKey(uploaded.caseKey, uploaded.ownerId);
    const current = this.preferences()[key];
    if (!current?.pendingSync || current.updatedAt !== uploaded.updatedAt) return;
    const saved = { ...current, pendingSync: false };
    this.preferences.update((entries) => ({ ...entries, [key]: saved }));
    await this.repository.putAlgorithmPreference(saved);
  }

  /** 保存値を復元し、初期化中の編集を保持して未送信の変更を再送する。 */
  private async initializeStorage(): Promise<void> {
    const stored = await this.repository.load();
    const current = this.preferences();
    this.preferences.set({
      ...Object.fromEntries(
        stored.algorithmPreferences.map((entry) => [
          algorithmStorageKey(entry.caseKey, entry.ownerId),
          entry,
        ]),
      ),
      ...current,
    });
    this.storageReady.set(true);
    await Promise.all(
      Object.values(this.preferences())
        .filter(
          (entry) =>
            entry.pendingSync || current[algorithmStorageKey(entry.caseKey, entry.ownerId)],
        )
        .map((entry) => this.persist(entry)),
    );
  }
}
