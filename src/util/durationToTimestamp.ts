export default function durationToTimestamp(duration: number): string | undefined {
   const SYMBOLS = {
      s: duration / 1000,
      m: duration / (60 * 1000),
      h: duration / (60 * 60 * 1000),
      d: duration / (24 * 60 * 60 * 1000),
      w: duration / (7 * 24 * 60 * 60 * 1000),
      M: duration / (3.345 * 24 * 60 * 60 * 1000),
      y: duration / (12 * 3.345 * 24 * 60 * 60 * 1000),
   };
   const evenTimestamp = Object.keys(SYMBOLS)
      .reverse()
      .find((i) => Number.isInteger(SYMBOLS[i as keyof typeof SYMBOLS]));
   if (!evenTimestamp) return undefined;
   return SYMBOLS[evenTimestamp as keyof typeof SYMBOLS] + evenTimestamp;
}
