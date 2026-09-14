import { TestBed } from '@angular/core/testing';
import { WorkerUpdates, WORKER_ENABLED } from './worker-updates.service';

/** SWのライフサイクルを、ネットワークなしでテスト用に進める。 */
class TestWorker extends EventTarget {
  /** テストが制御するSWの状態。 */
  state: ServiceWorkerState = 'installing';
  /** 有効化要求の送信を検証する。 */
  postMessage = vi.fn(() => this.change('activated'));
  /** 状態変化をブラウザと同じイベントで通知する。 */
  change(state: ServiceWorkerState): void {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
}

describe('WorkerUpdates', () => {
  let online: boolean;
  let registration: EventTarget & {
    active: TestWorker | null;
    installing: TestWorker | null;
    waiting: TestWorker | null;
    update: ReturnType<typeof vi.fn>;
  };
  const getRegistration = vi.fn();
  const register = vi.fn();

  beforeEach(() => {
    online = true;
    registration = Object.assign(new EventTarget(), {
      active: null,
      installing: null,
      waiting: null,
      update: vi.fn().mockResolvedValue(undefined),
    });
    getRegistration.mockReset().mockResolvedValue(registration);
    register.mockReset().mockResolvedValue(registration);
    vi.stubGlobal('navigator', {
      get onLine() {
        return online;
      },
      serviceWorker: { getRegistration, register },
    });
    TestBed.configureTestingModule({
      providers: [{ provide: WORKER_ENABLED, useValue: true }, WorkerUpdates],
    });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('オフライン起動では登録・更新せず、オンライン復帰で確認する', async () => {
    online = false;
    const service = TestBed.inject(WorkerUpdates);
    service.start();
    await Promise.resolve();
    expect(register).not.toHaveBeenCalled();
    expect(registration.update).not.toHaveBeenCalled();
    await expect(service.checkForUpdate()).rejects.toThrow('Offline');
    online = true;
    window.dispatchEvent(new Event('online'));
    await service.checkForUpdate();
    expect(registration.update).toHaveBeenCalledOnce();
  });

  it('初回はSWを登録し、重複した更新を要求しない', async () => {
    getRegistration.mockResolvedValue(undefined);
    const service = TestBed.inject(WorkerUpdates);
    await Promise.all([service.checkForUpdate(), service.checkForUpdate()]);
    expect(register).toHaveBeenCalledOnce();
    expect(register.mock.calls[0][0]).toMatch(/\/ngsw-worker\.js$/);
    expect(registration.update).not.toHaveBeenCalled();
  });

  it('登録を参照している間にオフラインになった場合も通信しない', async () => {
    getRegistration.mockImplementation(async () => {
      online = false;
      return registration;
    });
    await expect(TestBed.inject(WorkerUpdates).checkForUpdate()).rejects.toThrow('Offline');
    expect(registration.update).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
  });

  it('新版の取得完了を待ち、同じ待機中SWを再通知しない', async () => {
    const worker = new TestWorker();
    registration.update.mockImplementation(async () => {
      registration.installing = worker;
    });
    const service = TestBed.inject(WorkerUpdates);
    const events: string[] = [];
    service.versionUpdates.subscribe((event) => events.push(event.type));
    const pending = service.checkForUpdate();
    await vi.waitFor(() => expect(registration.update).toHaveBeenCalledOnce());
    expect(events).not.toContain('VERSION_READY');
    registration.waiting = worker;
    registration.installing = null;
    worker.change('installed');
    expect(await pending).toBe(true);
    await service.checkForUpdate();
    expect(events.filter((event) => event === 'VERSION_READY')).toHaveLength(1);
    await service.activateUpdate();
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('通知した新版が別ウィンドウで適用済みでも画面を再読み込みできる', async () => {
    const worker = new TestWorker();
    worker.change('installed');
    registration.waiting = worker;
    const service = TestBed.inject(WorkerUpdates);
    await service.checkForUpdate();
    registration.waiting = null;
    registration.active = worker;
    worker.change('activated');
    await expect(service.activateUpdate()).resolves.toBe(true);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it('別ウィンドウで有効化中の新版は完了を待ってから切り替える', async () => {
    const worker = new TestWorker();
    worker.change('installed');
    registration.waiting = worker;
    const service = TestBed.inject(WorkerUpdates);
    await service.checkForUpdate();
    registration.waiting = null;
    registration.active = worker;
    worker.change('activating');
    let finished = false;
    const applying = service.activateUpdate().then(() => {
      finished = true;
    });
    await Promise.resolve();
    expect(finished).toBe(false);
    worker.change('activated');
    await applying;
    expect(finished).toBe(true);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it('通知した新版がなければ旧版を更新済みと扱わない', async () => {
    const worker = new TestWorker();
    worker.change('activated');
    registration.active = worker;
    await expect(TestBed.inject(WorkerUpdates).activateUpdate()).rejects.toThrow(
      'No waiting worker',
    );
  });

  it('更新取得に失敗しても次回の確認で回復する', async () => {
    registration.update.mockRejectedValueOnce(new Error('Network'));
    const service = TestBed.inject(WorkerUpdates);
    const events: string[] = [];
    service.versionUpdates.subscribe((event) => events.push(event.type));
    await expect(service.checkForUpdate()).rejects.toThrow('Network');
    expect(await service.checkForUpdate()).toBe(false);
    expect(events).toEqual(['VERSION_INSTALLATION_FAILED', 'NO_NEW_VERSION_DETECTED']);
  });

  it('インストールが失敗した新版を利用可能と通知しない', async () => {
    const worker = new TestWorker();
    registration.installing = worker;
    const pending = TestBed.inject(WorkerUpdates).checkForUpdate();
    const rejected = expect(pending).rejects.toThrow('Worker installation failed');
    await vi.waitFor(() => expect(registration.update).toHaveBeenCalledOnce());
    worker.change('redundant');
    await rejected;
  });
});
