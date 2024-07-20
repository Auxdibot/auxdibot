import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import calcXP from '@/util/calcXP';
import { generateLevelCard } from '@/modules/features/levels/generateLevelCard';
import handleError from '@/util/handleError';

export const levelsStats = <AuxdibotSubcommand>{
   name: 'level',
   group: 'stats',
   info: {
      module: Modules['Levels'],
      description: "View a user's level stats. Leave empty to view your own.",
      usageExample: '/levels stats level [user]',
      allowedDefault: true,
      permissionsRequired: [],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply();
      const user = interaction.options.getUser('user') ?? interaction.user;
      const data = await auxdibot.database.servermembers.findFirst({
         where: { userID: user.id, serverID: interaction.data.guild.id },
      });
      if (!data)
         return await handleError(auxdibot, 'MEMBER_DATA_NOT_FOUND', 'Member data could not be found!', interaction);
      const levelXP = calcXP(data.level);
      const leaderboard =
         (await auxdibot.database.servermembers
            .count({
               where: { serverID: interaction.data.guild.id, xp: { gt: data.xp } },
            })
            .catch(() => 0)) + 1;
      const image = await generateLevelCard(user, data.xp, data.xpTill, data.level, levelXP, leaderboard);
      return await auxdibot.createReply(interaction, {
         files: [{ attachment: image, name: 'level.png' }],
      });
   },
};
