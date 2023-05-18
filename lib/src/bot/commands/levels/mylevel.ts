import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import calcXP from '@util/functions/calcXP';
import Modules from '@util/constants/Modules';
dotenv.config();
const myLevelCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder().setName('mylevel').setDescription('View your level on this server.'),
   info: {
      module: Modules['levels'],
      description: 'View your level on this server.',
      usageExample: '/mylevel',
      allowedDefault: true,
      permission: 'levels.mylevel',
   },
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      let embed = Embeds.LEVELS_EMBED.toJSON();
      embed.title = 'Your Level';

      const data = await interaction.data.guildData.findOrCreateMember(interaction.data.member.id);
      if (!data) {
         embed = Embeds.ERROR_EMBED.toJSON();
         embed.description = "Member data could not be found! (This is an issue on Auxdibot's end.)";
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
