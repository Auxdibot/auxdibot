import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { getMessage } from '@/util/getMessage';

import { LogAction, Prisma, StarboardBoardData } from '@prisma/client';
import { Guild, GuildBasedChannel } from 'discord.js';

export async function calculateTotalStars(
   auxdibot: Auxdibot,
   guild: Guild,
   board: StarboardBoardData,
   starredData: Prisma.starred_messagesCreateInput,
) {
   try {
      // Fetch server data
      const server = await findOrCreateServer(auxdibot, guild.id);
      if (!starredData?.starred_message_id) return -1;

      // Fetch starred channel from context
      const channel = starredData.starred_channel_id
         ? await guild.channels.fetch(starredData.starred_channel_id)
         : undefined;
      if ((starredData.starred_channel_id && !channel) || !channel?.isTextBased()) return -1;

      // Fetch starboard channel from context
      const board_channel: GuildBasedChannel | undefined = await guild.channels
         .fetch(board.channelID)
         .catch(() => undefined);
      if (!board_channel || !board_channel.isTextBased()) return -1;

      // Fetch starred message and starboard message, if applicable.
      const starred_message = channel
            ? await channel.messages.fetch(starredData.starred_message_id)
            : await getMessage(guild, starredData.starred_message_id),
         starboard_message = board_channel
            ? await board_channel.messages.fetch(starredData.starboard_message)
            : undefined;
      if (!starred_message) return -1;
      // Fetch users who have starred the original message
      const starredReactions = starred_message.reactions.cache.get(board.reaction);
      const users = await starredReactions?.users.fetch().catch(() => undefined);

      // Create a list of users who have starred the message
      let users_starred: string[] = Array.from(users?.map((i) => i.id) ?? []);

      // Fetch users who have starred the starboard message, if starboard_star is enabled
      if (starboard_message && starboard_message.reactions && server.starboard_star) {
         const reactions = starboard_message.reactions.cache.get(board.reaction);
         const starboard_users = await reactions?.users.fetch().catch(() => undefined);
         users_starred = users_starred.concat(
            starboard_users?.map((i) => i.id).filter((i) => !users_starred.includes(i)),
         );
      }

      // Remove the author of the starred message from the list of users who have starred the message, if self_star is disabled
      if (!server.self_star) {
         users_starred = users_starred.filter((i) => i != starred_message.author.id);
      }

      // Return the total number of unique users who have starred the message
      return [...new Set(users_starred)].filter((i) => i).length;
   } catch (e) {
      console.error(e);
      auxdibot.log(guild, {
         type: LogAction.ERROR,
         userID: auxdibot.user.id,
         description: `An error occurred while calculating total stars for ${board.board_name}.`,
         date: new Date(),
      });
      return -1;
   }
}
