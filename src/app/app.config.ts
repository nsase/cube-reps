import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { provideRouter, withHashLocation } from '@angular/router';
import { WorkerUpdates } from './core/worker-updates.service';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { AuthGateway, FirebaseAuthGateway } from './core/auth/auth.gateway';
import { FirestoreSyncService } from './core/firestore/firestore-sync.service';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { LocalSyncService } from './core/local-storage/local-sync.service';
import {
  IndexedDbUserDataRepository,
  UserDataRepository,
} from './core/local-storage/user-data-repository';

/** ルーター、エラーハンドリング、Material Icon、オフライン更新を構成するアプリケーション設定。 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes, withHashLocation()),
    provideAppInitializer(() => inject(WorkerUpdates).start()),
    provideTransloco({
      config: {
        availableLangs: ['ja', 'en'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: AuthGateway, useExisting: FirebaseAuthGateway },
    { provide: UserDataRepository, useClass: IndexedDbUserDataRepository },
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: { fontSet: 'material-symbols-outlined' },
    },
    LocalSyncService,
    FirestoreSyncService,
  ],
};
