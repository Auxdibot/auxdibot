import { Auxdibot } from '@/Auxdibot';
import { APIRole, BaseInteraction, Role } from 'discord.js';
import { checkPermissionBypassRole } from './checkPermissionBypassRole';
import { servers } from '@prisma/client';

/**
 * Tests the Discord role permission for a given interaction and role by checking the server's command permissions.
 * @param auxdibot - The Auxdibot instance.
 * @param interaction - The interaction object.
 * @param role - The role to test against. Optional.
 * @returns A promise that resolves to a boolean indicating whether the role has permission or not.
 */
export async function testDiscordRolePermission(
   auxdibot: Auxdibot,
   interaction: BaseInteraction,
   server: servers,
   role?: Role | APIRole,
): Promise<boolean> {
   if (!interaction.guild) return false;
   const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => undefined);
   if (!member) return false;

   if (interaction.isChatInputCommand()) {
      const bypassCheck = await checkPermissionBypassRole(
         auxdibot,
         member,
         server,
         interaction.commandName,
         interaction.options.getSubcommandGroup(false),
         interaction.options.getSubcommand(false),
      );
      if (bypassCheck == true) return true;
   }
   return role ? interaction.guild.roles.comparePositions(role?.id, member.roles.highest) <= 0 : true;
}
