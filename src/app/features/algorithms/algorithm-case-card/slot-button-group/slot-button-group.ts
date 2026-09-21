import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslocoPipe } from '@jsverse/transloco';
import { F2lSlot } from '../../../../core/cube/cube.models';

/** カード内の幅に応じたラベルでF2Lスロットを選択する。 */
@Component({
  selector: 'app-slot-button-group',
  imports: [FormsModule, MatButtonToggleModule, TranslocoPipe],
  templateUrl: './slot-button-group.html',
  styleUrl: './slot-button-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotButtonGroup {
  /** 親カードの表示手順と同期する選択スロット。 */
  readonly slot = model.required<F2lSlot>();
  /** キューブの周囲に沿ったスロット選択肢の表示順。 */
  protected readonly slots = ['FR', 'FL', 'BL', 'BR'] as const;
}
