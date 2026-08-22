import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { PLL_CASES } from '../../core/algorithm-cases';
import { CubeService } from '../../core/cube';
import { Penalty, Solve, SolveCategory } from '../../core/cube.models';
import { invertAlgorithm } from '../../core/cube-state';

/** Timerコンポーネントツリー内で計測状態と操作を共有するStore。 */
@Injectable()
export class TimerStore implements OnDestroy {
  /** 計測記録とスクランブルを管理するサービス。 */
  private readonly cube = inject(CubeService);

  /** 現在のsolveカテゴリー。 */
  readonly category = signal<SolveCategory>('full');
  /** 現在の経過時間（ミリ秒）。 */
  readonly elapsed = signal(0);
  /** タイマー操作の状態。 */
  readonly state = signal<'idle' | 'ready' | 'running'>('idle');
  /** 現在表示しているスクランブル。 */
  readonly scramble = signal(this.cube.createScramble());
  /** 操作対象として表示する直前の計測結果。 */
  readonly completedSolve = signal<Solve | undefined>(undefined);
  /** PLL練習で選択中のケース位置。 */
  readonly selectedCase = signal(0);
  /** PLLケース選択肢。 */
  readonly pllCases = PLL_CASES;

  /** 計測表示を更新するタイマーID。 */
  private interval?: number;
  /** 計測開始時刻を表す高精度タイムスタンプ。 */
  private started = 0;
  /** スペースキーのキーリピートを抑止するフラグ。 */
  private spaceDown = false;

  /** 初期カテゴリーをrootサービスの集計対象へ同期する。 */
  constructor() {
    this.cube.activeSolveCategory.set(this.category());
  }

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

  /** solveカテゴリーを変更してタイマーを初期状態へ戻す。 */
  setCategory(category: SolveCategory): void {
    this.category.set(category);
    this.cube.activeSolveCategory.set(category);
    this.reset();
    this.scramble.set(this.createScrambleForSelection());
  }

  /** 現在のカテゴリーとPLLケースに対応するスクランブルを設定する。 */
  newScramble(): void {
    this.scramble.set(this.createScrambleForSelection());
    this.completedSolve.set(undefined);
  }

  /** 直前の計測結果へペナルティを適用または解除する。 */
  toggleCompletedPenalty(penalty: Exclude<Penalty, 'none'>): void {
    const solve = this.completedSolve();
    if (!solve) return;
    this.cube.togglePenalty(solve.id, penalty);
    this.completedSolve.set(this.cube.solves().find(({ id }) => id === solve.id));
  }

  /** 直前の計測結果を削除し、完了後操作を閉じる。 */
  removeCompletedSolve(): void {
    const solve = this.completedSolve();
    if (!solve) return;
    this.cube.removeSolve(solve.id);
    this.completedSolve.set(undefined);
  }

  /** 直前の記録を残したまま、同じスクランブルを再設定する。 */
  retryCompletedSolve(): void {
    const solve = this.completedSolve();
    if (!solve) return;
    this.scramble.set(solve.scramble);
    this.completedSolve.set(undefined);
  }

  /** Store破棄時に計測用タイマーを停止する。 */
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  /** 経過時間を初期化して10ミリ秒間隔の計測を開始する。 */
  private start(): void {
    this.started = performance.now();
    this.elapsed.set(0);
    this.completedSolve.set(undefined);
    this.state.set('running');
    this.interval = window.setInterval(
      () => this.elapsed.set(performance.now() - this.started),
      10,
    );
  }

  /** 計測を停止し、結果を保存して次のスクランブルを生成する。 */
  private stop(): void {
    clearInterval(this.interval);
    const solve = this.cube.addSolve(
      this.elapsed(),
      this.scramble(),
      this.category(),
      this.category() === 'pll' ? PLL_CASES[this.selectedCase()].number : undefined,
    );
    this.state.set('idle');
    this.scramble.set(this.createScrambleForSelection());
    this.completedSolve.set(solve);
  }

  /** 保存せずに計測状態と経過時間を初期化する。 */
  private reset(): void {
    clearInterval(this.interval);
    this.elapsed.set(0);
    this.state.set('idle');
    this.completedSolve.set(undefined);
  }

  /**
   * FULL SOLVEではランダム手順、PLL DRILLでは選択ケースを作る固定手順を返す。
   *
   * @returns 現在の練習対象に対応するスクランブル
   */
  private createScrambleForSelection(): string {
    if (this.category() === 'full') return this.cube.createScramble();
    const item = PLL_CASES[this.selectedCase()];
    return invertAlgorithm(item.algorithms[0]);
  }

  /** @returns キーイベントの発生元が文字入力要素の場合は`true` */
  private isTyping(event: KeyboardEvent): boolean {
    return ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
      (event.target as HTMLElement)?.tagName,
    );
  }
}
