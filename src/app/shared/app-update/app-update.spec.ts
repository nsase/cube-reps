import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NEVER } from 'rxjs';
import { AppUpdateService } from '../../core/app-update.service';
import { AppUpdateSnackbar } from '../app-update-snackbar/app-update-snackbar';
import { AppUpdate } from './app-update';

describe('AppUpdate', () => {
  const dismiss = vi.fn();
  const snackBarRef = { dismiss, afterDismissed: () => NEVER };
  const openFromComponent = vi.fn().mockReturnValue(snackBarRef);
  let fixture: ComponentFixture<AppUpdate>;
  let updates: AppUpdateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppUpdate],
      providers: [{ provide: MatSnackBar, useValue: { openFromComponent } }],
    }).compileComponents();
    fixture = TestBed.createComponent(AppUpdate);
    updates = TestBed.inject(AppUpdateService);
    openFromComponent.mockClear();
    dismiss.mockClear();
  });

  it('新版の取得完了時に自動では消えないSnack Barを表示する', () => {
    fixture.detectChanges();
    updates.updateAvailable.set(true);
    TestBed.flushEffects();

    expect(openFromComponent).toHaveBeenCalledWith(
      AppUpdateSnackbar,
      expect.objectContaining({ duration: undefined }),
    );
  });

  it('タイマー計測中はSnack Barを一時的に閉じる', () => {
    fixture.detectChanges();
    updates.updateAvailable.set(true);
    TestBed.flushEffects();
    updates.setNotificationSuppressed(true);
    TestBed.flushEffects();

    expect(dismiss).toHaveBeenCalledOnce();
  });
});
