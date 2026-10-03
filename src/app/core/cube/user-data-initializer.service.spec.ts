import { TestBed } from '@angular/core/testing';
import { StoredUserData, UserDataRepository } from '../local-storage/user-data-repository';
import { CubeService } from './cube';
import { GroupService } from './group.service';
import { SolveService } from './solve.service';
import { UserDataInitializer } from './user-data-initializer.service';

describe('UserDataInitializer', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  });

  it('復元中の追加・編集を維持し、保存済みデータを各ドメインへ一度だけ取り込む', async () => {
    const repository = TestBed.inject(UserDataRepository);
    let finishLoad!: (data: StoredUserData) => void;
    const load = vi.spyOn(repository, 'load').mockReturnValue(
      new Promise<StoredUserData>((resolve) => {
        finishLoad = resolve;
      }),
    );
    const cube = TestBed.inject(CubeService);
    const initialization = TestBed.inject(UserDataInitializer);
    const groups = TestBed.inject(GroupService);
    const solves = TestBed.inject(SolveService);
    const group = groups.addGroup('ロード中に作成')!;
    const solve = solves.addSolve(group.id, 1000, 'R U', 'full');
    groups.renameGroup(group.id, 'ロード中に変更');
    solves.togglePenalty(solve.id, '+2');
    expect(initialization.storageReady()).toBe(false);

    finishLoad({
      accounts: [],
      algorithmPreferences: [],
      groups: [group, { ...group, id: 'stored-group', name: '保存済み' }],
      solves: [solve, { ...solve, id: 'stored-solve', groupId: 'stored-group' }],
    });
    await Promise.all([cube.ready, initialization.ready]);

    expect(load).toHaveBeenCalledOnce();
    expect(cube.storageReady()).toBe(true);
    expect(groups.userGroups()).toHaveLength(2);
    expect(groups.groupName(group.id)).toBe('ロード中に変更');
    expect(solves.activeSolves()).toHaveLength(2);
    expect(solves.activeSolves().find(({ id }) => id === solve.id)?.penalty).toBe('+2');
    expect(cube.activeSolves()).toEqual(solves.activeSolves());
    expect(cube.activeGroupId()).toBe(group.id);
    TestBed.tick();
    expect(localStorage.getItem('cube-reps.active-group')).toBe(group.id);
  });

  it.each([true, false])('保存済み選択の存在=%sに応じてグループを復元する', async (exists) => {
    localStorage.setItem('cube-reps.active-group', 'stored-group');
    const repository = TestBed.inject(UserDataRepository);
    if (exists) {
      await repository.putRecordGroup({
        id: 'stored-group',
        name: '保存済み',
        ownerType: 'guest',
        schemaVersion: 3,
        createdAt: new Date(1).toISOString(),
        updatedAt: new Date(1).toISOString(),
      });
    }
    const initialization = TestBed.inject(UserDataInitializer);
    await initialization.ready;
    expect(TestBed.inject(GroupService).activeGroupId()).toBe(
      exists ? 'stored-group' : 'unclassified',
    );
    TestBed.tick();
    expect(localStorage.getItem('cube-reps.active-group')).toBe(
      exists ? 'stored-group' : 'unclassified',
    );
  });
});
