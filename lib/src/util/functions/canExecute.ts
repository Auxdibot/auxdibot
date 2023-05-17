import { ActivityType, APIEmbed, APIInteractionGuildMember, Guild, GuildMember } from 'discord.js';

export default function canExecute(guild: Guild, executor: GuildMember, member: GuildMember) {
   if (executor.id == guild.ownerId) return true;
   if (member.id == guild.ownerId) return false;
   return guild.roles.comparePositions(executor.roles.highest, member.roles.highest) > 0;
}
