import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SettingsStore } from '../../../core/settings.store';

/** 端末に保存する表示言語の選択欄。 */
@Component({
  selector: 'app-language-settings',
  imports: [TranslocoPipe],
  templateUrl: './language-settings.html',
  styleUrl: './language-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSettings {
  /** 全画面で共有する表示設定。 */
  protected readonly settings = inject(SettingsStore);
}
