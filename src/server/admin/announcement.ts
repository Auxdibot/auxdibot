import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import express from 'express';

const router = express.Router();

export const announceRoute = (auxdibot: Auxdibot) => {
   router.post(
      '/',
      async (req, res, next) => {
         const authorization = req.headers.authorization;
         if (!process.env.ANNOUNCEMENT_SECRET || authorization != process.env.ANNOUNCEMENT_SECRET) {
            return res.status(401).json({ error: 'unauthorized' });
         }
         return next();
      },
      async (req, res) => {
         const { announcement, headline } = req.body;

         if (!announcement) {
            return res.status(400).json({ error: 'no announcement' });
         }
         auxdibot.guilds.cache.forEach(async (guild) => {
            handleLog(
               auxdibot,
               guild,
               {
                  date: new Date(),
                  description: headline ?? 'Official update message from Auxdibot.',
                  type: LogAction.AUXDIBOT_ANNOUNCEMENT,
                  userID: auxdibot.user.id,
               },
               [
                  {
                     name: 'Announcement',
                     value: announcement ? announcement.replaceAll('\\n', '\n') : 'No announcement',
                     inline: false,
                  },
                  {
                     name: 'Want to disable announcements?',
                     value: ' You can disable these by running the `/logs filter action:AUXDIBOT_ANNOUNCEMENT` command or filtering the "Auxdibot Announcement" log on the dashboard.',
                     inline: false,
                  },
               ],
            ).catch((x) => {
               console.error(x);
            });
         });
         return res.status(200).json({ success: true });
      },
   );
   return router;
};
