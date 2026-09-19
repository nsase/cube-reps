/** 表示番号とは独立した識別子を持つF2Lケース。手順は初期画面用のダミー。 */
export interface F2lCase {
  /** 番号変更後もケースを識別する永続ID。 */
  readonly id: string;
  /** 一覧に表示するケース番号。 */
  readonly number: number;
  /** 仮の解法手順。 */
  readonly solve: string;
  /** 仮のセットアップ手順。 */
  readonly setup: string;
}

/** F2Lの41ケース。IDは番号の変更や並べ替え時も維持する。 */
export const F2L_CASES: readonly F2lCase[] = [
  { id: 'fef0ef90-e57b-4f15-ac02-7504c0abba50', number: 1, solve: "R U R'", setup: "R U' R'" },
  { id: '5ed38198-0479-4bba-9dd3-edbf2e17c3e0', number: 2, solve: "R U R'", setup: "R U' R'" },
  { id: '849d49f6-4441-4ef5-9fc6-06e28fbea9d4', number: 3, solve: "R U R'", setup: "R U' R'" },
  { id: 'b054b565-b5f5-4180-8f34-897a93c06572', number: 4, solve: "R U R'", setup: "R U' R'" },
  { id: '1df52fd1-c5c8-4479-88bd-07b7bc0ce63a', number: 5, solve: "R U R'", setup: "R U' R'" },
  { id: 'ff6a92a0-5390-4b9c-b39d-8225b3a5ad62', number: 6, solve: "R U R'", setup: "R U' R'" },
  { id: '2d3110dd-fc0a-4246-8f9c-2d5c2f90cfae', number: 7, solve: "R U R'", setup: "R U' R'" },
  { id: 'd56308c4-1d24-4790-a7d6-ed87e27e4fb7', number: 8, solve: "R U R'", setup: "R U' R'" },
  { id: '29963682-0b31-477c-9f72-3d0f50a2cbb3', number: 9, solve: "R U R'", setup: "R U' R'" },
  { id: 'cc3e9e91-513c-43e4-be0a-e27084b73404', number: 10, solve: "R U R'", setup: "R U' R'" },
  { id: 'dc331824-9ce2-4ea2-b961-ebb3efa90502', number: 11, solve: "R U R'", setup: "R U' R'" },
  { id: 'e17cd379-ee82-4464-9b27-851810ec0f0f', number: 12, solve: "R U R'", setup: "R U' R'" },
  { id: '48acc33a-178f-4ff1-95de-a95b8d35c279', number: 13, solve: "R U R'", setup: "R U' R'" },
  { id: 'd7f0d5c2-9653-497f-9818-823a22ef61fe', number: 14, solve: "R U R'", setup: "R U' R'" },
  { id: 'cbc926d9-adcc-4895-8e85-3e1d5194ec7d', number: 15, solve: "R U R'", setup: "R U' R'" },
  { id: '4a984724-e619-4bd4-a2a0-1fbd547f92e5', number: 16, solve: "R U R'", setup: "R U' R'" },
  { id: 'b9aeb3d9-93fb-44ff-b59d-7e6d6204c737', number: 17, solve: "R U R'", setup: "R U' R'" },
  { id: 'a690d4e4-fbf4-4561-8b8e-3c3f81ee933f', number: 18, solve: "R U R'", setup: "R U' R'" },
  { id: 'b95f7219-3037-4a5d-b04f-4966fc1fdd46', number: 19, solve: "R U R'", setup: "R U' R'" },
  { id: 'f1bc1ff7-4733-4476-9709-653e8efd760b', number: 20, solve: "R U R'", setup: "R U' R'" },
  { id: '04380496-f858-4910-86fb-70c44cac2e45', number: 21, solve: "R U R'", setup: "R U' R'" },
  { id: '43a4b677-d8cb-40cc-a0a7-2ac11a21a5c8', number: 22, solve: "R U R'", setup: "R U' R'" },
  { id: 'cef9fbdc-0690-4259-8abe-25d48e054feb', number: 23, solve: "R U R'", setup: "R U' R'" },
  { id: '65a5f265-9aa9-40f6-82ba-565e2886ba61', number: 24, solve: "R U R'", setup: "R U' R'" },
  { id: '4e84f6d9-f42e-40eb-9b16-77257e9f1201', number: 25, solve: "R U R'", setup: "R U' R'" },
  { id: '8cd138c8-e3b7-4c66-9f93-0504fb1b5c47', number: 26, solve: "R U R'", setup: "R U' R'" },
  { id: '3b2df4bf-d281-4b97-9515-5e7dc16ce8c7', number: 27, solve: "R U R'", setup: "R U' R'" },
  { id: 'eeb75dbd-5460-4868-be8f-aa0f51fcbb59', number: 28, solve: "R U R'", setup: "R U' R'" },
  { id: '54445579-3c40-432d-a1f7-c45311067f78', number: 29, solve: "R U R'", setup: "R U' R'" },
  { id: 'ee4dd02c-173e-40fa-abd9-dc50ac7994b3', number: 30, solve: "R U R'", setup: "R U' R'" },
  { id: 'edc34784-810c-4f2e-8052-97d73034f5bf', number: 31, solve: "R U R'", setup: "R U' R'" },
  { id: '7f3f075f-e8f3-4d46-8c81-7b7a849d7aac', number: 32, solve: "R U R'", setup: "R U' R'" },
  { id: 'c43c3966-fb6b-448b-9670-ad659496ff61', number: 33, solve: "R U R'", setup: "R U' R'" },
  { id: 'ba9fe154-6248-42af-b481-2c3242962659', number: 34, solve: "R U R'", setup: "R U' R'" },
  { id: '6ded1695-31e5-4fcf-8707-431d5798fefd', number: 35, solve: "R U R'", setup: "R U' R'" },
  { id: 'a3d0b756-bb7b-48ea-aaf9-405857307eb8', number: 36, solve: "R U R'", setup: "R U' R'" },
  { id: '5d0f5af8-76f5-4066-9f6e-219277ae9b04', number: 37, solve: "R U R'", setup: "R U' R'" },
  { id: 'bfc48167-1bda-4c98-b3ff-af8c711a8c1d', number: 38, solve: "R U R'", setup: "R U' R'" },
  { id: '150246ac-5309-4653-884f-6f3dfe3698ed', number: 39, solve: "R U R'", setup: "R U' R'" },
  { id: '99375c14-08b7-4b95-ba6f-b4bea35a50e7', number: 40, solve: "R U R'", setup: "R U' R'" },
  { id: 'e3062c60-be2b-4dcc-a54f-8b2683490db2', number: 41, solve: "R U R'", setup: "R U' R'" },
];
