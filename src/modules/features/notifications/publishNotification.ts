import { Auxdibot } from '@/Auxdibot';
import { GenericFeed } from '@/interfaces/notifications/GenericFeed';

import parsePlaceholders from '@/util/parsePlaceholder';
import { LogAction, Notification } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function publishNotification(
   auxdibot: Auxdibot,
   guild: Guild,
   notification: Notification,
   data?: GenericFeed,
) {
   const channel: Channel | undefined = await guild.channels.fetch(notification.channelID).catch(() => undefined);
   if (!channel || (channel.type != ChannelType.GuildAnnouncement && channel.type != ChannelType.GuildText)) return;
   return await channel
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
      .catch(() => {
         auxdibot.log(guild, {
            date: new Date(),
            description: `Failed to send notification to ${channel.id} for feed topic${notification.topicURL}.`,
            type: LogAction.ERROR,
            userID: auxdibot.user.id,
         });
      });
}
