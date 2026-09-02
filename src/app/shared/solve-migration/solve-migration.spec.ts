import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  SolveMigrationService,
  SolveMigrationState,
} from '../../core/firestore/solve-migration.service';
import { SolveMigration } from './solve-migration';

describe('SolveMigration', () => {
  const state = signal<SolveMigrationState>({
    phase: 'ready',
    localCount: 3,
    targetCount: 2,
    processedCount: 0,
    skippedCount: 1,
    failedCount: 0,
  });
  const account = signal({
    uid: 'account-1',
    displayName: 'Cube User',
    email: 'cube@example.com',
    photoURL: null,
  });
  const migrate = vi.fn();
  const retryInspection = vi.fn();

  beforeEach(async () => {
    migrate.mockReset();
    retryInspection.mockReset();
    state.set({
      phase: 'ready',
      localCount: 3,
      targetCount: 2,
      processedCount: 0,
      skippedCount: 1,
      failedCount: 0,
    });
    await TestBed.configureTestingModule({
      imports: [SolveMigration],
      providers: [
        {
          provide: SolveMigrationService,
          useValue: { state, account, visible: () => true, migrate, retryInspection },
        },
      ],
    }).compileComponents();
  });

  it('対象件数、保存先アカウント、ローカル保持方針を表示して明示操作を受け付ける', async () => {
    const fixture = TestBed.createComponent(SolveMigration);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('2 records');
    expect(text).toContain('cube@example.com');
    expect(text).toContain('will not be deleted');

    (
      fixture.nativeElement.querySelector(
        '[data-testid="start-solve-migration"]',
      ) as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    expect(migrate).toHaveBeenCalledOnce();
  });

  it('部分失敗件数を表示して失敗対象の再試行を受け付ける', async () => {
    state.set({
      phase: 'partial-failure',
      localCount: 3,
      targetCount: 3,
      processedCount: 2,
      skippedCount: 0,
      failedCount: 1,
    });
    const fixture = TestBed.createComponent(SolveMigration);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      '1 remain',
    );
    (
      fixture.nativeElement.querySelector(
        '[data-testid="retry-solve-migration"]',
      ) as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    expect(migrate).toHaveBeenCalledOnce();
  });
});
