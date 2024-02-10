import { EmbedBuilder, APIEmbed } from 'discord.js';
import { CustomEmojis } from '../CustomEmojis';
import { Auxdibot } from '@/interfaces/Auxdibot';
import Modules from './Modules';
import { servercards, servers } from '@prisma/client';
import { PunishmentValues } from '../punishments/PunishmentValues';
import durationToTimestamp from '@/util/durationToTimestamp';
import timestampToDuration from '@/util/timestampToDuration';
import { FeedNames } from '../notifications/FeedNames';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SettingsEmbeds: { [k: string]: (auxdibot: Auxdibot, servers: servers, ...args: any[]) => APIEmbed } = {
   general: (auxdibot, server, card?: servercards) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.BOLT} General Settings`)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)\n\n🗒️ **Log Channel**: ${
               server.log_channel ? `<#${server.log_channel}>` : '`None`'
            }\n\n${card ? `🖼️ **Server Card**: [View](${process.env.BOT_HOMEPAGE}/cards/${server.serverID})` : ''}`,
         )
         .setColor(auxdibot.colors.info)
         .addFields(
            {
               name: '⛔ Disabled Features',
               value:
                  server.disabled_modules.reduce(
                     (accumulator: string, val: string) =>
                        `${accumulator}\r\n* ${Modules[val].emoji} *${Modules[val]?.name || 'Unknown'}*`,
                     '',
                  ) || 'None',
               inline: true,
            },
            {
               name: '📋 Filtered Logs',
               value:
                  server.filtered_logs.reduce(
                     (accumulator: string, val: string) => `${accumulator}\r\n* *${val}*`,
                     '',
                  ) || 'None',
               inline: true,
            },
         )
         .toJSON(),
   moderation: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.MODERATION} Moderation Settings`)
         .setColor(auxdibot.colors.info)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)\n\n🔇 **Mute Role**: ${
               server.mute_role ? `<@&${server.mute_role}>` : '`None`'
            }`,
         )
         .addFields(
            {
               name: '📢 Reports',
               value:
                  `**Reports Channel**\n${server.reports_channel ? `<#${server.reports_channel}>` : '`None`'}\n` +
                  `**Reports Role**\n${server.report_role ? `<@&${server.report_role}>` : '`None`'}`,
               inline: true,
            },
            {
               name: '🔨 Punishment Info',
               value:
                  `**Send Reason**: ${server.punishment_send_reason ? '✅' : '❌'}\n` +
                  `**Send Moderator**: ${server.punishment_send_moderator ? '✅' : '❌'}`,
               inline: true,
            },
            {
               name: '⚠️ Warns Threshold',
               value:
                  `**Warns**: \`⚠️ ${server.automod_punish_threshold_warns} Warns\`\n` +
                  `**Punishment**: \`${PunishmentValues[server.automod_threshold_punishment].name}\``,
               inline: true,
            },
            {
               name: '🗯️ Blacklisted Phrases',
               value:
                  `**Punishment**: \`${PunishmentValues[server.automod_banned_phrases_punishment].name}\`\n` +
                     server.automod_banned_phrases
                        .slice(0, 10)
                        .reduce((accumulator: string, val: string) => `${accumulator}\r\n* *${val}*`, '') +
                     (server.automod_banned_phrases.length > 10
                        ? `\n\nAnd ${server.automod_banned_phrases.length - 10} more...`
                        : '') || 'None',
               inline: true,
            },
            {
               name: '🛡️ Role Exceptions',
               value:
                  server.automod_role_exceptions.reduce(
                     (accumulator: string, val: string) => `${accumulator}\r\n* <@&${val}>`,
                     '',
                  ) || 'None',
               inline: true,
            },
            {
               name: '🕰️ Automod Limits',
               value:
                  `**Spam Limit**: ${
                     server.automod_spam_limit
                        ? `\`${durationToTimestamp(server.automod_spam_limit.duration)} / ${
                             server.automod_spam_limit.messages
                          } messages\`\n**Punishment**: \`${
                             PunishmentValues[server.automod_spam_punishment?.punishment ?? 'DELETE_MESSAGE'].name
                          }\``
                        : 'Unset'
                  }\n\n` +
                  `**Attachments Limit**: ${
                     server.automod_attachments_limit
                        ? `\`${durationToTimestamp(server.automod_attachments_limit.duration)} / ${
                             server.automod_attachments_limit.messages
                          } attachments\`\n**Punishment**: \`${
                             PunishmentValues[server.automod_attachments_punishment?.punishment ?? 'DELETE_MESSAGE']
                                .name
                          }\``
                        : 'Unset'
                  }\n\n` +
                  `**Invites Limit**: ${
                     server.automod_invites_limit
                        ? `\`${durationToTimestamp(server.automod_invites_limit.duration)} / ${
                             server.automod_invites_limit.messages
                          } invites\`\n**Punishment**: \`${
                             PunishmentValues[server.automod_invites_punishment?.punishment ?? 'DELETE_MESSAGE'].name
                          }\``
                        : 'Unset'
                  }`,
            },
            {
               name: '🔒 Locked Channels',
               value:
                  server.locked_channels.reduce(
                     (accumulator: string, val) =>
                        `${accumulator}\r\n* <#${val.channelID}> ${
                           val.expiration_date ? `<t:${Math.round(val.expiration_date.valueOf() / 1000)}>` : ''
                        }${val.reason ? `\nReason: \`${val.reason}\`` : ''}`,
                     '',
                  ) || 'None',
            },
         )
         .toJSON(),
   permissions: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.PERMISSIONS} Permissions Help`)
         .setDescription(
            "You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)",
         )
         .addFields({
            name: '🛡️ Permission Overrides',
            value:
               server.permission_overrides.reduce(
                  (accumulator: string, val) =>
                     `${accumulator}\r\n* ${val.allowed ? '✅' : '❌'} \`${val.permission}\` - ${
                        val.roleID ? `<@&${val.roleID}>` : val.userID ? `<@${val.userID}>` : 'Unknown'
                     }`,
                  '',
               ) || 'No Permission Overrides',
         })
         .setColor(auxdibot.colors.info)
         .toJSON(),
   roles: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.ROLES} Roles Settings`)
         .setColor(auxdibot.colors.info)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)`,
         )
         .addFields(
            {
               name: '👋 Join Roles',
               value:
                  server.join_roles.reduce((accumulator: string, val) => `${accumulator}\r\n* <@&${val}>`, '') ||
                  'No Join Roles',
               inline: true,
            },
            {
               name: '📝 Sticky Roles',
               value:
                  server.sticky_roles.reduce((accumulator: string, val) => `${accumulator}\r\n* <@&${val}>`, '') ||
                  'No Sticky Roles',
               inline: true,
            },
         )
         .toJSON(),
   greetings: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.GREETINGS} Greetings Help`)
         .setColor(auxdibot.colors.info)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)\n\n👋 **Greetings Channel**: <#${server.join_leave_channel}>`,
         )
         .addFields({
            name: 'Greetings',
            value: `**Join Message** (/join): ${
               server.join_embed || server.join_text ? '`Set`' : '`Not Set`'
            }\n**Join DM Message** (/join_dm): ${
               server.join_dm_embed || server.join_dm_text ? '`Set`' : '`Not Set`'
            }\n**Leave Message** (/leave): ${server.leave_embed || server.leave_text ? '`Set`' : '`Not Set`'}`,
         })
         .toJSON(),

   levels: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.LEVELS} Levels Settings`)
         .setColor(auxdibot.colors.info)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)\n\n**Send Level Embed**: ${
               server.level_embed
                  ? `✅ ${server.level_channel ? `<#${server.level_channel}>` : '`Reply to Message`'}`
                  : '❌'
            }\n💬 **Message XP**: \`${server.message_xp} XP / message\``,
         )
         .addFields({
            name: '🏆 Level Rewards',
            value:
               server.level_rewards.reduce(
                  (accumulator: string, val) => `${accumulator}\r\n* Level ${val.level}: <@&${val.roleID}>`,
                  '',
               ) || 'No Level Rewards',
         })
         .toJSON(),
   suggestions: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.SUGGESTIONS} Suggestions Settings`)
         .setColor(auxdibot.colors.info)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)\n\n❓ **Suggestions Channel**: ${
               server.suggestions_channel ? `<#${server.suggestions_channel}>` : '`None`'
            }\n📝 **Suggestions Updates Channel**: ${
               server.suggestions_updates_channel ? `<#${server.suggestions_updates_channel}>` : '`None`'
            }\n🗑️ **Auto Delete Suggestions**: ${
               server.suggestions_auto_delete ? '✅' : '❌'
            }\n💬 **Create Discussion Threads**: ${server.suggestions_discussion_threads ? '✅' : '❌'}`,
         )
         .addFields({
            name: '⬆️ Suggestions Reactions',
            value:
               server.suggestions_reactions.reduce((accumulator: string, val) => `${accumulator}\r\n* ${val}`, '') ||
               'No Suggestions Reactions',
         })
         .toJSON(),
   starboard: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.STARBOARD} Starboard Settings`)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)\n\n🌟 **Starboard Channel**: \`${
               server.starboard_channel ? `<#${server.starboard_channel}>` : 'None'
            }\`\n⭐ **Starboard Reaction**: \`${server.starboard_reaction}\`\n✨ **Starboard Required Stars**: \`${
               server.starboard_reaction_count
            }\``,
         )
         .setColor(auxdibot.colors.info)
         .toJSON(),
   messages: (auxdibot, server) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.MESSAGES} Message Settings`)
         .setDescription(
            `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)`,
         )
         .setFields(
            {
               name: '🕰️ Scheduled Messages',
               value:
                  server.scheduled_messages.reduce(
                     (accumulator: string, value, index) =>
                        `${accumulator}\r\n\r\n**${index + 1})** Channel: <#${value.channelID}> \`${
                           value.interval_timestamp
                        }\` (next run <t:${Math.round(
                           (value.last_run.valueOf() + (Number(timestampToDuration(value.interval_timestamp)) || 0)) /
                              1000,
                        )}:R>)`,
                     '',
                  ) || 'None',
            },
            {
               name: '📬 Notification Feeds',
               value:
                  server.notifications.reduce(
                     (accumulator, notification, index) =>
                        accumulator +
                        `\n\n**#${index + 1}**) ${FeedNames[notification.type]} (<#${notification.channelID}>): ${
                           ['YOUTUBE', 'RSS'].includes(notification.type)
                              ? `[View Output](${notification.topicURL})`
                              : `[${notification.topicURL}](https://twitch.tv/${notification.topicURL})`
                        }`,
                     '',
                  ) || 'None',
            },
         )
         .setColor(auxdibot.colors.info)
         .toJSON(),
};
