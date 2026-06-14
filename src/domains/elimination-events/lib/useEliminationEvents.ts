import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { WheelFormat } from '@constants/wheel';
import { WheelItem } from '@models/wheel.model';
import { RootState } from '@reducers';
import { RandomWheelController } from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI';

import { removePistolLot, setPistolLotIds } from '../model/pistolSlice';
import { pickPistolLotIds } from './pickPistolLotIds';
import { playEventSound } from './playEventSound';

const rollPercent = (chance: number): boolean => Math.random() * 100 < chance;

export interface PistolPrompt {
  lotId: string;
  lotName: string;
}

export interface EliminationRuntime {
  ragePercent: number;
  rageActive: boolean;
  fogActive: boolean;
  currentPlayerId: string | null;
  /** Drives the screen shake + red flash overlay. */
  rageFlash: boolean;
  pistolPrompt: PistolPrompt | null;
}

interface UseEliminationEventsParams {
  format?: WheelFormat;
  wheelControllerRef: RefObject<RandomWheelController | null>;
}

interface UseEliminationEventsResult {
  enabled: boolean;
  fog: boolean;
  runtime: EliminationRuntime;
  pistolLotIds: string[];
  onSpinStart: (winner: WheelItem) => void;
  onWin: (winner: WheelItem) => void;
  onParticipantsChange: (items: WheelItem[]) => void;
  closePistolPrompt: () => void;
  resetSession: () => void;
}

/**
 * Drives the elimination-mode events (Rage-Mode, Fog and the Pistol rule) by
 * hooking into the wheel spin lifecycle. Authoritative values live in refs so
 * the async rage-burst sequence never reads stale state; mirrored state powers
 * the overlays.
 */
export const useEliminationEvents = ({
  format,
  wheelControllerRef,
}: UseEliminationEventsParams): UseEliminationEventsResult => {
  const config = useSelector((root: RootState) => root.eliminationEvents.config);
  const players = useSelector((root: RootState) => root.players.players);
  const pistolLotIds = useSelector((root: RootState) => root.pistol.pistolLotIds);
  const slots = useSelector((root: RootState) => root.slots.slots);
  const dispatch = useDispatch();

  const isDropout = format === WheelFormat.Dropout;
  const enabled = config.enabled && isDropout;

  // Mirror the latest config/players/pistols into refs for async sequences.
  const configRef = useRef(config);
  configRef.current = config;
  const playersRef = useRef(players);
  playersRef.current = players;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const pistolLotIdsRef = useRef(pistolLotIds);
  pistolLotIdsRef.current = pistolLotIds;
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const ragePercentRef = useRef(0);
  const rageActiveRef = useRef(false);
  const pendingRageRef = useRef(false);
  const fogSpinsLeftRef = useRef(0);
  const remainingRef = useRef(0);
  const topLotIdRef = useRef<string | null>(null);
  const playerIndexRef = useRef(-1);
  const gatePromiseRef = useRef<Promise<void> | null>(null);
  const gateResolveRef = useRef<(() => void) | null>(null);

  const [runtime, setRuntime] = useState<EliminationRuntime>({
    ragePercent: 0,
    rageActive: false,
    fogActive: false,
    currentPlayerId: null,
    rageFlash: false,
    pistolPrompt: null,
  });

  const patchRuntime = useCallback((patch: Partial<EliminationRuntime>) => {
    setRuntime((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSession = useCallback(() => {
    ragePercentRef.current = 0;
    rageActiveRef.current = false;
    pendingRageRef.current = false;
    fogSpinsLeftRef.current = 0;
    playerIndexRef.current = -1;
    // Re-roll the pistols among the current lots.
    dispatch(setPistolLotIds(pickPistolLotIds(slotsRef.current, configRef.current.pistol.pistolCount)));
    setRuntime({
      ragePercent: 0,
      rageActive: false,
      fogActive: false,
      currentPlayerId: null,
      rageFlash: false,
      pistolPrompt: null,
    });
  }, [dispatch]);

  const openGate = useCallback(() => {
    gateResolveRef.current?.();
    gateResolveRef.current = null;
    gatePromiseRef.current = null;
  }, []);

  const closePistolPrompt = useCallback(() => {
    patchRuntime({ pistolPrompt: null });
    openGate();
  }, [patchRuntime, openGate]);

  const runRageBurst = useCallback(async () => {
    if (rageActiveRef.current) return;
    const { rageMode } = configRef.current;
    rageActiveRef.current = true;
    patchRuntime({ rageActive: true, rageFlash: true });

    playEventSound(rageMode.sound);

    // The screen shake / red flash lasts for the configured duration.
    setTimeout(() => patchRuntime({ rageFlash: false }), rageMode.shakeMs);

    for (let index = 0; index < rageMode.fastSpinCount; index += 1) {
      if (gatePromiseRef.current) await gatePromiseRef.current;
      if (remainingRef.current <= 2) break;
      try {
        await wheelControllerRef.current?.requestSpin?.(rageMode.fastSpinTime);
      } catch {
        break;
      }
    }

    rageActiveRef.current = false;
    patchRuntime({ rageActive: false });
  }, [patchRuntime, wheelControllerRef]);

  const onParticipantsChange = useCallback((items: WheelItem[]) => {
    remainingRef.current = items.length;
    topLotIdRef.current =
      items.reduce<WheelItem | null>((top, item) => (top == null || item.amount > top.amount ? item : top), null)?.id.toString() ??
      null;
  }, []);

  const onSpinStart = useCallback(() => {
    if (!enabledRef.current) return;
    const { rageMode, fog } = configRef.current;
    const remaining = remainingRef.current;
    const list = playersRef.current;

    // Assign this spin to the next player (round-robin) and highlight them.
    if (list.length > 0) {
      playerIndexRef.current = (playerIndexRef.current + 1) % list.length;
      patchRuntime({ currentPlayerId: list[playerIndexRef.current].id });
    }

    // Fog: force off below the disable threshold; otherwise roll a new fog bank.
    if (remaining < fog.disableThreshold) {
      fogSpinsLeftRef.current = 0;
    } else if (fog.enabled && fogSpinsLeftRef.current === 0) {
      const chance = remaining < fog.raisedThreshold ? fog.raisedChance : fog.baseChance;
      if (rollPercent(chance)) {
        fogSpinsLeftRef.current = fog.durationSpins;
      }
    }
    patchRuntime({ fogActive: fogSpinsLeftRef.current > 0 && remaining >= fog.disableThreshold });

    // Rage: grow the meter and roll for activation (skipped during a burst).
    if (rageMode.enabled && !rageActiveRef.current && remaining > rageMode.minParticipants) {
      ragePercentRef.current = Math.min(100, ragePercentRef.current + rageMode.incrementPerSpin);
      patchRuntime({ ragePercent: ragePercentRef.current });
      if (rollPercent(ragePercentRef.current)) {
        pendingRageRef.current = true;
      }
    }
  }, [patchRuntime]);

  const onWin = useCallback(
    (winner: WheelItem) => {
      if (!enabledRef.current) return;
      const { topLeader, pistol, rageMode } = configRef.current;
      const remainingBefore = remainingRef.current;

      // Top leader (highest amount) eliminated -> play the configured sound.
      if (topLeader.sound.enabled && remainingBefore > 1 && winner.id.toString() === topLotIdRef.current) {
        playEventSound(topLeader.sound);
      }

      // Account for this elimination immediately so async logic stays accurate.
      remainingRef.current = Math.max(0, remainingRef.current - 1);

      // Fog consumes one spin.
      if (fogSpinsLeftRef.current > 0) {
        fogSpinsLeftRef.current -= 1;
        patchRuntime({
          fogActive: fogSpinsLeftRef.current > 0 && remainingRef.current >= configRef.current.fog.disableThreshold,
        });
      }

      // Pistol: the eliminated lot carried a pistol -> open the shoot prompt.
      if (pistol.enabled && pistolLotIdsRef.current.includes(winner.id.toString())) {
        dispatch(removePistolLot(winner.id.toString()));
        gatePromiseRef.current = new Promise<void>((resolve) => {
          gateResolveRef.current = resolve;
        });
        patchRuntime({
          pistolPrompt: { lotId: winner.id.toString(), lotName: winner.displayName ?? winner.name },
        });
      }

      // Rage activation scheduled by this spin -> launch the burst asynchronously.
      if (pendingRageRef.current && !rageActiveRef.current && remainingRef.current > rageMode.minParticipants) {
        pendingRageRef.current = false;
        ragePercentRef.current = 0;
        patchRuntime({ ragePercent: 0 });
        setTimeout(() => {
          runRageBurst();
        }, 0);
      }
    },
    [patchRuntime, runRageBurst, dispatch],
  );

  // Reset the per-session state if the events get disabled or leave dropout mode.
  useEffect(() => {
    if (!enabled) {
      resetSession();
    }
  }, [enabled, resetSession]);

  return {
    enabled,
    fog: runtime.fogActive,
    runtime,
    pistolLotIds,
    onSpinStart,
    onWin,
    onParticipantsChange,
    closePistolPrompt,
    resetSession,
  };
};
