import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { TimerStore } from '../timer.store';
import { TimerSettings } from './timer-settings';

describe('TimerSettings', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TimerStore] });
  });

  it('モードを単一選択し、ドリルのケース選択欄を切り替える', async () => {
    const fixture = TestBed.createComponent(TimerSettings);
    const store = TestBed.inject(TimerStore);
    vi.spyOn(store, 'newScramble').mockImplementation(() => {});
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    for (const [category, label, count] of [
      ['oll', 'OLL', 58],
      ['pll', 'PLL', 22],
      ['full', '3×3', 0],
    ] as const) {
      const button = Array.from(element.querySelectorAll<HTMLButtonElement>('.modes button')).find(
        (button) => button.textContent?.includes(label),
      )!;
      button.click();
      await fixture.whenStable();
      expect(store.category()).toBe(category);
      expect(button.getAttribute('aria-checked')).toBe('true');
      expect(element.querySelectorAll('.modes button[aria-checked="true"]')).toHaveLength(1);
      expect(element.querySelectorAll('.case-select option')).toHaveLength(count);
    }
  });

  it('言語切替後にモード選択のラベルを更新する', async () => {
    const fixture = TestBed.createComponent(TimerSettings);
    const i18n = TestBed.inject(TranslocoService);
    for (const [lang, label] of [
      ['ja', '計測モード'],
      ['en', 'Timer mode'],
    ]) {
      await firstValueFrom(i18n.load(lang));
      i18n.setActiveLang(lang);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.modes').getAttribute('aria-label')).toBe(label);
    }
  });
});
