import {GuildMember, MessageReaction, User} from "discord.js";
import Server from "../mongo/model/Server";


module.exports = {
    name: 'messageReactionAdd',
    once: false,
    async execute(messageReaction: MessageReaction, user: User) {
        if (user.id == messageReaction.client.user.id) return;
        if (!messageReaction.message.guild) return;
        let server = await Server.findOrCreateServer(messageReaction.message.guild.id);
        let member: GuildMember | null = messageReaction.message.guild.members.resolve(user.id);
        if (!member) return;
        let rrData = server.reaction_roles.find((rr) => messageReaction.message.id == rr.message_id);
        if (rrData) {
            let rr = rrData.reactions.find((react) => react.emoji == messageReaction.emoji.toString());
            if (rr) {
                await messageReaction.users.remove(user.id);
                if (member.roles.resolve(rr.role)) {
                    await member.roles.remove(rr.role).catch(() => undefined);
                } else {
                    await member.roles.add(rr.role).catch(() => undefined);
                }
            }
        }

    }
}