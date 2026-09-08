import { RecordGroup } from '../cube.models';
import { fromFirestoreRecordGroup, toFirestoreGroupRecord } from './firestore-group.mapper';

/** グループの日時と端末専用情報の境界を検証する。 */
describe('Firestore group mapper', () => {
  const group: RecordGroup = {
    id: 'group',
    name: 'Practice',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: '2026-01-03T00:00:00.000Z',
    ownerType: 'guest',
    schemaVersion: 3,
    pendingSync: true,
  };
  it('日時をtimestamp互換形式へ変換し、端末専用情報を送信しない', () => {
    const stored = toFirestoreGroupRecord(group, 'account');
    expect(stored.createdAt).toEqual(new Date(group.createdAt));
    expect(stored.updatedAt).toEqual(new Date(group.updatedAt));
    expect(stored.deletedAt).toEqual(new Date(group.deletedAt!));
    expect(stored).not.toHaveProperty('pendingSync');
    expect(fromFirestoreRecordGroup(group.id, stored, 'account')).toEqual({
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      deletedAt: group.deletedAt,
      ownerType: 'account',
      ownerId: 'account',
      schemaVersion: 3,
    });
  });
  it('名前と作成日時が不正なドキュメントを除外する', () => {
    for (const name of [null, 1, '', '   ']) {
      expect(fromFirestoreRecordGroup('id', { ...group, name }, 'account')).toBeUndefined();
    }
    expect(
      fromFirestoreRecordGroup('id', { ...group, createdAt: 'invalid' }, 'account'),
    ).toBeUndefined();
  });
});
