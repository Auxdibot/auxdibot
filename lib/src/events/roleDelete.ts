import {Role} from "discord.js";
import Server from "../mongo/model/server/Server";
import {IPermissionOverride} from "../mongo/schema/PermissionOverrideSchema";
import {IServerData, IServerDataMethods} from "../mongo/model/server/ServerData";
import {HydratedDocument} from "mongoose";


module.exports = {
    name: 'roleDelete',
    once: false,
    async execute(role: Role) {
        let server = await Server.findOrCreateServer(role.guild.id);
        let data: HydratedDocument<IServerData, IServerDataMethods> = await server.fetchData();
        let permissionOverride = data.permission_overrides.find((override: IPermissionOverride) => override.role_id == role.id);
        if (permissionOverride) data.removePermissionOverride(data.permission_overrides.indexOf(permissionOverride));
    }
}