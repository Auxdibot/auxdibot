import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { notificationsYoutube } from '@/interaction/subcommands/notifications/notificationsYoutube';
import { notificationsDelete } from '@/interaction/subcommands/notifications/notificationsDelete';
import { notificationsList } from '@/interaction/subcommands/notifications/notificationsList';
import { notificationsTwitch } from '@/interaction/subcommands/notifications/notificationsTwitch';
import { notificationsRSS } from '@/interaction/subcommands/notifications/notificationsRSS';

dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('notifications')
      .setDescription('Create notifications for your favorite social media/RSS feeds.')
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('youtube')
               .setDescription('Listen for youtube channel uploads using Auxdibot.')
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
         createEmbedParameters(
            builder
               .setName('rss')
               .setDescription('Create a RSS feed listener using Auxdibot.')
               .addChannelOption((option) =>
                  option
                     .setName('channel')
                     .setDescription('The channel to post the feed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               )
               .addStringOption((option) => option.setName('url').setDescription('RSS feed url').setRequired(true)),
         ),
      )
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('twitch')
               .setDescription('Listen for streams on Twitch using Auxdibot.')
               .addChannelOption((option) =>
                  option
                     .setName('channel')
                     .setDescription('The channel to post the feed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               )
               .addStringOption((option) =>
                  option.setName('username').setDescription('Twitch channel username (ex. auxdible)').setRequired(true),
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
      usageExample: '/notifications (youtube|twitch|rss|delete|list)',
   },
   subcommands: [notificationsYoutube, notificationsDelete, notificationsList, notificationsTwitch, notificationsRSS],
   async execute() {
      return;
   },
};
