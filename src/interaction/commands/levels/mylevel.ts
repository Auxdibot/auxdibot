import { levelsStats } from '@/interaction/subcommands/levels/levelsStats';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('mylevel')
      .setDescription('Check your current level and XP.')
      .addUserOption((option) =>
         option.setName('user').setDescription('The user to check the level of.').setRequired(false),
      ),
   info: {
      ...levelsStats.info,
      usageExample: '/mylevel [user]',
   },
   execute: levelsStats.execute,
};
