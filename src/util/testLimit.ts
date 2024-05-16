/**
 * Checks if the length of an array is less than a specified limit.
 * Optionally, it can purge the prior elements of the array if the limit is exceeded.
 *
 * @param v - The array to be checked.
 * @param limit - The maximum allowed length of the array.
 * @param purgePrior - Optional. If true, removes the prior elements of the array if the limit is exceeded. Default is false.
 * @returns True if the length of the array is less than the limit, false otherwise. If purgePrior is true and the limit is exceeded, returns 'spliced'.
 */
export function testLimit(v: unknown[], limit: number, purgePrior?: boolean) {
   if (v.length < limit) return true;
   if (purgePrior) {
      v.splice(0, v.length - limit);
      return 'spliced';
   }
   return false;
}
