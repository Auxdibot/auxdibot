import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import { APIEmbed } from '@prisma/client';
import { Router } from 'express';
/*
   Embeds
   Send an embed to a channel.
*/
const embeds = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/embeds').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      async (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         if (!req.body['channel'] || (!req.body['message'] && !req.body['embed']))
            return res.status(400).json({ error: 'missing parameters' });
         const serverID = req.params.serverID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(guildData.id);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         try {
            const channel = guild.channels.cache.get(req.body['channel']);
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            if (!channel || !channel.isTextBased()) return res.status(400).json({ error: 'invalid channel' });
            return channel
               .send({ embeds: embed ? [embed] : undefined, content: req.body['message'] || '' })
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
