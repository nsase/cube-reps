import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter, map } from 'rxjs';
import { FirestoreSyncService } from './core/firestore/firestore-sync.service';
import { LocalSyncService } from './core/local/local-sync.service';
import { SettingsStore } from './core/settings.store';
import { Nav } from './nav';
import { AppUpdate } from './shared/app-update/app-update';
import { AuthControls } from './shared/auth-controls/auth-controls';
import { SyncStatus } from './shared/sync-status/sync-status';

/** 共通レイアウトとルーターOutletを表示するルートコンポーネント。 */
@Component({
  selector: 'app-root',
  imports: [AppUpdate, AuthControls, SyncStatus, RouterLink, RouterOutlet, TranslocoPipe, Nav],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** 現在のルートとナビゲーションイベントを提供するサービス。 */
  private readonly router = inject(Router);
  /** アプリ起動時に端末設定を復元するStore。 */
  private readonly settings = inject(SettingsStore);
  /** 変更をIndexedDBへ保存するための同期サービス */
  protected readonly localSync = inject(LocalSyncService);
  /** 変更をFirestoreへ保存するための同期サービス */
  protected readonly firestoreSync = inject(FirestoreSyncService);

  /** アクティブな末端ルートのdataに定義された画面見出しの翻訳キー。 */
  protected readonly headingKey = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) route = route.firstChild;
        return (route.data['titleKey'] as string | undefined) ?? '';
      }),
    ),
    { initialValue: '' },
  );
}
