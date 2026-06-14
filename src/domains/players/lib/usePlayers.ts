import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

import { Player } from '../model/types';

export const usePlayers = (): Player[] => useSelector((root: RootState) => root.players.players);

export const usePlayer = (id?: string | null): Player | undefined =>
  useSelector((root: RootState) => (id ? root.players.players.find((player) => player.id === id) : undefined));

/** Two-letter initials used for the compact player avatar. */
export const getPlayerInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
