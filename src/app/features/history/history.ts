import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';
import { HistoryFilter } from './history-filter/history-filter';
import { HistoryGroupPanel } from './history-group-panel/history-group-panel';
import { HistoryProgressChart } from './history-progress-chart/history-progress-chart';
import { HistorySummary } from './history-summary/history-summary';
import { HistoryStore } from './history.store';
import { SolveHistory } from './solve-history/solve-history';

/** 履歴Paginatorのラベルを表示言語へ同期する。 */
@Injectable()
export class HistoryPaginatorIntl extends MatPaginatorIntl {
  /** 翻訳辞書と表示言語を提供するサービス。 */
  private readonly i18n = inject(TranslocoService);

  /** 初期ラベルを設定し、以後の言語変更を反映する。 */
  constructor() {
    super();
    this.updateLabels();
    this.i18n.langChanges$.subscribe(() => this.updateLabels());
  }

  /** 現在の表示言語でラベルと件数範囲を更新する。 */
  private updateLabels(): void {
    this.itemsPerPageLabel = this.i18n.translate('history.paginatorItemsPerPage');
    this.firstPageLabel = this.i18n.translate('history.paginatorFirstPage');
    this.previousPageLabel = this.i18n.translate('history.paginatorPreviousPage');
    this.nextPageLabel = this.i18n.translate('history.paginatorNextPage');
    this.lastPageLabel = this.i18n.translate('history.paginatorLastPage');
    this.getRangeLabel = (page, pageSize, length) => {
      const start = length ? page * pageSize + 1 : 0;
      const end = Math.min((page + 1) * pageSize, length);
      return this.i18n.translate('history.paginatorRange', { start, end, length });
    };
    this.changes.next();
  }
}

/** HistoryStoreのスコープを作り、履歴の子領域を構成するコンテナ。 */
@Component({
  selector: 'app-history',
  imports: [HistoryGroupPanel, HistoryFilter, HistorySummary, HistoryProgressChart, SolveHistory],
  providers: [HistoryStore, { provide: MatPaginatorIntl, useClass: HistoryPaginatorIntl }],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {}
