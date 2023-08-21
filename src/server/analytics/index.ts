import { Auxdibot } from '@/interfaces/Auxdibot';
import fetchAnalytics from '@/modules/analytics/fetchAnalytics';
import express from 'express';

const router = express.Router();

export const analytics = (auxdibot: Auxdibot) => {
   router.get('/', async (req, res, next) => {
      return res.json(await fetchAnalytics(auxdibot)).status(200);
   });
   return router;
};
