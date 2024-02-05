import { FeedNames } from './../../../constants/bot/notifications/FeedNames';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteNotification from '@/modules/features/notifications/deleteNotification';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';

export const notificationsDelete = <AuxdibotSubcommand>{
   name: 'delete',
   info: {
      module: Modules['Messages'],
      description: 'Delete an Auxdibot feed.',
      usageExample: '/notifications delete (index)',
      permission: 'notifications.delete',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const index = interaction.options.getNumber('index', true);
      const server = interaction.data.guildData;
      const notification = server.notifications[index - 1];
      if (!notification) {
         return await handleError(auxdibot, 'NOTIFICATION_NOT_FOUND', "This notification doesn't exist!", interaction);
      }
      deleteNotification(auxdibot, interaction.guild, interaction.user, index - 1)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '📬 Deleted Notification Feed';
            embed.description = `Deleted notification feed #${index}`;
            embed.fields = [
               {
                  name: 'Notification Feed',
                  value: `${FeedNames[notification.type]} (<#${notification.channelID}>): [View Output](${
                     notification.topicURL
                  })`,
               },
            ];
            handleLog(auxdibot, interaction.guild, {
               type: LogAction.NOTIFICATION_DELETED,
               userID: interaction.user.id,
               date_unix: Date.now(),
               description: `Deleted notification feed #${index}`,
            });
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() =>
            handleError(auxdibot, 'NOTIFICATION_DELETE_ERROR', "Couldn't delete that notification!", interaction),
         );
   },
};
