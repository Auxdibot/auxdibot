import { Auxdibot } from '@/interfaces/Auxdibot';
import { ReactionRoleType } from '@prisma/client';
import {
   Channel,
   EmbedBuilder,
   Guild,
   APIEmbed,
   ActionRowBuilder,
   ButtonBuilder,
   Role,
   APIRole,
   ButtonStyle,
   StringSelectMenuBuilder,
   StringSelectMenuOptionBuilder,
   Message,
} from 'discord.js';
import emojiRegex from 'emoji-regex';
type ReactionsAndRolesBuilder = { role: Role | APIRole; emoji: string };
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
   const reactionsAndRoles = await reactions.reduce(
      async (acc: Promise<ReactionsAndRolesBuilder[]> | ReactionsAndRolesBuilder[], item) => {
         let arr = await acc;
         const role = await guild.roles.fetch((item.roleID?.match(/\d+/) || [])[0] || '').catch(() => undefined);
         const serverEmoji = auxdibot.emojis.cache.get((item.emoji?.match(/\d+/) || [])[0]);
         const emoji = serverEmoji || (emojiRegex().test(item.emoji) ? item.emoji : undefined);
         if (role && emoji)
            arr.length == 0
               ? (arr = [{ role: role, emoji: emoji.valueOf() || emoji.toString() }])
               : arr.push({ role: role, emoji: emoji.valueOf() || emoji.toString() });
         return arr;
      },
      [],
   );
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
         const row = new ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>();
         switch (type) {
            case ReactionRoleType.DEFAULT:
            case ReactionRoleType.STICKY_SELECT_ONE:
            case ReactionRoleType.STICKY:
            case ReactionRoleType.SELECT_ONE:
               reactionsAndRoles.forEach((i) => msg.react(i.emoji));
               break;
            case ReactionRoleType.BUTTON:
            case ReactionRoleType.BUTTON_SELECT_ONE:
               row.addComponents(
                  ...reactionsAndRoles.map((i) =>
                     new ButtonBuilder()
                        .setCustomId(`rr-${i.role.id}`)
                        .setEmoji(i.emoji)
                        .setLabel(i.role.name)
                        .setStyle(ButtonStyle.Secondary),
                  ),
               );
               break;
            case ReactionRoleType.SELECT_MENU:
            case ReactionRoleType.SELECT_ONE_MENU:
               row.addComponents(
                  new StringSelectMenuBuilder()
                     .setCustomId('rr')
                     .setMinValues(1)
                     .setMaxValues(type == 'SELECT_ONE_MENU' ? 1 : reactionsAndRoles.length)
                     .setPlaceholder('Select a role.')
                     .setDisabled(false)
                     .addOptions(
                        ...reactionsAndRoles.map((i) =>
                           new StringSelectMenuOptionBuilder()
                              .setEmoji(i.emoji)
                              .setLabel(i.role.name)
                              .setValue(i.role.id)
                              .setDescription(`You will receive the ${i.role.name} role.`),
                        ),
                     ),
               );
         }
         if (row.components.length > 0) {
            await msg.edit({
               components: [row.toJSON()],
            });
         }
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
      .catch(() => {
         throw new Error('failed to send embed');
      });
}
