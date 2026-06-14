import { ActionIcon, Button, ColorInput, Group, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { addPlayer, removePlayer, updatePlayer } from '../model/playersSlice';
import { usePlayers } from '../lib/usePlayers';
import PlayerAvatar from './PlayerAvatar';

/** Add / remove / rename / recolor the list of players. */
const PlayersManager: FC = () => {
  const players = usePlayers();
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const handleAdd = (): void => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch(addPlayer(trimmed));
    setName('');
  };

  return (
    <Stack gap='sm'>
      <Group gap='xs' wrap='nowrap'>
        <TextInput
          className='flex-1'
          placeholder='Имя игрока'
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAdd();
          }}
        />
        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd} disabled={!name.trim()}>
          Добавить
        </Button>
      </Group>

      {players.length === 0 ? (
        <Text c='dimmed' size='sm'>
          Игроков пока нет. Добавьте участников, чтобы привязывать к ним лоты.
        </Text>
      ) : (
        <ScrollArea.Autosize mah={420}>
          <Stack gap='xs'>
            {players.map((player) => (
              <Group key={player.id} gap='xs' wrap='nowrap'>
                <PlayerAvatar player={player} />
                <TextInput
                  className='flex-1'
                  value={player.name}
                  onChange={(event) => dispatch(updatePlayer({ id: player.id, name: event.currentTarget.value }))}
                />
                <ColorInput
                  className='w-28'
                  value={player.color}
                  onChange={(color) => dispatch(updatePlayer({ id: player.id, color }))}
                  withEyeDropper={false}
                  format='hex'
                />
                <ActionIcon color='red' variant='subtle' onClick={() => dispatch(removePlayer(player.id))}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Stack>
  );
};

export default PlayersManager;
