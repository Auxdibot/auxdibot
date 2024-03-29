export const testLimit = (v: any[], limit: number, purgePrior?: boolean) => {
   if (v.length < limit) return true;
   if (purgePrior) {
      v.splice(0, v.length - limit);
      return 'spliced';
   }
   return false;
};
