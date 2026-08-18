import { Injectable, computed, effect, signal } from '@angular/core';
import { Penalty, RecordGroup, Solve, SolveMode } from './cube.models';

const DEFAULT_GROUP: RecordGroup = {
  id: 'unclassified',
  name: '未分類',
  createdAt: new Date(0).toISOString(),
};

@Injectable({ providedIn: 'root' })
export class CubeService {
  readonly solves = signal<Solve[]>(this.loadSolves());
  readonly groups = signal<RecordGroup[]>(this.loadGroups());
  readonly activeGroupId = signal(this.loadActiveGroupId());
  readonly activeGroup = computed(
    () => this.groups().find((group) => group.id === this.activeGroupId()) ?? this.groups()[0],
  );
  readonly activeSolves = computed(() =>
    this.solves().filter((solve) => solve.groupId === this.activeGroupId()),
  );
  readonly validActiveSolves = computed(() =>
    this.activeSolves().filter((solve) => solve.penalty !== 'DNF'),
  );
  readonly best = computed(() =>
    Math.min(...this.validActiveSolves().map((solve) => this.finalTime(solve)), Infinity),
  );
  readonly average = computed(() => {
    const times = this.validActiveSolves()
      .slice(0, 5)
      .map((solve) => this.finalTime(solve));
    return times.length ? times.reduce((total, time) => total + time, 0) / times.length : Infinity;
  });

  constructor() {
    if (!this.groups().length) this.groups.set([DEFAULT_GROUP]);
    if (!this.groups().some((group) => group.id === this.activeGroupId()))
      this.activeGroupId.set(this.groups()[0].id);
    effect(() => localStorage.setItem('cubeflow-solves', JSON.stringify(this.solves())));
    effect(() => localStorage.setItem('cubeflow-groups', JSON.stringify(this.groups())));
    effect(() => localStorage.setItem('cubeflow-active-group', this.activeGroupId()));
  }

  addGroup(name: string): RecordGroup | undefined {
    const trimmedName = name.trim();
    if (!trimmedName) return undefined;
    const group: RecordGroup = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      createdAt: new Date().toISOString(),
    };
    this.groups.update((groups) => [...groups, group]);
    this.activeGroupId.set(group.id);
    return group;
  }

  removeGroup(id: string): void {
    if (id === DEFAULT_GROUP.id || this.groups().length === 1) return;
    this.groups.update((groups) => groups.filter((group) => group.id !== id));
    if (this.activeGroupId() === id) this.activeGroupId.set(this.groups()[0].id);
  }

  groupName(groupId?: string): string {
    return this.groups().find((group) => group.id === groupId)?.name ?? '未分類';
  }

  addSolve(time: number, scramble: string, mode: SolveMode, caseName?: string): void {
    this.solves.update((solves) => [
      {
        id: Date.now(),
        time,
        scramble,
        date: new Date().toISOString(),
        mode,
        caseName,
        groupId: this.activeGroupId(),
        penalty: 'none',
      },
      ...solves,
    ]);
  }

  togglePenalty(id: number, penalty: Exclude<Penalty, 'none'>): void {
    this.solves.update((solves) =>
      solves.map((solve) =>
        solve.id === id
          ? { ...solve, penalty: solve.penalty === penalty ? 'none' : penalty }
          : solve,
      ),
    );
  }

  removeSolve(id: number): void {
    this.solves.update((solves) => solves.filter((solve) => solve.id !== id));
  }
  finalTime(solve: Solve): number {
    return solve.time + (solve.penalty === '+2' ? 2000 : 0);
  }

  formatTime(milliseconds: number): string {
    if (!Number.isFinite(milliseconds)) return '—';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const centiseconds = Math.floor((milliseconds % 1000) / 10);
    return `${minutes ? `${minutes}:` : ''}${minutes ? String(seconds).padStart(2, '0') : seconds}.${String(centiseconds).padStart(2, '0')}`;
  }

  displayTime(solve: Solve): string {
    return solve.penalty === 'DNF'
      ? 'DNF'
      : `${this.formatTime(this.finalTime(solve))}${solve.penalty === '+2' ? '+' : ''}`;
  }

  createScramble(): string {
    const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
    const suffixes = ['', "'", '2'];
    const result: string[] = [];
    while (result.length < 20) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      if (result.at(-1)?.[0] !== move)
        result.push(move + suffixes[Math.floor(Math.random() * suffixes.length)]);
    }
    return result.join(' ');
  }

  private loadSolves(): Solve[] {
    return this.load<Solve[]>('cubeflow-solves', []).map((solve) => ({
      ...solve,
      groupId: !solve.groupId || solve.groupId === 'practice' ? DEFAULT_GROUP.id : solve.groupId,
    }));
  }

  private loadGroups(): RecordGroup[] {
    const groups = this.load<RecordGroup[]>('cubeflow-groups', [DEFAULT_GROUP]);
    const migrated = groups.map((group) =>
      group.id === 'practice'
        ? { ...DEFAULT_GROUP, createdAt: group.createdAt }
        : { id: group.id, name: group.name, createdAt: group.createdAt },
    );
    return migrated.some((group) => group.id === DEFAULT_GROUP.id)
      ? migrated
      : [DEFAULT_GROUP, ...migrated];
  }

  private loadActiveGroupId(): string {
    const stored = localStorage.getItem('cubeflow-active-group');
    return !stored || stored === 'practice' ? DEFAULT_GROUP.id : stored;
  }

  private load<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }
}
