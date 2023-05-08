import * as mongoose from 'mongoose';
import ServerData, {IServerData, IServerDataMethods} from "./ServerData";
import {HydratedDocument} from "mongoose";
import ServerMember, {IServerMember, IServerMemberMethods} from "./ServerMember";
import ServerSettings , {IServerSettings, IServerSettingsMethods} from "./ServerSettings";
import ServerCounter, {IServerCounter, IServerCounterMethods} from "./ServerCounter";
import {ILog} from "../../schema/LogSchema";
import Embeds from "../../../util/constants/Embeds";
import {APIEmbed, EmbedField, GuildBasedChannel, GuildMember, PermissionsBitField} from "discord.js";
import {IPunishment, PunishmentNames, toEmbedField} from "../../schema/PunishmentSchema";
import {LogNames} from "../../../util/types/Log";
import {client} from "../../../index";
import {ISuggestion} from "../../schema/SuggestionSchema";

export interface IServer {
    _id: mongoose.ObjectId;
    discord_id: string;
    data?: mongoose.ObjectId;
    members?: mongoose.ObjectId;
    settings?: mongoose.ObjectId;
    counter?: mongoose.ObjectId;
}

export interface IServerMethods {
    fetchData(): Promise<HydratedDocument<IServerData, IServerDataMethods>>;
    fetchMembers(): Promise<HydratedDocument<IServerMember, IServerMemberMethods>>[];
    findOrCreateMember(discord_id: string): Promise<HydratedDocument<IServerMember, IServerMemberMethods>> | undefined;
    fetchSettings(): Promise<HydratedDocument<IServerSettings, IServerSettingsMethods>>;
    fetchCounter(): Promise<HydratedDocument<IServerCounter, IServerCounterMethods>>;
    log(log: ILog): Promise<APIEmbed | undefined>;
    recordAsEmbed(user_id: String): Promise<APIEmbed | undefined>;
    punish(punishment: IPunishment): Promise<APIEmbed | undefined>;
    testPermission(permission: string | undefined, executor: GuildMember, defaultAllowed: boolean): Promise<boolean>;
    addSuggestion(suggestion: ISuggestion): ISuggestion;
}
export interface IServerModel extends mongoose.Model<IServer, {}, IServerMethods> {
    findOrCreateServer(discord_id: String): Promise<mongoose.HydratedDocument<IServer, IServerMethods>>;
    deleteByDiscordId(discord_id: String): Promise<mongoose.HydratedDocument<IServer, IServerMethods>>;
}
export const ServerSchema = new mongoose.Schema<IServer, IServerModel>({
    discord_id: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "server_member" }],
    data: { type: mongoose.Schema.Types.ObjectId, ref: "server_data" },
    settings: { type: mongoose.Schema.Types.ObjectId, ref: "server_settings" },
    counter: { type: mongoose.Schema.Types.ObjectId, ref: "server_counter" }
});
ServerSchema.static('findOrCreateServer', async function (discord_id: String) {
    return await this.findOneAndUpdate({ discord_id }, { }, { upsert: true, new: true }).exec();
});
ServerSchema.static('deleteByDiscordId', async function(discord_id: String) {
    return await this.findOneAndDelete({ discord_id }).exec().then((doc) => {
        if (!doc) return doc;
        ServerCounter.deleteMany({ server_id: doc._id }).exec().catch(() => undefined);
        ServerMember.deleteMany({ server_id: doc._id }).exec().catch(() => undefined);
        ServerSettings.deleteMany({ server_id: doc._id }).exec().catch(() => undefined);
        ServerData.deleteMany({ server_id: doc._id }).exec().catch(() => undefined);
        return doc;
    });
});
ServerSchema.method("fetchData", async function() {
    let data = await this.populate('data').then((doc: any) => doc.data).catch(() => undefined);
    if (!data) {
        data = await ServerData.findOneAndUpdate({ server_id: this._id }, {}, {upsert: true, new: true }).catch(() => undefined);
        if (!data) return;
        await data.save();
        this.data = data._id;
    }
    return data;
})
ServerSchema.method("fetchSettings", async function() {
    let settings = await this.populate('settings').then((doc: any) => doc.settings).catch(() => undefined);
    if (!settings) {
        settings = await ServerSettings.findOneAndUpdate({ server_id: this._id }, {}, {upsert: true, new: true }).catch(() => undefined);
        if (!settings) return undefined;
        await settings.save();
        this.settings = settings._id;
        await this.save();
    }
    return settings;
});
ServerSchema.method("fetchMembers", async function() {
    return await this.populate('members').then((doc: any) => doc.members).catch(() => undefined);
});
ServerSchema.method("findOrCreateMember", async function(discord_id: string) {
    let members = await this.populate('members').then((doc: any) => doc.members).catch(() => undefined);
    if (members) {
        for (let member of members) {
            if (member.discord_id == discord_id) return member;
        }
        let member = await ServerMember.findOneAndUpdate({
            discord_id: discord_id,
            server_id: this._id
        }, {}, { upsert: true, new: true }).catch(() => undefined);
        if (!member) return undefined;
        return member.save().then(() => {
            if (!member) return undefined;
            this.members.push(member._id);
            this.save();
            return member;
        }).catch(() => undefined);
    }
    return undefined;
})
ServerSchema.method("fetchCounter", async function() {
    let counter = await this.populate('counter').then((doc: any) => doc.counter).catch(() => undefined);
    if (!counter) {
        counter = await ServerCounter.findOneAndUpdate({ server_id: this._id }, {}, {upsert: true, new: true }).catch(() => undefined);
        if (!counter) return undefined;
        await counter.save();
        this.counter = counter._id;
        await this.save();
    }
    return counter;
});
ServerSchema.method("log", async function (log: ILog, use_user_thumbnail?: boolean) {
    let settings = await this.fetchSettings(), data = await this.fetchData();
    let guild = await (await client).guilds.fetch(this.discord_id).catch(() => undefined);
    data.updateLog(log);
    if (!guild || !guild.available || !settings.log_channel) return undefined;
    let channel: GuildBasedChannel | undefined = guild.channels.cache.get(settings.log_channel);
    if (!channel || !channel.isTextBased()) return undefined;
    let embed = Embeds.LOG_EMBED.toJSON();
    embed.title = `Log | ${LogNames[log.type]}`;
    embed.description = `${log.description}\n\n🕰️ Date: <t:${Math.round(log.date_unix / 1000)}>${log.user_id ? `\n🧍 User: <@${log.user_id}>` : ""}`;
    embed.fields = [(log.punishment ? toEmbedField(log.punishment) : undefined), 
        (log.mute_role ? {
            name: "Mute Role Change",
            value: `Formerly: ${log.mute_role.former ? `<@&${log.mute_role.former}>` : "None"}\r\n\r\nNow: <@&${log.mute_role.now}>`,
            inline: false
        } : undefined),
        (log.channel ? {
            name: "Channel Change",
            value: `Formerly: ${log.channel.former ? `<#${log.channel.former}>` : "None"}\r\n\r\nNow: ${log.channel.now ? `<#${log.channel.now}>` : "None"}`,
            inline: false
        } : undefined),
        (log.permission_override ? {
            name: "Permission Override",
            value: `${log.permission_override.allowed ? "✅" : "❎"} \`${log.permission_override.permission}\` - ${log.permission_override.role_id ? `<@&${log.permission_override.role_id}>` : log.permission_override.user_id ? `<@${log.permission_override.user_id}>` : ""}`,
            inline: false
        } : undefined),
        (log.message_edit ? {
            name: "Message Change",
            value: `Formerly: \r\n\r\n${log.message_edit.former}\r\n\r\nNow: \r\n\r\n${log.message_edit.now}\r\n\r\n`,
            inline: false
        } : undefined)
    ].filter((i) => i) as EmbedField[];
    if (log.punishment) {
        embed.footer = {
            text: `Punishment ID: ${log.punishment.punishment_id}`
        }
    }
    return await channel.send({ embeds: [embed] }).then(() => embed).catch(() => undefined);
});
ServerSchema.method("recordAsEmbed", async function (user_id: string) {
    let embed = Embeds.DEFAULT_EMBED.toJSON();
    let record = (await this.fetchData()).userRecord(user_id);
    embed.title = "📜 Record";
    embed.description = `This is the record for <@${user_id}>.\nWant to check more info about a punishment? Do \`/punishment view (id)\`.`
    embed.fields = [{
        name: `Punishments`,
        value: record.reduce((str: string, punishment: IPunishment) => {
            let type = PunishmentNames[punishment.type];
            return str + `\n**${type.name}** - PID: ${punishment.punishment_id} - <t:${Math.round(punishment.date_unix / 1000)}>`
        }, "\u2800")
    }];
    return embed;
});
ServerSchema.method("punish", async function (punishment: IPunishment): Promise<APIEmbed | undefined> {
    (await this.fetchData()).addPunishment(punishment);
    let embed = Embeds.PUNISHED_EMBED.toJSON();
    embed.title = PunishmentNames[punishment.type].name;
    embed.description = `User was ${PunishmentNames[punishment.type].action}.`
    embed.fields = [toEmbedField(punishment)];
    embed.footer = {
        text: `Punishment ID: ${punishment.punishment_id}`
    }
    return embed;
});
ServerSchema.method("testPermission", async function(permission: string | undefined, executor: GuildMember, defaultAllowed: boolean) {
    if (!permission) return true;
    let data = await this.fetchData();
    if (executor.id == executor.guild.ownerId || executor.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
    let roles = executor.roles.cache.values();
    let permissionSplit = permission.split('.');
    let permissionToTest = "";
    let accessible = permissionSplit.reduce((accumulator: boolean | undefined, currentValue) => {
        if (accumulator == false) return false;
        permissionToTest = permissionToTest.length == 0 ? currentValue : permissionToTest + "." + currentValue;
        let overrides = data.getPermissionOverride(permissionToTest, undefined, executor.id);
        if (overrides.length > 0) {

            for (let override of overrides) {
                if (!override.allowed) return false;
            }
            return true;
        }
        for (let role of roles) {
            let overrideRoles = data.getPermissionOverride(permissionToTest, role.id);
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
});
ServerSchema.method("addSuggestion", async function (suggestion: ISuggestion) {
    let data: HydratedDocument<IServerData, IServerDataMethods> = await this.fetchData();
    // todo log

    data.suggestions.push(suggestion);
    await data.save();
})
const Server = mongoose.model<IServer, IServerModel>("server", ServerSchema);
export default Server;