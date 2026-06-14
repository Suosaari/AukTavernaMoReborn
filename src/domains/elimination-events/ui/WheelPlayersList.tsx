import { Group, Paper, Stack, Text } from '@mantine/core';
import { IconCrosshair } from '@tabler/icons-react';
import { FC } from 'react';

import PlayerAvatar from '@domains/players/ui/PlayerAvatar';
import { usePlayers } from '@domains/players/lib/usePlayers';

interface WheelPlayersListProps {
  currentPlayerId: string | null;
  pistolCount: number;
}

/** The wheel-side list of player participants; highlights the active spin's player. */
const WheelPlayersList: FC<WheelPlayersListProps> = ({ currentPlayerId, pistolCount }) => {
  const players = usePlayers();

  if (players.length === 0) return null;

  return (
    <Paper p='xs' radius='md' withBorder bg='rgba(0,0,0,0.25)'>
      <Group justify='space-between' mb={6}>
        <Text size='sm' fw={700}>
          Игроки
        </Text>
        {pistolCount > 0 && (
          <Group gap={4} c='orange'>
            <IconCrosshair size={16} />
            <Text size='xs' fw={700}>
              {pistolCount}
            </Text>
          </Group>
        )}
      </Group>
      <Stack gap={4}>
        {players.map((player) => {
          const isActive = player.id === currentPlayerId;
          return (
            <Group
              key={player.id}
              gap='xs'
              wrap='nowrap'
              px={6}
              py={3}
              style={{
                borderRadius: 6,
                background: isActive ? 'rgba(120,170,255,0.22)' : 'transparent',
                outline: isActive ? '1px solid rgba(120,170,255,0.8)' : 'none',
              }}
            >
              <PlayerAvatar player={player} size={20} />
              <Text size='sm' fw={isActive ? 700 : 400} lineClamp={1}>
                {player.name}
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default WheelPlayersList;
