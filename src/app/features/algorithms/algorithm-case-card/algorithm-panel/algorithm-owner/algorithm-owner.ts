import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { DisplayedAlgorithm } from '../../../../../core/algorithm/algorithm-library';
import { OwnerAvatar } from '../../../../../shared/owner-avatar/owner-avatar';

/** 手順番号の代わりに、組み込み・ゲスト・アカウントの出自を同じ幅で表示する。 */
@Component({
  selector: 'app-algorithm-owner',
  imports: [OwnerAvatar, MatIconModule, MatTooltipModule, TranslocoPipe],
  templateUrl: './algorithm-owner.html',
  styleUrl: './algorithm-owner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmOwner {
  /** 表示する手順と、その保存元。 */
  readonly algorithm = input.required<DisplayedAlgorithm>();
}
