import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { testLimit } from '@/util/testLimit';
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
   const emoji = auxdibot.emojis.cache.find((i) => i.toString() == reaction) || (emojis != null ? emojis[0] : null);
   if (!emoji) throw new Error('invalid emoji');
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { suggestions_reactions: true } })
      .then(async (i) => {
         if (!testLimit(i.suggestions_reactions, Limits.SUGGESTIONS_REACTIONS_DEFAULT_LIMIT))
            throw new Error('you have too many suggestions reactions');
         return await auxdibot.database.servers.update({
            where: { serverID: guild.id },
            select: { serverID: true, suggestions_reactions: true },
            data: { suggestions_reactions: { push: emoji.toString() } },
         });
      });
}
