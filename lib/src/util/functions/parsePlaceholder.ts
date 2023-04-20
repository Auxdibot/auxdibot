import {Guild, GuildMember, PermissionsBitField} from "discord.js";
import Server from "../../mongo/model/Server";
import {LogNames} from "../../mongo/schema/Log";
import {PunishmentNames} from "../../mongo/schema/Punishment";

export default async function parsePlaceholders(msg: string, guild?: Guild, member?: GuildMember) {

    let data = guild ? await Server.findOrCreateServer(guild.id) : undefined;
    let latest_punishment = data && member ? data.userRecord(member.user.id).reverse()[0] : undefined;
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
                "latest_log_name": LogNames[data.latest_log.type],
                "latest_log_description": data.latest_log.description,
                "latest_log_date": new Date(data.latest_log.date_unix).toDateString(),
                "latest_log_date_formatted": `<t:${Math.round(data.latest_log.date_unix / 1000)}>`,
                "latest_log_date_utc": new Date(data.latest_log.date_unix).toUTCString(),
                "latest_log_date_iso": new Date(data.latest_log.date_unix).toISOString(),
            } : {}),
            "server_total_punishments": data.punishments.length,
            "total_permission_overrides": data.permission_overrides.length,
        } : undefined),
        ...(member ? {
            "member_id": member.id,
            "member_tag": member.user.tag,
            "member_mention": `<@${member.id}>`,
            "member_created_date": member.user.createdAt.toDateString(),
            "member_created_date_formatted": `<t:${Math.round(member.user.createdAt.valueOf() / 1000)}>`,
            "member_created_date_utc": member.user.createdAt.toUTCString(),
            "member_created_date_iso": member.user.createdAt.toISOString(),
            ...(member.joinedAt ? {
                "join_date": member.joinedAt.toDateString(),
                "join_date_formatted": `<t:${Math.round(member.joinedAt.valueOf() / 1000)}>`,
                "join_date_utc": member.joinedAt.toUTCString(),
                "join_date_iso": member.joinedAt.toISOString(),
            } : {}),
            "member_highest_role": `<@&${member.roles.highest.id}>`,
            "member_is_owner": member.id == member.guild.ownerId ? "Yes" : "No",
            "member_is_admin": member.permissions.has(PermissionsBitField.Flags.Administrator) ? "Yes" : "No",
            "member_avatar_512": member.user.avatarURL({ size: 512 }) || "Couldn't find avatar.",
            "member_avatar_128": member.user.avatarURL({ size: 128 }) || "Couldn't find avatar.",
            ...(data ? {
                "member_total_punishments": data.userRecord(member.user.id).length,
                "latest_punishment": latest_punishment ? PunishmentNames[latest_punishment.type].name : "None",
                "latest_punishment_id": latest_punishment ? latest_punishment.punishment_id : "None",
                "latest_punishment_date": latest_punishment ? new Date(latest_punishment.date_unix).toDateString() : "None",
                "latest_punishment_date_formatted": latest_punishment ? `<t:${Math.round(latest_punishment.date_unix / 1000)}>` : "None",
                "latest_punishment_date_utc": latest_punishment ? new Date(latest_punishment.date_unix).toUTCString() : "None",
                "latest_punishment_date_iso": latest_punishment ? new Date(latest_punishment.date_unix).toISOString() : "None",
            } : {})
        } : {}),
        "date": new Date().toDateString(),
        "date_formatted": `<t:${Math.round(Date.now() / 1000)}>`,
        "date_utc": new Date().toUTCString(),
        "date_iso": new Date().toISOString()
    };
    let string = msg;
    for (let placeholder in PLACEHOLDERS) {
        string = string.replaceAll(`%${placeholder}%`, PLACEHOLDERS[placeholder]);
    }
    return string;
}