import {
   Guild,
   GuildBasedChannel,
   GuildMember,
   Message,
   PartialGuildMember,
   PartialUser,
   PermissionsBitField,
   User,
} from 'discord.js';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { SuggestionStateName } from '@/constants/bot/suggestions/SuggestionStateName';
import { StarredMessage, Suggestion } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/Auxdibot';
import { GenericFeed } from '@/interfaces/notifications/GenericFeed';
import Placeholders from '@/constants/bot/placeholders/Placeholders';
import { getMessage } from './getMessage';
import { calculateTotalStars } from '@/modules/features/starboard/calculateTotalStars';
import { calculateLevel } from '@/modules/features/levels/calculateLevel';
import calcXP from './calcXP';

/**
 * Parses placeholders in a given message and replaces them with corresponding values.
 * @param auxdibot - The Auxdibot instance.
 * @param msg - The message to parse.
 * @param context - The context to use for the placeholders.
 * @returns The message with placeholders replaced by their corresponding values.
 */
type MessageContext = {
   guild: Guild;
   member: GuildMember | PartialGuildMember | User | PartialUser;
   suggestion: Suggestion;
   starred_data: StarredMessage;
   feed_data: GenericFeed;
   levelup: { from: number; to: number };
};
export default async function parsePlaceholders(
   auxdibot: Auxdibot,
   msg: string,
   { guild, member, suggestion, starred_data, feed_data, levelup }: Partial<MessageContext>,
) {
   if (!msg) return msg;
   const server = guild ? await findOrCreateServer(auxdibot, guild.id) : undefined;
   if (suggestion?.creatorID && guild && guild.members.cache.get(suggestion.creatorID))
      member = guild.members.cache.get(suggestion.creatorID);
   const starred_channel: GuildBasedChannel | undefined = starred_data
      ? await guild.channels.fetch(starred_data.starred_channel_id).catch(() => undefined)
      : undefined;
   const starred_message: Message<boolean> | undefined = starred_data
      ? starred_channel && starred_channel.isTextBased()
         ? await starred_channel.messages.fetch(starred_data?.starred_message_id).catch(() => undefined)
         : starred_channel
         ? await getMessage(guild, starred_data?.starred_message_id).catch(() => undefined)
         : undefined
      : undefined;
   if (starred_message && guild) {
      member = (await guild.members.fetch(starred_message.author.id).catch(() => undefined)) ?? starred_message.author;
   }
   const latest_punishment =
      server && member ? server.punishments.filter((p) => p.userID == member.id).reverse()[0] : undefined;
   const memberData =
      member && guild
         ? await auxdibot.database.servermembers.findFirst({ where: { serverID: guild.id, userID: member.id } })
         : undefined;
   const memberLevel = memberData ? calculateLevel(memberData.xp) : 0;
   const board = starred_data && server.starboard_boards.find((i) => i.board_name == starred_data?.board);
   const PLACEHOLDERS: Partial<Record<Placeholders, unknown>> = {
      ...(guild
         ? {
              [Placeholders.SERVER_MEMBERS]: guild.memberCount,
              [Placeholders.SERVER_NAME]: guild.name,
              [Placeholders.SERVER_ID]: guild.id,
              [Placeholders.SERVER_ICON_512]: guild.iconURL({ size: 512 }),
              [Placeholders.SERVER_ICON_128]: guild.iconURL({ size: 128 }),
              [Placeholders.SERVER_ACRONYM]: guild.nameAcronym,
              [Placeholders.SERVER_CREATED_DATE]: guild.createdAt.toDateString(),
              [Placeholders.SERVER_CREATED_DATE_FORMATTED]: `<t:${Math.round(guild.createdAt.valueOf() / 1000)}>`,

              [Placeholders.SERVER_CREATED_DATE_UTC]: guild.createdAt.toUTCString(),
              [Placeholders.SERVER_CREATED_DATE_ISO]: guild.createdAt.toISOString(),
           }
         : {}),
      ...(server
         ? {
              [Placeholders.SERVER_TOTAL_PUNISHMENTS]: server.punishments.length,
           }
         : undefined),
      ...(member && member instanceof GuildMember
         ? {
              [Placeholders.MEMBER_ID]: member.id,
              [Placeholders.MEMBER_TAG]: member.user.username,
              [Placeholders.MEMBER_MENTION]: member.user,
              [Placeholders.MEMBER_CREATED_DATE]: member.user.createdAt.toDateString(),
              [Placeholders.MEMBER_CREATED_DATE_FORMATTED]: `<t:${Math.round(member.user.createdAt.valueOf() / 1000)}>`,

              [Placeholders.MEMBER_CREATED_DATE_UTC]: member.user.createdAt.toUTCString(),
              [Placeholders.MEMBER_CREATED_DATE_ISO]: member.user.createdAt.toISOString(),
              ...(member.joinedAt
                 ? {
                      [Placeholders.MEMBER_JOIN_DATE]: member.joinedAt.toDateString(),
                      [Placeholders.MEMBER_JOIN_DATE_FORMATTED]: `<t:${Math.round(member.joinedAt.valueOf() / 1000)}>`,

                      [Placeholders.MEMBER_JOIN_DATE_UTC]: member.joinedAt.toUTCString(),
                      [Placeholders.MEMBER_JOIN_DATE_ISO]: member.joinedAt.toISOString(),
                   }
                 : {}),
              [Placeholders.MEMBER_HIGHEST_ROLE]: `<@&${member.roles.highest.id}>`,
              [Placeholders.MEMBER_IS_OWNER]: member.id == member.guild.ownerId ? 'Yes' : 'No',
              [Placeholders.MEMBER_IS_ADMIN]: member.permissions.has(PermissionsBitField.Flags.Administrator)
                 ? 'Yes'
                 : 'No',
              [Placeholders.MEMBER_AVATAR_512]: member.user.avatarURL({ size: 512 }) || '',
              [Placeholders.MEMBER_AVATAR_128]: member.user.avatarURL({ size: 128 }) || '',
              ...(memberData
                 ? {
                      [Placeholders.MEMBER_EXPERIENCE]: memberData.xp.toLocaleString(),
                      [Placeholders.MEMBER_LEVEL]: memberLevel,
                      [Placeholders.MEMBER_XP_TILL]: memberData.xp - calcXP(memberLevel + 1),
                   }
                 : {}),
              ...(server
                 ? {
                      [Placeholders.MEMBER_TOTAL_PUNISHMENTS]: server.punishments.filter((p) => p.userID == member.id)
                         .length,
                      [Placeholders.MEMBER_LATEST_PUNISHMENT]: latest_punishment
                         ? PunishmentValues[latest_punishment.type as 'warn' | 'kick' | 'mute' | 'ban'].name
                         : 'None',
                      [Placeholders.MEMBER_LATEST_PUNISHMENT_ID]: latest_punishment
                         ? latest_punishment.punishmentID
                         : 'None',
                      [Placeholders.MEMBER_LATEST_PUNISHMENT_DATE]: latest_punishment
                         ? latest_punishment.date.toDateString()
                         : 'None',
                      [Placeholders.MEMBER_LATEST_PUNISHMENT_DATE_FORMATTED]: latest_punishment
                         ? `<t:${Math.round(latest_punishment.date.valueOf() / 1000)}>`
                         : 'None',
                      [Placeholders.MEMBER_LATEST_PUNISHMENT_DATE_UTC]: latest_punishment
                         ? latest_punishment.date.toUTCString()
                         : 'None',
                      [Placeholders.MEMBER_LATEST_PUNISHMENT_DATE_ISO]: latest_punishment
                         ? latest_punishment.date.toISOString()
                         : 'None',
                   }
                 : {}),
           }
         : member instanceof User
         ? {
              [Placeholders.MEMBER_ID]: member.id,
              [Placeholders.MEMBER_TAG]: member.username,
              [Placeholders.MEMBER_MENTION]: member,
              [Placeholders.MEMBER_CREATED_DATE]: member.createdAt.toDateString(),
              [Placeholders.MEMBER_CREATED_DATE_FORMATTED]: `<t:${Math.round(member.createdAt.valueOf() / 1000)}>`,

              [Placeholders.MEMBER_CREATED_DATE_UTC]: member.createdAt.toUTCString(),
              [Placeholders.MEMBER_CREATED_DATE_ISO]: member.createdAt.toISOString(),
              [Placeholders.MEMBER_HIGHEST_ROLE]: 'N/A',
              [Placeholders.MEMBER_IS_OWNER]: 'N/A',
              [Placeholders.MEMBER_IS_ADMIN]: 'N/A',
              [Placeholders.MEMBER_AVATAR_512]: member.avatarURL({ size: 512 }) || '',
              [Placeholders.MEMBER_AVATAR_128]: member.avatarURL({ size: 128 }) || '',
           }
         : {}),
      ...(suggestion
         ? {
              [Placeholders.SUGGESTION_ID]: suggestion.suggestionID,
              [Placeholders.SUGGESTION_STATE]: SuggestionStateName[suggestion.status],
              [Placeholders.SUGGESTION_HANDLER_MENTION]: suggestion.handlerID ? `<@${suggestion.handlerID}>` : 'None',
              [Placeholders.SUGGESTION_HANDLED_REASON]: suggestion.handled_reason || 'No reason given.',
              [Placeholders.SUGGESTION_CONTENT]: suggestion.content.replaceAll(/\\/g, '\\\\').replaceAll(/"/g, '\\"'),
              [Placeholders.SUGGESTION_DATE]: suggestion.date.toDateString(),
              [Placeholders.SUGGESTION_DATE_FORMATTED]: `<t:${Math.round(suggestion.date.valueOf() / 1000)}>`,

              [Placeholders.SUGGESTION_DATE_UTC]: suggestion.date.toUTCString(),
              [Placeholders.SUGGESTION_DATE_ISO]: suggestion.date.toISOString(),
           }
         : undefined),
      ...(starred_data && starred_message && server
         ? {
              [Placeholders.STARBOARD_MESSAGE_ID]: starred_message.id,
              [Placeholders.STARBOARD_MESSAGE_CONTENT]: starred_message.content
                 .replaceAll(/\\/g, '\\\\')
                 .replaceAll(/"/g, '\\"'),
              [Placeholders.STARBOARD_MESSAGE_STARS]: await calculateTotalStars(
                 auxdibot,
                 guild,
                 board,
                 starred_data,
              ).catch(() => -1),
              [Placeholders.STARBOARD_MESSAGE_DATE]: new Date(starred_message.createdTimestamp).toDateString(),
              [Placeholders.STARBOARD_MESSAGE_DATE_FORMATTED]: `<t:${Math.round(
                 starred_message.createdTimestamp / 1000,
              )}>`,

              [Placeholders.STARBOARD_MESSAGE_DATE_UTC]: new Date(starred_message.createdTimestamp).toUTCString(),
              [Placeholders.STARBOARD_MESSAGE_DATE_ISO]: new Date(starred_message.createdTimestamp).toISOString(),
           }
         : undefined),
      ...(feed_data
         ? {
              [Placeholders.FEED_TITLE]: feed_data.title ?? '',
              [Placeholders.FEED_CONTENT]: feed_data.content?.replaceAll(/\\/g, '\\\\').replaceAll(/"/g, '\\"') ?? '',
              [Placeholders.FEED_LINK]: feed_data.link ?? '',
              [Placeholders.FEED_AUTHOR]: feed_data.author ?? '',
              [Placeholders.FEED_DATE]: new Date(feed_data.date).toDateString(),
              [Placeholders.FEED_DATE_FORMATTED]: `<t:${Math.round(feed_data.date / 1000)}>`,

              [Placeholders.FEED_DATE_UTC]: new Date(feed_data.date).toUTCString(),
              [Placeholders.FEED_DATE_ISO]: new Date(feed_data.date).toISOString(),
           }
         : undefined),
      ...(levelup
         ? {
              [Placeholders.LEVEL_FROM]: levelup.from,
              [Placeholders.LEVEL_TO]: levelup.to,
           }
         : {}),
      [Placeholders.MESSAGE_DATE]: new Date().toDateString(),
      [Placeholders.MESSAGE_DATE_FORMATTED]: `<t:${Math.round(Date.now() / 1000)}>`,

      [Placeholders.MESSAGE_DATE_UTC]: new Date().toUTCString(),
      [Placeholders.MESSAGE_DATE_ISO]: new Date().toISOString(),
   };
   let string = msg;
   for (const placeholder in PLACEHOLDERS) {
      string = string.replace(
         new RegExp(`\\{%${placeholder.replaceAll('_', '\\_')}%\\}`, 'gi'),
         PLACEHOLDERS[placeholder],
      );
      string = string.replace(new RegExp(`%${placeholder.replaceAll('_', '\\_')}%`, 'gi'), PLACEHOLDERS[placeholder]);
   }
   return string;
}
