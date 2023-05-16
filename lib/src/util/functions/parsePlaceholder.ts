import {Guild, GuildMember, PermissionsBitField} from "discord.js";
import Server from "../../mongo/model/server/Server";
import {PunishmentNames} from "../../mongo/schema/PunishmentSchema";
import {LogNames, LogType} from "../types/Log";
import {ISuggestion} from "../../mongo/schema/SuggestionSchema";
import {SuggestionStateName} from "../types/SuggestionState";

export default async function parsePlaceholders(msg: string, guild?: Guild, guildMember?: GuildMember, suggestion?: ISuggestion) {

    let server = guild ? await Server.findOrCreateServer(guild.id) : undefined;
    let data = server ? await server.fetchData() : undefined;
    let member = guildMember;
    if (suggestion?.creator_id && guild && guild.members.cache.get(suggestion.creator_id)) member = guild.members.cache.get(suggestion.creator_id);
    let latest_punishment = data && member ? data.userRecord(member.user.id).reverse()[0] : undefined;
    let memberData = member && server ? await server.findOrCreateMember(member.id) : undefined;
    const PLACEHOLDERS: any = {
        ...(guild ? {
            "server_members": guild.memberCount,
            "server_name": guild.name,
            "server_id": guild.id,
            "server_icon_512": guild.iconURL({ size: 512 }),
            "server_icon_128": guild.iconURL({ size: 128 }),
            "server_acronym": guild.nameAcronym,
            "server_created_date": guild.createdAt.toDateString(),
            "server_created_date_formatted": `<t:${Math.round(guild.createdAt.valueOf() / 1000)}>`,
            "server_created_date_utc": guild.createdAt.toUTCString(),
            "server_created_date_iso": guild.createdAt.toISOString(),
        } : {}),
        ...(data ? {
            ...(data.latest_log ? {
                "server_latest_log_name": LogNames[data.latest_log.type as LogType],
                "server_latest_log_description": data.latest_log.description,
                "server_latest_log_date": new Date(data.latest_log.date_unix).toDateString(),
                "server_latest_log_date_formatted": `<t:${Math.round(data.latest_log.date_unix / 1000)}>`,
                "server_latest_log_date_utc": new Date(data.latest_log.date_unix).toUTCString(),
                "server_latest_log_date_iso": new Date(data.latest_log.date_unix).toISOString(),
            } : {}),
            "server_total_punishments": data.punishments.length,
            "server_total_permission_overrides": data.permission_overrides.length,
        } : undefined),
        ...(member ? {
            "member_id": member.id,
            "member_tag": member.user.tag,
            "member_mention": member.user,
            "member_created_date": member.user.createdAt.toDateString(),
            "member_created_date_formatted": `<t:${Math.round(member.user.createdAt.valueOf() / 1000)}>`,
            "member_created_date_utc": member.user.createdAt.toUTCString(),
            "member_created_date_iso": member.user.createdAt.toISOString(),
            ...(member.joinedAt ? {
                "member_join_date": member.joinedAt.toDateString(),
                "member_join_date_formatted": `<t:${Math.round(member.joinedAt.valueOf() / 1000)}>`,
                "member_join_date_utc": member.joinedAt.toUTCString(),
                "member_join_date_iso": member.joinedAt.toISOString(),
            } : {}),
            "member_highest_role": `<@&${member.roles.highest.id}>`,
            "member_is_owner": member.id == member.guild.ownerId ? "Yes" : "No",
            "member_is_admin": member.permissions.has(PermissionsBitField.Flags.Administrator) ? "Yes" : "No",
            "member_avatar_512": member.user.avatarURL({ size: 512 }) || '',
            "member_avatar_128": member.user.avatarURL({ size: 128 }) || '',
            ...(memberData ? {
                "member_experience": memberData.xp.toLocaleString(),
                "member_level": memberData.level.toLocaleString(),
                "member_xp_till": memberData.xpTill.toLocaleString()
            } : {}),
            ...(data ? {
                "member_total_punishments": data.userRecord(member.user.id).length,
                "member_latest_punishment": latest_punishment ? PunishmentNames[latest_punishment.type as "warn" | "kick" | "mute" | "ban"].name : "None",
                "member_latest_punishment_id": latest_punishment ? latest_punishment.punishment_id : "None",
                "member_latest_punishment_date": latest_punishment ? new Date(latest_punishment.date_unix).toDateString() : "None",
                "member_latest_punishment_date_formatted": latest_punishment ? `<t:${Math.round(latest_punishment.date_unix / 1000)}>` : "None",
                "member_latest_punishment_date_utc": latest_punishment ? new Date(latest_punishment.date_unix).toUTCString() : "None",
                "member_latest_punishment_date_iso": latest_punishment ? new Date(latest_punishment.date_unix).toISOString() : "None",
            } : {})
        } : {}),
        ...(suggestion ? {
            "suggestion_id": suggestion.suggestion_id,
            "suggestion_state": SuggestionStateName[suggestion.status],
            "suggestion_rating": suggestion.rating,
            "suggestion_handler_mention": suggestion.handler_id ? `<@${suggestion.handler_id}>` : "None",
            "suggestion_handled_reason": suggestion.handled_reason || "No reason given.",
            "suggestion_content": suggestion.content,
            "suggestion_date": new Date(suggestion.date_unix).toDateString(),
            "suggestion_date_formatted": `<t:${Math.round(suggestion.date_unix / 1000)}>`,
            "suggestion_date_utc": new Date(suggestion.date_unix).toUTCString(),
            "suggestion_date_iso": new Date(suggestion.date_unix).toISOString(),
        } : undefined),
        "message_date": new Date().toDateString(),
        "message_date_formatted": `<t:${Math.round(Date.now() / 1000)}>`,
        "message_date_utc": new Date().toUTCString(),
        "message_date_iso": new Date().toISOString()
    };
    let string = msg;
    for (let placeholder in PLACEHOLDERS) {
        string = string.replaceAll(`%${placeholder}%`, PLACEHOLDERS[placeholder]);
    }
    return string;
}