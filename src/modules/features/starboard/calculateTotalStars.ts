import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { getMessage } from '@/util/getMessage';

import { LogAction, StarboardBoardData, StarredMessage } from '@prisma/client';
import { Guild } from 'discord.js';

export async function calculateTotalStars(
   auxdibot: Auxdibot,
   guild: Guild,
   board: StarboardBoardData,
   starredData: StarredMessage,
) {
   try {
      const server = await findOrCreateServer(auxdibot, guild.id);
      if (!starredData?.starred_message_id) return -1;
      const starred_message = await getMessage(guild, starredData.starred_message_id),
         starboard_message = starredData?.starboard_message_id
            ? await getMessage(guild, starredData.starboard_message_id)
            : undefined;
      if (!starred_message) return -1;
      const starredReactions = starred_message.reactions.cache.get(board.reaction);
      const users = await starredReactions?.users.fetch().catch(() => undefined);
      let users_starred: string[] = Array.from(users?.map((i) => i.id) ?? []);

      if (starboard_message && server.starboard_star) {
         const reactions = starboard_message.reactions.cache.get(board.reaction);
         const starboard_users = await reactions?.users.fetch().catch(() => undefined);
         users_starred = users_starred.concat(
            starboard_users?.map((i) => i.id).filter((i) => !users_starred.includes(i)),
         );
      }

      if (!server.self_star) {
         users_starred = users_starred.filter((i) => i != starred_message.author.id);
      }
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
