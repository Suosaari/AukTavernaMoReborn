import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isBrowser } from '@utils/ssr';

const STORAGE_KEY = 'mod_pistol_lots';

interface PistolState {
  /** Ids of the lots that currently carry a pistol. */
  pistolLotIds: string[];
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

const initialState: PistolState = {
  pistolLotIds: load(),
};

const pistolSlice = createSlice({
  name: 'pistol',
  initialState,
  reducers: {
    setPistolLotIds(state, action: PayloadAction<string[]>): void {
      state.pistolLotIds = action.payload;
      persist(state.pistolLotIds);
    },
    removePistolLot(state, action: PayloadAction<string>): void {
      state.pistolLotIds = state.pistolLotIds.filter((id) => id !== action.payload);
      persist(state.pistolLotIds);
    },
  },
});

export const { setPistolLotIds, removePistolLot } = pistolSlice.actions;

export default pistolSlice.reducer;
