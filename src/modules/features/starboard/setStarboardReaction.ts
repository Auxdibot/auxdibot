import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';
import emojiRegex from 'emoji-regex';

export default async function setStarboardReaction(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   emojiStr: string,
) {
   const regex = emojiRegex();
   const emojis = emojiStr.match(regex);
   const emoji = auxdibot.emojis.cache.find((i) => i.valueOf() == emojiStr) || (emojis != null ? emojis[0] : null);
   if (!emoji) throw new Error('invalid emoji');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { starboard_reaction: true, serverID: true },
         data: { starboard_reaction: emoji.valueOf() },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.STARBOARD_REACTION_CHANGED,
            userID: user.id,
            date_unix: Date.now(),
            description: `The Starboard reaction for this server has been changed to ${i.starboard_reaction}`,
         });
         if (!i) throw new Error("couldn't preform that action");
         return i;
      });
}
