import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { AppUpdateService, RELOAD_PAGE } from './app-update.service';

describe('AppUpdateService', () => {
  let versionUpdates: Subject<VersionEvent>;
  const activateUpdate = vi.fn().mockResolvedValue(true);
  const reloadPage = vi.fn();

  beforeEach(() => {
    versionUpdates = new Subject<VersionEvent>();
    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates, activateUpdate } },
        { provide: RELOAD_PAGE, useValue: reloadPage },
      ],
    });
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
  });

  it('ユーザー操作で新版を有効化してから再読み込みする', async () => {
    const service = TestBed.inject(AppUpdateService);
    await service.applyUpdate();
    expect(activateUpdate).toHaveBeenCalledOnce();
    expect(reloadPage).toHaveBeenCalledOnce();
  });
});
