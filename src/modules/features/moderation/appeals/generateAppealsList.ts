import { Auxdibot } from '@/Auxdibot';
import { EmbedBuilder } from '@discordjs/builders';
import { punishments } from '@prisma/client';

export function generateAppealsList(auxdibot: Auxdibot, punishments: punishments[], punishmentTotal: number = 0) {
   const embed = new EmbedBuilder()
      .setTitle('Appeals')
      .setColor(auxdibot.colors.info)
      .setDescription('Here are all the appeals that are currently pending on the server.');
   const shown = punishments.splice(0, 10);
   embed.setFields({
      name: 'Appeals',
      value: shown
         .sort((a, b) => (a.appeal.accepted === b.appeal.accepted ? 0 : a.appeal.accepted ? 1 : -1))
         .map((appealedPunishment, index) => {
            return `**Punishment #${appealedPunishment.punishmentID}**\n${
               appealedPunishment.expired
                  ? '📅 Expired'
                  : `📅 Expires: ${
                       !appealedPunishment.expires_date
                          ? 'Never'
                          : `<t:${Math.round(Number(appealedPunishment.expires_date.valueOf()) / 1000)}>`
                    }`
            }\n💬 Reason: ${appealedPunishment.reason}\n⛓️ User: <@${appealedPunishment.userID}>\n${
               appealedPunishment.moderatorID ? `🧍 Moderator: <@${appealedPunishment.moderatorID}>` : ''
            }\n${
               appealedPunishment.appeal.accepted
                  ? '✅ Appealed'
                  : appealedPunishment.appeal.accepted === false
                  ? '❌ Appeal Denied'
                  : '🕰️ Waiting on Appeal'
            }\n\`\`\`${
               appealedPunishment.appeal.accepted
                  ? appealedPunishment.appeal.appeal_reason.slice(0, 100) +
                    (appealedPunishment.appeal.content.length > 100 ? '...' : '')
                  : appealedPunishment.appeal.content.slice(0, 100) +
                    (appealedPunishment.appeal.content.length > 100 ? '...' : '')
            }\`\`\``;
         })
         .join('\n'),
   });
   if (punishments.length < punishmentTotal) {
      embed.setFooter({ text: `...and ${punishmentTotal - punishments.length} more` });
   }
   return embed;
}
