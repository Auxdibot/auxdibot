import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { MessageReaction, PartialMessageReaction } from 'discord.js';

export default async function deleteStarredMessage(
   auxdibot: Auxdibot,
   messageReaction: MessageReaction | PartialMessageReaction,
) {
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const starred = server.starred_messages.find((i) => i.starred_message_id == messageReaction.message.id);
   const starboard_channel = messageReaction.message.guild.channels.cache.get(server.starboard_channel);
   if (!starboard_channel.isTextBased()) return;
   const message = await starboard_channel.messages.fetch(starred.starboard_message_id).catch(() => undefined);
   try {
      if (!message) return;
      await message.delete();
      server.starred_messages.splice(server.starred_messages.indexOf(starred), 1);
      await auxdibot.database.servers.update({
         where: { serverID: messageReaction.message.guild.id },
         data: { starred_messages: server.starred_messages },
      });
   } catch (x) {
      console.log(x);
   }
}
