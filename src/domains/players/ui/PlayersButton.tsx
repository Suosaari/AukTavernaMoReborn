import { Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUsers } from '@tabler/icons-react';
import { FC } from 'react';

import { usePlayers } from '../lib/usePlayers';
import PlayersManager from './PlayersManager';

interface PlayersButtonProps {
  variant?: string;
  size?: string;
  compact?: boolean;
}

/** Toolbar button that opens the players management drawer. */
const PlayersButton: FC<PlayersButtonProps> = ({ variant = 'default', size = 'sm', compact }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const players = usePlayers();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        leftSection={<IconUsers size={18} />}
        onClick={open}
        title='Игроки'
      >
        {compact ? players.length || '' : `Игроки${players.length ? ` (${players.length})` : ''}`}
      </Button>
      <Drawer opened={opened} onClose={close} position='right' size='md' title='Игроки' padding='md'>
        <PlayersManager />
      </Drawer>
    </>
  );
};

export default PlayersButton;
