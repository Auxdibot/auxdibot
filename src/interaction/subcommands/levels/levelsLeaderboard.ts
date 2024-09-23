import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { generateLeaderboardEmbed } from '@/modules/features/levels/generateLeaderboardEmbed';

export const levelsLeaderboard = <AuxdibotSubcommand>{
   name: 'leaderboard',
   group: 'stats',
   info: {
      module: Modules['Levels'],
      description: 'View the top leveled members on this server.',
      usageExample: '/levels leaderboard',
      allowedDefault: true,
      permissionsRequired: [],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const content = await generateLeaderboardEmbed(auxdibot, interaction.guild);
      return await auxdibot.createReply(interaction, { embeds: [content.embed], components: content.row });
   },
};
