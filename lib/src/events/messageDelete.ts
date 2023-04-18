import {Message} from "discord.js";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message: Message) {
        let sender = message.member;
        if (!sender || !message.guild) return;
        let server = await Server.findOrCreateServer(message.guild.id);
        await server.log({
            type: LogType.MESSAGE_DELETED,
            date_unix: Date.now(),
            description: `A message by ${sender.user.tag} was deleted.`,
            message_edit: { former: message.cleanContent, now: "[deleted]" },
            user_id: sender.id
        }, message.guild)
    }
}