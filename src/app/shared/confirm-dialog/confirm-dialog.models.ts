import { ThemePalette } from '@angular/material/core';

export interface ConfirmDialogButton<TId extends string = string> {
  readonly id: TId;
  readonly label: string;
  readonly color?: ThemePalette;
}

export interface ConfirmDialogData<TId extends string = string> {
  readonly title?: string;
  readonly message: string;
  readonly buttons: readonly ConfirmDialogButton<TId>[];
  readonly defaultFocus?: TId;
}

export type ConfirmDialogResult<TId extends string = string> = TId | undefined;
