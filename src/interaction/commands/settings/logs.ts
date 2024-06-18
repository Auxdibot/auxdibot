import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import Modules from '@/constants/bot/commands/Modules';
import { logsLogChannel } from '@/interaction/subcommands/logs/logsLogChannel';
import { logsLatest } from '@/interaction/subcommands/logs/logsLatest';
import { logsActions } from '@/interaction/subcommands/logs/logsActions';
import { logsListFiltered } from '@/interaction/subcommands/logs/logsListFiltered';
import { logsFilter } from '@/interaction/subcommands/logs/logsFilter';
dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('logs')
      .setDescription('Manage how Auxdibot logs events on your server.')
      .addSubcommand((builder) =>
         builder
            .setName('channel')
            .setDescription('Change the log channel for the server, where all actions are logged to.')
            .addChannelOption((argBuilder) =>
               argBuilder
                  .setName('channel')
                  .setDescription('The channel to broadcast all logs to. (Leave empty to unset log channel)')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) => builder.setName('latest').setDescription('Get the latest logs on your server.'))
      .addSubcommand((builder) =>
         builder.setName('actions').setDescription('Get a list of every action Auxdibot can log.'),
      )
      .addSubcommand((builder) => builder.setName('list_filtered').setDescription('List every filtered log action.'))
      .addSubcommand((builder) =>
         builder
            .setName('filter')
            .setDescription('Toggle a log action from being logged on your server.')
            .addStringOption((argBuilder) =>
               argBuilder.setName('action').setDescription('The action to be disabled.').setRequired(true),
            ),
      ),
   info: {
      module: Modules['Settings'],
      description: 'Manage how Auxdibot logs events on your server.',
      usageExample: '/logs (latest|filter|list_filtered|channel|actions)',
      permissionsRequired: [PermissionFlagsBits.Administrator],
   },
   subcommands: [logsLogChannel, logsLatest, logsActions, logsListFiltered, logsFilter],
   async execute() {
      return;
   },
};
