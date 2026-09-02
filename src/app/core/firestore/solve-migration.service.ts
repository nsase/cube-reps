import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuthenticatedUser } from '../auth/auth.gateway';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { Solve } from '../cube.models';
import { FirestoreSolveRepository } from './firestore-solve.repository';

/** 初回Solve移行で画面へ公開する処理段階。 */
export type SolveMigrationPhase =
  'hidden' | 'checking' | 'ready' | 'migrating' | 'completed' | 'partial-failure' | 'check-failure';

/** 初回Solve移行の進行状況。 */
export interface SolveMigrationState {
  /** 現在の処理段階。 */
  readonly phase: SolveMigrationPhase;
  /** 端末に保持されているSolve総数。 */
  readonly localCount: number;
  /** クラウドへの書き込みが必要なSolve数。 */
  readonly targetCount: number;
  /** 今回の操作で書き込みを確認できたSolve数。 */
  readonly uploadedCount: number;
  /** 同一内容またはクラウド優先により書き込まないSolve数。 */
  readonly skippedCount: number;
  /** 書き込みに失敗し、再試行できるSolve数。 */
  readonly failedCount: number;
}

const INITIAL_STATE: SolveMigrationState = {
  phase: 'hidden',
  localCount: 0,
  targetCount: 0,
  uploadedCount: 0,
  skippedCount: 0,
  failedCount: 0,
};

/** 端末内Solveを確認付きでFirestoreへ冪等に初回移行する。 */
@Injectable({ providedIn: 'root' })
export class SolveMigrationService {
  /** 現在の認証アカウントを提供するサービス。 */
  private readonly auth = inject(AuthService);
  /** 端末内Solveを提供するサービス。 */
  private readonly cube = inject(CubeService);
  /** アカウント別のFirestore Solveを読み書きするRepository。 */
  private readonly cloud = inject(FirestoreSolveRepository);
  /** 画面に表示する移行状態。 */
  readonly state = signal<SolveMigrationState>(INITIAL_STATE);
  /** 確認対象となるログインアカウント。 */
  readonly account = signal<AuthenticatedUser | null>(null);
  /** ログイン中かつ端末データの確認結果を表示すべきか。 */
  readonly visible = computed(() => this.state().phase !== 'hidden');
  /** 現在アップロード対象または再試行対象のSolve。 */
  private pendingSolves: Array<{ readonly solve: Solve; readonly upload: boolean }> = [];
  /** 古いアカウント向けの非同期結果を破棄するための連番。 */
  private inspectionId = 0;

  /** 認証アカウントが変わるたびに、書き込みを行わず移行対象を再確認する。 */
  private readonly inspectOnAccountChange = effect(() => {
    const user = this.auth.user();
    const inspectionId = ++this.inspectionId;
    this.account.set(user);
    this.pendingSolves = [];
    if (!user) {
      this.state.set(INITIAL_STATE);
      return;
    }
    void this.inspect(user, inspectionId);
  });

  /** 現在のアカウントと端末Solveを再取得して移行候補を更新する。 */
  retryInspection(): void {
    const user = this.auth.user();
    if (!user) return;
    const inspectionId = ++this.inspectionId;
    void this.inspect(user, inspectionId);
  }

  /** 明示的に確認された候補だけを、アカウント変更を監視しながら順番に保存する。 */
  async migrate(): Promise<void> {
    const user = this.account();
    if (
      !user ||
      this.auth.user()?.uid !== user.uid ||
      this.pendingSolves.length === 0 ||
      !['ready', 'partial-failure'].includes(this.state().phase)
    )
      return;
    const candidates = [...this.pendingSolves];
    const base = {
      ...this.state(),
      targetCount: candidates.length,
      skippedCount: candidates.filter(({ upload }) => !upload).length,
    };
    this.state.set({ ...base, phase: 'migrating', uploadedCount: 0, failedCount: 0 });
    const failed: Array<{ readonly solve: Solve; readonly upload: boolean }> = [];
    let uploadedCount = 0;

    for (const [index, candidate] of candidates.entries()) {
      const { solve, upload } = candidate;
      if (this.auth.user()?.uid !== user.uid) {
        failed.push(...candidates.slice(index));
        break;
      }
      try {
        if (!this.cube.isCurrentGuestSolve(solve)) {
          uploadedCount++;
          continue;
        }
        if (upload) await this.cloud.put(user.uid, solve);
        await this.cube.assignSolveToAccount(solve, user.uid);
        uploadedCount++;
      } catch {
        failed.push(candidate);
      }
      if (this.auth.user()?.uid === user.uid) {
        this.state.set({ ...base, phase: 'migrating', uploadedCount, failedCount: failed.length });
      }
    }

    if (this.auth.user()?.uid !== user.uid || this.account()?.uid !== user.uid) return;
    this.pendingSolves = failed;
    this.state.set({
      ...base,
      phase: failed.length === 0 ? 'completed' : 'partial-failure',
      uploadedCount,
      failedCount: failed.length,
    });
  }

  /** ローカルとクラウドをUUID単位で比較し、必要な書き込みだけを候補化する。 */
  private async inspect(user: AuthenticatedUser, inspectionId: number): Promise<void> {
    this.state.set({ ...INITIAL_STATE, phase: 'checking' });
    try {
      await this.cube.ready;
      const local = [...this.cube.guestSolves()];
      if (local.length === 0) {
        if (inspectionId === this.inspectionId) this.state.set(INITIAL_STATE);
        return;
      }
      const cloud = await this.cloud.list(user.uid);
      if (inspectionId !== this.inspectionId || this.auth.user()?.uid !== user.uid) return;
      const cloudById = new Map(cloud.map((solve) => [solve.id, solve]));
      this.pendingSolves = local.map((solve) => ({
        solve,
        upload: this.shouldUpload(solve, cloudById.get(solve.id)),
      }));
      const skippedCount = this.pendingSolves.filter(({ upload }) => !upload).length;
      this.state.set({
        phase: 'ready',
        localCount: local.length,
        targetCount: this.pendingSolves.length,
        uploadedCount: 0,
        skippedCount,
        failedCount: 0,
      });
    } catch {
      if (inspectionId !== this.inspectionId) return;
      this.pendingSolves = [];
      this.state.set({ ...INITIAL_STATE, phase: 'check-failure' });
    }
  }

  /** @returns クラウドに存在しないか、ローカルの更新日時が新しい場合はtrue */
  private shouldUpload(local: Solve, cloud: Solve | undefined): boolean {
    if (!cloud) return true;
    return Date.parse(local.updatedAt) > Date.parse(cloud.updatedAt);
  }
}
