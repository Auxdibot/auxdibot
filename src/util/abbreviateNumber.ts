export function abbreviateNumber(number: number): string {
   if (number >= 1000) {
      const units = ['K', 'M', 'B', 'T'];
      const unitIndex = Math.floor(Math.log10(number) / 3) - 1;
      const abbreviatedNumber = (number / Math.pow(1000, unitIndex + 1)).toFixed(1);
      return abbreviatedNumber + units[unitIndex];
   }
   return number?.toString() || '0';
}
