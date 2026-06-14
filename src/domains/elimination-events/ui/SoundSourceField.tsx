import { ActionIcon, Button, FileButton, Group, SegmentedControl, Slider, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconPlayerPlay, IconUpload } from '@tabler/icons-react';
import { FC } from 'react';

import { saveModMedia } from '@shared/lib/database/modMediaDb';

import { playEventSound } from '../lib/playEventSound';
import { SoundConfig } from '../model/types';

interface SoundSourceFieldProps {
  label: string;
  value: SoundConfig;
  mediaKey: string;
  onChange: (patch: Partial<SoundConfig>) => void;
}

/** Configures a single event sound: on/off, URL or uploaded file, and volume. */
const SoundSourceField: FC<SoundSourceFieldProps> = ({ label, value, mediaKey, onChange }) => {
  const sourceKind = value.source?.kind ?? 'url';

  const handleFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    await saveModMedia({ id: mediaKey, blob: file, mimeType: file.type, name: file.name });
    onChange({ source: { kind: 'file', mediaId: mediaKey, name: file.name } });
  };

  return (
    <Stack gap={6}>
      <Switch
        checked={value.enabled}
        onChange={(event) => onChange({ enabled: event.currentTarget.checked })}
        label={label}
      />
      {value.enabled && (
        <Stack gap={6} pl='md'>
          <SegmentedControl
            size='xs'
            value={sourceKind}
            onChange={(kind) =>
              onChange({ source: kind === 'url' ? { kind: 'url', url: '' } : { kind: 'file', mediaId: mediaKey, name: '' } })
            }
            data={[
              { label: 'Ссылка', value: 'url' },
              { label: 'Файл', value: 'file' },
            ]}
          />
          {sourceKind === 'url' ? (
            <TextInput
              size='xs'
              placeholder='Ссылка на звук (mp3, ogg...)'
              value={value.source?.kind === 'url' ? value.source.url : ''}
              onChange={(event) => onChange({ source: { kind: 'url', url: event.currentTarget.value } })}
            />
          ) : (
            <Group gap='xs'>
              <FileButton onChange={handleFile} accept='audio/*'>
                {(props) => (
                  <Button {...props} size='xs' variant='light' leftSection={<IconUpload size={14} />}>
                    Загрузить
                  </Button>
                )}
              </FileButton>
              <Text size='xs' c='dimmed' lineClamp={1}>
                {value.source?.kind === 'file' && value.source.name ? value.source.name : 'файл не выбран'}
              </Text>
            </Group>
          )}
          <Group gap='xs' wrap='nowrap'>
            <Text size='xs' c='dimmed' w={70}>
              Громкость
            </Text>
            <Slider
              className='flex-1'
              min={0}
              max={1}
              step={0.05}
              value={value.volume}
              onChange={(volume) => onChange({ volume })}
              label={(v) => `${Math.round(v * 100)}%`}
            />
            <ActionIcon variant='subtle' onClick={() => playEventSound(value)} title='Прослушать'>
              <IconPlayerPlay size={16} />
            </ActionIcon>
          </Group>
        </Stack>
      )}
    </Stack>
  );
};

export default SoundSourceField;
