import {
    ActivityType,
    APIEmbed,
    APIInteractionGuildMember,
    Guild,
    GuildMember, Message, TextChannel
} from "discord.js";
export const canExecute = async (guild: Guild, executor: GuildMember, member: GuildMember ) => {
    if (executor.id == guild.ownerId) return true;
    if (member.id == guild.ownerId) return false;
    return guild.roles.comparePositions(executor.roles.highest, member.roles.highest) > 0;
}
export const getMessage = async (guild: Guild, message_id: string) => await guild.channels.cache.reduce(async (accumulator: Promise<Message<boolean> | undefined>, channel) => {
    if (channel.isTextBased()) {
        return Promise.resolve((channel as TextChannel).messages.fetch(message_id).then((message) => message).catch(() => accumulator));
    }
    return accumulator;
}, Promise.resolve(undefined))