import { Auxdibot } from '@/interfaces/Auxdibot';
import createNotification from '@/modules/features/notifications/createNotification';
import deleteNotification from '@/modules/features/notifications/deleteNotification';
import { getChannelId } from '@/modules/features/notifications/getChannelId';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIEmbed, FeedType } from '@prisma/client';
import { Router } from 'express';
/*
   Notifications
   Create, view or delete notifications.
*/
const notifications = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/notifications')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, notifications: true } })
               .then(async (data) =>
                  data
                     ? res.json({
                          data: {
                             notifications: data.notifications.map((i, index) => ({ ...i, index })),
                          },
                       })
                     : res.status(404).json({ error: "couldn't find that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      )
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         async (req, res) => {
            if (!req.body['type'] || !FeedType[req.body['type']])
               return res.status(400).json({ error: 'Invalid notification type!' });
            if (!req.body['topicURL'] || typeof req.body['topicURL'] != 'string')
               return res.status(400).json({ error: 'Invalid topic!' });
            const channel = await req.guild.channels.fetch(req.body['channelID']).catch(() => undefined);
            if (!req.body['channelID'] || typeof req.body['channelID'] != 'string' || !channel)
               return res.status(400).json({ error: 'Invalid channel!' });
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            const message = req.body['message'] ?? '';
            const processedTopic =
               req.body['type'] == 'YOUTUBE'
                  ? `https://www.youtube.com/feeds/videos.xml?channel_id=${await getChannelId(
                       req.body['topicURL'],
                    ).then((data) => data.id)}`
                  : req.body['topicURL'];
            console.log(processedTopic);
            return createNotification(
               auxdibot,
               req.guild,
               channel,
               processedTopic,
               {
                  content: message,
                  embed: embed,
               },
               FeedType[req.body['type']],
               req.user.id,
            )
               .then((data) => res.json({ data: data }))
               .catch((x) =>
                  res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
               );
         },
      );
   router.route('/:serverID/notifications/:id').delete(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const id = req.params.id;
         if ((typeof id != 'string' && typeof id != 'number') || Number(id) < -1)
            return res.status(404).json({ error: 'invalid id' });

         return deleteNotification(auxdibot, req.guild, req.user, Number(id))
            .then((i) => res.json({ data: i }))
            .catch((x) =>
               res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
            );
      },
   );
   return router;
};
export default notifications;
