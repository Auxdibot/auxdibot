import parsePlaceholders from '@/util/parsePlaceholder';
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
            const embed = req.body['embed']
               ? (JSON.parse(await parsePlaceholders(auxdibot, req.body['embed'], req.guild)) satisfies APIEmbed)
               : undefined;
            if (!channel || !channel.isTextBased()) return res.status(400).json({ error: 'invalid channel' });
            const webhook_url = req.body['webhook_url'];
            return sendEmbed(
               channel,
               await parsePlaceholders(auxdibot, req.body['message'], req.guild),
               embed,
               webhook_url,
            )
               .then(() => res.json({ success: 'successfully sent embed to ' + channel.name }))
               .catch((x) => {
                  res.status(500).json({ error: x.message });
               });
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   return router;
};
export default embeds;
