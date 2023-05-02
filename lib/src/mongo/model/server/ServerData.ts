import LogSchema, {ILog} from "../../schema/LogSchema";
import punishmentSchema, {IPunishment} from "../../schema/PunishmentSchema";
import PermissionOverrideSchema, {IPermissionOverride} from "../../schema/PermissionOverrideSchema";
import ReactionRoleSchema, {IReactionRole} from "../../schema/ReactionRoleSchema";

import mongoose from "mongoose";

export interface IServerData {
    server_id: mongoose.ObjectId;
    latest_log: ILog;
    punishments: IPunishment[];
    permission_overrides: IPermissionOverride[];
    reaction_roles: IReactionRole[];
}
export interface IServerDataMethods {
    updateLog(log: ILog): boolean;
    userRecord(user_id: String): IPunishment[];
    checkExpired(): IPunishment[];
    addPunishment(punishment: IPunishment): IPunishment;
    getPunishment(user_id: String, type?: 'warn' | 'kick' | 'mute' | 'ban'): IPunishment | undefined;
    addPermissionOverride(permissionOverride: IPermissionOverride): IPermissionOverride;
    removePermissionOverride(index: number): boolean;
    getPermissionOverride(permission?: string, role_id?: string, user_id?: string): IPermissionOverride[];
    addReactionRole(reaction_role: IReactionRole): boolean;
    removeReactionRole(index: number): boolean;
}
export interface IServerDataModel extends mongoose.Model<IServerData, {}, IServerDataMethods> {

}

export const ServerDataSchema = new mongoose.Schema<IServerData, IServerDataModel>({
    punishments: { type: [punishmentSchema], default: [] },
    permission_overrides: { type: [PermissionOverrideSchema], default: [] },
    latest_log: { type: LogSchema },
    reaction_roles: { type: [ReactionRoleSchema], default: [] },
    server_id: { type: mongoose.Schema.Types.ObjectId, ref: "server", required: true }
});
ServerDataSchema.method("updateLog", function (log: ILog) {
    this.latest_log = log;
    return true;
})
ServerDataSchema.method('getPunishment', function(user_id: string, type?: 'warn' | 'kick' | 'mute' | 'ban') {
    return this.punishments.reverse().filter((punishment: IPunishment) => (type ? punishment.type == type : true) && !punishment.expired && (punishment.user_id == user_id))[0];
})
ServerDataSchema.method('addPunishment', function(punishment: IPunishment) {
    this.punishments.push(punishment);
    this.save();
    return punishment;
});
ServerDataSchema.method('userRecord', function(user_id: String): IPunishment[] {
    return this.punishments.filter((punishment: IPunishment) => punishment.user_id == user_id);
})
ServerDataSchema.method('checkExpired', function() {
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
ServerDataSchema.method("addPermissionOverride", function(permissionOverride: IPermissionOverride) {
    this.permission_overrides.push(permissionOverride);
    this.save();
    return permissionOverride;
});
ServerDataSchema.method("removePermissionOverride", function(index: number) {
    this.permission_overrides.splice(index, 1);
    this.save();
    return true;
});
ServerDataSchema.method("addReactionRole", function(reaction_role: IReactionRole) {
    this.reaction_roles.push(reaction_role);
    this.save();
    return true;
});
ServerDataSchema.method("removeReactionRole", function(index: number) {
    this.reaction_roles.splice(index, 1);
    this.save();
    return true;
});
ServerDataSchema.method("getPermissionOverride", function(permission?: string, role_id?: string, user_id?: string) {
    return this.permission_overrides.filter((override: IPermissionOverride) => {
        let split = override.permission.split('.');
        return (permission ?
                (split[split.length - 1] == '*') ? split.slice(0, split.length - 1).join('.') == permission.split('.').slice(0, split.length - 1).join('.') :
                    permission == override.permission : true) &&
            ((role_id ? override.role_id == role_id : false) ||
                (user_id ? override.user_id == user_id : false));
    } );
});
const ServerData = mongoose.model<IServerData, IServerDataModel>("server_data", ServerDataSchema);
export default ServerData;

