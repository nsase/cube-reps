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
      ['f2l', 'F2L', 42],
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

  it('F2Lのケースと4スロットを標準selectで選び、Setupと手順を更新する', async () => {
    const fixture = TestBed.createComponent(TimerSettings);
    const store = TestBed.inject(TimerStore);
    store.setCategory('f2l');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const cases = element.querySelector<HTMLSelectElement>(
      '[data-testid="timer-drill-case-filter"]',
    )!;
    cases.selectedIndex = 1;
    cases.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(store.selectedCase()).toBe(0);
    expect(store.selectedSlot()).toBe('random');
    const slots = element.querySelector<HTMLSelectElement>('[data-testid="timer-f2l-slot"]')!;
    expect(slots.value).toBe('random');
    expect(slots.options).toHaveLength(5);
    slots.value = 'FR';
    slots.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const base = store.scramble();
    for (const [slot, suffix] of [
      ['FL', ' y'],
      ['BL', ' y2'],
      ['BR', " y'"],
      ['FR', ''],
    ]) {
      slots.value = slot;
      slots.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(store.scramble()).toBe(base + suffix);
      expect(element.querySelector('code')?.textContent?.trim()).toBeTruthy();
    }
  });

  it('言語切替後にモード選択のラベルを更新する', async () => {
    const fixture = TestBed.createComponent(TimerSettings);
    TestBed.inject(TimerStore).setCategory('f2l');
    const i18n = TestBed.inject(TranslocoService);
    for (const [lang, label] of [
      ['ja', '計測モード'],
      ['en', 'Timer mode'],
    ]) {
      await firstValueFrom(i18n.load(lang));
      i18n.setActiveLang(lang);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.modes').getAttribute('aria-label')).toBe(label);
      expect(fixture.nativeElement.querySelector('.slot-select span').textContent).toContain(
        lang === 'ja' ? '対象の1ペア' : 'Time one pair',
      );
    }
  });
});
