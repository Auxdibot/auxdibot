import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { settingsView } from '../../subcommands/settings/settings/settingsView';
import { settingsJoinLeaveChannel } from '../../subcommands/settings/settings/settingsJoinLeaveChannel';
import { settingsMuteRole } from '../../subcommands/settings/settings/settingsMuteRole';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('settings')
      .setDescription('Change settings for the server.')
      .addSubcommand((builder) =>
         builder
            .setName('join_leave_channel')
            .setDescription('Change the channel where join and leave messages are broadcast.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to broadcast join and leave messages to.')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('mute_role')
            .setDescription('Change the mute role for this server.')
            .addRoleOption((builder) => builder.setName('role').setDescription('The role to apply when muted.')),
      )
      .addSubcommand((builder) => builder.setName('view').setDescription("View this server's settings.")),
   info: {
      module: Modules['Settings'],
      description: 'Change settings for the server.',
      usageExample: '/settings (view|mute_role|join_leave_channel)',
      permission: 'settings',
   },
   subcommands: [settingsView, settingsJoinLeaveChannel, settingsMuteRole],
   async execute() {
      return;
   },
};
