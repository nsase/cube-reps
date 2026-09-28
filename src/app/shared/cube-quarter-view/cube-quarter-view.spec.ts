import { TestBed } from '@angular/core/testing';
import { cubeFacesFromScramble, f2lQuarterPatternFromScramble } from '../../core/cube/cube-state';
import { CubeQuarterView } from './cube-quarter-view';

describe('CubeQuarterView', () => {
  it('3面の27枚を行列順に描画し、前面・右面の下段まで表示する', async () => {
    const fixture = TestBed.createComponent(CubeQuarterView);
    fixture.componentRef.setInput('pattern', cubeFacesFromScramble(''));
    fixture.componentRef.setInput('label', 'F2L 01 quarter view');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.getAttribute('role')).toBe('img');
    expect(element.getAttribute('aria-label')).toBe('F2L 01 quarter view');
    expect(element.querySelectorAll('polygon')).toHaveLength(27);
    for (const [face, color] of [
      ['U', 'yellow'],
      ['F', 'green'],
      ['R', 'orange'],
    ]) {
      const stickers = element.querySelectorAll(`[data-face="${face}"] polygon`);
      expect(stickers).toHaveLength(9);
      expect(Array.from(stickers, (sticker) => sticker.getAttribute('data-color'))).toEqual(
        Array(9).fill(color),
      );
    }
  });

  it('Setup由来の色と灰色の更新を同じSVGに反映する', async () => {
    const fixture = TestBed.createComponent(CubeQuarterView);
    fixture.componentRef.setInput('label', 'F2L');
    fixture.componentRef.setInput('pattern', f2lQuarterPatternFromScramble(''));
    await fixture.whenStable();
    const before = fixture.nativeElement.querySelector('svg');
    const pattern = f2lQuarterPatternFromScramble("R U R' U'");
    fixture.componentRef.setInput('pattern', pattern);
    fixture.componentRef.setInput('label', 'F2L updated');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('svg')).toBe(before);
    for (const face of ['U', 'F', 'R'] as const) {
      const stickers = fixture.nativeElement.querySelectorAll(
        `[data-face="${face}"] polygon`,
      ) as NodeListOf<SVGElement>;
      expect(Array.from(stickers, (sticker) => sticker.dataset['color'])).toEqual(
        pattern[face].flat(),
      );
    }
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('F2L updated');
  });
});
