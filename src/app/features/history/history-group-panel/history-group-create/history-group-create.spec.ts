import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../../../core/cube';
import { HistoryStore } from '../../history.store';
import { HistoryGroupCreate } from './history-group-create';

describe('HistoryGroupCreate', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HistoryGroupCreate],
      providers: [HistoryStore],
    }).compileComponents();
  });

  it('入力した名前でカテゴリーを追加し、追加したカテゴリーを選択する', async () => {
    const fixture = TestBed.createComponent(HistoryGroupCreate);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.create-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '大会用';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();

    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    expect(cube.groups().at(-1)?.name).toBe('大会用');
    expect(store.selectedGroup()).toBe(cube.groups().at(-1)?.id);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('キャンセル時に入力値を破棄してフォームを閉じる', async () => {
    const fixture = TestBed.createComponent(HistoryGroupCreate);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.create-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '破棄する名前';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button[type="button"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(TestBed.inject(CubeService).groups()).toHaveLength(1);
  });
});
