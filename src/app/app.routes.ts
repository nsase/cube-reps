import { Routes } from '@angular/router';

/** Algorithm画面を遅延読み込みする。 */
const loadAlgorithms = () =>
  import('./features/algorithms/algorithms').then(({ Algorithms }) => Algorithms);

/** 静的配信で直接アクセスできるアプリケーションルート。 */
export const routes: Routes = [
  {
    path: 'timer',
    data: { titleKey: 'routes.timer' },
    loadComponent: () => import('./features/timer/timer').then(({ Timer }) => Timer),
  },
  {
    path: 'algorithms/oll',
    data: { kind: 'OLL', titleKey: 'routes.algorithms' },
    loadComponent: loadAlgorithms,
  },
  {
    path: 'algorithms/pll',
    data: { kind: 'PLL', titleKey: 'routes.algorithms' },
    loadComponent: loadAlgorithms,
  },
  {
    path: 'algorithms',
    pathMatch: 'full',
    redirectTo: 'algorithms/pll',
  },
  {
    path: 'history',
    data: { titleKey: 'routes.history' },
    loadComponent: () => import('./features/history/history').then(({ History }) => History),
  },
  {
    path: 'login',
    data: { titleKey: 'routes.login' },
    loadComponent: () => import('./features/login/login').then(({ Login }) => Login),
  },
  {
    path: 'settings',
    data: { titleKey: 'routes.settings' },
    loadComponent: () => import('./features/settings/settings').then(({ Settings }) => Settings),
  },
  { path: '', pathMatch: 'full', redirectTo: 'timer' },
  { path: '**', redirectTo: 'timer' },
];
