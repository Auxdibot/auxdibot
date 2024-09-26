/**
 * Converts a timestamp to a human-readable string.
 * @param timestamp - The timestamp string to convert.
 * @returns The human-readable string, or 'permanent' if the timestamp is 'permanent', or undefined if the timestamp is invalid.
 * @example timestampToTimeString('1s') => '1 second'
 */
export default function timestampToTimeString(timestamp: string): string | undefined {
   if (timestamp == 'permanent') return 'permanent';
   const SYMBOLS = {
      s: 'second',
      m: 'minute',
      h: 'hour',
      d: 'day',
      w: 'week',
      M: 'month',
      y: 'year',
   };
   const match = timestamp.match(/\d+|[mhdwsMy]/g);
   if (!match || match.length != 2) return undefined;
   const [time, stamp] = match;
   const plural = Number(time) != 1 ? 's' : '';
   return Number(time)?.toLocaleString() + ' ' + SYMBOLS[stamp] + plural;
}
