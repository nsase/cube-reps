import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { Solve } from '../cube.models';

/** 明示的な選択操作の結果。完了はローカル保存を表し、クラウド同期は同期表示で確認する。 */
export interface SolveTransferResult {
  /** 保存できた記録数。 */
  completed: number;
  /** 再選択してやり直せる未処理記録数。 */
  failed: number;
}

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
  async transfer(
    solves: readonly Solve[],
    accountId: string,
    copy: boolean,
  ): Promise<SolveTransferResult> {
    if (this.pending() || this.auth.user()?.uid !== accountId)
      return { completed: 0, failed: solves.length };
    this.pending.set(true);
    let completed = 0;
    try {
      for (const solve of solves) {
        if (this.auth.user()?.uid !== accountId) break;
        try {
          if (copy) await this.cube.copySolveToAccount(solve, accountId);
          else await this.cube.assignSolveToAccount(solve, accountId);
          completed++;
        } catch {
          // 成功分は再処理せず、未処理の選択だけを利用者が再試行できるようにする。
        }
      }
      return { completed, failed: solves.length - completed };
    } finally {
      this.pending.set(false);
    }
  }
}
