import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const settingsReset = <AuxdibotSubcommand>{
   name: 'reset',
   info: {
      module: Modules['Settings'],
      description: 'Reset all data for this server. (Owner Only)',
      usageExample: '/settings reset',
      permission: 'settings.reset',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      if (interaction.user.id != interaction.guild.ownerId) {
         return handleError(
            auxdibot,
            'NOT_OWNER',
            'You must be the owner of the server to use this command.',
            interaction,
            true,
         );
      }
      const modal = new ModalBuilder().setCustomId('reset').setTitle('Reset Server');

      const serverNameInput = new TextInputBuilder()
         .setCustomId('server_name')
         .setLabel('Enter your server name to reset.')
         .setPlaceholder(interaction.guild.name)
         .setStyle(TextInputStyle.Short);

      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(serverNameInput));

      await interaction.showModal(modal);
      return;
   },
};
