import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createNotification from '@/modules/features/notifications/createNotification';
import { getChannelId } from '@/modules/features/notifications/getChannelId';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import { LogAction } from '@prisma/client';
import { ChannelType, EmbedBuilder } from 'discord.js';
export const notificationsYoutube = <AuxdibotSubcommand>{
   name: 'youtube',
   info: {
      module: Modules['Messages'],
      description: 'Listen for youtube channel uploads using Auxdibot.',
      usageExample: '/notifications youtube (channel) (handle) [embed settings]',
      permission: 'notifications.youtube',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
         ChannelType.GuildText,
         ChannelType.GuildAnnouncement,
      ]);
      const handle = interaction.options.getString('handle', true);
      const content = interaction.options.getString('content');
      const parameters = argumentsToEmbedParameters(interaction);
      try {
         const youtubeChannel = await getChannelId(handle);
         if (!youtubeChannel) {
            return await handleError(auxdibot, 'CHANNEL_NOT_FOUND', 'That channel does not exist!', interaction);
         }

         const apiEmbed = toAPIEmbed(parameters);
         return await createNotification(
            auxdibot,
            interaction.guild,
            channel,
            `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannel.id}`,
            content || apiEmbed
               ? {
                    content: content?.replace(/\\n/g, '\n'),
                    embed: apiEmbed,
                 }
               : {
                    content: '> ▶️ New YouTube Upload\n\n{%FEED_LINK%}',
                    embed: null,
                 },
            'YOUTUBE',
         ).then(async () => {
            const description = `Created a new notification feed for ${
               youtubeChannel?.brandingSettings?.channel?.title
                  ? `the YouTube channel \`${youtubeChannel.brandingSettings.channel.title}\``
                  : 'a YouTube channel.'
            }.`;

            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '📬 Created Notification Feed';
            embed.description = description;
            handleLog(auxdibot, interaction.guild, {
               type: LogAction.NOTIFICATION_CREATED,
               userID: interaction.user.id,
               date_unix: Date.now(),
               description: description,
            });
            return await interaction.reply({ embeds: [embed] });
         });
      } catch (x) {
         return await handleError(
            auxdibot,
            'NOTIFICATION_CREATE_ERROR',
            typeof x == 'object' && 'message' in x && typeof x.message == 'string'
               ? x?.message
               : 'Failed to create that notification!',
            interaction,
         );
      }
   },
};
