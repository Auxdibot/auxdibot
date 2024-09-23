import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';
import emojiRegex from 'emoji-regex';

export default async function addSuggestionsReaction(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   reaction: string,
) {
   const regex = emojiRegex();
   const emojis = reaction.match(regex);
   const emoji = auxdibot.emojis.cache.find((i) => i.valueOf() == reaction) || (emojis != null ? emojis[0] : null);
   if (!emoji) throw new Error('invalid emoji');
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { suggestions_reactions: true } })
      .then(async (i) => {
         if (
            !(await auxdibot.testLimit(
               i.suggestions_reactions,
               Limits.SUGGESTIONS_REACTIONS_DEFAULT_LIMIT,
               guild.ownerId,
            ))
         )
            throw new Error('you have too many suggestions reactions');
         return await auxdibot.database.servers.update({
            where: { serverID: guild.id },
            select: { serverID: true, suggestions_reactions: true },
            data: { suggestions_reactions: { push: emoji.valueOf() } },
         });
      });
}
