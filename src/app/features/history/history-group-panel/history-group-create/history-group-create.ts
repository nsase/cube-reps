import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CubeService } from '../../../../core/cube';
import { HistoryStore } from '../../history.store';

/** 記録グループの作成フォームと、その表示状態を管理するコンポーネント。 */
@Component({
  selector: 'app-history-group-create',
  imports: [FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './history-group-create.html',
  styleUrl: './history-group-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryGroupCreate {
  /** 記録グループを作成するサービス。 */
  private readonly cube = inject(CubeService);
  /** Historyコンポーネントツリー内で共有する画面状態。 */
  private readonly store = inject(HistoryStore);

  /** グループ作成フォームの表示状態。 */
  protected readonly showForm = signal(false);
  /** 作成中のグループ名。 */
  protected readonly groupName = signal('');

  /** 入力された名前でグループを作成し、作成したグループを選択する。 */
  protected createGroup(): void {
    const group = this.cube.addGroup(this.groupName());
    if (!group) return;

    this.store.selectedGroup.set(group.id);
    this.groupName.set('');
    this.showForm.set(false);
  }

  /** 入力内容を破棄してグループ作成フォームを閉じる。 */
  protected cancel(): void {
    this.groupName.set('');
    this.showForm.set(false);
  }
}
