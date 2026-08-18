import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
type View = 'timer' | 'algorithms' | 'history';
type Mode = '3x3' | 'PLL';
type Penalty = 'none' | '+2' | 'DNF';
interface Solve {
  id: number;
  time: number;
  scramble: string;
  date: string;
  mode: Mode;
  caseName?: string;
  penalty: Penalty;
}
interface Case {
  kind: 'OLL' | 'PLL';
  number: string;
  name: string;
  group: string;
  algorithm: string;
}
const PLL_DATA = [
  ['Aa', 'Corner', "x L2 D2 L' U' L D2 L' U L' x'"],
  ['Ab', 'Corner', "x' L2 D2 L U L' D2 L U' L x"],
  ['E', 'Corner', "x' R U' R' D R U R' D' R U R' D R U' R' D' x"],
  ['F', 'Mixed', "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"],
  ['Ga', 'Mixed', "R2 U R' U R' U' R U' R2 D U' R' U R D'"],
  ['Gb', 'Mixed', "R' U' R U D' R2 U R' U R U' R U' R2 D"],
  ['Gc', 'Mixed', "R2 U' R U' R U R' U R2 D' U R U' R' D"],
  ['Gd', 'Mixed', "R U R' U' D R2 U' R U' R' U R' U R2 D'"],
  ['H', 'Edge', 'M2 U M2 U2 M2 U M2'],
  ['Ja', 'Mixed', "x R2 F R F' R U2 r' U r U2 x'"],
  ['Jb', 'Mixed', "R U R' F' R U R' U' R' F R2 U' R'"],
  ['Na', 'Mixed', "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"],
  ['Nb', 'Mixed', "R' U R U' R' F' U' F R U R' F R' F' R U' R"],
  ['Ra', 'Mixed', "R U' R' U' R U R D R' U' R D' R' U2 R'"],
  ['Rb', 'Mixed', "R2 F R U R U' R' F' R U2 R' U2 R"],
  ['T', 'Mixed', "R U R' U' R' F R2 U' R' U' R U R' F'"],
  ['Ua', 'Edge', "M2 U M U2 M' U M2"],
  ['Ub', 'Edge', "M2 U' M U2 M' U' M2"],
  ['V', 'Mixed', "R' U R' U' y R' F' R2 U' R' U R' F R F"],
  ['Y', 'Mixed', "F R U' R' U' R U R' F' R U R' U' R' F R F'"],
  ['Z', 'Edge', "M2 U M2 U M' U2 M2 U2 M' U2"],
] as const;
const PLL: Case[] = PLL_DATA.map(([n, g, a]) => ({
  kind: 'PLL',
  number: n,
  name: `${n}-perm`,
  group: g,
  algorithm: a,
}));
const groups = [
  'Dot',
  'Line',
  'Cross',
  'Square',
  'Lightning',
  'Fish',
  'Knight',
  'Awkward',
  'Corners',
];
const OLL: Case[] = Array.from({ length: 57 }, (_, i) => ({
  kind: 'OLL',
  number: String(i + 1).padStart(2, '0'),
  name: `OLL ${i + 1}`,
  group: groups[i % 9],
  algorithm:
    i === 26 ? "R U R' U R U2 R'" : i === 20 ? "R U2 R' U' R U R' U' R U' R'" : '手順を登録予定',
}));
@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  view = signal<View>('timer');
  mode = signal<Mode>('3x3');
  elapsed = signal(0);
  state = signal<'idle' | 'ready' | 'running'>('idle');
  scramble = signal(this.makeScramble());
  solves = signal<Solve[]>(this.load());
  selected = signal(15);
  kind = signal<'OLL' | 'PLL'>('PLL');
  query = signal('');
  copied = signal('');
  pll = PLL;
  private interval?: number;
  private started = 0;
  private space = false;
  cases = computed(() => {
    const q = this.query().toLowerCase();
    return [...OLL, ...PLL].filter(
      (x) => x.kind === this.kind() && `${x.name} ${x.number} ${x.group}`.toLowerCase().includes(q),
    );
  });
  valid = computed(() => this.solves().filter((x) => x.penalty !== 'DNF'));
  best = computed(() => Math.min(...this.valid().map((x) => this.final(x)), Infinity));
  avg = computed(() => {
    const a = this.valid()
      .slice(0, 5)
      .map((x) => this.final(x));
    return a.length ? a.reduce((x, y) => x + y) / a.length : Infinity;
  });
  constructor() {
    effect(() => localStorage.setItem('cubeflow-solves', JSON.stringify(this.solves())));
  }
  @HostListener('window:keydown', ['$event']) down(e: KeyboardEvent) {
    if (e.code !== 'Space' || this.view() !== 'timer' || this.space || this.typing(e)) return;
    e.preventDefault();
    this.space = true;
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }
  @HostListener('window:keyup', ['$event']) up(e: KeyboardEvent) {
    if (e.code !== 'Space' || this.view() !== 'timer' || this.typing(e)) return;
    e.preventDefault();
    this.space = false;
    if (this.state() === 'ready') this.start();
  }
  press() {
    this.state() === 'running' ? this.stop() : this.state.set('ready');
  }
  release() {
    if (this.state() === 'ready') this.start();
  }
  setMode(m: Mode) {
    this.mode.set(m);
    this.reset();
  }
  start() {
    this.started = performance.now();
    this.elapsed.set(0);
    this.state.set('running');
    this.interval = window.setInterval(
      () => this.elapsed.set(performance.now() - this.started),
      10,
    );
  }
  stop() {
    clearInterval(this.interval);
    this.solves.update((v) => [
      {
        id: Date.now(),
        time: this.elapsed(),
        scramble: this.scramble(),
        date: new Date().toISOString(),
        mode: this.mode(),
        caseName: this.mode() === 'PLL' ? PLL[this.selected()].number : undefined,
        penalty: 'none',
      },
      ...v,
    ]);
    this.state.set('idle');
    this.newScramble();
  }
  reset() {
    clearInterval(this.interval);
    this.elapsed.set(0);
    this.state.set('idle');
  }
  newScramble() {
    this.scramble.set(this.makeScramble());
  }
  final(s: Solve) {
    return s.time + (s.penalty === '+2' ? 2000 : 0);
  }
  format(ms: number) {
    if (!Number.isFinite(ms)) return '—';
    const m = Math.floor(ms / 60000),
      s = Math.floor((ms % 60000) / 1000),
      c = Math.floor((ms % 1000) / 10);
    return `${m ? m + ':' : ''}${m ? String(s).padStart(2, '0') : s}.${String(c).padStart(2, '0')}`;
  }
  display(s: Solve) {
    return s.penalty === 'DNF'
      ? 'DNF'
      : this.format(this.final(s)) + (s.penalty === '+2' ? '+' : '');
  }
  penalty(id: number, p: Penalty) {
    this.solves.update((v) =>
      v.map((s) => (s.id === id ? { ...s, penalty: s.penalty === p ? 'none' : p } : s)),
    );
  }
  remove(id: number) {
    this.solves.update((v) => v.filter((s) => s.id !== id));
  }
  async copy(x: Case) {
    if (x.algorithm.includes('登録予定')) return;
    await navigator.clipboard?.writeText(x.algorithm);
    this.copied.set(x.kind + x.number);
    setTimeout(() => this.copied.set(''), 1000);
  }
  private makeScramble() {
    const M = ['R', 'L', 'U', 'D', 'F', 'B'],
      S = ['', "'", '2'],
      r: string[] = [];
    while (r.length < 20) {
      const m = M[Math.floor(Math.random() * 6)];
      if (r.at(-1)?.[0] !== m) r.push(m + S[Math.floor(Math.random() * 3)]);
    }
    return r.join(' ');
  }
  private load() {
    try {
      return JSON.parse(localStorage.getItem('cubeflow-solves') || '[]');
    } catch {
      return [];
    }
  }
  private typing(e: KeyboardEvent) {
    return ['INPUT', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
  }
}
