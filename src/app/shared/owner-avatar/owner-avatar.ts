import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SyncMetadata } from '../../core/cube.models';
import { MetadataOwnerService } from '../../core/metadata-owner';

/** 1件の所有者を同じ大きさの画像・イニシャル・アイコンで表示する。 */
@Component({
  selector: 'app-owner-avatar',
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './owner-avatar.html',
  styleUrl: './owner-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnerAvatar {
  /** 所有者を表示する記録。 */
  readonly metadata = input.required<SyncMetadata>();
  /** 画像読み込みに失敗したURL。別の画像へ変われば再び読み込む。 */
  protected readonly failedPhoto = signal<string | undefined>(undefined);
  /** 台帳から取得する表示情報。 */
  protected readonly owners = inject(MetadataOwnerService);
  /** ユーザーのプロフィール画像 */
  protected readonly photo = computed(() => this.owners.photo(this.metadata()));
  /** ユーザーのイニシャル */
  protected readonly initials = computed(() => this.owners.initials(this.metadata()));
}
