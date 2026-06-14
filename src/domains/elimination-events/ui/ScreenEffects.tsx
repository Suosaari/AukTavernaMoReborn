import { FC, useEffect } from 'react';

import './screenEffects.css';

interface ScreenEffectsProps {
  /** When on, shakes the whole viewport and shows a pulsing red vignette. */
  rageFlash: boolean;
  /** A huge pulsing number drawn over the screen during the "67" chaos event. */
  bigNumber?: number | null;
}

/** Page-level event visuals: rage shake + red flash and the "67" chaos number. */
const ScreenEffects: FC<ScreenEffectsProps> = ({ rageFlash, bigNumber }) => {
  useEffect(() => {
    const root = document.documentElement;
    if (rageFlash) {
      root.classList.add('mod-rage-shake');
    } else {
      root.classList.remove('mod-rage-shake');
    }
    return () => root.classList.remove('mod-rage-shake');
  }, [rageFlash]);

  return (
    <>
      {rageFlash && <div className='mod-rage-overlay' />}
      {bigNumber != null && (
        <div className='mod-chaos-overlay'>
          <span className='mod-chaos-number'>{bigNumber}</span>
        </div>
      )}
    </>
  );
};

export default ScreenEffects;
