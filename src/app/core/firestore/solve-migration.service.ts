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
  /** 端末に保持されている移行対象Solve数。 */
  readonly localCount: number;
  /** 現在の移行対象Solve数。 */
  readonly targetCount: number;
  /** 今回の操作で処理を確認できたSolve数。 */
  readonly uploadedCount: number;
  /** 更新日時の比較によりFirestoreへ書き込まないSolve数。 */
  readonly skippedCount: number;
  /** 処理に失敗し、再試行できるSolve数。 */
  readonly failedCount: number;
}

/** 1件のローカルSolveに必要な初回移行操作。 */
interface MigrationCandidate {
  /** 移行判断時点のゲスト所有Solve。 */
  readonly solve: Solve;
  /** Firestoreへの書き込みが必要か。 */
  readonly upload: boolean;
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
  /** 最後に確認したログインアカウントのFirestore Solve。未確認時はnull。 */
  private readonly cloudById = signal<ReadonlyMap<string, Solve> | null>(null);
  /** 直前の操作で失敗し、同じ内容で再試行する候補。 */
  private readonly failedCandidates = signal<readonly MigrationCandidate[]>([]);
  /** Cloudスナップショットと現在のguest Solveから常に再計算する移行候補。 */
  private readonly migrationCandidates = computed<readonly MigrationCandidate[]>(() => {
    const cloudById = this.cloudById();
    if (!cloudById) return [];
    return this.cube.guestSolves().map((solve) => ({
      solve,
      upload: this.shouldUpload(solve, cloudById.get(solve.id)),
    }));
  });
  /** 現在もguest所有かつ未変更で、再試行可能な失敗候補。 */
  private readonly retryCandidates = computed(() =>
    this.failedCandidates().filter(({ solve }) => this.cube.isCurrentGuestSolve(solve)),
  );

  /** 画面に表示する移行状態。 */
  readonly state = signal<SolveMigrationState>(INITIAL_STATE);
  /** 確認対象となるログインアカウント。 */
  readonly account = signal<AuthenticatedUser | null>(null);
  /** ログイン中かつ端末データの確認結果を表示すべきか。 */
  readonly visible = computed(() => this.state().phase !== 'hidden');
  /** 古いアカウント向けの非同期結果を破棄するための連番。 */
  private inspectionId = 0;

  /** 認証アカウントが変わるたびに、書き込みを行わずCloud状態を再確認する。 */
  private readonly inspectOnAccountChange = effect(() => {
    const user = this.auth.user();
    const inspectionId = ++this.inspectionId;
    this.account.set(user);
    this.cloudById.set(null);
    this.failedCandidates.set([]);
    if (!user) {
      this.state.set(INITIAL_STATE);
      return;
    }
    void this.inspect(user, inspectionId);
  });

  /** 移行前のguest Solve変更を候補件数と画面表示へ即時反映する。 */
  private readonly reflectCandidateChanges = effect(() => {
    const user = this.account();
    const cloudById = this.cloudById();
    const candidates = this.migrationCandidates();
    const retryCandidates = this.retryCandidates();
    const current = this.state();
    if (!user || !cloudById || this.auth.user()?.uid !== user.uid) return;
    if (current.phase === 'migrating' || current.phase === 'completed') return;

    if (current.phase === 'partial-failure') {
      if (retryCandidates.length === 0) {
        this.state.set({ ...current, phase: 'completed', failedCount: 0 });
      } else if (
        current.failedCount !== retryCandidates.length ||
        current.targetCount !== retryCandidates.length
      ) {
        this.state.set({
          ...current,
          targetCount: retryCandidates.length,
          failedCount: retryCandidates.length,
        });
      }
      return;
    }

    const next: SolveMigrationState =
      candidates.length === 0
        ? INITIAL_STATE
        : {
            phase: 'ready',
            localCount: candidates.length,
            targetCount: candidates.length,
            uploadedCount: 0,
            skippedCount: candidates.filter(({ upload }) => !upload).length,
            failedCount: 0,
          };
    if (
      current.phase !== next.phase ||
      current.localCount !== next.localCount ||
      current.targetCount !== next.targetCount ||
      current.uploadedCount !== next.uploadedCount ||
      current.skippedCount !== next.skippedCount ||
      current.failedCount !== next.failedCount
    ) {
      this.state.set(next);
    }
  });

  /** 現在のアカウントとFirestore Solveを再取得して移行候補を更新する。 */
  retryInspection(): void {
    const user = this.auth.user();
    if (!user) return;
    const inspectionId = ++this.inspectionId;
    void this.inspect(user, inspectionId);
  }

  /** 明示的に確認された開始時点の候補だけを、アカウント変更を監視しながら順番に処理する。 */
  async migrate(): Promise<void> {
    const user = this.account();
    const phase = this.state().phase;
    const candidates =
      phase === 'partial-failure' ? this.retryCandidates() : this.migrationCandidates();
    if (
      !user ||
      this.auth.user()?.uid !== user.uid ||
      candidates.length === 0 ||
      !['ready', 'partial-failure'].includes(phase)
    )
      return;

    const base: SolveMigrationState = {
      ...this.state(),
      localCount: candidates.length,
      targetCount: candidates.length,
      skippedCount: candidates.filter(({ upload }) => !upload).length,
    };
    this.state.set({ ...base, phase: 'migrating', uploadedCount: 0, failedCount: 0 });
    const failed: MigrationCandidate[] = [];
    let uploadedCount = 0;

    for (const [index, candidate] of candidates.entries()) {
      const { solve, upload } = candidate;
      if (this.auth.user()?.uid !== user.uid) {
        failed.push(...candidates.slice(index));
        break;
      }
      try {
        if (this.cube.isCurrentGuestSolve(solve)) {
          if (upload) await this.cloud.put(user.uid, solve);
          await this.cube.assignSolveToAccount(solve, user.uid);
        }
        uploadedCount++;
      } catch {
        failed.push(candidate);
      }
      if (this.auth.user()?.uid === user.uid) {
        this.state.set({ ...base, phase: 'migrating', uploadedCount, failedCount: failed.length });
      }
    }

    if (this.auth.user()?.uid !== user.uid || this.account()?.uid !== user.uid) return;
    this.failedCandidates.set(failed);
    if (failed.length > 0) {
      this.state.set({
        ...base,
        phase: 'partial-failure',
        uploadedCount,
        failedCount: failed.length,
      });
      return;
    }

    const remaining = this.migrationCandidates();
    this.state.set(
      remaining.length === 0
        ? { ...base, phase: 'completed', uploadedCount, failedCount: 0 }
        : {
            phase: 'ready',
            localCount: remaining.length,
            targetCount: remaining.length,
            uploadedCount: 0,
            skippedCount: remaining.filter(({ upload }) => !upload).length,
            failedCount: 0,
          },
    );
  }

  /** Firestore一覧を取得し、現在のguest Solveと組み合わせられるスナップショットとして保持する。 */
  private async inspect(user: AuthenticatedUser, inspectionId: number): Promise<void> {
    this.state.set({ ...INITIAL_STATE, phase: 'checking' });
    try {
      await this.cube.ready;
      const cloud = await this.cloud.list(user.uid);
      if (inspectionId !== this.inspectionId || this.auth.user()?.uid !== user.uid) return;
      this.cloudById.set(new Map(cloud.map((solve) => [solve.id, solve])));
    } catch {
      if (inspectionId !== this.inspectionId) return;
      this.cloudById.set(null);
      this.state.set({ ...INITIAL_STATE, phase: 'check-failure' });
    }
  }

  /** @returns クラウドに存在しないか、ローカルの更新日時が新しい場合はtrue */
  private shouldUpload(local: Solve, cloud: Solve | undefined): boolean {
    if (!cloud) return true;
    return Date.parse(local.updatedAt) > Date.parse(cloud.updatedAt);
  }
}
