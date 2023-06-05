import { LogNames } from '@/constants/bot/log/LogNames';
import { Auxdibot } from '@/interfaces/Auxdibot';
import updateLog from '@/modules/logs/updateLog';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Log } from '@prisma/client';
import { EmbedBuilder, EmbedField, Guild, TextChannel } from 'discord.js';

export default async function handleLog(
   auxdibot: Auxdibot,
   guild: Guild,
   log: Log,
   fields?: EmbedField[],
   use_user_avatar?: boolean,
) {
   return await updateLog(auxdibot, guild.id, log)
      .then(async () => {
         const server = await findOrCreateServer(auxdibot, guild.id);
         const logEmbed = new EmbedBuilder()
            .setColor(auxdibot.colors.log)
            .setAuthor({ name: 'Server Log' })
            .setTitle(LogNames[log.type])
            .setDescription(
               `${log.description}\n\n🕰️ Date: <t:${Math.round(log.date_unix / 1000)}>${
                  log.userID ? `\n🧍 User: <@${log.userID}>` : ''
               }`,
            )
            .setFields(fields);
         if (use_user_avatar && log.userID) {
            const user = guild.client.users.cache.get(log.userID);
            if (user) {
               const avatar = user.avatarURL({ size: 128 });
               if (avatar) {
                  logEmbed.setThumbnail(avatar);
               }
            }
         }
         const logChannel = guild.channels.cache.get(server.log_channel) as TextChannel | undefined;
         if (!logChannel) return log;
         await logChannel.send({ embeds: [logEmbed] });
         return log;
      })
      .catch(() => undefined);
}
