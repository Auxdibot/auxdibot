import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import emojiRegex from 'emoji-regex';

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
      const regex = emojiRegex();
      const emojis = reaction.match(regex);
      const emoji =
         interaction.client.emojis.cache.find((i) => i.toString() == reaction) || (emojis != null ? emojis[0] : null);
      if (!emoji) {
         return await handleError(auxdibot, 'REACTION_INVALID', 'This is an invalid reaction!', interaction);
      }
      server.suggestions_reactions.push(reaction);
      await auxdibot.database.servers.update({
         where: { serverID: interaction.data.guild.id },
         data: { suggestions_reactions: server.suggestions_reactions },
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.description = `Added ${reaction} as a suggestion reaction.`;
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
