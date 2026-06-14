export interface LotContributor {
  name: string;
  amount: number;
}

export interface Lot {
  fastId: number;
  id: string;
  name: string | null;
  amount: number | null;
  contributors?: LotContributor[];
  lockedPercentage?: number | null;
  isFavorite?: boolean;
  /** Id of the player who added this lot (mod feature). */
  addedBy?: string | null;
}

export type SlotResponse = Lot;

export type ArchivedLot = Omit<Lot, 'id' | 'fastId'>;
