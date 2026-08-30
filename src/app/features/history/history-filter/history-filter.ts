import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { CubeService } from '../../../core/cube';
import { SOLVE_CATEGORIES } from '../../../core/cube.models';
import { HistoryStore } from '../history.store';

/** 履歴の表示・集計対象を切り替える固定フィルター。 */
@Component({
  selector: 'app-history-filter',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './history-filter.html',
  styleUrl: './history-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-testid': 'history-filter',
  },
})
export class HistoryFilter {
  /** 履歴で選択できるsolveカテゴリー一覧。 */
  protected readonly solveCategories = SOLVE_CATEGORIES;
  /** フィルターで選択できるグループ一覧を提供するサービス。 */
  protected readonly cube = inject(CubeService);
  /** Historyコンポーネントツリー内で共有する画面状態。 */
  protected readonly store = inject(HistoryStore);
}
