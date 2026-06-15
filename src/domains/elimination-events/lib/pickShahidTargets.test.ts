import { describe, expect, it } from 'vitest';

import { pickShahidTargets } from './pickShahidTargets';

import type { Player } from '@domains/players/model/types';
import type { WheelItem } from '@models/wheel.model';

const item = (id: string, addedBy: string | null = null): WheelItem => ({
  id,
  name: `lot-${id}`,
  color: '#000',
  amount: 1,
  addedBy,
});

const order = [item('A'), item('B'), item('C'), item('D'), item('E')];

describe('pickShahidTargets', () => {
  it('returns the dropped lot\'s left and right neighbours (no middle)', () => {
    const targets = pickShahidTargets(order, 'C', []);

    expect(targets.map((target) => [target.position, target.lotId])).toEqual([
      ['left', 'B'],
      ['right', 'D'],
    ]);
  });

  it('wraps around at the edges of the wheel', () => {
    const targets = pickShahidTargets(order, 'A', []);

    expect(targets.map((target) => target.lotId)).toEqual(['E', 'B']);
  });

  it('returns a single neighbour when only one distinct lot is left beside it', () => {
    const targets = pickShahidTargets([item('A'), item('B')], 'A', []);

    expect(targets.map((target) => target.lotId)).toEqual(['B']);
  });

  it('returns nothing for a single-lot wheel', () => {
    expect(pickShahidTargets([item('A')], 'A', [])).toEqual([]);
  });

  it('returns nothing when the dropped lot is not on the wheel', () => {
    expect(pickShahidTargets(order, 'Z', [])).toEqual([]);
  });

  it('resolves the owning player from addedBy', () => {
    const player: Player = { id: 'p1', name: 'Alice', color: '#f00' };
    const targets = pickShahidTargets([item('A'), item('B', 'p1'), item('C')], 'A', [player]);

    const right = targets.find((target) => target.position === 'right');
    expect(right?.player).toEqual(player);
  });
});
