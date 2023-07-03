import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { scheduleMessage } from '@/interaction/subcommands/schedule/scheduleMessage';
import { scheduleList } from '@/interaction/subcommands/schedule/scheduleList';
import { scheduleRemove } from '@/interaction/subcommands/schedule/scheduleRemove';
import { schedulePreview } from '@/interaction/subcommands/schedule/schedulePreview';

dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('schedule')
      .setDescription('Schedule embeds, cancel schedules, and list schedules with Auxdibot.')
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('message')
               .setDescription('Schedule a message using Auxdibot.')
               .addChannelOption((option) =>
                  option
                     .setName('channel')
                     .setDescription('The channel to post the embed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               )
               .addStringOption((option) =>
                  option.setName('interval').setDescription('Interval as a timestamp').setRequired(true),
               )
               .addNumberOption((option) =>
                  option
                     .setName('times_to_run')
                     .setDescription('Times to run this schedule. Leave empty for infinite.'),
               ),
         ),
      )
      .addSubcommand((builder) => builder.setName('list').setDescription('List the schedules running on your server.'))
      .addSubcommand((builder) =>
         builder
            .setName('remove')
            .addNumberOption((option) =>
               option.setName('index').setDescription('The index of the schedule to remove.').setRequired(true),
            )
            .setDescription('Remove a schedule from your server. It will never run again after deletion.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('preview')
            .addNumberOption((option) =>
               option.setName('index').setDescription('The index of the schedule to preview.').setRequired(true),
            )
            .setDescription('Preview a scheduled message.'),
      ),
   info: {
      module: Modules['Messages'],
      description: 'Schedule embeds, cancel schedules, and list schedules with Auxdibot.',
      usageExample: '/schedule (message|remove|list|preview)',
      permission: 'schedule',
   },
   subcommands: [scheduleMessage, scheduleList, scheduleRemove, schedulePreview],
   async execute() {
      return;
   },
};
