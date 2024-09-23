import { APIEmbed, GuildMember, PartialGuildMember } from 'discord.js';
import parsePlaceholders from '@/util/parsePlaceholder';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/Auxdibot';
import memberLeave from '@/modules/members/memberLeave';

import { LogAction } from '@prisma/client';

export default async function guildMemberRemove(auxdibot: Auxdibot, member: GuildMember | PartialGuildMember) {
   if (!member) return;
   const server = await findOrCreateServer(auxdibot, member.guild.id);
   if (server.join_leave_channel && server.disabled_modules.indexOf('Greetings') == -1) {
      member.guild.channels
         .fetch(server.join_leave_channel)
         .then(async (channel) => {
            if (channel && channel.isTextBased()) {
               if (server.leave_text || server.leave_embed) {
                  channel
                     .send({
                        content: `${server.leave_text || ''}`,
                        ...(Object.entries(server.leave_embed || {}).length != 0
                           ? {
                                embeds: [
                                   JSON.parse(
                                      await parsePlaceholders(auxdibot, JSON.stringify(server.leave_embed), {
                                         guild: member.guild,
                                         member,
                                      }),
                                   ) as APIEmbed,
                                ],
                             }
                           : {}),
                     })
                     .catch(() => undefined);
               }
            }
         })
         .catch(() => undefined);
   }
   memberLeave(auxdibot, member.guild.id, member);
   await auxdibot.log(
      member.guild,
      {
         userID: member.id,
         description: `${member.user.username} left the server! (Total Members: **${member.guild.memberCount}**)`,
         type: LogAction.MEMBER_LEAVE,
         date: new Date(),
      },
      { user_avatar: true },
   );
}
