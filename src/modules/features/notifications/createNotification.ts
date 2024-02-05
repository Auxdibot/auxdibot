import { Auxdibot } from '@/interfaces/Auxdibot';
import { APIEmbed, Channel, Guild } from 'discord.js';
import axios from 'axios';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';

export default async function createNotification(
   auxdibot: Auxdibot,
   guild: Guild,
   channel: Channel,
   topicUrl: string,
   content: { content: string; embed: APIEmbed },
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!testLimit(server.notifications, Limits.NOTIFICATIONS_LIMIT)) {
      throw new Error('You have too many notifications!');
   }
   const topic = await axios
      .get(`${topicUrl}`)
      .then((data) => {
         return data.data;
      })
      .catch(() => {
         throw new Error("Can't fetch from that topicUrl");
      });
   if (!topic) throw new Error("Can't fetch from that topicUrl");

   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      data: {
         notifications: {
            push: {
               channelID: channel.id,
               message: content,
               topicURL: topicUrl,
               type: 'YOUTUBE',
            },
         },
      },
   });
}
