import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CubeService } from '../../core/cube';
import { RecordGroup, Solve } from '../../core/cube.models';
import { FirestoreGroupRepository } from '../../core/firestore/firestore-group.repository';
import { FirestoreSolveRepository } from '../../core/firestore/firestore-solve.repository';
import { GroupSyncService } from '../../core/firestore/group-sync.service';
import { SolveSyncService } from '../../core/firestore/solve-sync.service';
import { SystemStore } from '../../core/system.store';
import { History } from './history';

/** 別端末のデータ取得から履歴の選択・集計・グラフまでを実サービスで検証する。 */
describe('History group synchronization', () => {
  const account = { uid: 'account', displayName: 'User', email: null, photoURL: null };
  const group: RecordGroup = {
    id: 'remote-group',
    name: 'Other device practice',
    ownerType: 'account',
    ownerId: account.uid,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    schemaVersion: 3,
  };
  const solves: Solve[] = [1000, 3000].map((time, index) => ({
    ...group,
    id: `remote-solve-${index}`,
    groupId: group.id,
    createdAt: `2026-01-0${index + 1}T00:00:00.000Z`,
    time,
    scramble: 'R U',
    category: 'full',
    penalty: 'none',
  }));
  let fixture: ComponentFixture<History>;
  let receiveGroups: (records: RecordGroup[]) => void;
  let receiveSolves: (records: Solve[]) => void;
  let groupCloud: {
    list: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    tombstone: ReturnType<typeof vi.fn>;
  };
  let solveCloud: typeof groupCloud;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    const groupsPending = new Promise<RecordGroup[]>((resolve) => {
      receiveGroups = resolve;
    });
    const solvesPending = new Promise<Solve[]>((resolve) => {
      receiveSolves = resolve;
    });
    groupCloud = { list: vi.fn(() => groupsPending), put: vi.fn(), tombstone: vi.fn() };
    solveCloud = { list: vi.fn(() => solvesPending), put: vi.fn(), tombstone: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [History],
      providers: [
        provideRouter([]),
        { provide: FirestoreGroupRepository, useValue: groupCloud },
        { provide: FirestoreSolveRepository, useValue: solveCloud },
        { provide: SystemStore, useValue: { online: signal(true) } },
      ],
    }).compileComponents();
    await TestBed.inject(CubeService).ready;
    fixture = TestBed.createComponent(History);
    fixture.detectChanges();
    TestBed.inject(AuthService).user.set(account);
    fixture.detectChanges();
    await vi.waitFor(() => {
      expect(groupCloud.list).toHaveBeenCalledWith(account.uid);
      expect(solveCloud.list).toHaveBeenCalledWith(account.uid);
    });
  });

  /** 非同期の同期処理とフォームの反映後に画面を更新する。 */
  async function render(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** ユーザーが表示されたグループ選択肢を選ぶ。 */
  async function selectGroup(id: string): Promise<void> {
    const select = fixture.nativeElement.querySelector(
      '[data-testid="history-group-filter"]',
    ) as HTMLSelectElement;
    expect(Array.from(select.options, (option) => option.value)).toContain(id);
    select.value = id;
    select.dispatchEvent(new Event('change'));
    await render();
  }

  /** 一覧・集計・グラフが同じ2件の記録を表示することを確認する。 */
  function expectHistory(): void {
    const root = fixture.nativeElement as HTMLElement;
    const rows = root.querySelectorAll('app-solve-record');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('3.00');
    expect(rows[1].textContent).toContain('1.00');
    const stats = root.querySelectorAll('app-history-summary strong');
    expect(stats[0].textContent).toBe('1.00');
    expect(stats[1].textContent).toBe('2.00');
    const points = root.querySelectorAll('[data-series="result"] title');
    expect(Array.from(points, (point) => point.textContent)).toEqual([
      'Result: 1.00',
      'Result: 3.00',
    ]);
  }

  for (const order of ['group-first', 'solve-first'] as const) {
    it(`${order}: 別端末のグループと記録を選択し、名称変更と削除後も履歴を参照できる`, async () => {
      if (order === 'group-first') {
        receiveGroups([group]);
        await vi.waitFor(() => expect(TestBed.inject(GroupSyncService).phase()).toBe('synced'));
        await render();
        await selectGroup(group.id);
        receiveSolves(solves);
      } else {
        receiveSolves(solves);
        await vi.waitFor(() => expect(TestBed.inject(SolveSyncService).phase()).toBe('synced'));
        await render();
        await selectGroup(group.id);
        expectHistory();
        expect(fixture.nativeElement.textContent).not.toContain(group.name);
        receiveGroups([group]);
      }
      await vi.waitFor(() => {
        expect(TestBed.inject(GroupSyncService).phase()).toBe('synced');
        expect(TestBed.inject(SolveSyncService).phase()).toBe('synced');
      });
      await render();
      expectHistory();
      expect(
        fixture.nativeElement.querySelector('[data-testid="history-group-filter"]')
          .selectedOptions[0].textContent,
      ).toBe(group.name);

      const renamed = {
        ...group,
        name: 'Renamed on other device',
        updatedAt: '2026-02-01T00:00:00.000Z',
      };
      groupCloud.list.mockResolvedValue([renamed]);
      TestBed.inject(GroupSyncService).refresh();
      await vi.waitFor(() => expect(TestBed.inject(GroupSyncService).phase()).toBe('synced'));
      await render();
      expect(
        fixture.nativeElement.querySelector('[data-testid="history-group-filter"]')
          .selectedOptions[0].textContent,
      ).toBe(renamed.name);
      expectHistory();

      groupCloud.list.mockResolvedValue([
        {
          ...renamed,
          deletedAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-01T00:00:00.000Z',
        },
      ]);
      TestBed.inject(GroupSyncService).refresh();
      await vi.waitFor(() => expect(TestBed.inject(GroupSyncService).phase()).toBe('synced'));
      await render();
      const select = fixture.nativeElement.querySelector(
        '[data-testid="history-group-filter"]',
      ) as HTMLSelectElement;
      expect(select.value).toBe('unclassified');
      expect(Array.from(select.options, (option) => option.value)).not.toContain(group.id);
      expectHistory();
      expect(groupCloud.put).not.toHaveBeenCalled();
      expect(solveCloud.put).not.toHaveBeenCalled();
    });
  }
});
