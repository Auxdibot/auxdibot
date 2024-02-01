import { Auxdibot } from '@/interfaces/Auxdibot';
import { ReactionRoleType } from '@prisma/client';
import { Channel, EmbedBuilder, Guild, APIEmbed, Message } from 'discord.js';
import { parseReactionsAndRoles } from './parseReactionsAndRoles';
import applyReactionRoles from './applyReactionRoles';

export default async function addReactionRole(
   auxdibot: Auxdibot,
   guild: Guild,
   channel: Channel,
   title: string,
   reactions: {
      emoji: string;
      roleID: string;
   }[],
   embed?: APIEmbed,
   content?: string,
   type?: ReactionRoleType,
) {
   const reactionsAndRoles = await parseReactionsAndRoles(auxdibot, guild, reactions);
   if (reactionsAndRoles.length == 0) throw new Error('invalid reactions and roles');
   if (!channel || !channel.isTextBased()) throw new Error('invalid channel');
   let message = null;
   return channel
      .send({
         embeds: embed
            ? [embed]
            : [
                 new EmbedBuilder()
                    .setColor(auxdibot.colors.reaction_role)
                    .setTitle(title)
                    .setDescription(
                       reactionsAndRoles.reduce(
                          (accumulator: string, item, index) =>
                             `${accumulator}\r\n\r\n> **${index + 1})** ${
                                auxdibot.emojis.cache.get(item.emoji) || item.emoji
                             } - ${item.role}`,
                          '',
                       ),
                    )
                    .toJSON(),
              ],
         content: content || '',
      })
      .then(async (msg: Message) => {
         message = msg;
         applyReactionRoles(msg, reactionsAndRoles, type || ReactionRoleType.DEFAULT);
         return auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               data: {
                  reaction_roles: {
                     push: {
                        messageID: msg.id,
                        channelID: msg.channel.id,
                        type,
                        reactions: reactionsAndRoles.map((i) => ({ role: i.role.id, emoji: i.emoji })),
                     },
                  },
               },
            })
            .then(() => true);
      })
      .catch((x) => {
         if (message) message.delete().catch(() => undefined);
         if (x.code == '50013') throw new Error('Auxdibot does not have permission to send messages!');
         throw new Error('failed to send embed');
      });
}
