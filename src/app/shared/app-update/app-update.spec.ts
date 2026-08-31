import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppUpdateService } from '../../core/app-update.service';
import { AppUpdate } from './app-update';

describe('AppUpdate', () => {
  let fixture: ComponentFixture<AppUpdate>;
  let updates: AppUpdateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppUpdate] }).compileComponents();
    fixture = TestBed.createComponent(AppUpdate);
    updates = TestBed.inject(AppUpdateService);
  });

  it('新版の取得完了時に更新操作を表示する', () => {
    updates.updateAvailable.set(true);
    fixture.detectChanges();
    const notice = fixture.nativeElement.querySelector('[data-testid="update-notice"]');
    expect(notice?.textContent).toContain('A new version of CubeReps is ready.');
    expect(notice?.querySelector('button')?.textContent).toContain('Update now');
  });

  it('タイマー計測中など通知を抑止する状態では表示しない', () => {
    updates.updateAvailable.set(true);
    updates.setNotificationSuppressed(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="update-notice"]')).toBeNull();

    updates.setNotificationSuppressed(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="update-notice"]')).toBeTruthy();
  });

  it('更新ボタンで新版の適用を開始する', () => {
    const applyUpdate = vi.spyOn(updates, 'applyUpdate').mockResolvedValue();
    updates.updateAvailable.set(true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(applyUpdate).toHaveBeenCalledOnce();
  });
});
