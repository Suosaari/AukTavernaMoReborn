import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isBrowser } from '@utils/ssr';

const STORAGE_KEY = 'mod_bomb_lots';

interface BombState {
  /** Ids of the lots that currently carry a bomb ("Шахид"). */
  bombLotIds: string[];
}

const load = (): string[] => {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const persist = (ids: string[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

const initialState: BombState = {
  bombLotIds: load(),
};

const bombSlice = createSlice({
  name: 'bomb',
  initialState,
  reducers: {
    setBombLotIds(state, action: PayloadAction<string[]>): void {
      state.bombLotIds = action.payload;
      persist(state.bombLotIds);
    },
    removeBombLot(state, action: PayloadAction<string>): void {
      state.bombLotIds = state.bombLotIds.filter((id) => id !== action.payload);
      persist(state.bombLotIds);
    },
  },
});

export const { setBombLotIds, removeBombLot } = bombSlice.actions;

export default bombSlice.reducer;
