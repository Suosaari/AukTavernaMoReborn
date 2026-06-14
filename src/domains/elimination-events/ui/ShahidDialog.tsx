import { Badge, Button, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { IconBomb, IconFlame, IconMoodSmile } from '@tabler/icons-react';
import { FC, useEffect, useRef, useState } from 'react';

import PlayerAvatar from '@domains/players/ui/PlayerAvatar';

import { ShahidPrompt } from '../lib/useEliminationEvents';

interface ShahidDialogProps {
  prompt: ShahidPrompt | null;
  onClose: () => void;
  /** Really removes the exploded lot from the wheel + auction. */
  onExplode: (lotId: string) => void;
}

type Phase = 'arming' | { kind: 'result'; victimId: string };

/**
 * The "Шахид" modal. The bomb lot already dropped; here a roulette cycles across
 * the three candidates (the bomb lot in the middle and its two wheel neighbours)
 * and randomly detonates one — a neighbour really drops out, the bomb lot itself
 * just confirms its own demise.
 */
const ShahidDialog: FC<ShahidDialogProps> = ({ prompt, onClose, onExplode }) => {
  const [phase, setPhase] = useState<Phase>('arming');
  const [activeIndex, setActiveIndex] = useState(0);
  const explodedRef = useRef(false);

  // Run the detonation roulette once each time a prompt opens.
  useEffect(() => {
    if (!prompt || prompt.targets.length === 0) return undefined;

    const { targets } = prompt;
    const victimIndex = Math.floor(Math.random() * targets.length);
    explodedRef.current = false;
    setPhase('arming');
    setActiveIndex(0);

    let step = 0;
    let delay = 80;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = (): void => {
      if (cancelled) return;
      setActiveIndex(step % targets.length);

      // Decelerate, then stop once it lands on the chosen victim.
      if (delay > 280 && step % targets.length === victimIndex) {
        const victim = targets[victimIndex];
        setPhase({ kind: 'result', victimId: victim.lotId });
        if (!explodedRef.current) {
          explodedRef.current = true;
          onExplode(victim.lotId);
        }
        return;
      }

      step += 1;
      delay += 12;
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt?.lotId]);

  const handleClose = (): void => {
    setPhase('arming');
    onClose();
  };

  const isResult = typeof phase === 'object';
  const targets = prompt?.targets ?? [];

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
          <IconBomb color='#ff5b3b' />
          <Text fw={800}>Шахид!</Text>
        </Group>
      }
    >
      {targets.length === 0 ? (
        <Stack>
          <Text c='dimmed'>Некому взрываться — нет подходящих лотов.</Text>
          <Group justify='flex-end'>
            <Button onClick={handleClose}>Закрыть</Button>
          </Group>
        </Stack>
      ) : (
        <Stack>
          <Text size='sm'>{!isResult ? 'Бомба активирована! Кто взорвётся?' : 'Взрыв!'}</Text>
          <Group grow align='stretch'>
            {targets.map((target, index) => {
              const isVictim = isResult && phase.victimId === target.lotId;
              const isHighlighted = !isResult && index === activeIndex;
              const borderColor = isVictim ? '#ff3b3b' : isHighlighted ? '#f1c40f' : undefined;

              return (
                <Paper
                  key={target.lotId}
                  p='sm'
                  radius='md'
                  withBorder
                  style={{
                    borderColor,
                    transform: isHighlighted || isVictim ? 'scale(1.04)' : undefined,
                    transition: 'transform 0.1s ease, border-color 0.1s ease',
                    background: isVictim ? 'rgba(255,59,59,0.12)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Stack gap={6} align='center'>
                    <Badge size='xs' variant='light' color='gray'>
                      {target.position === 'middle' ? '💣 бомба' : target.position === 'left' ? '◀ слева' : 'справа ▶'}
                    </Badge>
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
                      isVictim ? (
                        <Group gap={4} c='red'>
                          <IconFlame size={18} />
                          <Text fw={700} size='sm'>
                            Взорван
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
                        <IconBomb size={16} />
                        <Text size='xs'>{isHighlighted ? '...' : ' '}</Text>
                      </Group>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Group>
          {isResult && (
            <>
              <Text fw={700} c='red' ta='center'>
                💥 Лот выбывает!
              </Text>
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

export default ShahidDialog;
