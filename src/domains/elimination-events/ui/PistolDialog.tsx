import { Badge, Button, Group, Modal, Paper, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCrosshair, IconMoodSmile, IconSkull, IconTargetArrow } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import PlayerAvatar from '@domains/players/ui/PlayerAvatar';
import { RootState } from '@reducers';

import { PistolPrompt } from '../lib/useEliminationEvents';
import { PistolTarget, pickPistolTargets } from '../lib/pickPistolTargets';

interface PistolDialogProps {
  prompt: PistolPrompt | null;
  onClose: () => void;
  /** Really removes the hit lot from the wheel + auction. */
  onEliminate: (lotId: string) => void;
}

type Phase = 'aim' | { kind: 'result'; targetId: string; hit: boolean };

/**
 * The pistol modal. There is no refusing the shot: the shooter picks one of two
 * victims as the target, then a 90% hit / 10% misfire roll decides the outcome.
 * On a hit the chosen lot really drops out.
 */
const PistolDialog: FC<PistolDialogProps> = ({ prompt, onClose, onEliminate }) => {
  const slots = useSelector((root: RootState) => root.slots.slots);
  const players = useSelector((root: RootState) => root.players.players);
  const misfireChance = useSelector((root: RootState) => root.eliminationEvents.config.pistol.misfireChance);

  const [targets, setTargets] = useState<PistolTarget[]>([]);
  const [phase, setPhase] = useState<Phase>('aim');

  // Compute the two victims once when the prompt opens.
  useEffect(() => {
    if (prompt) {
      setTargets(pickPistolTargets(slots, players, [prompt.lotId]));
      setPhase('aim');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt?.lotId]);

  const handleShoot = (target: PistolTarget): void => {
    const hit = Math.random() * 100 >= misfireChance;
    setPhase({ kind: 'result', targetId: target.lotId, hit });
    if (hit) {
      onEliminate(target.lotId);
    }
  };

  const handleClose = (): void => {
    setPhase('aim');
    onClose();
  };

  const isResult = typeof phase === 'object';

  return (
    <Modal
      opened={!!prompt}
      onClose={handleClose}
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      title={
        <Group gap='xs'>
          <IconCrosshair color='#ff6b3b' />
          <Text fw={800}>Пистолет!</Text>
        </Group>
      }
    >
      {targets.length === 0 ? (
        <Stack>
          <Text c='dimmed'>Некого подстрелить — нет подходящих лотов.</Text>
          <Group justify='flex-end'>
            <Button onClick={handleClose}>Закрыть</Button>
          </Group>
        </Stack>
      ) : (
        <Stack>
          <Text size='sm'>
            {!isResult ? 'Выпал лот с пистолетом. Выбери цель:' : 'Результат выстрела:'}
          </Text>
          <Group grow align='stretch'>
            {targets.map((target) => {
              const isTarget = isResult && phase.targetId === target.lotId;
              const isKilled = isTarget && phase.hit;
              const borderColor = isKilled ? '#ff3b3b' : isTarget ? '#f1c40f' : undefined;
              const card = (
                <Stack gap={6} align='center'>
                  {target.player ? (
                    <Group gap={6}>
                      <PlayerAvatar player={target.player} size={20} />
                      <Text size='sm'>{target.player.name}</Text>
                    </Group>
                  ) : (
                    <Text size='sm' c='dimmed'>
                      Без игрока
                    </Text>
                  )}
                  <Text fw={700} lineClamp={1}>
                    {target.lotName}
                  </Text>
                  <Badge variant='light'>{target.amount}</Badge>
                  {isResult ? (
                    isKilled ? (
                      <Group gap={4} c='red'>
                        <IconSkull size={18} />
                        <Text fw={700} size='sm'>
                          Убит
                        </Text>
                      </Group>
                    ) : isTarget ? (
                      <Group gap={4} c='yellow'>
                        <IconMoodSmile size={18} />
                        <Text fw={700} size='sm'>
                          Осечка
                        </Text>
                      </Group>
                    ) : (
                      <Group gap={4} c='teal'>
                        <IconMoodSmile size={18} />
                        <Text size='sm'>Жив</Text>
                      </Group>
                    )
                  ) : (
                    <Group gap={4} c='orange'>
                      <IconTargetArrow size={16} />
                      <Text size='xs'>Стрелять</Text>
                    </Group>
                  )}
                </Stack>
              );

              return (
                <Paper
                  key={target.lotId}
                  p='sm'
                  radius='md'
                  withBorder
                  style={{
                    borderColor,
                    background: isKilled ? 'rgba(255,59,59,0.12)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {!isResult ? (
                    <UnstyledButton w='100%' onClick={() => handleShoot(target)}>
                      {card}
                    </UnstyledButton>
                  ) : (
                    card
                  )}
                </Paper>
              );
            })}
          </Group>
          {isResult && (
            <>
              {phase.hit ? (
                <Text fw={700} c='red' ta='center'>
                  Попадание! Лот выбывает.
                </Text>
              ) : (
                <Text fw={700} c='yellow' ta='center'>
                  Осечка — выстрела не вышло!
                </Text>
              )}
              <Group justify='flex-end'>
                <Button onClick={handleClose}>Закрыть</Button>
              </Group>
            </>
          )}
        </Stack>
      )}
    </Modal>
  );
};

export default PistolDialog;
