import { FC } from 'react';

import { getPlayerInitials } from '../lib/usePlayers';
import { Player } from '../model/types';

interface PlayerAvatarProps {
  player: Player;
  size?: number;
  title?: string;
}

/** A small colored circle with the player's initials. */
const PlayerAvatar: FC<PlayerAvatarProps> = ({ player, size = 22, title }) => {
  return (
    <span
      title={title ?? player.name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: player.color || '#666',
        color: '#fff',
        fontSize: Math.round(size * 0.42),
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {getPlayerInitials(player.name)}
    </span>
  );
};

export default PlayerAvatar;
