import { Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconWand } from '@tabler/icons-react';
import { FC } from 'react';

import EffectsPanel from './EffectsPanel';

interface EffectsButtonProps {
  variant?: string;
  size?: string;
}

/** Toolbar button that opens the elimination-events editing panel. */
const EffectsButton: FC<EffectsButtonProps> = ({ variant = 'default', size = 'sm' }) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant={variant} size={size} leftSection={<IconWand size={18} />} onClick={open} title='Эффекты'>
        Эффекты
      </Button>
      <Drawer opened={opened} onClose={close} position='right' size='md' title='Эффекты и события' padding='md'>
        <EffectsPanel />
      </Drawer>
    </>
  );
};

export default EffectsButton;
