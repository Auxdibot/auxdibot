import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import {
   ActionRowBuilder,
   MessageComponentInteraction,
   ModalBuilder,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import handleError from '@/util/handleError';

export default <AuxdibotButton>{
   module: Modules['Messages'],
   name: 'addfield',
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
      if (session?.embed?.fields?.length >= 25) {
         return handleError(
            auxdibot,
            'FIELD_LIMIT_REACHED',
            'You have reached the maximum number of fields for this embed!',
            interaction,
         );
      }
      const modal = new ModalBuilder().setCustomId(`addfield-${id}`).setTitle('Add Embed Field');
      modal.addComponents(
         new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
               .setCustomId('field_title')
               .setLabel('Field Title')
               .setStyle(TextInputStyle.Short)
               .setRequired(true)
               .setPlaceholder('The title of the field.'),
         ),
         new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
               .setCustomId('field_value')
               .setLabel('Field Value')
               .setStyle(TextInputStyle.Paragraph)
               .setRequired(true)
               .setPlaceholder('The value of the field.'),
         ),
         new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
               .setCustomId('field_inline')
               .setLabel('Field Inline')
               .setStyle(TextInputStyle.Short)
               .setRequired(true)
               .setPlaceholder('Yes/No for if the field should be inline.'),
         ),
      );
      interaction.showModal(modal);
   },
};
