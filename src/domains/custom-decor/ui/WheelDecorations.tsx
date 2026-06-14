import { FC } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

import DecorationView from './DecorationView';

/**
 * Fixed overlay that renders the user's photo/gif decorations on top of the
 * wheel page. Unpinned decorations are interactive (drag/resize/edit); pinned
 * ones are click-through.
 */
const WheelDecorations: FC = () => {
  const decorations = useSelector((root: RootState) => root.decorations.decorations);

  if (decorations.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 40 }}>
      {decorations.map((decoration) => (
        <DecorationView key={decoration.id} decoration={decoration} />
      ))}
    </div>
  );
};

export default WheelDecorations;
