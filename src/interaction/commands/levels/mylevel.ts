import { levelsStats } from '@/interaction/subcommands/levels/levelsStats';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('mylevel')
      .setDescription("View your or another member's level stats on this server.")
      .addUserOption((option) =>
         option.setName('user').setDescription('The user to check the level of.').setRequired(false),
      ),
   info: {
      ...levelsStats.info,
      usageExample: '/mylevel [user]',
   },
   execute: levelsStats.execute,
};
