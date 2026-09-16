import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { App } from '@capacitor/app';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { AppUpdateService } from '../app-update.service';
import { NativeAppService } from './native-app.service';
import { IS_NATIVE_APP } from './native-platform';

vi.mock('@capacitor/app', () => ({ App: { addListener: vi.fn(), minimizeApp: vi.fn() } }));
vi.mock('@capacitor-community/keep-awake', () => ({
  KeepAwake: { keepAwake: vi.fn(), allowSleep: vi.fn() },
}));

describe('NativeAppService', () => {
  let back: (event: { canGoBack: boolean }) => void;
  const showNotices = signal(true);
  const goBack = vi.fn();
  const remove = vi.fn();
  const openDialogs: { close: () => void; disableClose?: boolean }[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    showNotices.set(true);
    openDialogs.length = 0;
    vi.mocked(App.addListener).mockImplementation((_event: unknown, handler: unknown) => {
      back = handler as typeof back;
      return Promise.resolve({ remove });
    });
    vi.mocked(KeepAwake.keepAwake).mockResolvedValue();
    vi.mocked(KeepAwake.allowSleep).mockResolvedValue();
    // rootサービスが参照する環境判定も置き換え、Node.jsの実行環境によらず端末操作を検証する。
    TestBed.overrideProvider(IS_NATIVE_APP, { useValue: true });
    TestBed.configureTestingModule({
      providers: [
        { provide: Location, useValue: { back: goBack } },
        { provide: MatDialog, useValue: { openDialogs } },
        { provide: AppUpdateService, useValue: { showNonEssentialNotices: showNotices } },
      ],
    });
  });

  it('計測中は戻る操作を無視し、通常時は履歴へ戻り、履歴がなければ最小化する', () => {
    TestBed.inject(NativeAppService);
    showNotices.set(false);
    back({ canGoBack: true });
    back({ canGoBack: false });
    expect(goBack).not.toHaveBeenCalled();
    expect(App.minimizeApp).not.toHaveBeenCalled();
    showNotices.set(true);
    back({ canGoBack: true });
    expect(goBack).toHaveBeenCalledOnce();
    back({ canGoBack: false });
    expect(App.minimizeApp).toHaveBeenCalledOnce();
  });

  it('戻る操作は最前面の確認をキャンセルし、画面の履歴は変更しない', () => {
    const close = vi.fn();
    openDialogs.push({ close });
    TestBed.inject(NativeAppService);
    back({ canGoBack: true });
    expect(close).toHaveBeenCalledWith();
    expect(goBack).not.toHaveBeenCalled();
    openDialogs[0].disableClose = true;
    back({ canGoBack: true });
    expect(close).toHaveBeenCalledOnce();
  });

  it('開始要求が遅れて完了しても、停止時の消灯許可をその後に適用する', async () => {
    let finish!: () => void;
    vi.mocked(KeepAwake.keepAwake).mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const service = TestBed.inject(NativeAppService);
    service.setKeepAwake(true);
    service.setKeepAwake(false);
    await Promise.resolve();
    expect(KeepAwake.allowSleep).not.toHaveBeenCalled();
    finish();
    await vi.waitFor(() => expect(KeepAwake.allowSleep).toHaveBeenCalledOnce());
  });

  it('端末APIに失敗しても次の開始要求を処理できる', async () => {
    vi.mocked(KeepAwake.keepAwake).mockRejectedValueOnce(new Error('unavailable'));
    const service = TestBed.inject(NativeAppService);
    service.setKeepAwake(true);
    service.setKeepAwake(false);
    service.setKeepAwake(true);
    await vi.waitFor(() => expect(KeepAwake.keepAwake).toHaveBeenCalledTimes(2));
  });

  it('破棄時に戻る操作の購読と画面消灯防止を解除する', async () => {
    TestBed.inject(NativeAppService);
    TestBed.resetTestingModule();
    await vi.waitFor(() => expect(remove).toHaveBeenCalledOnce());
    expect(KeepAwake.allowSleep).toHaveBeenCalled();
  });

  it('Web版ではネイティブAPIを呼び出さない', () => {
    TestBed.overrideProvider(IS_NATIVE_APP, { useValue: false });
    const service = TestBed.inject(NativeAppService);
    service.setKeepAwake(true);
    expect(App.addListener).not.toHaveBeenCalled();
    expect(KeepAwake.keepAwake).not.toHaveBeenCalled();
  });
});
