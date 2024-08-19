import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { validateEmoji } from '@/util/validateEmoji';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction, StarboardBoardData } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function createStarboard(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   starboard: StarboardBoardData,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!validateEmoji(auxdibot, starboard.reaction)) throw new Error('Invalid emoji provided.');
   if (starboard.count < 1) throw new Error('Invalid star count provided.');
   if (!Number.isInteger(starboard.count)) throw new Error('Star count must be an integer.');
   if (starboard.star_levels.some((i) => i.stars < 1))
      throw new Error('Star levels must have a minimum of a 1x multiplier.');
   if (starboard.star_levels.some((i) => !validateEmoji(auxdibot, i.message_reaction)))
      throw new Error('Invalid emoji provided in star levels.');
   if (starboard.star_levels.some((i) => !Number.isInteger(i.stars)))
      throw new Error('Star levels must have an integer multiplier.');

   if (starboard.board_name.length < 1) throw new Error('Board name must have at least one character.');
   if (starboard.board_name.length > 100) throw new Error('Board name must have less than 100 characters.');
   if (server.starboard_boards.some((i) => i.board_name == starboard.board_name))
      throw new Error('A starboard with that name already exists.');
   if (starboard.board_name.match(/[^a-zA-Z0-9_]/g) !== null)
      throw new Error('Board name must only contain alphanumeric characters and underscores.');
   if (!guild.channels.cache.has(starboard.channelID)) throw new Error('Invalid channel provided.');
   if (starboard.star_levels.length > 5) throw new Error('Star levels must have a maximum of 5 levels.');
   if (!testLimit(server.starboard_boards, Limits.STARBOARD_BOARD_LIMIT))
      throw new Error('You have reached the maximum amount of starboards allowed on this server.');
   if (!starboard.channelID) throw new Error('Invalid channel provided.');

   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { starboard_boards: true, serverID: true },
         data: { starboard_boards: { push: starboard } },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.STARBOARD_CREATED,
            userID: user.id,
            date: new Date(),
            description: `The starboard ${starboard.board_name} has been added to this server for the channel <#${starboard.channelID}>, using the reaction ${starboard.reaction} and ${starboard.count} stars.`,
         });
         if (!i) throw new Error("Couldn't preform that action!");
         return i;
      })
      .catch((x) => {
         console.error(x);
         throw new Error(
            'Woah! An unknown error occurred. Please contact the Auxdibot Support server to see if we can resolve this!',
         );
      });
}
