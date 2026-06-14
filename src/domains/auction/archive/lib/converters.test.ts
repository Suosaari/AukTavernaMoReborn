import { describe, expect, it } from 'vitest';

import { archivedLotsToSlots, slotsToArchivedLots } from './converters';

import type { ArchivedLot, Lot } from '@models/slot.model';

const createLot = (props: Partial<Lot> = {}): Lot => ({
  id: props.id ?? Math.random().toString(),
  fastId: props.fastId ?? 1,
  name: props.name ?? '',
  amount: props.amount ?? 0,
  contributors: props.contributors ?? [],
  isFavorite: props.isFavorite ?? false,
  addedBy: props.addedBy ?? null,
});

describe('archive converters', () => {
  it('keeps the lot owner (addedBy) when archiving slots', () => {
    const slots = [createLot({ name: 'Game', amount: 100, addedBy: 'player-1' })];

    expect(slotsToArchivedLots(slots)[0].addedBy).toBe('player-1');
  });

  it('defaults addedBy to null when a slot has no owner', () => {
    const slots = [createLot({ name: 'Game', amount: 100 })];

    expect(slotsToArchivedLots(slots)[0].addedBy).toBeNull();
  });

  it('restores the lot owner when loading an archive', () => {
    const lots: ArchivedLot[] = [{ name: 'Game', amount: 100, contributors: [], addedBy: 'player-1' }];

    expect(archivedLotsToSlots(lots)[0].addedBy).toBe('player-1');
  });

  it('preserves addedBy across a save/load round-trip', () => {
    const slots = [
      createLot({ name: 'A', amount: 10, addedBy: 'player-1' }),
      createLot({ name: 'B', amount: 20, addedBy: null }),
    ];

    const restored = archivedLotsToSlots(slotsToArchivedLots(slots));

    expect(restored.map((lot) => lot.addedBy)).toEqual(['player-1', null]);
  });
});
