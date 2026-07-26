import { describe, it, expect } from 'vitest';
import {
  parseCell, parseGridOneWay, parseGridTwoWay, detectReplication,
} from '@/utils/anova.utils';

describe('parseCell', () => {
  it('parses comma/space separated numbers, ignoring blanks', () => {
    expect(parseCell('1, 2 3')).toEqual([1, 2, 3]);
    expect(parseCell('  ')).toEqual([]);
    expect(parseCell('4')).toEqual([4]);
  });
  it('ignores non-numeric tokens', () => {
    expect(parseCell('1, x, 3')).toEqual([1, 3]);
  });
});

describe('parseGridOneWay (columns = groups)', () => {
  it('collects each column into a group, flattening cell values', () => {
    // grid[row][col]
    const grid = [
      ['1', '10'],
      ['2', '20'],
      ['3', ''],
    ];
    const groups = parseGridOneWay(grid, ['G1', 'G2']);
    expect(groups).toEqual([
      { label: 'G1', values: [1, 2, 3] },
      { label: 'G2', values: [10, 20] },
    ]);
  });
});

describe('parseGridTwoWay', () => {
  it('parses each cell into a replicate array', () => {
    const grid = [
      ['1,2', '3,4'],
      ['5,6', '7,8'],
    ];
    const m = parseGridTwoWay(grid);
    expect(m).toEqual([
      [[1, 2], [3, 4]],
      [[5, 6], [7, 8]],
    ]);
  });
});

describe('detectReplication', () => {
  it('true when every cell has >1 value', () => {
    expect(detectReplication([[[1, 2]], [[3, 4]]])).toEqual({ replication: true, r: 2 });
  });
  it('false when cells have a single value', () => {
    expect(detectReplication([[[1]], [[3]]])).toEqual({ replication: false, r: 1 });
  });
});
