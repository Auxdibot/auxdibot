/**
 * Converts a timestamp string to a duration in milliseconds.
 * @param timestamp - The timestamp string to convert.
 * @returns The duration in milliseconds, or 'permanent' if the timestamp is 'permanent', or undefined if the timestamp is invalid.
 * @example timestampToDuration('1s') => 1000
 */
export default function timestampToDuration(timestamp: string): number | 'permanent' | undefined {
   if (timestamp == 'permanent') return 'permanent';
   const SYMBOLS = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      M: 3.345 * 24 * 60 * 60 * 1000,
      y: 12 * 3.345 * 24 * 60 * 60 * 1000,
   };
   const match = timestamp.match(/\d+|[mhdwsMy]/g);
   if (!match || match.length != 2) return undefined;
   const [time, stamp] = match;
   return Number(time) * SYMBOLS[stamp];
}
