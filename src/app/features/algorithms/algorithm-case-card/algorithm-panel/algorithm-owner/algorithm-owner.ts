import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DisplayedAlgorithm } from '../../../../../core/algorithm/algorithm-library';
import { OwnerAvatar } from '../../../../../shared/owner-avatar/owner-avatar';

/** ユーザー手順だけに所有者を表示する。組み込み手順は空欄にして手順の開始位置を揃える。 */
@Component({
  selector: 'app-algorithm-owner',
  imports: [OwnerAvatar],
  templateUrl: './algorithm-owner.html',
  styleUrl: './algorithm-owner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmOwner {
  /** 表示する手順と、その保存元。 */
  readonly algorithm = input.required<DisplayedAlgorithm>();
}
