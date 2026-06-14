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
  it('returns the dropped lot in the middle with its two neighbours', () => {
    const targets = pickShahidTargets(order, 'C', []);

    expect(targets.map((target) => [target.position, target.lotId])).toEqual([
      ['left', 'B'],
      ['middle', 'C'],
      ['right', 'D'],
    ]);
  });

  it('wraps around at the edges of the wheel', () => {
    const targets = pickShahidTargets(order, 'A', []);

    expect(targets.map((target) => target.lotId)).toEqual(['E', 'A', 'B']);
  });

  it('collapses to two cards when only one distinct neighbour exists', () => {
    const targets = pickShahidTargets([item('A'), item('B')], 'A', []);

    expect(targets.map((target) => target.lotId)).toEqual(['B', 'A']);
  });

  it('returns just the middle for a single-lot wheel', () => {
    const targets = pickShahidTargets([item('A')], 'A', []);

    expect(targets.map((target) => target.position)).toEqual(['middle']);
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
