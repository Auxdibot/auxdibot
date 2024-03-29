import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createNotification from '@/modules/features/notifications/createNotification';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import { LogAction } from '@prisma/client';
import { ChannelType, EmbedBuilder } from 'discord.js';

export const notificationsTwitch = <AuxdibotSubcommand>{
   name: 'twitch',
   info: {
      module: Modules['Messages'],
      description: 'Listen for streams on Twitch using Auxdibot.',
      usageExample: '/notifications twitch (channel) (username) [embed settings]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
         ChannelType.GuildText,
         ChannelType.GuildAnnouncement,
      ]);
      const username = interaction.options.getString('username', true);
      const content = interaction.options.getString('content');
      const parameters = argumentsToEmbedParameters(interaction);
      try {
         const apiEmbed = toAPIEmbed(parameters);
         return await createNotification(
            auxdibot,
            interaction.guild,
            channel,
            username,
            content || apiEmbed
               ? {
                    content: content?.replace(/\\n/g, '\n'),
                    embed: apiEmbed,
                 }
               : {
                    content: '> 🎦 Twitch Stream Online\n\n{%FEED_LINK%}',
                    embed: null,
                 },
            'TWITCH',
         ).then(async () => {
            const description = `Created a new notification feed for the Twitch channel \`${username}\`.`;

            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '📬 Created Notification Feed';
            embed.description = description;
            handleLog(auxdibot, interaction.guild, {
               type: LogAction.NOTIFICATION_CREATED,
               userID: interaction.user.id,
               date_unix: Date.now(),
               description: description,
            });
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
