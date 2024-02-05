import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { notificationsYoutube } from '@/interaction/subcommands/notifications/notificationsYoutube';
import { notificationsDelete } from '@/interaction/subcommands/notifications/notificationsDelete';
import { notificationsList } from '@/interaction/subcommands/notifications/notificationsList';

dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('notifications')
      .setDescription('Create notifications for your favorite social media/RSS feeds.')
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('youtube')
               .setDescription('Create a feed listener using Auxdibot.')
               .addChannelOption((option) =>
                  option
                     .setName('channel')
                     .setDescription('The channel to post the feed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               )
               .addStringOption((option) =>
                  option.setName('handle').setDescription('Youtube channel handle (ex. @Auxdible)').setRequired(true),
               ),
         ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('delete')
            .setDescription('Delete an Auxdibot notification feed.')
            .addNumberOption((option) =>
               option.setName('index').setDescription('The index of the notification.').setRequired(true),
            ),
      )
      .addSubcommand((builder) => builder.setName('list').setDescription('List all Auxdibot notification feeds.')),
   info: {
      module: Modules['Messages'],
      description: 'Create notifications for your favorite social media/RSS feeds.',
      usageExample: '/notifications (youtube|delete|list)',
      permission: 'notifications',
   },
   subcommands: [notificationsYoutube, notificationsDelete, notificationsList],
   async execute() {
      return;
   },
};
