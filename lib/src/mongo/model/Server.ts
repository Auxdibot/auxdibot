import mongoose from "mongoose";

import punishmentSchema, {IPunishment, PunishmentNames, toEmbedField} from "../schema/Punishment";
import Counter from "./Counter";
import LogSchema, {ILog, LogNames} from "../schema/Log";
import PermissionOverrideSchema, {IPermissionOverride} from "../schema/PermissionOverride";
import {APIEmbed, EmbedField, Guild, GuildMember, PermissionsBitField} from "discord.js";
import Embeds from "../../util/constants/Embeds";

export interface IServerSettings {
    _id?: mongoose.ObjectId;
    mute_role?: string;
    log_channel?: string;
    join_leave_channel?: string;
    join_embed?: APIEmbed;
    leave_embed?: APIEmbed;
    join_text?: string;
    leave_text?: string;
}

const serverSettingsSchema = new mongoose.Schema<IServerSettings>({
    mute_role: { type: String },
    log_channel: { type: String },
    join_leave_channel: { type: String },
    join_embed: { type: Object, default: {"type":"rich","title":"👋 Member joined! (%server_members% members.)","thumbnail":{"url":"%member_avatar_128%"},"footer":{"text":"%server_name%"},"description":"%member_mention% joined the server.","color":9159498,"author":{"name":"%message_date%"}} },
    leave_embed: { type: Object, default: {"type":"rich","title":"👋 Member left! (%server_members% members.)","thumbnail":{"url":"%member_avatar_128%"},"footer":{"text":"%server_name%"},"description":"%member_mention% left the server.","color":16007990,"author":{"name":"%message_date%"}}},
    join_text: { type: String, default: "Somebody joined the server!" },
    leave_text: { type: String, default: "Somebody left the server!" }
}, { _id: false });

export interface IServer {
    _id: mongoose.ObjectId;
    discord_id: string;
    latest_log: ILog;
    punishments: IPunishment[];
    permission_overrides: IPermissionOverride[];
    settings: IServerSettings;
}
interface ServerMethods {
    userRecord(user_id: String): IPunishment[];
    addPunishment(punishment: IPunishment): IPunishment;
    checkExpired(): IPunishment[];
    setMuteRole(mute_role_id: String): boolean;
    setLogChannel(log_channel_id: String): boolean;
    setJoinLeaveChannel(join_leave_channel_id: String): boolean;
    setJoinEmbed(join_embed: APIEmbed): boolean;
    setJoinText(join_text: String): boolean;
    setLeaveEmbed(leave_embed: APIEmbed): boolean;
    setLeaveText(leave_text: String): boolean;
    getPunishment(user_id: String, type?: 'warn' | 'kick' | 'mute' | 'ban'): IPunishment | undefined;
    getPunishmentID(): Promise<number>;
    updateLog(log: ILog): boolean;
    addPermissionOverride(permissionOverride: IPermissionOverride): IPermissionOverride;
    removePermissionOverride(index: number): boolean;
    getPermissionOverride(permission?: string, role_id?: string, user_id?: string): IPermissionOverride[];
    recordAsEmbed(user_id: string): APIEmbed;
    log(log: ILog, guild: Guild): any;
    punish(punishment: IPunishment): Promise<APIEmbed | undefined>;
    testPermission(permission: string | undefined, executor: GuildMember, defaultAllowed: boolean): boolean;
}
interface ServerModel extends mongoose.Model<IServer, {}, ServerMethods> {
    findOrCreateServer(discord_id: String): Promise<mongoose.HydratedDocument<IServer, ServerMethods>>;
    deleteByDiscordId(discord_id: String): Promise<mongoose.HydratedDocument<IServer, ServerMethods>>;
    inServer(discord_id: String): Promise<boolean>;
}
const serverSchema = new mongoose.Schema<IServer, ServerModel, ServerMethods>({
    discord_id: { type: String, required: true },
    punishments: { type: [punishmentSchema], default: [] },
    permission_overrides: { type: [PermissionOverrideSchema], default: [] },
    latest_log: { type: LogSchema },
    settings: { type: serverSettingsSchema, default: { mute_role: undefined } }
});

serverSchema.static('findOrCreateServer', async function (discord_id: String) {
    return await this.findOneAndUpdate({ discord_id }, { }, { upsert: true, new: true }).exec();
});
serverSchema.static('deleteByDiscordId', async function(discord_id: String) {
    return await this.findOneAndDelete({ discord_id }).exec().then((doc) => {
        if (!doc) return doc;
        Counter.findOneAndDelete({ _id: doc._id })
        return doc;
    });
});
serverSchema.method('userRecord', function(user_id: String): IPunishment[] {
    return this.punishments.filter((punishment: IPunishment) => punishment.user_id == user_id);
})
serverSchema.method('addPunishment', function(punishment: IPunishment) {
    this.punishments.push(punishment);
    this.save();
    return punishment;
});
serverSchema.method('checkExpired', function() {
    let expired = [];
    for (let punishment of this.punishments) {
        if (!punishment.expired && punishment.expires_date_unix && punishment.expires_date_unix * 1000 > Date.now()) {
            punishment.expired = true;
            expired.push(punishment);
        }
    }
    this.save();
    return expired;
});
serverSchema.method('getPunishment', function(user_id: string, type?: 'warn' | 'kick' | 'mute' | 'ban') {
    return this.punishments.reverse().filter((punishment: IPunishment) => (type ? punishment.type == type : true) && !punishment.expired && (punishment.user_id == user_id))[0];
})
serverSchema.method('getPunishmentID', async function() {
    let doc = this;
    // @ts-ignore
    return await Counter.findOneAndUpdate({ _id: doc._id }, { $inc: { seq: 1 } }, { upsert: true,  new: true }).exec().then(doc => doc.seq).catch(() => 0);
});
serverSchema.method('setMuteRole', function(mute_role_id: String) {
    this.settings.mute_role = mute_role_id;
    this.save();
    return true;
});
serverSchema.method('setLogChannel', function(log_channel_id: String) {
    this.settings.log_channel = log_channel_id;
    this.save();
    return true;
});
serverSchema.method('setJoinLeaveChannel', function(join_leave_channel_id: String) {
    this.settings.join_leave_channel = join_leave_channel_id;
    this.save();
    return true;
});
serverSchema.method('setJoinEmbed', function(join_embed: APIEmbed) {
    this.settings.join_embed = join_embed;
    this.save();
    return true;
});
serverSchema.method('setLeaveEmbed', function(leave_embed: APIEmbed) {
    this.settings.leave_embed = leave_embed;
    this.save();
    return true;
});
serverSchema.method('setJoinText', function(join_text: String) {
    this.settings.join_text = join_text;
    this.save();
    return true;
});
serverSchema.method('setLeaveText', function(leave_text: String) {
    this.settings.leave_text = leave_text;
    this.save();
    return true;
});
serverSchema.method("updateLog", function (log: ILog) {
    this.latest_log = log;
    return true;
})
serverSchema.method("addPermissionOverride", function(permissionOverride: IPermissionOverride) {
    this.permission_overrides.push(permissionOverride);
    this.save();
    return permissionOverride;
});
serverSchema.method("removePermissionOverride", function(index: number) {
    this.permission_overrides = this.permission_overrides.splice(index, 1);
    this.save();
    return true;
});
serverSchema.method("getPermissionOverride", function(permission?: string, role_id?: string, user_id?: string) {
    return this.permission_overrides.filter((override: IPermissionOverride) => {
        let split = override.permission.split('.');
        return (permission ?
            (split[split.length - 1] == '*') ? split.slice(0, split.length - 1).join('.') == permission.split('.').slice(0, split.length - 1).join('.') :
                permission == override.permission : true) &&
            ((role_id ? override.role_id == role_id : false) ||
                (user_id ? override.user_id == user_id : false));
    } );
});
serverSchema.method("recordAsEmbed", function (user_id: string) {
    let embed = Embeds.DEFAULT_EMBED.toJSON();
    let record = this.userRecord(user_id);
    embed.title = "📜 Record";
    embed.description = `This is the record for <@${user_id}>.\nWant to check more info about a punishment? Do \`/punishment view (id)\`.`
    embed.fields = [{
        name: `Punishments`,
        value: record.reduce((str: string, punishment: IPunishment) => {
            let type = PunishmentNames[punishment.type]
            return str + `\n**${type.name}** - PID: ${punishment.punishment_id} - <t:${Math.round(punishment.date_unix / 1000)}>`
        }, "\u2800")
    }];
    return embed;
})
serverSchema.method("log", async function (log: ILog, guild: Guild) {
    this.updateLog(log);
    if (!guild.available) return;
    if (!this.settings.log_channel) return false;
    let channel = guild.channels.cache.get(this.settings.log_channel);
    if (!channel || (channel.isVoiceBased() || channel.isDMBased() || channel.isThread() || !channel.isTextBased())) return false;

    let embed = Embeds.LOG_EMBED.toJSON();
    embed.title = `Log | ${LogNames[log.type]}`;
    embed.description = `${log.description}\n\n🕰️ Date: <t:${Math.round(log.date_unix / 1000)}>${log.user_id ? `\n🧍 User: <@${log.user_id}>` : ""}`;
    let fields: EmbedField[] = [];
    if (log.punishment) {
        fields.push(toEmbedField(log.punishment));
        embed.footer = {
            text: `Punishment ID: ${log.punishment.punishment_id}`
        }
    }
    if (log.mute_role) {
        fields.push({
            name: "Mute Role Data",
            value: `Formerly: ${log.mute_role.former ? `<@&${log.mute_role.former}>` : "None"}\r\n\r\nNow: <@&${log.mute_role.now}>`,
            inline: false
        })
    }
    if (log.log_channel) {
        fields.push({
            name: "Log Channel Data",
            value: `Formerly: ${log.log_channel.former ? `<#${log.log_channel.former}>` : "None"}\r\n\r\nNow: <#${log.log_channel.now}>`,
            inline: false
        })
    }
    if (log.permission_override) {
        fields.push({
            name: "Permission Override",
            value: `${log.permission_override.allowed ? "✅" : "❎"} \`${log.permission_override.permission}\` - ${log.permission_override.role_id ? `<@&${log.permission_override.role_id}>` : log.permission_override.user_id ? `<@${log.permission_override.user_id}>` : ""}`,
            inline: false
        })
    }
    if (log.message_edit) {
        fields.push({
            name: "Message Change",
            value: `Formerly: \r\n\r\n${log.message_edit.former}\r\n\r\nNow: \r\n\r\n${log.message_edit.now}\r\n\r\n`,
            inline: false
        })
    }
    embed.fields = fields;
    return await channel.send({ embeds: [embed] });
});
serverSchema.method("punish", async function (punishment: IPunishment): Promise<APIEmbed | undefined> {
    this.addPunishment(punishment);
    let embed = Embeds.PUNISHED_EMBED.toJSON();
    embed.title = PunishmentNames[punishment.type].name;
    embed.description = `User was ${PunishmentNames[punishment.type].action}.`
    embed.fields = [toEmbedField(punishment)];
    embed.footer = {
        text: `Punishment ID: ${punishment.punishment_id}`
    }
    return embed;
});
serverSchema.method("testPermission", function(permission: string | undefined, executor: GuildMember, defaultAllowed: boolean) {
    if (!permission) return true;
    if (executor.id == executor.guild.ownerId || executor.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
    let roles = executor.roles.cache.values();
    let permissionSplit = permission.split('.');
    let permissionToTest = "";
    let accessible = permissionSplit.reduce((accumulator: boolean | undefined, currentValue) => {
        if (accumulator == false) return false;
        permissionToTest = permissionToTest.length == 0 ? currentValue : permissionToTest + "." + currentValue;
        let overrides = this.getPermissionOverride(permissionToTest, undefined, executor.id);
        if (overrides.length > 0) {

            for (let override of overrides) {
                if (!override.allowed) return false;
            }
            return true;
        }
        for (let role of roles) {
            let overrideRoles = this.getPermissionOverride(permissionToTest, role.id);
            if (overrideRoles.length > 0) {
                for (let override of overrides) {
                    if (!override.allowed) return false;
                }
                return true;
            }
        }
        return accumulator;
    }, undefined);
    return accessible != undefined ? accessible : defaultAllowed;
})
const Server = mongoose.model<IServer, ServerModel>('server', serverSchema);

export default Server;