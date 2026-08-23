import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { HistoryProgressChartStore } from '../history-progress-chart.store';

/** 履歴グラフのSVG描画と表示幅の同期を担当する。 */
@Component({
  selector: 'app-history-progress-chart-content',
  imports: [TranslocoPipe],
  templateUrl: './history-progress-chart-content.html',
  styleUrl: './history-progress-chart-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryProgressChartContent {
  /** チャート内で共有する集計値とSVG座標。 */
  protected readonly store = inject(HistoryProgressChartStore);
  /** 横スクロール領域の要素参照。 */
  private readonly chartScroll = viewChild<ElementRef<HTMLElement>>('chartScroll');

  /** 横スクロール領域のサイズ変更をSVG座標系へ反映する。 */
  private readonly observeContainerWidth = effect((onCleanup) => {
    const element = this.chartScroll()?.nativeElement;
    if (!element) return;
    this.store.setContainerWidth(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) =>
      this.store.setContainerWidth(entry.contentRect.width),
    );
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });
}
