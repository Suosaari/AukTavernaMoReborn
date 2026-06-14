import { FC } from 'react';

import PlayersButton from '@domains/players/ui/PlayersButton';
import EffectsButton from '@domains/elimination-events/ui/EffectsButton';

import NewSlotForm from './NewSlotForm/NewSlotForm';
import SlotSearch from './SlotSearch/SlotSearch';
import classes from './SlotsHeader.module.css';

const SlotsHeader: FC = () => {
  return (
    <div className={`${classes.slotsHeader} item`}>
      <div className={`${classes.newSlotWrapper} item`}>
        <NewSlotForm />
      </div>
      {/* <Divider orientation="vertical" /> */}
      <div className={`${classes.verticalDivider} item`} />
      <div className={`${classes.slotSearchWrapper} item`}>
        <SlotSearch />
      </div>
      <div className='item ml-2 flex items-center gap-2'>
        <PlayersButton />
        <EffectsButton />
      </div>
    </div>
  );
};

export default SlotsHeader;
