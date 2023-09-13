import { Auxdibot } from '@/interfaces/Auxdibot';
import sendEmbed from '@/modules/features/embeds/sendEmbed';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIEmbed } from '@prisma/client';
import { Router } from 'express';
/*
   Embeds
   Send an embed to a channel.
*/
const embeds = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/embeds').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         if (!req.body['channel'] || (!req.body['message'] && !req.body['embed']))
            return res.status(400).json({ error: 'missing parameters' });

         try {
            const channel = req.guild.channels.cache.get(req.body['channel']);
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            if (!channel || !channel.isTextBased()) return res.status(400).json({ error: 'invalid channel' });
            return sendEmbed(channel, req.body['message'], embed)
               .then(() => res.json({ success: 'successfully sent embed to ' + channel.name }))
               .catch(() => res.status(500).json({ error: 'failed to send embed' }));
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   return router;
};
export default embeds;
