import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { SlotButtonGroup } from './slot-button-group';

describe('SlotButtonGroup', () => {
  it('親からの選択値を表示し、操作したスロットを親へ通知する', async () => {
    const fixture = TestBed.createComponent(SlotButtonGroup);
    fixture.componentRef.setInput('slot', 'FR');
    const changed = vi.fn();
    fixture.componentInstance.slot.subscribe(changed);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const frontRight = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Front Right"]',
    )!;
    expect(frontRight.getAttribute('aria-checked')).toBe('true');
    const backLeft = element.querySelector<HTMLButtonElement>('button[aria-label="Back Left"]')!;
    backLeft.click();
    await fixture.whenStable();
    expect(changed).toHaveBeenCalledWith('BL');
    expect(fixture.componentInstance.slot()).toBe('BL');
    expect(backLeft.getAttribute('aria-checked')).toBe('true');
    expect(element.querySelectorAll('button[aria-checked="true"]')).toHaveLength(1);
    fixture.componentRef.setInput('slot', 'BR');
    await fixture.whenStable();
    expect(
      element.querySelector('button[aria-label="Back Right"]')!.getAttribute('aria-checked'),
    ).toBe('true');
  });

  it('言語切替後も正式名の読み上げラベルと両方の表示名を提供する', async () => {
    const fixture = TestBed.createComponent(SlotButtonGroup);
    fixture.componentRef.setInput('slot', 'FR');
    const i18n = TestBed.inject(TranslocoService);
    for (const [lang, label] of [
      ['ja', 'スロット'],
      ['en', 'Slot'],
    ]) {
      await firstValueFrom(i18n.load(lang));
      i18n.setActiveLang(lang);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('.slots')!.getAttribute('aria-label')).toBe(label);
      expect(
        Array.from(element.querySelectorAll('button'), (button) =>
          button.getAttribute('aria-label'),
        ),
      ).toEqual(['Front Right', 'Front Left', 'Back Left', 'Back Right']);
      expect(
        Array.from(element.querySelectorAll('.short-label'), (span) => span.textContent?.trim()),
      ).toEqual(['FR', 'FL', 'BL', 'BR']);
    }
  });
});
