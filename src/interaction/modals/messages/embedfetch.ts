import { ChannelType, Message, ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';
import { APIEmbed } from '@prisma/client';

export default <AuxdibotModal>{
   module: Modules['Messages'],
   name: 'embedfetch',
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

      const messageLink = interaction.fields.getTextInputValue('message_link');

      const messageUrlParts = messageLink.replace(/^(https?:\/\/)?discord\.com\/channels\//, '').split('/');
      const [, channelId, messageId] = messageUrlParts;

      const channel = await auxdibot.channels.fetch(channelId).catch(() => undefined);
      if (!channel || channel.type != ChannelType.GuildText) {
         return handleError(
            auxdibot,
            'INVALID_CHANNEL',
            'The provided channel is not valid! Please provide a valid text channel.',
            interaction,
         );
      }
      const message: Message<true> | undefined = await channel.messages.fetch(messageId).catch(() => undefined);
      if (!message) {
         return handleError(auxdibot, 'INVALID_MESSAGE_LINK', 'The provided message link is invalid!', interaction);
      }
      if (message.embeds.length === 0) {
         return handleError(auxdibot, 'NO_EMBEDS', 'The message does not contain any embeds!', interaction);
      }

      const firstEmbed = message.embeds[0];
      await createEmbedBuilder(auxdibot, interaction, id, interaction.message, {
         ...session,
         embed: firstEmbed.toJSON() as APIEmbed,
      })
         .then(() => interaction.deleteReply().catch(() => undefined))
         .catch(() => undefined);
   },
};
