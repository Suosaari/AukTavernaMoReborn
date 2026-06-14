import { FC } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

interface LotBombBadgeProps {
  lotId: string | number;
  size?: number;
}

/** Shows a bomb marker on a lot that currently carries a "Шахид" bomb. */
const LotBombBadge: FC<LotBombBadgeProps> = ({ lotId, size = 16 }) => {
  const hasBomb = useSelector((root: RootState) => root.bomb.bombLotIds.includes(lotId.toString()));

  if (!hasBomb) return null;

  return (
    <span title='Лот с бомбой (Шахид)' style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>
      💣
    </span>
  );
};

export default LotBombBadge;
