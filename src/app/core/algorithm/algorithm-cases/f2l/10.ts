import { defineF2lCase } from './f2l-case';

/** F2L 10のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 9
// CubeRoot R-
export const F2L_10_CASE = defineF2lCase({
  number: '10',
  group: 'Disconnected Pairs',
  setup: "F' U F U' R U R' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: '29963682-0b31-477c-9f72-3d0f50a2cbb3',
          notation: "U' R U' R' U F' U' F",
        },
        {
          id: '52ab5e87-d367-4fd1-b4b1-70f228bb5598',
          notation: "F R U R' U' F' R U' R'",
        },
        {
          id: '9da1fb2d-32cf-46b7-818c-8b971b9edff7',
          notation: "U' R U' R' Dw R' U' R",
        },
        {
          id: '4390a6a8-9e89-4839-a6f6-bed9c7d4ab52',
          notation: "Dw R' U' R U' R' U' R",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'df0ba694-882b-40df-9a57-20bb44d2d6b9',
          notation: "U L' U' L U' L' U' L",
        },
        {
          id: '43afa717-b93c-40f2-9ceb-01a0588c0e5c',
          notation: "F2 U R U' R' F2",
        },
        {
          id: 'c957045b-1a54-4446-b90b-23ba8af0cd27',
          notation: "U' F U' F' U L' U' L",
        },
        {
          id: '95da4711-c8ee-4725-96aa-8e7c0aaf2f24',
          notation: "L' U L U' L' U' L U2 L' U L",
        },
        {
          id: '45dd5dab-d651-4f55-b56f-651fc3ff0066',
          notation: "U2 L' U L U L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '0637ec9c-2f7b-4d7d-a489-35842cbaee96',
          notation: "y U R' U' R U' R' U' R",
        },
        {
          id: '9cefabdc-f830-479a-8022-a4035783a347',
          notation: "U' L U' L' U Fw' L' Fw",
        },
        {
          id: 'd9903154-bf83-4486-b894-fca9019890ea',
          notation: "Dw L' U' L U' L' U' L",
        },
        {
          id: 'c952de96-15bd-45e6-9532-79be8b390478',
          notation: "y U2 R' U R U R' U' R",
        },
        {
          id: 'fdd576e3-407f-4873-895d-d4ae09d33c7d',
          notation: "U' L U' L' Dw L' U' L",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '34581e08-18ec-46a8-a797-9913c15d48c5',
          notation: "U R' U' R U' R' U' R",
        },
        {
          id: 'f8d893d1-28d3-4ade-b143-9422c8cd75fc',
          notation: "R' U R U' R' U' R U2 R' U R",
        },
        {
          id: 'ef886f14-0ae8-447d-a49d-7cd972a1cb73',
          notation: "U2 R' U R U R' U' R",
        },
        {
          id: '0fa86b02-181c-425c-aff0-e81f854f9db0',
          notation: "U2 Rw U R' U R' U' R2 U' Rw'",
        },
      ],
    },
  },
});
