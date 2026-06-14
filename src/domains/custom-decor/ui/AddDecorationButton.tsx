import { Button, Group } from '@mantine/core';
import { IconPhotoPlus, IconPin, IconPinnedOff } from '@tabler/icons-react';
import { FC, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from '@reducers';
import { saveModMedia } from '@shared/lib/database/modMediaDb';

import { addDecoration, setAllPinned } from '../model/decorationsSlice';
import { Decoration } from '../model/types';

const buildDecoration = (
  partial: Pick<Decoration, 'id' | 'kind' | 'name' | 'src'> & Partial<Decoration>,
): Decoration => ({
  opacity: 1,
  x: 38,
  y: 30,
  width: 240,
  rotation: 0,
  pinned: false,
  ...partial,
});

/**
 * Direct "add photo/gif" control: opens the OS file picker immediately, adds the
 * chosen images as unpinned (editable) decorations, and toggles pin-all so the
 * inline editing controls can be hidden once everything is placed.
 */
const AddDecorationButton: FC = () => {
  const dispatch = useDispatch();
  const decorations = useSelector((root: RootState) => root.decorations.decorations);
  const inputRef = useRef<HTMLInputElement>(null);

  const allPinned = decorations.length > 0 && decorations.every((decoration) => decoration.pinned);

  const handleFiles = async (files: FileList | null): Promise<void> => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const id = uuidv4();
      await saveModMedia({ id, blob: file, mimeType: file.type, name: file.name });
      dispatch(addDecoration(buildDecoration({ id, kind: 'file', src: null, name: file.name })));
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Group gap='xs'>
      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/gif,image/webp,image/svg+xml'
        multiple
        hidden
        onChange={(event) => handleFiles(event.currentTarget.files)}
      />
      <Button
        size='sm'
        variant='default'
        leftSection={<IconPhotoPlus size={18} />}
        onClick={() => inputRef.current?.click()}
      >
        Добавить фото/гиф
      </Button>
      {decorations.length > 0 && (
        <Button
          size='sm'
          variant='subtle'
          color='gray'
          leftSection={allPinned ? <IconPinnedOff size={16} /> : <IconPin size={16} />}
          onClick={() => dispatch(setAllPinned(!allPinned))}
        >
          {allPinned ? 'Открепить все' : 'Закрепить все'}
        </Button>
      )}
    </Group>
  );
};

export default AddDecorationButton;
