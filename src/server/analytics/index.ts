import { Auxdibot } from '@/interfaces/Auxdibot';
import fetchAnalytics from '@/modules/analytics/fetchAnalytics';
import express from 'express';

const router = express.Router();

export const analyticsRoute = (auxdibot: Auxdibot) => {
   router.get('/', async (req, res) => {
      return res.json(await fetchAnalytics(auxdibot)).status(200);
   });
   return router;
};
