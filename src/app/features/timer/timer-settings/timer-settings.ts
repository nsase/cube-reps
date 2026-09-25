import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslocoPipe } from '@jsverse/transloco';
import { AlgorithmLibraryService } from '../../../core/algorithm/algorithm-library';
import { CubeService } from '../../../core/cube/cube';
import { TimerStore } from '../timer.store';

/** 記録先、計測モード、F2L・OLL・PLL練習ケースを選択するコンポーネント。 */
@Component({
  selector: 'app-timer-settings',
  imports: [FormsModule, MatButtonToggleModule, TranslocoPipe],
  templateUrl: './timer-settings.html',
  styleUrl: './timer-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerSettings {
  /** F2Lで選択できる対象位置を表示順に保持する。 */
  protected readonly slots = ['FR', 'FL', 'BL', 'BR'] as const;
  /** 記録グループを管理するサービス。 */
  protected readonly cube = inject(CubeService);
  /** F2L・OLL・PLL練習で表示する代表手順を提供するサービス。 */
  protected readonly algorithmLibrary = inject(AlgorithmLibraryService);
  /** Timerコンポーネントツリー内で共有する計測状態。 */
  protected readonly store = inject(TimerStore);
}
