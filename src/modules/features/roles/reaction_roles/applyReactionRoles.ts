import { ReactionsAndRolesBuilder } from '@/interfaces/reactions/ReactionsAndRolesBuilder';
import { ReactionRoleType } from '@prisma/client';
import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   Channel,
   StringSelectMenuBuilder,
   StringSelectMenuOptionBuilder,
} from 'discord.js';

export default async function applyReactionRoles(
   msgID: string,
   channel: Channel,
   reactionsAndRoles: ReactionsAndRolesBuilder[],
   type: ReactionRoleType,
) {
   if (!channel.isTextBased()) return;
   const message = msgID ? await channel.messages.fetch(msgID) : null;
   if (!message) return;
   let rows: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [
      new ActionRowBuilder<StringSelectMenuBuilder>(),
   ];
   switch (type) {
      case ReactionRoleType.DEFAULT:
      case ReactionRoleType.STICKY_SELECT_ONE:
      case ReactionRoleType.STICKY:
      case ReactionRoleType.SELECT_ONE:
         reactionsAndRoles.forEach((i) => message.react(i.emoji).catch(() => undefined));
         break;
      case ReactionRoleType.BUTTON:
      case ReactionRoleType.BUTTON_SELECT_ONE:
         rows = Array.from({ length: Math.ceil(reactionsAndRoles.length / 5) }, (v, i) =>
            reactionsAndRoles.slice(i * 5, i * 5 + 5),
         ).map((a) =>
            new ActionRowBuilder<ButtonBuilder>().addComponents(
               a.map((i) =>
                  new ButtonBuilder()
                     .setCustomId(`rr-${i.role.id}`)
                     .setEmoji(i.emoji)
                     .setLabel(i.role.name)
                     .setStyle(ButtonStyle.Secondary),
               ),
            ),
         );
         break;
      case ReactionRoleType.SELECT_MENU:
      case ReactionRoleType.SELECT_ONE_MENU:
         rows[0].addComponents(
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
   if (rows.find((i) => i.components.length > 0)) {
      await message
         .edit({
            components: rows.map((i) => i.toJSON()),
         })
         .catch(() => undefined);
   }
}
