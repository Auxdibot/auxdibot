import express from 'express';
import crypto from 'crypto';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GenericFeed } from '@/interfaces/notifications/GenericFeed';
import publishNotification from '@/modules/features/notifications/publishNotification';

// Notification request headers
const TWITCH_MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();
const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';

const router = express.Router();

export const notificationsRoute = (auxdibot: Auxdibot) => {
   router.use(express.raw({ type: 'application/json' })).post('/callbacks/twitch', async (req, res) => {
      const notification = JSON.parse(req.body);
      const message = getTwitchHmacMessage(req);
      const hmac = `sha256=${getTwitchHmac(process.env.HMAC_SECRET, message)}`;
      if (!verifyTwitchMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE])) return res.status(403);
      if (req.headers[TWITCH_MESSAGE_TYPE] == MESSAGE_TYPE_VERIFICATION)
         return res.status(200).send(notification.challenge);
      if (req.headers[TWITCH_MESSAGE_TYPE] === 'revocation') return res.status(204);
      if (req.headers[TWITCH_MESSAGE_TYPE] !== 'notification') return res.status(400);
      // Handle notification
      const event = notification['event'];
      if (!event) return res.status(204);
      const author = event['broadcaster_user_login'],
         link = `https://twitch.tv/${author}`;
      const data = <GenericFeed>{
         author: author,
         link: link,
         date: new Date(event['started_at']).valueOf(),
         title: event['id'],
      };
      const servers = await auxdibot.database.servers.findMany({}).catch(() => []);
      for (const server of servers) {
         for (const i of server.notifications) {
            if (i.topicURL == author) {
               if (
                  data &&
                  JSON.stringify(data) != i.previous_data &&
                  (data?.date ?? Date.now()) > (JSON.parse(i.previous_data)?.date ?? 0)
               ) {
                  const guild = auxdibot.guilds.cache.get(server.serverID);
                  server.notifications[server.notifications.indexOf(i)] = {
                     ...i,
                     previous_data: JSON.stringify(data),
                  };
                  auxdibot.database.servers
                     .update({
                        where: { serverID: guild.id },
                        data: { notifications: server.notifications },
                     })
                     .then(async () => {
                        publishNotification(auxdibot, guild, i, data).catch(() => undefined);
                     })
                     .catch(() => {
                        return undefined;
                     });
               }
            }
         }
      }

      res.status(200);
   });
   return router;
};

function getTwitchHmacMessage(request) {
   return request.headers[TWITCH_MESSAGE_ID] + request.headers[TWITCH_MESSAGE_TIMESTAMP] + request.body;
}

function getTwitchHmac(secret, message) {
   return crypto.createHmac('sha256', secret).update(message).digest('hex');
}
function verifyTwitchMessage(hmac, verifySignature) {
   return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}
