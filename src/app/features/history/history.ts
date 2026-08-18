import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CubeService } from '../../core/cube';

@Component({
  selector: 'app-history',
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  readonly showTimer = output<void>();
  protected readonly cube = inject(CubeService);
}
