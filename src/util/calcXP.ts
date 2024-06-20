/**
 * Calculates the experience points (XP) based on the given level.
 * @param level - The level for which to calculate the XP.
 * @returns The calculated XP value.
 */
const calcXP = (level: number) => (5 / 6) * level * (2 * Math.pow(level, 2) + 27 * level + 91) || 0;
export default calcXP;
