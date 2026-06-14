import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isBrowser } from '@utils/ssr';

import { Decoration } from './types';

const STORAGE_KEY = 'mod_decorations';

interface DecorationsState {
  decorations: Decoration[];
}

const loadDecorations = (): Decoration[] => {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Decoration[]).map((decoration) => ({ ...decoration, pinned: decoration.pinned ?? false }));
  } catch {
    return [];
  }
};

const persist = (decorations: Decoration[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decorations));
};

const initialState: DecorationsState = {
  decorations: loadDecorations(),
};

const decorationsSlice = createSlice({
  name: 'decorations',
  initialState,
  reducers: {
    addDecoration(state, action: PayloadAction<Decoration>): void {
      state.decorations.push(action.payload);
      persist(state.decorations);
    },
    removeDecoration(state, action: PayloadAction<string>): void {
      state.decorations = state.decorations.filter((item) => item.id !== action.payload);
      persist(state.decorations);
    },
    updateDecoration(state, action: PayloadAction<Partial<Decoration> & { id: string }>): void {
      const { id, ...rest } = action.payload;
      const decoration = state.decorations.find((item) => item.id === id);
      if (decoration) {
        Object.assign(decoration, rest);
        persist(state.decorations);
      }
    },
    setAllPinned(state, action: PayloadAction<boolean>): void {
      state.decorations.forEach((decoration) => {
        decoration.pinned = action.payload;
      });
      persist(state.decorations);
    },
  },
});

export const { addDecoration, removeDecoration, updateDecoration, setAllPinned } = decorationsSlice.actions;

export default decorationsSlice.reducer;
