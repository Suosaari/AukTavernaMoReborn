import { FC, useEffect } from 'react';

import './screenEffects.css';

interface ScreenEffectsProps {
  /** When on, shakes the whole viewport and shows a pulsing red vignette. */
  rageFlash: boolean;
}

/** Page-level rage visuals: viewport shake (via a class on <html>) + red flash. */
const ScreenEffects: FC<ScreenEffectsProps> = ({ rageFlash }) => {
  useEffect(() => {
    const root = document.documentElement;
    if (rageFlash) {
      root.classList.add('mod-rage-shake');
    } else {
      root.classList.remove('mod-rage-shake');
    }
    return () => root.classList.remove('mod-rage-shake');
  }, [rageFlash]);

  if (!rageFlash) return null;

  return <div className='mod-rage-overlay' />;
};

export default ScreenEffects;
