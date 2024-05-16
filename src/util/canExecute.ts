import { Guild, GuildMember } from 'discord.js';

/**
 * Checks if a guild member can execute a command on another guild member.
 * @param guild - The guild where the command is being executed.
 * @param executor - The guild member who is executing the command.
 * @param member - The guild member on whom the command is being executed.
 * @returns A boolean indicating whether the executor can execute the command on the member.
 */
export default function canExecute(guild: Guild, executor: GuildMember, member: GuildMember) {
   if (executor.id == guild.ownerId) return true;
   if (member.id == guild.ownerId) return false;
   return guild.roles.comparePositions(executor.roles.highest, member.roles.highest) > 0;
}
