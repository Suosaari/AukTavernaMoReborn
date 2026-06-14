import { Menu } from '@mantine/core';
import { IconUserPlus, IconUserX } from '@tabler/icons-react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { setSlotData } from '@reducers/Slots/Slots';

import { usePlayer, usePlayers } from '../lib/usePlayers';
import PlayerAvatar from './PlayerAvatar';

interface LotOwnerControlProps {
  lotId: string;
  addedBy?: string | null;
  size?: number;
}

/**
 * Compact per-lot control to assign "who added this lot". Shows the owner's
 * avatar (or an add-person icon when unset) and opens a menu to pick/clear.
 */
const LotOwnerControl: FC<LotOwnerControlProps> = ({ lotId, addedBy, size = 22 }) => {
  const players = usePlayers();
  const owner = usePlayer(addedBy);
  const dispatch = useDispatch();

  const setOwner = (playerId: string | null): void => {
    dispatch(setSlotData({ id: lotId, addedBy: playerId }));
  };

  return (
    <Menu width={220} shadow='lg' position='bottom-start' withArrow trapFocus={false}>
      <Menu.Target>
        <button
          type='button'
          title={owner ? `Добавил: ${owner.name}` : 'Кто добавил лот'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
          }}
        >
          {owner ? (
            <PlayerAvatar player={owner} size={size} />
          ) : (
            <IconUserPlus size={Math.round(size * 0.8)} color='var(--mantine-color-dimmed, #888)' opacity={0.6} />
          )}
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Кто добавил лот</Menu.Label>
        {players.length === 0 && <Menu.Item disabled>Нет игроков (добавьте в меню «Игроки»)</Menu.Item>}
        {players.map((player) => (
          <Menu.Item
            key={player.id}
            leftSection={<PlayerAvatar player={player} size={18} />}
            onClick={() => setOwner(player.id)}
            color={player.id === addedBy ? 'blue' : undefined}
          >
            {player.name}
          </Menu.Item>
        ))}
        {addedBy && (
          <>
            <Menu.Divider />
            <Menu.Item leftSection={<IconUserX size={16} />} color='red' onClick={() => setOwner(null)}>
              Убрать
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default LotOwnerControl;
