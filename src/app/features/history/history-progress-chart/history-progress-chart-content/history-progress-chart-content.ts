import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
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
  /** DOMで表示幅を取得できない場合に使うチャート幅。 */
  private static readonly DEFAULT_CHART_WIDTH = 848;
  /** チャート表示領域の要素参照。 */
  @ViewChild('chartContainer', { static: true })
  private chartContainer?: ElementRef<HTMLElement>;
  /** チャート表示領域の横幅を監視するObserver。 */
  private resizeObserver?: ResizeObserver;
  /** 現在のチャート表示領域幅。 */
  private readonly viewportWidth = signal(0);
  /** 実際の表示領域に合わせ、フォントを拡縮しないSVG幅。 */
  protected readonly chartWidth = computed(
    () => this.viewportWidth() || HistoryProgressChartContent.DEFAULT_CHART_WIDTH,
  );

  /** 初期表示幅を取得し、以後のリサイズを監視する。 */
  ngAfterViewInit(): void {
    const element = this.chartContainer?.nativeElement;
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
}
