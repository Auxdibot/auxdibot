import { AnySelectMenuInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import AuxdibotSelectMenu from '@/interfaces/menus/AuxdibotSelectMenu';
import sendEmbed from '@/modules/features/embeds/sendEmbed';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';
import parsePlaceholders from '@/util/parsePlaceholder';

export default <AuxdibotSelectMenu>{
   module: Modules['Messages'],
   name: 'post',
   command: 'embed build',
   async execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction) {
      if (!interaction.guild || !interaction.member || !interaction.channel) return;
      if (!interaction.isChannelSelectMenu()) return;
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
      await interaction.deferReply({ ephemeral: true });
      const channel = await interaction.guild.channels.fetch(interaction.channels.first().id).catch(() => undefined);
      if (!channel) {
         return handleError(auxdibot, 'CHANNEL_NOT_FOUND', 'The channel you selected could not be found!', interaction);
      }
      const placeholderContext = {
         guild: interaction.guild,
         member: await interaction.guild.members.fetch(interaction.member.user.id).catch(() => interaction.user),
      };
      await sendEmbed(
         channel,
         session?.content ? await parsePlaceholders(auxdibot, session.content, placeholderContext) : '',
         session?.embed
            ? JSON.parse(await parsePlaceholders(auxdibot, JSON.stringify(session.embed), placeholderContext))
            : undefined,
         session?.webhook_url,
      )
         .catch((x) => {
            handleError(
               auxdibot,
               'MESSAGE_POST_ERROR',
               x.message || 'An error occurred while trying to post the embed!',
               interaction,
               true,
            );
         })
         .then(() => {
            auxdibot.createReply(interaction, { ephemeral: true, content: `Sent Embed to channel ${channel}` });
         });
      return await createEmbedBuilder(auxdibot, interaction, id, interaction.message, session);
   },
};
