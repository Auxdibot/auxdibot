export default function timestampToDuration(timestamp: string): number | 'permanent' | undefined {
   if (timestamp == 'permanent') return 'permanent';
   const SYMBOLS = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      M: 3.345 * 24 * 60 * 60 * 1000,
      y: 12 * 3.345 * 24 * 60 * 60 * 1000,
   };
   const match = timestamp.match(/\d+|[mhdwMy]/g);
   if (!match || match.length != 2) return undefined;
   const [time, stamp] = match;
   return Number(time) * SYMBOLS[stamp as 'm' | 'h' | 'd' | 'w' | 'M' | 'y'];
}
