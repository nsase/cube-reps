import { DisplayRecordGroup } from './cube.models';

/** ユーザーデータとは分離して常に先頭へ表示する既定の記録グループ。 */
export const DEFAULT_GROUPS: readonly DisplayRecordGroup[] = [
  {
    id: 'unclassified',
    name: 'Unclassified',
    nameKey: 'history.unclassified',
    createdAt: new Date(0).toISOString(),
  },
];

/** 記録先が存在しない場合に使用する既定グループ。 */
export const DEFAULT_GROUP = DEFAULT_GROUPS[0];
