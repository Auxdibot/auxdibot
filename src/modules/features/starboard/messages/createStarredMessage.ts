import Limits from '@/constants/database/Limits';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import parsePlaceholders from '@/util/parsePlaceholder';
import { testLimit } from '@/util/testLimit';
import { StarboardBoardData } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageReaction } from 'discord.js';

export default async function createStarredMessage(
   auxdibot: Auxdibot,
   board: StarboardBoardData,
   messageReaction: MessageReaction,
   count: number,
) {
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const starboard_channel = messageReaction.message.guild.channels.cache.get(board.channelID);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;
   const starLevelsSorted = board.star_levels.sort((a, b) => b.stars - a.stars);
   const starLevel = starLevelsSorted.find((i) => count >= board.count * i.stars) ??
      starLevelsSorted[0] ?? { ...defaultStarLevels[0], message_reaction: board.reaction };

   try {
      if (
         server.starred_messages.find(
            (i) => i.starred_message_id == messageReaction.message.id && i.board == board.board_name,
         )
      )
         return;
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
                 new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(i.name).setEmoji('📁').setURL(i.url),
              )
            : undefined,
      );

      testLimit(server.starred_messages, Limits.ACTIVE_STARRED_MESSAGES_DEFAULT_LIMIT, true);

      const components = [
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
      ];

      if (attachmentsComponent.components.length > 0) components.push(attachmentsComponent.toJSON());
      const reaction = auxdibot.emojis.cache.get(starLevel.message_reaction) ?? starLevel.message_reaction;
      const message = await starboard_channel.send({
         content: `**${count} ${reaction ?? ''}** | ${messageReaction.message.channel}`,
         embeds: [quoteEmbed, embed].filter((i) => i),
         ...(components?.length > 0 ? { components } : {}),
         files: Array.from(messageReaction.message.attachments.values()),
      });

      const starred_message = {
         starboard_message_id: message.id,
         starred_message_id: messageReaction.message.id,
         board: board.board_name,
      };
      await auxdibot.database.servers
         .update({
            where: { serverID: messageReaction.message.guild.id },
            data: { starred_messages: { push: starred_message }, total_starred_messages: { increment: 1 } },
         })
         .catch(() => message.delete());
   } catch (x) {
      console.error(x);
   }
}
