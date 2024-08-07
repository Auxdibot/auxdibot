import { Auxdibot } from '@/interfaces/Auxdibot';
import { GenericFeed } from '@/interfaces/notifications/GenericFeed';
import parsePlaceholders from '@/util/parsePlaceholder';
import { Notification } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function publishNotification(
   auxdibot: Auxdibot,
   guild: Guild,
   notification: Notification,
   data?: GenericFeed,
) {
   const channel = guild.channels.cache.get(notification.channelID);
   if (!channel || !channel.isTextBased()) return;
   channel
      .send({
         content: await parsePlaceholders(auxdibot, notification.message.content, { guild, feed_data: data }),
         embeds: notification.message.embed
            ? [
                 JSON.parse(
                    await parsePlaceholders(auxdibot, JSON.stringify(notification.message.embed), {
                       guild,
                       feed_data: data,
                    }),
                 ),
              ]
            : undefined,
      })
      .catch(() => undefined);
}
