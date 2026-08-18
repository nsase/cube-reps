import { Injectable, effect, signal } from '@angular/core';
import { AlgorithmCase } from './cube.models';

export interface CaseAlgorithm {
  id: string;
  notation: string;
  builtIn: boolean;
}

type AlgorithmPreferences = Record<string, CaseAlgorithm[]>;

@Injectable({ providedIn: 'root' })
export class AlgorithmLibraryService {
  private readonly preferences = signal<AlgorithmPreferences>(this.load());

  constructor() {
    effect(() => localStorage.setItem('cubeflow-algorithms', JSON.stringify(this.preferences())));
  }

  caseKey(item: AlgorithmCase): string {
    return `${item.kind}-${item.number}`;
  }

  algorithmsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return this.preferences()[this.caseKey(item)] ?? this.defaultsFor(item);
  }

  primaryNotation(item: AlgorithmCase): string {
    return this.algorithmsFor(item)[0]?.notation ?? '手順未登録';
  }

  add(item: AlgorithmCase, notation: string): boolean {
    const value = notation.trim();
    if (!value) return false;
    const algorithms = this.algorithmsFor(item);
    if (algorithms.some((algorithm) => algorithm.notation === value)) return false;
    this.save(item, [...algorithms, { id: `user-${Date.now()}`, notation: value, builtIn: false }]);
    return true;
  }

  move(item: AlgorithmCase, id: string, offset: -1 | 1): void {
    const algorithms = [...this.algorithmsFor(item)];
    const index = algorithms.findIndex((algorithm) => algorithm.id === id);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= algorithms.length) return;
    [algorithms[index], algorithms[target]] = [algorithms[target], algorithms[index]];
    this.save(item, algorithms);
  }

  remove(item: AlgorithmCase, id: string): void {
    const algorithm = this.algorithmsFor(item).find((entry) => entry.id === id);
    if (!algorithm || algorithm.builtIn) return;
    this.save(
      item,
      this.algorithmsFor(item).filter((entry) => entry.id !== id),
    );
  }

  private defaultsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return item.algorithms.map((notation, index) => ({
      id: `built-in-${index}`,
      notation,
      builtIn: true,
    }));
  }

  private save(item: AlgorithmCase, algorithms: CaseAlgorithm[]): void {
    this.preferences.update((preferences) => ({
      ...preferences,
      [this.caseKey(item)]: algorithms,
    }));
  }

  private load(): AlgorithmPreferences {
    try {
      return JSON.parse(localStorage.getItem('cubeflow-algorithms') ?? '{}');
    } catch {
      return {};
    }
  }
}
