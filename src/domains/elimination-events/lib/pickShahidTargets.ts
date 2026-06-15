import { WheelItem } from '@models/wheel.model';
import { Player } from '@domains/players/model/types';

export type ShahidPosition = 'left' | 'right';

export interface ShahidTarget {
  position: ShahidPosition;
  lotId: string;
  lotName: string;
  amount: number;
  player: Player | null;
}

const toTarget = (position: ShahidPosition, item: WheelItem, players: Player[]): ShahidTarget => ({
  position,
  lotId: item.id.toString(),
  lotName: item.displayName ?? item.name ?? '—',
  amount: item.amount ?? 0,
  player: players.find((player) => player.id === item.addedBy) ?? null,
});

/**
 * Builds the "Шахид" blast candidates from the wheel order captured at spin
 * start: the dropped bomb lot's two nearest distinct wheel neighbours — the one
 * to the left and the one to the right (wrapping around). The bomb lot itself is
 * not a candidate (it already dropped via the spin). Degrades gracefully when
 * fewer than two distinct neighbours are available.
 */
export const pickShahidTargets = (order: WheelItem[], droppedId: string, players: Player[]): ShahidTarget[] => {
  const length = order.length;
  const index = order.findIndex((item) => item.id.toString() === droppedId);
  if (index === -1) return [];

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
  if (left) targets.push(toTarget('left', left, players));
  if (right && right.id.toString() !== left?.id.toString()) targets.push(toTarget('right', right, players));

  return targets;
};
