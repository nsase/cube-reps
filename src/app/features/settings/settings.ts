import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageSettings } from './language-settings/language-settings';
import { UpdateSettings } from './update-settings/update-settings';

/** アプリ共通設定の各操作欄を構成する画面。 */
@Component({
  selector: 'app-settings',
  imports: [LanguageSettings, UpdateSettings],
  template: '<app-language-settings /><app-update-settings />',
  styles: `
    :host {
      display: grid;
      gap: 24px;
      max-width: 1120px;
      margin: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {}
