export type View = 'timer' | 'algorithms' | 'history';
export type SolveMode = '3x3' | 'PLL';
export type Penalty = 'none' | '+2' | 'DNF';

export interface Solve {
  id: number;
  time: number;
  scramble: string;
  date: string;
  mode: SolveMode;
  caseName?: string;
  penalty: Penalty;
}

export interface AlgorithmCase {
  kind: 'OLL' | 'PLL';
  number: string;
  name: string;
  group: string;
  algorithm: string;
}
