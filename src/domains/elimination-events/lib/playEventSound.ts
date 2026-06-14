import { getModMedia } from '@shared/lib/database/modMediaDb';

import { SoundConfig } from '../model/types';

/**
 * Plays a configured event sound (from a URL or an uploaded file in IndexedDB).
 * No-op when disabled or no source is set. Returns the Audio element so callers
 * may stop it early if needed.
 */
export const playEventSound = async (sound?: SoundConfig | null): Promise<HTMLAudioElement | null> => {
  if (!sound || !sound.enabled || !sound.source) return null;

  let src: string | null = null;
  let objectUrl: string | null = null;

  if (sound.source.kind === 'url') {
    src = sound.source.url;
  } else {
    const record = await getModMedia(sound.source.mediaId);
    if (record) {
      objectUrl = URL.createObjectURL(record.blob);
      src = objectUrl;
    }
  }

  if (!src) return null;

  const audio = new Audio(src);
  audio.volume = Math.max(0, Math.min(1, sound.volume ?? 0.7));

  if (objectUrl) {
    audio.addEventListener('ended', () => URL.revokeObjectURL(objectUrl as string), { once: true });
  }

  try {
    await audio.play();
  } catch {
    // Autoplay may be blocked until the user interacts with the page; ignore.
  }

  return audio;
};
