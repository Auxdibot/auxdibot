import { Auxdibot } from '@/interfaces/Auxdibot';
import { GenericFeed } from '@/interfaces/notifications/GenericFeed';
import parsePlaceholders from '@/util/parsePlaceholder';
import { toAPIEmbed } from '@/util/toAPIEmbed';
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
         content: await parsePlaceholders(
            auxdibot,
            notification.message.content,
            guild,
            undefined,
            undefined,
            undefined,
            data,
         ),
         embeds: notification.message.embed
            ? [
                 toAPIEmbed(
                    JSON.parse(
                       await parsePlaceholders(
                          auxdibot,
                          JSON.stringify(notification.message.embed),
                          guild,
                          undefined,
                          undefined,
                          undefined,
                          data,
                       ),
                    ),
                 ),
              ]
            : undefined,
      })
      .catch(() => undefined);
}
