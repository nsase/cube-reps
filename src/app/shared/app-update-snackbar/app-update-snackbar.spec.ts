import { TestBed } from '@angular/core/testing';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { AppUpdateService } from '../../core/app-update.service';
import { AppUpdateSnackbar } from './app-update-snackbar';

describe('AppUpdateSnackbar', () => {
  const dismiss = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppUpdateSnackbar],
      providers: [{ provide: MatSnackBarRef, useValue: { dismiss } }],
    }).compileComponents();
    dismiss.mockClear();
  });

  it('更新操作と通知を閉じる操作を表示する', () => {
    const fixture = TestBed.createComponent(AppUpdateSnackbar);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('A new version of CubeReps is ready.');
    expect(fixture.nativeElement.textContent).toContain('Update now');
    expect(fixture.nativeElement.querySelector('[matSnackBarAction]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Dismiss update notification"]'),
    ).toBeTruthy();
  });

  it('閉じる操作後は現在のバージョンを再通知しない', () => {
    const updates = TestBed.inject(AppUpdateService);
    updates.updateAvailable.set(true);
    const fixture = TestBed.createComponent(AppUpdateSnackbar);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[aria-label="Dismiss update notification"]').click();

    expect(updates.showUpdateNotice()).toBe(false);
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('更新操作で待機中の新版を適用する', () => {
    const updates = TestBed.inject(AppUpdateService);
    const applyUpdate = vi.spyOn(updates, 'applyUpdate').mockResolvedValue();
    const fixture = TestBed.createComponent(AppUpdateSnackbar);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button:not([mat-icon-button])').click();

    expect(applyUpdate).toHaveBeenCalledOnce();
  });
});
