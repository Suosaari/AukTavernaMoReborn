import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { WheelFormat } from '@constants/wheel';
import { WheelItem } from '@models/wheel.model';
import { RootState } from '@reducers';
import { RandomWheelController } from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI';

import { removeBombLot, setBombLotIds } from '../model/bombSlice';
import { removePistolLot, setPistolLotIds } from '../model/pistolSlice';
import { loadRagePercent, saveRagePercent } from '../model/rageMeterStorage';

import { pickPistolLotIds } from './pickPistolLotIds';
import { pickShahidTargets, ShahidTarget } from './pickShahidTargets';
import { playEventSound } from './playEventSound';

const rollPercent = (chance: number): boolean => Math.random() * 100 < chance;

export interface PistolPrompt {
  lotId: string;
  lotName: string;
}

export interface ShahidPrompt {
  lotId: string;
  lotName: string;
  /** The bomb lot (middle) plus its two wheel neighbours, one of which blows up. */
  targets: ShahidTarget[];
  /** True when the detonation misfired: no neighbour is hit, the bomb lot itself (the spin winner) just drops out. */
  misfire: boolean;
}

export interface EliminationRuntime {
  ragePercent: number;
  rageActive: boolean;
  fogActive: boolean;
  currentPlayerId: string | null;
  /** Drives the screen shake + red flash overlay. */
  rageFlash: boolean;
  pistolPrompt: PistolPrompt | null;
  /** Huge on-screen number shown during the "67" chaos event (null = hidden). */
  chaosNumber: number | null;
  shahidPrompt: ShahidPrompt | null;
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
  bombLotIds: string[];
  onSpinStart: (winner: WheelItem) => void;
  onWin: (winner: WheelItem) => void;
  onParticipantsChange: (items: WheelItem[]) => void;
  /** Awaited by the wheel before each spin — plays the "67" chaos spin. */
  onBeforeSpin: () => Promise<void>;
  closePistolPrompt: () => void;
  closeShahidPrompt: () => void;
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
  const bombLotIds = useSelector((root: RootState) => root.bomb.bombLotIds);
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
  const bombLotIdsRef = useRef(bombLotIds);
  bombLotIdsRef.current = bombLotIds;
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  // Latest wheel order; snapshotted at spin start so Shahid can find the dropped
  // lot's neighbours even though the winner is removed before `onWin` fires.
  const wheelOrderRef = useRef<WheelItem[]>([]);
  const spinOrderRef = useRef<WheelItem[]>([]);
  // Guards against overlapping "67" chaos spins from rapid re-clicks.
  const chaosRunningRef = useRef(false);

  // Seed from the persisted value so an in-progress dropout survives a reload.
  const ragePercentRef = useRef(loadRagePercent());
  const rageActiveRef = useRef(false);
  const pendingRageRef = useRef(false);
  const fogSpinsLeftRef = useRef(0);
  const remainingRef = useRef(0);
  const topLotIdRef = useRef<string | null>(null);
  const playerIndexRef = useRef(-1);
  const gatePromiseRef = useRef<Promise<void> | null>(null);
  const gateResolveRef = useRef<(() => void) | null>(null);

  const [runtime, setRuntime] = useState<EliminationRuntime>({
    ragePercent: ragePercentRef.current,
    rageActive: false,
    fogActive: false,
    currentPlayerId: null,
    rageFlash: false,
    pistolPrompt: null,
    chaosNumber: null,
    shahidPrompt: null,
  });

  const patchRuntime = useCallback((patch: Partial<EliminationRuntime>) => {
    setRuntime((prev) => ({ ...prev, ...patch }));
  }, []);

  // Update the rage meter everywhere at once: the authoritative ref, the
  // mirrored runtime state, and the persisted value used to restore it.
  const commitRagePercent = useCallback(
    (value: number) => {
      ragePercentRef.current = value;
      patchRuntime({ ragePercent: value });
      saveRagePercent(value);
    },
    [patchRuntime],
  );

  const resetSession = useCallback(() => {
    ragePercentRef.current = 0;
    saveRagePercent(0);
    rageActiveRef.current = false;
    pendingRageRef.current = false;
    fogSpinsLeftRef.current = 0;
    playerIndexRef.current = -1;
    chaosRunningRef.current = false;
    // Re-roll the pistols and bombs among the current lots.
    dispatch(setPistolLotIds(pickPistolLotIds(slotsRef.current, configRef.current.pistol.pistolCount)));
    dispatch(setBombLotIds(pickPistolLotIds(slotsRef.current, configRef.current.shahid.bombCount)));
    setRuntime({
      ragePercent: 0,
      rageActive: false,
      fogActive: false,
      currentPlayerId: null,
      rageFlash: false,
      pistolPrompt: null,
      chaosNumber: null,
      shahidPrompt: null,
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

  const closeShahidPrompt = useCallback(() => {
    patchRuntime({ shahidPrompt: null });
    openGate();
  }, [patchRuntime, openGate]);

  // "67" chaos: when exactly `triggerCount` lots remain, play a wild, drop-baiting
  // visual spin (and overlay number) before the real spin resolves.
  const onBeforeSpin = useCallback(async () => {
    if (!enabledRef.current) return;
    const { chaos } = configRef.current;
    if (!chaos.enabled || chaosRunningRef.current || rageActiveRef.current) return;
    if (remainingRef.current !== chaos.triggerCount) return;

    chaosRunningRef.current = true;
    patchRuntime({ chaosNumber: chaos.triggerCount });
    playEventSound(chaos.sound);
    try {
      await wheelControllerRef.current?.chaosSpin?.(chaos.durationMs);
    } catch {
      // Best-effort visual; fall through to the normal spin regardless.
    } finally {
      patchRuntime({ chaosNumber: null });
      chaosRunningRef.current = false;
    }
  }, [patchRuntime, wheelControllerRef]);

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
    wheelOrderRef.current = items;
    topLotIdRef.current =
      items.reduce<WheelItem | null>((top, item) => (top == null || item.amount > top.amount ? item : top), null)?.id.toString() ??
      null;
  }, []);

  const onSpinStart = useCallback(() => {
    if (!enabledRef.current) return;
    // Freeze the wheel order now: the dropping lot is removed before `onWin`, so
    // Shahid reads its neighbours from this snapshot taken while it's still here.
    spinOrderRef.current = wheelOrderRef.current;
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
      commitRagePercent(Math.min(100, ragePercentRef.current + rageMode.incrementPerSpin));
      if (rollPercent(ragePercentRef.current)) {
        pendingRageRef.current = true;
      }
    }
  }, [patchRuntime, commitRagePercent]);

  const onWin = useCallback(
    (winner: WheelItem) => {
      if (!enabledRef.current) return;
      const { topLeader, pistol, shahid, rageMode } = configRef.current;
      const winnerId = winner.id.toString();
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

      // Pistol and Shahid both react to the dropped lot; the pistol takes
      // priority so they never open two prompts on the same elimination.
      let promptOpened = false;

      // Pistol: the eliminated lot carried a pistol -> open the shoot prompt.
      if (pistol.enabled && pistolLotIdsRef.current.includes(winnerId)) {
        dispatch(removePistolLot(winnerId));
        gatePromiseRef.current = new Promise<void>((resolve) => {
          gateResolveRef.current = resolve;
        });
        patchRuntime({
          pistolPrompt: { lotId: winnerId, lotName: winner.displayName ?? winner.name },
        });
        promptOpened = true;
      }

      // Shahid: the eliminated lot carried a bomb -> open the detonation roulette.
      // A misfire roll means the bomb failed to detonate; neighbours are spared and
      // only the bomb lot itself drops out (it is the spin winner, already removed).
      if (!promptOpened && shahid.enabled && bombLotIdsRef.current.includes(winnerId)) {
        dispatch(removeBombLot(winnerId));
        const targets = pickShahidTargets(spinOrderRef.current, winnerId, playersRef.current);
        playEventSound(shahid.sound);
        const misfire = targets.length > 0 && rollPercent(shahid.misfireChance);
        gatePromiseRef.current = new Promise<void>((resolve) => {
          gateResolveRef.current = resolve;
        });
        patchRuntime({
          shahidPrompt: { lotId: winnerId, lotName: winner.displayName ?? winner.name, targets, misfire },
        });
        promptOpened = true;
      }

      // Rage activation scheduled by this spin -> launch the burst asynchronously.
      if (pendingRageRef.current && !rageActiveRef.current && remainingRef.current > rageMode.minParticipants) {
        pendingRageRef.current = false;
        commitRagePercent(0);
        setTimeout(() => {
          runRageBurst();
        }, 0);
      }
    },
    [patchRuntime, runRageBurst, dispatch, commitRagePercent],
  );

  // Reset the per-session state only on a real enabled -> disabled transition
  // (events turned off or the wheel left dropout mode). Skipping the initial
  // mount keeps the persisted rage/pistols alive while the wheel settings, which
  // decide the format, are still loading asynchronously.
  const wasEnabledRef = useRef(enabled);
  useEffect(() => {
    if (wasEnabledRef.current && !enabled) {
      resetSession();
    }
    wasEnabledRef.current = enabled;
  }, [enabled, resetSession]);

  return {
    enabled,
    fog: runtime.fogActive,
    runtime,
    pistolLotIds,
    bombLotIds,
    onSpinStart,
    onWin,
    onParticipantsChange,
    onBeforeSpin,
    closePistolPrompt,
    closeShahidPrompt,
    resetSession,
  };
};
