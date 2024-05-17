import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import parsePlaceholders from '@/util/parsePlaceholder';
import { StarboardBoardData } from '@prisma/client';
import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   GuildBasedChannel,
   MessageReaction,
   PartialMessageReaction,
} from 'discord.js';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
export default async function updateStarredMessage(
   auxdibot: Auxdibot,
   board: StarboardBoardData,
   messageReaction: MessageReaction | PartialMessageReaction,
   count: number,
) {
   const guild = await messageReaction.message.guild.fetch().catch(() => undefined);
   if (!guild) return;
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const starred = server.starred_messages.find((i) => i.starred_message_id == messageReaction.message.id);
   if (!starred) return;
   const starboard_channel: GuildBasedChannel | undefined = await guild.channels
      .fetch(board.channelID, { limit: 1 })
      .catch(() => undefined);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;
   const message = await starboard_channel.messages.fetch(starred.starboard_message_id).catch(() => undefined);

   const starLevelsSorted = board.star_levels.sort((a, b) => b.stars - a.stars);
   const starLevel = starLevelsSorted.find((i) => count >= board.count * i.stars) ??
      starLevelsSorted[0] ?? { ...defaultStarLevels[0], message_reaction: board.reaction };

   if (message) {
      try {
         const jsonEmbed = structuredClone(DEFAULT_STARBOARD_MESSAGE_EMBED);
         jsonEmbed.color = starLevel.color;
         const embed = JSON.parse(
            await parsePlaceholders(
               auxdibot,
               JSON.stringify(jsonEmbed),
               messageReaction.message.guild,
               messageReaction.message.author,
               undefined,
               messageReaction.message,
            ),
         );
         const reference = await messageReaction.message.fetchReference().catch(() => undefined);
         const quoteEmbed = reference
            ? new EmbedBuilder()
                 .setTitle('Reply to')
                 .setAuthor({ name: reference.author.tag, iconURL: reference.author.avatarURL({ size: 128 }) })
                 .setDescription(reference.cleanContent)
            : null;
         const attachmentsComponent = new ActionRowBuilder<ButtonBuilder>();
         messageReaction.message.attachments.forEach((i) =>
            attachmentsComponent.components.length < 5
               ? attachmentsComponent.addComponents(
                    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(i.name).setEmoji('💬').setURL(i.url),
                 )
               : undefined,
         );
         const reaction = auxdibot.emojis.cache.get(starLevel.message_reaction) ?? starLevel.message_reaction;
         await message.edit({
            content: `**${count} ${reaction ?? ''}** | ${messageReaction.message.channel}`,
            embeds: [quoteEmbed, embed].filter((i) => i),
            components: [
               new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(
                     new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('Original Message')
                        .setEmoji('💬')
                        .setURL(
                           `https://discord.com/channels/${messageReaction.message.guildId}/${messageReaction.message.channelId}/${messageReaction.message.id}`,
                        ),
                  )
                  .toJSON(),
               attachmentsComponent.components.length > 0 ? attachmentsComponent : null,
            ].filter((i) => i),
            files: Array.from(messageReaction.message.attachments.values()),
         });
      } catch (x) {
         console.error(x);
      }
   }
}
