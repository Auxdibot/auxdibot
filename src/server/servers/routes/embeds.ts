import parsePlaceholders from '@/util/parsePlaceholder';
import { Auxdibot } from '@/Auxdibot';
import sendEmbed from '@/modules/features/embeds/sendEmbed';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIEmbed } from '@prisma/client';
import { Router } from 'express';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { deleteStoredEmbed } from '@/modules/features/embeds/deleteStoredEmbed';
import { storeEmbed } from '@/modules/features/embeds/storeEmbed';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';

/*
   Embeds
   Send, store, and delete embeds.
*/
const embeds = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/embeds')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({
                  where: { serverID: req.guild.id },
                  select: {
                     stored_embeds: true,
                  },
               })
               .then(async (data) =>
                  data
                     ? res.json({
                          data,
                       })
                     : res.status(404).json({ error: "Couldn't find that server." }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'An error occurred.' });
               });
         },
      )
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         async (req, res) => {
            if (!req.body['channel'] || (!req.body['message'] && !req.body['embed']))
               return res.status(400).json({ error: 'Missing parameters.' });

            try {
               const channel = req.guild.channels.cache.get(req.body['channel']);
               const embed = req.body['embed']
                  ? (JSON.parse(
                       await parsePlaceholders(auxdibot, req.body['embed'], { guild: req.guild }),
                    ) satisfies APIEmbed)
                  : undefined;
               if (!channel || !channel.isTextBased()) return res.status(400).json({ error: 'Invalid channel.' });
               const webhook_url = req.body['webhook_url'];
               return sendEmbed(
                  channel,
                  await parsePlaceholders(auxdibot, req.body['message'], { guild: req.guild }),
                  embed,
                  webhook_url,
               )
                  .then(() => res.json({ success: 'Successfully sent embed to ' + channel.name + '.' }))
                  .catch((x) => {
                     res.status(500).json({ error: x.message });
                  });
            } catch (x) {
               console.log(x);
               return res.status(500).json({ error: 'An error occurred.' });
            }
         },
      );
   router
      .route('/:serverID/embeds/:embedID')
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         async (req, res) => {
            const embedID = req.params['embedID'];
            if (!embedID) return res.status(400).json({ error: 'Missing parameters.' });
            try {
               const server = await findOrCreateServer(auxdibot, req.guild.id);
               if (!server) return res.status(404).json({ error: "Couldn't find that server." });
               const embeds = server.stored_embeds;
               if (!embeds.find((x) => x.id === embedID)) return res.status(404).json({ error: 'Embed not found.' });
               await deleteStoredEmbed(auxdibot, req.guild, embedID)
                  .then(() => res.json({ success: 'Successfully deleted embed.' }))
                  .catch((x) => {
                     console.error(x);
                     return res.status(500).json({ error: 'An error occurred.' });
                  });
            } catch (x) {
               console.error(x);
               return res.status(500).json({ error: 'An error occurred.' });
            }
         },
      )
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         async (req, res) => {
            const embedID = req.params['embedID'];
            if (!embedID) return res.status(400).json({ error: 'Missing parameters.' });
            try {
               const server = await findOrCreateServer(auxdibot, req.guild.id);
               if (!server) return res.status(404).json({ error: "Couldn't find that server." });
               if (server.stored_embeds.find((x) => x.id === embedID))
                  return res.status(400).json({ error: 'That embed already exists!' });

               const embed = req.body['embed'] ? (JSON.parse(req.body.embed) satisfies APIEmbed) : undefined;
               const content = req.body['content'];
               const webhook = req.body['webhook_url'];
               if (!content && (!embed || isEmbedEmpty(embed)))
                  return res.status(400).json({ error: 'Missing parameters.' });
               await storeEmbed(auxdibot, req.guild, req.params['embedID'], embed, content, webhook)
                  .then(() => res.json({ success: 'Successfully added embed.' }))
                  .catch((x) => {
                     console.error(x);
                     return res.status(500).json({ error: 'An error occurred.' });
                  });
            } catch (x) {
               console.error(x);
               return res.status(500).json({ error: 'An error occurred.' });
            }
         },
      );
   return router;
};

export default embeds;
