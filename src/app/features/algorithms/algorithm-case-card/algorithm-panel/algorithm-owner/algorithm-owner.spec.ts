import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { AlgorithmOwner } from './algorithm-owner';
import en from '../../../../../../../public/assets/i18n/en.json';
import ja from '../../../../../../../public/assets/i18n/ja.json';

describe('AlgorithmOwner', () => {
  it('組み込み手順にはアイコンもラベルも表示しない', async () => {
    expect('builtIn' in en.algorithms).toBe(false);
    expect('builtIn' in ja.algorithms).toBe(false);
    const fixture = TestBed.createComponent(AlgorithmOwner);
    fixture.componentRef.setInput('algorithm', { id: 'builtin', notation: 'R U', builtIn: true });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="img"]')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('ゲストの所有者アイコンは残し、読み上げラベルが言語切替に追従する', async () => {
    const fixture = TestBed.createComponent(AlgorithmOwner);
    fixture.componentRef.setInput('algorithm', {
      id: 'guest',
      notation: 'R U',
      builtIn: false,
      owner: {
        caseKey: 'OLL-01',
        custom: [],
        ownerType: 'guest',
        schemaVersion: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      en.ownership.unlinked,
    );
    TestBed.inject(TranslocoService).setActiveLang('ja');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      ja.ownership.unlinked,
    );
  });
});
