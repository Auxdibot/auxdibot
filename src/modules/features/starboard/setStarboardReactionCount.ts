import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function setStarboardReactionCount(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   reactionCount: number,
) {
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { starboard_reaction_count: true, starboard_reaction: true, serverID: true },
         data: { starboard_reaction_count: reactionCount },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.STARBOARD_REACTION_COUNT_CHANGED,
            userID: user.id,
            date_unix: Date.now(),
            description: `The Starboard reaction count for this server has been changed to ${
               i.starboard_reaction_count + ' ' + i.starboard_reaction
            }`,
         });
         if (!i) throw new Error("couldn't preform that action");
         return i;
      });
}
