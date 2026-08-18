import { Injectable, computed, effect, signal } from '@angular/core';
import { Penalty, Solve, SolveMode } from './cube.models';

@Injectable({ providedIn: 'root' })
export class CubeService {
  readonly solves = signal<Solve[]>(this.load());
  readonly validSolves = computed(() => this.solves().filter((solve) => solve.penalty !== 'DNF'));
  readonly best = computed(() =>
    Math.min(...this.validSolves().map((solve) => this.finalTime(solve)), Infinity),
  );
  readonly average = computed(() => {
    const times = this.validSolves()
      .slice(0, 5)
      .map((solve) => this.finalTime(solve));
    return times.length ? times.reduce((total, time) => total + time, 0) / times.length : Infinity;
  });

  constructor() {
    effect(() => localStorage.setItem('cubeflow-solves', JSON.stringify(this.solves())));
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
      if (result.at(-1)?.[0] !== move) {
        result.push(move + suffixes[Math.floor(Math.random() * suffixes.length)]);
      }
    }
    return result.join(' ');
  }

  private load(): Solve[] {
    try {
      return JSON.parse(localStorage.getItem('cubeflow-solves') ?? '[]');
    } catch {
      return [];
    }
  }
}
