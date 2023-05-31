import { Role } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import { IPermissionOverride } from '@/mongo/schema/PermissionOverrideSchema';
import { IServerData, IServerDataMethods } from '@/mongo/model/server/ServerData';
import { HydratedDocument } from 'mongoose';

export default async function roleDelete(role: Role) {
   const server = await Server.findOrCreateServer(role.guild.id);
   const data: HydratedDocument<IServerData, IServerDataMethods> = await server.fetchData();
   const permissionOverride = data.permission_overrides.find(
      (override: IPermissionOverride) => override.role_id == role.id,
   );
   if (permissionOverride) {
      data.permission_overrides.splice(data.permission_overrides.indexOf(permissionOverride));
      await data.save({ validateModifiedOnly: true });
   }
}
