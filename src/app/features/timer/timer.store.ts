import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { OLL_CASES, PLL_CASES } from '../../core/algorithm-cases';
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
  readonly state = signal<'idle' | 'holding' | 'ready' | 'running'>('idle');
  /** 現在表示しているスクランブル。 */
  readonly scramble = signal('');
  /** random-state scrambleを生成している途中か。 */
  readonly scrambleGenerating = signal(false);
  /** スクランブル生成に失敗したか。 */
  readonly scrambleGenerationFailed = signal(false);
  /** 操作対象として表示する直前の計測結果。 */
  readonly completedSolve = signal<Solve | undefined>(undefined);
  /** OLL・PLL練習で選択中のケース位置。 */
  readonly selectedCase = signal(0);
  /** 現在のドリル種別に対応するケース選択肢。 */
  readonly drillCases = computed(() => (this.category() === 'oll' ? OLL_CASES : PLL_CASES));

  /** 計測表示を更新するタイマーID。 */
  private interval?: number;
  /** 計測開始に必要な長押しの完了を待つタイマーID。 */
  private holdTimer?: number;
  /** 計測開始時刻を表す高精度タイムスタンプ。 */
  private started = 0;
  /** スペースキーのキーリピートを抑止するフラグ。 */
  private spaceDown = false;
  /** 遅れて完了した古いスクランブル生成を破棄するための連番。 */
  private scrambleRequest = 0;
  /** 計測中の画面消灯を防ぐWake Lock。 */
  private wakeLock?: WakeLockSentinel;
  /** Wake Lockの重複要求を防ぐため、処理中の要求を保持する。 */
  private wakeLockRequest?: Promise<void>;
  /** 画面へ戻った際に、計測中のWake Lockを再取得する。 */
  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && this.state() === 'running') {
      this.requestWakeLock();
    }
  };

  /** 計測開始を許可するまでの長押し時間（ミリ秒）。 */
  private static readonly START_HOLD_DURATION = 500;

  /** 初期カテゴリーをrootサービスへ同期し、最初のスクランブル生成を開始する。 */
  constructor() {
    this.cube.activeSolveCategory.set(this.category());
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.updateScramble();
  }

  /** スペース押下で長押し状態へ入り、計測中の場合は停止する。 */
  keyDown(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.spaceDown || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = true;
    if (this.state() === 'running') this.stop();
    else if (this.canStart()) this.beginHolding();
  }

  /** スペースを離したとき、長押し完了後であれば計測を開始する。 */
  keyUp(event: KeyboardEvent): void {
    if (event.code !== 'Space' || this.isTyping(event)) return;
    event.preventDefault();
    this.spaceDown = false;
    this.finishHolding();
  }

  /** ポインター押下で長押し状態へ入り、計測中の場合は停止する。 */
  press(): void {
    if (this.state() === 'running') this.stop();
    else if (this.canStart()) this.beginHolding();
  }

  /** ポインターを離したとき、長押し完了後であれば計測を開始する。 */
  release(): void {
    this.finishHolding();
  }

  /** ポインター操作が中断された場合に計測開始待ちを取り消す。 */
  cancelPress(): void {
    if (this.state() === 'holding' || this.state() === 'ready') this.cancelHolding();
  }

  /** solveカテゴリーを変更してタイマーを初期状態へ戻す。 */
  setCategory(category: SolveCategory): void {
    this.category.set(category);
    this.selectedCase.set(0);
    this.cube.activeSolveCategory.set(category);
    this.reset();
    this.updateScramble();
  }

  /** 現在のカテゴリーとドリルケースに対応するスクランブルを設定する。 */
  newScramble(): void {
    this.updateScramble();
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
    this.scrambleRequest++;
    this.scrambleGenerating.set(false);
    this.scrambleGenerationFailed.set(false);
    this.scramble.set(solve.scramble);
    this.completedSolve.set(undefined);
  }

  /** Store破棄時に計測用タイマーとWake Lockを停止する。 */
  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearTimeout(this.holdTimer);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.releaseWakeLock();
  }

  /** 長押しを開始し、規定時間を経過したら開始可能な状態へ進める。 */
  private beginHolding(): void {
    clearTimeout(this.holdTimer);
    this.state.set('holding');
    this.holdTimer = window.setTimeout(() => {
      if (this.state() === 'holding') this.state.set('ready');
    }, TimerStore.START_HOLD_DURATION);
  }

  /** 長押しを終え、開始可能なら計測を始め、未完了なら操作を取り消す。 */
  private finishHolding(): void {
    clearTimeout(this.holdTimer);
    if (this.state() === 'ready') this.start();
    else if (this.state() === 'holding') this.state.set('idle');
  }

  /** 長押し中のタイマーを破棄して初期状態へ戻す。 */
  private cancelHolding(): void {
    clearTimeout(this.holdTimer);
    this.state.set('idle');
  }

  /** 経過時間を初期化して10ミリ秒間隔の計測を開始する。 */
  private start(): void {
    this.started = performance.now();
    this.elapsed.set(0);
    this.completedSolve.set(undefined);
    this.state.set('running');
    this.requestWakeLock();
    this.interval = window.setInterval(
      () => this.elapsed.set(performance.now() - this.started),
      10,
    );
  }

  /** 計測を停止し、結果を保存して次のスクランブルを生成する。 */
  private stop(): void {
    clearInterval(this.interval);
    this.releaseWakeLock();
    const solve = this.cube.addSolve(
      this.elapsed(),
      this.scramble(),
      this.category(),
      this.category() === 'full' ? undefined : this.drillCases()[this.selectedCase()].number,
    );
    this.state.set('idle');
    this.updateScramble();
    this.completedSolve.set(solve);
  }

  /** 保存せずに計測状態と経過時間を初期化する。 */
  private reset(): void {
    clearInterval(this.interval);
    this.releaseWakeLock();
    clearTimeout(this.holdTimer);
    this.elapsed.set(0);
    this.state.set('idle');
    this.completedSolve.set(undefined);
  }

  /** 計測中の画面消灯を防ぐWake Lockを、利用可能な環境で取得する。 */
  private requestWakeLock(): void {
    if (this.wakeLockRequest || (this.wakeLock && !this.wakeLock.released)) return;
    if (!('wakeLock' in navigator)) return;

    this.wakeLockRequest = navigator.wakeLock
      .request('screen')
      .then((wakeLock) => {
        if (this.state() === 'running' && document.visibilityState === 'visible') {
          this.wakeLock = wakeLock;
        } else {
          void wakeLock.release();
        }
      })
      .catch(() => undefined)
      .finally(() => {
        this.wakeLockRequest = undefined;
      });
  }

  /** 保持中のWake Lockを解除する。 */
  private releaseWakeLock(): void {
    const wakeLock = this.wakeLock;
    this.wakeLock = undefined;
    if (wakeLock && !wakeLock.released) void wakeLock.release().catch(() => undefined);
  }

  /** 現在のカテゴリーに対応するスクランブルを生成し、最新リクエストだけを反映する。 */
  private updateScramble(): void {
    const request = ++this.scrambleRequest;
    this.scrambleGenerationFailed.set(false);
    if (this.category() !== 'full') {
      this.scrambleGenerating.set(false);
      this.scramble.set(this.createDrillScramble());
      return;
    }
    this.scrambleGenerating.set(true);
    void this.cube
      .createScramble()
      .then((scramble) => {
        if (request !== this.scrambleRequest) return;
        this.scramble.set(scramble);
        this.scrambleGenerating.set(false);
      })
      .catch(() => {
        if (request !== this.scrambleRequest) return;
        this.scrambleGenerating.set(false);
        this.scrambleGenerationFailed.set(true);
      });
  }

  /** @returns 選択中のOLL・PLLケースを作る固定スクランブル */
  private createDrillScramble(): string {
    const item = this.drillCases()[this.selectedCase()];
    return invertAlgorithm(item.algorithms[0]);
  }

  /** @returns 完成したスクランブルがあり、計測開始できる場合は`true` */
  private canStart(): boolean {
    return !this.scrambleGenerating() && !this.scrambleGenerationFailed() && !!this.scramble();
  }

  /** @returns キーイベントの発生元が文字入力要素の場合は`true` */
  private isTyping(event: KeyboardEvent): boolean {
    return ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
      (event.target as HTMLElement)?.tagName,
    );
  }
}
