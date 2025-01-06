import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import { EmbedBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js';

export const viewAppeals = <AuxdibotSubcommand>{
   name: 'view',
   info: {
      module: Modules['Moderation'],
      description: 'View all appeals that are currently pending on the server.',
      allowedDefault: false,
      dmableCommand: false,
      usageExample: '/appeals view',
      premium: 'guild',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   async execute(auxdibot, interaction) {
      await interaction.deferReply();
      const appeals = await getServerPunishments(auxdibot, interaction.guildId, {
         expired: false,
         appeal: { isNot: null },
      });
      if (appeals.length == 0) {
         return interaction.editReply('There are no appeals to view.');
      }
      const embed = new EmbedBuilder()
         .setTitle('Appeals')
         .setDescription('Here are all the appeals that are currently pending on the server.');
      const shown = appeals.splice(0, 20);
      embed.setFields({
         name: 'Appeals',
         value: shown
            .map((appealedPunishment, index) => {
               return `${
                  appealedPunishment.appeal.accepted
                     ? '✅ Appealed'
                     : appealedPunishment.appeal.accepted === false
                     ? '❌ Appeal Denied'
                     : '🕰️ Waiting on Appeal'
               }\n*${
                  appealedPunishment.appeal.accepted
                     ? appealedPunishment.appeal.appeal_reason
                     : appealedPunishment.appeal.content
               }*`;
            })
            .join('\n'),
      });
      if (appeals.length - shown.length > 0) {
         embed.setFooter({ text: 'and ${appeals.length - shown.length} more...' });
      }
      return auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
