import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CubeService } from './core/cube';
import { View } from './core/cube.models';
import { Algorithms } from './features/algorithms/algorithms';
import { History } from './features/history/history';
import { Timer } from './features/timer/timer';

/** タイマー、手順、履歴の各画面を切り替えるルートコンポーネント。 */
@Component({
  selector: 'app-root',
  imports: [Timer, Algorithms, History],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** ヘッダーと各画面で共有するキューブ状態サービス。 */
  protected readonly cube = inject(CubeService);

  /** 現在表示している画面。 */
  protected readonly view = signal<View>('timer');

  /** 画面ごとにヘッダーへ表示する見出し。 */
  protected readonly headings: Record<View, string> = {
    timer: 'PRACTICE SESSION',
    algorithms: 'ALGORITHM LIBRARY',
    history: 'YOUR PROGRESS',
  };

  /**
   * 指定された画面へ表示を切り替える。
   *
   * @param view 表示する画面
   */
  protected navigate(view: View): void {
    this.view.set(view);
  }
}
