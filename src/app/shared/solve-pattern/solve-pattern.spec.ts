import { TestBed } from '@angular/core/testing';
import { SolveCategory } from '../../core/cube.models';
import { SolvePattern } from './solve-pattern';

describe('SolvePattern', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SolvePattern] }).compileComponents();
  });

  /** 指定カテゴリーの表示コンポーネントを作成する。 */
  function createFixture(category: SolveCategory) {
    const fixture = TestBed.createComponent(SolvePattern);
    fixture.componentRef.setInput('category', category);
    fixture.componentRef.setInput('scramble', '');
    fixture.detectChanges();
    return fixture;
  }

  it('FULL SOLVEでは6面展開図を表示する', () => {
    const fixture = createFixture('full');

    expect(fixture.nativeElement.querySelector('app-cube-net')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-cube-pattern')).toBeFalsy();
  });

  it('OLLでは黄色方向だけの上段パターンを表示する', () => {
    const fixture = createFixture('oll');
    const sideSticker = fixture.nativeElement.querySelector(
      'app-cube-pattern [data-x="1"][data-y="0"]',
    ) as HTMLElement;

    expect(fixture.nativeElement.querySelector('app-cube-net')).toBeFalsy();
    expect(sideSticker.dataset['color']).toBe('none');
  });

  it('PLLでは側面色を含む上段パターンを表示する', () => {
    const fixture = createFixture('pll');
    const sideSticker = fixture.nativeElement.querySelector(
      'app-cube-pattern [data-x="1"][data-y="0"]',
    ) as HTMLElement;

    expect(sideSticker.dataset['color']).toBe('blue');
  });
});
