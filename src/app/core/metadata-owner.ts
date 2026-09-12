import { computed, inject, Injectable } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { AccountStore } from './account.store';
import { CubeService } from './cube/cube';
import { SyncMetadata } from './cube/cube.models';

/** 所有者の分類キーと翻訳に追従する表示名を提供する。 */
@Injectable({ providedIn: 'root' })
export class MetadataOwnerService {
  /** ローカル台帳と記録の参照先。 */
  private readonly cube = inject(CubeService);
  /** アカウントを管理するストア。 */
  private readonly accountStore = inject(AccountStore);
  /** 未紐づけ状態の翻訳。 */
  private readonly unlinked = translateSignal('ownership.unlinked');
  /** 現在ローカル記録がある所有者だけを選択肢にする。 */
  readonly options = computed(() =>
    [
      ...new Map(
        this.cube
          .activeSolves()
          .filter((metadata) => metadata.ownerType === 'account' && metadata.ownerId)
          .map((metadata) => [metadata.ownerId, metadata]),
      ),
    ].map(([uid, metadata]) => ({ key: this.key(metadata), label: this.label(metadata), uid })),
  );

  /** ゲストは共通の未紐づけ分類、アカウントはUIDで区別する。 */
  key(metadata: SyncMetadata): string {
    return metadata.ownerType === 'guest' ? 'unlinked' : `account:${metadata.ownerId}`;
  }

  /** フィルターと読み上げに使用する所有者名を返す。 */
  label(metadata: SyncMetadata): string {
    return metadata.ownerType === 'guest' ? this.unlinked() : this.accountName(metadata.ownerId!);
  }

  /** 表示名とメールを優先し、プロフィールがない場合はUIDで所有者を示す。 */
  accountName(uid: string): string {
    const account = this.accountStore.accounts().find((account) => account.uid === uid);
    if (account?.displayName && account.email) {
      return `${account.displayName} (${account.email})`;
    } else if (account?.email) {
      return account?.email;
    }
    return account?.displayName || uid;
  }

  /** 認証方式を含む、保存済みの所有者詳細を返す。 */
  details(metadata: SyncMetadata): string {
    const account = this.accountStore
      .accounts()
      .find((account) => account.uid === metadata.ownerId);
    return [this.label(metadata), ...(account?.providerIds ?? [])].filter(Boolean).join(' · ');
  }

  /** アバターのプロフィール画像を返す。 */
  photo(metadata: SyncMetadata): string | undefined {
    return metadata.ownerType === 'account'
      ? this.accountStore.accounts().find((account) => account.uid === metadata.ownerId)
          ?.photoURL || undefined
      : undefined;
  }

  /** 画像を提供しないプロバイダーのアバター用イニシャルを返す。 */
  initials(metadata: SyncMetadata): string {
    const account = this.accountStore
      .accounts()
      .find((account) => account.uid === metadata.ownerId);
    return (account?.displayName || account?.email || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join('')
      .toLocaleUpperCase();
  }
}
