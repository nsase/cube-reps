import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { Capacitor } from '@capacitor/core';
import { provideTransloco } from '@jsverse/transloco';

import { MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS } from '@angular/material/button-toggle';
import { routes } from './app.routes';
import { AuthGateway, FirebaseAuthGateway } from './core/auth/auth.gateway';
import { FirestoreSyncService } from './core/firestore/firestore-sync.service';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { LocalSyncService } from './core/local-storage/local-sync.service';
import {
  IndexedDbUserDataRepository,
  UserDataRepository,
} from './core/local-storage/user-data-repository';

/** ルーター、エラーハンドリング、Materialの共通設定、オフライン更新を構成するアプリケーション設定。 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes, withHashLocation()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && !Capacitor.isNativePlatform(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
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
      provide: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
      useValue: {
        hideSingleSelectionIndicator: true,
        hideMultipleSelectionIndicator: true,
      },
    },
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: { fontSet: 'material-symbols-outlined' },
    },
    {
      provide: MAT_CARD_CONFIG,
      useValue: { appearance: 'outlined' },
    },
    LocalSyncService,
    FirestoreSyncService,
  ],
};
