import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import addSuggestionsReaction from '@/modules/features/suggestions/addSuggestionsReaction';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
export const suggestionsAddReactions = <AuxdibotSubcommand>{
   name: 'add_reaction',
   info: {
      module: Modules['Suggestions'],
      description: 'Add a reaction to the reactions on suggestions.',
      usageExample: '/suggestions add_reaction (reaction)',
      permission: 'suggestions.reactions.add',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const reaction = interaction.options.getString('reaction', true);
      if (!reaction) {
         return await handleError(
            auxdibot,
            'NO_REACTION_SPECIFIED',
            'You need to specify a valid reaction!',
            interaction,
         );
      }
      if (server.suggestions_reactions.find((suggestionReaction) => suggestionReaction == reaction)) {
         return await handleError(
            auxdibot,
            'SUGGESTION_REACTION_EXISTS',
            'This suggestions reaction already exists!',
            interaction,
         );
      }
      addSuggestionsReaction(auxdibot, interaction.guild, interaction.user, reaction)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Added ${reaction} as a suggestion reaction.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SUGGESTION_REACTION_ADD_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't add that reaction as a suggestions reaction!",
               interaction,
            );
         });
   },
};
