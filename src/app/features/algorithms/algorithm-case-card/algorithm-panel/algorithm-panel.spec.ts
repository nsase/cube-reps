import { TestBed } from '@angular/core/testing';
import { PLL_CASES } from '../../../../core/algorithm-cases';
import { AlgorithmLibraryService } from '../../../../core/algorithm-library';
import { AlgorithmPanel } from './algorithm-panel';

describe('AlgorithmPanel', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [AlgorithmPanel] }).compileComponents();
  });

  it('登録済み手順を行コンポーネントとして描画する', async () => {
    const fixture = TestBed.createComponent(AlgorithmPanel);
    fixture.componentRef.setInput('item', PLL_CASES[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-row')).toHaveLength(
      PLL_CASES[0].algorithms.length,
    );
  });

  it('入力したユーザー手順を追加し、入力欄を空にする', async () => {
    const fixture = TestBed.createComponent(AlgorithmPanel);
    fixture.componentRef.setInput('item', PLL_CASES[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'custom algorithm';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const library = TestBed.inject(AlgorithmLibraryService);
    expect(library.algorithmsFor(PLL_CASES[0]).at(-1)?.notation).toBe('custom algorithm');
    expect(input.value).toBe('');
  });
});
