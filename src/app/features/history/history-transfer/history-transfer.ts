import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom, Subscription, timer } from 'rxjs';
import { Solve } from '../../../core/cube.models';
import { SolveMigrationService } from '../../../core/firestore/solve-migration.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { HistoryStore } from '../history.store';

/** 履歴内で選択した記録の移行・コピーを確認し、一時的な結果を表示する。 */
@Component({
  selector: 'app-history-transfer',
  imports: [MatButtonModule, TranslocoPipe],
  templateUrl: './history-transfer.html',
  styleUrl: './history-transfer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryTransfer {
  /** 履歴の選択と所有者の表示情報。 */
  protected readonly store = inject(HistoryStore);
  /** 選択済み記録の移行を行うサービス。 */
  protected readonly migration = inject(SolveMigrationService);
  /** 操作結果の翻訳パラメータ。画面を離れると破棄する。 */
  protected readonly result = signal<{ completed: number; failed: number } | null>(null);
  /** 確認ダイアログの表示中に同じ操作を重ねない状態。 */
  protected readonly confirming = signal(false);
  /** 共通確認ダイアログの表示先。 */
  private readonly dialog = inject(MatDialog);
  /** 操作時点の翻訳。 */
  private readonly i18n = inject(TranslocoService);
  /** 画面を離れた後の非同期処理で選択を変更しないための破棄状態。 */
  private readonly destroyRef = inject(DestroyRef);
  /** アカウントに紐づく記録 */
  protected readonly accountSolves = computed(() =>
    this.store.selectedSolves().filter((solve) => solve.ownerType === 'account'),
  );
  /** ゲストに紐づく記録 */
  protected readonly guestSolves = computed(() =>
    this.store.selectedSolves().filter((solve) => solve.ownerType === 'guest'),
  );
  /** 完了通知を消すタイマー。 */
  private notificationTimer?: Subscription;

  /** 選択された記録をコピーする。 */
  protected copy(): Promise<void> {
    return this.transfer(this.accountSolves(), 'copy');
  }

  /** 選択された記録を移動する。 */
  protected move(): Promise<void> {
    return this.transfer(this.guestSolves(), 'move');
  }

  /** 確認時点の記録と宛先だけを処理する。キャンセル・画面離脱・アカウント変更では開始しない。 */
  private async transfer(solves: Solve[], action: 'copy' | 'move'): Promise<void> {
    const uid = this.store.auth.user()?.uid;
    if (!uid || !solves.length || this.confirming() || this.migration.pending()) return;
    this.confirming.set(true);
    try {
      const confirmed = await firstValueFrom(
        this.dialog
          .open(ConfirmDialog, {
            data: {
              title: this.i18n.translate(`ownership.${action}`),
              message: this.i18n.translate('ownership.confirm', {
                count: solves.length,
                from: [...new Set(solves.map((solve) => this.store.owners.label(solve)))].join(
                  ', ',
                ),
                to: this.store.owners.accountName(uid),
              }),
              buttons: [
                { id: 'cancel', labelKey: 'common.cancel' },
                { id: action, labelKey: `ownership.${action}` },
              ],
              defaultFocus: 'cancel',
            },
          })
          .afterClosed(),
      );
      if (confirmed !== action || this.destroyRef.destroyed || this.store.auth.user()?.uid !== uid)
        return;
      const result = await this.migration.transfer(solves, uid, action);
      if (this.destroyRef.destroyed) return;
      this.result.set(result);
      // コピーは元記録が残るため選択を解除して、成功分の意図しない再コピーを避ける。
      this.store.selectedIds.set(new Set());
      this.notificationTimer?.unsubscribe();
      this.notificationTimer = timer(8000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.result.set(null));
    } finally {
      if (!this.destroyRef.destroyed) this.confirming.set(false);
    }
  }
}
