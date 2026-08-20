import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
})
export class App {
  protected readonly cube = inject(CubeService);
  protected readonly view = signal<View>('timer');

  protected readonly headings: Record<View, string> = {
    timer: 'PRACTICE SESSION',
    algorithms: 'ALGORITHM LIBRARY',
    history: 'YOUR PROGRESS',
  };

  protected navigate(view: View): void {
    this.view.set(view);
  }
}
