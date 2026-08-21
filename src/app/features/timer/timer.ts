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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PLL_CASES } from '../../core/algorithm-cases';
import { AlgorithmLibraryService } from '../../core/algorithm-library';
import { CubeNetView } from '../../shared/cube-net/cube-net';
import { CubeService } from '../../core/cube';
import { SolveMode } from '../../core/cube.models';

/** スペースキーまたはポインター操作で計測するタイマー画面。 */
@Component({
  selector: 'app-timer',
  imports: [FormsModule, MatButtonModule, MatIconModule, CubeNetView],
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timer implements OnDestroy {
  /** 履歴画面への遷移を親コンポーネントへ通知する。 */
  readonly showHistory = output<void>();
  /** 計測記録、グループ、スクランブルを管理するサービス。 */
  protected readonly cube = inject(CubeService);

  /** PLL練習で表示する代表手順を提供するサービス。 */
  protected readonly algorithmLibrary = inject(AlgorithmLibraryService);
  /** 現在の計測モード。 */
  protected readonly mode = signal<SolveMode>('3x3');
  /** 現在の経過時間（ミリ秒）。 */
  protected readonly elapsed = signal(0);
  /** タイマー操作の状態。 */
  protected readonly state = signal<'idle' | 'ready' | 'running'>('idle');
  /** 現在表示しているスクランブル。 */
  protected readonly scramble = signal(this.cube.createScramble());
  /** PLL練習で選択中のケース位置。 */
  protected readonly selected = signal(15);
  /** PLLケース選択肢。 */
  protected readonly pllCases = PLL_CASES;
  /** 計測表示を更新するタイマーID。 */
  private interval?: number;
  /** 計測開始時刻を表す高精度タイムスタンプ。 */
  private started = 0;
  /** スペースキーのキーリピートを抑止するフラグ。 */
  private spaceDown = false;

  /** スペース押下で準備状態へ入り、計測中の場合は停止する。 */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.spaceDown || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = true;
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }

  /** スペースを離したとき、準備状態であれば計測を開始する。 */
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = false;
    if (this.state() === 'ready') this.start();
  }

  /** ポインター押下で準備状態へ入り、計測中の場合は停止する。 */
  protected press(): void {
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }
  /** ポインターを離したとき、準備状態であれば計測を開始する。 */
  protected release(): void {
    if (this.state() === 'ready') this.start();
  }
  /** 計測モードを変更してタイマーを初期状態へ戻す。 */
  protected setMode(mode: SolveMode): void {
    this.mode.set(mode);
    this.reset();
  }
  /** 新しいランダムスクランブルを生成する。 */
  protected newScramble(): void {
    this.scramble.set(this.cube.createScramble());
  }

  /** コンポーネント破棄時に計測用タイマーを停止する。 */
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  /** 経過時間を初期化して10ミリ秒間隔の計測を開始する。 */
  private start(): void {
    this.started = performance.now();
    this.elapsed.set(0);
    this.state.set('running');
    this.interval = window.setInterval(
      () => this.elapsed.set(performance.now() - this.started),
      10,
    );
  }

  /** 計測を停止し、結果を保存して次のスクランブルを生成する。 */
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

  /** 保存せずに計測状態と経過時間を初期化する。 */
  private reset(): void {
    clearInterval(this.interval);
    this.elapsed.set(0);
    this.state.set('idle');
  }
  /** @returns キーイベントの発生元が文字入力要素の場合は`true` */
  private isTyping(event: KeyboardEvent): boolean {
    return ['INPUT', 'SELECT'].includes((event.target as HTMLElement)?.tagName);
  }
}
