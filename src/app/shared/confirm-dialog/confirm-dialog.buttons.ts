import { ConfirmDialogButton } from './confirm-dialog.models';

/** アプリ全体で再利用する標準ダイアログボタン。 */
export const DialogButtons = {
  ok: { id: 'ok', labelKey: 'common.ok', color: 'primary' },
  cancel: { id: 'cancel', labelKey: 'common.cancel' },
  yes: { id: 'yes', labelKey: 'common.yes', color: 'primary' },
  no: { id: 'no', labelKey: 'common.no' },
  delete: { id: 'delete', labelKey: 'common.delete', color: 'warn' },
} as const satisfies Record<string, ConfirmDialogButton>;
