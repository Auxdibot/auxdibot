import { ChannelType, Message, ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';
import parsePlaceholders from '@/util/parsePlaceholder';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';

export default <AuxdibotModal>{
   module: Modules['Messages'],
   name: 'embededit',
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
      const placeholderContext = {
         guild: channel.guild,
         member: await channel.guild.members.fetch(interaction.user.id).catch(() => interaction.user),
      };
      const apiEmbed =
         session?.embed && !isEmbedEmpty(session.embed)
            ? JSON.parse(await parsePlaceholders(auxdibot, JSON.stringify(session?.embed), placeholderContext))
            : undefined;
      message
         .edit({
            embeds: apiEmbed ? [apiEmbed] : undefined,
            content: session?.content ? await parsePlaceholders(auxdibot, session.content, placeholderContext) : '',
         })
         .then(() => interaction.deleteReply().catch(() => undefined))
         .catch(() => {
            handleError(
               auxdibot,
               'MESSAGE_EDIT_ERROR',
               'An error occurred while trying to edit the embed!',
               interaction,
               true,
            );
         });
      return await createEmbedBuilder(auxdibot, interaction, id, interaction.message, session).catch(() => undefined);
   },
};
