import { projectCubePoint } from './cube-quarter-projection';

describe('クォータービューの透視投影', () => {
  it('手前の縦辺を奥の縦辺より大きく描画する', () => {
    const length = (column: number) => {
      const top = projectCubePoint('F', column, 0);
      const bottom = projectCubePoint('F', column, 3);
      return Math.hypot(bottom[0] - top[0], bottom[1] - top[1]);
    };
    expect(length(3)).toBeGreaterThan(length(0) * 1.1);
  });

  it('上面・前面・右面が共有するすべての交点を一致させる', () => {
    for (let index = 0; index <= 3; index++) {
      const pairs = [
        [projectCubePoint('U', index, 3), projectCubePoint('F', index, 0)],
        [projectCubePoint('F', 3, index), projectCubePoint('R', 0, index)],
        [projectCubePoint('U', 3, index), projectCubePoint('R', 3 - index, 0)],
      ];
      for (const [left, right] of pairs) {
        expect(left[0]).toBeCloseTo(right[0]);
        expect(left[1]).toBeCloseTo(right[1]);
      }
    }
  });

  it('全ステッカーの交点を余白付きでviewBoxに収める', () => {
    for (const face of ['U', 'F', 'R'] as const) {
      for (let row = 0; row <= 3; row++) {
        for (let column = 0; column <= 3; column++) {
          const [x, y] = projectCubePoint(face, column, row);
          expect(x).toBeGreaterThan(4);
          expect(x).toBeLessThan(156);
          expect(y).toBeGreaterThan(4);
          expect(y).toBeLessThan(152);
        }
      }
    }
  });
});
