import { Button, Group, Loader, Stack, Title } from '@mantine/core';
import { IconRotateClockwise } from '@tabler/icons-react';
import { FC, Key, useCallback, useMemo, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from '@tanstack/react-pacer';

import SlotsPresetInput from '@components/Form/SlotsPresetInput/SlotsPresetInput.tsx';
import PageContainer from '@components/PageContainer/PageContainer';
import { useBroadcastSpin, useWheelBroadcasting } from '@domains/broadcasting/lib/useWheelBroadcasting';
import { SpinStartCallbackParams } from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI/index';
import RandomWheel, { RandomWheelController } from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI';
import { WheelFormat } from '@constants/wheel';
import { useEliminationEvents } from '@domains/elimination-events/lib/useEliminationEvents';
import ScreenEffects from '@domains/elimination-events/ui/ScreenEffects';
import PistolDialog from '@domains/elimination-events/ui/PistolDialog';
import ShahidDialog from '@domains/elimination-events/ui/ShahidDialog';
import RageMeter from '@domains/elimination-events/ui/RageMeter';
import WheelPlayersList from '@domains/elimination-events/ui/WheelPlayersList';
import EffectsButton from '@domains/elimination-events/ui/EffectsButton';
import AddDecorationButton from '@domains/custom-decor/ui/AddDecorationButton';
import WheelDecorations from '@domains/custom-decor/ui/WheelDecorations';
import { Lot } from '@models/slot.model';
import { WheelItem } from '@models/wheel.model';
import { RootState } from '@reducers';
import { deleteSlot, initialSlots, setSlots } from '@reducers/Slots/Slots';
import { removePistolLot } from '@domains/elimination-events/model/pistolSlice';
import { removeBombLot } from '@domains/elimination-events/model/bombSlice';
import { SlotListToWheelList } from '@utils/slots.utils';
import {
  useSaveWheelSettings,
  useWheelSettings,
} from '@domains/winner-selection/wheel-of-random/lib/hooks/useWheelSettings';

import styles from './WheelPage.module.css';

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots, isInitialized } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const wheelController = useRef<RandomWheelController | null>(null);
  const wheelForm = useRef<UseFormReturn<Wheel.Settings> | null>(null);

  const [wheelSettings, setWheelSettings] = useState<Wheel.Settings>();
  const [participants, setParticipants] = useState<WheelItem[]>();

  // Load settings from IndexedDB
  const { data: initialSettings, isLoading: isLoadingSettings } = useWheelSettings();
  const { mutate: saveSettings } = useSaveWheelSettings();

  const broadcastSpin = useBroadcastSpin();
  useWheelBroadcasting({ settings: wheelSettings, participants: participants });

  const format = wheelSettings?.format ?? initialSettings?.data?.format ?? WheelFormat.Default;
  const events = useEliminationEvents({ format, wheelControllerRef: wheelController });
  // Destructure the (stable) callbacks so memoized wrappers don't depend on the
  // freshly-created `events` object each render, which would loop the wheel's effect.
  const { onParticipantsChange, onSpinStart: onEventsSpinStart } = events;

  const handleWheelItemsChanged = useCallback(
    (items: WheelItem[]) => {
      setParticipants(items);
      onParticipantsChange(items);
    },
    [onParticipantsChange],
  );

  const previousWheelItems = useRef<Lot[]>(initialSlots);
  const wheelItems = useMemo(() => SlotListToWheelList(slots), [slots]);

  if (previousWheelItems.current === initialSlots) {
    previousWheelItems.current = slots;
    wheelController.current?.setItems(wheelItems);
  }

  const setCustomWheelItems = useCallback(
    (customItems: Lot[], saveSlots: boolean) => {
      wheelController.current?.setItems(SlotListToWheelList(customItems));
      previousWheelItems.current = [];

      if (saveSlots) {
        dispatch(setSlots(customItems));
      }
    },
    [dispatch],
  );

  const deleteItem = (id: Key) => {
    dispatch(deleteSlot(id.toString()));
  };

  const handlePistolEliminate = useCallback(
    (lotId: string) => {
      wheelController.current?.eliminateItem?.(lotId);
      dispatch(removePistolLot(lotId));
    },
    [dispatch],
  );

  const handleShahidEliminate = useCallback(
    (lotId: string) => {
      wheelController.current?.eliminateItem?.(lotId);
      dispatch(removeBombLot(lotId));
    },
    [dispatch],
  );

  const title = (
    <Group>
      <Title order={1}>{t('wheel.wheel')}</Title>
      <SlotsPresetInput buttonTitle={t('wheel.importToWheel')} onChange={setCustomWheelItems} />
    </Group>
  );

  const handleSpinStart = useCallback(
    (params: SpinStartCallbackParams) => {
      broadcastSpin(params.changedDistance ?? 0, params.duration ?? 0, params.winnerItem?.id?.toString() ?? '');
      onEventsSpinStart(params.winnerItem);
    },
    [broadcastSpin, onEventsSpinStart],
  );

  const handleSettingsChanged = useCallback(
    (settings: Wheel.Settings) => {
      setWheelSettings(settings);
      saveSettings({ id: initialSettings?.id, data: settings });
    },
    [saveSettings, initialSettings?.id],
  );

  const handleSettingsChangedDebounced = useDebouncedCallback(handleSettingsChanged, { wait: 2000, leading: true });

  return (
    <PageContainer
      className={`${styles.container} wheel-wrapper padding`}
      classes={{ content: styles.content }}
      title={title}
    >
      {!isLoadingSettings && isInitialized && (
        <RandomWheel
          initialSettings={initialSettings?.data}
          items={wheelItems}
          deleteItem={deleteItem}
          wheelRef={wheelController}
          onWheelItemsChanged={handleWheelItemsChanged}
          onSettingsChanged={handleSettingsChangedDebounced}
          form={wheelForm}
          onSpinStart={handleSpinStart}
          onBeforeSpin={events.onBeforeSpin}
          onWin={events.onWin}
          fog={events.fog}
          wheelOverlay={
            <RageMeter
              show={events.enabled}
              ragePercent={events.runtime.ragePercent}
              rageActive={events.runtime.rageActive}
              fogActive={events.runtime.fogActive}
            />
          }
          trackAuctionHistoryWinner
        >
          <Stack gap='sm'>
            <Group gap='xs'>
              <EffectsButton />
              <AddDecorationButton />
              {events.enabled && (
                <Button
                  variant='subtle'
                  color='gray'
                  size='sm'
                  leftSection={<IconRotateClockwise size={16} />}
                  onClick={events.resetSession}
                  title='Сбросить рейдж, туман и пистолеты'
                >
                  Сброс
                </Button>
              )}
            </Group>
            {events.enabled && (
              <WheelPlayersList
                currentPlayerId={events.runtime.currentPlayerId}
                pistolCount={events.pistolLotIds.length}
              />
            )}
          </Stack>
        </RandomWheel>
      )}
      <WheelDecorations />
      <ScreenEffects rageFlash={events.runtime.rageFlash} bigNumber={events.runtime.chaosNumber} />
      <PistolDialog
        prompt={events.runtime.pistolPrompt}
        onClose={events.closePistolPrompt}
        onEliminate={handlePistolEliminate}
      />
      <ShahidDialog
        prompt={events.runtime.shahidPrompt}
        onClose={events.closeShahidPrompt}
        onExplode={handleShahidEliminate}
      />
    </PageContainer>
  );
};

export default WheelPage;
