import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { CubeService } from '../../../core/cube/cube';
import { Solve } from '../../../core/cube/cube.models';
import { SolveMigrationService } from '../../../core/firestore/solve-migration.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { HistoryStore } from '../history.store';

/** 履歴の選択記録の移行・コピーとゲスト記録の一括移行を確認する。 */
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
  /** 絞り込みやページに関係なく、削除されていない全ゲスト記録を参照する。 */
  protected readonly allGuestSolves = inject(CubeService).guestSolves;
  /** 確認済み記録の移行を行うサービス。 */
  protected readonly migration = inject(SolveMigrationService);
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

  /** 選択された記録をコピーする。 */
  protected copy(): Promise<void> {
    return this.transfer(this.accountSolves(), 'copy');
  }

  /** 選択された記録を移動する。 */
  protected move(): Promise<void> {
    return this.transfer(this.guestSolves(), 'move');
  }

  /** このブラウザの全ゲスト記録を、件数と宛先の確認後に移行する。 */
  protected moveAll(): Promise<void> {
    return this.transfer(this.allGuestSolves(), 'move', true);
  }

  /** 確認時点の記録と宛先だけを処理する。キャンセル・画面離脱・アカウント変更では開始しない。 */
  private async transfer(
    solves: Solve[],
    action: 'copy' | 'move',
    allGuests = false,
  ): Promise<void> {
    const uid = this.store.auth.user()?.uid;
    if (!uid || !solves.length || this.confirming() || this.migration.pending()) return;
    this.confirming.set(true);
    try {
      const confirmed = await firstValueFrom(
        this.dialog
          .open(ConfirmDialog, {
            data: {
              title: this.i18n.translate(allGuests ? 'ownership.moveAll' : `ownership.${action}`),
              message: this.i18n.translate(
                allGuests ? 'ownership.confirmMoveAll' : 'ownership.confirm',
                {
                  count: solves.length,
                  from: [...new Set(solves.map((solve) => this.store.owners.label(solve)))].join(
                    ', ',
                  ),
                  to: this.store.owners.accountName(uid),
                },
              ),
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
      this.migration.transfer(solves, uid, action);
      // コピーは元記録が残るため選択を解除して、成功分の意図しない再コピーを避ける。
      this.store.selectedIds.set(new Set());
    } finally {
      if (!this.destroyRef.destroyed) this.confirming.set(false);
    }
  }
}
