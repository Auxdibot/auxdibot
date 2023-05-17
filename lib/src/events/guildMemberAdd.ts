import { APIEmbed, GuildMember, TextChannel } from 'discord.js';
import Server from '../mongo/model/server/Server';
import parsePlaceholders from '../util/functions/parsePlaceholder';
import { LogType } from '../util/types/Log';

module.exports = {
   name: 'guildMemberAdd',
   once: false,
   async execute(member: GuildMember) {
      if (!member) return;
      const server = await Server.findOrCreateServer(member.guild.id);
      const settings = await server.fetchSettings();
      if (settings.join_leave_channel) {
         member.guild.channels.fetch(settings.join_leave_channel).then(async (channel) => {
            if (channel && channel.isTextBased()) {
               if (settings.join_embed || settings.join_text) {
                  await (channel as TextChannel)
                     .send({
                        content: `${settings.join_text || ''}`,
                        ...(Object.entries(settings.join_embed || {}).length != 0
                           ? {
                                embeds: [
                                   JSON.parse(
                                      await parsePlaceholders(
                                         JSON.stringify(settings.join_embed),
                                         member.guild,
                                         member,
                                      ),
                                   ) as APIEmbed,
                                ],
                             }
                           : {}),
                     })
                     .catch((x) => console.error(x));
               }
            }
         });
      }
      if (settings.join_dm_embed || settings.join_dm_text) {
         await member
            .send({
               content: `${settings.join_dm_text || ''}`,
               ...(Object.entries(settings.join_dm_embed || {}).length != 0
                  ? {
                       embeds: [
                          JSON.parse(
                             await parsePlaceholders(JSON.stringify(settings.join_dm_embed), member.guild, member),
                          ) as APIEmbed,
                       ],
                    }
                  : {}),
            })
            .catch(() => undefined);
      }
      if (settings.join_roles.length > 0) {
         settings.join_roles.forEach((role: string) => member.roles.add(role).catch(() => undefined));
      }
      const memberData = await server.findOrCreateMember(member.id);
      if (memberData) {
         await memberData.joinServer(member);
      }
      await server.log(
         {
            user_id: member.id,
            description: `<@${member.id}> joined the server! (Total Members: **${member.guild.memberCount}**)`,
            type: LogType.MEMBER_JOIN,
            date_unix: Date.now(),
         },
         true,
      );
   },
};
