import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteSuggestionsReaction from '@/modules/features/suggestions/deleteSuggestionsReaction';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const suggestionsRemoveReactions = <AuxdibotSubcommand>{
   name: 'remove_reaction',
   info: {
      module: Modules['Suggestions'],
      description: 'Remove a reaction from the reactions on suggestions.',
      usageExample: '/suggestions remove_reaction (reaction|index)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const reaction = interaction.options.getString('reaction'),
         index = interaction.options.getNumber('index');
      if (!index && !reaction) {
         return await handleError(
            auxdibot,
            'REACTION_REMOVE_NO_ARGUMENTS',
            'You need to specify a valid reaction or index!',
            interaction,
         );
      }
      const suggestionReaction = server.suggestions_reactions.find(
         (i) => (index ? server.suggestions_reactions.indexOf(i) == index - 1 : false) || i == reaction,
      );
      if (!suggestionReaction) {
         return await handleError(
            auxdibot,
            'SUGGESTION_REACTION_NOT_FOUND',
            "Couldn't find that suggestion reaction!",
            interaction,
         );
      }
      const suggestionsIndex = server.suggestions_reactions.indexOf(suggestionReaction);
      if (suggestionsIndex != -1) {
         deleteSuggestionsReaction(auxdibot, interaction.guild, suggestionsIndex)
            .then(async () => {
               const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               successEmbed.description = `Removed ${suggestionReaction} from the reactions.`;
               return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
            })
            .catch((x) => {
               handleError(
                  auxdibot,
                  'SUGGESTIONS_REACTION_REMOVE_ERROR',
                  typeof x.message == 'string' ? x.message : "Couldn't remove that suggestions reaction!",
                  interaction,
               );
            });
      }
   },
};
