import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { CubeService } from '../../core/cube';
import { average } from '../../core/cube-statistics';
import { Solve, SolveCategory } from '../../core/cube.models';
import { MetadataOwnerService } from '../../core/metadata-owner';

/** 履歴一覧の1行に表示する記録と、その計測時点の集計値。 */
export interface HistorySolveRow {
  /** 表示対象の計測記録。 */
  readonly solve: Solve;
  /** 古い記録から数えた1始まりの通し番号。 */
  readonly number: number;
  /** この記録を末尾とするAo5。 */
  readonly ao5?: number;
  /** この記録を末尾とするAo12。 */
  readonly ao12?: number;
}

/** Historyコンポーネントツリー内で共有する画面状態。 */
@Injectable()
export class HistoryStore {
  /** 計測記録を参照するrootサービス。 */
  private readonly cube = inject(CubeService);

  /** 現在のアカウントに応じた選択可能範囲。 */
  readonly auth = inject(AuthService);
  /** 所有者の表示名と分類。 */
  readonly owners = inject(MetadataOwnerService);
  /** 全所有者を初期表示するフィルター。 */
  readonly selectedOwner = signal('all');
  /** 明示的に移行・コピーする記録ID。 */
  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  /** 所有者フィルターを適用した、グループをまたぐ記録一覧。 */
  readonly ownerSolves = computed(() =>
    this.cube
      .activeSolves()
      .filter(
        (solve) =>
          this.selectedOwner() === 'all' || this.owners.key(solve) === this.selectedOwner(),
      ),
  );
  /** 現在表示する範囲内で選択されている移行・コピー候補。 */
  readonly selectedSolves = computed(() =>
    this.filteredSolves().filter(
      (solve) => this.selectedIds().has(solve.id) && this.canSelect(solve),
    ),
  );

  /** Timerの記録先と共有する、履歴の表示・集計対象グループ。 */
  readonly selectedGroup = this.cube.activeGroupId;
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
    return this.ownerSolves().filter(
      (solve) => solve.category === category && (solve.groupId || 'unclassified') === groupId,
    );
  });

  /** 現在のページに表示する計測記録。 */
  readonly pagedSolves = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredSolves().slice(start, start + this.pageSize);
  });
  /** 現在のページに表示する記録と、その計測時点の集計値。 */
  readonly pagedRows = computed<readonly HistorySolveRow[]>(() => {
    const solves = this.filteredSolves();
    const start = this.pageIndex() * this.pageSize;
    return solves.slice(start, start + this.pageSize).map((solve, pageIndex) => {
      const index = start + pageIndex;
      return {
        solve,
        number: solves.length - index,
        ao5: this.averageAt(solves, index, 5),
        ao12: this.averageAt(solves, index, 12),
      };
    });
  });

  /** 絞り込み条件が変わったときに先頭ページへ戻す。 */
  private readonly resetPageOnFilterChange = effect(() => {
    this.selectedGroup();
    this.selectedCategory();
    this.selectedOwner();
    this.auth.user()?.uid;
    untracked(() => {
      this.pageIndex.set(0);
      this.selectedIds.set(new Set());
    });
  });

  /** 削除後も存在するページが選択されるようページ位置を補正する。 */
  private readonly clampPageToAvailableRange = effect(() => {
    const lastPage = Math.max(Math.ceil(this.filteredSolves().length / this.pageSize) - 1, 0);
    if (this.pageIndex() > lastPage) this.pageIndex.set(lastPage);
  });

  /** 現在のアカウントに未紐づけの記録だけを選択可能にする。 */
  canSelect(solve: Solve): boolean {
    const uid = this.auth.user()?.uid;
    return Boolean(uid && (solve.ownerType === 'guest' || solve.ownerId !== uid));
  }

  /** 表示中の1件の選択を切り替える。 */
  toggleSelection(solve: Solve): void {
    if (!this.canSelect(solve)) return;
    this.selectedIds.update((current) => {
      const ids = new Set(current);
      if (ids.has(solve.id)) ids.delete(solve.id);
      else ids.add(solve.id);
      return ids;
    });
  }

  /**
   * 履歴に表示するページを変更する。
   *
   * @param pageIndex 0始まりのページ位置
   */
  setPage(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }

  /**
   * 指定記録を末尾とするAverageを計算する。
   * 一覧は新しい順のため、指定位置から古い方向へ必要件数を取得する。
   *
   * @param solves 新しい順の計測記録
   * @param index 集計対象記録の位置
   * @param count Averageの対象件数
   * @returns 必要件数が揃った場合のAverage
   */
  private averageAt(solves: readonly Solve[], index: number, count: number): number | undefined {
    return solves.length - index < count
      ? undefined
      : average(solves.slice(index, index + count).map((solve) => this.cube.statTime(solve)));
  }
}
