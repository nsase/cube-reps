import { ThemePalette } from '@angular/material/core';

/** 確認ダイアログに表示する1つの操作ボタン。 */
export interface ConfirmDialogButton<TId extends string = string> {
  /** ダイアログの戻り値として使用する操作ID。 */
  readonly id: TId;
  /** ボタンに表示するラベル。 */
  readonly label: string;
  /** Angular Materialのテーマ色。 */
  readonly color?: ThemePalette;
}

/** 確認ダイアログへ渡す表示データ。 */
export interface ConfirmDialogData<TId extends string = string> {
  /** 任意のダイアログタイトル。 */
  readonly title?: string;
  /** 確認対象を説明する本文。 */
  readonly message: string;
  /** 表示順に並べた操作ボタン。 */
  readonly buttons: readonly ConfirmDialogButton<TId>[];
  /** 初期フォーカスを設定するボタンID。 */
  readonly defaultFocus?: TId;
}

/** 押されたボタンID。Escapeや背景クリックで閉じた場合は`undefined`。 */
export type ConfirmDialogResult<TId extends string = string> = TId | undefined;
