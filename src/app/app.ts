import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { CubeService } from './core/cube';
import { View } from './core/cube.models';
import { Algorithms } from './features/algorithms/algorithms';
import { History } from './features/history/history';
import { Timer } from './features/timer/timer';

@Component({
  selector: 'app-root',
  imports: [Timer, Algorithms, History],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class App {
  protected readonly cube = inject(CubeService);
  protected readonly view = signal<View>('timer');

  protected readonly headings: Record<View, { eyebrow: string; title: string }> = {
    timer: { eyebrow: 'PRACTICE SESSION', title: '集中して、回そう。' },
    algorithms: { eyebrow: 'ALGORITHM LIBRARY', title: '手順を探す。' },
    history: { eyebrow: 'YOUR PROGRESS', title: '積み重ねを確認。' },
  };

  protected navigate(view: View): void {
    this.view.set(view);
  }
}
