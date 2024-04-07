import { Auxdibot } from '@/interfaces/Auxdibot';
import { findCommand } from '@/modules/features/commands/findCommand';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { APIRole, BaseInteraction, Role } from 'discord.js';

export async function testDiscordRolePermission(
   auxdibot: Auxdibot,
   interaction: BaseInteraction,
   role?: Role | APIRole,
): Promise<boolean> {
   if (!interaction.guild) return false;
   const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => undefined);
   if (!member) return false;
   const data = await findOrCreateServer(auxdibot, interaction.guild.id);
   if (interaction.isChatInputCommand()) {
      const commandData = findCommand(
         auxdibot,
         interaction.commandName,
         [interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)].filter((i) => i),
      );
      if (!commandData) return false;
      const permission = data.command_permissions.filter((cp) => cp.command == interaction.commandName),
         commandPermission = permission.find((i) => !i.subcommand && !i.group),
         groupPermission = permission.find(
            (i) => i.group == interaction.options.getSubcommandGroup(false) && !i.subcommand,
         ),
         subcommandPermission = permission.find(
            (i) =>
               i.group == interaction.options.getSubcommandGroup(false) &&
               i.subcommand == interaction.options.getSubcommand(false),
         );
      if (
         member.roles.cache.find(
            (i) =>
               commandPermission?.permission_bypass_roles.includes(i.id) ||
               groupPermission?.permission_bypass_roles.includes(i.id) ||
               subcommandPermission?.permission_bypass_roles.includes(i.id),
         )
      )
         return true;
   }
   return role ? interaction.guild.roles.comparePositions(role?.id, member.roles.highest) <= 0 : true;
}
