import {APIEmbed, GuildMember, TextChannel} from "discord.js";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";
import parsePlaceholders from "../util/functions/parsePlaceholder";

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member: GuildMember) {
        if (!member) return;
        let server = await Server.findOrCreateServer(member.guild.id);
        if (server.settings.join_leave_channel) {
            member.guild.channels.fetch(server.settings.join_leave_channel).then(async (channel) => {
                if (channel && channel.isTextBased()) {
                    await (channel as TextChannel).send({
                        content: `${server.settings.leave_text || ""}`,
                        embeds: server.settings.leave_embed ? [JSON.parse(await parsePlaceholders(JSON.stringify(server.settings.leave_embed), member.guild, member as GuildMember | undefined)) as APIEmbed] : []
                    }).catch((x) => console.error(x));
                }
            });
        }
        let memberData = await server.createOrFindMemberData(member);
        if (memberData) {
            memberData.leaveServer(member, server);
        }
        await server.log({
            user_id: member.id,
            description: `<@${member.id}> left the server! (Total Members: **${member.guild.memberCount}**)`,
            type: LogType.MEMBER_LEAVE,
            date_unix: Date.now()
        }, member.guild)
    }
}