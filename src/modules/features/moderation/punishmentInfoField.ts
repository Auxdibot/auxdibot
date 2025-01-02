import { Prisma, punishments } from '@prisma/client';
import { EmbedField } from 'discord.js';

export function punishmentInfoField(
   punishment: Omit<punishments, 'v' | 'id'> | Prisma.punishmentsCreateInput,
   sendModerator?: boolean,
   sendReason?: boolean,
): EmbedField {
   return <EmbedField>{
      name: 'Punishment Info',
      value: `🪪 Punishment ID: \`${punishment.punishmentID}\`\n🕰️ Date: <t:${Math.round(
         Number(punishment.date.valueOf()) / 1000,
      )}>\n${
         punishment.expired
            ? '📅 Expired'
            : `📅 Expires: ${
                 !punishment.expires_date
                    ? 'Never'
                    : `<t:${Math.round(Number(punishment.expires_date.valueOf()) / 1000)}>`
              }\n${sendReason ? `💬 Reason: ${punishment.reason}\n` : ''}⛓️ User: <@${punishment.userID}>\n${
                 sendModerator && punishment.moderatorID ? `🧍 Moderator: <@${punishment.moderatorID}>` : ''
              }${
                 punishment.appeal
                    ? `\n${
                         punishment.appeal.accepted
                            ? '✅ Appealed'
                            : punishment.appeal.accepted === false
                            ? '❌ Appeal Denied'
                            : '🕰️ Waiting on Appeal'
                      }\n*${punishment.appeal.accepted ? punishment.appeal.appeal_reason : punishment.appeal.content}*`
                    : ''
              }`
      }`,
   };
}
