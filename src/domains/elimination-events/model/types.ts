/** A configurable sound, played from a URL or an uploaded file kept in IndexedDB. */
export type SoundSource =
  | { kind: 'url'; url: string }
  | { kind: 'file'; mediaId: string; name: string }
  | null;

export interface SoundConfig {
  enabled: boolean;
  source: SoundSource;
  /** 0..1 */
  volume: number;
}

export interface RageModeConfig {
  enabled: boolean;
  /** Percent added to the rage meter each spin. */
  incrementPerSpin: number;
  /** Number of quick spins performed when rage activates. */
  fastSpinCount: number;
  /** Spin time (seconds) used for the quick spins. */
  fastSpinTime: number;
  /** Duration of the screen shake / red flash, in milliseconds. */
  shakeMs: number;
  /** Rage deactivates once the remaining lot count drops to this value or below. */
  minParticipants: number;
  sound: SoundConfig;
}

export interface FogConfig {
  enabled: boolean;
  /** Base appearance chance, percent. */
  baseChance: number;
  /** Raised appearance chance when remaining lots fall under `raisedThreshold`. */
  raisedChance: number;
  raisedThreshold: number;
  /** Fog is force-disabled once remaining lots fall under this value. */
  disableThreshold: number;
  /** Number of spins the fog lasts. */
  durationSpins: number;
}

export interface PistolConfig {
  enabled: boolean;
  /** Number of lots that secretly carry a pistol. */
  pistolCount: number;
  /** Chance the shot misfires (no elimination), percent. */
  misfireChance: number;
}

/** The "67" meme: a chaotic, drop-baiting spin when exactly N lots remain. */
export interface ChaosConfig {
  enabled: boolean;
  /** Remaining lot count that triggers the chaotic spin. */
  triggerCount: number;
  /** Duration of the erratic bait spin played before the real spin, ms. */
  durationMs: number;
  sound: SoundConfig;
}

/** "Шахид": one random lot carries a bomb; on drop it may blow up a neighbour. */
export interface ShahidConfig {
  enabled: boolean;
  /** Number of lots that secretly carry a bomb. */
  bombCount: number;
  /** Chance the bomb fails to detonate (no neighbour is hit), percent. The bomb lot itself drops out regardless — it is the spin winner. */
  misfireChance: number;
  sound: SoundConfig;
}

export interface TopLeaderConfig {
  enabled: boolean;
  sound: SoundConfig;
}

export interface EventsConfig {
  /** Master switch for the whole elimination-events system. */
  enabled: boolean;
  rageMode: RageModeConfig;
  fog: FogConfig;
  pistol: PistolConfig;
  topLeader: TopLeaderConfig;
  chaos: ChaosConfig;
  shahid: ShahidConfig;
}

export const defaultEventsConfig: EventsConfig = {
  enabled: true,
  rageMode: {
    enabled: true,
    incrementPerSpin: 2,
    fastSpinCount: 5,
    fastSpinTime: 2,
    shakeMs: 2000,
    minParticipants: 15,
    sound: { enabled: false, source: null, volume: 0.7 },
  },
  fog: {
    enabled: true,
    baseChance: 1,
    raisedChance: 10,
    raisedThreshold: 20,
    disableThreshold: 8,
    durationSpins: 6,
  },
  pistol: {
    enabled: true,
    pistolCount: 2,
    misfireChance: 10,
  },
  topLeader: {
    enabled: false,
    sound: { enabled: true, source: null, volume: 0.7 },
  },
  chaos: {
    enabled: true,
    triggerCount: 67,
    durationMs: 5000,
    sound: { enabled: false, source: null, volume: 0.8 },
  },
  shahid: {
    enabled: true,
    bombCount: 1,
    misfireChance: 10,
    sound: { enabled: false, source: null, volume: 0.8 },
  },
};
