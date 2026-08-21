import { ConfirmDialogButton } from './confirm-dialog.models';

/** アプリ全体で再利用する標準ダイアログボタン。 */
export const DialogButtons = {
  ok: { id: 'ok', label: 'OK', color: 'primary' },
  cancel: { id: 'cancel', label: 'キャンセル' },
  yes: { id: 'yes', label: 'はい', color: 'primary' },
  no: { id: 'no', label: 'いいえ' },
  delete: { id: 'delete', label: '削除', color: 'warn' },
} as const satisfies Record<string, ConfirmDialogButton>;
