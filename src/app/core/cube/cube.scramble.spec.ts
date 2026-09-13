import { TestBed } from '@angular/core/testing';
import { CubeService } from './cube';

const { randomScrambleForEvent, setSearchDebug } = vi.hoisted(() => ({
  randomScrambleForEvent: vi.fn(),
  setSearchDebug: vi.fn(),
}));
vi.mock('cubing/scramble', () => ({ randomScrambleForEvent }));
vi.mock('cubing/search', () => ({ setSearchDebug }));

describe('CubeService scramble initialization', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    randomScrambleForEvent.mockReset();
    setSearchDebug.mockReset();
  });

  it('同時要求と後続の生成で初期化を共有し、スクランブルは要求ごとに生成する', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    expect(setSearchDebug).not.toHaveBeenCalled();
    randomScrambleForEvent.mockImplementation(async () => {
      expect(setSearchDebug).toHaveBeenCalledExactlyOnceWith({
        logPerf: false,
        prioritizeEsbuildWorkaroundForWorkerInstantiation: true,
      });
      return { toString: () => 'R U' };
    });
    expect(await Promise.all([cube.createScramble(), cube.createScramble()])).toEqual([
      'R U',
      'R U',
    ]);
    expect(await cube.createScramble()).toBe('R U');
    expect(randomScrambleForEvent).toHaveBeenCalledTimes(3);
  });

  it('初期化に失敗しても次の生成要求で再試行できる', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    setSearchDebug.mockImplementationOnce(() => {
      throw new Error('initialization failed');
    });
    await expect(cube.createScramble()).rejects.toThrow('initialization failed');
    expect(randomScrambleForEvent).not.toHaveBeenCalled();
    randomScrambleForEvent.mockResolvedValue({ toString: () => 'F R' });
    expect(await cube.createScramble()).toBe('F R');
    expect(setSearchDebug).toHaveBeenCalledTimes(2);
  });
});
