import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PLL_CASES } from '../../core/algorithm-cases';
import { AlgorithmLibraryService } from '../../core/algorithm-library';
import { CubeNetView } from '../../shared/cube-net/cube-net';
import { CubeService } from '../../core/cube';
import { SolveMode } from '../../core/cube.models';

@Component({
  selector: 'app-timer',
  imports: [FormsModule, CubeNetView],
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timer implements OnDestroy {
  readonly showHistory = output<void>();
  protected readonly cube = inject(CubeService);

  protected readonly algorithmLibrary = inject(AlgorithmLibraryService);
  protected readonly mode = signal<SolveMode>('3x3');
  protected readonly elapsed = signal(0);
  protected readonly state = signal<'idle' | 'ready' | 'running'>('idle');
  protected readonly scramble = signal(this.cube.createScramble());
  protected readonly selected = signal(15);
  protected readonly pllCases = PLL_CASES;
  private interval?: number;
  private started = 0;
  private spaceDown = false;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.spaceDown || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = true;
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = false;
    if (this.state() === 'ready') this.start();
  }

  protected press(): void {
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }
  protected release(): void {
    if (this.state() === 'ready') this.start();
  }
  protected setMode(mode: SolveMode): void {
    this.mode.set(mode);
    this.reset();
  }
  protected newScramble(): void {
    this.scramble.set(this.cube.createScramble());
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  private start(): void {
    this.started = performance.now();
    this.elapsed.set(0);
    this.state.set('running');
    this.interval = window.setInterval(
      () => this.elapsed.set(performance.now() - this.started),
      10,
    );
  }

  private stop(): void {
    clearInterval(this.interval);
    this.cube.addSolve(
      this.elapsed(),
      this.scramble(),
      this.mode(),
      this.mode() === 'PLL' ? PLL_CASES[this.selected()].number : undefined,
    );
    this.state.set('idle');
    this.newScramble();
  }

  private reset(): void {
    clearInterval(this.interval);
    this.elapsed.set(0);
    this.state.set('idle');
  }
  private isTyping(event: KeyboardEvent): boolean {
    return ['INPUT', 'SELECT'].includes((event.target as HTMLElement)?.tagName);
  }
}
