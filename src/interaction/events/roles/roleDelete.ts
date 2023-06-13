import { Role } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function roleDelete(auxdibot: Auxdibot, role: Role) {
   const server = await findOrCreateServer(auxdibot, role.guild.id);
   const permissionOverride = server.permission_overrides.find((override) => override.roleID == role.id);
   if (permissionOverride) {
      server.permission_overrides.splice(server.permission_overrides.indexOf(permissionOverride));
      await auxdibot.database.servers
         .update({
            where: { serverID: role.guild.id },
            data: { permission_overrides: server.permission_overrides },
         })
         .catch(() => undefined);
   }
}
