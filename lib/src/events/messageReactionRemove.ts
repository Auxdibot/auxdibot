import {GuildMember, MessageReaction, User} from "discord.js";
import Server from "../mongo/model/server/Server";


module.exports = {
    name: 'messageReactionRemove',
    once: false,
    async execute(messageReaction: MessageReaction, user: User) {
        if (user.id == messageReaction.client.user.id) return;
        if (!messageReaction.message.guild) return;
        let server = await Server.findOrCreateServer(messageReaction.message.guild.id);
        let data = await server.fetchData(), settings = await server.fetchSettings();
        let member: GuildMember | null = messageReaction.message.guild.members.resolve(user.id);
        if (!member || !messageReaction.message.guild) return;
        let suggestion = data.suggestions.find((suggestion) => suggestion.message_id == messageReaction.message.id);
        if (suggestion) {
            let findReaction = settings.suggestions_reactions.find((reaction) => reaction.emoji == messageReaction.emoji.toString());
            if (findReaction) {
                suggestion.rating -= findReaction.rating;
                await data.save();
                await data.updateSuggestion(messageReaction.message.guild, suggestion);
            }
        }

    }
}