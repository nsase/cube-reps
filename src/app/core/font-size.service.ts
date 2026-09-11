import { effect, Injectable, signal } from '@angular/core';

/** フォントサイズを管理するサービス */
@Injectable({ providedIn: 'root' })
export class FontSizeService {
  /** アプリ全体の基準となる文字サイズをピクセル単位で保持する。 */
  fontSize = signal(16);

  /** 基準サイズの変更を共通の文字サイズ変数へ反映する。 */
  fontSizeChanged = effect(() =>
    document.documentElement.style.setProperty('--font-size-base', `${this.fontSize()}px`),
  );
}
