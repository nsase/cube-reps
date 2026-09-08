import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { Solve } from '../cube.models';

/** 履歴で確認された記録だけを移行・コピーし、アカウント変更後の追加処理を止める。 */
@Injectable({ providedIn: 'root' })
export class SolveMigrationService {
  /** 現在の認証状態。 */
  private readonly auth = inject(AuthService);
  /** 記録の永続化と同期キューを管理するサービス。 */
  private readonly cube = inject(CubeService);
  /** 同時の選択操作による重複コピーを防ぐ実行状態。 */
  readonly pending = signal(false);

  /** 確認時点の記録と宛先を固定して移行またはコピーする。 */
  transfer(solves: readonly Solve[], accountId: string, action: 'copy' | 'move'): void {
    if (this.pending() || this.auth.user()?.uid !== accountId) return;

    this.pending.set(true);
    try {
      for (const solve of solves) {
        if (this.auth.user()?.uid !== accountId) break;

        if (action === 'copy') this.cube.copySolveToAccount(solve, accountId);
        else this.cube.assignSolveToAccount(solve, accountId);
      }
    } finally {
      this.pending.set(false);
    }
  }
}
