import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CubeService } from '../../../core/cube';
import { HistoryGroupCreate } from './history-group-create/history-group-create';
import { RecordGroup } from './record-group/record-group';
import { TranslocoPipe } from '@jsverse/transloco';

/** 記録グループの選択、作成、削除を扱うパネル。 */
@Component({
  selector: 'app-history-group-panel',
  imports: [HistoryGroupCreate, RecordGroup, TranslocoPipe],
  templateUrl: './history-group-panel.html',
  styleUrl: './history-group-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryGroupPanel {
  /** 記録とグループを操作するサービス。 */
  protected readonly cube = inject(CubeService);
}
