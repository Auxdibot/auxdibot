import { Auxdibot } from '@/interfaces/Auxdibot';
import { APIEmbed, Channel, Guild } from 'discord.js';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import { FeedType, LogAction } from '@prisma/client';
import handleLog from '@/util/handleLog';

export default async function createNotification(
   auxdibot: Auxdibot,
   guild: Guild,
   channel: Channel,
   topicUrl: string,
   content: { content: string; embed: APIEmbed },
   type: FeedType,
   userID?: string,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!testLimit(server.notifications, Limits.NOTIFICATIONS_LIMIT)) {
      throw new Error('You have too many notifications!');
   }
   const topic = await auxdibot.subscriber.testFeed(topicUrl).catch(() => {
      return undefined;
   });
   if (!topic && type != 'TWITCH')
      throw new Error("Failed to subscribe to that topic. Maybe the specified handle/feed url doesn't exist?");
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: {
            notifications: {
               push: {
                  channelID: channel.id,
                  message: content,
                  topicURL: topicUrl,
                  type,
               },
            },
         },
         select: { notifications: true },
      })
      .then(async (data) => {
         handleLog(auxdibot, guild, {
            userID: userID,
            description: `A notification created for ${topicUrl}.`,
            type: LogAction.NOTIFICATION_CREATED,
            date_unix: Date.now(),
         });
         await auxdibot.subscriber.subscribe(topicUrl, type, auxdibot, guild.id).catch(() => {
            data.notifications.splice(data.notifications.length - 1, 1);
            auxdibot.database.servers.update({
               where: { serverID: guild.id },
               data: { notifications: data.notifications },
            });
            throw new Error('Failed to subscribe to that topic');
         });
      })
      .catch(() => {
         throw new Error('Failed to create notification');
      });
}
