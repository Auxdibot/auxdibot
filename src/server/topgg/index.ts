import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';
import { Webhook } from '@top-gg/sdk';
const router = express.Router();

const webhook = new Webhook(process.env.TOPGG_WEBHOOK_SECRET);
export const topggRoute = (auxdibot: Auxdibot) => {
   router.post(
      '/',
      webhook.listener((vote) => {
         auxdibot.database.users.upsert({
            where: { userID: vote.user },
            update: { voted_date: new Date() },
            create: { userID: vote.user, voted_date: new Date() },
         });
      }),
   );
   return router;
};
