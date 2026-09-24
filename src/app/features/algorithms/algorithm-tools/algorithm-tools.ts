import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AlgorithmKindLinks } from '../algorithm-kind-links/algorithm-kind-links';
import { TranslocoPipe } from '@jsverse/transloco';

/** アルゴリズムの表示種別を切り替え、F2L・OLL・PLLの検索条件を入力するツールバー。 */
@Component({
  selector: 'app-algorithm-tools',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    AlgorithmKindLinks,
    TranslocoPipe,
  ],
  templateUrl: './algorithm-tools.html',
  styleUrl: './algorithm-tools.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmTools {
  /** ケース一覧の検索文字列。 */
  readonly query = model.required<string>();
  /** 種別に対応するグループの選択肢。 */
  readonly groups = input<string[]>([]);
  /** 空文字で全グループを表示する選択条件。 */
  readonly group = model('');
}
