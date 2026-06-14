import { Lot } from '@models/slot.model';

/** Real (named, non-empty) lots are eligible to carry a pistol. */
export const getEligiblePistolLots = (lots: Lot[]): Lot[] => lots.filter((lot) => !!lot.name && lot.name.trim().length > 0);

/** Picks `count` distinct random lot ids to carry a pistol. */
export const pickPistolLotIds = (lots: Lot[], count: number): string[] => {
  const eligible = getEligiblePistolLots(lots);
  if (eligible.length === 0) return [];

  const ids = eligible.map((lot) => lot.id);
  const chosen = new Set<string>();
  const target = Math.min(count, ids.length);
  while (chosen.size < target) {
    chosen.add(ids[Math.floor(Math.random() * ids.length)]);
  }
  return [...chosen];
};
