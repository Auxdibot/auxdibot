import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createNotification from '@/modules/features/notifications/createNotification';
import { getChannelId } from '@/modules/features/notifications/getChannelId';
import handleError from '@/util/handleError';
import { APIEmbed, ChannelType, EmbedBuilder } from 'discord.js';
export const notificationsYoutube = <AuxdibotSubcommand>{
   name: 'youtube',
   info: {
      module: Modules['Messages'],
      description: 'Listen for youtube channel uploads using Auxdibot.',
      usageExample: '/notifications youtube (channel) (handle) [...embed parameters]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
         ChannelType.GuildText,
         ChannelType.GuildAnnouncement,
      ]);
      const handle = interaction.options.getString('handle', true);
      const id = interaction.options.getString('id', true);
      const stored = interaction.data.guildData.stored_embeds.find((i) => i.id === id);
      if (!stored) return handleError(auxdibot, 'EMBED_NOT_FOUND', 'Embed not found!', interaction);
      const { content, embed } = stored;
      try {
         const youtubeChannel = await getChannelId(handle);
         if (!youtubeChannel) {
            return await handleError(auxdibot, 'CHANNEL_NOT_FOUND', 'That channel does not exist!', interaction);
         }
         return await createNotification(
            auxdibot,
            interaction.guild,
            channel,
            `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannel.id}`,
            content || embed
               ? {
                    content: content?.replace(/\\n/g, '\n'),
                    embed: embed as APIEmbed,
                 }
               : {
                    content: '> ▶️ New YouTube Upload\n\n{%FEED_LINK%}',
                    embed: null,
                 },
            'YOUTUBE',
            interaction.user.id,
         ).then(async () => {
            const description = `Created a new notification feed for ${
               youtubeChannel?.brandingSettings?.channel?.title
                  ? `the YouTube channel \`${youtubeChannel.brandingSettings.channel.title}\``
                  : 'a YouTube channel.'
            }.`;

            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '📬 Created Notification Feed';
            embed.description = description;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
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
