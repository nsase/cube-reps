import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../../app.routes';
import { AlgorithmTools } from './algorithm-tools';

describe('AlgorithmTools', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AlgorithmTools],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('種別ボタンでルート遷移し、検索文字列をModel Signalへ反映する', async () => {
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

    expect(TestBed.inject(Router).url).toBe('/algorithms/oll');
    expect(fixture.componentInstance.kind()).toBe('PLL');
    expect(fixture.componentInstance.query()).toBe('search text');
  });
});
