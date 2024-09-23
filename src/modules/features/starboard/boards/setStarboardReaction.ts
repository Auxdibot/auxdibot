import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { validateEmoji } from '@/util/validateEmoji';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function setStarboardReaction(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   boardName: string,
   emojiStr: string,
) {
   const server = await findOrCreateServer(auxdibot, guild.id),
      board = server.starboard_boards.find((i) => i.board_name == boardName),
      emoji = validateEmoji(auxdibot, emojiStr);

   if (!board) throw new Error('Could not find the specified board!');
   if (!emoji) throw new Error('This is not a valid emoji!');

   board.reaction = emoji.valueOf();
   if (emoji == '⭐') board.star_levels = defaultStarLevels;
   else board.star_levels = [];

   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { starboard_boards: true, serverID: true },
         data: { starboard_boards: server.starboard_boards },
      })
      .then(async (i) => {
         await auxdibot.log(guild, {
            type: LogAction.STARBOARD_REACTION_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The reaction for the starboard \`${boardName}\` has been changed to ${emoji}`,
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
