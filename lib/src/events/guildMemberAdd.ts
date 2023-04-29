import {APIEmbed, GuildMember, TextChannel} from "discord.js";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";
import parsePlaceholders from "../util/functions/parsePlaceholder";

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member: GuildMember) {
        if (!member) return;
        let server = await Server.findOrCreateServer(member.guild.id);
        if (server.settings.join_leave_channel) {
            member.guild.channels.fetch(server.settings.join_leave_channel).then(async (channel) => {
                if (channel && channel.isTextBased()) {
                    if (server.settings.join_embed || server.settings.join_text) {
                        await (channel as TextChannel).send({
                            content: `${server.settings.join_text || ""}`,
                            embeds: server.settings.join_embed ? [JSON.parse(await parsePlaceholders(JSON.stringify(server.settings.join_embed), member.guild, member as GuildMember | undefined)) as APIEmbed] : []
                        }).catch((x) => console.error(x));
                    }
                }
            });
        }
        if (server.settings.join_dm_embed || server.settings.join_dm_text) {
            await member.send({
                content: `${server.settings.join_dm_text || ""}`,
                embeds: server.settings.join_dm_embed ? [JSON.parse(await parsePlaceholders(JSON.stringify(server.settings.join_dm_embed), member.guild, member)) as APIEmbed] : []
            }).catch(() => undefined)
        }
        if (server.settings.join_roles.length > 0) {
                server.settings.join_roles.forEach((role) => member.roles.add(role).catch(() => undefined));
        }
        let memberData = await server.createOrFindMemberData(member);
        if (memberData) {
            await memberData.joinServer(member, server);
        }
        await server.save();
        await server.log({
            user_id: member.id,
            description: `<@${member.id}> joined the server! (Total Members: **${member.guild.memberCount}**)`,
            type: LogType.MEMBER_JOIN,
            date_unix: Date.now()
        }, member.guild)
    }
}