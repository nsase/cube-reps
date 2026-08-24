import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { CubeService } from '../../../../core/cube';
import { ConfirmService } from '../../../../shared/confirm-dialog/confirm.service';
import { SolveActions } from './solve-actions';

describe('SolveActions', () => {
  /** 削除確認済みを返すConfirmServiceのテスト用代替。 */
  const confirm = { delete: vi.fn(() => of(true)) };

  beforeEach(async () => {
    localStorage.clear();
    confirm.delete.mockClear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SolveActions],
      providers: [provideRouter([]), { provide: ConfirmService, useValue: confirm }],
    }).compileComponents();
  });

  /** 計測記録を作成して操作コンポーネントへ設定する。 */
  function createFixture() {
    const cube = TestBed.inject(CubeService);
    cube.addSolve(1234, 'R U', 'full');
    const solve = cube.solves()[0];
    const fixture = TestBed.createComponent(SolveActions);
    fixture.componentRef.setInput('solve', solve);
    fixture.detectChanges();
    return { cube, fixture, solve };
  }

  it('+2とDNFの適用と解除を切り替える', () => {
    const { cube, fixture, solve } = createFixture();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;

    buttons[0].click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('+2');
    buttons[0].click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('none');
    buttons[1].click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('DNF');
    buttons[1].click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('none');
  });

  it('リトライ対象を設定してタイマー画面へ移動する', () => {
    const { cube, fixture, solve } = createFixture();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const retried = vi.fn();
    fixture.componentInstance.retried.subscribe(retried);

    (fixture.nativeElement.querySelector('.row-retry') as HTMLButtonElement).click();

    expect(cube.takeRetrySolve()).toEqual(solve);
    expect(retried).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/timer']);
  });

  it('削除確認後に計測記録を削除して完了を通知する', () => {
    const { cube, fixture, solve } = createFixture();
    const deleted = vi.fn();
    fixture.componentInstance.deleted.subscribe(deleted);

    (fixture.nativeElement.querySelector('.row-delete') as HTMLButtonElement).click();

    expect(confirm.delete).toHaveBeenCalledOnce();
    expect(cube.solves().some(({ id }) => id === solve.id)).toBe(false);
    expect(deleted).toHaveBeenCalledOnce();
  });
});
