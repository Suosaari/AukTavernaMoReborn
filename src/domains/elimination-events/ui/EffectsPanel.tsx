import { Button, Divider, Group, NumberInput, Stack, Switch, Text, Title } from '@mantine/core';
import { IconRotate } from '@tabler/icons-react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@reducers';

import { patchEventsConfig, resetEventsConfig } from '../model/eventsConfigSlice';

import SoundSourceField from './SoundSourceField';

const numberProps = { min: 0, size: 'xs', className: 'w-24' } as const;

/** Editing panel for all elimination events: rage, fog, pistol, top-leader sound. */
const EffectsPanel: FC = () => {
  const config = useSelector((root: RootState) => root.eliminationEvents.config);
  const dispatch = useDispatch();

  const { rageMode, fog, pistol, topLeader, chaos, shahid } = config;

  return (
    <Stack gap='lg'>
      <Switch
        size='md'
        checked={config.enabled}
        onChange={(event) => dispatch(patchEventsConfig({ enabled: event.currentTarget.checked }))}
        label='Включить события (режим «Выбывание»)'
      />

      <div>
        <Title order={5} c='red.4'>
          🔥 Rage-Mode
        </Title>
        <Stack gap={8} mt={6}>
          <Switch
            checked={rageMode.enabled}
            onChange={(event) => dispatch(patchEventsConfig({ rageMode: { enabled: event.currentTarget.checked } }))}
            label='Включить'
          />
          <Group gap='sm'>
            <NumberInput
              {...numberProps}
              label='+% за прокрут'
              value={rageMode.incrementPerSpin}
              onChange={(value) => dispatch(patchEventsConfig({ rageMode: { incrementPerSpin: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Быстрых прокрутов'
              value={rageMode.fastSpinCount}
              onChange={(value) => dispatch(patchEventsConfig({ rageMode: { fastSpinCount: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Время прокрута, с'
              value={rageMode.fastSpinTime}
              onChange={(value) => dispatch(patchEventsConfig({ rageMode: { fastSpinTime: Number(value) } }))}
            />
          </Group>
          <Group gap='sm'>
            <NumberInput
              {...numberProps}
              label='Тряска, мс'
              step={100}
              value={rageMode.shakeMs}
              onChange={(value) => dispatch(patchEventsConfig({ rageMode: { shakeMs: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Выкл. при ≤ лотов'
              value={rageMode.minParticipants}
              onChange={(value) => dispatch(patchEventsConfig({ rageMode: { minParticipants: Number(value) } }))}
            />
          </Group>
          <SoundSourceField
            label='Звук при активации'
            mediaKey='sound-rage'
            value={rageMode.sound}
            onChange={(patch) => dispatch(patchEventsConfig({ rageMode: { sound: { ...rageMode.sound, ...patch } } }))}
          />
        </Stack>
      </div>

      <Divider />

      <div>
        <Title order={5} c='gray.4'>
          🌫 Туман
        </Title>
        <Stack gap={8} mt={6}>
          <Switch
            checked={fog.enabled}
            onChange={(event) => dispatch(patchEventsConfig({ fog: { enabled: event.currentTarget.checked } }))}
            label='Включить'
          />
          <Group gap='sm'>
            <NumberInput
              {...numberProps}
              label='Базовый шанс, %'
              value={fog.baseChance}
              onChange={(value) => dispatch(patchEventsConfig({ fog: { baseChance: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Повыш. шанс, %'
              value={fog.raisedChance}
              onChange={(value) => dispatch(patchEventsConfig({ fog: { raisedChance: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Повыш. при < лотов'
              value={fog.raisedThreshold}
              onChange={(value) => dispatch(patchEventsConfig({ fog: { raisedThreshold: Number(value) } }))}
            />
          </Group>
          <Group gap='sm'>
            <NumberInput
              {...numberProps}
              label='Длительность, прокрутов'
              value={fog.durationSpins}
              onChange={(value) => dispatch(patchEventsConfig({ fog: { durationSpins: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Выкл. при < лотов'
              value={fog.disableThreshold}
              onChange={(value) => dispatch(patchEventsConfig({ fog: { disableThreshold: Number(value) } }))}
            />
          </Group>
        </Stack>
      </div>

      <Divider />

      <div>
        <Title order={5} c='orange.4'>
          🔫 Пистолет
        </Title>
        <Stack gap={8} mt={6}>
          <Switch
            checked={pistol.enabled}
            onChange={(event) => dispatch(patchEventsConfig({ pistol: { enabled: event.currentTarget.checked } }))}
            label='Включить'
          />
          <Group gap='sm'>
            <NumberInput
              {...numberProps}
              label='Лотов с пистолетом'
              value={pistol.pistolCount}
              onChange={(value) => dispatch(patchEventsConfig({ pistol: { pistolCount: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Шанс осечки, %'
              value={pistol.misfireChance}
              onChange={(value) => dispatch(patchEventsConfig({ pistol: { misfireChance: Number(value) } }))}
            />
          </Group>
          <Text size='xs' c='dimmed'>
            Чтобы выстрел выбирал лоты игроков, назначайте «кто добавил» лотам в меню «Игроки».
          </Text>
        </Stack>
      </div>

      <Divider />

      <div>
        <Title order={5} c='yellow.4'>
          👑 Выбывание лидера
        </Title>
        <Stack gap={8} mt={6}>
          <SoundSourceField
            label='Звук при выбывании топ-лота по очкам'
            mediaKey='sound-topleader'
            value={topLeader.sound}
            onChange={(patch) =>
              dispatch(patchEventsConfig({ topLeader: { sound: { ...topLeader.sound, ...patch } } }))
            }
          />
        </Stack>
      </div>

      <Divider />

      <div>
        <Title order={5} c='yellow.6'>
          🤯 «67» (хаос-прокрут)
        </Title>
        <Stack gap={8} mt={6}>
          <Switch
            checked={chaos.enabled}
            onChange={(event) => dispatch(patchEventsConfig({ chaos: { enabled: event.currentTarget.checked } }))}
            label='Включить'
          />
          <Group gap='sm'>
            <NumberInput
              {...numberProps}
              label='Срабатывает при лотах'
              value={chaos.triggerCount}
              onChange={(value) => dispatch(patchEventsConfig({ chaos: { triggerCount: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Длительность, мс'
              step={500}
              value={chaos.durationMs}
              onChange={(value) => dispatch(patchEventsConfig({ chaos: { durationMs: Number(value) } }))}
            />
          </Group>
          <SoundSourceField
            label='Звук хаоса'
            mediaKey='sound-chaos'
            value={chaos.sound}
            onChange={(patch) => dispatch(patchEventsConfig({ chaos: { sound: { ...chaos.sound, ...patch } } }))}
          />
          <Text size='xs' c='dimmed'>
            Когда на колесе остаётся ровно столько лотов, прокрут «байтит» выпадение, а затем идёт нормально.
          </Text>
        </Stack>
      </div>

      <Divider />

      <div>
        <Title order={5} c='orange.6'>
          💣 Шахид
        </Title>
        <Stack gap={8} mt={6}>
          <Switch
            checked={shahid.enabled}
            onChange={(event) => dispatch(patchEventsConfig({ shahid: { enabled: event.currentTarget.checked } }))}
            label='Включить'
          />
          <Group gap='sm'>
            <NumberInput
              {...numberProps}
              label='Лотов с бомбой'
              value={shahid.bombCount}
              onChange={(value) => dispatch(patchEventsConfig({ shahid: { bombCount: Number(value) } }))}
            />
            <NumberInput
              {...numberProps}
              label='Шанс осечки, %'
              value={shahid.misfireChance}
              onChange={(value) => dispatch(patchEventsConfig({ shahid: { misfireChance: Number(value) } }))}
            />
          </Group>
          <SoundSourceField
            label='Звук взрыва'
            mediaKey='sound-shahid'
            value={shahid.sound}
            onChange={(patch) => dispatch(patchEventsConfig({ shahid: { sound: { ...shahid.sound, ...patch } } }))}
          />
          <Text size='xs' c='dimmed'>
            Бомба достаётся случайному лоту. При выпадении взрывается один из трёх: сам лот или его сосед слева/справа на
            колесе.
          </Text>
        </Stack>
      </div>

      <Divider />

      <Group justify='flex-end'>
        <Button
          variant='subtle'
          color='gray'
          leftSection={<IconRotate size={16} />}
          onClick={() => dispatch(resetEventsConfig())}
        >
          Сбросить настройки
        </Button>
      </Group>
    </Stack>
  );
};

export default EffectsPanel;
