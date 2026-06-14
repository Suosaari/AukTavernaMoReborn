import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { isBrowser } from '@utils/ssr';

import { pickPlayerColor } from '../lib/playerColors';
import { Player } from './types';

const STORAGE_KEY = 'mod_players';

interface PlayersState {
  players: Player[];
}

const loadPlayers = (): Player[] => {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Player[]) : [];
  } catch {
    return [];
  }
};

const persist = (players: Player[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
};

const initialState: PlayersState = {
  players: loadPlayers(),
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    addPlayer(state, action: PayloadAction<string>): void {
      const name = action.payload.trim();
      if (!name) return;

      const color = pickPlayerColor(state.players.map((player) => player.color));
      state.players.push({ id: uuidv4(), name, color });
      persist(state.players);
    },
    removePlayer(state, action: PayloadAction<string>): void {
      state.players = state.players.filter((player) => player.id !== action.payload);
      persist(state.players);
    },
    updatePlayer(state, action: PayloadAction<Partial<Player> & { id: string }>): void {
      const { id, ...rest } = action.payload;
      const player = state.players.find((item) => item.id === id);
      if (player) {
        Object.assign(player, rest);
        persist(state.players);
      }
    },
    setPlayers(state, action: PayloadAction<Player[]>): void {
      state.players = action.payload;
      persist(state.players);
    },
  },
});

export const { addPlayer, removePlayer, updatePlayer, setPlayers } = playersSlice.actions;

export default playersSlice.reducer;
