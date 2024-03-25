import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildMember, PermissionsBitField } from 'discord.js';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { findCommand } from '@/modules/features/commands/findCommand';
import { CommandPermission } from '@prisma/client';

export async function testLegacyPermission(
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
   const permissionSplit = permission.split('.');
   let permissionToTest = '';
   const accessible = permissionSplit.reduce((accumulator: boolean | undefined, currentValue) => {
      if (accumulator == false) return false;
      permissionToTest = permissionToTest.length == 0 ? currentValue : permissionToTest + '.' + currentValue;
      const roles = executor.roles.cache.values();
      const userOverrides = data.permission_overrides.filter(
         (po) => po.permission == permissionToTest && po.userID == executor.id,
      );

      if (userOverrides.length > 0) {
         for (const override of userOverrides) {
            if (!override.allowed) return false;
         }
         return true;
      }
      for (const role of roles) {
         const overrideRoles = data.permission_overrides.filter(
            (po) => po.permission == permissionToTest && po.roleID == role.id,
         );
         if (overrideRoles.length > 0) {
            for (const override of overrideRoles) {
               if (!override.allowed) return false;
            }
            return true;
         }
      }
      return accumulator;
   }, undefined);
   return accessible != undefined ? accessible : defaultAllowed;
}
export function testPermission(
   permission: CommandPermission,
   interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>,
) {
   const server = interaction.data?.guildData,
      member = interaction.data?.member;
   if (!server || !member) return 'disabled';
   if (permission.admin_only && !member.permissions.has(PermissionsBitField.Flags.Administrator)) return 'noperm';
   if (permission.blacklist_channels.includes(interaction.channel.id)) return 'noperm';
   if (permission.channels.length > 0 && !permission.channels.includes(interaction.channel.id)) return 'noperm';
   if (member.roles.cache.find((i) => permission.blacklist_roles.includes(i.id))) return 'noperm';
   if (permission.roles.length > 0 && !member.roles.cache.find((i) => permission.roles.includes(i.id))) return 'noperm';
   if (permission.disabled) return 'disabled';
   return true;
}
export async function testCommandPermission(
   auxdibot: Auxdibot,
   interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>,
   command: string,
   subcommand?: string[],
) {
   const server = interaction.data?.guildData,
      member = interaction.data?.member;
   if (!server || !member) return false;
   if (member.id == member.guild.ownerId || member.permissions.has(PermissionsBitField.Flags.Administrator))
      return true;
   const data = findCommand(auxdibot, command, subcommand);

   if (!data) return 'notfound';
   const { commandData, subcommandData } = data;
   console.log(subcommand);
   console.log(subcommand.length);
   // TODO: make it accept permissions from the command, group and subcommand. prioritize subcommand first.
   const permission = server.command_permissions.filter((cp) => cp.command == command),
      commandPermission = permission.find((i) => !i.subcommand && !i.group),
      groupPermission = permission.find(
         (i) => i.group == (subcommand.length > 1 ? subcommand[0] : undefined) && !i.subcommand,
      ),
      subcommandPermission = permission.find(
         (i) =>
            i.group == (subcommand.length > 1 ? subcommand[0] : undefined) &&
            i.group == (subcommand.length > 1 ? subcommand[1] : subcommand[0]),
      );

   const allowedDefault = subcommandData ? subcommandData.info.allowedDefault : commandData.info.allowedDefault;
   if (!commandPermission && !groupPermission && !subcommandPermission) return allowedDefault ? true : 'noperm';
   let result: string | boolean = true;
   const commandTest = commandPermission ? testPermission(commandPermission, interaction) : null,
      groupTest = groupPermission ? testPermission(groupPermission, interaction) : null,
      subcommandTest = subcommandPermission ? testPermission(subcommandPermission, interaction) : null;
   if (subcommandTest !== true && subcommandTest !== null) {
      result = subcommandTest;
   }
   if (groupTest !== true && groupTest !== null) {
      result = groupTest;
   }
   if (commandTest !== true && commandTest !== null) {
      result = commandTest;
   }
   return result;
}
