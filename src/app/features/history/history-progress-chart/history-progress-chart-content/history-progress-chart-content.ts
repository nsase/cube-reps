import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { HistoryProgressChartStore } from '../history-progress-chart.store';

/** 履歴グラフのSVG描画を担当する。 */
@Component({
  selector: 'app-history-progress-chart-content',
  imports: [TranslocoPipe],
  templateUrl: './history-progress-chart-content.html',
  styleUrl: './history-progress-chart-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryProgressChartContent implements AfterViewInit, OnDestroy {
  /** チャート内で共有する集計値とSVG座標。 */
  protected readonly store = inject(HistoryProgressChartStore);
  /** 14件表示時の間隔を維持する基準件数。 */
  private static readonly BASE_POINT_COUNT = 14;
  /** 狭い画面でもラベルを判読できる最小間隔。 */
  private static readonly MINIMUM_POINT_SPACING = 64;
  /** プロット領域の外側に確保する横幅。 */
  private static readonly CHART_HORIZONTAL_INSET = 80;
  /** スクロール領域の要素参照。 */
  @ViewChild('chartScroll', { static: true })
  private chartScroll?: ElementRef<HTMLElement>;
  /** スクロール領域の横幅を監視するObserver。 */
  private resizeObserver?: ResizeObserver;
  /** 現在のスクロール表示領域幅。 */
  private readonly viewportWidth = signal(0);
  /** 14件表示時を基準にした1件ごとの横方向間隔。 */
  protected readonly pointSpacing = computed(() =>
    Math.max(
      HistoryProgressChartContent.MINIMUM_POINT_SPACING,
      (this.viewportWidth() - HistoryProgressChartContent.CHART_HORIZONTAL_INSET) /
        HistoryProgressChartContent.BASE_POINT_COUNT,
    ),
  );
  /** 表示件数が基準を超えた場合だけ横へ拡張するSVG幅。 */
  protected readonly chartWidth = computed(() =>
    Math.max(
      this.viewportWidth(),
      this.store.points().length * this.pointSpacing() +
        HistoryProgressChartContent.CHART_HORIZONTAL_INSET,
    ),
  );
  /** データ件数や表示幅の変更後も最新記録を右端に表示するEffectを登録する。 */
  constructor() {
    effect(() => {
      this.chartWidth();
      queueMicrotask(() => this.scrollToLatest());
    });
  }

  /** 初期表示幅を取得し、以後のリサイズを監視する。 */
  ngAfterViewInit(): void {
    const element = this.chartScroll?.nativeElement;
    if (!element) return;
    this.viewportWidth.set(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.viewportWidth.set(entry.contentRect.width);
    });
    this.resizeObserver.observe(element);
  }

  /** コンポーネント破棄時に表示幅の監視を終了する。 */
  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /** 横スクロール位置を最新記録がある右端へ移動する。 */
  private scrollToLatest(): void {
    const element = this.chartScroll?.nativeElement;
    if (element) element.scrollLeft = element.scrollWidth - element.clientWidth;
  }
}
