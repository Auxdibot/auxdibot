export default function durationToTimestamp(duration: number): string | undefined {
   const SYMBOLS = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      M: 3.345 * 24 * 60 * 60 * 1000,
      y: 12 * 3.345 * 24 * 60 * 60 * 1000,
   };
   for (const i in SYMBOLS) {
      if (duration % SYMBOLS[i] == 0) return `${duration / SYMBOLS[i]}${i}`;
   }
   return undefined;
}
