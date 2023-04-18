import {GuildMember} from "discord.js";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member: GuildMember) {
        if (!member) return;
        // todo welcome
        let server = await Server.findOrCreateServer(member.guild.id);
        await server.log({
            user_id: member.id,
            description: `<@${member.id}> joined the server! (Total Members: **${member.guild.memberCount}**)`,
            type: LogType.MEMBER_JOIN,
            date_unix: Date.now()
        }, member.guild)
    }
}