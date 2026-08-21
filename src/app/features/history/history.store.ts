import { computed, inject, Injectable, signal } from '@angular/core';
import { CubeService } from '../../core/cube';

/** Historyコンポーネントツリー内で共有する画面状態。 */
@Injectable()
export class HistoryStore {
  /** 計測記録を参照するrootサービス。 */
  private readonly cube = inject(CubeService);

  /** 履歴の絞り込み対象。`all`の場合は全グループを表示する。 */
  readonly selectedGroup = signal('all');

  /** 選択中のグループに属する計測記録。 */
  readonly filteredSolves = computed(() => {
    const groupId = this.selectedGroup();
    return groupId === 'all'
      ? this.cube.solves()
      : this.cube.solves().filter((solve) => solve.groupId === groupId);
  });
}
