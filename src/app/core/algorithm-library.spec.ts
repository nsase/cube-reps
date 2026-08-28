import { TestBed } from '@angular/core/testing';
import { PLL_CASES } from './algorithm-cases';
import { AlgorithmLibraryService } from './algorithm-library';

describe('AlgorithmLibraryService', () => {
  const item = PLL_CASES[0];

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  function createService(): AlgorithmLibraryService {
    TestBed.configureTestingModule({});
    return TestBed.inject(AlgorithmLibraryService);
  }

  it('keeps built-in algorithms in source order and defaults the favorite to the first', () => {
    const service = createService();

    expect(service.algorithmsFor(item)).toEqual(item.algorithms);
    expect(item.algorithms.every((algorithm) => algorithm.builtIn)).toBe(true);
    expect(service.favoriteFor(item)?.id).toBe(item.algorithms[0].id);
    expect(service.primaryNotation(item)).toBe(item.algorithms[0].notation);
  });

  it('appends user algorithms and allows exactly one favorite', () => {
    const service = createService();

    expect(service.add(item, 'custom algorithm')).toBe(true);
    const algorithms = service.algorithmsFor(item);
    const custom = algorithms.at(-1)!;

    expect(algorithms.slice(0, item.algorithms.length)).toEqual(item.algorithms);
    expect(custom.builtIn).toBe(false);

    service.setFavorite(item, custom.id);
    expect(service.favoriteFor(item)?.id).toBe(custom.id);
    expect(service.primaryNotation(item)).toBe('custom algorithm');

    service.setFavorite(item, item.algorithms[1].id);
    expect(service.favoriteFor(item)?.id).toBe(item.algorithms[1].id);
  });

  it('keeps the favorite when built-in algorithms are reordered or corrected', () => {
    const service = createService();
    const favorite = item.algorithms[1];
    service.setFavorite(item, favorite.id);
    const changedItem = {
      ...item,
      algorithms: [
        { ...favorite, notation: favorite.notation + ' corrected' },
        item.algorithms[0],
        ...item.algorithms.slice(2),
      ],
    };

    expect(service.favoriteFor(changedItem)).toEqual({
      id: favorite.id,
      notation: favorite.notation + ' corrected',
      builtIn: true,
    });
  });

  it('falls back to the first built-in when the favorite user algorithm is removed', () => {
    const service = createService();
    service.add(item, 'custom algorithm');
    const custom = service.algorithmsFor(item).at(-1)!;
    service.setFavorite(item, custom.id);

    service.remove(item, custom.id);

    expect(service.algorithmsFor(item).some((algorithm) => algorithm.id === custom.id)).toBe(false);
    expect(service.favoriteFor(item)?.id).toBe(item.algorithms[0].id);
  });
});
