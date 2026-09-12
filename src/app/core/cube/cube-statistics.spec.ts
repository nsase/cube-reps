import { average, mean } from './cube-statistics';

describe('cube statistics', () => {
  it('meanはすべての値の算術平均を返す', () => {
    expect(mean([1000, 2000, 6000])).toBe(3000);
    expect(mean([])).toBeUndefined();
  });

  it.each([
    [5, 3000],
    [12, 6500],
    [50, 25500],
    [100, 50500],
  ])('AO%dは上位・下位5%%を除外する', (count, expected) => {
    const values = Array.from({ length: count }, (_, index) => (index + 1) * 1000);
    expect(average(values)).toBe(expected);
  });

  it('DNFは最悪値として除外し、除外後に残る場合はDNFにする', () => {
    expect(average([1000, 2000, 3000, 4000, Infinity])).toBe(3000);
    expect(average([1000, 2000, 3000, Infinity, Infinity])).toBe(Infinity);
  });
});
