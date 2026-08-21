import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CubeService } from '../../../core/cube';
import { TranslocoPipe } from '@jsverse/transloco';

/** 現在の記録グループの集計値と履歴への導線を表示するコンポーネント。 */
@Component({
  selector: 'app-timer-stats',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './timer-stats.html',
  styleUrl: './timer-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerStats {
  /** 現在の記録グループの集計値を提供するサービス。 */
  protected readonly cube = inject(CubeService);
}
