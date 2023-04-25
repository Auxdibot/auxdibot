import {Role} from "discord.js";
import Server from "../mongo/model/Server";

module.exports = {
    name: 'roleDelete',
    once: false,
    async execute(role: Role) {
        let server = await Server.findOrCreateServer(role.guild.id);
        let permissionOverride = server.permission_overrides.find((override) => override.role_id == role.id);
        if (permissionOverride) server.removePermissionOverride(server.permission_overrides.indexOf(permissionOverride));
    }
}