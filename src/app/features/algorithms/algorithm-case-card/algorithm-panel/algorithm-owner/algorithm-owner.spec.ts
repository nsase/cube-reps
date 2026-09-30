import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { AlgorithmOwner } from './algorithm-owner';
import en from '../../../../../../../public/assets/i18n/en.json';
import ja from '../../../../../../../public/assets/i18n/ja.json';

describe('AlgorithmOwner', () => {
  it('組み込みアイコンの読み上げラベルが言語切替に追従する', async () => {
    expect(en.algorithms.builtIn).toBeTruthy();
    expect(ja.algorithms.builtIn).toBeTruthy();
    const fixture = TestBed.createComponent(AlgorithmOwner);
    fixture.componentRef.setInput('algorithm', { id: 'builtin', notation: 'R U', builtIn: true });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      'Built-in algorithm',
    );
    TestBed.inject(TranslocoService).setActiveLang('ja');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      '組み込み手順',
    );
  });
});
