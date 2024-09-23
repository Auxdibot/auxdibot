import { Role } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
export default async function roleDelete(auxdibot: Auxdibot, role: Role) {
   const server = await findOrCreateServer(auxdibot, role.guild.id);

   await auxdibot.database.servers.update({
      where: { serverID: role.guild.id },
      data: {
         level_rewards: server.level_rewards.filter((i) => i.roleID != role.id),
         automod_role_exceptions: server.automod_role_exceptions.filter((i) => i != role.id),
         join_roles: server.join_roles.filter((i) => i != role.id),
         sticky_roles: server.sticky_roles.filter((i) => i != role.id),
         report_role: server.report_role == role.id ? null : undefined,
         mute_role: server.mute_role == role.id ? null : undefined,
         role_multipliers: server.role_multipliers.filter((i) => i.id != role.id),
         command_permissions: server.command_permissions.map((i) => ({
            ...i,
            blacklist_roles: i.blacklist_roles.filter((j) => j != role.id),
            roles: i.roles.filter((j) => j != role.id),
            permission_bypass_roles: i.permission_bypass_roles.filter((j) => j != role.id),
         })),
      },
   });
   return;
}
