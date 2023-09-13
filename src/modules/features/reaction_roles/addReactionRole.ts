import { Auxdibot } from '@/interfaces/Auxdibot';
import { Reaction } from '@prisma/client';
import { Channel, EmbedBuilder, Guild, APIEmbed } from 'discord.js';
import emojiRegex from 'emoji-regex';

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
) {
   const reactionsAndRoles = await reactions.reduce(async (acc: Promise<Reaction[]> | Reaction[], item) => {
      let arr = await acc;
      const role = await guild.roles.fetch((item.roleID.match(/\d+/) || [])[0] || '').catch(() => undefined);
      const emoji = emojiRegex().test(item.emoji) ? item.emoji : undefined;
      if (role && emoji) arr.length == 0 ? (arr = [{ role: role.id, emoji }]) : arr.push({ role: role.id, emoji });
      return arr;
   }, []);
   if (reactionsAndRoles.length == 0) throw new Error('invalid reactions and roles');
   if (!channel || !channel.isTextBased()) throw new Error('invalid channel');
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
                             `${accumulator}\r\n\r\n> **${index + 1})** ${item.emoji} - <@&${item.role}>`,
                          '',
                       ),
                    )
                    .toJSON(),
              ],
         content: content || '',
      })
      .then((msg) => {
         reactionsAndRoles.forEach((i) => msg.react(i.emoji));
         return auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               data: {
                  reaction_roles: {
                     push: {
                        messageID: msg.id,
                        channelID: msg.channel.id,
                        reactions: reactionsAndRoles,
                     },
                  },
               },
            })
            .then(() => true);
      })
      .catch(() => {
         throw new Error('failed to send embed');
      });
}
