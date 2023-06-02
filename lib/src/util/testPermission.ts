import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildMember, PermissionsBitField } from 'discord.js';

export default async function testPermission(
   auxdibot: Auxdibot,
   serverID: string,
   permission: string | undefined,
   executor: GuildMember,
   defaultAllowed: boolean,
) {
   if (!permission) return true;
   const data = await findOrCreateServer(auxdibot, serverID);
   if (executor.id == executor.guild.ownerId || executor.permissions.has(PermissionsBitField.Flags.Administrator))
      return true;
   const roles = executor.roles.cache.values();
   const permissionSplit = permission.split('.');
   let permissionToTest = '';
   const accessible = permissionSplit.reduce((accumulator: boolean | undefined, currentValue) => {
      if (accumulator == false) return false;
      permissionToTest = permissionToTest.length == 0 ? currentValue : permissionToTest + '.' + currentValue;
      const overrides = data.permission_overrides.filter(
         (po) => po.permission == permissionToTest && po.userID == executor.id,
      );
      if (overrides.length > 0) {
         for (const override of overrides) {
            if (!override.allowed) return false;
         }
         return true;
      }
      for (const role of roles) {
         const overrideRoles = data.permission_overrides.filter(
            (po) => po.permission == permissionToTest && po.roleID == role.id,
         );
         if (overrideRoles.length > 0) {
            for (const override of overrides) {
               if (!override.allowed) return false;
            }
            return true;
         }
      }
      return accumulator;
   }, undefined);
   return accessible != undefined ? accessible : defaultAllowed;
}
