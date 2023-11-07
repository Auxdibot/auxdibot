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
