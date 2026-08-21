import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AlgorithmLibraryService, CaseAlgorithm } from '../../../../core/algorithm-library';
import { AlgorithmCase } from '../../../../core/cube.models';
import { AlgorithmRow } from './algorithm-row/algorithm-row';
import { TranslocoPipe } from '@jsverse/transloco';

/** 1ケース分のお気に入り手順、手順一覧、追加フォームを表示するコンポーネント。 */
@Component({
  selector: 'app-algorithm-panel',
  imports: [FormsModule, MatButtonModule, AlgorithmRow, TranslocoPipe],
  templateUrl: './algorithm-panel.html',
  styleUrl: './algorithm-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmPanel {
  /** 手順を表示するOLLまたはPLLケース。 */
  readonly item = input.required<AlgorithmCase>();

  /** ケースごとの表示手順とユーザー設定を管理するサービス。 */
  protected readonly library = inject(AlgorithmLibraryService);
  /** 未登録手順の入力値。 */
  protected readonly draft = signal('');

  /** @returns 手順一覧内での表示順位。見つからない場合は`-1` */
  protected favoriteRank(algorithm: CaseAlgorithm): number {
    return this.library.algorithmsFor(this.item()).findIndex(({ id }) => id === algorithm.id);
  }

  /** 入力中の手順を追加し、成功時に入力を空にする。 */
  protected add(): void {
    if (this.library.add(this.item(), this.draft())) this.draft.set('');
  }
}
