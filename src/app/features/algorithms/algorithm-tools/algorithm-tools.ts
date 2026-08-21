import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/** OLL/PLLの表示種別と検索条件を入力するツールバー。 */
@Component({
  selector: 'app-algorithm-tools',
  imports: [FormsModule, MatIconModule],
  templateUrl: './algorithm-tools.html',
  styleUrl: './algorithm-tools.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmTools {
  /** 現在表示しているケース種別。 */
  readonly kind = model.required<'OLL' | 'PLL'>();
  /** ケース一覧の検索文字列。 */
  readonly query = model.required<string>();
}
