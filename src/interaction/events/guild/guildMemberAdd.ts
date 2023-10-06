import { APIEmbed, GuildMember } from 'discord.js';
import parsePlaceholders from '@/util/parsePlaceholder';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import memberJoin from '@/modules/members/memberJoin';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

export default async function guildMemberAdd(auxdibot: Auxdibot, member: GuildMember) {
   if (!member) return;
   const server = await findOrCreateServer(auxdibot, member.guild.id);
   if (server.join_leave_channel && server.disabled_modules.indexOf('Greetings') == -1) {
      member.guild.channels.fetch(server.join_leave_channel).then(async (channel) => {
         if (channel && channel.isTextBased()) {
            if (server.join_embed || server.join_text) {
               await channel
                  .send({
                     content: `${server.join_text || ''}`,
                     ...(Object.entries(server.join_embed || {}).length != 0
                        ? {
                             embeds: [
                                JSON.parse(
                                   await parsePlaceholders(
                                      auxdibot,
                                      JSON.stringify(server.join_embed),
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
   if ((server.join_dm_embed || server.join_dm_text) && server.disabled_modules.indexOf('Greetings') == -1) {
      await member
         .send({
            content: `${server.join_dm_text || ''}`,
            ...(Object.entries(server.join_dm_embed || {}).length != 0
               ? {
                    embeds: [
                       JSON.parse(
                          await parsePlaceholders(auxdibot, JSON.stringify(server.join_dm_embed), member.guild, member),
                       ) as APIEmbed,
                    ],
                 }
               : {}),
         })
         .catch(() => undefined);
   }

   if (server.disabled_modules.indexOf('Roles') == -1) {
      if (server.join_roles.length > 0)
         server.join_roles.forEach((role: string) => member.roles.add(role).catch(() => undefined));
      memberJoin(auxdibot, member.guild.id, member);
   }

   await handleLog(
      auxdibot,
      member.guild,
      {
         userID: member.id,
         description: `<@${member.id}> joined the server! (Total Members: **${member.guild.memberCount}**)`,
         type: LogAction.MEMBER_JOIN,
         date_unix: Date.now(),
      },
      [],
      true,
   );
}
