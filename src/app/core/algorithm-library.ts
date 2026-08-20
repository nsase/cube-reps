import { Injectable, effect, signal } from '@angular/core';
import { AlgorithmCase } from './cube.models';

export interface CaseAlgorithm {
  id: string;
  notation: string;
  builtIn: boolean;
}

interface CasePreferences {
  custom: CaseAlgorithm[];
  favoriteId?: string;
}

const STORAGE_KEY = 'cubeflow-algorithm-preferences';

type AlgorithmPreferences = Record<string, CasePreferences>;

@Injectable({ providedIn: 'root' })
export class AlgorithmLibraryService {
  private readonly preferences = signal<AlgorithmPreferences>(this.load());

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences())));
  }

  caseKey(item: AlgorithmCase): string {
    return `${item.kind}-${item.number}`;
  }

  algorithmsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return [...this.defaultsFor(item), ...this.preferenceFor(item).custom];
  }

  favoriteFor(item: AlgorithmCase): CaseAlgorithm | undefined {
    const algorithms = this.algorithmsFor(item);
    const favoriteId = this.preferenceFor(item).favoriteId;
    return algorithms.find((algorithm) => algorithm.id === favoriteId) ?? algorithms[0];
  }

  primaryNotation(item: AlgorithmCase): string {
    return this.favoriteFor(item)?.notation ?? '手順未登録';
  }

  setFavorite(item: AlgorithmCase, id: string): void {
    if (!this.algorithmsFor(item).some((algorithm) => algorithm.id === id)) return;
    this.save(item, { ...this.preferenceFor(item), favoriteId: id });
  }

  add(item: AlgorithmCase, notation: string): boolean {
    const value = notation.trim();
    if (!value) return false;
    if (this.algorithmsFor(item).some((algorithm) => algorithm.notation === value)) return false;
    const preference = this.preferenceFor(item);
    this.save(item, {
      ...preference,
      custom: [...preference.custom, { id: `user-${Date.now()}`, notation: value, builtIn: false }],
    });
    return true;
  }

  remove(item: AlgorithmCase, id: string): void {
    const preference = this.preferenceFor(item);
    if (!preference.custom.some((algorithm) => algorithm.id === id)) return;
    this.save(item, {
      custom: preference.custom.filter((algorithm) => algorithm.id !== id),
      favoriteId: preference.favoriteId === id ? undefined : preference.favoriteId,
    });
  }

  private defaultsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return item.algorithms.map((notation, index) => ({
      id: `built-in-${index}`,
      notation,
      builtIn: true,
    }));
  }

  private preferenceFor(item: AlgorithmCase): CasePreferences {
    return this.preferences()[this.caseKey(item)] ?? { custom: [] };
  }

  private save(item: AlgorithmCase, preference: CasePreferences): void {
    this.preferences.update((preferences) => ({
      ...preferences,
      [this.caseKey(item)]: preference,
    }));
  }

  private load(): AlgorithmPreferences {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as AlgorithmPreferences;
    } catch {
      return {};
    }
  }
}
