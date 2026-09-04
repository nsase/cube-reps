import { TestBed } from '@angular/core/testing';
import { SystemStore } from './system.store';

describe('SystemStore', () => {
  it('ブラウザのオンライン・オフラインイベントを接続状態へ反映する', () => {
    const store = TestBed.inject(SystemStore);

    window.dispatchEvent(new Event('offline'));
    expect(store.online()).toBe(false);

    window.dispatchEvent(new Event('online'));
    expect(store.online()).toBe(true);
  });
});
