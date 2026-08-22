import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DialogButtons } from './confirm-dialog.buttons';
import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  it('削除確認ではキャンセルへ初期フォーカスを置き、削除選択をtrueで返す', () => {
    const dialog = {
      open: vi.fn(() => ({ afterClosed: () => of(DialogButtons.delete.id) })),
    };
    TestBed.configureTestingModule({ providers: [{ provide: MatDialog, useValue: dialog }] });
    let confirmed: boolean | undefined;

    TestBed.inject(ConfirmService).delete('削除', '削除します。').subscribe((result) => {
      confirmed = result;
    });

    expect(dialog.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: expect.objectContaining({
          buttons: [DialogButtons.cancel, DialogButtons.delete],
          defaultFocus: DialogButtons.cancel.id,
        }),
      }),
    );
    expect(confirmed).toBe(true);
  });
});
