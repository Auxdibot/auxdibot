import calcXP from '@/util/calcXP';

export function calculateLevel(xp: number) {
   let level = 0;

   while (calcXP(level) < xp) {
      level++;
   }
   if (level === 0) return 0;
   return level - 1;
}
