import { computed, inject, Injectable, signal } from '@angular/core';
import { AlgorithmPreference } from '../cube/cube.models';
import { AlgorithmKind, AlgorithmLibraryService } from '../algorithm/algorithm-library';
import { FirestoreAlgorithmRepository } from './firestore-algorithm.repository';
import { SyncController } from './sync-controller';

/** ログイン時は全種類、ページ表示時は対象種類だけを同期する。 */
@Injectable({ providedIn: 'root' })
export class AlgorithmSyncService {
  /** 手順設定のローカル保存と未送信操作。 */
  private readonly library = inject(AlgorithmLibraryService);
  /** クラウドへの種類別アクセス境界。 */
  private readonly cloud = inject(FirestoreAlgorithmRepository);
  /** オンライン復帰時に再取得する、現在表示中の種類。 */
  readonly activeKind = signal<AlgorithmKind | null>(null);
  /** 種類ごとに取得中のリクエストと再送状態を独立して保持する。 */
  private readonly controllers = {
    OLL: this.createController('OLL'),
    PLL: this.createController('PLL'),
    F2L: this.createController('F2L'),
  };
  /** ヘッダーに表示する全種類の同期状態。 */
  readonly phase = computed(() => {
    const phases = Object.values(this.controllers).map((controller) => controller.phase());
    return (
      (['signed-out', 'error', 'offline', 'pending', 'syncing', 'synced'] as const).find((phase) =>
        phases.includes(phase),
      ) ?? 'synced'
    );
  });

  /** ページ表示または移行前に対象種類を更新する。 */
  refresh(kind: AlgorithmKind): Promise<boolean> {
    return this.controllers[kind].refresh();
  }

  /** 失敗した種類だけを再試行する。 */
  async retry(): Promise<void> {
    await Promise.all(
      Object.values(this.controllers)
        .filter((controller) => controller.phase() === 'error')
        .map((controller) => controller.retry()),
    );
  }

  /** 同じケースの古い失敗操作より、保存済みの最新の編集を優先する。 */
  private async uploadLatest(userId: string, preference: AlgorithmPreference): Promise<void> {
    if (this.library.needsUpload(preference)) await this.cloud.put(userId, preference);
  }

  /** 取得範囲以外は既存の認証・永続再送の制御を共用する。 */
  private createController(kind: AlgorithmKind) {
    return new SyncController({
      mutations: this.library.mutations[kind],
      record: (preference) => preference,
      beforePull: async () => {
        await this.library.ready;
        return true;
      },
      retryOnReconnect: true,
      pullOnReconnect: () => this.activeKind() === kind,
      cloud: {
        list: (userId) => this.cloud.list(userId, kind),
        put: (userId, preference) => this.uploadLatest(userId, preference),
        tombstone: (userId, preference) => this.uploadLatest(userId, preference),
      },
      merge: (preferences) => this.library.merge(preferences),
      acknowledge: (preference) => this.library.acknowledge(preference),
    });
  }
}
