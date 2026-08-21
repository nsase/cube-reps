import { TestBed } from '@angular/core/testing';
import { AlgorithmTools } from './algorithm-tools';

describe('AlgorithmTools', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [AlgorithmTools] }).compileComponents();
  });

  it('種別と検索文字列をModel Signalへ双方向で反映する', async () => {
    const fixture = TestBed.createComponent(AlgorithmTools);
    fixture.componentRef.setInput('kind', 'PLL');
    fixture.componentRef.setInput('query', 'initial');
    fixture.detectChanges();
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'search text';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.kind()).toBe('OLL');
    expect(fixture.componentInstance.query()).toBe('search text');
  });
});
