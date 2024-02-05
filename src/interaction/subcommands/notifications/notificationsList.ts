import { FeedNames } from './../../../constants/bot/notifications/FeedNames';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { Auxdibot } from './../../../interfaces/Auxdibot';
import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from 'discord.js';
import { servers } from '@prisma/client';

export const notificationsList = <AuxdibotSubcommand>{
   name: 'list',
   info: {
      module: Modules['Messages'],
      description: 'List all Auxdibot notification feeds.',
      usageExample: '/notifications list',
      permission: 'notifications.list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server: servers = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      embed.title = '📬 Notification Feeds';
      embed.description = 'Use the ID to delete a notification.';
      embed.fields = [
         {
            name: `Notifications for ${interaction.data.guild.name}`,
            value: server.notifications.reduce(
               (accumulator, notification, index) =>
                  accumulator +
                  `\n\n**#${index + 1}**) ${FeedNames[notification.type]} (<#${
                     notification.channelID
                  }>): [View Output](${notification.topicURL})`,
               '',
            ),
         },
      ];
      return await interaction.reply({ embeds: [embed] });
   },
};
