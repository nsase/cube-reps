import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';

/** 静的配信されたJSONから言語ごとの翻訳辞書を読み込むローダー。 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  /** 翻訳JSONを取得するHTTPクライアント。 */
  private readonly http = inject(HttpClient);

  /**
   * 指定言語の翻訳辞書を読み込む。
   *
   * @param lang 読み込む言語コード
   * @returns 翻訳辞書の取得結果
   */
  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`assets/i18n/${lang}.json`);
  }
}
