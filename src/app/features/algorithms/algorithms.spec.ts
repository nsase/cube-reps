import { TestBed } from '@angular/core/testing';
import { Algorithms } from './algorithms';

describe('Algorithms', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Algorithms] }).compileComponents();
  });

  it('PLLケースを初期表示し、種別ボタンでOLLケースへ切り替える', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(21);

    const ollButton = fixture.nativeElement.querySelector(
      'app-algorithm-tools button',
    ) as HTMLButtonElement;
    ollButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(57);
  });

  it('検索文字列に一致しない場合は空表示を描画する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'app-algorithm-tools input',
    ) as HTMLInputElement;
    input.value = '存在しないケース';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.empty')?.textContent).toContain(
      '該当するケースがありません',
    );
  });
});
