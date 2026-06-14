import { useEffect, useState } from 'react';

import { getModMedia } from '@shared/lib/database/modMediaDb';

import { Decoration } from '../model/types';

/**
 * Resolves the renderable image source for a decoration. URL decorations use
 * their src directly; uploaded ones load the Blob from IndexedDB and expose it
 * as an object URL, revoked on cleanup.
 */
export const useDecorationSrc = (decoration: Decoration): string | null => {
  const [src, setSrc] = useState<string | null>(decoration.kind === 'url' ? decoration.src : null);

  useEffect(() => {
    if (decoration.kind === 'url') {
      setSrc(decoration.src);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    getModMedia(decoration.id).then((record) => {
      if (cancelled || !record) return;
      objectUrl = URL.createObjectURL(record.blob);
      setSrc(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [decoration.id, decoration.kind, decoration.src]);

  return src;
};
