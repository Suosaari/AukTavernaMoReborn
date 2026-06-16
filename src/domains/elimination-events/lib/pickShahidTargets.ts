import { WheelItem } from '@models/wheel.model';
import { Lot } from '@models/slot.model';
import { Player } from '@domains/players/model/types';

export type ShahidPosition = 'left' | 'right';

export interface ShahidTarget {
  position: ShahidPosition;
  lotId: string;
  lotName: string;
  amount: number;
  player: Player | null;
}

const toTarget = (
  position: ShahidPosition,
  item: WheelItem,
  players: Player[],
  realAmountById: Map<string, number>,
): ShahidTarget => {
  const id = item.id.toString();
  return {
    position,
    lotId: id,
    lotName: item.displayName ?? item.name ?? '—',
    // Show REAL points: the wheel's `amount` is inverted in dropout mode.
    amount: realAmountById.get(id) ?? item.amount ?? 0,
    player: players.find((player) => player.id === item.addedBy) ?? null,
  };
};

/**
 * Builds the "Шахид" blast candidates from the wheel order captured at spin
 * start: the dropped bomb lot's two nearest distinct wheel neighbours — the one
 * to the left and the one to the right (wrapping around). The bomb lot itself is
 * not a candidate (it already dropped via the spin). Degrades gracefully when
 * fewer than two distinct neighbours are available.
 */
export const pickShahidTargets = (
  order: WheelItem[],
  droppedId: string,
  players: Player[],
  slots: Lot[] = [],
): ShahidTarget[] => {
  const length = order.length;
  const index = order.findIndex((item) => item.id.toString() === droppedId);
  if (index === -1) return [];

  const realAmountById = new Map<string, number>();
  for (const slot of slots) {
    if (slot.amount != null) realAmountById.set(slot.id, slot.amount);
  }

  const findNeighbour = (direction: 1 | -1): WheelItem | undefined => {
    for (let offset = 1; offset < length; offset += 1) {
      const candidate = order[(((index + direction * offset) % length) + length) % length];
      if (candidate.id.toString() !== droppedId) return candidate;
    }
    return undefined;
  };

  const left = findNeighbour(-1);
  const right = findNeighbour(1);

  const targets: ShahidTarget[] = [];
  if (left) targets.push(toTarget('left', left, players, realAmountById));
  if (right && right.id.toString() !== left?.id.toString())
    targets.push(toTarget('right', right, players, realAmountById));

  return targets;
};
