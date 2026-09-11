import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { AppUpdateService, RELOAD_PAGE } from './app-update.service';

describe('AppUpdateService', () => {
  let versionUpdates: Subject<VersionEvent>;
  const activateUpdate = vi.fn().mockResolvedValue(true);
  const checkForUpdate = vi.fn();
  const reloadPage = vi.fn();

  beforeEach(() => {
    versionUpdates = new Subject<VersionEvent>();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: { isEnabled: true, versionUpdates, activateUpdate, checkForUpdate },
        },
        { provide: RELOAD_PAGE, useValue: reloadPage },
      ],
    });
    checkForUpdate.mockReset();
    activateUpdate.mockClear();
    reloadPage.mockClear();
  });

  it('新版の取得完了後だけ更新操作を案内する', () => {
    const service = TestBed.inject(AppUpdateService);
    versionUpdates.next({
      type: 'VERSION_DETECTED',
      version: { hash: 'next', appData: undefined },
    });
    expect(service.updateAvailable()).toBe(false);

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'current', appData: undefined },
      latestVersion: { hash: 'next', appData: undefined },
    });
    expect(service.updateAvailable()).toBe(true);

    service.dismissUpdate();
    expect(service.showUpdateNotice()).toBe(false);
    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'next', appData: undefined },
      latestVersion: { hash: 'newer', appData: undefined },
    });
    expect(service.showUpdateNotice()).toBe(true);
  });

  it('ユーザー操作で新版を有効化してから再読み込みする', async () => {
    const service = TestBed.inject(AppUpdateService);
    await service.applyUpdate();
    expect(activateUpdate).toHaveBeenCalledOnce();
    expect(reloadPage).toHaveBeenCalledOnce();
  });
  it('手動確認中の連打を抑止し、取得した新版を保持する', async () => {
    let finish!: (found: boolean) => void;
    checkForUpdate.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    const service = TestBed.inject(AppUpdateService);
    const pending = service.checkForUpdate();
    expect(service.checkState()).toBe('checking');
    await service.checkForUpdate();
    expect(checkForUpdate).toHaveBeenCalledOnce();
    finish(true);
    await pending;
    expect(service.updateAvailable()).toBe(true);
    service.dismissUpdate();
    checkForUpdate.mockImplementation(async () => {
      versionUpdates.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash: 'next' } });
      return false;
    });
    await service.checkForUpdate();
    expect(service.updateAvailable()).toBe(true);
    expect(service.showUpdateNotice()).toBe(false);
  });

  it('確認失敗や通信不能の後も再試行して最新版を確認できる', async () => {
    const service = TestBed.inject(AppUpdateService);
    checkForUpdate.mockRejectedValueOnce(new Error('network'));
    await service.checkForUpdate();
    expect(service.checkState()).toBe('failed');
    checkForUpdate.mockResolvedValueOnce(false);
    await service.checkForUpdate();
    expect(service.checkState()).toBe('failed');
    checkForUpdate.mockImplementation(async () => {
      versionUpdates.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash: 'current' } });
      return false;
    });
    await service.checkForUpdate();
    expect(service.checkState()).toBe('latest');
    expect(service.updateAvailable()).toBe(false);
  });

  it('未対応環境では更新確認を呼び出さない', async () => {
    TestBed.overrideProvider(SwUpdate, { useValue: { isEnabled: false, checkForUpdate } });
    const service = TestBed.inject(AppUpdateService);
    await service.checkForUpdate();
    expect(service.enabled).toBe(false);
    expect(checkForUpdate).not.toHaveBeenCalled();
  });
});
