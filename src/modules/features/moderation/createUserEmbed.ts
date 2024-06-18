import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import calcXP from '@/util/calcXP';
import { PunishmentType } from '@prisma/client';
import {
   ActionRowBuilder,
   BaseMessageOptions,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   Guild,
   PermissionsBitField,
} from 'discord.js';

export async function createUserEmbed(auxdibot: Auxdibot, guild: Guild, userID: string): Promise<BaseMessageOptions> {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const data = await auxdibot.database.servermembers.findFirst({
      where: { userID: userID, serverID: guild.id },
   });
   const user = auxdibot.users.cache.get(userID),
      member = await guild.members.fetch(userID).catch(() => undefined);
   const record = server.punishments.filter((p) => p.userID == userID),
      banned = server.punishments.find((p) => p.userID == userID && p.type == PunishmentType.BAN && !p.expired),
      muted = server.punishments.find((p) => p.userID == userID && p.type == PunishmentType.MUTE && !p.expired);

   const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
   embed.title = `${CustomEmojis.USER} ${user.username} | User Info`;
   embed.thumbnail = {
      url: user.avatarURL({ size: 128 }) || '',
      width: 128,
      height: 128,
   };

   embed.fields = [
      member
         ? {
              name: 'Member Data',
              value: `👋 Join Date: <t:${Math.round((member.joinedTimestamp || Date.now()) / 1000)}>\n${
                 data?.warns
                    ? `⚠️ Warns Threshold: ${data.warns}/${server.automod_punish_threshold_warns || 'No Threshold'}\n`
                    : ''
              }${member.roles.cache.size > 0 ? `📗 Highest Role: <@&${member.roles.highest.id}>\n` : ''}${
                 member.id == guild.ownerId
                    ? '👑 Owner\n'
                    : member.permissions.has(PermissionsBitField.Flags.Administrator)
                    ? '⚒️ Administrator\n'
                    : ''
              }${
                 data
                    ? `🏆 Level: **${data.level}** \`${data.xpTill.toLocaleString()}/${calcXP(
                         data.level,
                      ).toLocaleString()} XP\`
                        ${data.suggestions_banned ? '\n🚫 Suggestions Banned' : ''}${
                         data.reports_banned ? '\n🚫 Reports Banned' : ''
                      }`
                    : ''
              }`,
           }
         : { name: 'Member Data Not Found', value: 'User is not in this server!' },
      {
         name: 'Latest Punishments',
         value: record
            .reverse()
            .slice(0, 10)
            .reduce((str, punishment) => {
               const type = PunishmentValues[punishment.type];
               return (
                  str +
                  `\n**${type.name}** - PID: ${punishment.punishmentID} - <t:${Math.round(
                     punishment.date_unix / 1000,
                  )}>`
               );
            }, '\u2800'),
      },
   ];
   const row_info = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
         new ButtonBuilder()
            .setCustomId(`record-${user.id}`)
            .setEmoji(CustomEmojis.MODERATION)
            .setStyle(ButtonStyle.Primary)
            .setLabel('Punishments'),
         new ButtonBuilder()
            .setCustomId(`levels-${user.id}`)
            .setEmoji(CustomEmojis.LEVELS)
            .setStyle(ButtonStyle.Primary)
            .setLabel('Levels'),
         new ButtonBuilder()
            .setCustomId(`avatar-${user.id}`)
            .setEmoji(CustomEmojis.USER)
            .setStyle(ButtonStyle.Primary)
            .setLabel('Avatar'),
         new ButtonBuilder()
            .setCustomId(`refresh-${user.id}`)
            .setEmoji(CustomEmojis.REFRESH)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Refresh'),
      )
      .toJSON();
   const row_punishments = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
         muted
            ? new ButtonBuilder()
                 .setCustomId(`unmute-${user.id}`)
                 .setEmoji(CustomEmojis.UNMUTED)
                 .setStyle(ButtonStyle.Danger)
                 .setLabel('Unmute')
            : new ButtonBuilder()
                 .setCustomId(`mute-${user.id}`)
                 .setEmoji(CustomEmojis.MUTED)
                 .setStyle(ButtonStyle.Secondary)
                 .setLabel('Mute')
                 .setDisabled(member == null),
         banned
            ? new ButtonBuilder()
                 .setCustomId(`unban-${user.id}`)
                 .setEmoji(CustomEmojis.GREETINGS)
                 .setStyle(ButtonStyle.Danger)
                 .setLabel('Unban')
            : new ButtonBuilder()
                 .setCustomId(`ban-${user.id}`)
                 .setEmoji(CustomEmojis.BAN)
                 .setStyle(ButtonStyle.Secondary)
                 .setLabel('Ban')
                 .setDisabled(member == null),
         new ButtonBuilder()
            .setCustomId(`kick-${user.id}`)
            .setEmoji(CustomEmojis.PERMISSIONS)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Kick')
            .setDisabled(member == null),
      )
      .toJSON();
   return { embeds: [embed], components: [row_info, row_punishments] };
}
