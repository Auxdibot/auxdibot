import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { APIEmbed, GuildMember, GuildTextBasedChannel, Message } from 'discord.js';
import parsePlaceholders from './parsePlaceholder';

type LevelMessageContext = {
   message?: Message;
   textChannel?: GuildTextBasedChannel;
};
export async function sendLevelMessage(
   auxdibot: Auxdibot,
   member: GuildMember,
   level: number,
   newLevel: number,
   context: LevelMessageContext,
) {
   const server = await findOrCreateServer(auxdibot, member.guild.id);
   try {
      if (server.level_embed) {
         const embed =
            server.level_message?.embed &&
            JSON.parse(
               await parsePlaceholders(auxdibot, JSON.stringify(server.level_message?.embed), {
                  guild: member.guild,
                  member: member,
                  levelup: { from: level, to: newLevel },
               }),
            );
         if (server.level_channel) {
            const channel = member.guild.channels.cache.get(server.level_channel);
            if (channel && channel.isTextBased())
               await channel.send({
                  content: server.level_message?.content
                     ? await parsePlaceholders(auxdibot, server.level_message.content, {
                          guild: member.guild,
                          member: member,
                          levelup: { from: level, to: newLevel },
                       })
                     : '',
                  embeds: embed && [embed as APIEmbed],
               });
         } else {
            if (context.message)
               await context.message.reply({
                  embeds: embed && [embed as APIEmbed],
                  content:
                     server.level_message?.content &&
                     (await parsePlaceholders(auxdibot, server.level_message.content, {
                        guild: member.guild,
                        member: member,
                        levelup: { from: level, to: newLevel },
                     })),
               });
            else if (context.textChannel) {
               await context.textChannel.send({
                  embeds: embed && [embed as APIEmbed],
                  content: server.level_message?.content
                     ? await parsePlaceholders(auxdibot, server.level_message.content, {
                          guild: member.guild,
                          member: member,
                          levelup: { from: level, to: newLevel },
                       })
                     : '',
               });
            }
         }
      }
   } catch (x) {}
   try {
      const reward = server.level_rewards.find((reward) => reward.level == newLevel);
      if (reward) {
         const role = await member.guild.roles.fetch(reward.roleID);
         if (role) await member.roles.add(role);
      }
   } catch (x) {}
}
