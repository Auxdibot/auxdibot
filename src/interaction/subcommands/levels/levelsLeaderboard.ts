import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import generateLevelLeaderboard from '@/modules/features/levels/generateLevelLeaderboard';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsLeaderboard = <AuxdibotSubcommand>{
   name: 'leaderboard',
   info: {
      module: Modules['Levels'],
      description: 'View the top leveled members on this server.',
      usageExample: '/levels leaderboard',
      allowedDefault: true,
      permission: 'levels.leaderboard',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const leaderboard = await generateLevelLeaderboard(auxdibot, server.serverID, 20);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.levels).toJSON();
      embed.title = '🎖️ Top Members';
      let placement = 0;
      embed.description = leaderboard.reduce((acc, _xp, member) => {
         placement++;
         return acc + `**${placement}**) <@${member.userID}> - \`Level ${member.level}\` (\`${member.xp} XP\`)\n`;
      }, '');
      return await interaction.reply({ embeds: [embed] });
   },
};
