import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import calcXP from '@/util/calcXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsStats = <AuxdibotSubcommand>{
   name: 'stats',
   info: {
      module: Modules['Levels'],
      description: "View a user's level stats. Leave empty to view your own.",
      usageExample: '/levels stats',
      allowedDefault: true,
      permission: 'levels.stats',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user');
      const data = await auxdibot.database.servermembers.findFirst({
         where: { userID: user?.id || interaction.data.member.id, serverID: interaction.data.guild.id },
      });
      if (!data)
         return await handleError(auxdibot, 'MEMBER_DATA_NOT_FOUND', 'Member data could not be found!', interaction);

      const levelXP = calcXP(data.level);
      let percent = Math.round((data.xpTill / levelXP || 0) * 10);
      if (!isFinite(percent)) percent = 0;
      const avatar = user?.avatarURL({ size: 128 }) || interaction.user.avatarURL({ size: 128 });

      const embed = new EmbedBuilder().setColor(auxdibot.colors.levels).toJSON();
      embed.title = `${user ? user.username + "'s" : 'Your'} Level`;
      if (avatar) embed.thumbnail = { url: avatar };
      embed.description = `🏅 Experience: \`${data.xp.toLocaleString()} XP\`\n🏆 Level: \`Level ${data.level.toLocaleString()}\``;
      embed.fields = [
         {
            name: 'Level Progress',
            value: `\`Level ${data.level.toLocaleString()}\` [${
               new Array(percent + 1).join('🟩') + new Array(10 - percent).join('⬛')
            }] \`Level ${(
               data.level + 1
            ).toLocaleString()}\`\n(\`${data.xpTill.toLocaleString()}\ XP\`/\`${levelXP.toLocaleString()}\ XP\`)`,
         },
      ];

      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
