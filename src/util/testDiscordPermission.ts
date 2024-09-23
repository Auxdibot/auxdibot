import { Auxdibot } from '@/Auxdibot';
import { findCommand } from '@/modules/features/commands/findCommand';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { BaseInteraction, ForumChannel, GuildTextBasedChannel } from 'discord.js';

/**
 * Tests whether a user has a specific Discord permission in a given channel.
 * @param auxdibot - The Auxdibot instance.
 * @param interaction - The interaction object representing the user's interaction with the bot.
 * @param permission - The permission to check for.
 * @param channel - Optional. The channel to check the permission in. If not provided, the guild's default channel will be used.
 * @returns A boolean indicating whether the user has the specified permission.
 */
export async function testDiscordPermission(
   auxdibot: Auxdibot,
   interaction: BaseInteraction,
   permission: bigint,
   channel?: ForumChannel | GuildTextBasedChannel,
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
   return channel ? channel.permissionsFor(member).has(permission) : member.permissions.has(permission);
}
