import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createNotification from '@/modules/features/notifications/createNotification';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import parsePlaceholders from '@/util/parsePlaceholder';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import { LogAction } from '@prisma/client';
import { ChannelType, EmbedBuilder } from 'discord.js';

export const notificationsRSS = <AuxdibotSubcommand>{
   name: 'rss',
   info: {
      module: Modules['Messages'],
      description: 'Listen for RSS feed updated using Auxdibot.',
      usageExample: '/notifications rss (channel) (url) [embed settings]',
      permission: 'notifications.youtube',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
         ChannelType.GuildText,
         ChannelType.GuildAnnouncement,
      ]);
      const url = interaction.options.getString('url', true);
      const content = interaction.options.getString('content');
      const parameters = argumentsToEmbedParameters(interaction);
      try {
         const apiEmbed = toAPIEmbed(
            JSON.parse(
               await parsePlaceholders(
                  auxdibot,
                  JSON.stringify(parameters),
                  interaction.data.guild,
                  interaction.data.member,
               ),
            ),
         );
         return await createNotification(
            auxdibot,
            interaction.guild,
            channel,
            url,
            content || apiEmbed
               ? {
                    content: content?.replace(/\\n/g, '\n'),
                    embed: apiEmbed,
                 }
               : {
                    content: '> 🔔 Feed Update\n\n%feed_link%',
                    embed: null,
                 },
            'RSS',
         ).then(async () => {
            const description = `Created a new notification feed for \`${url}\`.`;

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
