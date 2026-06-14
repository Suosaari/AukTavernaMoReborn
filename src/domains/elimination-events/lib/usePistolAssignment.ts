import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@reducers';

import { setPistolLotIds } from '../model/pistolSlice';
import { getEligiblePistolLots, pickPistolLotIds } from './pickPistolLotIds';

/**
 * Keeps the pistol assignment in sync with the auction lots. Pistols are dealt
 * once per "session" to random lots and persist until the end; a full lot-set
 * replacement (new auction / import) re-rolls them. Stale ids (deleted lots)
 * are pruned, but pistols are not re-dealt mid-session just because some were
 * used up. Mount once near the app root.
 */
export const usePistolAssignment = (): void => {
  const dispatch = useDispatch();
  const slots = useSelector((root: RootState) => root.slots.slots);
  const pistolConfig = useSelector((root: RootState) => root.eliminationEvents.config.pistol);
  const pistolLotIds = useSelector((root: RootState) => root.pistol.pistolLotIds);

  const prevRealIdsRef = useRef<Set<string>>(new Set());
  const assignedRef = useRef(false);

  useEffect(() => {
    const eligible = getEligiblePistolLots(slots);
    const realIdSet = new Set(eligible.map((lot) => lot.id));

    if (!pistolConfig.enabled) {
      if (pistolLotIds.length > 0) dispatch(setPistolLotIds([]));
      prevRealIdsRef.current = realIdSet;
      return;
    }

    const overlap = [...prevRealIdsRef.current].filter((id) => realIdSet.has(id)).length;
    const isFullReplacement = prevRealIdsRef.current.size > 0 && overlap === 0;
    if (isFullReplacement) assignedRef.current = false;

    if (!assignedRef.current && eligible.length >= 2) {
      dispatch(setPistolLotIds(pickPistolLotIds(eligible, pistolConfig.pistolCount)));
      assignedRef.current = true;
    } else {
      const valid = pistolLotIds.filter((id) => realIdSet.has(id));
      if (valid.length !== pistolLotIds.length) {
        dispatch(setPistolLotIds(valid));
      }
    }

    prevRealIdsRef.current = realIdSet;
  }, [slots, pistolConfig.enabled, pistolConfig.pistolCount, pistolLotIds, dispatch]);
};
