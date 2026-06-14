import { afterEach, describe, expect, it } from 'vitest';

import { loadRagePercent, saveRagePercent } from './rageMeterStorage';

afterEach(() => localStorage.clear());

describe('rage meter storage', () => {
  it('returns 0 when nothing is stored', () => {
    expect(loadRagePercent()).toBe(0);
  });

  it('round-trips a saved value', () => {
    saveRagePercent(42);
    expect(loadRagePercent()).toBe(42);
  });

  it('clamps a restored value into the 0..100 range', () => {
    saveRagePercent(150);
    expect(loadRagePercent()).toBe(100);
  });

  it('falls back to 0 on a corrupt stored value', () => {
    localStorage.setItem('mod_rage_percent', 'not-a-number');
    expect(loadRagePercent()).toBe(0);
  });
});
