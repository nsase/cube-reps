import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { SettingsStore } from './settings.store';

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['ja-JP', 'ja'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
  ])('初回はブラウザ言語%sから%sを選ぶ', (browserLanguage, expected) => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(browserLanguage);
    expect(TestBed.inject(SettingsStore).language()).toBe(expected);
    expect(document.documentElement.lang).toBe(expected);
  });

  it('ブラウザ言語より保存した選択を優先する', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ja-JP');
    localStorage.setItem('cube-reps.language', 'en');
    expect(TestBed.inject(SettingsStore).language()).toBe('en');
  });

  it.each([null, 'invalid', 'en', 'ja'])('保存言語%sを検証して復元する', (saved) => {
    if (saved) localStorage.setItem('cube-reps.language', saved);
    const store = TestBed.inject(SettingsStore);
    const expected = saved === 'ja' ? 'ja' : 'en';
    expect(store.language()).toBe(expected);
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe(expected);
    expect(document.documentElement.lang).toBe(expected);
  });

  it('言語の変更を文書と保存先へ反映し、不正な値は無視する', () => {
    const store = TestBed.inject(SettingsStore);
    store.setLanguage('ja');
    expect(store.language()).toBe('ja');
    expect(localStorage.getItem('cube-reps.language')).toBe('ja');
    expect(document.documentElement.lang).toBe('ja');
    store.setLanguage('invalid');
    expect(store.language()).toBe('ja');
    store.setLanguage('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('cube-reps.language')).toBe('en');
  });
});
