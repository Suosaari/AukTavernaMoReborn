import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@reducers';

import { setBombLotIds } from '../model/bombSlice';

import { getEligiblePistolLots, pickPistolLotIds } from './pickPistolLotIds';

/**
 * Keeps the "Шахид" bomb assignment in sync with the auction lots, mirroring the
 * pistol logic: bombs are dealt once per session to random lots and persist until
 * used; a full lot-set replacement (new auction / import) re-rolls them, and
 * stale ids (deleted lots) are pruned. Mount once near the app root.
 */
export const useBombAssignment = (): void => {
  const dispatch = useDispatch();
  const slots = useSelector((root: RootState) => root.slots.slots);
  const shahidConfig = useSelector((root: RootState) => root.eliminationEvents.config.shahid);
  const bombLotIds = useSelector((root: RootState) => root.bomb.bombLotIds);

  const prevRealIdsRef = useRef<Set<string>>(new Set());
  const assignedRef = useRef(false);

  useEffect(() => {
    const eligible = getEligiblePistolLots(slots);
    const realIdSet = new Set(eligible.map((lot) => lot.id));

    if (!shahidConfig.enabled) {
      if (bombLotIds.length > 0) dispatch(setBombLotIds([]));
      prevRealIdsRef.current = realIdSet;
      return;
    }

    const overlap = [...prevRealIdsRef.current].filter((id) => realIdSet.has(id)).length;
    const isFullReplacement = prevRealIdsRef.current.size > 0 && overlap === 0;
    if (isFullReplacement) assignedRef.current = false;

    if (!assignedRef.current && eligible.length >= 2) {
      dispatch(setBombLotIds(pickPistolLotIds(eligible, shahidConfig.bombCount)));
      assignedRef.current = true;
    } else {
      const valid = bombLotIds.filter((id) => realIdSet.has(id));
      if (valid.length !== bombLotIds.length) {
        dispatch(setBombLotIds(valid));
      }
    }

    prevRealIdsRef.current = realIdSet;
  }, [slots, shahidConfig.enabled, shahidConfig.bombCount, bombLotIds, dispatch]);
};
