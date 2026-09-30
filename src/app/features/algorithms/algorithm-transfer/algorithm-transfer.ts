import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { AlgorithmKind, AlgorithmLibraryService } from '../../../core/algorithm/algorithm-library';
import { AuthService } from '../../../core/auth/auth.service';
import { AlgorithmSyncService } from '../../../core/firestore/algorithm-sync.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

/** 表示中の種類のゲスト設定を、確認後に現在のアカウントへ移行する。 */
@Component({
  selector: 'app-algorithm-transfer',
  imports: [MatButtonModule, TranslocoPipe],
  templateUrl: './algorithm-transfer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmTransfer {
  /** 移行対象の種類。 */
  readonly kind = input.required<AlgorithmKind>();
  /** ゲスト設定の参照と統合操作。 */
  private readonly library = inject(AlgorithmLibraryService);
  /** 移行先の認証状態。 */
  protected readonly auth = inject(AuthService);
  /** 確認時点のクラウド設定を取得する境界。 */
  private readonly sync = inject(AlgorithmSyncService);
  /** 共通確認ダイアログ。 */
  private readonly dialog = inject(MatDialog);
  /** 操作時点の翻訳。 */
  private readonly i18n = inject(TranslocoService);
  /** 確認中の画面離脱を検出する。 */
  private readonly destroyRef = inject(DestroyRef);
  /** 未移行の設定があるケース数。 */
  protected readonly count = computed(() => this.library.guestPreferences(this.kind()).length);
  /** 確認・取得・移行の多重実行を防ぐ。 */
  protected readonly pending = signal(false);
  /** 失敗時に元データが残っていることを伝える。 */
  protected readonly failed = signal(false);

  /** 取得成功と確認時点のアカウントを確認してからゲスト設定を統合する。 */
  protected async transfer(): Promise<void> {
    const user = this.auth.user();
    const kind = this.kind();
    if (!user || this.pending() || !this.count()) return;
    this.pending.set(true);
    this.failed.set(false);
    try {
      const result = await firstValueFrom(
        this.dialog
          .open(ConfirmDialog, {
            data: {
              title: this.i18n.translate('algorithms.transfer.title'),
              message: this.i18n.translate('algorithms.transfer.confirm', {
                kind,
                count: this.count(),
                account: user.email ?? user.displayName ?? user.uid,
              }),
              buttons: [
                { id: 'cancel', labelKey: 'common.cancel' },
                { id: 'move', labelKey: 'algorithms.transfer.title' },
              ],
              defaultFocus: 'cancel',
            },
          })
          .afterClosed(),
      );
      if (
        result !== 'move' ||
        this.destroyRef.destroyed ||
        this.kind() !== kind ||
        this.auth.user()?.uid !== user.uid
      )
        return;
      if (!(await this.sync.refresh(kind))) {
        this.failed.set(true);
        return;
      }
      if (this.destroyRef.destroyed || this.kind() !== kind || this.auth.user()?.uid !== user.uid)
        return;
      await this.library.importGuests(kind, user.uid);
    } catch {
      this.failed.set(true);
    } finally {
      this.pending.set(false);
    }
  }
}
