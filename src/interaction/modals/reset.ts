import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { resetServer } from '@/modules/features/resetServer';

export default <AuxdibotModal>{
   module: Modules['Settings'],
   name: 'reset',
   permission: 'settings.reset',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      const serverName = interaction.fields.getTextInputValue('server_name');
      if (interaction.user.id != interaction.guild.ownerId) {
         return handleError(
            auxdibot,
            'NOT_OWNER',
            'You must be the owner of the server to use this command.',
            interaction,
            true,
         );
      }
      if (serverName != interaction.guild.name) {
         return handleError(
            auxdibot,
            'INCORRECT_SERVER_NAME',
            'You specified an incorrect value! You need to input your server name to reset Auxdibot.',
            interaction,
            true,
         );
      }
      return resetServer(auxdibot, interaction.guild)
         .then(async () => {
            const embed = new EmbedBuilder()
               .setColor(auxdibot.colors.punishment)
               .setTitle('🗑️ Server Reset')
               .setDescription('Your server data has been reset.');
            return interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            return handleError(auxdibot, 'FAILED_TO_RESET', 'Failed to reset server.', interaction, true);
         });
   },
};
