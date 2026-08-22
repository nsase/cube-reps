import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
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

  /** 1ページに表示する計測記録数。 */
  readonly pageSize = 100;
  /** 現在表示している0始まりのページ位置。 */
  readonly pageIndex = signal(0);

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

  /** 現在のページに表示する計測記録。 */
  readonly pagedSolves = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredSolves().slice(start, start + this.pageSize);
  });

  /** 絞り込み条件が変わったときに先頭ページへ戻す。 */
  private readonly resetPageOnFilterChange = effect(() => {
    this.selectedGroup();
    this.selectedCategory();
    untracked(() => this.pageIndex.set(0));
  });

  /** 削除後も存在するページが選択されるようページ位置を補正する。 */
  private readonly clampPageToAvailableRange = effect(() => {
    const lastPage = Math.max(Math.ceil(this.filteredSolves().length / this.pageSize) - 1, 0);
    if (this.pageIndex() > lastPage) this.pageIndex.set(lastPage);
  });

  /**
   * 履歴に表示するページを変更する。
   *
   * @param pageIndex 0始まりのページ位置
   */
  setPage(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }
}
