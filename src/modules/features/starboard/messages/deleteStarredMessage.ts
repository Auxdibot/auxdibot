import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { StarboardBoardData } from '@prisma/client';
import { GuildBasedChannel, MessageReaction, PartialMessageReaction } from 'discord.js';

export default async function deleteStarredMessage(
   auxdibot: Auxdibot,
   board: StarboardBoardData,
   messageReaction: MessageReaction | PartialMessageReaction,
) {
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const starred = server.starred_messages.find(
      (i) => i.starred_message_id == messageReaction.message.id && i.board == board.board_name,
   );
   const starboard_channel: GuildBasedChannel | undefined = await messageReaction.message.guild.channels
      .fetch(board.channelID)
      .catch(() => undefined);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;
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
      console.error(x);
   }
}
