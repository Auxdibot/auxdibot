import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const setupSuggestions = <AuxdibotSubcommand>{
   name: 'suggestions',
   info: {
      module: Modules['Settings'],
      description: 'Auxdibot will be automatically configure Suggestions for your server.',
      usageExample: '/setup suggestions',
   },
   async execute(_, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const modal = new ModalBuilder().setCustomId('suggestions').setTitle('Setup Suggestions');

      const suggestionChannel = new TextInputBuilder()
         .setCustomId('suggestions_channel')
         .setLabel('Channel name for Suggestions')
         .setPlaceholder('suggestions')
         .setRequired(true)
         .setValue('suggestions')
         .setStyle(TextInputStyle.Short);
      const suggestionUpdates = new TextInputBuilder()
         .setCustomId('suggestions_updates')
         .setLabel('Channel name for Suggestion Updates')
         .setRequired(false)
         .setPlaceholder('suggestions-updates')
         .setValue('suggestions-updates')
         .setStyle(TextInputStyle.Short);
      const suggestionDiscussions = new TextInputBuilder()
         .setCustomId('suggestions_discussions')
         .setLabel('Create Discussion Threads')
         .setPlaceholder('Yes/No to create a thread with every suggestion.')
         .setRequired(true)
         .setValue('Yes')
         .setStyle(TextInputStyle.Short);
      const suggestionReactions = new TextInputBuilder()
         .setCustomId('suggestions_reactions')
         .setLabel('Reactions to add to suggestions')
         .setRequired(false)
         .setPlaceholder('ex. "🔼,🟦,🔽". Leave empty for default.')
         .setValue('🔼,🟦,🔽')
         .setStyle(TextInputStyle.Short);
      const suggestionRole = new TextInputBuilder()
         .setCustomId('suggestions_role')
         .setLabel('Suggestions ban/respond Role')
         .setRequired(false)
         .setPlaceholder('Leave empty for no role.')
         .setValue('Suggestions Administrator')
         .setStyle(TextInputStyle.Short);
      modal.addComponents(
         new ActionRowBuilder<TextInputBuilder>().addComponents(suggestionChannel),
         new ActionRowBuilder<TextInputBuilder>().addComponents(suggestionUpdates),
         new ActionRowBuilder<TextInputBuilder>().addComponents(suggestionDiscussions),
         new ActionRowBuilder<TextInputBuilder>().addComponents(suggestionReactions),
         new ActionRowBuilder<TextInputBuilder>().addComponents(suggestionRole),
      );

      await interaction.showModal(modal);
      return;
   },
};
