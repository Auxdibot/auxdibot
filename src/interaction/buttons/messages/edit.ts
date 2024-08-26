import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import {
   ActionRowBuilder,
   MessageComponentInteraction,
   ModalBuilder,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';

export default <AuxdibotButton>{
   module: Modules['Messages'],
   name: 'edit',
   command: 'embed build',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const [, id] = interaction.customId.split('-');
      const session = auxdibot.build_sessions.get(
         `${interaction.guildId}:${interaction.channelId}:${interaction.message.id}`,
      );
      if (!session) {
         return handleError(
            auxdibot,
            'SESSION_INACTIVE',
            'This session has gone inactive! Run the /embed build command to start a new session.\n\n*By default, sessions will go inactive after 5 minutes.*',
            interaction,
         );
      }
      if (session.userID !== interaction.user.id) {
         return handleError(
            auxdibot,
            'SESSION_USER_MISMATCH',
            'This session was started by another user!',
            interaction,
         );
      }
      const modal = new ModalBuilder().setCustomId(`embededit-${id}`).setTitle('Edit Embed');

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
         new TextInputBuilder()
            .setCustomId('message_link')
            .setLabel('Message Link')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Auxdibot will append the embed to this message, if it was posted by Auxdibot.'),
      );
      modal.addComponents(row);
      interaction.showModal(modal);
   },
};
