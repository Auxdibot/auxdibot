import { Punishment } from '@prisma/client';
import { EmbedField } from 'discord.js';

export function punishmentInfoField(punishment: Punishment, sendModerator?: boolean, sendReason?: boolean): EmbedField {
   return <EmbedField>{
      name: 'Punishment Info',
      value: `🪪 Punishment ID: \`${punishment.punishmentID}\`\n🕰️ Date: <t:${Math.round(
         punishment.date_unix / 1000,
      )}>\n${
         punishment.expired
            ? '📅 Expired'
            : `📅 Expires: ${
                 !punishment.expires_date_unix ? 'Never' : `<t:${Math.round(punishment.expires_date_unix / 1000)}>`
              }`
      }\n${sendReason ? `💬 Reason: ${punishment.reason}\n` : ''}⛓️ User: <@${punishment.userID}>\n${
         sendModerator && punishment.moderatorID ? `🧍 Moderator: <@${punishment.moderatorID}>` : ''
      }`,
   };
}
