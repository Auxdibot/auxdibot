/**
 * Adds a timestamp to a given date and returns the updated date.
 * @param date - The date to which the timestamp will be added.
 * @param timestamp - The timestamp to add to the date. The timestamp should be in the format of a number followed by a unit (e.g., "5d" for 5 days).
 * @returns The updated date after adding the timestamp.
 * @example addTimestampToDate(new Date(), '5d') => new Date() + 5 days
 */
export default function addTimestampToDate(date: Date, timestamp: string): Date {
   const match = timestamp.match(/\d+|[mhdwMy]/g);
   if (!match || match.length != 2) return undefined;
   const [time, stamp] = match;
   const updatedDate = new Date(date.valueOf());
   switch (stamp) {
      case 'm':
         updatedDate.setMinutes(date.getMinutes() + Number(time));
         break;
      case 'h':
         updatedDate.setUTCHours(date.getHours() + Number(time));
         break;
      case 'M':
         updatedDate.setMonth(date.getMonth() + Number(time));
         break;
      case 'w':
         updatedDate.setDate(date.getDate() + Number(time) * 7);
         break;
      case 'y':
         updatedDate.setFullYear(date.getFullYear() + Number(time));
         break;
      case 'd':
         updatedDate.setDate(date.getDate() + Number(time));
         break;
      default:
         break;
   }
   return updatedDate;
}
