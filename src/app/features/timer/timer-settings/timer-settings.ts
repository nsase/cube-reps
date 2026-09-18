import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoPipe } from '@jsverse/transloco';
import { AlgorithmLibraryService } from '../../../core/algorithm/algorithm-library';
import { CubeService } from '../../../core/cube/cube';
import { TimerStore } from '../timer.store';

/** 記録先、計測モード、PLL練習ケースを選択するコンポーネント。 */
@Component({
  selector: 'app-timer-settings',
  imports: [FormsModule, MatSelectModule, MatOptionModule, MatButtonModule, TranslocoPipe],
  templateUrl: './timer-settings.html',
  styleUrl: './timer-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerSettings {
  /** 記録グループを管理するサービス。 */
  protected readonly cube = inject(CubeService);
  /** PLL練習で表示する代表手順を提供するサービス。 */
  protected readonly algorithmLibrary = inject(AlgorithmLibraryService);
  /** Timerコンポーネントツリー内で共有する計測状態。 */
  protected readonly store = inject(TimerStore);
}
