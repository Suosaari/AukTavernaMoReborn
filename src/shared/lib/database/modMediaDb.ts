import Dexie, { type EntityTable } from 'dexie';

/**
 * Binary media (uploaded background images/gifs and event sounds) used by the
 * custom mod features. Stored as Blobs in IndexedDB to avoid bloating
 * localStorage. The owning redux slices keep only a lightweight reference by id.
 */
export interface ModMediaRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  name: string;
}

class ModMediaDatabase extends Dexie {
  media!: EntityTable<ModMediaRecord, 'id'>;

  constructor() {
    super('pointauc-mod-media');
    this.version(1).stores({
      media: 'id',
    });
  }
}

export const modMediaDb = new ModMediaDatabase();

export const saveModMedia = async (record: ModMediaRecord): Promise<void> => {
  await modMediaDb.media.put(record);
};

export const getModMedia = async (id: string): Promise<ModMediaRecord | undefined> => {
  return modMediaDb.media.get(id);
};

export const deleteModMedia = async (id: string): Promise<void> => {
  await modMediaDb.media.delete(id);
};
