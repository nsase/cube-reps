import { TestBed } from '@angular/core/testing';
import { FirestoreConnection } from './firestore-connection';
import {
  FirestoreAlgorithmRepository,
  readAlgorithmPreference,
} from './firestore-algorithm.repository';
import { AlgorithmPreference } from '../cube/cube.models';

/** SDK境界で取得範囲と保存形式を確認する。 */
const sdk = vi.hoisted(() => ({
  collection: vi.fn((...args: unknown[]) => args),
  query: vi.fn((...args: unknown[]) => args),
  where: vi.fn((...args: unknown[]) => args),
  getDocsFromServer: vi.fn(async () => ({ docs: [] })),
  doc: vi.fn((...args: unknown[]) => args),
  setDoc: vi.fn(async (_reference: unknown, _document: unknown) => undefined),
  serverTimestamp: vi.fn(() => 'server-time'),
}));
vi.mock('firebase/firestore', () => sdk);

/** 空設定も有効な削除通知として扱う。 */
const preference: AlgorithmPreference = {
  caseKey: 'OLL-01',
  custom: [],
  ownerId: 'alice',
  ownerType: 'account',
  pendingSync: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  schemaVersion: 3,
};

describe('FirestoreAlgorithmRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: FirestoreConnection, useValue: { client: async () => 'db' } }],
    });
  });
  it('指定された種類をサーバークエリで絞り込む', async () => {
    await TestBed.inject(FirestoreAlgorithmRepository).list('alice', 'F2L');
    expect(sdk.collection).toHaveBeenCalledWith('db', 'users', 'alice', 'algorithmPreferences');
    expect(sdk.where).toHaveBeenCalledWith('kind', '==', 'F2L');
    expect(sdk.getDocsFromServer).toHaveBeenCalledTimes(1);
  });
  it('削除を空配列で送信し、未送信フラグやundefinedをクラウドへ保存しない', async () => {
    await TestBed.inject(FirestoreAlgorithmRepository).put('alice', {
      ...preference,
      favoriteId: undefined,
    });
    expect(sdk.setDoc.mock.lastCall?.[1]).toEqual({
      caseKey: 'OLL-01',
      kind: 'OLL',
      custom: [],
      ownerId: 'alice',
      ownerType: 'account',
      schemaVersion: 3,
      createdAt: new Date(preference.createdAt),
      updatedAt: 'server-time',
    });
  });
  it('別アカウントやゲストの設定を送信しない', async () => {
    const repository = TestBed.inject(FirestoreAlgorithmRepository);
    await expect(repository.put('bob', preference)).rejects.toThrow('owner mismatch');
    await expect(repository.put('alice', { ...preference, ownerType: 'guest' })).rejects.toThrow(
      'owner mismatch',
    );
    expect(sdk.setDoc).not.toHaveBeenCalled();
  });
  it('所有者・ID・手順形式を検証して空設定を復元する', () => {
    expect(readAlgorithmPreference('OLL-01', preference, 'alice')).toEqual(
      expect.objectContaining({ custom: [], ownerId: 'alice' }),
    );
    expect(readAlgorithmPreference('PLL-T', preference, 'alice')).toBeUndefined();
    expect(readAlgorithmPreference('OLL-01', preference, 'bob')).toBeUndefined();
    expect(
      readAlgorithmPreference('OLL-01', { ...preference, custom: [{ id: 'bad' }] }, 'alice'),
    ).toBeUndefined();
  });
});
