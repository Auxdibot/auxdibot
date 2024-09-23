import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';

export default <AuxdibotModal>{
   module: Modules['Messages'],
   name: 'webhook',
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

      const webhookURL = interaction.fields.getTextInputValue('webhook_url');
      if (!/https:\/\/discord.com\/api\/webhooks\/[^\s\/]+?(?=\b)/.test(webhookURL)) {
         return handleError(auxdibot, 'INVALID_WEBHOOK_URL', 'The provided webhook URL is invalid!', interaction);
      }
      await createEmbedBuilder(auxdibot, interaction, id, interaction.message, {
         ...session,
         webhook_url: webhookURL,
      })
         .then(() => interaction.deleteReply().catch(() => undefined))
         .catch(() => undefined);
   },
};
