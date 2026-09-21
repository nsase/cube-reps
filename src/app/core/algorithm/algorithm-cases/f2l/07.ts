import { defineF2lCase } from './f2l-case';

/** F2L 07のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 7
// CubeRoot M+
export const F2L_07_CASE = defineF2lCase({
  number: '07',
  group: 'Disconnected Pairs',
  setup: "R U R' U2 R U2 R' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: '2d3110dd-fc0a-4246-8f9c-2d5c2f90cfae',
          notation: "U' R U2 R' U' R U2 R'",
        },
        {
          id: 'e17cd379-ee82-4464-9b27-851810ec0f0f',
          notation: "M' U' M U2 Rw U' Rw'",
        },
        {
          id: '6f07af80-4925-4a79-a867-229ac5a90b66',
          notation: "U' R U2 R' U2 R U' R'",
        },
        {
          id: 'b935a1f1-0e91-41ba-9c9b-58dd41dacf2a',
          notation: "U' R U2 R' U R' F R F'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'd1ce3f7f-dd43-4b0e-a2b6-29573fee193a',
          notation: "F U R U2 R' U F'",
        },
        {
          id: '7a441f4b-1f78-4fb4-8a25-b9520d07239c',
          notation: "Dw' L U2 L' U2 L U' L'",
        },
        {
          id: '2a69303e-7db8-4ab1-96fd-5a91a79ca27e',
          notation: "U' F U2 R U' R' U F'",
        },
        {
          id: 'f0bf1804-bce1-4241-a380-488ae089b066',
          notation: "Lw U2 L2 U' L2 U' Lw'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '13a01800-55ae-4aa7-9ed0-e6f1d09e9121',
          notation: "U' L U2 L' U2 L U' L'",
        },
        {
          id: '40b693d7-4c7d-4635-8e96-bd8e643645df',
          notation: "U' L U2 L' U' L U2 L'",
        },
        {
          id: '04d59dec-73b8-411d-8281-76f98150250e',
          notation: "M U' M' U2 Lw U' Lw'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '1cd65cd9-18cd-40a1-a081-e8cff7f72b4d',
          notation: "Rw U2 R2 U' R2 U' Rw'",
        },
        {
          id: 'c0c520c9-8b80-4094-a6da-b8095bb45e6e',
          notation: "F R U R2 U' R F'",
        },
        {
          id: '6dce5aba-bc77-4dc2-b75c-cba47f9c0ef4',
          notation: "y' U' L U2 L' U2 L U' L'",
        },
        {
          id: '6166a4d0-540d-4e10-af50-d70395423fc8',
          notation: "y U' R U2 R' U2 R U' R'",
        },
      ],
    },
  },
});
