import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PLL_CASES } from '../../core/algorithm/algorithm-cases';
import { topLayerPatternFromScramble } from '../../core/cube/cube-state';
import { routes } from '../../app.routes';
import { Algorithms } from './algorithms';

describe('Algorithms', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [Algorithms],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  /** viewport到達前は操作部品を生成せず、到達したカードだけ表示する。 */
  it('未表示カードの領域を確保し、必要なカードだけ描画する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.case-slot')).toHaveLength(21);
    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(0);
    const blocks = await fixture.getDeferBlocks();
    await blocks[0].render(DeferBlockState.Complete);
    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(1);
    expect(fixture.nativeElement.querySelectorAll('.case-placeholder')).toHaveLength(20);
  });

  it('ルートデータに対応するPLLケースを表示する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    fixture.detectChanges();
    await fixture.whenStable();
    for (const block of await fixture.getDeferBlocks())
      await block.render(DeferBlockState.Complete);

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(21);
    expect(fixture.nativeElement.querySelectorAll('app-cube-pattern')).toHaveLength(21);
    expect(fixture.nativeElement.querySelector('app-cube-quarter-view')).toBeNull();
  });

  it('PLL一覧の認識図をケースのSetupから生成する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    fixture.detectChanges();
    await fixture.whenStable();
    for (const block of await fixture.getDeferBlocks())
      await block.render(DeferBlockState.Complete);
    const expected = topLayerPatternFromScramble(PLL_CASES[0].setup);
    const sticker = fixture.nativeElement.querySelector(
      `app-algorithm-case-card app-cube-pattern [data-x="1"][data-y="0"]`,
    ) as HTMLElement;
    expect(sticker.dataset['color']).toBe(expected[0][1]);
  });
  it('検索文字列に一致しない場合は空表示を描画する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    fixture.detectChanges();
    await fixture.whenStable();
    for (const block of await fixture.getDeferBlocks())
      await block.render(DeferBlockState.Complete);

    const input = fixture.nativeElement.querySelector(
      'app-algorithm-tools input',
    ) as HTMLInputElement;
    input.value = '存在しないケース';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    for (const block of await fixture.getDeferBlocks())
      await block.render(DeferBlockState.Complete);

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.empty')?.textContent).toContain(
      'No matching cases.',
    );
  });
});
