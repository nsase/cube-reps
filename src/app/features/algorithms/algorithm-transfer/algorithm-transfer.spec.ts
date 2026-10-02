import { f2lCaseForSlot } from '../../../core/algorithm/algorithm-cases/f2l/f2l-case';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';
import { of, Subject } from 'rxjs';
import { AlgorithmLibraryService } from '../../../core/algorithm/algorithm-library';
import { OLL_CASES, PLL_CASES, F2L_CASES } from '../../../core/algorithm/algorithm-cases';
import { AuthService } from '../../../core/auth/auth.service';
import { AlgorithmSyncService } from '../../../core/firestore/algorithm-sync.service';
import { AlgorithmTransfer } from './algorithm-transfer';
import en from '../../../../../public/assets/i18n/en.json';
import ja from '../../../../../public/assets/i18n/ja.json';

/** 移行先のテストアカウント。 */
const account = { uid: 'alice', email: null, displayName: null, photoURL: null };

describe('AlgorithmTransfer', () => {
  /** ゲスト設定を作成した後にログインして移行操作を表示する。 */
  async function setup(result: string | Subject<string>) {
    const dialog = {
      open: vi.fn(() => ({
        afterClosed: () => (typeof result === 'string' ? of(result) : result),
      })),
    };
    const sync = { refresh: vi.fn(async (_kind: string) => true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: AlgorithmSyncService, useValue: sync },
      ],
    });
    const library = TestBed.inject(AlgorithmLibraryService);
    await library.ready;
    library.add(OLL_CASES[0], 'guest');
    const auth = TestBed.inject(AuthService);
    auth.user.set(account);
    const fixture = TestBed.createComponent(AlgorithmTransfer);
    await fixture.whenStable();
    return { fixture, library, sync, dialog, auth };
  }

  it('確認ボタンを押した後に全種類を取得し、手順を移行して案内を消す', async () => {
    const { fixture, library, sync } = await setup('move');
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(sync.refresh.mock.calls).toEqual([['OLL'], ['PLL'], ['F2L']]);
    expect(library.algorithmsFor(OLL_CASES[0]).at(-1)?.notation).toBe('guest');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('表示だけでは自動移行せず、ボタン確認時に全種類のゲスト設定を移行する', async () => {
    const { fixture, library, sync, auth } = await setup('move');
    auth.user.set(null);
    library.add(PLL_CASES[0], 'PLL guest');
    const f2l = f2lCaseForSlot(F2L_CASES[0], 'BL');
    library.add(f2l, 'F2L guest');
    auth.user.set(account);
    await fixture.whenStable();
    expect(sync.refresh).not.toHaveBeenCalled();
    expect(library.guestPreferences('OLL')).toHaveLength(1);
    expect(library.guestPreferences('PLL')).toHaveLength(1);
    expect(library.guestPreferences('F2L')).toHaveLength(1);
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(library.guestPreferences('OLL')).toHaveLength(0);
    expect(library.guestPreferences('PLL')).toHaveLength(0);
    expect(library.guestPreferences('F2L')).toHaveLength(0);
    expect(library.algorithmsFor(PLL_CASES[0]).at(-1)?.notation).toBe('PLL guest');
    expect(library.algorithmsFor(f2l).at(-1)?.notation).toBe('F2L guest');
  });

  it('キャンセルでは取得も移行も行わない', async () => {
    const { fixture, library, sync } = await setup('cancel');
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(sync.refresh).not.toHaveBeenCalled();
    expect(library.guestPreferences('OLL')).toHaveLength(1);
  });

  it('確認中のアカウント変更では移行しない', async () => {
    const result = new Subject<string>();
    const { fixture, auth, sync } = await setup(result);
    fixture.nativeElement.querySelector('button').click();
    auth.user.set({ ...account, uid: 'bob' });
    result.next('move');
    result.complete();
    await fixture.whenStable();
    expect(sync.refresh).not.toHaveBeenCalled();
  });

  it('取得失敗時はゲスト設定を残して再試行を案内する', async () => {
    const { fixture, library, sync } = await setup('move');
    sync.refresh.mockResolvedValue(false);
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(library.guestPreferences('OLL')).toHaveLength(1);
  });

  it('翻訳キーが両言語に揃い、言語切替で操作ラベルも変わる', async () => {
    expect(Object.keys(en.algorithms.transfer).sort()).toEqual(
      Object.keys(ja.algorithms.transfer).sort(),
    );
    const { fixture } = await setup('cancel');
    expect(fixture.nativeElement.textContent).toContain('Move all guest settings');
    TestBed.inject(TranslocoService).setActiveLang('ja');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('ゲスト設定をすべて移行');
  });
});
