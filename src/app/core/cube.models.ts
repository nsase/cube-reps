export type View = 'timer' | 'algorithms' | 'history';
export type SolveMode = '3x3' | 'PLL';
export type Penalty = 'none' | '+2' | 'DNF';

export interface RecordGroup {
  id: string;
  name: string;
  createdAt: string;
}

export interface Solve {
  id: number;
  time: number;
  scramble: string;
  date: string;
  mode: SolveMode;
  caseName?: string;
  groupId?: string;
  penalty: Penalty;
}

export type StickerColor = 'yellow' | 'white' | 'green' | 'blue' | 'red' | 'orange' | 'none';
export type CubePattern = ReadonlyArray<ReadonlyArray<StickerColor>>;

export interface AlgorithmCase {
  kind: 'OLL' | 'PLL';
  number: string;
  name: string;
  group: string;
  algorithm: string;
  pattern: CubePattern;
}
