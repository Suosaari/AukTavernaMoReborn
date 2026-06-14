import { FC } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

interface LotPistolBadgeProps {
  lotId: string | number;
  size?: number;
}

/** Shows a pistol marker on a lot that currently carries a pistol. */
const LotPistolBadge: FC<LotPistolBadgeProps> = ({ lotId, size = 16 }) => {
  const hasPistol = useSelector((root: RootState) => root.pistol.pistolLotIds.includes(lotId.toString()));

  if (!hasPistol) return null;

  return (
    <span title='Лот с пистолетом' style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>
      🔫
    </span>
  );
};

export default LotPistolBadge;
