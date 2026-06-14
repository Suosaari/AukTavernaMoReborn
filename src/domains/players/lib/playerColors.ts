/**
 * A fixed palette of visually distinct colors used to tag players.
 * Colors are assigned by cycling through the palette, skipping the ones
 * already used when possible so adjacent players stay easy to tell apart.
 */
export const PLAYER_COLORS = [
  '#e53935',
  '#8e24aa',
  '#3949ab',
  '#039be5',
  '#00897b',
  '#43a047',
  '#c0ca33',
  '#fdd835',
  '#fb8c00',
  '#6d4c41',
  '#ec407a',
  '#26c6da',
];

export const pickPlayerColor = (usedColors: string[]): string => {
  const free = PLAYER_COLORS.find((color) => !usedColors.includes(color));
  if (free) return free;

  return PLAYER_COLORS[usedColors.length % PLAYER_COLORS.length];
};
