import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const setupGreetings = <AuxdibotSubcommand>{
   name: 'greetings',
   info: {
      module: Modules['Settings'],
      description: 'Auxdibot will be automatically configure Greetings for your server.',
      usageExample: '/setup greetings',
   },
   async execute(_, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const modal = new ModalBuilder().setCustomId('greetings').setTitle('Setup Greetings');

      const greetingChannel = new TextInputBuilder()
         .setCustomId('greetings_channel')
         .setLabel('Name of Greetings Channel')
         .setPlaceholder('The name of the channel to create greetings in.')
         .setRequired(true)
         .setValue('welcome')
         .setStyle(TextInputStyle.Short);

      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(greetingChannel));

      await interaction.showModal(modal);
      return;
   },
};
