import { Lot } from '@models/slot.model';
import { Player } from '@domains/players/model/types';

export interface PistolTarget {
  player: Player | null;
  lotId: string;
  lotName: string;
  amount: number;
}

const pickRandom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const takeRandom = <T>(items: T[]): T => items.splice(Math.floor(Math.random() * items.length), 1)[0];

/**
 * Picks two pistol victims, preferring one lot each from two distinct random
 * players (by lot ownership), falling back to random lots when there aren't two
 * player-owned candidates. The shooter then chooses which of the two to fire at.
 */
export const pickPistolTargets = (slots: Lot[], players: Player[], excludeLotIds: string[] = []): PistolTarget[] => {
  const excluded = new Set(excludeLotIds);
  const eligibleLots = slots.filter((lot) => (lot.amount ?? 0) > 0 && lot.name && !excluded.has(lot.id));
  const targets: PistolTarget[] = [];
  const usedLotIds = new Set<string>();

  const availablePlayers = players.filter((player) => eligibleLots.some((lot) => lot.addedBy === player.id));

  while (targets.length < 2 && availablePlayers.length > 0) {
    const player = takeRandom(availablePlayers);
    const owned = eligibleLots.filter((lot) => lot.addedBy === player.id && !usedLotIds.has(lot.id));
    if (owned.length === 0) continue;
    const lot = pickRandom(owned);
    usedLotIds.add(lot.id);
    targets.push({ player, lotId: lot.id, lotName: lot.name || '—', amount: lot.amount ?? 0 });
  }

  while (targets.length < 2) {
    const remaining = eligibleLots.filter((lot) => !usedLotIds.has(lot.id));
    if (remaining.length === 0) break;
    const lot = pickRandom(remaining);
    usedLotIds.add(lot.id);
    targets.push({ player: null, lotId: lot.id, lotName: lot.name || '—', amount: lot.amount ?? 0 });
  }

  return targets;
};
