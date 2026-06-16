/**
 * Misfire chance (percent) for the pistol shot and the Shahid blast. It scales
 * with the target lot's points: pricier lots are harder to take down.
 *   <= 5000 -> 10%, > 5000 -> 20%, > 10000 -> 30%.
 */
export const getMisfireChance = (points: number): number => {
  if (points > 10000) return 30;
  if (points > 5000) return 20;
  return 10;
};
