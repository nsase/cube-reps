import { computed, inject, Injectable, signal } from '@angular/core';
import { CubeService } from '../../core/cube';
import { SolveCategory } from '../../core/cube.models';

/** Historyコンポーネントツリー内で共有する画面状態。 */
@Injectable()
export class HistoryStore {
  /** 計測記録を参照するrootサービス。 */
  private readonly cube = inject(CubeService);

  /** 履歴の絞り込み対象。`all`の場合は全グループを表示する。 */
  readonly selectedGroup = signal('all');
  /** 履歴と集計に表示するsolveカテゴリー。 */
  readonly selectedCategory = signal<SolveCategory>('full');

  /** 選択中のグループに属する計測記録。 */
  readonly filteredSolves = computed(() => {
    const groupId = this.selectedGroup();
    const category = this.selectedCategory();
    return this.cube
      .solves()
      .filter(
        (solve) => solve.category === category && (groupId === 'all' || solve.groupId === groupId),
      );
  });
}
