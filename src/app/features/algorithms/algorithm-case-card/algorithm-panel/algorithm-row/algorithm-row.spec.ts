import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PLL_CASES } from '../../../../../core/algorithm-cases';
import { AlgorithmLibraryService } from '../../../../../core/algorithm-library';
import { ConfirmService } from '../../../../../shared/confirm-dialog/confirm.service';
import { AlgorithmRow } from './algorithm-row';

describe('AlgorithmRow', () => {
  /** 削除確認済みを返すConfirmServiceのテスト用代替。 */
  const confirm = {
    delete: vi.fn(() => of(true)),
  };

  beforeEach(async () => {
    localStorage.clear();
    confirm.delete.mockClear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AlgorithmRow],
      providers: [{ provide: ConfirmService, useValue: confirm }],
    }).compileComponents();
  });

  it('スターボタンで表示中の手順をお気に入りに設定する', async () => {
    const item = PLL_CASES[0];
    const library = TestBed.inject(AlgorithmLibraryService);
    const algorithm = library.algorithmsFor(item)[1];
    const fixture = TestBed.createComponent(AlgorithmRow);
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('algorithm', algorithm);
    fixture.componentRef.setInput('rank', 2);
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.star') as HTMLButtonElement).click();

    expect(library.favoriteFor(item)?.id).toBe(algorithm.id);
  });

  it('組み込み手順では削除ボタンを表示しない', async () => {
    const item = PLL_CASES[0];
    const library = TestBed.inject(AlgorithmLibraryService);
    const fixture = TestBed.createComponent(AlgorithmRow);
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('algorithm', library.algorithmsFor(item)[0]);
    fixture.componentRef.setInput('rank', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.remove')).toBeNull();
  });

  it('削除確認後にユーザー登録手順を削除する', async () => {
    const item = PLL_CASES[0];
    const library = TestBed.inject(AlgorithmLibraryService);
    library.add(item, 'custom algorithm');
    const algorithm = library.algorithmsFor(item).at(-1)!;
    const fixture = TestBed.createComponent(AlgorithmRow);
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('algorithm', algorithm);
    fixture.componentRef.setInput('rank', library.algorithmsFor(item).length);
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.remove') as HTMLButtonElement).click();

    expect(confirm.delete).toHaveBeenCalledOnce();
    expect(library.algorithmsFor(item).some(({ id }) => id === algorithm.id)).toBe(false);
  });
});
