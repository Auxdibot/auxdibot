import { LogNames } from '@/constants/bot/log/LogNames';
import { Auxdibot } from '@/Auxdibot';
import updateLog from '@/modules/logs/updateLog';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Log } from '@prisma/client';
import { ChannelType, EmbedBuilder, EmbedField, Guild } from 'discord.js';

/**
 * Handles a log entry for Auxdibot.
 * @param auxdibot - The instance of Auxdibot.
 * @param guild - The guild where the log occurred.
 * @param log - The log entry to handle.
 * @param fields - Optional array of additional fields to include in the log embed.
 * @param use_user_avatar - Optional flag indicating whether to use the user's avatar in the log embed.
 * @returns The handled log entry.
 */
export default async function handleLog(
   auxdibot: Auxdibot,
   guild: Guild,
   log: Omit<Log, 'old_date_unix'>,
   fields?: EmbedField[],
   use_user_avatar?: boolean,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.filtered_logs.indexOf(log.type) != -1) return;
   return await updateLog(auxdibot, guild.id, log)
      .then(async () => {
         const logEmbed = new EmbedBuilder()
            .setColor(auxdibot.colors.log)
            .setAuthor({ name: `Log Action: ${log.type}` })
            .setTitle(LogNames[log.type] || null)
            .setDescription(
               `${log.description}\n\n🕰️ Date: <t:${Math.round(log.date.valueOf() / 1000)}>${
                  log.userID ? `\n🧍 User: <@${log.userID}>` : ''
               }`,
            );
         if (fields) {
            logEmbed.setFields(...fields);
         }
         if (log.type == 'ERROR') {
            logEmbed.setColor(auxdibot.colors.denied);
         } else if (log.type == 'AUXDIBOT_ANNOUNCEMENT') {
            logEmbed.setColor(auxdibot.colors.default);
         }
         if (use_user_avatar && log.userID) {
            const user = await guild.client.users.fetch(log.userID).catch(() => undefined);
            if (user) {
               const avatar = user.avatarURL({ size: 128 });
               if (avatar) {
                  logEmbed.setThumbnail(avatar);
               }
            }
         }
         const logChannel = await guild.channels.fetch(server.log_channel).catch(() => undefined);
         if (!logChannel || logChannel.type != ChannelType.GuildText) return log;
         await logChannel.send({ embeds: [logEmbed] }).catch(() => undefined);
         return log;
      })
      .catch(() => undefined);
}
