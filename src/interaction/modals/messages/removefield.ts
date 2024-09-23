import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';

export default <AuxdibotModal>{
   module: Modules['Messages'],
   name: 'removefield',
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
      const fieldPosition = interaction.fields.getTextInputValue('field_index');
      if (!Number.isInteger(Number(fieldPosition) || Number(fieldPosition) >= (session?.embed?.fields?.length ?? 0))) {
         return handleError(auxdibot, 'INVALID_FIELD_POSITION', 'The field position provided is invalid!', interaction);
      }

      session.embed.fields.splice(Number(fieldPosition) - 1, 1);
      await createEmbedBuilder(auxdibot, interaction, id, interaction.message, session)
         .then(() => interaction.deleteReply().catch(() => undefined))
         .catch(() => undefined);
   },
};
