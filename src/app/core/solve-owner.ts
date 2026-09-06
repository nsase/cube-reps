import { computed, inject, Injectable } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { CubeService } from './cube';
import { Solve } from './cube.models';

/** 所有者の分類キーと翻訳に追従する表示名を提供する。 */
@Injectable({ providedIn: 'root' })
export class SolveOwnerService {
  /** ローカル台帳と記録の参照先。 */
  private readonly cube = inject(CubeService);
  /** 未紐づけ状態の翻訳。 */
  private readonly unlinked = translateSignal('ownership.unlinked');
  /** 台帳のないアカウントの翻訳。 */
  private readonly accountLabel = translateSignal('ownership.account');
  /** 現在ローカル記録がある所有者だけを選択肢にする。 */
  readonly options = computed(() =>
    [
      ...new Map(
        this.cube
          .solves()
          .filter((solve) => solve.ownerType === 'account' && solve.ownerId)
          .map((solve) => [solve.ownerId, solve]),
      ),
    ].map(([uid, solve]) => ({ key: this.key(solve), label: this.label(solve), uid })),
  );

  /** ゲストは共通の未紐づけ分類、アカウントはUIDで区別する。 */
  key(solve: Solve): string {
    return solve.ownerType === 'guest' ? 'unlinked' : `account:${solve.ownerId}`;
  }

  /** フィルターと読み上げに使用する所有者名を返す。 */
  label(solve: Solve): string {
    return solve.ownerType === 'guest' ? this.unlinked() : this.accountName(solve.ownerId!);
  }

  /** 表示名とメールを優先し、プロフィールがない場合はUIDで所有者を示す。 */
  accountName(uid: string): string {
    const account = this.cube.accounts().find((account) => account.uid === uid);
    if (account?.displayName && account.email) {
      return `${account.displayName} (${account.email})`;
    } else if (account?.email) {
      return account?.email;
    }
    return account?.displayName || uid;
  }

  /** 認証方式を含む、保存済みの所有者詳細を返す。 */
  details(solve: Solve): string {
    const account = this.cube.accounts().find((account) => account.uid === solve.ownerId);
    return [this.label(solve), ...(account?.providerIds ?? [])].filter(Boolean).join(' · ');
  }

  /** アバターのプロフィール画像を返す。 */
  photo(solve: Solve): string | undefined {
    return solve.ownerType === 'account'
      ? this.cube.accounts().find((account) => account.uid === solve.ownerId)?.photoURL || undefined
      : undefined;
  }

  /** 画像を提供しないプロバイダーのアバター用イニシャルを返す。 */
  initials(solve: Solve): string {
    const account = this.cube.accounts().find((account) => account.uid === solve.ownerId);
    return (account?.displayName || account?.email || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join('')
      .toLocaleUpperCase();
  }
}
