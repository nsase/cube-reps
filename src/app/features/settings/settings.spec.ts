import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { AppUpdateService, RELOAD_PAGE } from '../../core/app-update.service';
import { Settings } from './settings';
import en from '../../../../public/assets/i18n/en.json';
import ja from '../../../../public/assets/i18n/ja.json';

describe('Settings', () => {
  let events: Subject<VersionEvent>;
  const checkForUpdate = vi.fn();
  const activateUpdate = vi.fn();
  const reload = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    events = new Subject<VersionEvent>();
    checkForUpdate.mockReset();
    activateUpdate.mockReset().mockResolvedValue(true);
    reload.mockClear();
    TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        {
          provide: SwUpdate,
          useValue: { isEnabled: true, versionUpdates: events, checkForUpdate, activateUpdate },
        },
        { provide: RELOAD_PAGE, useValue: reload },
      ],
    });
  });

  it('言語操作で設定内の文言を切り替え、両辞書に全設定キーが存在する', async () => {
    expect(Object.keys(en.settings).sort()).toEqual(Object.keys(ja.settings).sort());
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(fixture.nativeElement.textContent).toContain(en.settings.updateTitle);
    select.value = 'ja';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(ja.settings.updateTitle);
    expect(fixture.nativeElement.textContent).toContain(ja.settings.idle);
    expect(localStorage.getItem('cube-reps.language')).toBe('ja');
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(en.settings.updateTitle);
  });

  it('確認中のボタンを無効にし、失敗から再試行して最新版を表示する', async () => {
    let fail!: (error: Error) => void;
    checkForUpdate.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          fail = reject;
        }),
    );
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector(
      '[data-testid="check-update"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(en.settings.checking);
    fail(new Error('network'));
    await Promise.resolve();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(en.settings.failed);
    expect(button.disabled).toBe(false);
    checkForUpdate.mockImplementation(async () => {
      events.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash: 'current' } });
      return false;
    });
    button.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(en.settings.latest);
  });

  it('閉じた更新通知の新版を適用でき、適用失敗後も再試行できる', async () => {
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    const service = TestBed.inject(AppUpdateService);
    events.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'current' },
      latestVersion: { hash: 'next' },
    });
    service.dismissUpdate();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(en.settings.available);
    activateUpdate.mockRejectedValueOnce(new Error('activation'));
    const apply = fixture.nativeElement.querySelector(
      '[data-testid="apply-update"]',
    ) as HTMLButtonElement;
    apply.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      en.settings.applyFailed,
    );
    expect(reload).not.toHaveBeenCalled();
    apply.click();
    await fixture.whenStable();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('未対応環境では理由を表示し更新操作を表示しない', async () => {
    TestBed.overrideProvider(SwUpdate, { useValue: { isEnabled: false } });
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(en.settings.unsupported);
    expect(fixture.nativeElement.querySelector('[data-testid="check-update"]')).toBeNull();
  });
});
