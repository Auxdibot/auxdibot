import { APIEmbed, GuildMember, TextChannel } from 'discord.js';
import Server from '@models/server/Server';
import parsePlaceholders from '@util/functions/parsePlaceholder';
import { LogType } from '@util/types/Log';

module.exports = {
   name: 'guildMemberRemove',
   once: false,
   async execute(member: GuildMember) {
      if (!member) return;
      const server = await Server.findOrCreateServer(member.guild.id);
      const settings = await server.fetchSettings();
      if (settings.join_leave_channel) {
         member.guild.channels.fetch(settings.join_leave_channel).then(async (channel) => {
            if (channel && channel.isTextBased()) {
               if (settings.leave_text || settings.leave_embed) {
                  await (channel as TextChannel)
                     .send({
                        content: `${settings.leave_text || ''}`,
                        ...(Object.entries(settings.leave_embed || {}).length != 0
                           ? {
                                embeds: [
                                   JSON.parse(
                                      await parsePlaceholders(
                                         JSON.stringify(settings.leave_embed),
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
      const memberData = await server.findOrCreateMember(member.id);
      if (memberData) {
         await memberData.leaveServer(member);
      }
      await server.log(
         {
            user_id: member.id,
            description: `<@${member.id}> left the server! (Total Members: **${member.guild.memberCount}**)`,
            type: LogType.MEMBER_LEAVE,
            date_unix: Date.now(),
         },
         true,
      );
   },
};
