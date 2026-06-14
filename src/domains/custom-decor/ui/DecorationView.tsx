import { ActionIcon, Slider } from '@mantine/core';
import { IconPin, IconTrash } from '@tabler/icons-react';
import { FC, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { deleteModMedia } from '@shared/lib/database/modMediaDb';

import { useDecorationSrc } from '../lib/useDecorationSrc';
import { removeDecoration, updateDecoration } from '../model/decorationsSlice';
import { Decoration } from '../model/types';

interface DecorationViewProps {
  decoration: Decoration;
}

/**
 * Renders a single decoration image. When unpinned it can be dragged, resized
 * from the bottom-right handle, and edited via the inline toolbar (opacity,
 * pin, delete). When pinned it is static and click-through. Drag/resize mutate
 * the DOM directly and commit the final geometry once on pointer release.
 */
const DecorationView: FC<DecorationViewProps> = ({ decoration }) => {
  const src = useDecorationSrc(decoration);
  const dispatch = useDispatch();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const geometry = useRef({ x: decoration.x, y: decoration.y, width: decoration.width });
  geometry.current = { x: decoration.x, y: decoration.y, width: decoration.width };

  const editable = !decoration.pinned;

  if (!src) return null;

  const startDrag = (event: React.MouseEvent): void => {
    if (!editable) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = { ...geometry.current };

    const onMove = (moveEvent: MouseEvent): void => {
      const nextX = origin.x + ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      const nextY = origin.y + ((moveEvent.clientY - startY) / window.innerHeight) * 100;
      geometry.current = { ...geometry.current, x: nextX, y: nextY };
      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${nextX}%`;
        wrapperRef.current.style.top = `${nextY}%`;
      }
    };

    const onUp = (): void => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dispatch(updateDecoration({ id: decoration.id, x: geometry.current.x, y: geometry.current.y }));
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResize = (event: React.MouseEvent): void => {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = geometry.current.width;

    const onMove = (moveEvent: MouseEvent): void => {
      const nextWidth = Math.max(24, startWidth + (moveEvent.clientX - startX));
      geometry.current = { ...geometry.current, width: nextWidth };
      if (wrapperRef.current) {
        wrapperRef.current.style.width = `${nextWidth}px`;
      }
    };

    const onUp = (): void => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dispatch(updateDecoration({ id: decoration.id, width: geometry.current.width }));
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleDelete = (): void => {
    dispatch(removeDecoration(decoration.id));
    if (decoration.kind === 'file') deleteModMedia(decoration.id);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        left: `${decoration.x}%`,
        top: `${decoration.y}%`,
        width: decoration.width,
        opacity: decoration.opacity,
        transform: `rotate(${decoration.rotation}deg)`,
        pointerEvents: editable ? 'auto' : 'none',
        outline: editable ? '2px dashed rgba(120,170,255,0.9)' : 'none',
        outlineOffset: 2,
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {editable && (
        <div
          // Inline toolbar shown right above the image while editing.
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            position: 'absolute',
            top: -42,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: 8,
            background: 'rgba(20,22,28,0.92)',
            opacity: 1,
            whiteSpace: 'nowrap',
            pointerEvents: 'auto',
          }}
        >
          <ActionIcon
            size='sm'
            variant='subtle'
            color='blue'
            title='Закрепить'
            onClick={() => dispatch(updateDecoration({ id: decoration.id, pinned: true }))}
          >
            <IconPin size={16} />
          </ActionIcon>
          <Slider
            w={90}
            size='xs'
            min={0}
            max={1}
            step={0.05}
            value={decoration.opacity}
            onChange={(opacity) => dispatch(updateDecoration({ id: decoration.id, opacity }))}
            label={(value) => `${Math.round(value * 100)}%`}
          />
          <ActionIcon size='sm' variant='subtle' color='red' title='Удалить' onClick={handleDelete}>
            <IconTrash size={16} />
          </ActionIcon>
        </div>
      )}
      <img
        src={src}
        alt={decoration.name}
        draggable={false}
        onMouseDown={startDrag}
        style={{ width: '100%', display: 'block', cursor: editable ? 'move' : 'default' }}
      />
      {editable && (
        <div
          onMouseDown={startResize}
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            width: 14,
            height: 14,
            borderRadius: 3,
            background: 'rgba(120,170,255,0.95)',
            border: '2px solid #fff',
            cursor: 'nwse-resize',
          }}
        />
      )}
    </div>
  );
};

export default DecorationView;
