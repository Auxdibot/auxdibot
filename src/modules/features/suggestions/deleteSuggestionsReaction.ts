import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export default async function deleteSuggestionsReaction(auxdibot: Auxdibot, guild: Guild, id: number) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { suggestions_reactions: true } })
      .then(async (data) => {
         if (!data) throw new Error("couldn't find that server");
         if (data.suggestions_reactions.length < id) throw new Error('invalid id provided');
         const suggestionsReaction = data.suggestions_reactions[id];
         data.suggestions_reactions.splice(id, 1);
         return await auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               data: { suggestions_reactions: data.suggestions_reactions },
            })
            .then(() => suggestionsReaction);
      });
}
