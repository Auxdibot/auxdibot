import calcXP from '@/util/calcXP';

export function calculateLevel(xp: number) {
   let level = 0;

   while (calcXP(level) < xp) {
      level++;
   }
   return level - 1;
}
