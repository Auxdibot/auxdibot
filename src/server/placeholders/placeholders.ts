import { PlaceholdersData } from '@/constants/bot/placeholders/PlaceholdersData';
import { Router } from 'express';
/*
   Placeholders
   View placeholders for given context
*/
const router = Router();

const placeholders = () => {
   router.get('/', (req, res) => {
      const context = req.query['context'];
      return res.json({
         placeholders: !context
            ? PlaceholdersData
            : Object.keys(PlaceholdersData)
                 .filter(
                    (key) =>
                       PlaceholdersData[key].context === context ||
                       (Array.isArray(context) && context.includes(PlaceholdersData[key].context)),
                 )
                 .concat(Object.keys(PlaceholdersData).filter((key) => PlaceholdersData[key].context === null))
                 .reduce((accumulator, key) => {
                    accumulator[key] = PlaceholdersData[key];
                    return accumulator;
                 }, {}),
      });
   });
   return router;
};

export default placeholders;
