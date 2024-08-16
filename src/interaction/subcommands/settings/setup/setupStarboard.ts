import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const setupStarboard = <AuxdibotSubcommand>{
   name: 'starboard',
   info: {
      module: Modules['Settings'],
      description: 'Auxdibot will be automatically configure a starboard for your server.',
      usageExample: '/setup starboard',
   },
   async execute(_, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const modal = new ModalBuilder().setCustomId('starboard').setTitle('Setup Starboard');

      const nameInput = new TextInputBuilder()
         .setCustomId('starboard_name')
         .setLabel('Name of Starboard')
         .setPlaceholder('server_starboard')
         .setRequired(true)
         .setValue('server_starboard')
         .setStyle(TextInputStyle.Short);
      const channelInput = new TextInputBuilder()
         .setCustomId('starboard_channel')
         .setLabel('Channel name for Starboard')
         .setPlaceholder('starboard')
         .setRequired(true)
         .setValue('starboard')
         .setStyle(TextInputStyle.Short);
      const starInput = new TextInputBuilder()
         .setCustomId('starboard_reaction')
         .setLabel('Reaction/Emoji to use for Starboard')
         .setPlaceholder('ex. ⭐ or <:auxdibot:1180698843076104292>')
         .setRequired(true)
         .setValue('⭐')
         .setStyle(TextInputStyle.Short);
      const starCountInput = new TextInputBuilder()
         .setCustomId('starboard_count')
         .setLabel('Reactions needed to star message')
         .setPlaceholder('5')
         .setRequired(true)
         .setValue('5')
         .setStyle(TextInputStyle.Short);
      modal.addComponents(
         new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
         new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput),
         new ActionRowBuilder<TextInputBuilder>().addComponents(starInput),
         new ActionRowBuilder<TextInputBuilder>().addComponents(starCountInput),
      );

      await interaction.showModal(modal);
      return;
   },
};
