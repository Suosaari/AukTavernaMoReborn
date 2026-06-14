export interface WheelItem {
  name: string;
  displayName?: string;
  id: string | number;
  color: string;
  amount: number;
  isFavorite?: boolean;
  /** Id of the player who added the source lot (mod feature). */
  addedBy?: string | null;
}

export type WheelStyle = 'default' | 'genshinImpact';

export interface WheelItemWithMetadata extends WheelItem {
  originalAmount?: number;
}

export interface WheelItemWithAngle extends WheelItem {
  startAngle: number;
  endAngle: number;
}
