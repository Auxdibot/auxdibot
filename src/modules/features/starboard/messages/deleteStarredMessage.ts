import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { Log, LogAction, StarredMessage } from '@prisma/client';
import { ChannelType, Guild, GuildBasedChannel } from 'discord.js';

export default async function deleteStarredMessage(auxdibot: Auxdibot, guild: Guild, starredData: StarredMessage) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const board = server.starboard_boards.find((board) => board.board_name == starredData.board);
   if (!board) return;
   const starboard_channel: GuildBasedChannel | undefined = await guild.channels
      .fetch(board.channelID)
      .catch(() => undefined);
   if (!starboard_channel || starboard_channel.type != ChannelType.GuildText) return;
   const message = await starboard_channel.messages.fetch(starredData?.starboard_message_id).catch(() => undefined);
   try {
      if (message)
         await message.delete().then(async () => {
            await handleLog(auxdibot, guild, <Log>{
               type: LogAction.STARBOARD_MESSAGE_DELETED,
               date: new Date(),
               description: `Deleted a starred message in the starboard \`${starredData.board}\`.`,
               userID: message?.member?.id ?? auxdibot.user.id,
            });
         });
      server.starred_messages.splice(
         server.starred_messages.findIndex(
            (i) => starredData.board == i.board && starredData.starred_message_id == i.starred_message_id,
         ),
         1,
      );
      await auxdibot.database.servers.update({
         where: { serverID: guild.id },
         data: { starred_messages: server.starred_messages },
      });
   } catch (x) {
      console.error(x);
   }
}
