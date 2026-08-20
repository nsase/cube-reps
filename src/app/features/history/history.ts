import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CubeService } from '../../core/cube';
import { CubeNetView } from '../../shared/cube-net/cube-net';
import { Solve } from '../../core/cube.models';

@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule, CubeNetView],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  readonly showTimer = output<void>();
  protected readonly cube = inject(CubeService);
  protected readonly selectedGroup = signal('all');
  protected readonly showCreateForm = signal(false);
  protected readonly newGroupName = signal('');
  protected readonly filteredSolves = computed(() => {
    const groupId = this.selectedGroup();
    return groupId === 'all'
      ? this.cube.solves()
      : this.cube.solves().filter((solve) => solve.groupId === groupId);
  });
  protected readonly filteredValidSolves = computed(() =>
    this.filteredSolves().filter((solve) => solve.penalty !== 'DNF'),
  );
  protected readonly filteredBest = computed(() =>
    Math.min(...this.filteredValidSolves().map((solve) => this.cube.finalTime(solve)), Infinity),
  );
  protected readonly filteredAverage = computed(() => {
    const times = this.filteredValidSolves()
      .slice(0, 5)
      .map((solve) => this.cube.finalTime(solve));
    return times.length ? times.reduce((total, time) => total + time, 0) / times.length : Infinity;
  });

  protected createGroup(): void {
    const group = this.cube.addGroup(this.newGroupName());
    if (!group) return;
    this.selectedGroup.set(group.id);
    this.newGroupName.set('');
    this.showCreateForm.set(false);
  }

  protected deleteGroup(id: string): void {
    this.cube.removeGroup(id);
    if (this.selectedGroup() === id) this.selectedGroup.set('all');
  }

  protected trackSolve(_index: number, solve: Solve): number {
    return solve.id;
  }
}
