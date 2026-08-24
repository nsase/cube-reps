import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { TimerClock } from './timer-clock/timer-clock';
import { TimerScramble } from './timer-scramble/timer-scramble';
import { TimerSettings } from './timer-settings/timer-settings';
import { TimerStats } from './timer-stats/timer-stats';
import { TimerStore } from './timer.store';

/** スペースキーまたはポインター操作で計測するタイマー画面。 */
@Component({
  selector: 'app-timer',
  imports: [TimerSettings, TimerScramble, TimerClock, TimerStats],
  providers: [TimerStore],
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timer {
  /** Timerコンポーネントツリー内で共有する計測状態。 */
  protected readonly store = inject(TimerStore);

  /** 計測中のポインター押下を画面全体で受け取り、タイマーを停止する。 */
  protected stopRunningTimer(): void {
    if (this.store.state() === 'running') this.store.press();
  }

  /** スペース押下で長押し状態へ入り、計測中の場合は停止する。 */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.store.keyDown(event);
  }

  /** スペースを離したとき、長押し完了後であれば計測を開始する。 */
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    this.store.keyUp(event);
  }
}
