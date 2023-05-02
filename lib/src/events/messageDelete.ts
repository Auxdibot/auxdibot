import {Message} from "discord.js";
import Server from "../mongo/model/server/Server";
import {LogType} from "../util/types/Log";
import {IReactionRole} from "../mongo/schema/ReactionRoleSchema";

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message: Message) {
        let sender = message.member;
        if (!sender || !message.guild) return;
        let server = await Server.findOrCreateServer(message.guild.id);
        let data = await server.fetchData();
        let rr = data.reaction_roles.find((rr: IReactionRole) => rr.message_id == message.id);
        if (rr) {
            data.removeReactionRole(data.reaction_roles.indexOf(rr));
            await server.log({
                user_id: sender.id,
                description: `Deleted a reaction role${message ? ` in ${message.channel || "a channel"}` : ""}.`,
                type: LogType.REACTION_ROLE_REMOVED,
                date_unix: Date.now()
            })
        }
        await server.log({
            type: LogType.MESSAGE_DELETED,
            date_unix: Date.now(),
            description: `A message by ${sender.user.tag} was deleted.`,
            message_edit: { former: message.cleanContent, now: "[deleted]" },
            user_id: sender.id
        })
    }
}