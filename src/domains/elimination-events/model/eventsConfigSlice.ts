import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'es-toolkit';

import { isBrowser } from '@utils/ssr';

import { defaultEventsConfig, EventsConfig } from './types';

const STORAGE_KEY = 'mod_events_config';

interface EventsConfigState {
  config: EventsConfig;
}

const loadConfig = (): EventsConfig => {
  if (!isBrowser) return defaultEventsConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultEventsConfig;
    // Deep-merge onto defaults so configs saved before new fields existed stay valid.
    return merge(structuredClone(defaultEventsConfig), JSON.parse(raw)) as EventsConfig;
  } catch {
    return defaultEventsConfig;
  }
};

const persist = (config: EventsConfig): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

const initialState: EventsConfigState = {
  config: loadConfig(),
};

/** A partial deep-merge patch over the events config. */
type ConfigPatch = {
  [K in keyof EventsConfig]?: EventsConfig[K] extends object ? Partial<EventsConfig[K]> : EventsConfig[K];
};

const eventsConfigSlice = createSlice({
  name: 'eliminationEvents',
  initialState,
  reducers: {
    patchEventsConfig(state, action: PayloadAction<ConfigPatch>): void {
      // `current` yields a plain snapshot; structuredClone on the Immer draft
      // itself would throw (it is a Proxy), which previously silently broke
      // every panel change (e.g. the rage sound could not be enabled).
      const merged = merge(structuredClone(current(state.config)), action.payload) as EventsConfig;
      state.config = merged;
      persist(merged);
    },
    setEventsConfig(state, action: PayloadAction<EventsConfig>): void {
      state.config = action.payload;
      persist(state.config);
    },
    resetEventsConfig(state): void {
      state.config = structuredClone(defaultEventsConfig);
      persist(state.config);
    },
  },
});

export const { patchEventsConfig, setEventsConfig, resetEventsConfig } = eventsConfigSlice.actions;

export default eventsConfigSlice.reducer;
