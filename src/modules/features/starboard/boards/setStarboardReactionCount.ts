import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function setStarboardReactionCount(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   boardName: string,
   reactionCount: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id),
      board = server.starboard_boards.find((i) => i.board_name == boardName);

   if (!board) throw new Error('Could not find the specified board!');
   if (reactionCount < 1) throw new Error('The reaction count must be greater than 0!');
   if (reactionCount > 100) throw new Error('The reaction count must be less than 100!');
   if (!Number.isInteger(reactionCount)) throw new Error('The reaction count must be an integer!');
   board.count = reactionCount;
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { starboard_boards: true, serverID: true },
         data: { starboard_boards: server.starboard_boards },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.STARBOARD_REACTION_COUNT_CHANGED,
            userID: user.id,
            date_unix: Date.now(),
            description: `The reaction count for the starboard \`${boardName}\` has been changed to ${reactionCount}`,
         });
         if (!i) throw new Error("couldn't preform that action");
         return i;
      })
      .catch((x) => {
         console.error(x);
         throw new Error(
            'Woah! An unknown error occurred. Please contact the Auxdibot Support server to see if we can resolve this!',
         );
      });
}
