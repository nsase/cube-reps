import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CubeService } from '../../../core/cube';

/** 現在の記録グループの集計値と履歴への導線を表示するコンポーネント。 */
@Component({
  selector: 'app-timer-stats',
  templateUrl: './timer-stats.html',
  styleUrl: './timer-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerStats {
  /** 履歴画面への遷移要求を通知する。 */
  readonly showHistory = output<void>();
  /** 現在の記録グループの集計値を提供するサービス。 */
  protected readonly cube = inject(CubeService);
}
