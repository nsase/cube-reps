import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoPipe } from '@jsverse/transloco';
import { SolveMigrationService } from '../../core/firestore/solve-migration.service';

/** 初回Solve移行の対象アカウント、件数、進行状況、再試行操作を表示する。 */
@Component({
  selector: 'app-solve-migration',
  imports: [MatButtonModule, MatProgressBarModule, TranslocoPipe],
  templateUrl: './solve-migration.html',
  styleUrl: './solve-migration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveMigration {
  /** 初回移行の状態と操作を提供するサービス。 */
  protected readonly migration = inject(SolveMigrationService);
  /** 表示中のアカウントへ対象Solveをアップロードする。 */
  protected async migrate(): Promise<void> {
    await this.migration.migrate();
  }
  /** ローカルとクラウドの比較を再試行する。 */
  protected retryInspection(): void {
    this.migration.retryInspection();
  }
}
