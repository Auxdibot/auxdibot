import {Message} from "discord.js";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";

module.exports = {
    name: 'messageUpdate',
    once: false,
    async execute(oldMessage: Message, newMessage: Message) {
        let sender = newMessage.member;
        if (!sender || !newMessage.guild) return;
        let server = await Server.findOrCreateServer(newMessage.guild.id);
        if (newMessage.member && newMessage.member.user.id == "776496457867591711") return;
        return await server.log({
            type: LogType.MESSAGE_EDITED,
            date_unix: Date.now(),
            description: `A message by ${sender.user.tag} was edited.`,
            message_edit: { former: oldMessage.cleanContent, now: newMessage.cleanContent },
            user_id: sender.id
        }, newMessage.guild);
    }
}