import { Auxdibot } from '@/interfaces/Auxdibot';
import { findCommand } from '@/modules/features/commands/findCommand';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { BaseInteraction, ForumChannel, GuildTextBasedChannel } from 'discord.js';

export default async function testDiscordPermission(
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
      const commandPermission = data.command_permissions.find(
         (cp) =>
            cp.command == interaction.commandName &&
            (commandData.subcommandData
               ? cp.subcommand == commandData.subcommandData.name && cp.group == commandData.subcommandData.group
               : !cp.subcommand && !cp.group),
      );
      if (member.roles.cache.find((i) => commandPermission?.permission_bypass_roles.includes(i.id))) return true;
   }
   return channel ? channel.permissionsFor(member).has(permission) : member.permissions.has(permission);
}
