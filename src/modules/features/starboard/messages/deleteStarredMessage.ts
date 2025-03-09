import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction, starred_messages } from '@prisma/client';
import { Guild, GuildBasedChannel } from 'discord.js';

export default async function deleteStarredMessage(auxdibot: Auxdibot, guild: Guild, starredData: starred_messages) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const board = server.starboard_boards.find((board) => board.board_name == starredData.board);
   if (!board) return;
   const starboard_channel: GuildBasedChannel | undefined = await guild.channels
      .fetch(board.channelID)
      .catch(() => undefined);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;
   const message = await starboard_channel.messages.fetch(starredData?.starboard_message).catch(() => undefined);
   try {
      if (message)
         await message.delete().then(async () => {
            await auxdibot.log(guild, {
               type: LogAction.STARBOARD_MESSAGE_DELETED,
               date: new Date(),
               description: `Deleted a starred message in the starboard \`${starredData.board}\`.`,
               userID: message?.member?.id ?? auxdibot.user.id,
            });
         });

      await auxdibot.database.starred_messages.delete({
         where: {
            serverID_board_starred_message_id: {
               serverID: guild.id,
               board: starredData.board,
               starred_message_id: starredData.starred_message_id,
            },
         },
      });
   } catch (x) {
      console.error(x);
   }
}
