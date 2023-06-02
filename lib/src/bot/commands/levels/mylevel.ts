import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import calcXP from '@/util/calcXP';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
dotenv.config();
const myLevelCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder().setName('mylevel').setDescription('View your level on this server.'),
   info: {
      module: Modules['Levels'],
      description: 'View your level on this server.',
      usageExample: '/mylevel',
      allowedDefault: true,
      permission: 'levels.mylevel',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      let embed = new EmbedBuilder().setColor(auxdibot.colors.levels).toJSON();
      embed.title = 'Your Level';

      const data = await auxdibot.database.servermembers.findFirst({
         where: { userID: interaction.data.member.id, serverID: interaction.data.guild.id },
      });
      if (!data) {
         embed = auxdibot.embeds.error.toJSON();
         embed.description = 'Member data could not be found!';
         return await interaction.reply({ embeds: [embed] });
      }
      const levelXP = calcXP(data.level);
      let percent = Math.round((data.xpTill / levelXP || 0) * 10);
      if (!isFinite(percent)) percent = 0;
      const avatar = interaction.user.avatarURL({ size: 128 });
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

      return await interaction.reply({ embeds: [embed] });
   },
};
module.exports = myLevelCommand;
