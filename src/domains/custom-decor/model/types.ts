/** How the underlying image is stored. */
export type DecorationKind = 'url' | 'file';

export interface Decoration {
  id: string;
  kind: DecorationKind;
  /** Direct URL for `url` decorations; null for uploaded `file` ones (loaded from IndexedDB by id). */
  src: string | null;
  /** Display name / original file name. */
  name: string;
  /** 0..1 */
  opacity: number;
  /** Position of the top-left corner as a percentage of the viewport. */
  x: number;
  y: number;
  /** Rendered width in pixels (height keeps the natural aspect ratio). */
  width: number;
  /** Rotation in degrees. */
  rotation: number;
  /** When pinned the image is static; when unpinned it can be moved/resized/edited. */
  pinned: boolean;
}
