import { levelsLeaderboard } from '@/interaction/subcommands/levels/levelsLeaderboard';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder().setName('leaderboard').setDescription('View the leaderboard for this server.'),
   info: {
      ...levelsLeaderboard.info,
      usageExample: '/leaderboard',
   },
   execute: levelsLeaderboard.execute,
};
