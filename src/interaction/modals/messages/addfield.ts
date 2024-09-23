import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';

export default <AuxdibotModal>{
   module: Modules['Messages'],
   name: 'addfield',
   command: 'embed build',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
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
      await interaction.deferReply();
      const fieldTitle = interaction.fields.getTextInputValue('field_title'),
         fieldValue = interaction.fields.getTextInputValue('field_value'),
         fieldInline = interaction.fields.getTextInputValue('field_inline');

      if (!fieldTitle || !fieldValue) {
         return handleError(
            auxdibot,
            'MISSING_FIELD',
            'Both the field title and field value are required!',
            interaction,
         );
      }

      session.embed?.fields
         ? session.embed.fields.push({
              name: fieldTitle,
              value: fieldValue,
              inline: fieldInline.toLowerCase() === 'yes',
           })
         : (session.embed = {
              ...(session?.embed ?? {}),
              fields: [
                 {
                    name: fieldTitle,
                    value: fieldValue,
                    inline: fieldInline.toLowerCase() === 'yes',
                 },
              ],
           });
      await createEmbedBuilder(auxdibot, interaction, id, interaction.message, session)
         .then(() => interaction.deleteReply().catch(() => undefined))
         .catch(() => undefined);
   },
};
