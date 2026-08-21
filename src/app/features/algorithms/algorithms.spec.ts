import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { Algorithms } from './algorithms';

describe('Algorithms', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Algorithms],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('ルートデータに対応するPLLケースを表示する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(21);
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
      'No matching cases.',
    );
  });
});
