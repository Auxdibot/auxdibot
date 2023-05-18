import { Role } from 'discord.js';
import Server from '@models/server/Server';
import { IPermissionOverride } from '@schemas/PermissionOverrideSchema';
import { IServerData, IServerDataMethods } from '@models/server/ServerData';
import { HydratedDocument } from 'mongoose';

module.exports = {
   name: 'roleDelete',
   once: false,
   async execute(role: Role) {
      const server = await Server.findOrCreateServer(role.guild.id);
      const data: HydratedDocument<IServerData, IServerDataMethods> = await server.fetchData();
      const permissionOverride = data.permission_overrides.find(
         (override: IPermissionOverride) => override.role_id == role.id,
      );
      if (permissionOverride) {
         data.permission_overrides.splice(data.permission_overrides.indexOf(permissionOverride));
         await data.save();
      }
   },
};
