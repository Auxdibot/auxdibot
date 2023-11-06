import { Guild, GuildMember, Message, PartialGuildMember, PartialMessage, PermissionsBitField } from 'discord.js';
import { PunishmentNames } from '@/constants/bot/punishments/PunishmentNames';
import { SuggestionStateName } from '@/constants/bot/suggestions/SuggestionStateName';
import { Suggestion } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function parsePlaceholders(
   auxdibot: Auxdibot,
   msg: string,
   guild?: Guild,
   guildMember?: GuildMember | PartialGuildMember,
   suggestion?: Suggestion,
   starred_message?: Message<boolean> | PartialMessage,
) {
   const server = guild ? await findOrCreateServer(auxdibot, guild.id) : undefined;
   let member = guildMember;
   if (suggestion?.creatorID && guild && guild.members.cache.get(suggestion.creatorID))
      member = guild.members.cache.get(suggestion.creatorID);
   const latest_punishment =
      server && member ? server.punishments.filter((p) => p.userID == member.user.id).reverse()[0] : undefined;
   const memberData = member
      ? await auxdibot.database.servermembers.findFirst({ where: { serverID: guild.id, userID: member.id } })
      : undefined;
   if (starred_message) member = starred_message.member;
   const PLACEHOLDERS = {
      ...(guild
         ? {
              server_members: guild.memberCount,
              server_name: guild.name,
              server_id: guild.id,
              server_icon_512: guild.iconURL({ size: 512 }),
              server_icon_128: guild.iconURL({ size: 128 }),
              server_acronym: guild.nameAcronym,
              server_created_date: guild.createdAt.toDateString(),
              server_created_date_formatted: `<t:${Math.round(guild.createdAt.valueOf() / 1000)}>`,
              server_created_date_utc: guild.createdAt.toUTCString(),
              server_created_date_iso: guild.createdAt.toISOString(),
           }
         : {}),
      ...(server
         ? {
              server_total_punishments: server.punishments.length,
              server_total_permission_overrides: server.permission_overrides.length,
           }
         : undefined),
      ...(member
         ? {
              member_id: member.id,
              member_tag: member.user.username,
              member_mention: member.user,
              member_created_date: member.user.createdAt.toDateString(),
              member_created_date_formatted: `<t:${Math.round(member.user.createdAt.valueOf() / 1000)}>`,
              member_created_date_utc: member.user.createdAt.toUTCString(),
              member_created_date_iso: member.user.createdAt.toISOString(),
              ...(member.joinedAt
                 ? {
                      member_join_date: member.joinedAt.toDateString(),
                      member_join_date_formatted: `<t:${Math.round(member.joinedAt.valueOf() / 1000)}>`,
                      member_join_date_utc: member.joinedAt.toUTCString(),
                      member_join_date_iso: member.joinedAt.toISOString(),
                   }
                 : {}),
              member_highest_role: `<@&${member.roles.highest.id}>`,
              member_is_owner: member.id == member.guild.ownerId ? 'Yes' : 'No',
              member_is_admin: member.permissions.has(PermissionsBitField.Flags.Administrator) ? 'Yes' : 'No',
              member_avatar_512: member.user.avatarURL({ size: 512 }) || '',
              member_avatar_128: member.user.avatarURL({ size: 128 }) || '',
              ...(memberData
                 ? {
                      member_experience: memberData.xp.toLocaleString(),
                      member_level: memberData.level.toLocaleString(),
                      member_xp_till: memberData.xpTill.toLocaleString(),
                   }
                 : {}),
              ...(server
                 ? {
                      member_total_punishments: server.punishments.filter((p) => p.userID == member.user.id).length,
                      member_latest_punishment: latest_punishment
                         ? PunishmentNames[latest_punishment.type as 'warn' | 'kick' | 'mute' | 'ban'].name
                         : 'None',
                      member_latest_punishment_id: latest_punishment ? latest_punishment.punishmentID : 'None',
                      member_latest_punishment_date: latest_punishment
                         ? new Date(latest_punishment.date_unix).toDateString()
                         : 'None',
                      member_latest_punishment_date_formatted: latest_punishment
                         ? `<t:${Math.round(latest_punishment.date_unix / 1000)}>`
                         : 'None',
                      member_latest_punishment_date_utc: latest_punishment
                         ? new Date(latest_punishment.date_unix).toUTCString()
                         : 'None',
                      member_latest_punishment_date_iso: latest_punishment
                         ? new Date(latest_punishment.date_unix).toISOString()
                         : 'None',
                   }
                 : {}),
           }
         : {}),
      ...(suggestion
         ? {
              suggestion_id: suggestion.suggestionID,
              suggestion_state: SuggestionStateName[suggestion.status],
              suggestion_handler_mention: suggestion.handlerID ? `<@${suggestion.handlerID}>` : 'None',
              suggestion_handled_reason: suggestion.handled_reason || 'No reason given.',
              suggestion_content: suggestion.content.replaceAll(/"/g, '\\"'),
              suggestion_date: new Date(suggestion.date_unix).toDateString(),
              suggestion_date_formatted: `<t:${Math.round(suggestion.date_unix / 1000)}>`,
              suggestion_date_utc: new Date(suggestion.date_unix).toUTCString(),
              suggestion_date_iso: new Date(suggestion.date_unix).toISOString(),
           }
         : undefined),
      ...(starred_message && server
         ? {
              starboard_message_id: starred_message.id,
              starboard_message_content: starred_message.content.replaceAll(/"/g, '\\"'),
              starboard_message_stars: starred_message.reactions.cache.get(server.starboard_reaction).count,
              starboard_message_date: new Date(starred_message.createdTimestamp).toDateString(),
              starboard_message_date_formatted: `<t:${Math.round(starred_message.createdTimestamp / 1000)}>`,
              starboard_message_date_utc: new Date(starred_message.createdTimestamp).toUTCString(),
              starboard_message_date_iso: new Date(starred_message.createdTimestamp).toISOString(),
           }
         : undefined),
      message_date: new Date().toDateString(),
      message_date_formatted: `<t:${Math.round(Date.now() / 1000)}>`,
      message_date_utc: new Date().toUTCString(),
      message_date_iso: new Date().toISOString(),
   };
   let string = msg;
   for (const placeholder in PLACEHOLDERS) {
      string = string.replaceAll(`%${placeholder}%`, PLACEHOLDERS[placeholder]);
   }
   return string;
}
