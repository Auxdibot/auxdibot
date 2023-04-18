import {GuildMember} from "discord.js";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member: GuildMember) {
        if (!member) return;
        // todo leaving
        let server = await Server.findOrCreateServer(member.guild.id);
        await server.log({
            user_id: member.id,
            description: `<@${member.id}> left the server! (Total Members: **${member.guild.memberCount}**)`,
            type: LogType.MEMBER_LEAVE,
            date_unix: Date.now()
        }, member.guild)
    }
}