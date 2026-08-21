import { importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from '../public/assets/i18n/en.json';
import ja from '../public/assets/i18n/ja.json';

/** コンポーネントテストでHTTP通信せず利用する翻訳プロバイダー。 */
export default [
  importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { ja, en },
      translocoConfig: {
        availableLangs: ['ja', 'en'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
      },
      preloadLangs: true,
    }),
  ),
];
