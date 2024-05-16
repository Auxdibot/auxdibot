/**
 * Calculates the experience points (XP) based on the given level.
 * @param level - The level for which to calculate the XP.
 * @returns The calculated XP value.
 */
const calcXP = (level: number) => Math.pow(level, 2) * 20 + 100 || 0;
export default calcXP;
