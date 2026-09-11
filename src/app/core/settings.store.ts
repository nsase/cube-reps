import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

/** アプリ共通の端末設定と、その保存・復元を管理するStore。 */
@Injectable({ providedIn: 'root' })
export class SettingsStore {
  /** 翻訳辞書と表示言語を管理するサービス。 */
  private readonly i18n = inject(TranslocoService);
  /** 表示言語を支援技術へ伝えるための文書。 */
  private readonly document = inject(DOCUMENT);
  /** 現在の表示言語。翻訳サービスの変更にも追従する。 */
  readonly language = toSignal(this.i18n.langChanges$, { initialValue: 'en' });

  /** 既存の保存キーを引き継ぎ、アプリ起動時に表示言語を復元する。 */
  constructor() {
    const saved = localStorage.getItem('cube-reps.language');
    this.setLanguage(saved === 'ja' ? 'ja' : 'en');
  }

  /** 表示言語を変更し、このブラウザでの次回起動に備えて保存する。
   * @param language 選択された言語コード
   */
  setLanguage(language: string): void {
    if (language !== 'en' && language !== 'ja') return;
    this.i18n.setActiveLang(language);
    this.document.documentElement.lang = language;
    localStorage.setItem('cube-reps.language', language);
  }
}
