import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { PLL_CASES } from '../../core/algorithm-cases';
import { CubeService } from '../../core/cube';
import { SolveMode } from '../../core/cube.models';

/** Timerコンポーネントツリー内で計測状態と操作を共有するStore。 */
@Injectable()
export class TimerStore implements OnDestroy {
  /** 計測記録とスクランブルを管理するサービス。 */
  private readonly cube = inject(CubeService);

  /** 現在の計測モード。 */
  readonly mode = signal<SolveMode>('3x3');
  /** 現在の経過時間（ミリ秒）。 */
  readonly elapsed = signal(0);
  /** タイマー操作の状態。 */
  readonly state = signal<'idle' | 'ready' | 'running'>('idle');
  /** 現在表示しているスクランブル。 */
  readonly scramble = signal(this.cube.createScramble());
  /** PLL練習で選択中のケース位置。 */
  readonly selectedCase = signal(15);
  /** PLLケース選択肢。 */
  readonly pllCases = PLL_CASES;

  /** 計測表示を更新するタイマーID。 */
  private interval?: number;
  /** 計測開始時刻を表す高精度タイムスタンプ。 */
  private started = 0;
  /** スペースキーのキーリピートを抑止するフラグ。 */
  private spaceDown = false;

  /** スペース押下で準備状態へ入り、計測中の場合は停止する。 */
  keyDown(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.spaceDown || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = true;
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }

  /** スペースを離したとき、準備状態であれば計測を開始する。 */
  keyUp(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = false;
    if (this.state() === 'ready') this.start();
  }

  /** ポインター押下で準備状態へ入り、計測中の場合は停止する。 */
  press(): void {
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }

  /** ポインターを離したとき、準備状態であれば計測を開始する。 */
  release(): void {
    if (this.state() === 'ready') this.start();
  }

  /** 計測モードを変更してタイマーを初期状態へ戻す。 */
  setMode(mode: SolveMode): void {
    this.mode.set(mode);
    this.reset();
  }

  /** 新しいランダムスクランブルを生成する。 */
  newScramble(): void {
    this.scramble.set(this.cube.createScramble());
  }

  /** Store破棄時に計測用タイマーを停止する。 */
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
      this.mode() === 'PLL' ? PLL_CASES[this.selectedCase()].number : undefined,
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
