import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { settingsView } from '../../subcommands/settings/settings/settingsView';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('settings')
      .setDescription('Change settings for the server.')
      .addSubcommand((builder) =>
         builder.setName('reset').setDescription('Reset all settings for this server. (Owner Only)'),
      )
      .addSubcommand((builder) => builder.setName('view').setDescription("View this server's settings.")),
   info: {
      module: Modules['Settings'],
      description: 'Change settings for the server.',
      usageExample: '/settings (view|reset)',
      permission: 'settings',
   },
   subcommands: [settingsView],
   async execute() {
      return;
   },
};
